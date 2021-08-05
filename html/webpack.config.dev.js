const path = require('path');
const CopyWebpackOutputPlugin = require('copy-webpack-output-plugin');

module.exports = {
  entry: './src/caps.js',
  mode: 'development',
  devtool: 'eval-source-map',
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
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
    extensions: ['*', '.js', '.jsx'],
  },
  plugins: [
    new CopyWebpackOutputPlugin([
      {
        src: './js/*.js',
        dest: '../app/webroot/js'
      }
    ])
  ],
  output: {
    filename: 'caps.js',
    path: path.resolve(__dirname, './js'),
  },
};
