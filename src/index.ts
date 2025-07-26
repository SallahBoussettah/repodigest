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
  .description('🚀 AI-powered codebase analysis and intelligent digest generation')
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
      console.log('Quick examples:');
      console.log(chalk.cyan('  repodigest .                             # Analyze current directory'));
      console.log(chalk.cyan('  repodigest https://github.com/user/repo  # Analyze remote repository'));
      console.log(chalk.cyan('  repodigest --setup-ai                    # Setup AI configuration\n'));
      console.log(chalk.gray('💡 For more examples: ') + chalk.cyan('repodigest examples'));
      console.log(chalk.gray('💡 For AI features: ') + chalk.cyan('repodigest ai-help'));
      console.log(chalk.gray('💡 For all options: ') + chalk.cyan('repodigest options'));
      console.log(chalk.gray('💡 For all features: ') + chalk.cyan('repodigest features'));
      console.log(chalk.gray('💡 For full help: ') + chalk.cyan('repodigest --help\n'));
      return;
    }

    try {
      await main(source || '.', options);
    } catch (error) {
      displayError(error instanceof Error ? error : new Error('Unknown error occurred'));
      process.exit(1);
    }
  });

// Add separate commands for help sections
program
  .command('examples')
  .description('📚 Show comprehensive usage examples')
  .action(() => {
    showExamples();
  });

program
  .command('ai-help')
  .description('🤖 Show AI features and configuration help')
  .action(() => {
    showAIHelp();
  });

program
  .command('features')
  .description('✨ Show all available features and capabilities')
  .action(() => {
    showFeatures();
  });

program
  .command('options')
  .description('⚙️ Show all available command-line options')
  .action(() => {
    showOptions();
  });

/**
 * Enhanced help display
 */
program.configureHelp({
  helpWidth: 100,
  sortSubcommands: true,
});

/**
 * Show comprehensive usage examples
 */
function showExamples(): void {
  const divider = chalk.gray('─'.repeat(80));
  const section = (emoji: string, title: string) =>
    `${emoji}  ${chalk.bold.hex('#00D4AA')(title.toUpperCase())}`;

  console.log([
    divider,
    section('📚', 'RepoDigest Examples'),
    '',
    chalk.bold.white('  Basic Usage:'),
    `    ${chalk.cyan('repodigest .')}                           ${chalk.gray('# Analyze current directory')}`,
    `    ${chalk.cyan('repodigest https://github.com/facebook/react')}  ${chalk.gray('# Analyze remote repo')}`,
    `    ${chalk.cyan('repodigest /path/to/project')}            ${chalk.gray('# Analyze specific path')}`,
    '',
    chalk.bold.white('  Output Formats:'),
    `    ${chalk.cyan('repodigest . --format json -o report.json')}     ${chalk.gray('# JSON structured output')}`,
    `    ${chalk.cyan('repodigest . --format markdown -o README.md')}   ${chalk.gray('# Markdown documentation')}`,
    `    ${chalk.cyan('repodigest . -o - | less')}               ${chalk.gray('# Pipe to pager')}`,
    `    ${chalk.cyan('repodigest . --format json --compress')}  ${chalk.gray('# Compressed JSON')}`,
    '',
    chalk.bold.white('  Advanced Filtering:'),
    `    ${chalk.cyan('repodigest . --language typescript python')}     ${chalk.gray('# Only TS and Python files')}`,
    `    ${chalk.cyan('repodigest . --include-pattern "src/**/*.js"')}  ${chalk.gray('# Only JS files in src/')}`,
    `    ${chalk.cyan('repodigest . --exclude-pattern "*.test.*"')}     ${chalk.gray('# Exclude test files')}`,
    `    ${chalk.cyan('repodigest . --max-size 50000')}          ${chalk.gray('# Skip files > 50KB')}`,
    `    ${chalk.cyan('repodigest . --depth 3')}                 ${chalk.gray('# Limit directory depth')}`,
    '',
    chalk.bold.white('  Repository Options:'),
    `    ${chalk.cyan('repodigest https://github.com/user/repo --branch dev')}   ${chalk.gray('# Specific branch')}`,
    `    ${chalk.cyan('repodigest https://github.com/user/private --token $TOKEN')} ${chalk.gray('# Private repo')}`,
    `    ${chalk.cyan('repodigest . --include-gitignored')}      ${chalk.gray('# Include ignored files')}`,
    '',
    chalk.bold.white('  Enhanced Features:'),
    `    ${chalk.cyan('repodigest . --interactive')}             ${chalk.gray('# Guided setup mode')}`,
    `    ${chalk.cyan('repodigest . --stats')}                   ${chalk.gray('# Generate statistics file')}`,
    `    ${chalk.cyan('repodigest . --force')}                   ${chalk.gray('# Overwrite without prompt')}`,
    '',
    chalk.bold.white('  AI-Powered Analysis:'),
    `    ${chalk.cyan('repodigest . --ai-analysis')}             ${chalk.gray('# AI code quality analysis')}`,
    `    ${chalk.cyan('repodigest . --ai-summary')}              ${chalk.gray('# AI repository summary')}`,
    `    ${chalk.cyan('repodigest . --security-scan')}           ${chalk.gray('# AI security analysis')}`,
    `    ${chalk.cyan('repodigest . --ai-analysis --ai-summary --security-scan')} ${chalk.gray('# Full AI analysis')}`,
    '',
    chalk.bold.white('  Combined Examples:'),
    `    ${chalk.cyan('repodigest . --format json --ai-analysis --stats --force')}`,
    `    ${chalk.cyan('repodigest https://github.com/user/repo --ai-summary --format markdown')}`,
    `    ${chalk.cyan('repodigest . --language typescript --exclude-pattern "*.test.*" --ai-analysis')}`,
    '',
    divider,
    chalk.gray('💡 For AI setup help: ') + chalk.cyan('repodigest ai-help'),
    chalk.gray('💡 For all options: ') + chalk.cyan('repodigest options'),
    chalk.gray('💡 For all features: ') + chalk.cyan('repodigest features'),
    divider,
  ].join('\n'));
}

