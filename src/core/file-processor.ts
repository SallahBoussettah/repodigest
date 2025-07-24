import fs from 'fs/promises';
import path from 'path';
import { 
  isBinaryFile, 
  detectLanguage, 
  detectEncoding, 
  countLines, 
  shouldProcessFile,
  getFileStats 
} from '../utils/file-analyzer.js';
import { createIgnoreHelper } from '../utils/ignore-helper.js';
import { createPatternMatcher } from '../utils/pattern-matcher.js';
import { displayWarning } from '../utils/display.js';
import type { FileNode, DigestionQuery, DigestStats } from '../types.js';

/**
 * Enhanced file processor with better analysis and filtering
 */
export class FileProcessor {
  private query: DigestionQuery;
  private ignoreHelper: any;
  private patternMatcher: any;
  private stats: DigestStats;
  private startTime: number;

  constructor(query: DigestionQuery) {
    this.query = query;
    this.startTime = Date.now();
    this.stats = {
      totalFiles: 0,
      totalDirectories: 0,
      totalSize: 0,
      textSize: 0,
      binaryFiles: 0,
      languageBreakdown: {},
      largestFiles: [],
      estimatedTokens: 0,
      processingTime: 0
    };
  }

  /**
   * Process the entire directory structure
   */
  async process(): Promise<{ rootNode: FileNode; stats: DigestStats }> {
    const { repoPath, options } = this.query;
    
    // Initialize helpers
    this.ignoreHelper = await createIgnoreHelper(repoPath, options.includeGitignored);
    this.patternMatcher = createPatternMatcher(options.includePattern, options.excludePattern);
    
    // Add custom patterns if language filter is specified
    if (options.language && options.language.length > 0) {
      this.addLanguageFilters(options.language);
    }
    
    const maxSize = parseInt(options.maxSize, 10);
    const rootNode = await this.processDirectory(repoPath, '', maxSize, options.depth);
    
    if (!rootNode) {
      throw new Error('No files found or all files were filtered out');
    }
    
    // Finalize stats
    this.stats.processingTime = Date.now() - this.startTime;
    this.stats.largestFiles.sort((a, b) => b.size - a.size);
    
    return { rootNode, stats: this.stats };
  }

  /**
   * Process a directory recursively
   */
  private async processDirectory(
    fullPath: string, 
    relativePath: string, 
    maxSize: number,
    maxDepth?: number,
    currentDepth: number = 0
  ): Promise<FileNode | null> {
    
    // Check depth limit
    if (maxDepth !== undefined && currentDepth > maxDepth) {
      return null;
    }

    // Check if directory should be ignored
    if (relativePath && this.ignoreHelper.shouldIgnore(relativePath)) {
      return null;
    }

    // Check pattern matching for directories
    if (relativePath && !this.patternMatcher.shouldInclude(relativePath, false)) {
      return null;
    }

    const stats = await getFileStats(fullPath);
    if (!stats || !stats.isDirectory) {
      return null;
    }

    this.stats.totalDirectories++;

    try {
      const entries = await fs.readdir(fullPath);
      const children: FileNode[] = [];

      for (const entry of entries) {
        const entryPath = path.join(fullPath, entry);
        const entryRelativePath = relativePath ? `${relativePath}/${entry}` : entry;
        
        const entryStats = await getFileStats(entryPath);
        if (!entryStats) continue;

        if (entryStats.isDirectory) {
          const childNode = await this.processDirectory(
            entryPath, 
            entryRelativePath, 
            maxSize, 
            maxDepth, 
            currentDepth + 1
          );
          if (childNode) {
            children.push(childNode);
          }
        } else if (entryStats.isFile) {
          const fileNode = await this.processFile(entryPath, entryRelativePath, maxSize);
          if (fileNode) {
            children.push(fileNode);
          }
        }
      }

      // Sort children: directories first, then files, both alphabetically
      children.sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === 'directory' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });

      if (children.length === 0) {
        return null;
      }

      const totalSize = children.reduce((sum, child) => sum + child.size, 0);

