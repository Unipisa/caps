const path = require('path');
const CAPSDeployPlugin = require('./deploy-plugin');
const webpack = require('webpack');

module.exports = {
  entry: [ 'babel-polyfill', './src/caps.js' ],
  mode: 'production',
  performance: {
    hints: false,
    maxEntrypointSize: 3000000,
    maxAssetSize: 3000000
  },
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
      },
    ],
  },
  resolve: {
    extensions: ['*', '.js', '.jsx', '.scss', '.css', '.ts', '.tsx'],
    fallback: { 
      "assert": require.resolve("assert") 
    }
  },
  plugins: [
    new CAPSDeployPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_DEBUG': JSON.stringify(process.env.NODE_DEBUG),
    })
  ],
  output: {
    filename: 'caps.min.js',
    path: path.resolve(__dirname, 'js'),
  },
};
