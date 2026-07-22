module.exports = [
  {
    ignores: [
      "**/mochawesome-report/**",
      "**/coverage/**",
      "**/node_modules/**"
    ]
  },
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: {
        require: "readonly",
        module: "readonly",
        __dirname: "readonly",
        process: "readonly",
        console: "readonly",
        describe: "readonly",
        it: "readonly",
        before: "readonly",
        after: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        window: "readonly",
        document: "readonly",
        setTimeout: "readonly",
        showScreen: "readonly",
        renderedSongs: "readonly",
        closePlayerModal: "readonly",
        fetch: "readonly",
        FormData: "readonly",
        FileReader: "readonly",
        confirm: "readonly",
        MutationObserver: "readonly",
        Image: "readonly",
        File: "readonly",
        URL: "readonly",
        Blob: "readonly"
      }
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "error"
    }
  },
  {
    files: ["public/**/*.js", "src/**/*.js", "src/**/*.jsx", "app/**/*.js", "shared/**/*.js", "web/**/*.js", "load-test.js"],
    languageOptions: {
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    rules: {
      "no-unused-vars": "off"
    }
  }
];
