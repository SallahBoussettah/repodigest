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

### Development and Debugging
```bash
# Include gitignored files for complete analysis
repodigest . --include-gitignored --format json

# Comprehensive analysis with all features
repodigest . \
  --format markdown \
  --stats \
  --include-gitignored \
  --max-size 1000000 \
  --language javascript typescript python \
  --force \
  -o complete-analysis.md
```

## Environment Variables

```bash
# Set GitHub token via environment variable
export GITHUB_TOKEN=your_token_here
repodigest https://github.com/user/private-repo

# Use in CI/CD pipelines
GITHUB_TOKEN=${{ secrets.GITHUB_TOKEN }} repodigest https://github.com/org/repo
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
repodigest . --format markdown --stats -o PROJECT-DIGEST.md
```

### LLM Training Data Preparation
```bash
repodigest . --format json --compress --max-size 100000 -o training-data.json
```

### Code Review Preparation
```bash
repodigest . --language typescript javascript --exclude-pattern "*.test.*" --format markdown
```

### Repository Analysis
```bash
repodigest . --stats --format json -o analysis.json
```

### CI/CD Integration
```bash
repodigest . --format json --force -o build/digest.json
```