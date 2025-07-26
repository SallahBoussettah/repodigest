import { get_encoding } from 'tiktoken';
import path from 'path';
import { OUTPUT_TEMPLATES } from '../utils/constants.js';
import type { FileNode, DigestionQuery, DigestStats, DigestOutput } from '../types.js';

/**
 * Enhanced output generator with multiple format support
 */
export class OutputGenerator {
  private query: DigestionQuery;
  private stats: DigestStats;

  constructor(query: DigestionQuery, stats: DigestStats) {
    this.query = query;
    this.stats = stats;
  }

  /**
   * Generate output in the specified format
   */
  generate(rootNode: FileNode, existingOutput?: DigestOutput): DigestOutput {
    const { format } = this.query.options;
    
    const output: DigestOutput = existingOutput || {
      content: '',
      stats: this.stats,
      metadata: {
        source: this.query.source,
        branch: this.query.options.branch,
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        format
      }
    };
    
    let content: string;
    switch (format) {
      case 'json':
        content = this.generateJsonOutput(rootNode, output);
        break;
      case 'markdown':
        content = this.generateMarkdownOutput(rootNode, output);
        break;
      default:
        content = this.generateTextOutput(rootNode, output);
    }

    // Calculate tokens for text content
    this.calculateTokens(content);

    output.content = content;
    return output;
  }

  /**
   * Generate text format output (similar to original)
   */
  private generateTextOutput(rootNode: FileNode, output?: DigestOutput): string {
    const sections: string[] = [];

    // Header
    sections.push(this.generateHeader());
    
    // Summary
    sections.push(this.generateSummary());
    
    // AI Insights (if available)
    if (output?.aiInsights) {
      sections.push(this.generateAIInsights(output));
    }
    
    // Directory structure
    sections.push(this.generateDirectoryTree(rootNode));
    
    // File contents
    sections.push(this.generateFileContents(rootNode));

    return sections.join('\n\n');
  }

  /**
   * Generate JSON format output
   */
  private generateJsonOutput(rootNode: FileNode, digestOutput?: DigestOutput): string {
    const output = {
      metadata: {
        source: this.query.source,
        branch: this.query.options.branch,
        timestamp: new Date().toISOString(),
        format: 'json'
      },
      stats: this.stats,
      structure: this.nodeToJson(rootNode),
      files: this.extractFileContents(rootNode),
      ...(digestOutput?.aiInsights && { aiInsights: digestOutput.aiInsights }),
      ...(digestOutput?.securityAnalysis && { securityAnalysis: digestOutput.securityAnalysis })
    };

    return JSON.stringify(output, null, 2);
  }

  /**
   * Generate Markdown format output
   */
  private generateMarkdownOutput(rootNode: FileNode, digestOutput?: DigestOutput): string {
    const sections: string[] = [];

    // Title
    sections.push(`# Repository Digest: ${path.basename(this.query.source)}`);
    sections.push('');

    // Metadata
    sections.push('## Metadata');
    sections.push(`- **Source**: ${this.query.source}`);
    if (this.query.options.branch) {
      sections.push(`- **Branch**: ${this.query.options.branch}`);
    }
    sections.push(`- **Generated**: ${new Date().toISOString()}`);
    sections.push('');

    // AI Insights
    if (digestOutput?.aiInsights) {
      sections.push('## AI Analysis');
      if (digestOutput.aiInsights.overview.summary) {
        sections.push('### Overview');
        sections.push(digestOutput.aiInsights.overview.summary);
        sections.push('');
      }

      if (digestOutput.aiInsights.overview.mainTechnologies?.length > 0) {
        sections.push('### Technologies');
        digestOutput.aiInsights.overview.mainTechnologies.forEach((tech: string) => {
          sections.push(`- ${tech}`);
        });
        sections.push('');
      }

      if (digestOutput.aiInsights.recommendations?.length > 0) {
        sections.push('### Recommendations');
        digestOutput.aiInsights.recommendations.slice(0, 5).forEach((rec: any) => {
          sections.push(`- **${rec.title || rec.description}** (${rec.priority || 'medium'} priority)`);
          if (rec.description && rec.title) {
            sections.push(`  ${rec.description}`);
          }
        });
        sections.push('');
      }
    }

    // Statistics
    sections.push('## Statistics');
    sections.push(`- **Files**: ${this.stats.totalFiles.toLocaleString()}`);
    sections.push(`- **Directories**: ${this.stats.totalDirectories.toLocaleString()}`);
    sections.push(`- **Total Size**: ${this.formatBytes(this.stats.totalSize)}`);
    sections.push(`- **Text Size**: ${this.formatBytes(this.stats.textSize)}`);
    sections.push(`- **Binary Files**: ${this.stats.binaryFiles.toLocaleString()}`);
    sections.push(`- **Estimated Tokens**: ${this.stats.estimatedTokens.toLocaleString()}`);
    sections.push('');

    // Language breakdown
    if (Object.keys(this.stats.languageBreakdown).length > 0) {
      sections.push('## Language Breakdown');
      Object.entries(this.stats.languageBreakdown)
        .sort(([,a], [,b]) => b - a)
        .forEach(([lang, count]) => {
          sections.push(`- **${lang}**: ${count} files`);
        });
      sections.push('');
    }

    // Directory structure
    sections.push('## Directory Structure');
    sections.push('```');
    sections.push(this.generateTreeString(rootNode));
    sections.push('```');
    sections.push('');

    // File contents
    sections.push('## File Contents');
    this.addFileContentsMarkdown(rootNode, sections);

    return sections.join('\n');
  }

