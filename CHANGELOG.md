# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.3.0] - 2025-07-26

### Added
- **🎛️ Modular Help System**: Reorganized CLI help into separate commands
  - `repodigest examples` - Comprehensive usage examples
  - `repodigest ai-help` - AI features and configuration help
  - `repodigest options` - All command-line options with descriptions
  - `repodigest features` - Complete feature overview
  - Main help is now concise and user-friendly

### Enhanced
- **Better UX**: Reduced information overload in main help
- **Progressive Disclosure**: Users can find specific help when needed
- **Cleaner Error Messages**: Better guidance when missing arguments with all help command hints
- **Command Discovery**: All available commands now visible in main help and error messages

### Technical
- Fixed TypeScript compilation errors in CLI structure
- Improved code organization with proper function scoping
- Enhanced error message navigation with complete command references

## [1.2.0] - 2025-01-26

### Added
- **🤖 AI-Powered Analysis**: Complete Google Gemini AI integration
  - `--ai-analysis` flag for intelligent code quality analysis
  - `--ai-summary` flag for generating AI-powered repository summaries
  - `--security-scan` flag for AI-powered security vulnerability detection
  - `--setup-ai` interactive AI configuration setup with guided prompts
  - `--set-api-key` option to securely set and save Gemini API key
  - `--show-ai-config` to display current AI configuration status
  - `--reset-ai-config` to reset AI settings and clear saved data

- **🧠 Advanced AI Architecture**: 
  - Complete AI service layer with `AIService`, `GeminiClient`, and `AIConfigManager`
  - Intelligent prompt templates for different analysis types
  - Structured analysis types with comprehensive TypeScript interfaces
  - Multi-level configuration system (CLI → ENV → Config File → Interactive)
  - Automatic API key validation and connection testing
  - Rate limiting and timeout handling for API calls

- **📊 Enhanced Analysis Capabilities**:
  - Repository-level analysis with insights and recommendations
  - File-level code quality assessment with actionable suggestions
  - Security vulnerability detection with risk assessment
  - Token usage estimation and processing time tracking
  - Batch file analysis with progress tracking

- **⚙️ Configuration Management**:
  - Persistent AI configuration storage in `~/.repodigest/ai-config.json`
  - Interactive setup wizard with validation
  - Support for multiple Gemini models (2.5 Flash, 1.5 Pro, 1.5 Flash)
  - Configurable temperature, max tokens, and timeout settings
  - Environment variable support (`GEMINI_API_KEY`, `GEMINI_MODEL`, etc.)

- **📚 Comprehensive Documentation**:
  - Completely rewritten README.md with detailed feature descriptions
  - New `IMPROVEMENT_SPECIFICATIONS.md` with detailed implementation specs
  - New `repodigest-commands.md` with comprehensive CLI reference
  - Enhanced help system with emoji-rich formatting and categorized sections
  - Usage examples for all new AI features

- **🔧 Development Tools**:
  - Version management system with `scripts/version-bump.js`
  - Automated version bumping with changelog reminders
  - npm scripts for version management (`version:patch`, `version:minor`, `version:major`)

### Enhanced
- **CLI Interface**: 
  - Dramatically improved help system with visual formatting
  - Better command organization and descriptions
  - Enhanced error messages with actionable suggestions
  - Interactive mode improvements with AI configuration options

- **User Experience**:
  - Guided AI setup process with validation
  - Better progress indicators for AI operations
  - Comprehensive error handling with helpful suggestions
  - Improved output formatting for AI insights

- **Performance & Reliability**:
  - Robust error handling for AI API failures
  - Graceful degradation when AI services are unavailable
  - Connection testing and validation
  - Timeout and rate limiting protection

### Technical Improvements
- **Architecture**: 
  - Modular AI service architecture with clean separation of concerns
  - Comprehensive TypeScript interfaces for all AI-related types
  - Extensible prompt template system
  - Configuration management with multiple source priority

- **Dependencies**: 
  - Added `@google/generative-ai` v0.24.1 for Gemini integration
  - Added `dotenv` v17.2.0 for environment variable management
  - Enhanced existing dependencies for better AI integration

- **Code Quality**:
  - Enhanced TypeScript types and interfaces
  - Improved error handling and validation
  - Better separation of concerns in main orchestration
  - Comprehensive JSDoc documentation for AI components

### Files Added
- `src/ai/ai-service.ts` - Main AI service orchestrator
- `src/ai/gemini-client.ts` - Gemini API client implementation
- `src/ai/config-manager.ts` - AI configuration management
- `src/ai/analysis-types.ts` - TypeScript interfaces for AI analysis
- `src/ai/prompt-templates.ts` - AI prompt templates
- `scripts/version-bump.js` - Version management utility
- `IMPROVEMENT_SPECIFICATIONS.md` - Detailed implementation specifications
- `repodigest-commands.md` - Comprehensive CLI reference

## [1.0.0] - 2024-12-XX

### Added
- **Core Features**:
  - Multiple output formats (Text, JSON, Markdown)
  - Smart file analysis with binary detection
  - Language identification and filtering
  - Flexible glob pattern matching
  - Git integration with remote repository support
  - Token estimation for LLM usage planning
  
- **CLI Options**:
  - `--format` for output format selection
  - `--language` for programming language filtering
  - `--include-pattern` and `--exclude-pattern` for file filtering
  - `--max-size` for file size limits
  - `--depth` for directory traversal depth
  - `--branch` for Git branch selection
  - `--token` for GitHub authentication
  - `--interactive` for guided setup
  - `--compress` for JSON output compression
  - `--stats` for separate statistics generation

- **Dependencies**:
  - `commander` for CLI argument parsing
  - `chalk` for colored terminal output
  - `fast-glob` for efficient file pattern matching
  - `simple-git` for Git operations
  - `tiktoken` for token counting
  - `inquirer` for interactive prompts
  - `ora` for progress indicators
  - `boxen` and `figlet` for enhanced UI

### Technical
- Built with TypeScript for type safety
- Modular architecture with separated concerns
- ESM module support
- Comprehensive error handling
- Performance optimizations with fast-glob

---

## Version History Summary

- **v1.3.0**: Modular Help System & Enhanced UX
- **v1.2.0**: Major AI Integration & Enhanced Documentation
- **v1.0.0**: Initial Release with Core Features

## Contributing

When contributing to this project, please:
1. Update the version in `package.json`
2. Add your changes to the `[Unreleased]` section
3. Follow the changelog format for consistency
4. Include the date when releasing a new version