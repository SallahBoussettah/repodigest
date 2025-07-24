import fs from 'fs/promises';
import path from 'path';
import ignore from 'ignore';
import type { Ignore } from 'ignore';
import { DEFAULT_IGNORE_PATTERNS } from './constants.js';

/**
 * Enhanced ignore helper with multiple ignore file support
 */
export class IgnoreHelper {
  private ignoreFilter: Ignore;
  private basePath: string;

  constructor(basePath: string) {
    this.basePath = basePath;
    this.ignoreFilter = ignore().add(DEFAULT_IGNORE_PATTERNS);
  }

  /**
   * Initialize ignore patterns from various ignore files
   */
  async initialize(includeGitignored: boolean = false): Promise<void> {
    if (includeGitignored) {
      // Only use default patterns, skip all ignore files
      return;
    }

    const ignoreFiles = [
      '.gitignore',
      '.npmignore',
      '.dockerignore',
      '.eslintignore',
      '.prettierignore',
      '.repodigestignore' // Custom ignore file
    ];

    for (const ignoreFile of ignoreFiles) {
      await this.loadIgnoreFile(ignoreFile);
    }
  }

  /**
   * Load patterns from a specific ignore file
   */
  private async loadIgnoreFile(filename: string): Promise<void> {
    const filePath = path.join(this.basePath, filename);
    
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#'));
      
      if (lines.length > 0) {
        this.ignoreFilter.add(lines);
      }
    } catch {
      // Ignore file doesn't exist, which is fine
    }
  }

  /**
   * Check if a path should be ignored
   */
  shouldIgnore(relativePath: string): boolean {
    if (!relativePath) return false;
    
    // Normalize path separators
    const normalizedPath = relativePath.replace(/\\/g, '/');
    
    return this.ignoreFilter.ignores(normalizedPath);
  }

  /**
   * Add custom ignore patterns
   */
  addPatterns(patterns: string[]): void {
    this.ignoreFilter.add(patterns);
  }

  /**
   * Create a child ignore helper for subdirectories
   */
  async createChild(subdirPath: string): Promise<IgnoreHelper> {
    const childHelper = new IgnoreHelper(subdirPath);
    
    // Copy parent patterns - simplified approach
    childHelper.ignoreFilter = ignore().add(DEFAULT_IGNORE_PATTERNS);
    
    // Load local ignore files in subdirectory
    await childHelper.loadIgnoreFile('.gitignore');
    
    return childHelper;
  }

  /**
   * Get all ignore patterns for debugging
   */
  getPatterns(): string[] {
    // This is a bit hacky since ignore doesn't expose patterns directly
    // We'll return the default patterns as a reference
    return DEFAULT_IGNORE_PATTERNS;
  }
}

/**
 * Create an ignore helper for a directory
 */
export async function createIgnoreHelper(basePath: string, includeGitignored: boolean = false): Promise<IgnoreHelper> {
  const helper = new IgnoreHelper(basePath);
  await helper.initialize(includeGitignored);
  return helper;
}