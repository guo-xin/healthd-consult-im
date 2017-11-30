var webpack = require('webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var HtmlWebpackPlugin = require("html-webpack-plugin");
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var path = require('path');

module.exports = {
    entry: {
        'app': './src/javascript/client/entry'
    },
    output: {
        path: path.resolve(__dirname, '../chronicd-server-web/im'),
        filename: 'js/[name][hash:5].js'
    },
    resolve: {
        extensions: ['', '.js', '.jsx'],
        root: [
            path.resolve('./src')
        ]
    },
    module: {
        loaders: [
            {
                test: /\.js|jsx$/,
                loader: 'babel',
                exclude: /node_modules/,
                query: {
                    presets: ['es2015', 'react'],
                    plugins: ['transform-object-assign']
                }
            },
            {
                test: /\.less$/,
                loader: ExtractTextPlugin.extract(['css', 'postcss', 'less'], {publicPath: '../'})
            },
            {
                test: /\.(png|jpe?g|gif|svg)(\?\S*)?$/,
                loader: 'file-loader',
                query: {
                    name: 'images/[name].[ext]?[hash]'
                }
            },
            {
                test: /\.svg|woff|eot|ttf$/,
                loader: require.resolve('file-loader') + '?name=font/[name].[ext]'
            }
        ]
    },
    postcss: [require('autoprefixer')()],
    plugins: [
        new webpack.ProvidePlugin({
            'Promise': 'es6-promise',
            'fetch': 'isomorphic-fetch'
        }),
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production')
            }
        }),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        }),
        new CopyWebpackPlugin([
            {from: 'src/vendor', to: 'js'}
        ]),
        new ExtractTextPlugin("./css/app.[hash:5].css"),
        new HtmlWebpackPlugin({
            title: "咨询详情",
            filename: 'index.html',
            template: 'index.ejs',
            inject: false,
            isProduction: false
        })
    ]
};
