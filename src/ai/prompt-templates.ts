export const ANALYSIS_PROMPTS = {
  QUALITY_ANALYSIS: `
Analyze the following {language} code for quality metrics and provide a comprehensive assessment:

**Code:**
\`\`\`{language}
{code}
\`\`\`

**File Path:** {filePath}

Please analyze this code and provide a detailed assessment in the following JSON format:

\`\`\`json
{
  "summary": "Brief overall assessment of the code quality",
  "quality": {
    "overallScore": 85,
    "readability": {
      "score": 90,
      "issues": ["Variable names could be more descriptive", "Missing comments for complex logic"],
      "suggestions": ["Add JSDoc comments", "Use more descriptive variable names"]
    },
    "maintainability": {
      "score": 80,
      "issues": ["Function is too long", "High cyclomatic complexity"],
      "suggestions": ["Break down large functions", "Extract reusable components"]
    },
    "complexity": {
      "score": 75,
      "issues": ["Nested loops increase complexity", "Multiple return statements"],
      "suggestions": ["Simplify conditional logic", "Use early returns"]
    },
    "bestPractices": {
      "score": 85,
      "issues": ["Missing error handling", "No input validation"],
      "suggestions": ["Add try-catch blocks", "Validate function parameters"]
    }
  },
  "suggestions": [
    {
      "type": "improvement",
      "description": "Add comprehensive error handling",
      "priority": "high",
      "category": "reliability",
      "example": "try { ... } catch (error) { ... }"
    }
  ],
  "metrics": {
    "linesOfCode": 45,
    "complexity": 8,
    "maintainabilityIndex": 75
  }
}
\`\`\`

Focus on:
- Code readability and clarity
- Maintainability and modularity
- Performance considerations
- Best practices for {language}
- Potential improvements
- Security considerations
`,

  SECURITY_ANALYSIS: `
Perform a comprehensive security analysis of the following {language} code:

**Code:**
\`\`\`{language}
{code}
\`\`\`

**File Path:** {filePath}

Analyze for security vulnerabilities, exposed secrets, and security best practices. Provide results in this JSON format:

\`\`\`json
{
  "summary": "Security assessment summary",
  "security": {
    "riskLevel": "medium",
    "vulnerabilities": [
      {
        "type": "SQL Injection",
        "severity": "high",
        "description": "User input is directly concatenated into SQL query",
        "location": {
          "line": 15,
          "snippet": "SELECT * FROM users WHERE id = " + userId"
        },
        "recommendation": "Use parameterized queries or prepared statements"
      }
    ],
    "secrets": [
      {
        "type": "api_key",
        "description": "Potential API key found in code",
        "location": {
          "line": 8,
          "snippet": "const apiKey = 'sk-1234567890abcdef'"
        },
        "confidence": 0.9
      }
    ],
    "recommendations": [
      {
        "category": "Input Validation",
        "description": "Implement proper input sanitization",
        "priority": "high",
        "actionable": true
      }
    ]
  }
}
\`\`\`

Look for:
- SQL injection vulnerabilities
- XSS vulnerabilities
- Authentication/authorization issues
- Exposed secrets (API keys, passwords, tokens)
- Insecure data handling
- Missing security headers
- Unsafe deserialization
- Path traversal vulnerabilities
`,

  REPOSITORY_SUMMARY: `
Analyze this repository structure and content to provide a comprehensive project summary:

**Repository Information:**
- Source: {source}
- Total Files: {totalFiles}
- Languages: {languages}
- Size: {totalSize}

**Key Files and Structure:**
{fileStructure}

**Sample Code Content:**
{sampleContent}

Provide a comprehensive analysis in this JSON format:

\`\`\`json
{
  "summary": "Comprehensive project overview and purpose",
  "insights": [
    {
      "category": "architecture",
      "title": "Well-structured modular design",
      "description": "The project follows a clean architecture pattern with clear separation of concerns",
      "impact": "high",
      "confidence": 0.9
    }
  ],
  "recommendations": [
    {
      "title": "Improve test coverage",
      "description": "Add comprehensive unit and integration tests",
      "category": "quality",
      "priority": "high",
      "effort": "medium",
      "impact": "high",
      "actionItems": [
        "Set up testing framework",
        "Write unit tests for core modules",
        "Add integration tests"
      ]
    }
  ],
  "metrics": {
    "totalFiles": 150,
    "totalLines": 15000,
    "averageComplexity": 6.5,
    "languageDistribution": {
      "TypeScript": 60,
      "JavaScript": 25,
      "CSS": 10,
      "HTML": 5
    },
    "qualityScore": 85,
    "securityScore": 78,
    "maintainabilityScore": 82
  },
  "riskAssessment": {
    "overallRisk": "medium",
    "categories": {
      "security": {
        "level": "medium",
        "score": 75,
        "factors": ["Missing input validation", "Potential XSS vulnerabilities"],
        "mitigation": ["Implement input sanitization", "Add security headers"]
      },
      "maintainability": {
        "level": "low",
        "score": 85,
        "factors": ["Good code structure", "Clear documentation"],
        "mitigation": ["Continue following best practices"]
      }
    },
    "criticalIssues": [
      "No authentication mechanism",
      "Database credentials in code"
    ],
    "recommendations": [
      "Implement proper authentication",
      "Move secrets to environment variables"
    ]
  }
}
\`\`\`

Focus on:
- Project purpose and functionality
- Architecture and design patterns
- Code quality and maintainability
- Security posture
- Performance considerations
- Development practices
- Areas for improvement
- Technology stack assessment
`,

  GENERAL_ANALYSIS: `
Analyze the following {language} code and provide general insights:

**Code:**
\`\`\`{language}
{code}
\`\`\`

**File Path:** {filePath}

Provide a balanced analysis covering quality, security, and general observations in JSON format:

\`\`\`json
{
  "summary": "General code analysis summary",
  "quality": {
    "overallScore": 80,
    "readability": {
      "score": 85,
      "issues": ["Some variable names could be clearer"],
      "suggestions": ["Use more descriptive names"]
    },
    "maintainability": {
      "score": 75,
      "issues": ["Function could be broken down"],
      "suggestions": ["Extract smaller functions"]
    }
  },
  "suggestions": [
    {
      "type": "improvement",
      "description": "Add error handling",
      "priority": "medium",
      "category": "reliability"
    }
  ]
}
\`\`\`

Provide practical, actionable insights for improving the code.
`
};

export function buildPrompt(
  template: string, 
  variables: Record<string, string>
): string {
  let prompt = template;
  
  for (const [key, value] of Object.entries(variables)) {
    const placeholder = `{${key}}`;
    prompt = prompt.replace(new RegExp(placeholder, 'g'), value);
  }
  
  return prompt;
}

export function getPromptForAnalysisType(
  analysisType: 'quality' | 'security' | 'summary' | 'general'
): string {
  switch (analysisType) {
    case 'quality':
      return ANALYSIS_PROMPTS.QUALITY_ANALYSIS;
    case 'security':
      return ANALYSIS_PROMPTS.SECURITY_ANALYSIS;
    case 'summary':
      return ANALYSIS_PROMPTS.REPOSITORY_SUMMARY;
    case 'general':
    default:
      return ANALYSIS_PROMPTS.GENERAL_ANALYSIS;
  }
}