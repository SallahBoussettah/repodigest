import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import inquirer from 'inquirer';
import { AIConfig } from './analysis-types.js';
import { displayInfo, displayWarning, displayError } from '../utils/display.js';

export interface AIConfigOptions {
  apiKey?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
}

export class AIConfigManager {
  private static readonly CONFIG_DIR = path.join(os.homedir(), '.repodigest');
  private static readonly CONFIG_FILE = path.join(AIConfigManager.CONFIG_DIR, 'ai-config.json');
  private static readonly DEFAULT_CONFIG: AIConfig = {
    apiKey: '',
    model: 'gemini-2.5-flash',
    temperature: 0.1,
    maxTokens: 2048,
    timeout: 30000
  };

  /**
   * Get AI configuration from multiple sources (priority order):
   * 1. Command line options
   * 2. Environment variables
   * 3. Config file
   * 4. Interactive prompt
   * 5. Default values
   */
  static async getConfig(options: AIConfigOptions = {}): Promise<AIConfig> {
    const config = { ...AIConfigManager.DEFAULT_CONFIG };

    // 1. Load from config file
    const fileConfig = await AIConfigManager.loadConfigFile();
    if (fileConfig) {
      Object.assign(config, fileConfig);
    }

    // 2. Override with environment variables
    if (process.env.GEMINI_API_KEY) {
      config.apiKey = process.env.GEMINI_API_KEY;
    }
    if (process.env.GEMINI_MODEL) {
      config.model = process.env.GEMINI_MODEL;
    }
    if (process.env.GEMINI_TEMPERATURE) {
      config.temperature = parseFloat(process.env.GEMINI_TEMPERATURE);
    }
    if (process.env.GEMINI_MAX_TOKENS) {
      config.maxTokens = parseInt(process.env.GEMINI_MAX_TOKENS, 10);
    }
    if (process.env.GEMINI_TIMEOUT) {
      config.timeout = parseInt(process.env.GEMINI_TIMEOUT, 10);
    }

    // 3. Override with command line options
    if (options.apiKey) config.apiKey = options.apiKey;
    if (options.model) config.model = options.model;
    if (options.temperature !== undefined) config.temperature = options.temperature;
    if (options.maxTokens) config.maxTokens = options.maxTokens;
    if (options.timeout) config.timeout = options.timeout;

    // 4. If no API key found, prompt user or show instructions
    if (!config.apiKey) {
      config.apiKey = await AIConfigManager.promptForApiKey();
    }

    return config;
  }

  /**
   * Prompt user for API key interactively
   */
  static async promptForApiKey(): Promise<string> {
    displayInfo('🤖 Gemini API key is required for AI analysis features.');
    displayInfo('📝 You can get your API key from: https://makersuite.google.com/app/apikey');
    displayInfo('');

    const { provideNow } = await inquirer.prompt({
      type: 'confirm',
      name: 'provideNow',
      message: 'Would you like to provide your Gemini API key now?',
      default: true
    });

    if (!provideNow) {
      displayInfo('💡 You can provide the API key later using:');
      displayInfo('   • --gemini-api-key flag');
      displayInfo('   • GEMINI_API_KEY environment variable');
      displayInfo('   • Save it using: repodigest --save-ai-config');
      return '';
    }

    const { apiKey } = await inquirer.prompt({
      type: 'password',
      name: 'apiKey',
      message: '🔑 Enter your Gemini API key:',
      mask: '*',
      validate: (input: string) => {
        if (!input || input.trim().length === 0) {
          return 'API key cannot be empty';
        }
        if (!input.startsWith('AIza')) {
          return 'Gemini API keys typically start with "AIza"';
        }
        return true;
      }
    });

    const { saveKey } = await inquirer.prompt({
      type: 'confirm',
      name: 'saveKey',
      message: '💾 Would you like to save this API key for future use?',
      default: true
    });

    if (saveKey) {
      await AIConfigManager.saveApiKey(apiKey);
      displayInfo('✅ API key saved successfully!');
    }

    return apiKey;
  }

  /**
   * Save API key to config file
   */
  static async saveApiKey(apiKey: string): Promise<void> {
    try {
      await AIConfigManager.ensureConfigDir();

      const existingConfig = await AIConfigManager.loadConfigFile() || {};
      const newConfig = {
        ...existingConfig,
        apiKey,
        updatedAt: new Date().toISOString()
      };

      await fs.writeFile(
        AIConfigManager.CONFIG_FILE,
        JSON.stringify(newConfig, null, 2),
        'utf-8'
      );
    } catch (error) {
      displayError(new Error(`Failed to save API key: ${error}`));
      throw error;
    }
  }

  /**
   * Save complete AI configuration
   */
  static async saveConfig(config: AIConfig): Promise<void> {
    try {
      await AIConfigManager.ensureConfigDir();

      const configToSave = {
        ...config,
        updatedAt: new Date().toISOString()
      };

      await fs.writeFile(
        AIConfigManager.CONFIG_FILE,
        JSON.stringify(configToSave, null, 2),
        'utf-8'
      );

      displayInfo('✅ AI configuration saved successfully!');
    } catch (error) {
      displayError(new Error(`Failed to save configuration: ${error}`));
      throw error;
    }
  }

