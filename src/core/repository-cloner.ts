import { simpleGit } from 'simple-git';
import fs from 'fs/promises';
import path from 'path';
import { displayProgress, displayWarning } from '../utils/display.js';

/**
 * Enhanced repository cloner with better error handling and progress
 */
export class RepositoryCloner {
  private git = simpleGit();

  /**
   * Clone a repository to a local path
   */
  async clone(url: string, localPath: string, options: {
    branch?: string;
    token?: string;
    depth?: number;
  } = {}): Promise<void> {
    const { branch, token, depth = 1 } = options;

    // Prepare clone options
    const cloneOptions = [
      '--depth', depth.toString(),
      '--single-branch',
      '--no-tags'
    ];

    if (branch) {
      cloneOptions.push('--branch', branch);
    }

    // Handle authentication for private repos
    let authenticatedUrl = url;
    if (token && url.includes('github.com')) {
      authenticatedUrl = this.addTokenToUrl(url, token);
    }

    try {
      displayProgress(`Cloning repository from ${url}`, 
        branch ? `Branch: ${branch}` : 'Default branch');

      await this.git.clone(authenticatedUrl, localPath, cloneOptions);
      
      // Clean up .git directory to save space
      await this.cleanupGitDirectory(localPath);
      
    } catch (error) {
      throw new Error(this.formatCloneError(error, url, branch));
    }
  }

  /**
   * Add GitHub token to URL for authentication
   */
  private addTokenToUrl(url: string, token: string): string {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname === 'github.com') {
        urlObj.username = token;
        urlObj.password = 'x-oauth-basic';
        return urlObj.toString();
      }
    } catch {
      // If URL parsing fails, try simple replacement
      return url.replace('https://github.com/', `https://${token}:x-oauth-basic@github.com/`);
    }
    return url;
  }

  /**
   * Clean up .git directory to save space and avoid processing git files
   */
  private async cleanupGitDirectory(repoPath: string): Promise<void> {
    const gitPath = path.join(repoPath, '.git');
    
    try {
      await fs.rm(gitPath, { recursive: true, force: true });
      displayProgress('Cleaned up .git directory');
    } catch {
      displayWarning('Could not clean up .git directory');
    }
  }

  /**
   * Format clone error with helpful message
   */
  private formatCloneError(error: any, url: string, branch?: string): string {
    const errorMessage = error?.message || error?.toString() || 'Unknown error';
    
    let message = `Failed to clone repository from ${url}`;
    
    if (branch) {
      message += ` (branch: ${branch})`;
    }
    
    // Provide specific guidance based on error type
    if (errorMessage.includes('not found') || errorMessage.includes('404')) {
      message += '\n\n💡 Possible causes:';
      message += '\n  • Repository URL is incorrect';
      message += '\n  • Repository is private (use --token for authentication)';
      message += '\n  • Branch name is incorrect';
    } else if (errorMessage.includes('authentication') || errorMessage.includes('403')) {
      message += '\n\n💡 Authentication required:';
      message += '\n  • Use --token flag with your GitHub Personal Access Token';
      message += '\n  • Ensure the token has appropriate repository permissions';
    } else if (errorMessage.includes('timeout') || errorMessage.includes('network')) {
      message += '\n\n💡 Network issue:';
      message += '\n  • Check your internet connection';
      message += '\n  • Try again in a few moments';
    }
    
    message += `\n\n🔍 Original error: ${errorMessage}`;
    
    return message;
  }

  /**
   * Validate repository URL
   */
  static validateUrl(url: string): { valid: boolean; error?: string } {
    try {
      const urlObj = new URL(url);
      
      // Check for supported protocols
      if (!['http:', 'https:', 'git:'].includes(urlObj.protocol)) {
        return { valid: false, error: 'Unsupported protocol. Use http, https, or git.' };
      }
      
      // Check for supported hosts (can be extended)
      const supportedHosts = ['github.com', 'gitlab.com', 'bitbucket.org'];
      if (!supportedHosts.some(host => urlObj.hostname.includes(host))) {
        displayWarning(`Repository host ${urlObj.hostname} may not be fully supported`);
      }
      
      return { valid: true };
    } catch {
      return { valid: false, error: 'Invalid URL format' };
    }
  }

  /**
   * Get repository information from URL
   */
  static parseRepositoryInfo(url: string): {
    owner?: string;
    repo?: string;
    host?: string;
  } {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      
      if (pathParts.length >= 2) {
        return {
          host: urlObj.hostname,
          owner: pathParts[0],
          repo: pathParts[1].replace(/\.git$/, '')
        };
      }
    } catch {
      // Ignore parsing errors
    }
    
    return {};
  }
}