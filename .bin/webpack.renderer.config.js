const path = require('path');
const webpack = require('webpack');
// const nodeExternals = require('webpack-node-externals');
const MinifyPlugin = require("babel-minify-webpack-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CheckerPlugin } = require('awesome-typescript-loader');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const { dependencies } = require('../package.json');

let whiteListedModules = ['vue'];

const rendererConfig = {
  mode: 'production',
  target: 'electron-renderer',
  entry: {
    renderer: path.resolve(__dirname, '../src/renderer/index.tsx'),
  },
  output: {
    filename: '[name].js',
    libraryTarget: 'commonjs2',
    path: path.resolve(__dirname, '../dist')
  },
  module: {
    rules: [{
      test: /\.tsx?$/,
      use: 'awesome-typescript-loader',
      exclude: /node_modules/
    }, {
      test: /\.module\.scss$/,
      use: [{
        loader: 'style-loader',
        options: JSON.stringify({
          esModule: true
        }),
      }, {
        loader: 'css-modules-typescript-loader'
      }, {
        loader: 'css-loader',
        options: {
          modules: {
            mode: 'local',
            localIdentName: '[name]__[local]__[hash:base64:5]'
          },
          sourceMap: true,
          esModule: true
        }
      }, {
        loader: 'sass-loader'
      }],
      exclude: /node_modules/
    }, {
      test: /\.css$/,
      use: [ 'style-loader', 'css-loader' ]
    }, {
      test: /\.ttf$/,
      use: [ 'file-loader' ]
    }]
  },
  resolve: {
    alias: {
      '@': path.join(__dirname, '../src/renderer'),
    },
    extensions: ['.js', '.ts', '.tsx', '.json', '.css', '.scss', '.node']
  },
  // externals: [
  //   ...Object.keys(dependencies || {}).filter(d => !whiteListedModules.includes(d))
  // ],
  node: {
    __dirname: process.env.NODE_ENV !== 'production',
    __filename: process.env.NODE_ENV !== 'production',
  },
  devServer: {
    hot: true,
    inline: true,
  },
  devtool: '#cheap-module-eval-source-map',
  plugins: [
    new CheckerPlugin(),
    new MonacoWebpackPlugin(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.resolve(__dirname, '../src/index.ejs'),
      templateParameters(compilation, assets, options) {
        return {
          compilation: compilation,
          webpack: compilation.getStats().toJson(),
          webpackConfig: compilation.options,
          htmlWebpackPlugin: {
            files: assets,
            options: options
          },
          process,
        };
      },
      minify: {
        collapseWhitespace: true,
        removeAttributeQuotes: true,
        removeComments: true
      },
      nodeModules: process.env.NODE_ENV !== 'production'
        ? path.resolve(__dirname, '../node_modules')
        : false
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin()
  ],
};

if (process.env.NODE_ENV !== 'production') {
  rendererConfig.plugins.push(
    new webpack.DefinePlugin({
      '__static': `"${path.join(__dirname, '../dist').replace(/\\/g, '\\\\')}"`
    })
  )
}
/**
 * Adjust rendererConfig for production settings
 */
if (process.env.NODE_ENV === 'production') {
  rendererConfig.devtool = '';

  rendererConfig.plugins.push(
    // ne MinifyPlugin(),
    // new CopyWebpackPlugin([
    //   {
    //     from: path.join(__dirname, '../static'),
    //     to: path.join(__dirname, '../dist/electron/static'),
    //     ignore: ['.*']
    //   }
    // ]),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"'
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    })
  );
}

module.exports = rendererConfig;