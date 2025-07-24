/**
 * Enhanced binary file extensions with better categorization
 */
export const BINARY_EXTENSIONS = new Set([
  // Images
  '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff', '.webp', '.ico', '.svg',
  '.psd', '.ai', '.sketch', '.fig', '.xcf', '.raw', '.cr2', '.nef',
  
  // Video
  '.mp4', '.mkv', '.mov', '.avi', '.wmv', '.flv', '.webm', '.m4v', '.mpg',
  
  // Audio
  '.mp3', '.wav', '.ogg', '.flac', '.aac', '.m4a', '.wma', '.opus',
  
  // Archives
  '.zip', '.rar', '.7z', '.tar', '.gz', '.bz2', '.xz', '.tgz', '.deb', '.rpm',
  
  // Executables
  '.exe', '.dll', '.so', '.dylib', '.app', '.dmg', '.pkg', '.msi',
  
  // Documents
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
  
  // Fonts
  '.ttf', '.otf', '.woff', '.woff2', '.eot',
  
  // Databases
  '.db', '.sqlite', '.sqlite3', '.mdb',
  
  // Other
  '.bin', '.dat', '.iso', '.img'
]);

/**
 * Programming language file extensions
 */
export const LANGUAGE_EXTENSIONS: Record<string, string[]> = {
  'JavaScript': ['.js', '.jsx', '.mjs', '.cjs'],
  'TypeScript': ['.ts', '.tsx', '.d.ts'],
  'Python': ['.py', '.pyw', '.pyx', '.pyi'],
  'Java': ['.java', '.class', '.jar'],
  'C++': ['.cpp', '.cxx', '.cc', '.c++', '.hpp', '.hxx', '.h++'],
  'C': ['.c', '.h'],
  'C#': ['.cs', '.csx'],
  'Go': ['.go'],
  'Rust': ['.rs'],
  'PHP': ['.php', '.phtml', '.php3', '.php4', '.php5'],
  'Ruby': ['.rb', '.rbw', '.rake', '.gemspec'],
  'Swift': ['.swift'],
  'Kotlin': ['.kt', '.kts'],
  'Scala': ['.scala', '.sc'],
  'HTML': ['.html', '.htm', '.xhtml'],
  'CSS': ['.css', '.scss', '.sass', '.less'],
  'SQL': ['.sql', '.mysql', '.pgsql'],
  'Shell': ['.sh', '.bash', '.zsh', '.fish'],
  'PowerShell': ['.ps1', '.psm1', '.psd1'],
  'Batch': ['.bat', '.cmd'],
  'Markdown': ['.md', '.markdown', '.mdown'],
  'JSON': ['.json', '.jsonc', '.json5'],
  'YAML': ['.yml', '.yaml'],
  'XML': ['.xml', '.xsd', '.xsl'],
  'Dockerfile': ['Dockerfile', '.dockerfile'],
  'Makefile': ['Makefile', 'makefile', '.mk'],
  'R': ['.r', '.R'],
  'Dart': ['.dart'],
  'Lua': ['.lua'],
  'Perl': ['.pl', '.pm'],
  'Haskell': ['.hs', '.lhs'],
  'Clojure': ['.clj', '.cljs', '.cljc'],
  'Elixir': ['.ex', '.exs'],
  'Erlang': ['.erl', '.hrl'],
  'F#': ['.fs', '.fsx', '.fsi'],
  'OCaml': ['.ml', '.mli'],
  'Vim': ['.vim', '.vimrc'],
  'LaTeX': ['.tex', '.cls', '.sty'],
  'TOML': ['.toml'],
  'INI': ['.ini', '.cfg', '.conf'],
  'Properties': ['.properties'],
  'Groovy': ['.groovy', '.gvy'],
  'Assembly': ['.asm', '.s'],
  'VHDL': ['.vhd', '.vhdl'],
  'Verilog': ['.v', '.vh'],
  'Solidity': ['.sol'],
  'GraphQL': ['.graphql', '.gql'],
  'Protobuf': ['.proto'],
  'Thrift': ['.thrift']
};

/**
 * Enhanced default ignore patterns
 */
export const DEFAULT_IGNORE_PATTERNS = [
  // Version control
  '.git/', '.svn/', '.hg/', '.bzr/',
  
  // Dependencies
  'node_modules/', 'bower_components/', 'vendor/', 'packages/',
  '.pnp/', '.pnp.js', '.yarn/', '.npm/',
  
  // Build outputs
  'dist/', 'build/', 'out/', 'lib/', 'target/', 'bin/',
  '.next/', '.nuxt/', '.vuepress/dist/', '.docusaurus/',
  
  // Caches
  '.cache/', '.turbo/', '.nx/', '.parcel-cache/',
  '.vite/', '.rollup.cache/', '.esbuild/',
  
  // IDE and editors
  '.vscode/', '.idea/', '*.sublime-*', '.history/',
  
  // OS files
  '.DS_Store', 'Thumbs.db', 'desktop.ini',
  
  // Logs and temp files
  '*.log', 'logs/', '*.tmp', '*.temp', '*.swp', '*.swo',
  
  // Environment and secrets
  '.env*', '*.key', '*.pem', '*.crt', '*.cert',
  
  // Test coverage
  'coverage/', '.nyc_output/', '.coverage',
  
  // Language specific
  '__pycache__/', '*.pyc', '*.pyo',
  '*.class', '*.jar', '*.war',
  '*.o', '*.obj', '*.exe', '*.dll', '*.so',
  
  // Package manager files
  'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml',
  'Pipfile.lock', 'poetry.lock', 'Gemfile.lock',
  
  // Documentation builds
  '_site/', 'site/', 'docs/_build/',
  
  // Mobile development
  '.android/', '.ios/', 'Pods/',
  
  // Game development
  'Library/', 'Temp/', 'Obj/', 'Builds/',
  
  // Archives and binaries
  '*.zip', '*.tar.gz', '*.rar', '*.7z',
  '*.pdf', '*.doc', '*.docx', '*.xls', '*.xlsx'
];

/**
 * File size limits
 */
export const SIZE_LIMITS = {
  DEFAULT_MAX_SIZE: 10 * 1024 * 1024, // 10MB
  WARNING_SIZE: 1 * 1024 * 1024,      // 1MB
  CHUNK_SIZE: 1024                     // 1KB for binary detection
};

/**
 * Output format templates
 */
export const OUTPUT_TEMPLATES = {
  SEPARATOR: '='.repeat(80),
  FILE_SEPARATOR: '-'.repeat(40),
  SECTION_SEPARATOR: '~'.repeat(60)
};