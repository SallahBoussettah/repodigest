import path from 'path';
import { SIZE_LIMITS } from '../utils/constants.js';
import type { CliOptions, DigestionQuery } from '../types.js';

/**
 * Enhanced query parser with better validation and defaults
 */
export function parseQuery(source: string, options: CliOptions): DigestionQuery {
  // Validate and set defaults
  const parsedOptions: CliOptions = {
    ...options,
    maxSize: options.maxSize || SIZE_LIMITS.DEFAULT_MAX_SIZE.toString(),
    format: options.format || 'text',
    compress: options.compress || false,
    stats: options.stats || false,
    interactive: options.interactive || false,
    includeGitignored: options.includeGitignored || false,
    force: options.force || false
  };

  // Determine output path
  const outputPath = options.output || getDefaultOutputPath(parsedOptions.format);
  
  // Check if source is a remote URL
  const isRemote = isRemoteUrl(source);

  if (isRemote) {
    return {
      isRemote: true,
      source: normalizeUrl(source),
      repoPath: '', // Will be set to temp directory
      options: parsedOptions,
      outputPath,
    };
  } else {
    // Local path
    const resolvedPath = path.resolve(source);
    return {
      isRemote: false,
      source: resolvedPath,
      repoPath: resolvedPath,
      options: parsedOptions,
      outputPath,
    };
  }
}

/**
 * Check if a string is a remote URL
 */
function isRemoteUrl(source: string): boolean {
  try {
    const url = new URL(source);
    return ['http:', 'https:', 'git:', 'ssh:'].includes(url.protocol);
  } catch {
    return false;
  }
}

/**
 * Normalize URL for consistent handling
 */
function normalizeUrl(url: string): string {
  // Handle GitHub shortcuts
  if (url.includes('github.com') && !url.startsWith('http')) {
    return `https://${url}`;
  }
  
  // Handle git@ SSH URLs
  if (url.startsWith('git@')) {
    return url.replace('git@github.com:', 'https://github.com/');
  }
  
  return url;
}

/**
 * Get default output filename based on format
 */
function getDefaultOutputPath(format: string): string {
  const extensions = {
    text: 'txt',
    json: 'json',
    markdown: 'md'
  };
  
  const ext = extensions[format as keyof typeof extensions] || 'txt';
  return `digest.${ext}`;
}

/**
 * Validate CLI options
 */
export function validateOptions(options: CliOptions): string[] {
  const errors: string[] = [];
  
  // Validate max size
  const maxSize = parseInt(options.maxSize, 10);
  if (isNaN(maxSize) || maxSize <= 0) {
    errors.push('Max size must be a positive number');
  }
  
  // Validate format
  if (!['text', 'json', 'markdown'].includes(options.format)) {
    errors.push('Format must be one of: text, json, markdown');
  }
  
  // Validate depth if specified
  if (options.depth !== undefined) {
    const depth = parseInt(options.depth.toString(), 10);
    if (isNaN(depth) || depth < 0) {
      errors.push('Depth must be a non-negative number');
    }
  }
  
  // Validate language filters
  if (options.language && options.language.length > 0) {
    const validLanguages = [
      'javascript', 'typescript', 'python', 'java', 'cpp', 'c', 'csharp',
      'go', 'rust', 'php', 'ruby', 'swift', 'kotlin', 'scala', 'html',
      'css', 'sql', 'shell', 'markdown', 'json', 'yaml', 'xml'
    ];
    
    const invalidLanguages = options.language.filter(
      lang => !validLanguages.includes(lang.toLowerCase())
    );
    
    if (invalidLanguages.length > 0) {
      errors.push(`Invalid languages: ${invalidLanguages.join(', ')}`);
    }
  }
  
  return errors;
}