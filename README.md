# RepoDigest

🚀 **AI-Powered codebase analysis and intelligent digest generation**

RepoDigest is a powerful CLI tool that transforms any Git repository or local directory into intelligent, structured text digests optimized for Large Language Models. Now enhanced with **Google Gemini AI integration** for advanced code analysis, security scanning, and intelligent insights.

## ✨ Key Features

### 🤖 AI-Powered Analysis
- **Intelligent Code Analysis**: AI-powered code quality assessment with actionable insights
- **Security Vulnerability Detection**: Advanced security scanning using Gemini AI
- **Repository Summaries**: AI-generated comprehensive repository overviews
- **Smart Recommendations**: Context-aware suggestions for code improvements
- **Multi-Model Support**: Gemini 2.5 Flash, 1.5 Pro, and 1.5 Flash models

### 📊 Advanced Analytics
- **Multiple Output Formats**: Text, JSON, and Markdown formats
- **Smart File Analysis**: Advanced binary detection and language identification
- **Flexible Filtering**: Glob patterns, language filters, and size limits
- **Enhanced Performance**: Fast-glob integration and optimized processing
- **Interactive Mode**: Guided setup for complex configurations
- **Detailed Analytics**: Comprehensive statistics and language breakdowns
- **Git Integration**: Support for remote repositories with branch selection
- **Token Estimation**: Accurate token counting for LLM usage planning

## 🚀 Installation

### Prerequisites

