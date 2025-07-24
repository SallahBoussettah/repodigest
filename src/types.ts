export interface CliOptions {
  output?: string;
  maxSize: string;
  branch?: string;
  includePattern?: string[];
  excludePattern?: string[];
  includeGitignored: boolean;
  token?: string;
  force: boolean;
  format: 'text' | 'json' | 'markdown';
  compress: boolean;
  stats: boolean;
  language?: string[];
  depth?: number;
  interactive: boolean;
}

export interface DigestionQuery {
  isRemote: boolean;
  source: string;
  repoPath: string;
  tempDir?: string;
  options: CliOptions;
  outputPath: string;
}

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
  content?: string;
  size: number;
  language?: string;
  encoding?: string;
  lineCount?: number;
  lastModified?: Date;
}

export interface DigestStats {
  totalFiles: number;
  totalDirectories: number;
  totalSize: number;
  textSize: number;
  binaryFiles: number;
  languageBreakdown: Record<string, number>;
  largestFiles: Array<{ path: string; size: number }>;
  estimatedTokens: number;
  processingTime: number;
}

export interface DigestOutput {
  content: string;
  stats: DigestStats;
  metadata: {
    source: string;
    branch?: string;
    timestamp: string;
    version: string;
    format: string;
  };
}