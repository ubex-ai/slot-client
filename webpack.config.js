const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = function(env, argv) {
	const devMode = argv.mode !== 'production';
	const hostname = '0.0.0.0';
	const port = '8080';
	const stageApi = 'https://ssp.ubex.io/v1/slot';
	const analyticApi = 'https://pixel.ubex.io/v2/slot/';

	return {
		entry: [
			path.resolve(__dirname, 'node_modules/safeframe/src/js/lib/base.js'),
			path.resolve(__dirname, 'node_modules/safeframe/src/js/lib/boot.js'),
			path.resolve(__dirname, 'node_modules/safeframe/src/js/host/host.js'),
			'intersection-observer',
			'./src/index.js',
		],
		plugins: [
			new BundleAnalyzerPlugin({
				openAnalyzer: !devMode,
			}),
			new HtmlWebpackPlugin({
				inject: true, // Inject all files that are generated by webpack, e.gx. bundle.js
				template: 'index.html',
			}),
			new webpack.DefinePlugin({
				PIXEL_URL: JSON.stringify('pixel.ubex.io'),
				API_URL: JSON.stringify(stageApi),
				ANALYTIC_URL: JSON.stringify(analyticApi),
				DEV_MODE: devMode,
				IMPRESSED_SHOW_SECONDS: devMode ? 15 : 60,
				NOT_IMPRESSED_SHOW_SECONDS: devMode ? 30 : 180,
				GET_AFTER_CLICK: devMode ? 5 : 15,
			}),
			new webpack.ProvidePlugin({
			       Promise: 'core-js/features/promise'
	        })
		],
		output: {
			path: path.resolve(__dirname, 'dist'),
			filename: devMode ? 'slot_test.js' : 'slot.js',
		},
		module: {
			rules: [
				{
					test: /\.html$/,
					use: 'html-loader',
				},
				{
					test: /\.?js$/,
					exclude: /(node_modules|bower_components)/,

					use: {
						loader: 'babel-loader',
					},
				},
			],
		},
		devServer: {
			host: hostname,
			port,
			open: false,
		},
		optimization: {
			minimizer: [
				new TerserPlugin({
					terserOptions: {
						compress: !devMode,
						ie8: false,
						safari10: false,
						warnings: false,
						keep_fnames: !devMode,
						mangle: !devMode,
						output: {
							comments: false,
							ascii_only: true,
						},
					},
					cache: false,
					sourceMap: devMode,
				}),
			],
			nodeEnv: devMode ? 'development' : 'production',
			usedExports: true,
			sideEffects: false,
		},
		name: 'ubex-slotus',
		resolve: {
			alias: {
				react: 'preact-compat',
				'react-dom': 'preact-compat',
			},
		},
	};
};