/**
 * Show AI features and configuration help
 */
function showAIHelp(): void {
  const divider = chalk.gray('─'.repeat(80));
  const section = (emoji: string, title: string) =>
    `${emoji}  ${chalk.bold.hex('#00D4AA')(title.toUpperCase())}`;

  console.log([
    divider,
    section('🤖', 'AI Features & Configuration'),
    '',
    chalk.bold.white('  Setup & Configuration:'),
    `    ${chalk.cyan('repodigest --setup-ai')}                  ${chalk.gray('# Interactive AI setup')}`,
    `    ${chalk.cyan('repodigest --set-api-key YOUR_KEY')}      ${chalk.gray('# Set Gemini API key')}`,
    `    ${chalk.cyan('repodigest --show-ai-config')}            ${chalk.gray('# Show current AI config')}`,
    `    ${chalk.cyan('repodigest --reset-ai-config')}           ${chalk.gray('# Reset AI configuration')}`,
    '',
    chalk.bold.white('  AI Analysis Features:'),
    `    ${chalk.cyan('--ai-analysis')}      ${chalk.gray('AI-powered code quality analysis with insights')}`,
    `    ${chalk.cyan('--ai-summary')}       ${chalk.gray('Generate intelligent repository summaries')}`,
    `    ${chalk.cyan('--security-scan')}    ${chalk.gray('AI-powered security vulnerability detection')}`,
    '',
    chalk.bold.white('  Environment Variables:'),
    `    ${chalk.cyan('GEMINI_API_KEY')}     ${chalk.gray('Google Gemini API key')}`,
    `    ${chalk.cyan('GEMINI_MODEL')}       ${chalk.gray('Model to use (default: gemini-2.5-flash)')}`,
    `    ${chalk.cyan('GEMINI_TEMPERATURE')} ${chalk.gray('AI temperature (0.0-1.0, default: 0.1)')}`,
    `    ${chalk.cyan('GEMINI_MAX_TOKENS')}  ${chalk.gray('Max tokens per response (default: 2048)')}`,
    `    ${chalk.cyan('GEMINI_TIMEOUT')}     ${chalk.gray('Request timeout in ms (default: 30000)')}`,
    '',
    chalk.bold.white('  Getting Started:'),
    `    ${chalk.yellow('1.')} Get API key: ${chalk.underline('https://makersuite.google.com/app/apikey')}`,
    `    ${chalk.yellow('2.')} Run: ${chalk.cyan('repodigest --setup-ai')}`,
    `    ${chalk.yellow('3.')} Try: ${chalk.cyan('repodigest . --ai-summary')}`,
    '',
    chalk.bold.white('  AI Analysis Examples:'),
    `    ${chalk.cyan('repodigest . --ai-analysis --format json')}`,
    `    ${chalk.cyan('repodigest . --ai-summary --format markdown -o summary.md')}`,
    `    ${chalk.cyan('repodigest . --security-scan --language javascript typescript')}`,
    `    ${chalk.cyan('repodigest https://github.com/user/repo --ai-analysis --ai-summary')}`,
    '',
    divider,
    divider,
    chalk.gray('💡 For examples: ') + chalk.cyan('repodigest examples'),
    chalk.gray('💡 For all options: ') + chalk.cyan('repodigest options'),
    chalk.gray('💡 For features: ') + chalk.cyan('repodigest features'),
    '',
    chalk.gray('💡 Supported Models: Gemini 2.5 Flash, 1.5 Pro, 1.5 Flash'),
    chalk.gray('💡 AI features require a valid Gemini API key'),
    divider,
  ].join('\n'));
}

