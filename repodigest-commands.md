# RepoDigest CLI Commands Reference

## Installation

```bash
# Install globally from local project
npm install -g .

# Or install from npm registry (when published)
npm install -g repodigest
```

## Basic Usage

```bash
# Show help
repodigest --help
repodigest -h

# Show version
repodigest --version
repodigest -V

# Analyze current directory (default text format)
repodigest .

# Analyze remote repository
repodigest https://github.com/facebook/react

# Analyze specific local path
repodigest /path/to/project
```

## Help Commands

```bash
# Show comprehensive usage examples
repodigest examples

# Show AI features and configuration help
repodigest ai-help

# Show all command-line options with descriptions
repodigest options

# Show all available features and capabilities
repodigest features
```

## Output Options

```bash
# Specify output file
repodigest . --output my-digest.txt
repodigest . -o my-digest.txt

# Output to stdout (pipe to other commands)
repodigest . --output -
repodigest . -o -

# Different output formats
repodigest . --format text        # Human-readable (default)
repodigest . --format json        # Structured JSON
repodigest . --format markdown    # Documentation-friendly
repodigest . -f json

# Compress JSON output (removes formatting)
repodigest . --format json --compress

# Generate separate statistics file
repodigest . --stats
```

## Processing Options

```bash
# Set maximum file size (in bytes)
repodigest . --max-size 50000     # 50KB limit
repodigest . -s 1048576           # 1MB limit

# Limit directory traversal depth
repodigest . --depth 3
repodigest . -d 2

# Filter by programming languages
repodigest . --language javascript typescript
repodigest . -l python java cpp
```

## Repository Options

```bash
# Clone specific branch
repodigest https://github.com/user/repo --branch develop
repodigest https://github.com/user/repo -b main

# Access private repository with token
repodigest https://github.com/user/private-repo --token YOUR_TOKEN
repodigest https://github.com/user/private-repo -t $GITHUB_TOKEN
```

## Pattern Matching

```bash
# Include specific file patterns
repodigest . --include-pattern "src/**/*.js"
repodigest . --include-pattern "**/*.ts" --include-pattern "**/*.md"

# Exclude specific file patterns
repodigest . --exclude-pattern "*.test.*"
repodigest . --exclude-pattern "node_modules/" --exclude-pattern "dist/"

# Include files normally ignored by .gitignore
repodigest . --include-gitignored
```

## AI-Powered Analysis

```bash
# Setup AI configuration (one-time setup)
repodigest --setup-ai

# Set Gemini API key directly
repodigest --set-api-key YOUR_GEMINI_API_KEY

# Show current AI configuration
repodigest --show-ai-config

# Reset AI configuration
repodigest --reset-ai-config

# Enable AI-powered code analysis
repodigest . --ai-analysis

# Generate AI repository summary
repodigest . --ai-summary

# Perform AI security vulnerability scanning
repodigest . --security-scan

# Combined AI analysis
repodigest . --ai-analysis --ai-summary --security-scan

# AI analysis with specific output format
repodigest . --ai-analysis --format json -o ai-report.json

# AI summary as markdown documentation
repodigest . --ai-summary --format markdown -o ai-summary.md

# Security scan for specific languages
repodigest . --security-scan --language javascript typescript python
```

## Behavior Options

```bash
# Overwrite existing output file without confirmation
repodigest . --force
repodigest . -f

# Run in interactive mode with guided setup
repodigest . --interactive
repodigest . -i
```

## Combined Examples

### Basic Analysis
```bash
# Simple text analysis of current directory
repodigest .

# Analyze remote repo and save to custom file
repodigest https://github.com/expressjs/express -o express-analysis.txt
```

### Format-Specific Examples
```bash
# Generate JSON output with statistics
repodigest . --format json --stats -o project.json

# Create markdown documentation
repodigest . --format markdown -o project-digest.md

# Compressed JSON for programmatic use
repodigest . --format json --compress -o compact.json
```

### Advanced Filtering
```bash
# Only TypeScript and Python files
repodigest . --language typescript python --format json

# Include only source files, exclude tests
repodigest . --include-pattern "src/**/*" --exclude-pattern "**/*.test.*"

# Analyze specific directory with size limit
repodigest ./backend --max-size 100000 --depth 5
```

### Repository Analysis
```bash
# Analyze specific branch of remote repo
repodigest https://github.com/facebook/react --branch main --format markdown

# Private repo with token and filtering
repodigest https://github.com/company/private-repo \
  --token $GITHUB_TOKEN \
  --language javascript typescript \
  --exclude-pattern "node_modules/" \
  --format json

# Large repo with performance optimizations
repodigest https://github.com/microsoft/vscode \
  --max-size 50000 \
  --depth 3 \
  --exclude-pattern "out/" --exclude-pattern "extensions/" \
  --format markdown
```

### Interactive and Batch Processing
```bash
# Interactive mode for complex setup
repodigest . --interactive

# Batch processing with force overwrite
repodigest . --format json --stats --force -o batch-output.json

# Pipeline processing
repodigest . -o - | grep "function" | wc -l
```

