module.exports = [{
  files: ["src/**/*.tsx", "src/**/*.ts"],
  languageOptions: {
    parser: require("@typescript-eslint/parser"),
    parserOptions: {
      ecmaFeatures: { jsx: true }
    }
  },
  plugins: {
    "react-hooks": require("eslint-plugin-react-hooks")
  },
  rules: {
    "react-hooks/rules-of-hooks": "error"
  }
}];
