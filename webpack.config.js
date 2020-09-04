const path = require('path');
// const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');

// Webpack use (entry:) file as starting point, and gather all it dependencies into one "bundle"
// (output:) file. During this process, Webpack, at first, preprocess all dependencies and
// the (entry:) point file itself with loaders (use:), if the (test:) regex match for
// the their extensions. Resulted intermediate (pre-processed) files Webpack holds im memory,
// and only after all the (test:) matched files are already preprocessed, the Webpack start
// gathering the final (output:) bundle file, so the (output:) folder will contain only one
// final file (filename:)
module.exports = {
  mode: 'development',
  entry: { app: path.resolve(__dirname, 'src/app.js') },
  // resolve: {
  //   alias: {
  //     './app': path.resolve(__dirname, 'app'),
  //   },
  //   extensions: ['.js'],
  // },
  /* the default [target] is is ['web'], and it is not a mandatory of specifying this property for
  the browser bundling, but the node bundle, it mus be specified explicitly */
  // target: 'node-webkit',
  /* !!!note!!!
  The packages such 'express' are using lazy dependencies loading, it means that some of
  dependencies may be loaded by condition (if...) and the WebPack did not know include this
  dependencies to bundle or not, therefore it can't bundle such a libraries properly. So the
  exclusion of node_modules from bundling is obvious, especially, according to the fact that
  it is a server and all those dependencies are still accessible directly from node_modules
  folder and bundling of them will be pretty redundant. The recommended way of avoid of bundling
  an 'express' and so on, is to use the [webpack-node-externals] package. This package creates an
  [externals] function that force Webpack to ignore node_modules when bundling.
  The [externals] prop itself is the mechanism of 'telling' to Webpack of what dependencies must be
  'externalized' that is, not included to bundle, but sucked-in as an external module. As require,
  or as import, dependant of what you need (what you command in externalization function). */
  externals: [nodeExternals()],
  output: {
    filename: '[name].dist.js',
    path: path.resolve(__dirname, 'public'), // [dist] stands for 'distribution'
    // publicPath: '/',
  },
  devtool: 'source-map',
};
