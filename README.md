# RepoDigest

🚀 **Advanced codebase analysis and LLM-ready digest generation**

RepoDigest is a powerful CLI tool that transforms any Git repository or local directory into intelligent, structured text digests optimized for Large Language Models. Built with TypeScript and enhanced with modern features for better developer experience.

## ✨ Key Features

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

### Global Installation

```bash
# Install from local project
npm install -g .

# Or install from npm (when published)
npm install -g repodigest
```

After installation, the `repodigest` command will be available globally.

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

### Enhanced Features

```bash
# Interactive mode with guided setup
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

### Markdown Format
Documentation-friendly format with:
- Formatted headers and sections
- Code blocks with syntax highlighting
- Statistics tables
- Clean directory structure

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
```

### Project Structure
```
src/
├── index.ts              # CLI entry point
├── main.ts              # Main orchestration
├── types.ts             # TypeScript interfaces
├── core/
│   ├── query-parser.ts      # Input parsing and validation
│   ├── repository-cloner.ts # Git repository handling
│   ├── file-processor.ts    # File system analysis
│   └── output-generator.ts  # Output formatting
└── utils/
    ├── constants.ts         # Configuration constants
    ├── display.ts          # Terminal UI helpers
    ├── file-analyzer.ts    # File analysis utilities
    ├── ignore-helper.ts    # Ignore pattern handling
    └── pattern-matcher.ts  # Glob pattern matching
```

## 🆚 Improvements Over Original

- **Enhanced Performance**: Fast-glob integration and optimized file processing
- **Multiple Formats**: JSON and Markdown output in addition to text
- **Better UX**: Interactive mode, progress indicators, and detailed error messages
- **Advanced Filtering**: Language filters, depth limits, and improved pattern matching
- **Rich Analytics**: Language breakdowns, processing statistics, and token estimation
- **Robust Error Handling**: Better validation and user-friendly error messages
- **Modern Architecture**: Clean separation of concerns and extensible design

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

---

**Built with ❤️ to help developers and AI collaborate more effectively**