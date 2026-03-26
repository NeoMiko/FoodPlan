const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const {GenerateSW} = require('workbox-webpack-plugin');

const appDirectory = path.resolve(__dirname, '..');

const transpileModules = [
  path.resolve(appDirectory, 'reg-sw.js'),
  path.resolve(appDirectory, 'App.tsx'),
  path.resolve(appDirectory, 'src'),
];

module.exports = (_, argv) => {
  const isProd = argv.mode === 'production';

  return {
    context: appDirectory,
    entry: path.resolve(appDirectory, 'reg-sw.js'),
    output: {
      path: path.resolve(appDirectory, 'dist'),
      filename: isProd
        ? 'static/js/[name].[contenthash:8].js'
        : 'static/js/bundle.js',
      chunkFilename: isProd
        ? 'static/js/[name].[contenthash:8].chunk.js'
        : 'static/js/[name].chunk.js',
      publicPath: '/',
      clean: true,
    },
    resolve: {
      alias: {
        'react-native$': 'react-native-web',
      },
      extensions: [
        '.web.tsx',
        '.web.ts',
        '.web.jsx',
        '.web.js',
        '.tsx',
        '.ts',
        '.jsx',
        '.js',
        '.json',
      ],
    },
    module: {
      rules: [
        {
          test: /\.m?js$/,
          resolve: {
            fullySpecified: false,
          },
        },
        {
          test: /\.[jt]sx?$/,
          include: transpileModules,
          use: {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
              presets: ['module:@react-native/babel-preset'],
              plugins: ['react-native-web'],
            },
          },
        },
        {
          test: /\.(png|jpe?g|gif|svg)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'static/media/[name].[contenthash:8][ext]',
          },
        },
        {
          test: /\.(ttf|otf|woff2?)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'static/fonts/[name].[contenthash:8][ext]',
          },
        },
      ],
    },
    plugins: [
      new webpack.DefinePlugin({
        __DEV__: JSON.stringify(!isProd),
        'process.env.NODE_ENV': JSON.stringify(
          isProd ? 'production' : 'development',
        ),
      }),
      new HtmlWebpackPlugin({
        template: path.resolve(appDirectory, 'web/index.html'),
        inject: 'body',
        scriptLoading: 'defer',
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.resolve(appDirectory, 'public'),
            to: path.resolve(appDirectory, 'dist'),
            noErrorOnMissing: true,
            globOptions: {
              ignore: ['**/.DS_Store'],
            },
          },
        ],
      }),
      isProd &&
        new GenerateSW({
          swDest: 'service-worker.js',
          clientsClaim: true,
          skipWaiting: true,
          exclude: [/\.map$/],
          navigateFallback: '/index.html',
          runtimeCaching: [
            {
              urlPattern: ({request}) => request.mode === 'navigate',
              handler: 'NetworkFirst',
              options: {
                cacheName: 'pages',
              },
            },
            {
              urlPattern: ({request}) =>
                ['script', 'style', 'worker'].includes(request.destination),
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'static-resources',
              },
            },
            {
              urlPattern: ({request}) => request.destination === 'image',
              handler: 'CacheFirst',
              options: {
                cacheName: 'images',
                expiration: {
                  maxEntries: 60,
                  maxAgeSeconds: 30 * 24 * 60 * 60,
                },
              },
            },
          ],
        }),
    ].filter(Boolean),
    devServer: {
      port: 3000,
      hot: true,
      open: true,
      compress: true,
      historyApiFallback: true,
      static: {
        directory: path.resolve(appDirectory, 'public'),
      },
    },
    devtool: isProd ? 'source-map' : 'eval-source-map',
  };
};
