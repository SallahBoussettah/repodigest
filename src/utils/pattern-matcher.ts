import ignore from 'ignore';
import fastGlob from 'fast-glob';
import type { Ignore } from 'ignore';

/**
 * Enhanced pattern matcher with better glob support
 */
export class PatternMatcher {
  private includeIgnore: Ignore | null = null;
  private excludeIgnore: Ignore | null = null;
  private includePatterns: string[] = [];
  private excludePatterns: string[] = [];

  constructor(includePatterns?: string[], excludePatterns?: string[]) {
    if (includePatterns && includePatterns.length > 0) {
      this.includePatterns = includePatterns;
      this.includeIgnore = ignore().add(includePatterns);
    }
    
    if (excludePatterns && excludePatterns.length > 0) {
      this.excludePatterns = excludePatterns;
      this.excludeIgnore = ignore().add(excludePatterns);
    }
  }

  /**
   * Check if a path should be included based on patterns
   */
  shouldInclude(relativePath: string, isFile: boolean = true): boolean {
    // First check exclude patterns
    if (this.excludeIgnore && this.excludeIgnore.ignores(relativePath)) {
      return false;
    }

    // If no include patterns, include everything (that's not excluded)
    if (!this.includeIgnore) {
      return true;
    }

    // For include patterns, we need to check if the path matches
    if (isFile) {
      return !this.includeIgnore.ignores(relativePath);
    } else {
      // For directories, check if any include pattern could match files within
      return this.couldContainMatchingFiles(relativePath);
    }
  }

  /**
   * Check if a directory could contain files matching include patterns
   */
  private couldContainMatchingFiles(dirPath: string): boolean {
    if (!this.includePatterns.length) return true;

    const normalizedDir = dirPath.replace(/\\/g, '/');
    
    return this.includePatterns.some(pattern => {
      // Remove leading ./ if present
      const cleanPattern = pattern.replace(/^\.\//, '');
      
      // If pattern starts with the directory path, it could match
      if (cleanPattern.startsWith(normalizedDir)) {
        return true;
      }
      
      // If pattern has ** and directory is in the path
      if (pattern.includes('**')) {
        const beforeGlob = pattern.split('**')[0];
        if (!beforeGlob || normalizedDir.startsWith(beforeGlob.replace(/\/$/, ''))) {
          return true;
        }
      }
      
      // If pattern is just a file extension or simple glob
      if (pattern.startsWith('**') || pattern.startsWith('*')) {
        return true;
      }
      
      return false;
    });
  }

  /**
   * Get matching files using fast-glob
   */
  async getMatchingFiles(basePath: string): Promise<string[]> {
    if (!this.includePatterns.length) {
      return [];
    }

    try {
      const files = await fastGlob(this.includePatterns, {
        cwd: basePath,
        ignore: this.excludePatterns,
        dot: false,
        onlyFiles: true,
        absolute: false
      });
      
      return files.map(f => f.replace(/\\/g, '/'));
    } catch {
      return [];
    }
  }

  /**
   * Check if any include patterns are specified
   */
  hasIncludePatterns(): boolean {
    return this.includePatterns.length > 0;
  }

  /**
   * Check if any exclude patterns are specified
   */
  hasExcludePatterns(): boolean {
    return this.excludePatterns.length > 0;
  }

  /**
   * Get all patterns for debugging
   */
  getPatterns(): { include: string[]; exclude: string[] } {
    return {
      include: this.includePatterns,
      exclude: this.excludePatterns
    };
  }
}

/**
 * Create a pattern matcher instance
 */
export function createPatternMatcher(includePatterns?: string[], excludePatterns?: string[]): PatternMatcher {
  return new PatternMatcher(includePatterns, excludePatterns);
}