module.exports = {
  hooks: {
    "pre-commit": "lint-staged",
    "pre-push": "yarn && yarn lint && yarn test",
  },
}