/**
 * Show all available command-line options
 */
function showOptions(): void {
  const divider = chalk.gray('─'.repeat(80));
  const section = (emoji: string, title: string) =>
    `${emoji}  ${chalk.bold.hex('#00D4AA')(title.toUpperCase())}`;

  console.log([
    divider,
    section('⚙️', 'Command-Line Options'),
    '',
    chalk.bold.white('  📤 Output Options:'),
    `  ${chalk.green('-o, --output <file>')}        ${chalk.gray('Output file path (use "-" for stdout)')} ${chalk.yellow('[digest.txt]')}`,
    `  ${chalk.green('-f, --format <type>')}        ${chalk.gray('Output format: text, json, markdown')} ${chalk.yellow('[text]')}`,
    `  ${chalk.green('--compress')}                 ${chalk.gray('Compress JSON output (removes formatting)')}`,
    `  ${chalk.green('--stats')}                    ${chalk.gray('Generate separate statistics file')}`,
    '',
    chalk.bold.white('  📐 Processing Options:'),
    `  ${chalk.green('-s, --max-size <bytes>')}     ${chalk.gray('Maximum file size to process')} ${chalk.yellow('[10485760]')}`,
    `  ${chalk.green('-d, --depth <number>')}       ${chalk.gray('Maximum directory depth to traverse')}`,
    `  ${chalk.green('-l, --language <langs...>')}  ${chalk.gray('Filter by programming languages')}`,
    '',
    chalk.bold.white('  🌐 Repository Options:'),
    `  ${chalk.green('-b, --branch <name>')}        ${chalk.gray('Git branch to clone (for remote repos)')}`,
    `  ${chalk.green('-t, --token <token>')}        ${chalk.gray('GitHub Personal Access Token')}`,
    '',
    chalk.bold.white('  🔍 Pattern Matching:'),
    `  ${chalk.green('--include-pattern <patterns...>')} ${chalk.gray('Include files matching glob patterns')}`,
    `  ${chalk.green('--exclude-pattern <patterns...>')} ${chalk.gray('Exclude files matching glob patterns')}`,
    `  ${chalk.green('--include-gitignored')}       ${chalk.gray('Include files normally ignored by .gitignore')}`,
    '',
    chalk.bold.white('  🤖 AI Options:'),
    `  ${chalk.green('--ai-analysis')}              ${chalk.gray('Enable AI-powered code analysis')}`,
    `  ${chalk.green('--ai-summary')}               ${chalk.gray('Generate AI summary of the codebase')}`,
    `  ${chalk.green('--security-scan')}            ${chalk.gray('Perform AI-powered security analysis')}`,
    `  ${chalk.green('--setup-ai')}                 ${chalk.gray('Setup AI configuration interactively')}`,
    `  ${chalk.green('--set-api-key <key>')}        ${chalk.gray('Set Gemini API key')}`,
    `  ${chalk.green('--show-ai-config')}           ${chalk.gray('Show current AI configuration')}`,
    `  ${chalk.green('--reset-ai-config')}          ${chalk.gray('Reset AI configuration')}`,
    '',
    chalk.bold.white('  🎛️ Behavior Options:'),
    `  ${chalk.green('--force')}                    ${chalk.gray('Overwrite existing files without confirmation')}`,
    `  ${chalk.green('-i, --interactive')}          ${chalk.gray('Run in interactive mode with guided setup')}`,
    '',
    chalk.bold.white('  ℹ️ Information Options:'),
    `  ${chalk.green('-h, --help')}                 ${chalk.gray('Show help information')}`,
    `  ${chalk.green('-V, --version')}              ${chalk.gray('Show version information')}`,
    '',
    divider,
    chalk.bold.white('  🌍 Environment Variables:'),
    `  ${chalk.cyan('GITHUB_TOKEN')}     ${chalk.gray('GitHub Personal Access Token for private repos')}`,
    `  ${chalk.cyan('GEMINI_API_KEY')}   ${chalk.gray('Google Gemini API key for AI analysis')}`,
    `  ${chalk.cyan('GEMINI_MODEL')}     ${chalk.gray('Gemini model to use (default: gemini-2.5-flash)')}`,
    `  ${chalk.cyan('GEMINI_TEMPERATURE')} ${chalk.gray('AI temperature (0.0-1.0, default: 0.1)')}`,
    `  ${chalk.cyan('GEMINI_MAX_TOKENS')} ${chalk.gray('Max tokens per response (default: 2048)')}`,
    `  ${chalk.cyan('GEMINI_TIMEOUT')}   ${chalk.gray('Request timeout in ms (default: 30000)')}`,
    '',
    divider,
    chalk.bold.white('  📝 Option Examples:'),
    `  ${chalk.cyan('repodigest . --format json --output report.json')}`,
    `  ${chalk.cyan('repodigest . --language typescript python --max-size 50000')}`,
    `  ${chalk.cyan('repodigest . --ai-analysis --ai-summary --security-scan')}`,
    `  ${chalk.cyan('repodigest . --include-pattern "src/**/*.js" --exclude-pattern "*.test.*"')}`,
    '',
    divider,
    chalk.gray('💡 For examples: ') + chalk.cyan('repodigest examples'),
    chalk.gray('💡 For AI help: ') + chalk.cyan('repodigest ai-help'),
    chalk.gray('💡 For features: ') + chalk.cyan('repodigest features'),
    divider,
  ].join('\n'));
}