### AI-Powered Analysis Examples
```bash
# Basic AI code analysis
repodigest . --ai-analysis --format json -o ai-analysis.json

# AI repository summary as documentation
repodigest . --ai-summary --format markdown -o AI-SUMMARY.md

# Security vulnerability scan
repodigest . --security-scan --language javascript typescript --format json

# Complete AI analysis suite
repodigest . --ai-analysis --ai-summary --security-scan --format json -o complete-ai-report.json

# AI analysis of remote repository
repodigest https://github.com/user/repo --ai-summary --format markdown

# AI analysis with filtering
repodigest . --ai-analysis --language typescript --exclude-pattern "*.test.*" --format json
```

### Development and Debugging
```bash
# Include gitignored files for complete analysis
repodigest . --include-gitignored --format json

# Comprehensive analysis with all features including AI
repodigest . \
  --format json \
  --ai-analysis \
  --ai-summary \
  --security-scan \
  --stats \
  --include-gitignored \
  --max-size 1000000 \
  --language javascript typescript python \
  --force \
  -o complete-analysis.json
```

## Environment Variables

```bash
# GitHub token for private repositories
export GITHUB_TOKEN=your_token_here
repodigest https://github.com/user/private-repo

# Gemini API key for AI analysis
export GEMINI_API_KEY=your_gemini_api_key
repodigest . --ai-analysis

# Gemini model selection
export GEMINI_MODEL=gemini-2.5-flash
repodigest . --ai-summary

# AI temperature setting (0.0-1.0)
export GEMINI_TEMPERATURE=0.1
repodigest . --ai-analysis

# Maximum tokens per AI response
export GEMINI_MAX_TOKENS=2048
repodigest . --ai-summary

# AI request timeout (milliseconds)
export GEMINI_TIMEOUT=30000
repodigest . --security-scan

# Use in CI/CD pipelines
GITHUB_TOKEN=${{ secrets.GITHUB_TOKEN }} \
GEMINI_API_KEY=${{ secrets.GEMINI_API_KEY }} \
repodigest https://github.com/org/repo --ai-analysis
```

## Output Piping Examples

```bash
# Pipe to pager
repodigest . -o - | less

# Search in output
repodigest . -o - | grep "TODO"

# Count lines of specific language
repodigest . --language javascript -o - | wc -l

# Save and display simultaneously
repodigest . -o project.txt && cat project.txt
```

## Error Handling

```bash
# Force overwrite existing files
repodigest . -o existing-file.txt --force

# Handle large repositories with limits
repodigest https://github.com/large/repo --max-size 10000 --depth 2

# Validate before processing
repodigest . --interactive  # Use interactive mode to validate settings
```

## Performance Tips

```bash
# For large repositories, use size limits and depth restrictions
repodigest large-repo --max-size 50000 --depth 3

# Use specific language filters to reduce processing
repodigest . --language typescript --exclude-pattern "node_modules/"

# Generate compressed JSON for faster processing
repodigest . --format json --compress

# Use exclude patterns to skip unnecessary directories
repodigest . --exclude-pattern "dist/" --exclude-pattern "build/" --exclude-pattern "coverage/"
```

## Common Use Cases

### Documentation Generation
```bash
# Basic documentation
repodigest . --format markdown --stats -o PROJECT-DIGEST.md

# AI-enhanced documentation
repodigest . --ai-summary --format markdown -o AI-ENHANCED-DOCS.md
```

### LLM Training Data Preparation
```bash
# Basic training data
repodigest . --format json --compress --max-size 100000 -o training-data.json

# AI-analyzed training data
repodigest . --ai-analysis --format json --compress -o ai-training-data.json
```

### Code Review Preparation
```bash
# Basic code review
repodigest . --language typescript javascript --exclude-pattern "*.test.*" --format markdown

# AI-powered code review
repodigest . --ai-analysis --security-scan --language typescript javascript --format json
```

### Repository Analysis
```bash
# Basic analysis
repodigest . --stats --format json -o analysis.json

# AI-powered analysis
repodigest . --ai-analysis --ai-summary --stats --format json -o ai-analysis.json
```

### Security Auditing
```bash
# AI security scan
repodigest . --security-scan --format json -o security-report.json

# Comprehensive security analysis
repodigest . --security-scan --language javascript typescript python java --format json
```

### CI/CD Integration
```bash
# Basic CI integration
repodigest . --format json --force -o build/digest.json

# AI-enhanced CI integration
repodigest . --ai-analysis --security-scan --format json --force -o build/ai-digest.json
```

## Getting Started with AI Features

### First-Time Setup
```bash
# 1. Get your Gemini API key from https://makersuite.google.com/app/apikey
# 2. Run interactive setup
repodigest --setup-ai

# 3. Test AI features
repodigest . --ai-summary --format markdown
```

### Quick AI Analysis
```bash
# Set API key and analyze
repodigest --set-api-key YOUR_API_KEY
repodigest . --ai-analysis --format json -o quick-ai-analysis.json
```