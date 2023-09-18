const path = require('path');
const CAPSDeployPlugin = require('./deploy-plugin');

module.exports = {
  entry: [ 'babel-polyfill', './src/caps.js' ],
  mode: 'development',
  devtool: 'eval-source-map',
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
  resolve: {
    extensions: ['*', '.js', '.jsx', '.scss', '.css', '.ts', '.tsx'],
  },
  plugins: [
    new CAPSDeployPlugin()
  ],
  output: {
    filename: 'caps.js',
    path: path.resolve(__dirname, './js'),
  },
};