/**
 * Show all available features
 */
function showFeatures(): void {
  const divider = chalk.gray('─'.repeat(80));
  const section = (emoji: string, title: string) =>
    `${emoji}  ${chalk.bold.hex('#00D4AA')(title.toUpperCase())}`;

  console.log([
    divider,
    section('✨', 'RepoDigest Features'),
    '',
    chalk.bold.white('  🤖 AI-Powered Intelligence:'),
    `    ${chalk.yellow('✨')} Google Gemini AI integration for code analysis`,
    `    ${chalk.yellow('✨')} Intelligent code quality assessment`,
    `    ${chalk.yellow('✨')} Security vulnerability detection`,
    `    ${chalk.yellow('✨')} AI-generated repository summaries`,
    `    ${chalk.yellow('✨')} Context-aware recommendations`,
    '',
    chalk.bold.white('  📊 Advanced Analytics:'),
    `    ${chalk.yellow('✨')} Multiple output formats (Text, JSON, Markdown)`,
    `    ${chalk.yellow('✨')} Language-specific filtering and analysis`,
    `    ${chalk.yellow('✨')} Comprehensive statistics and metrics`,
    `    ${chalk.yellow('✨')} Token estimation for LLM usage`,
    `    ${chalk.yellow('✨')} File size and complexity analysis`,
    '',
    chalk.bold.white('  🔍 Smart Processing:'),
    `    ${chalk.yellow('✨')} Advanced binary file detection`,
    `    ${chalk.yellow('✨')} Intelligent language identification`,
    `    ${chalk.yellow('✨')} Fast-glob pattern matching`,
    `    ${chalk.yellow('✨')} Configurable file size limits`,
    `    ${chalk.yellow('✨')} Directory depth control`,
    '',
    chalk.bold.white('  🌐 Repository Support:'),
    `    ${chalk.yellow('✨')} Local directory analysis`,
    `    ${chalk.yellow('✨')} Remote Git repository cloning`,
    `    ${chalk.yellow('✨')} Private repository access`,
    `    ${chalk.yellow('✨')} Branch-specific analysis`,
    `    ${chalk.yellow('✨')} .gitignore respect and override`,
    '',
    chalk.bold.white('  🎛️ User Experience:'),
    `    ${chalk.yellow('✨')} Interactive configuration mode`,
    `    ${chalk.yellow('✨')} Progress indicators and feedback`,
    `    ${chalk.yellow('✨')} Comprehensive error handling`,
    `    ${chalk.yellow('✨')} Rich CLI help system`,
    `    ${chalk.yellow('✨')} Persistent AI configuration`,
    '',
    chalk.bold.white('  🛠️ Developer Tools:'),
    `    ${chalk.yellow('✨')} TypeScript-first architecture`,
    `    ${chalk.yellow('✨')} Modular and extensible design`,
    `    ${chalk.yellow('✨')} Version management system`,
    `    ${chalk.yellow('✨')} Comprehensive documentation`,
    '',
    divider,
    chalk.gray('💡 For examples: ') + chalk.cyan('repodigest examples'),
    chalk.gray('💡 For AI help: ') + chalk.cyan('repodigest ai-help'),
    chalk.gray('💡 For all options: ') + chalk.cyan('repodigest options'),
    divider,
  ].join('\n'));
}

