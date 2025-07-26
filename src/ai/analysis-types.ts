export interface CodeAnalysisRequest {
  code: string;
  language?: string;
  filePath?: string;
  analysisType: 'quality' | 'security' | 'summary' | 'general';
  options?: AnalysisOptions;
}

export interface AnalysisOptions {
  includeMetrics?: boolean;
  includeSuggestions?: boolean;
  securityLevel?: 'basic' | 'standard' | 'comprehensive';
  maxTokens?: number;
}

export interface CodeAnalysisResult {
  success: boolean;
  analysis?: AnalysisData;
  error?: string;
  tokensUsed?: number;
  processingTime?: number;
}

export interface AnalysisData {
  summary: string;
  quality?: QualityAnalysis;
  security?: SecurityAnalysis;
  suggestions?: Suggestion[];
  metrics?: CodeMetrics;
}

export interface QualityAnalysis {
  overallScore: number; // 0-100
  readability: QualityCategory;
  maintainability: QualityCategory;
  complexity: QualityCategory;
  bestPractices: QualityCategory;
}

export interface QualityCategory {
  score: number; // 0-100
  issues: string[];
  suggestions: string[];
}

export interface SecurityAnalysis {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  vulnerabilities: Vulnerability[];
  secrets: DetectedSecret[];
  recommendations: SecurityRecommendation[];
}

export interface Vulnerability {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location: CodeLocation;
  recommendation: string;
}

export interface DetectedSecret {
  type: 'api_key' | 'password' | 'token' | 'certificate' | 'other';
  description: string;
  location: CodeLocation;
  confidence: number; // 0-1
}

export interface SecurityRecommendation {
  category: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  actionable: boolean;
}

export interface CodeLocation {
  line: number;
  column?: number;
  snippet?: string;
}

export interface Suggestion {
  type: 'improvement' | 'refactor' | 'optimization' | 'fix';
  description: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  example?: string;
}

export interface CodeMetrics {
  linesOfCode: number;
  complexity: number;
  maintainabilityIndex: number;
  duplicateLines?: number;
  testCoverage?: number;
}

export interface AIConfig {
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  timeout: number;
  updatedAt?: string;
}

export interface RepositoryAnalysis {
  summary: string;
  insights: ProjectInsight[];
  recommendations: ProjectRecommendation[];
  metrics: ProjectMetrics;
  riskAssessment: RiskAssessment;
}

export interface ProjectInsight {
  category: 'architecture' | 'quality' | 'security' | 'performance' | 'maintainability';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  confidence: number; // 0-1
}

export interface ProjectRecommendation {
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  actionItems: string[];
}

export interface ProjectMetrics {
  totalFiles: number;
  totalLines: number;
  averageComplexity: number;
  languageDistribution: Record<string, number>;
  qualityScore: number;
  securityScore: number;
  maintainabilityScore: number;
}

export interface RiskAssessment {
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
  categories: {
    security: RiskCategory;
    maintainability: RiskCategory;
    performance: RiskCategory;
    scalability: RiskCategory;
  };
  criticalIssues: string[];
  recommendations: string[];
}

export interface RiskCategory {
  level: 'low' | 'medium' | 'high' | 'critical';
  score: number; // 0-100
  factors: string[];
  mitigation: string[];
}