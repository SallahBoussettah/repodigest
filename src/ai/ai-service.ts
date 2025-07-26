import { GeminiClient } from './gemini-client.js';
import { AIConfigManager, AIConfigOptions } from './config-manager.js';
import { 
  CodeAnalysisRequest, 
  CodeAnalysisResult, 
  RepositoryAnalysis,
  AIConfig 
} from './analysis-types.js';
import { FileNode, DigestStats, DigestOutput } from '../types.js';
import { displayInfo, displayWarning, displayError } from '../utils/display.js';
import ora from 'ora';

export class AIService {
  private client: GeminiClient | null = null;
  private config: AIConfig | null = null;
  private isInitialized = false;

  /**
   * Initialize AI service with configuration
   */
  async initialize(options: AIConfigOptions = {}): Promise<boolean> {
    try {
      displayInfo('🤖 Initializing AI service...');
      
      // Get configuration
      this.config = await AIConfigManager.getConfig(options);
      
      if (!this.config.apiKey) {
        displayWarning('❌ No API key provided. AI features will be disabled.');
        return false;
      }

      // Create client
      this.client = new GeminiClient(this.config);
      
      // Test connection
      const spinner = ora('Testing API connection...').start();
      const isConnected = await this.client.testConnection();
      
      if (isConnected) {
        spinner.succeed('✅ AI service initialized successfully!');
        this.isInitialized = true;
        return true;
      } else {
        spinner.fail('❌ Failed to connect to Gemini API');
        displayWarning('Please check your API key and internet connection.');
        return false;
      }
    } catch (error) {
      displayError(new Error(`Failed to initialize AI service: ${error}`));
      return false;
    }
  }

  /**
   * Check if AI service is available
   */
  isAvailable(): boolean {
    return this.isInitialized && this.client !== null;
  }

  /**
   * Analyze a single file
   */
  async analyzeFile(
    file: FileNode, 
    analysisType: 'quality' | 'security' | 'general' = 'general'
  ): Promise<CodeAnalysisResult> {
    if (!this.isAvailable()) {
      return {
        success: false,
        error: 'AI service not initialized'
      };
    }

    if (!file.content || file.content === '[binary]' || file.content === '[unreadable]') {
      return {
        success: false,
        error: 'File content not available for analysis'
      };
    }

    const request: CodeAnalysisRequest = {
      code: file.content,
      language: file.language,
      filePath: file.path,
      analysisType
    };

    return await this.client!.analyzeCode(request);
  }

  /**
   * Analyze multiple files in batch
   */
  async analyzeFiles(
    files: FileNode[], 
    analysisType: 'quality' | 'security' | 'general' = 'general'
  ): Promise<Map<string, CodeAnalysisResult>> {
    const results = new Map<string, CodeAnalysisResult>();
    
    if (!this.isAvailable()) {
      displayWarning('AI service not available for file analysis');
      return results;
    }

    const spinner = ora(`Analyzing ${files.length} files with AI...`).start();
    let processed = 0;

    for (const file of files) {
      try {
        const result = await this.analyzeFile(file, analysisType);
        results.set(file.path, result);
        
        processed++;
        spinner.text = `Analyzing files with AI... ${processed}/${files.length}`;
        
        // Add small delay to avoid rate limiting
        await this.delay(100);
      } catch (error) {
        displayWarning(`Failed to analyze ${file.path}: ${error}`);
        results.set(file.path, {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    spinner.succeed(`✅ Analyzed ${processed} files with AI`);
    return results;
  }

  /**
   * Generate repository-level analysis
   */
  async analyzeRepository(digest: DigestOutput): Promise<RepositoryAnalysis | null> {
    if (!this.isAvailable()) {
      displayWarning('AI service not available for repository analysis');
      return null;
    }

    try {
      const spinner = ora('Generating AI-powered repository analysis...').start();

      // Prepare repository data for analysis
      const repositoryData = this.prepareRepositoryData(digest);
      
      const request: CodeAnalysisRequest = {
        code: repositoryData.sampleContent,
        analysisType: 'summary',
        ...repositoryData as any // Cast to include additional fields
      };

      const result = await this.client!.analyzeCode(request);
      
      if (result.success && result.analysis) {
        spinner.succeed('✅ Repository analysis completed');
        return result.analysis as unknown as RepositoryAnalysis;
      } else {
        spinner.fail('❌ Repository analysis failed');
        displayWarning(`Analysis error: ${result.error}`);
        return null;
      }
    } catch (error) {
      displayError(new Error(`Repository analysis failed: ${error}`));
      return null;
    }
  }

  /**
   * Generate AI-enhanced summary
   */
  async generateSummary(digest: DigestOutput): Promise<string | null> {
    const analysis = await this.analyzeRepository(digest);
    
    if (!analysis) {
      return null;
    }

    return analysis.summary;
  }

  /**
   * Get AI configuration
   */
  getConfig(): AIConfig | null {
    return this.config;
  }

  /**
   * Update AI configuration
   */
  async updateConfig(options: AIConfigOptions): Promise<boolean> {
    try {
      this.config = await AIConfigManager.getConfig(options);
      
      if (this.client && this.config) {
        this.client.updateConfig(this.config);
      }
      
      return true;
    } catch (error) {
      displayError(new Error(`Failed to update AI configuration: ${error}`));
      return false;
    }
  }

  /**
   * Prepare repository data for AI analysis
   */
  private prepareRepositoryData(digest: DigestOutput): any {
    const stats = digest.stats;
    
    // Get sample content from key files
    const sampleContent = this.extractSampleContent(digest);
    
    // Create file structure summary
    const fileStructure = this.createFileStructureSummary(digest);
    
    return {
      source: digest.metadata.source,
      totalFiles: stats.totalFiles.toString(),
      languages: Object.keys(stats.languageBreakdown).join(', '),
      totalSize: this.formatBytes(stats.totalSize),
      fileStructure,
      sampleContent
    };
  }

  /**
   * Extract sample content from important files
   */
  private extractSampleContent(digest: DigestOutput): string {
    // This would extract content from key files like README, package.json, main files, etc.
    // For now, return a placeholder
    return 'Sample content from key repository files...';
  }

  /**
   * Create file structure summary
   */
  private createFileStructureSummary(digest: DigestOutput): string {
    const stats = digest.stats;
    
    const summary = [
      `Total Files: ${stats.totalFiles}`,
      `Total Directories: ${stats.totalDirectories}`,
      `Languages: ${Object.keys(stats.languageBreakdown).join(', ')}`,
      `Size: ${this.formatBytes(stats.totalSize)}`
    ];

    return summary.join('\n');
  }

  /**
   * Format bytes for display
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  /**
   * Add delay for rate limiting
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.client = null;
    this.config = null;
    this.isInitialized = false;
  }
}