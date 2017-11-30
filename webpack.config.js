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
        path: path.resolve(__dirname, 'dist'),
        filename: 'js/[name].js'
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
            'Promise': 'es6-promise', // Thanks Aaron (https://gist.github.com/Couto/b29676dd1ab8714a818f#gistcomment-1584602)
            'fetch': 'isomorphic-fetch'
        }),
        new CopyWebpackPlugin([
            {from: 'src/vendor', to: 'js'}
        ]),
        new ExtractTextPlugin("css/app.css"),
        new HtmlWebpackPlugin({
            title: "对话详情",
            filename: 'index.html',
            template: 'index.ejs',
            inject: false,
            isProduction: false
        })
    ],
    devServer: {
        proxy: {
            '/chronicd-server-api/v1/*': {
                //target: "http://192.168.11.40:8080/chronicd-server-api",
                target: "https://test.healthd-consult.healthdoc.cn",
                secure: false,
                changeOrigin: true
            }
        }
    }
};
