#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import { main } from './main.js';
import { displayWelcome, displayError } from './utils/display.js';
import type { CliOptions } from './types.js';

/**
 * Get package version from package.json
 */
function getPackageVersion(): string {
  try {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const packageJsonPath = path.resolve(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    return packageJson.version || 'unknown';
  } catch {
    return 'unknown';
  }
}

/**
 * Create and configure CLI program
 */
const program = new Command();

program
  .name('repodigest')
  .description('🚀 Advanced codebase analysis and LLM-ready digest generation')
  .version(getPackageVersion(), '-V, --version', '📦 Show version information')
  .argument('[source]', '📁 Repository URL or local directory path')

  // Output options
  .option('-o, --output <file>', '📤 Output file path (use "-" for stdout)', 'digest.txt')
  .option('-f, --format <type>', '📋 Output format: text, json, markdown', 'text')
  .option('--compress', '🗜️  Compress JSON output (removes formatting)', false)
  .option('--stats', '📊 Generate separate statistics file', false)

  // Processing options
  .option('-s, --max-size <bytes>', '📐 Maximum file size to process (bytes)', '10485760')
  .option('-d, --depth <number>', '📏 Maximum directory depth to traverse')
  .option('-l, --language <languages...>', '🔤 Filter by programming languages')

  // Repository options
  .option('-b, --branch <name>', '🌿 Git branch to clone (for remote repos)')
  .option('-t, --token <token>', '🔐 GitHub Personal Access Token (or use GITHUB_TOKEN env)')

  // Pattern matching
  .option('--include-pattern <patterns...>', '✅ Include files matching these glob patterns')
  .option('--exclude-pattern <patterns...>', '❌ Exclude files matching these glob patterns')
  .option('--include-gitignored', '👻 Include files normally ignored by .gitignore', false)

  // AI options
  .option('--ai-analysis', '🤖 Enable AI-powered code analysis', false)
  .option('--ai-summary', '📝 Generate AI summary of the codebase', false)
  .option('--security-scan', '🔒 Perform AI-powered security analysis', false)
  .option('--setup-ai', '⚙️ Setup AI configuration interactively', false)
  .option('--set-api-key <key>', '🔑 Set Gemini API key', '')
  .option('--show-ai-config', '📋 Show current AI configuration', false)
  .option('--reset-ai-config', '🔄 Reset AI configuration', false)

  // Behavior options
  .option('--force', '💪 Overwrite existing output file without confirmation', false)
  .option('-i, --interactive', '🎛️  Run in interactive mode with guided setup', false)

  .action(async (source: string | undefined, options: CliOptions) => {
    // Show welcome message
    displayWelcome();

    // Check if this is an AI configuration command that doesn't need a source
    const aiConfigCommands = options.setupAi || options.setApiKey || options.showAiConfig || options.resetAiConfig;

    // Validate source argument (unless it's an AI config command)
    if (!source && !aiConfigCommands) {
      console.log(chalk.bgRed.white.bold(' ERROR ') + ' ' + chalk.red('Missing required argument: <source>\n'));
      console.log(chalk.gray('💡 Please specify a repository URL or local directory path.\n'));
      console.log('Examples:');
      console.log(chalk.cyan('  repodigest .'));
      console.log(chalk.cyan('  repodigest https://github.com/facebook/react'));
      console.log(chalk.cyan('  repodigest /path/to/project --format json'));
      console.log(chalk.cyan('  repodigest --setup-ai                    # Setup AI configuration'));
      console.log(chalk.cyan('  repodigest --show-ai-config              # Show AI settings\n'));
      program.help();
      return;
    }

    try {
      await main(source || '.', options);
    } catch (error) {
      displayError(error instanceof Error ? error : new Error('Unknown error occurred'));
      process.exit(1);
    }
  });

/**
 * Enhanced help display
 */
program.configureHelp({
  helpWidth: 100,
  sortSubcommands: true,
});

// Custom help formatting
program.helpInformation = () => {
  const divider = chalk.gray('─'.repeat(80));
  const section = (emoji: string, title: string) =>
    `${emoji}  ${chalk.bold.hex('#00D4AA')(title.toUpperCase())}`;

  const help = [
    divider,
    section('🚀', 'Usage'),
    `  ${chalk.cyan('repodigest')} ${chalk.magenta('<source>')} ${chalk.green('[options]')}`,
    '',
    divider,
    section('📝', 'Description'),
    `  ${chalk.white('Advanced codebase analysis and LLM-ready digest generation')}`,
    `  ${chalk.gray('Enhanced with smart filtering, multiple formats, and detailed analytics')}`,
    '',
    divider,
    section('📦', 'Arguments'),
    `  ${chalk.magenta('<source>')}  ${chalk.gray('Repository URL or local directory path')}`,
    '',
    divider,
    section('⚙️', 'Options'),
    ...program.options.map(opt => {
      const flags = chalk.green(opt.flags.padEnd(35));
      const description = chalk.white(opt.description);
      return `  ${flags}${description}`;
    }),
    '',
    divider,
    section('💡', 'Examples'),
    '',
    chalk.bold.white('  Basic Usage:'),
    `    ${chalk.cyan('repodigest .')}                           ${chalk.gray('# Analyze current directory')}`,
    `    ${chalk.cyan('repodigest https://github.com/facebook/react')}  ${chalk.gray('# Analyze remote repo')}`,
    '',
    chalk.bold.white('  Output Formats:'),
    `    ${chalk.cyan('repodigest . --format json')}             ${chalk.gray('# JSON structured output')}`,
    `    ${chalk.cyan('repodigest . --format markdown')}         ${chalk.gray('# Markdown documentation')}`,
    `    ${chalk.cyan('repodigest . -o - | less')}               ${chalk.gray('# Pipe to pager')}`,
    '',
    chalk.bold.white('  Advanced Filtering:'),
    `    ${chalk.cyan('repodigest . --language typescript python')}  ${chalk.gray('# Only TS and Python files')}`,
    `    ${chalk.cyan('repodigest . --include-pattern "src/**/*.js"')} ${chalk.gray('# Only JS files in src/')}`,
    `    ${chalk.cyan('repodigest . --exclude-pattern "*.test.*"')}    ${chalk.gray('# Exclude test files')}`,
    `    ${chalk.cyan('repodigest . --max-size 50000')}          ${chalk.gray('# Skip files > 50KB')}`,
    '',
    chalk.bold.white('  Repository Options:'),
    `    ${chalk.cyan('repodigest https://github.com/user/repo --branch dev')}  ${chalk.gray('# Specific branch')}`,
    `    ${chalk.cyan('repodigest https://github.com/user/private --token $TOKEN')} ${chalk.gray('# Private repo')}`,
    '',
    chalk.bold.white('  Enhanced Features:'),
    `    ${chalk.cyan('repodigest . --interactive')}             ${chalk.gray('# Guided setup mode')}`,
    `    ${chalk.cyan('repodigest . --stats')}                   ${chalk.gray('# Generate statistics file')}`,
    `    ${chalk.cyan('repodigest . --compress --format json')}  ${chalk.gray('# Compressed JSON output')}`,
    '',
    chalk.bold.white('  AI-Powered Analysis:'),
    `    ${chalk.cyan('repodigest . --setup-ai')}                ${chalk.gray('# Setup AI configuration')}`,
    `    ${chalk.cyan('repodigest . --ai-analysis')}             ${chalk.gray('# Enable AI code analysis')}`,
    `    ${chalk.cyan('repodigest . --ai-summary')}              ${chalk.gray('# Generate AI summary')}`,
    `    ${chalk.cyan('repodigest . --security-scan')}           ${chalk.gray('# AI security analysis')}`,
    `    ${chalk.cyan('repodigest . --show-ai-config')}          ${chalk.gray('# Show AI configuration')}`,
    '',
    divider,
    section('🌟', 'New Features'),
    `  ${chalk.yellow('✨')} Multiple output formats (Text, JSON, Markdown)`,
    `  ${chalk.yellow('✨')} Language-specific filtering`,
    `  ${chalk.yellow('✨')} Interactive configuration mode`,
    `  ${chalk.yellow('✨')} Enhanced pattern matching with fast-glob`,
    `  ${chalk.yellow('✨')} Detailed statistics and analytics`,
    `  ${chalk.yellow('✨')} Better binary file detection`,
    `  ${chalk.yellow('✨')} Improved error handling and progress display`,
    '',
    divider,
    section('ℹ️', 'Environment Variables'),
    `  ${chalk.cyan('GITHUB_TOKEN')}   ${chalk.gray('GitHub Personal Access Token for private repos')}`,
    `  ${chalk.cyan('GEMINI_API_KEY')} ${chalk.gray('Google Gemini API key for AI analysis')}`,
    '',
    divider,
    section('🔗', 'More Information'),
    `  ${chalk.cyan('👤 Author')}   → ${chalk.white('Salah Boussettah')}`,
    `  ${chalk.cyan('Repository')}  ${chalk.underline('https://github.com/SallahBoussettah/repodigest')}`,
    `  ${chalk.cyan('Issues')}      ${chalk.underline('https://github.com/SallahBoussettah/repodigest/issues')}`,
    '',
    `  ${chalk.gray('🚀 Built to help developers and AI collaborate more effectively')}`,
    divider,
  ];

  return help.join('\n');
};

// Parse command line arguments
program.parse(process.argv);