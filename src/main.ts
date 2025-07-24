import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import ora, { type Ora } from 'ora';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { parseQuery, validateOptions } from './core/query-parser.js';
import { RepositoryCloner } from './core/repository-cloner.js';
import { FileProcessor } from './core/file-processor.js';
import { OutputGenerator } from './core/output-generator.js';
import { displaySuccess, displayError, displayWarning, displayInfo } from './utils/display.js';
import type { CliOptions, DigestionQuery } from './types.js';

/**
 * Main application orchestrator
 */
export async function main(source: string, options: CliOptions): Promise<void> {
  const startTime = Date.now();
  let query: DigestionQuery | undefined;
  let spinner = ora();

  try {
    // Validate options
    const validationErrors = validateOptions(options);
    if (validationErrors.length > 0) {
      throw new Error(`Invalid options:\n${validationErrors.map(e => `  • ${e}`).join('\n')}`);
    }

    // Parse query
    query = parseQuery(source, options);
    
    // Interactive mode
    if (options.interactive) {
      query = await runInteractiveMode(query);
    }

    // Handle remote repositories
    if (query.isRemote) {
      await handleRemoteRepository(query, spinner);
    } else {
      // Validate local path
      await validateLocalPath(query.repoPath);
    }

    // Process files
    spinner.start('Analyzing repository structure...');
    const processor = new FileProcessor(query);
    const { rootNode, stats } = await processor.process();
    spinner.succeed(`Processed ${stats.totalFiles} files in ${stats.totalDirectories} directories`);

    // Generate output
    spinner.start('Generating digest...');
    const generator = new OutputGenerator(query, stats);
    const output = generator.generate(rootNode);
    spinner.succeed('Digest generated successfully');

    // Handle output
    await handleOutput(output, query, spinner);

    // Display success
    displaySuccess(output.stats, query.outputPath);

  } catch (error) {
    if (spinner.isSpinning) {
      spinner.fail('Process failed');
    }
    throw error;
  } finally {
    // Cleanup temporary directory
    if (query?.tempDir) {
      try {
        await fs.rm(query.tempDir, { recursive: true, force: true });
      } catch {
        displayWarning('Could not clean up temporary directory');
      }
    }
  }
}

/**
 * Handle remote repository cloning
 */
async function handleRemoteRepository(query: DigestionQuery, spinner: Ora): Promise<void> {
  // Validate URL
  const validation = RepositoryCloner.validateUrl(query.source);
  if (!validation.valid) {
    throw new Error(`Invalid repository URL: ${validation.error}`);
  }

  // Create temporary directory
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'repodigest-'));
  query.tempDir = tempDir;
  query.repoPath = tempDir;

  // Clone repository
  const cloner = new RepositoryCloner();
  await cloner.clone(query.source, query.repoPath, {
    branch: query.options.branch,
    token: query.options.token || process.env.GITHUB_TOKEN,
    depth: 1
  });
}

/**
 * Validate local path exists and is accessible
 */
async function validateLocalPath(localPath: string): Promise<void> {
  try {
    const stats = await fs.stat(localPath);
    if (!stats.isDirectory()) {
      throw new Error(`Path is not a directory: ${localPath}`);
    }
  } catch (error) {
    if ((error as any).code === 'ENOENT') {
      throw new Error(`Directory does not exist: ${localPath}`);
    }
    throw new Error(`Cannot access directory: ${localPath}`);
  }
}

/**
 * Handle output writing with various options
 */
async function handleOutput(
  output: any, 
  query: DigestionQuery, 
  spinner: Ora
): Promise<void> {
  const { outputPath } = query;

  // Handle stdout output
  if (outputPath === '-') {
    process.stdout.write(output.content);
    return;
  }

  // Check if file exists and handle overwrite
  const fileExists = await checkFileExists(outputPath);
  if (fileExists && !query.options.force) {
    spinner.stop();
    
    const { shouldOverwrite } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'shouldOverwrite',
        message: `File "${chalk.yellow(outputPath)}" already exists. Overwrite?`,
        default: false,
      },
    ]);

    if (!shouldOverwrite) {
      displayInfo('Operation cancelled by user');
      process.exit(0);
    }
  }

  // Write file
  spinner.start(`Writing output to ${outputPath}...`);
  
  try {
    // Ensure directory exists
    const dir = path.dirname(outputPath);
    await fs.mkdir(dir, { recursive: true });
    
    // Write content
    let content = output.content;
    
    // Handle compression if requested
    if (query.options.compress && query.options.format === 'json') {
      content = JSON.stringify(JSON.parse(content));
    }
    
    await fs.writeFile(outputPath, content, 'utf-8');
    
    // Write stats file if requested
    if (query.options.stats) {
      const statsPath = outputPath.replace(/\.[^.]+$/, '.stats.json');
      await fs.writeFile(statsPath, JSON.stringify(output.stats, null, 2), 'utf-8');
      displayInfo(`Statistics written to ${statsPath}`);
    }
    
    spinner.succeed(`Output written to ${outputPath}`);
    
  } catch (error) {
    spinner.fail(`Failed to write output: ${error}`);
    throw error;
  }
}

/**
 * Check if file exists
 */
async function checkFileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Run interactive mode to configure options
 */
async function runInteractiveMode(query: DigestionQuery): Promise<DigestionQuery> {
  displayInfo('Running in interactive mode...');
  
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'format',
      message: 'Choose output format:',
      choices: [
        { name: 'Text (human-readable)', value: 'text' },
        { name: 'JSON (structured data)', value: 'json' },
        { name: 'Markdown (documentation)', value: 'markdown' }
      ],
      default: query.options.format
    },
    {
      type: 'input',
      name: 'maxSize',
      message: 'Maximum file size to process (bytes):',
      default: query.options.maxSize,
      validate: (input: string) => {
        const num = parseInt(input, 10);
        return !isNaN(num) && num > 0 ? true : 'Please enter a valid positive number';
      }
    },
    {
      type: 'confirm',
      name: 'includeGitignored',
      message: 'Include files normally ignored by .gitignore?',
      default: query.options.includeGitignored
    },
    {
      type: 'confirm',
      name: 'stats',
      message: 'Generate separate statistics file?',
      default: query.options.stats
    },
    {
      type: 'input',
      name: 'includePattern',
      message: 'Include patterns (comma-separated, optional):',
      default: query.options.includePattern?.join(', ') || '',
      filter: (input: string) => input ? input.split(',').map(s => s.trim()).filter(Boolean) : undefined
    },
    {
      type: 'input',
      name: 'excludePattern',
      message: 'Exclude patterns (comma-separated, optional):',
      default: query.options.excludePattern?.join(', ') || '',
      filter: (input: string) => input ? input.split(',').map(s => s.trim()).filter(Boolean) : undefined
    }
  ]);

  // Update query with answers
  Object.assign(query.options, answers);
  
  return query;
}