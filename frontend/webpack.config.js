const path = require('path');
const CAPSDeployPlugin = require('./deploy-plugin');

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
    extensions: ['*', '.js', '.jsx', '.scss', '.css'],
  },
  plugins: [
    new CAPSDeployPlugin()
  ],
  output: {
    filename: 'caps.min.js',
    path: path.resolve(__dirname, 'js'),
  },
};
