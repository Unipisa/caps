const path = require('path');
const CAPSDeployPlugin = require('./deploy-plugin');
const webpack = require('webpack');
const htmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: [ 'babel-polyfill', './src/caps.js' ],
  mode: 'development',
  devtool: 'inline-source-map',
  target: 'web',
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript']
          }
        }
      },
      {
        test: /\.(s[ac]ss|css)$/i,
        use: [
          "style-loader",
          "css-loader",
          "sass-loader",
        ],
      }
    ],
  },
  devServer: {
    static: {
      directory: path.join(__dirname, '/dev-webroot'),
    },
    compress: true,
    port: 9000,
    watchFiles: ['src/**/*'],
    hot: true,
    // liveReload: true,
    historyApiFallback: {
      index: 'index.html'
    },
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
    },
    proxy: [
        {
          context: ['/api'],
          target: 'http://localhost:3000',
          // secure: false,
          // changeOrigin: true,
          // pathRewrite: { '^/api': '' },
        }
    ]
  },
  resolve: {
    extensions: ['*', '.js', '.jsx', '.scss', '.css', '.ts', '.tsx', '.html'],
    fallback: { 
      "assert": require.resolve("assert") 
    }
  },
  plugins: [
    new CAPSDeployPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_DEBUG': JSON.stringify(process.env.NODE_DEBUG),
    }),
    // new htmlWebpackPlugin({
    //   template: path.resolve(__dirname, 'index.html'),
    //   filename: 'index.dev.html',
    //   inject: true,
    //   minify: false,
    // }),
  ],
  output: {
    filename: 'caps.js',
    path: path.resolve(__dirname, 'js'),
    publicPath: '/js'
  },
};
