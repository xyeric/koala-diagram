const path = require('path');
const webpack = require('webpack');
const { CheckerPlugin } = require('awesome-typescript-loader');

const mainConfig = {
  mode: 'production',
  target: 'electron-main',
  entry: {
    main: path.resolve(__dirname, '../src/main/index.ts'),
  },
  output: {
    filename: '[name].js',
    publicPath: 'dist',
    libraryTarget: 'commonjs2',
    path: path.resolve(__dirname, '../dist'),
  },
  module: {
    rules: [{
      test: /\.tsx?$/,
      use: 'awesome-typescript-loader',
      exclude: /node_modules/
    }]
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js', '.json', '.node' ]
  },
  node: {
    __dirname: process.env.NODE_ENV !== 'production',
    __filename: process.env.NODE_ENV !== 'production'
  },
  devServer: {
    hot: true,
    inline: true,
  },
  plugins: [
    new CheckerPlugin(),
    new webpack.NoEmitOnErrorsPlugin()
  ],
};

/**
 * Adjust mainConfig for development settings
 */
if (process.env.NODE_ENV !== 'production') {
  mainConfig.plugins.push(
    new webpack.DefinePlugin({
      '__static': `"${path.join(__dirname, '../static').replace(/\\/g, '\\\\')}"`
    })
  )
}

/**
 * Adjust mainConfig for production settings
 */
if (process.env.NODE_ENV === 'production') {
  mainConfig.plugins.push(
    // new MinifyPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"'
    })
  )
}

module.exports = mainConfig;