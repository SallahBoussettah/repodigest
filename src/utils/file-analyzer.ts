import fs from 'fs/promises';
import path from 'path';
import mimeTypes from 'mime-types';
import { BINARY_EXTENSIONS, LANGUAGE_EXTENSIONS, SIZE_LIMITS } from './constants.js';

/**
 * Detect if a file is binary by checking its content
 */
export async function isBinaryFile(filePath: string): Promise<boolean> {
  try {
    const stats = await fs.stat(filePath);
    
    // Check by extension first (fast path)
    const ext = path.extname(filePath).toLowerCase();
    if (BINARY_EXTENSIONS.has(ext)) {
      return true;
    }
    
    // Empty files are not binary
    if (stats.size === 0) {
      return false;
    }
    
    // Check MIME type
    const mimeType = mimeTypes.lookup(filePath);
    if (mimeType && !mimeType.startsWith('text/') && !mimeType.includes('json') && !mimeType.includes('xml')) {
      return true;
    }
    
    // Read a small chunk to detect binary content
    const fileHandle = await fs.open(filePath, 'r');
    const buffer = Buffer.alloc(Math.min(stats.size, SIZE_LIMITS.CHUNK_SIZE));
    await fileHandle.read(buffer, 0, buffer.length, 0);
    await fileHandle.close();
    
    // Check for null bytes (common in binary files)
    return buffer.includes(0);
  } catch {
    return true; // Assume binary if we can't read it
  }
}

/**
 * Detect the programming language of a file
 */
export function detectLanguage(filePath: string): string | undefined {
  const ext = path.extname(filePath).toLowerCase();
  const basename = path.basename(filePath);
  
  // Check exact filename matches first
  for (const [language, extensions] of Object.entries(LANGUAGE_EXTENSIONS)) {
    if (extensions.includes(basename) || extensions.includes(ext)) {
      return language;
    }
  }
  
  // Special cases for files without extensions
  if (!ext) {
    const filename = basename.toLowerCase();
    if (filename.includes('dockerfile')) return 'Dockerfile';
    if (filename.includes('makefile')) return 'Makefile';
    if (filename.includes('rakefile')) return 'Ruby';
    if (filename.includes('gemfile')) return 'Ruby';
  }
  
  return undefined;
}

/**
 * Get file encoding (basic detection)
 */
export async function detectEncoding(filePath: string): Promise<string> {
  try {
    const fileHandle = await fs.open(filePath, 'r');
    const buffer = Buffer.alloc(Math.min(1024, (await fs.stat(filePath)).size));
    await fileHandle.read(buffer, 0, buffer.length, 0);
    await fileHandle.close();
    
    // Check for BOM
    if (buffer.length >= 3 && buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
      return 'utf-8-bom';
    }
    
    if (buffer.length >= 2) {
      if (buffer[0] === 0xFF && buffer[1] === 0xFE) return 'utf-16le';
      if (buffer[0] === 0xFE && buffer[1] === 0xFF) return 'utf-16be';
    }
    
    // Default to UTF-8 for text files
    return 'utf-8';
  } catch {
    return 'unknown';
  }
}

/**
 * Count lines in a text file
 */
export async function countLines(content: string): Promise<number> {
  if (!content) return 0;
  return content.split('\n').length;
}

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Check if file should be processed based on size limits
 */
export function shouldProcessFile(size: number, maxSize: number): boolean {
  return size <= maxSize;
}

/**
 * Get file statistics
 */
export async function getFileStats(filePath: string) {
  try {
    const stats = await fs.stat(filePath);
    return {
      size: stats.size,
      lastModified: stats.mtime,
      isDirectory: stats.isDirectory(),
      isFile: stats.isFile()
    };
  } catch {
    return null;
  }
}