  /**
   * Generate header section
   */
  private generateHeader(): string {
    const repoName = path.basename(this.query.source);
    return [
      `Repository Digest: ${repoName}`,
      OUTPUT_TEMPLATES.SEPARATOR,
      'This digest contains a comprehensive analysis of the repository structure and contents.',
      'Generated by RepoDigest - Advanced codebase analysis tool for LLMs.',
      ''
    ].join('\n');
  }

  /**
   * Generate summary section
   */
  private generateSummary(): string {
    const lines = [
      'SUMMARY',
      OUTPUT_TEMPLATES.SECTION_SEPARATOR,
      `Repository: ${path.basename(this.query.source)}`,
      `Source: ${this.query.source}`
    ];

    if (this.query.options.branch) {
      lines.push(`Branch: ${this.query.options.branch}`);
    }

    lines.push(
      `Files Analyzed: ${this.stats.totalFiles.toLocaleString()}`,
      `Directories: ${this.stats.totalDirectories.toLocaleString()}`,
      `Total Size: ${this.formatBytes(this.stats.totalSize)}`,
      `Text Content: ${this.formatBytes(this.stats.textSize)}`,
      `Binary Files: ${this.stats.binaryFiles.toLocaleString()}`,
      `Processing Time: ${this.formatTime(this.stats.processingTime)}`,
      `Estimated Tokens: ~${this.stats.estimatedTokens.toLocaleString()}`
    );

    // Add language breakdown
    if (Object.keys(this.stats.languageBreakdown).length > 0) {
      lines.push('');
      lines.push('Language Breakdown:');
      Object.entries(this.stats.languageBreakdown)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .forEach(([lang, count]) => {
          lines.push(`  ${lang}: ${count} files`);
        });
    }

    return lines.join('\n');
  }

  /**
   * Generate AI insights section
   */
  private generateAIInsights(output: DigestOutput): string {
    if (!output.aiInsights) return '';

    const lines = [
      '',
      'AI INSIGHTS',
      OUTPUT_TEMPLATES.SECTION_SEPARATOR
    ];

    if (output.aiInsights.overview.summary) {
      lines.push('Repository Overview:');
      lines.push(output.aiInsights.overview.summary);
      lines.push('');
    }

    if (output.aiInsights.overview.mainTechnologies?.length > 0) {
      lines.push('Main Technologies:');
      output.aiInsights.overview.mainTechnologies.forEach((tech: string) => {
        lines.push(`  • ${tech}`);
      });
      lines.push('');
    }

    if (output.aiInsights.overview.keyInsights?.length > 0) {
      lines.push('Key Insights:');
      output.aiInsights.overview.keyInsights.forEach((insight: string) => {
        lines.push(`  • ${insight}`);
      });
      lines.push('');
    }

    if (output.aiInsights.recommendations?.length > 0) {
      lines.push('AI Recommendations:');
      output.aiInsights.recommendations.slice(0, 5).forEach((rec: any) => {
        lines.push(`  • [${rec.priority?.toUpperCase() || 'MEDIUM'}] ${rec.title || rec.description}`);
        if (rec.description && rec.title) {
          lines.push(`    ${rec.description}`);
        }
      });
      lines.push('');
    }

    lines.push(`Files Analyzed by AI: ${output.aiInsights.fileAnalyses}`);
    
    return lines.join('\n');
  }

  /**
   * Generate directory tree
   */
  private generateDirectoryTree(rootNode: FileNode): string {
    return [
      'DIRECTORY STRUCTURE',
      OUTPUT_TEMPLATES.SECTION_SEPARATOR,
      this.generateTreeString(rootNode)
    ].join('\n');
  }

  /**
   * Generate tree string representation
   */
  private generateTreeString(node: FileNode, prefix = ''): string {
    const isRoot = !prefix;
    let result = '';

    if (isRoot) {
      result = `${node.name}${node.type === 'directory' ? '/' : ''}\n`;
    } else {
      const connector = prefix.slice(0, -4) + (prefix.endsWith('    ') ? '└── ' : '├── ');
      let suffix = '';
      
      if (node.type === 'directory') {
        suffix = '/';
      } else if (node.content === '[binary]') {
        suffix = ' [binary]';
      } else if (node.content === '[unreadable]') {
        suffix = ' [unreadable]';
      } else if (node.language) {
        suffix = ` [${node.language}]`;
      }
      
      result = `${connector}${node.name}${suffix}\n`;
    }

    if (node.type === 'directory' && node.children) {
      node.children.forEach((child, index) => {
        const isLast = index === node.children!.length - 1;
        const newPrefix = prefix + (isLast ? '    ' : '│   ');
        result += this.generateTreeString(child, newPrefix);
      });
    }

    return result;
  }

