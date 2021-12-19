module.exports = {
  env: {
    browser: true,
    commonjs: true,
    node: true,
    es2021: true,
    mocha: true,
    jest: true,
  },
  plugins: ["@typescript-eslint"],
  extends: [
    "standard",
    "plugin:prettier/recommended",
    "plugin:node/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    "node/no-unsupported-features/es-syntax": [
      "error",
      { ignores: ["modules"] },
    ],
    "node/no-missing-import": [
      "error",
      {
        allowModules: [],
        resolvePaths: ["typechain"],
        tryExtensions: [".ts", ".tsx", ".js", ".json", ".node"],
      },
    ],
    "no-use-before-define": "off",
    "@typescript-eslint/no-use-before-define": "warn",
  },
};
