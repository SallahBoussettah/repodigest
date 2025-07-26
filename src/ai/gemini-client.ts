import { GoogleGenerativeAI } from '@google/generative-ai';
import { 
  CodeAnalysisRequest, 
  CodeAnalysisResult, 
  AIConfig 
} from './analysis-types.js';
import { buildPrompt, getPromptForAnalysisType } from './prompt-templates.js';
import { displayWarning, displayError } from '../utils/display.js';

export class GeminiClient {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private config: AIConfig;

  constructor(config: AIConfig) {
    this.config = config;
    this.genAI = new GoogleGenerativeAI(config.apiKey);
    this.model = this.genAI.getGenerativeModel({ 
      model: config.model,
      generationConfig: {
        temperature: config.temperature,
        topK: 1,
        topP: 1,
        maxOutputTokens: config.maxTokens,
      }
    });
  }

  /**
   * Analyze code using Gemini AI
   */
  async analyzeCode(request: CodeAnalysisRequest): Promise<CodeAnalysisResult> {
    const startTime = Date.now();
    
    try {
      // Validate request
      if (!request.code || request.code.trim().length === 0) {
        return {
          success: false,
          error: 'No code provided for analysis'
        };
      }

      // Build prompt
      const prompt = this.buildAnalysisPrompt(request);
      
      // Make API call with timeout
      const result = await Promise.race([
        this.model.generateContent(prompt),
        this.createTimeoutPromise(this.config.timeout)
      ]);

      if (!result || !result.response) {
        return {
          success: false,
          error: 'No response from Gemini API'
        };
      }

      const responseText = result.response.text();
      const analysis = this.parseAnalysisResult(responseText, request.analysisType);
      
      return {
        success: true,
        analysis,
        tokensUsed: this.estimateTokens(prompt + responseText),
        processingTime: Date.now() - startTime
      };

    } catch (error) {
      displayError(error as Error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        processingTime: Date.now() - startTime
      };
    }
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const testRequest: CodeAnalysisRequest = {
        code: 'console.log("Hello, World!");',
        language: 'javascript',
        analysisType: 'general'
      };

      const result = await this.analyzeCode(testRequest);
      return result.success;
    } catch (error) {
      displayWarning(`API connection test failed: ${error}`);
      return false;
    }
  }

  /**
   * Build analysis prompt based on request
   */
  private buildAnalysisPrompt(request: CodeAnalysisRequest): string {
    const template = getPromptForAnalysisType(request.analysisType);
    
    const variables = {
      code: request.code,
      language: request.language || 'unknown',
      filePath: request.filePath || 'unknown'
    };

    // Add additional variables for repository summary
    if (request.analysisType === 'summary') {
      // These would be passed in the request for repository-level analysis
      Object.assign(variables, {
        source: (request as any).source || 'unknown',
        totalFiles: (request as any).totalFiles || '0',
        languages: (request as any).languages || 'unknown',
        totalSize: (request as any).totalSize || '0',
        fileStructure: (request as any).fileStructure || '',
        sampleContent: (request as any).sampleContent || ''
      });
    }

    return buildPrompt(template, variables);
  }

  /**
   * Parse AI response into structured result
   */
  private parseAnalysisResult(responseText: string, analysisType: string): any {
    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || 
                       responseText.match(/```\s*([\s\S]*?)\s*```/) ||
                       [null, responseText];
      
      if (!jsonMatch[1]) {
        // If no JSON block found, try to parse the entire response
        return JSON.parse(responseText);
      }

      const jsonStr = jsonMatch[1].trim();
      const parsed = JSON.parse(jsonStr);

      // Validate required fields based on analysis type
      this.validateAnalysisResult(parsed, analysisType);
      
      return parsed;
    } catch (error) {
      displayWarning(`Failed to parse AI response as JSON: ${error}`);
      
      // Return a fallback structure with the raw response
      return {
        summary: responseText,
        rawResponse: responseText,
        parseError: true
      };
    }
  }

  /**
   * Validate analysis result structure
   */
  private validateAnalysisResult(result: any, analysisType: string): void {
    if (!result.summary) {
      displayWarning('Analysis result missing summary field');
    }

    switch (analysisType) {
      case 'quality':
        if (!result.quality) {
          displayWarning('Quality analysis missing quality field');
        }
        break;
      case 'security':
        if (!result.security) {
          displayWarning('Security analysis missing security field');
        }
        break;
      case 'summary':
        if (!result.insights || !result.recommendations) {
          displayWarning('Repository summary missing insights or recommendations');
        }
        break;
    }
  }

  /**
   * Create timeout promise
   */
  private createTimeoutPromise(timeout: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Request timed out after ${timeout}ms`));
      }, timeout);
    });
  }

  /**
   * Estimate token count (rough approximation)
   */
  private estimateTokens(text: string): number {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  /**
   * Get current configuration
   */
  getConfig(): AIConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<AIConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Recreate model if API key or model changed
    if (newConfig.apiKey || newConfig.model) {
      this.genAI = new GoogleGenerativeAI(this.config.apiKey);
      this.model = this.genAI.getGenerativeModel({ 
        model: this.config.model,
        generationConfig: {
          temperature: this.config.temperature,
          topK: 1,
          topP: 1,
          maxOutputTokens: this.config.maxTokens,
        }
      });
    }
  }
}