// Custom help formatting - now much more concise
program.helpInformation = () => {
  const divider = chalk.gray('─'.repeat(80));
  const section = (emoji: string, title: string) =>
    `${emoji}  ${chalk.bold.hex('#00D4AA')(title.toUpperCase())}`;

  const help = [
    divider,
    section('🚀', 'Usage'),
    `  ${chalk.cyan('repodigest')} ${chalk.magenta('<source>')} ${chalk.green('[options]')}`,
    `  ${chalk.cyan('repodigest')} ${chalk.magenta('<command>')}`,
    '',
    divider,
    section('📝', 'Description'),
    `  ${chalk.white('AI-powered codebase analysis and intelligent digest generation')}`,
    `  ${chalk.gray('Enhanced with Google Gemini AI for smart code insights')}`,
    '',
    divider,
    section('📦', 'Arguments'),
    `  ${chalk.magenta('<source>')}  ${chalk.gray('Repository URL or local directory path')}`,
    '',
    divider,
    section('🎯', 'Quick Start'),
    `  ${chalk.cyan('repodigest .')}                           ${chalk.gray('# Analyze current directory')}`,
    `  ${chalk.cyan('repodigest https://github.com/user/repo')} ${chalk.gray('# Analyze remote repository')}`,
    `  ${chalk.cyan('repodigest --setup-ai')}                  ${chalk.gray('# Setup AI features')}`,
    '',
    divider,
    section('📚', 'Available Commands'),
    `  ${chalk.cyan('repodigest <source> [options]')} ${chalk.gray('Analyze repository or directory')}`,
    `  ${chalk.cyan('repodigest examples')}           ${chalk.gray('Show comprehensive usage examples')}`,
    `  ${chalk.cyan('repodigest ai-help')}            ${chalk.gray('Show AI features and configuration')}`,
    `  ${chalk.cyan('repodigest options')}            ${chalk.gray('Show all command-line options')}`,
    `  ${chalk.cyan('repodigest features')}           ${chalk.gray('Show all available features')}`,
    `  ${chalk.cyan('repodigest --help')}             ${chalk.gray('Show this help message')}`,
    `  ${chalk.cyan('repodigest --version')}          ${chalk.gray('Show version information')}`,
    '',
    divider,
    section('⚙️', 'Common Options'),
    `  ${chalk.green('-f, --format <type>')}        ${chalk.gray('Output format: text, json, markdown')}`,
    `  ${chalk.green('-o, --output <file>')}        ${chalk.gray('Output file path')}`,
    `  ${chalk.green('-l, --language <langs...>')}  ${chalk.gray('Filter by programming languages')}`,
    `  ${chalk.green('--ai-analysis')}              ${chalk.gray('Enable AI code analysis')}`,
    `  ${chalk.green('--ai-summary')}               ${chalk.gray('Generate AI repository summary')}`,
    `  ${chalk.green('--security-scan')}            ${chalk.gray('AI security vulnerability scan')}`,
    `  ${chalk.green('-i, --interactive')}          ${chalk.gray('Interactive configuration mode')}`,
    '',
    divider,
    section('🔗', 'More Information'),
    `  ${chalk.cyan('Repository')}  ${chalk.underline('https://github.com/SallahBoussettah/repodigest')}`,
    `  ${chalk.cyan('AI Setup')}    ${chalk.underline('https://makersuite.google.com/app/apikey')}`,
    '',
    `  ${chalk.gray('🚀 Built to help developers and AI collaborate more effectively')}`,
    divider,
  ];

  return help.join('\n');
};

// Parse command line arguments
program.parse(process.argv);