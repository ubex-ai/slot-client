const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const webpack = require('webpack');

const config = {};
const hostname = '0.0.0.0';
const port = '8080';

module.exports = function (env, argv) {

    // Prod config
    if (argv.mode === 'production') {
        config.optimization = {
            minimizer: [new TerserPlugin({
                terserOptions: {
                    compress: {
                        drop_console: true
                    }
                }
            })],
        };
        config.entry = './src/index.js';
        config.output = {
            path: path.resolve(__dirname, 'dist'),
            filename: 'slot.js'
        };
    }

    // Dev config
    if (argv.mode === 'development') {
        config.devtool = 'source-map';
        config.watch = true;
        config.watchOptions = {
            ignored: ['node_modules']
        };
        config.entry = {
            'slot': './src/index.js',
            'test.build': 'mocha-loader!./tests/index.js',
        };
        config.output = {
            path: path.resolve(__dirname, 'dist'),
            filename: '[name].js',
            publicPath: 'http://' + hostname + ':' + port + '/tests'
        };
        config.devServer = {
            host: hostname,
            port: port,
            open: false,
            openPage: 'webpack-dev-server/tests/'
        }
    }

    config.module = {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    };

    // Env vars inject
    config.plugins = [
        new webpack.DefinePlugin({
            'UBEX_URL': JSON.stringify(argv.mode !== 'production' ? '10.100.0.41:3000' : 'pixel.ubex.io/collect')
        })
    ];

    return config;
};