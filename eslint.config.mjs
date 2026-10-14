export default [
  {
    ignores: [".next/**", "node_modules/**", "data/**", "public/**", ".git/**"]
  },
  {
    files: ["app/**/*.js", "components/**/*.js", "lib/**/*.js", "scripts/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    rules: {
      "no-console": "off",
      "no-unused-vars": "off"
    }
  }
];
