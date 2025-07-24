import chalk from 'chalk';
import figlet from 'figlet';
import boxen from 'boxen';
import type { DigestStats } from '../types.js';

/**
 * Display the welcome message with ASCII art
 */
export function displayWelcome(): void {
  const title = figlet.textSync('RepoDigest', {
    font: 'Standard',
    horizontalLayout: 'default',
    verticalLayout: 'default',
  });
  
  console.log(chalk.cyan.bold(title));
  console.log(chalk.blue.bold('  🚀 Advanced codebase analysis and LLM-ready digest generation'));
  console.log(chalk.gray('  ✨ Enhanced with smart filtering, multiple formats, and detailed analytics\n'));
}

/**
 * Display success message with enhanced stats
 */
export function displaySuccess(stats: DigestStats, outputPath: string): void {
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const formatTime = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  // Create language breakdown
  const topLanguages = Object.entries(stats.languageBreakdown)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([lang, count]) => `${lang}: ${count}`)
    .join(', ');

  const summaryContent = [
    `📊 Files Processed: ${chalk.cyan(stats.totalFiles.toLocaleString())}`,
    `📁 Directories: ${chalk.cyan(stats.totalDirectories.toLocaleString())}`,
    `💾 Total Size: ${chalk.cyan(formatBytes(stats.totalSize))}`,
    `📝 Text Content: ${chalk.cyan(formatBytes(stats.textSize))}`,
    `🔢 Binary Files: ${chalk.yellow(stats.binaryFiles.toLocaleString())}`,
    `🎯 Estimated Tokens: ${chalk.green(stats.estimatedTokens.toLocaleString())}`,
    `⚡ Processing Time: ${chalk.magenta(formatTime(stats.processingTime))}`,
    '',
    `🔤 Top Languages: ${chalk.blue(topLanguages || 'None detected')}`,
  ].join('\n');

  const summaryBox = boxen(summaryContent, {
    padding: 1,
    margin: 1,
    borderStyle: 'round',
    borderColor: 'green',
    title: '✅ Digest Complete',
    titleAlignment: 'center',
  });

  console.log(summaryBox);
  console.log(chalk.green(`📄 Output saved to: ${chalk.bold(outputPath)}`));
  
  if (stats.largestFiles.length > 0) {
    console.log(chalk.gray('\n📈 Largest files processed:'));
    stats.largestFiles.slice(0, 3).forEach(file => {
      console.log(chalk.gray(`   • ${file.path} (${formatBytes(file.size)})`));
    });
  }
}

/**
 * Display error message
 */
export function displayError(error: Error): void {
  const errorBox = boxen(error.message, {
    padding: 1,
    margin: 1,
    borderStyle: 'double',
    borderColor: 'red',
    title: '❌ Error Occurred',
    titleAlignment: 'center',
  });
  
  console.error(errorBox);
}

/**
 * Display progress with enhanced information
 */
export function displayProgress(message: string, details?: string): void {
  console.log(chalk.blue(`🔄 ${message}`));
  if (details) {
    console.log(chalk.gray(`   ${details}`));
  }
}

/**
 * Display warning message
 */
export function displayWarning(message: string): void {
  console.log(chalk.yellow(`⚠️  ${message}`));
}

/**
 * Display info message
 */
export function displayInfo(message: string): void {
  console.log(chalk.cyan(`ℹ️  ${message}`));
}