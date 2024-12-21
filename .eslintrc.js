module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: 'tsconfig.json',
        tsconfigRootDir: __dirname,
        sourceType: 'module'
    },
    plugins: ['@typescript-eslint/eslint-plugin'],
    extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended'
    ],
    root: true,
    env: {
        node: true,
        jest: true,
    },
    ignorePatterns: ['.eslintrc.js'],
    rules: {
        '@typescript-eslint/interface-name-prefix': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': ['warn'],
        'prettier/prettier': [
          'warn',
          {
              printWidth: 120,            // Maximum line length before wrapping
              tabWidth: 4,                // Number of spaces per indentation level
              useTabs: false,             // Indent with spaces instead of tabs
              semi: true,                 // Use semicolons at the end of statements
              singleQuote: true,          // Use single quotes instead of double quotes
              trailingComma: 'none',      // No trailing commas
              bracketSpacing: true,       // Add spaces inside object literal braces
              arrowParens: 'avoid',       // Always include parentheses around arrow function arguments
              endOfLine: 'auto',          // Maintain existing line endings (for cross-platform compatibility)
              quoteProps: 'consistent',   // Consistently quote object properties either all or none
              bracketSameLine: false,     // Keep the closing bracket of objects or arrays on a new line
              proseWrap: "never"          // Prevents wrapping prose (like in Markdown)
          }
      ]
    }
  };
