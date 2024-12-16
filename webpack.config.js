const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const dotenv = require('dotenv');

module.exports = (env, argv) => {
  const envFile =
    argv.mode === 'production' ? '.env.production' : '.env.development';
  dotenv.config({ path: envFile });

  return {
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      publicPath: '/',
      filename: 'bundle.js',
      clean: true
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-react']
            }
          },
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './src/index.html',
        inject: 'body',
      }),
      new webpack.DefinePlugin({
        'process.env': JSON.stringify(process.env),
      }),
    ],
    devServer: {
      compress: true,
      port: 9000,
      hot: true,
      historyApiFallback: true,
    },
  };
};
