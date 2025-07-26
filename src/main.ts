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
import { AIConfigManager } from './ai/config-manager.js';
import { AIService } from './ai/ai-service.js';
import { displaySuccess, displayError, displayWarning, displayInfo } from './utils/display.js';
import type { CliOptions, DigestionQuery, DigestOutput, FileNode } from './types.js';

/**
 * Main application orchestrator
 */
export async function main(source: string, options: CliOptions): Promise<void> {
  const startTime = Date.now();
  let query: DigestionQuery | undefined;
  let spinner = ora();

  try {
    // Handle AI configuration commands first
    if (options.setupAi) {
      await AIConfigManager.interactiveSetup();
      return;
    }

    if (options.setApiKey) {
      await AIConfigManager.saveApiKey(options.setApiKey);
      displayInfo('✅ API key saved successfully!');
      return;
    }

    if (options.showAiConfig) {
      await AIConfigManager.showConfig();
      return;
    }

    if (options.resetAiConfig) {
      await AIConfigManager.clearConfig();
      return;
    }

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
    let output = generator.generate(rootNode);
    spinner.succeed('Digest generated successfully');

    // AI Analysis (if enabled)
    if (options.aiAnalysis || options.aiSummary || options.securityScan) {
      output = await performAIAnalysis(output, rootNode, options, spinner);
    }

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
 * Perform AI analysis on the digest and files
 */
async function performAIAnalysis(
  output: DigestOutput,
  rootNode: FileNode,
  options: CliOptions,
  spinner: Ora
): Promise<DigestOutput> {
  try {
    spinner.start('Initializing AI service...');
    
    // Initialize AI service
    const aiService = new AIService();
    const aiConfigOptions = {
      apiKey: options.setApiKey || process.env.GEMINI_API_KEY
    };
    
    const initialized = await aiService.initialize(aiConfigOptions);
    if (!initialized) {
      spinner.warn('AI service initialization failed. Skipping AI analysis.');
      displayInfo('💡 Run with --setup-ai to configure AI settings.');
      return output;
    }

    spinner.succeed('AI service initialized');

    // Collect text files for analysis
    const textFiles = collectTextFiles(rootNode);
    const filesToAnalyze = textFiles.slice(0, 10); // Limit to first 10 files to avoid rate limits

    let aiInsights: any = {
      overview: null,
      recommendations: [],
      fileAnalyses: 0,
      analysisMetadata: {
        timestamp: new Date().toISOString(),
        filesAnalyzed: 0,
        totalFiles: textFiles.length
      }
    };

    // Repository-level analysis
    if (options.aiSummary) {
      spinner.start('Generating AI repository summary...');
      const repositoryAnalysis = await aiService.analyzeRepository(output);
      if (repositoryAnalysis) {
        aiInsights.overview = repositoryAnalysis;
        aiInsights.recommendations = repositoryAnalysis.recommendations || [];
      }
      spinner.succeed('Repository summary generated');
    }

    // File-level analysis
    if (options.aiAnalysis && filesToAnalyze.length > 0) {
      spinner.start(`Analyzing ${filesToAnalyze.length} files with AI...`);
      
      const analysisType = options.securityScan ? 'security' : 'quality';
      const fileAnalyses = await aiService.analyzeFiles(filesToAnalyze, analysisType);
      
      aiInsights.fileAnalyses = fileAnalyses.size;
      aiInsights.analysisMetadata.filesAnalyzed = fileAnalyses.size;
      
      // Process successful analyses
      const successfulAnalyses = Array.from(fileAnalyses.values()).filter(a => a.success);
      if (successfulAnalyses.length > 0) {
        // Extract recommendations from file analyses
        const fileRecommendations = successfulAnalyses
          .flatMap(analysis => analysis.analysis?.suggestions || [])
          .slice(0, 10); // Limit recommendations
        
        aiInsights.recommendations.push(...fileRecommendations);
      }
      
      spinner.succeed(`Analyzed ${successfulAnalyses.length} files with AI`);
    }

    // Security analysis
    if (options.securityScan) {
      spinner.start('Performing security analysis...');
      
      const securityFiles = textFiles.filter(f => 
        f.language && ['JavaScript', 'TypeScript', 'Python', 'Java', 'PHP'].includes(f.language)
      ).slice(0, 5);
      
      if (securityFiles.length > 0) {
        const securityAnalyses = await aiService.analyzeFiles(securityFiles, 'security');
        const securityResults = Array.from(securityAnalyses.values())
          .filter(a => a.success && a.analysis?.security)
          .map(a => a.analysis?.security);
        
        if (securityResults.length > 0) {
          output.securityAnalysis = {
            summary: `Analyzed ${securityResults.length} files for security issues`,
            results: securityResults,
            timestamp: new Date().toISOString()
          };
        }
      }
      
      spinner.succeed('Security analysis completed');
    }

    // Add AI insights to output
    output.aiInsights = aiInsights;

    return output;

  } catch (error) {
    spinner.fail('AI analysis failed');
    displayWarning(`AI analysis error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    displayInfo('💡 Run with --setup-ai to configure AI settings.');
    return output;
  }
}

/**
 * Collect text files from the file tree
 */
function collectTextFiles(node: FileNode): FileNode[] {
  const textFiles: FileNode[] = [];
  
  function traverse(n: FileNode) {
    if (n.type === 'file' && n.content && 
        !['[binary]', '[unreadable]'].includes(n.content)) {
      textFiles.push(n);
    } else if (n.type === 'directory' && n.children) {
      n.children.forEach(traverse);
    }
  }
  
  traverse(node);
  return textFiles;
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
  output: DigestOutput, 
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
      type: 'confirm',
      name: 'aiAnalysis',
      message: 'Enable AI-powered analysis?',
      default: query.options.aiAnalysis
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