  /**
   * Load configuration from file
   */
  static async loadConfigFile(): Promise<AIConfig | null> {
    try {
      const configData = await fs.readFile(AIConfigManager.CONFIG_FILE, 'utf-8');
      return JSON.parse(configData);
    } catch (error) {
      // Config file doesn't exist or is invalid - this is normal
      return null;
    }
  }

  /**
   * Interactive configuration setup
   */
  static async interactiveSetup(): Promise<AIConfig> {
    displayInfo('🛠️  AI Configuration Setup');
    displayInfo('');

    // Get API key
    const apiKeyAnswer = await inquirer.prompt({
      type: 'password',
      name: 'apiKey',
      message: '🔑 Gemini API key:',
      mask: '*',
      validate: (input: string) => {
        if (!input || input.trim().length === 0) {
          return 'API key is required';
        }
        return true;
      }
    });

    // Get model
    const modelAnswer = await inquirer.prompt({
      type: 'list',
      name: 'model',
      message: '🤖 Choose Gemini model:',
      choices: [
        { name: 'Gemini 2.5 Flash (Recommended)', value: 'gemini-2.5-flash' },
        { name: 'Gemini 1.5 Pro', value: 'gemini-1.5-pro' },
        { name: 'Gemini 1.5 Flash', value: 'gemini-1.5-flash' }
      ],
      default: 'gemini-2.5-flash'
    });

    // Get temperature
    const temperatureAnswer = await inquirer.prompt({
      type: 'number',
      name: 'temperature',
      message: '🌡️  Temperature (0.0-1.0, lower = more focused):',
      default: 0.1,
      validate: (input: number | undefined) => {
        if (input === undefined || input < 0 || input > 1) {
          return 'Temperature must be between 0.0 and 1.0';
        }
        return true;
      }
    });

    // Get max tokens
    const maxTokensAnswer = await inquirer.prompt({
      type: 'number',
      name: 'maxTokens',
      message: '📝 Maximum tokens per response:',
      default: 2048,
      validate: (input: number | undefined) => {
        if (input === undefined || input < 100 || input > 8192) {
          return 'Max tokens must be between 100 and 8192';
        }
        return true;
      }
    });

    // Get timeout
    const timeoutAnswer = await inquirer.prompt({
      type: 'number',
      name: 'timeout',
      message: '⏱️  Request timeout (milliseconds):',
      default: 30000,
      validate: (input: number | undefined) => {
        if (input === undefined || input < 5000 || input > 120000) {
          return 'Timeout must be between 5000 and 120000 milliseconds';
        }
        return true;
      }
    });

    const config: AIConfig = {
      apiKey: apiKeyAnswer.apiKey,
      model: modelAnswer.model,
      temperature: temperatureAnswer.temperature,
      maxTokens: maxTokensAnswer.maxTokens,
      timeout: timeoutAnswer.timeout
    };

    const { saveConfig } = await inquirer.prompt({
      type: 'confirm',
      name: 'saveConfig',
      message: '💾 Save this configuration?',
      default: true
    });

    if (saveConfig) {
      await AIConfigManager.saveConfig(config);
    }

    return config;
  }

  /**
   * Show current configuration
   */
  static async showConfig(): Promise<void> {
    const config = await AIConfigManager.loadConfigFile();

    if (!config) {
      displayInfo('❌ No AI configuration found.');
      displayInfo('💡 Run with --setup-ai-config to configure AI settings.');
      return;
    }

    displayInfo('🤖 Current AI Configuration:');
    displayInfo('');
    displayInfo(`Model: ${config.model}`);
    displayInfo(`Temperature: ${config.temperature}`);
    displayInfo(`Max Tokens: ${config.maxTokens}`);
    displayInfo(`Timeout: ${config.timeout}ms`);
    displayInfo(`API Key: ${config.apiKey ? '***configured***' : '❌ not set'}`);

    if (config.updatedAt) {
      displayInfo(`Last Updated: ${new Date(config.updatedAt).toLocaleString()}`);
    }
  }

  /**
   * Clear saved configuration
   */
  static async clearConfig(): Promise<void> {
    try {
      await fs.unlink(AIConfigManager.CONFIG_FILE);
      displayInfo('✅ AI configuration cleared successfully!');
    } catch (error) {
      if ((error as any).code === 'ENOENT') {
        displayInfo('ℹ️  No configuration file to clear.');
      } else {
        displayError(new Error(`Failed to clear configuration: ${error}`));
        throw error;
      }
    }
  }

  /**
   * Ensure config directory exists
   */
  private static async ensureConfigDir(): Promise<void> {
    try {
      await fs.mkdir(AIConfigManager.CONFIG_DIR, { recursive: true });
    } catch (error) {
      // Directory might already exist, ignore error
    }
  }

  /**
   * Validate API key format
   */
  static validateApiKey(apiKey: string): boolean {
    return Boolean(apiKey && apiKey.trim().length > 0 && apiKey.startsWith('AIza'));
  }

  /**
   * Get configuration file path
   */
  static getConfigPath(): string {
    return AIConfigManager.CONFIG_FILE;
  }
}