- Node.js 18+ 
- Git (for remote repository cloning)
- **Gemini API Key** (for AI features) - Get yours at [Google AI Studio](https://makersuite.google.com/app/apikey)

### Global Installation

```bash
# Install from local project
npm install -g .

# Or install from npm (when published)
npm install -g repodigest
```

After installation, the `repodigest` command will be available globally.

## 🤖 AI Setup (Optional but Recommended)

To unlock the full potential of RepoDigest's AI features, you'll need a Google Gemini API key:

### Quick Setup
```bash
# Interactive AI configuration setup
repodigest --setup-ai

# Or set API key directly
repodigest --set-api-key YOUR_GEMINI_API_KEY

# Verify configuration
repodigest --show-ai-config
```

### Get Your API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Use it with RepoDigest via any of the methods above

### Environment Variable (Alternative)
```bash
export GEMINI_API_KEY=your_api_key_here
repodigest . --ai-analysis
```

## 📖 Usage

### Basic Examples

```bash
# Analyze current directory
repodigest .

# Analyze remote repository
repodigest https://github.com/facebook/react

# Analyze specific local path
repodigest /path/to/project
```

### Output Formats

```bash
# Generate JSON output
repodigest . --format json -o project.json

# Generate Markdown documentation
repodigest . --format markdown -o README-digest.md

# Output to stdout (pipe to other tools)
repodigest . -o - | less
```

### Advanced Filtering

```bash
# Filter by programming languages
repodigest . --language typescript python --format json

# Include only specific patterns
repodigest . --include-pattern "src/**/*.js" --include-pattern "**/*.md"

# Exclude test files and documentation
repodigest . --exclude-pattern "*.test.*" --exclude-pattern "docs/"

# Set maximum file size (50KB)
repodigest . --max-size 50000
```

### Repository Options

```bash
# Clone specific branch
repodigest https://github.com/user/repo --branch develop

# Access private repository
repodigest https://github.com/user/private-repo --token $GITHUB_TOKEN

# Limit directory traversal depth
repodigest . --depth 3
```

### 🤖 AI-Powered Analysis

```bash
# Setup AI configuration (one-time setup)
repodigest --setup-ai

# Basic AI analysis
repodigest . --ai-analysis --format json

# Generate comprehensive AI repository summary
repodigest . --ai-summary --format markdown -o ai-summary.md

# Security vulnerability scanning
repodigest . --security-scan --format json -o security-report.json

# Combined AI analysis (recommended)
repodigest . --ai-analysis --ai-summary --security-scan --format json -o complete-ai-analysis.json

# AI analysis with filtering
repodigest . --ai-analysis --language typescript javascript --exclude-pattern "*.test.*"

# Remote repository AI analysis
repodigest https://github.com/user/repo --ai-summary --format markdown

# Configuration management
repodigest --set-api-key YOUR_GEMINI_API_KEY    # Set API key
repodigest --show-ai-config                     # Show current config
repodigest --reset-ai-config                    # Reset AI settings
```

### Enhanced Features

```bash
# Interactive mode with guided setup (now includes AI config)
repodigest . --interactive

# Generate separate statistics file
repodigest . --stats --format json

# Compressed JSON output
repodigest . --format json --compress

# Include gitignored files
repodigest . --include-gitignored
```

## 🎛️ Command Line Options

| Option | Alias | Description | Default |
|--------|-------|-------------|---------|
| `--output <file>` | `-o` | Output file path (use "-" for stdout) | `digest.txt` |
| `--format <type>` | `-f` | Output format: text, json, markdown | `text` |
| `--max-size <bytes>` | `-s` | Maximum file size to process | `10485760` (10MB) |
| `--branch <name>` | `-b` | Git branch to clone | Default branch |
| `--token <token>` | `-t` | GitHub Personal Access Token | - |
| `--language <langs...>` | `-l` | Filter by programming languages | - |
| `--depth <number>` | `-d` | Maximum directory depth | Unlimited |
| `--include-pattern <patterns...>` | | Include files matching glob patterns | - |
| `--exclude-pattern <patterns...>` | | Exclude files matching glob patterns | - |
| `--include-gitignored` | | Include normally ignored files | `false` |
| `--compress` | | Compress JSON output | `false` |
| `--stats` | | Generate separate statistics file | `false` |
| `--interactive` | `-i` | Run in interactive mode | `false` |
| `--force` | | Overwrite existing files without confirmation | `false` |
| **AI Options** | | | |
| `--ai-analysis` | | Enable AI-powered code analysis | `false` |
| `--ai-summary` | | Generate AI repository summary | `false` |
| `--security-scan` | | Perform AI security vulnerability scan | `false` |
| `--setup-ai` | | Setup AI configuration interactively | - |
| `--set-api-key <key>` | | Set Gemini API key | - |
| `--show-ai-config` | | Show current AI configuration | - |
| `--reset-ai-config` | | Reset AI configuration | - |

## 📊 Output Formats

### Text Format (Default)
Human-readable format with clear sections:
- Repository summary and statistics
- Directory tree structure
- File contents with separators

### JSON Format
Structured data format including:
- Metadata and processing statistics
- Complete directory structure
- File contents with language detection
- Detailed analytics
- **AI insights and recommendations** (when AI analysis is enabled)
- **Security analysis results** (when security scan is enabled)

### Markdown Format
Documentation-friendly format with:
- Formatted headers and sections
- Code blocks with syntax highlighting
- Statistics tables
- Clean directory structure
- **AI-generated summaries and insights** (when AI features are enabled)

## 🔍 Language Detection

RepoDigest automatically detects programming languages for:

- **Web**: JavaScript, TypeScript, HTML, CSS, SCSS
- **Backend**: Python, Java, C++, C#, Go, Rust, PHP, Ruby
- **Mobile**: Swift, Kotlin, Dart
- **Data**: SQL, R, Python, Scala
- **Config**: JSON, YAML, XML, TOML, INI
- **Documentation**: Markdown, LaTeX
- **And many more...**

## 🚫 Smart Filtering

### Default Ignore Patterns
- Version control: `.git/`, `.svn/`
- Dependencies: `node_modules/`, `vendor/`, `__pycache__/`
- Build outputs: `dist/`, `build/`, `target/`
- IDE files: `.vscode/`, `.idea/`
- OS files: `.DS_Store`, `Thumbs.db`
- Logs and temp files: `*.log`, `*.tmp`

### Custom Ignore Files
- `.gitignore` (standard Git ignore)
- `.repodigestignore` (tool-specific ignore)
- `.npmignore`, `.dockerignore` (when relevant)

## 🌍 Environment Variables

| Variable | Description |
|----------|-------------|
| `GITHUB_TOKEN` | GitHub Personal Access Token for private repositories |
| `GEMINI_API_KEY` | Google Gemini API key for AI analysis features |
| `GEMINI_MODEL` | Gemini model to use (default: gemini-2.5-flash) |
| `GEMINI_TEMPERATURE` | AI temperature setting (0.0-1.0, default: 0.1) |
| `GEMINI_MAX_TOKENS` | Maximum tokens per AI response (default: 2048) |
| `GEMINI_TIMEOUT` | AI request timeout in milliseconds (default: 30000) |

## 🛠️ Development

### Setup
```bash
git clone <repository-url>
cd repodigest
npm install
```

### Development Commands
```bash
npm run dev          # Run with ts-node
npm run build        # Compile TypeScript
npm run clean        # Clean build directory
npm start            # Run built version

# Version management
npm run version:patch    # Bump patch version (1.2.0 → 1.2.1)
npm run version:minor    # Bump minor version (1.2.0 → 1.3.0)
npm run version:major    # Bump major version (1.2.0 → 2.0.0)
```

### Project Structure
```
src/
├── index.ts              # CLI entry point
├── main.ts              # Main orchestration
├── types.ts             # TypeScript interfaces
├── ai/                  # 🤖 AI Analysis System
│   ├── ai-service.ts        # Main AI service orchestrator
│   ├── gemini-client.ts     # Gemini API client
│   ├── config-manager.ts    # AI configuration management
│   ├── analysis-types.ts    # AI analysis type definitions
│   └── prompt-templates.ts  # AI prompt templates
├── core/
│   ├── query-parser.ts      # Input parsing and validation
│   ├── repository-cloner.ts # Git repository handling
│   ├── file-processor.ts    # File system analysis
│   └── output-generator.ts  # Output formatting
├── utils/
│   ├── constants.ts         # Configuration constants
│   ├── display.ts          # Terminal UI helpers
│   ├── file-analyzer.ts    # File analysis utilities
│   ├── ignore-helper.ts    # Ignore pattern handling
│   └── pattern-matcher.ts  # Glob pattern matching
└── scripts/
    └── version-bump.js      # Version management utility
```

## 🚀 What's New in v1.2.0

### 🤖 AI-Powered Intelligence
- **Google Gemini Integration**: Complete AI analysis system with multiple models
- **Smart Code Analysis**: AI-powered quality assessment with actionable insights
- **Security Scanning**: Advanced vulnerability detection using AI
- **Repository Summaries**: Intelligent overviews and recommendations
- **Interactive AI Setup**: Guided configuration with validation

### 🛠️ Enhanced Developer Experience
- **Version Management**: Automated version bumping with changelog integration
- **Improved CLI**: Rich help system with emoji formatting and better organization
- **Configuration Management**: Multi-source config system with persistent storage
- **Better Error Handling**: Graceful degradation and helpful error messages

### 📊 Advanced Analytics
- **AI Insights**: Context-aware recommendations and code quality metrics
- **Enhanced Output**: AI-enriched reports in all formats
- **Progress Tracking**: Real-time progress indicators for AI operations
- **Token Management**: Smart token usage estimation and rate limiting

## 🆚 Improvements Over Original

- **🤖 AI Integration**: Complete Google Gemini AI integration for intelligent analysis
- **🔒 Security Analysis**: AI-powered vulnerability detection and recommendations
- **📈 Enhanced Performance**: Fast-glob integration and optimized file processing
- **📊 Multiple Formats**: JSON and Markdown output in addition to text
- **🎛️ Better UX**: Interactive mode, progress indicators, and detailed error messages
- **🔍 Advanced Filtering**: Language filters, depth limits, and improved pattern matching
- **📊 Rich Analytics**: Language breakdowns, processing statistics, and token estimation
- **🛡️ Robust Error Handling**: Better validation and user-friendly error messages
- **🏗️ Modern Architecture**: Clean separation of concerns and extensible design
- **⚙️ Configuration Management**: Persistent AI settings with multiple configuration sources

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

---

## 🔗 Links & Resources

- **Documentation**: [Command Reference](repodigest-commands.md) | [Changelog](CHANGELOG.md)
- **AI Setup**: [Google AI Studio](https://makersuite.google.com/app/apikey)
- **Issues & Support**: [GitHub Issues](https://github.com/SallahBoussettah/repodigest/issues)

---

**Built with ❤️ to help developers and AI collaborate more effectively**

*Powered by Google Gemini AI for intelligent code analysis*