  /**
   * Generate file contents section
   */
  private generateFileContents(rootNode: FileNode): string {
    const lines = [
      'FILE CONTENTS',
      OUTPUT_TEMPLATES.SECTION_SEPARATOR
    ];

    this.addFileContents(rootNode, lines);
    
    return lines.join('\n');
  }

  /**
   * Add file contents recursively
   */
  private addFileContents(node: FileNode, lines: string[]): void {
    if (node.type === 'file' && node.content && 
        !['[binary]', '[unreadable]'].includes(node.content)) {
      
      lines.push('');
      lines.push(OUTPUT_TEMPLATES.FILE_SEPARATOR);
      lines.push(`FILE: ${node.path}`);
      if (node.language) {
        lines.push(`LANGUAGE: ${node.language}`);
      }
      if (node.lineCount) {
        lines.push(`LINES: ${node.lineCount}`);
      }
      lines.push(OUTPUT_TEMPLATES.FILE_SEPARATOR);
      lines.push(node.content);
    } else if (node.type === 'directory' && node.children) {
      node.children.forEach(child => this.addFileContents(child, lines));
    }
  }

  /**
   * Add file contents for markdown format
   */
  private addFileContentsMarkdown(node: FileNode, sections: string[]): void {
    if (node.type === 'file' && node.content && 
        !['[binary]', '[unreadable]'].includes(node.content)) {
      
      sections.push(`### ${node.path}`);
      if (node.language) {
        sections.push(`**Language**: ${node.language}  `);
      }
      if (node.lineCount) {
        sections.push(`**Lines**: ${node.lineCount}  `);
      }
      sections.push('');
      
      const language = this.getMarkdownLanguage(node.language);
      sections.push(`\`\`\`${language}`);
      sections.push(node.content);
      sections.push('```');
      sections.push('');
    } else if (node.type === 'directory' && node.children) {
      node.children.forEach(child => this.addFileContentsMarkdown(child, sections));
    }
  }

  /**
   * Convert node to JSON representation
   */
  private nodeToJson(node: FileNode): any {
    const result: any = {
      name: node.name,
      path: node.path,
      type: node.type,
      size: node.size
    };

    if (node.language) result.language = node.language;
    if (node.encoding) result.encoding = node.encoding;
    if (node.lineCount) result.lineCount = node.lineCount;
    if (node.lastModified) result.lastModified = node.lastModified;

    if (node.type === 'directory' && node.children) {
      result.children = node.children.map(child => this.nodeToJson(child));
    }

    return result;
  }

  /**
   * Extract file contents for JSON format
   */
  private extractFileContents(node: FileNode): Record<string, any> {
    const files: Record<string, any> = {};

    const traverse = (n: FileNode) => {
      if (n.type === 'file' && n.content && 
          !['[binary]', '[unreadable]'].includes(n.content)) {
        files[n.path] = {
          content: n.content,
          language: n.language,
          encoding: n.encoding,
          lineCount: n.lineCount,
          size: n.size,
          lastModified: n.lastModified
        };
      } else if (n.type === 'directory' && n.children) {
        n.children.forEach(traverse);
      }
    };

    traverse(node);
    return files;
  }

  /**
   * Calculate token count for the content
   */
  private calculateTokens(content: string): void {
    try {
      const encoding = get_encoding("cl100k_base");
      this.stats.estimatedTokens = encoding.encode(content).length;
      encoding.free();
    } catch {
      // Fallback estimation: roughly 4 characters per token
      this.stats.estimatedTokens = Math.ceil(content.length / 4);
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

  /**
   * Format time for display
   */
  private formatTime(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  }

  /**
   * Get markdown language identifier
   */
  private getMarkdownLanguage(language?: string): string {
    if (!language) return '';
    
    const mappings: Record<string, string> = {
      'JavaScript': 'javascript',
      'TypeScript': 'typescript',
      'Python': 'python',
      'Java': 'java',
      'C++': 'cpp',
      'C': 'c',
      'C#': 'csharp',
      'Go': 'go',
      'Rust': 'rust',
      'PHP': 'php',
      'Ruby': 'ruby',
      'Swift': 'swift',
      'Kotlin': 'kotlin',
      'Scala': 'scala',
      'HTML': 'html',
      'CSS': 'css',
      'SQL': 'sql',
      'Shell': 'bash',
      'PowerShell': 'powershell',
      'Batch': 'batch',
      'Markdown': 'markdown',
      'JSON': 'json',
      'YAML': 'yaml',
      'XML': 'xml'
    };

    return mappings[language] || language.toLowerCase();
  }
}