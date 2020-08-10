module.exports = {
  "**/*.js": [
    "prettier --ignore-path .gitignore --write",
    "eslint --cache --ignore-path .gitignore --fix",
  ],
  "**/*.{mdx,md,html,json}": ["prettier --ignore-path .gitignore --write"],
}
