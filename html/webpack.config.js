const path = require('path');
const CAPSDeployPlugin = require('./deploy-plugin');

module.exports = {
  entry: './src/caps.js',
  mode: 'production',
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
        test: /\.s[ac]ss$/i,
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
    new CAPSDeployPlugin()
  ],
  output: {
    filename: 'caps.min.js',
    path: path.resolve(__dirname, 'js'),
  },
};