      return {
        name: path.basename(fullPath),
        path: relativePath,
        type: 'directory',
        children,
        size: totalSize,
        lastModified: stats.lastModified
      };

    } catch (error) {
      displayWarning(`Could not read directory: ${fullPath}`);
      return null;
    }
  }

  /**
   * Process a single file
   */
  private async processFile(fullPath: string, relativePath: string, maxSize: number): Promise<FileNode | null> {
    // Check if file should be ignored
    if (this.ignoreHelper.shouldIgnore(relativePath)) {
      return null;
    }

    // Check pattern matching
    if (!this.patternMatcher.shouldInclude(relativePath, true)) {
      return null;
    }

    const stats = await getFileStats(fullPath);
    if (!stats || !stats.isFile) {
      return null;
    }

    // Check file size
    if (!shouldProcessFile(stats.size, maxSize)) {
      displayWarning(`Skipping large file: ${relativePath} (${this.formatBytes(stats.size)})`);
      return null;
    }

    this.stats.totalFiles++;
    this.stats.totalSize += stats.size;

    // Track largest files
    this.stats.largestFiles.push({ path: relativePath, size: stats.size });
    if (this.stats.largestFiles.length > 10) {
      this.stats.largestFiles.sort((a, b) => b.size - a.size);
      this.stats.largestFiles = this.stats.largestFiles.slice(0, 10);
    }

    // Detect language
    const language = detectLanguage(fullPath);
    if (language) {
      this.stats.languageBreakdown[language] = (this.stats.languageBreakdown[language] || 0) + 1;
    }

    // Check if file is binary
    const isBinary = await isBinaryFile(fullPath);
    if (isBinary) {
      this.stats.binaryFiles++;
      return {
        name: path.basename(fullPath),
        path: relativePath,
        type: 'file',
        content: '[binary]',
        size: stats.size,
        language,
        lastModified: stats.lastModified
      };
    }

    // Read text file
    try {
      const content = await fs.readFile(fullPath, 'utf-8');
      const encoding = await detectEncoding(fullPath);
      const lineCount = await countLines(content);
      
      this.stats.textSize += stats.size;

      return {
        name: path.basename(fullPath),
        path: relativePath,
        type: 'file',
        content,
        size: stats.size,
        language,
        encoding,
        lineCount,
        lastModified: stats.lastModified
      };

    } catch (error) {
      displayWarning(`Could not read file: ${relativePath}`);
      return {
        name: path.basename(fullPath),
        path: relativePath,
        type: 'file',
        content: '[unreadable]',
        size: stats.size,
        language,
        lastModified: stats.lastModified
      };
    }
  }

  /**
   * Add language-specific include patterns
   */
  private addLanguageFilters(languages: string[]): void {
    const languageExtensions: Record<string, string[]> = {
      javascript: ['**/*.js', '**/*.jsx', '**/*.mjs', '**/*.cjs'],
      typescript: ['**/*.ts', '**/*.tsx', '**/*.d.ts'],
      python: ['**/*.py', '**/*.pyw', '**/*.pyx'],
      java: ['**/*.java'],
      cpp: ['**/*.cpp', '**/*.cxx', '**/*.cc', '**/*.hpp', '**/*.hxx'],
      c: ['**/*.c', '**/*.h'],
      csharp: ['**/*.cs'],
      go: ['**/*.go'],
      rust: ['**/*.rs'],
      php: ['**/*.php'],
      ruby: ['**/*.rb'],
      swift: ['**/*.swift'],
      kotlin: ['**/*.kt'],
      scala: ['**/*.scala'],
      html: ['**/*.html', '**/*.htm'],
      css: ['**/*.css', '**/*.scss', '**/*.sass', '**/*.less'],
      sql: ['**/*.sql'],
      shell: ['**/*.sh', '**/*.bash', '**/*.zsh'],
      markdown: ['**/*.md', '**/*.markdown'],
      json: ['**/*.json'],
      yaml: ['**/*.yml', '**/*.yaml'],
      xml: ['**/*.xml']
    };

    const patterns: string[] = [];
    for (const lang of languages) {
      const extensions = languageExtensions[lang.toLowerCase()];
      if (extensions) {
        patterns.push(...extensions);
      }
    }

    if (patterns.length > 0) {
      // Add to existing include patterns
      const existingPatterns = this.query.options.includePattern || [];
      this.query.options.includePattern = [...existingPatterns, ...patterns];
      
      // Recreate pattern matcher
      this.patternMatcher = createPatternMatcher(
        this.query.options.includePattern, 
        this.query.options.excludePattern
      );
    }
  }

  /**
   * Format bytes for display
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }
}