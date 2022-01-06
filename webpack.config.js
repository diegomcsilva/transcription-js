// Base - https://javascript.plainenglish.io/basic-webpack-configuration-9e9d066ccc14
const path = require('path');
const extract = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    clean: true
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
      serveIndex: true,
    },
    compress: true,
    port: 9000,
    // historyApiFallback: {
    //   index: 'index.html'
    // }
  },
  module: {
    rules: [{
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [{
            loader: extract.loader
          },
          {
            loader: 'css-loader'
          },
          {
            loader: 'sass-loader',
            options: {
              implementation: require('sass')
            }
          }
        ]
      },
      {
        //applying rule
        test: /\.(png|jpe?g|gif|svg)$/,
        use: [{
          //using file-loader
          loader: 'file-loader',
          options: {
            name: 'icons/[name].[ext]',
          }
        }]
      },
      {
        test: /\.(mp3)$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: 'audio/[name].[ext]',
          }
        }]
      },
    ]
  },
  plugins: [
    new extract({
      filename: 'bundle.css'
    }),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "index.html"),
          to: path.resolve(__dirname, 'dist')
        }
      ],
    }),
    
  ],
  mode: 'development'
}