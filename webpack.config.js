const path                          = require('path');
const ForkTsCheckerWebpackPlugin    = require('fork-ts-checker-webpack-plugin');
const HtmlWebpackPlugin             = require('html-webpack-plugin');
const CopyPlugin                    = require('copy-webpack-plugin');

module.exports = {
    entry: [
        'regenerator-runtime/runtime',
        './src/index.ts'
    ],
    stats: 'errors-only',
    module: {
        rules: [
            {
                test: /\.(ts|js)?$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-env", "@babel/preset-typescript"],
                    },
                },
            },
            {
                test: /\.less$/i,
                use: [
                    // compiles Less to CSS
                    "style-loader",
                    "css-loader",
                    "less-loader",
                ],
            },
        ],
    },

    resolve: {
        extensions: ['.ts', '.js'],
    },

    devtool: 'inline-source-map',
    devServer: {
            static: {
                directory: path.join(__dirname, 'dist'),
                watch: true,
            },
            watchFiles: ['src/**/*.ts'],
            compress: true,
            port: 4000,
    },

    plugins: [
        new ForkTsCheckerWebpackPlugin(),
        new HtmlWebpackPlugin({
            //template: 'src/index.html'
        }),
        new CopyPlugin({
            patterns: [
                { from: "src/assets", to: "assets" },
            ],
        })
    ],

    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
    },
};