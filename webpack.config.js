const path = require("path")

const { replace, toUpper } = require("ramda")
const nodeExternals = require("webpack-node-externals")

const currentPackageName = process.env.LERNA_PACKAGE_NAME

const filename = `${currentPackageName}.js`
const minifiedFilename = `${currentPackageName}.min.js`
const globalName = replace(/^./, toUpper, currentPackageName)

const packageRoot = process.cwd()
const entry = path.join(packageRoot, "src/index.js")

const targets = {
  commonjs: "commonjs",
  umd: "umd",
  umdMinified: "umdMinified",
  module: "module",
}

const outputPathsByTarget = {
  [targets.commonjs]: "lib",
  [targets.umd]: "dist",
  [targets.umdMinified]: "dist",
  [targets.module]: "es",
}

const libraryTargetsByTarget = {
  [targets.commonjs]: "commonjs2",
  [targets.umd]: "umd",
  [targets.umdMinified]: "umd",
  // TODO: Modify once webpack@5 is released and supports `libraryTarget: 'module'`.
  [targets.module]: "umd",
}

module.exports = Object.values(targets).map(target => ({
  mode: "production",
  entry,
  externals: [
    nodeExternals({
      additionalModuleDirs: [path.join(process.env.LERNA_ROOT_PATH, "node_modules")],
    }),
  ],
  output: {
    path: path.join(packageRoot, outputPathsByTarget[target]),
    filename: target === targets.umdMinified ? minifiedFilename : filename,
    library: globalName,
    libraryTarget: libraryTargetsByTarget[target],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            configFile: path.join(process.env.LERNA_ROOT_PATH, "babel.config.js"),
          },
        },
      },
    ],
  },
  optimization: {
    minimize: target === targets.umdMinified,
  },
}))
