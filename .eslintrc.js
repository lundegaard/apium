const confusingBrowserGlobals = require("confusing-browser-globals")

module.exports = {
  parser: "babel-eslint",
  root: true,
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    jest: true,
    node: true,
  },
  extends: ["airbnb-base", "prettier"],
  globals: { fetch: true },
  rules: {
    "import/order": ["error", { "newlines-between": "always" }],
    "sort-imports": [
      "error",
      {
        ignoreCase: false,
        ignoreDeclarationSort: true,
        ignoreMemberSort: false,
        memberSyntaxSortOrder: ["none", "all", "multiple", "single"],
      },
    ],
    "padding-line-between-statements": [
      "error",
      {
        blankLine: "always",
        prev: ["block", "block-like", "export", "import", "multiline-expression"],
        next: "*",
      },
      {
        blankLine: "always",
        prev: "*",
        next: ["block", "block-like", "export", "import", "return", "throw"],
      },
      {
        blankLine: "any",
        prev: ["export", "import"],
        next: ["export", "import"],
      },
      {
        blankLine: "never",
        prev: "case",
        next: "*",
      },
    ],
    "no-console": ["error", { allow: ["warn", "error", "info"] }],
    "import/no-extraneous-dependencies": [
      "error",
      {
        devDependencies: [
          "packages/**/*.test.js",
          "packages/**/*.config.js",
          "*.config.js",
          "testsSetup.js",
          ".eslintrc.js",
        ],
      },
    ],
    // https://github.com/airbnb/javascript/blob/master/packages/eslint-config-airbnb-base/rules/variables.js#L19
    "no-restricted-globals": ["error", "origin", "isFinite", "isNaN"].concat(
      confusingBrowserGlobals,
    ),
  },
}
