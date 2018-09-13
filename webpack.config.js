const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CleanPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const WebpackShellPlugin = require('./webpack-shell-plugin');

// var classPrfx = require('postcss-class-prefix');
// //var precss = require('precss');    // for scss support

// var postcss = () => {
//     return [ classPrfx('kyber-widget-', { ignore: [/some-class-/] }) ];
//   }

module.exports = env => {

    //const outputPath = env.chain ? 'dist/' + env.chain : '/src';
    const folder = env.folder? env.folder: ""
    const outputPath = `dist/${folder}`

    const timestamp = Date.now();

    let entry = {
        app: ['babel-polyfill', './js/client.js', './assets/css/app.scss']
    };
    let plugins = [
        new webpack.ProgressPlugin(),
        new ExtractTextPlugin(`[name].bundle.css?v=${timestamp}`, {
            allChunks: true
        }),        
        new HtmlWebpackPlugin({
            title: 'Wallet - kyber.network',
            filename: 'index.html',
            template: './app.html',
            favicon: './assets/img/favicon.png',
            inject: 'body'
        }),
        new webpack.HashedModuleIdsPlugin(),
        new CopyWebpackPlugin([
          { from: './assets/img/kyber-payment.png', to: '' }
        ])       

    ];
    if (env && env.build !== 'true') {
        //entry['libary'] = ['./assets/css/foundation-float.min.css', './assets/css/foundation-prototype.min.css']
        plugins.push(new webpack.DefinePlugin({
            //'env': JSON.stringify(env.chain),
            'process.env': {
                'logger': 'true'
            }
        }));
    } else {
        //entry['libary'] = ['./assets/css/foundation-float.min.css', './assets/css/foundation-prototype.min.css']
        plugins.push(
            new WebpackShellPlugin(
                {
                  onBuildEnd:[`FOLDER=${folder} node webpack-config-after.js`]
                }
              )
        )
        plugins.push(new CleanPlugin([outputPath+'/app.*', outputPath+'/libary.*']))
        plugins.push(new UglifyJsPlugin({
            uglifyOptions: {
                comments: false,
                compress: {
                    drop_console: true,
                    warnings: false
                }
            }
        }));
        plugins.push(
            new webpack.DefinePlugin({
                //'env': JSON.stringify(env.chain),
                'process.env': {
                    'NODE_ENV': JSON.stringify('production')                    
                }
            })
        );
        plugins.push(new CompressionPlugin({
                asset: `[path].gz[query]`,
                algorithm: 'gzip',
                test: /\.js$|\.css$|\.html$/,
                threshold: 10240,
                minRatio: 0.8
            })
        )
    }
    return {
        context: path.join(__dirname, 'src'),
        devtool: env && env.build !== 'true' ? 'inline-sourcemap' : false,
        entry: entry,
        output: {
            path: path.join(__dirname, outputPath),
            filename: `[name].min.js?v=${timestamp}`,
            publicPath: ''
        },
        module: {
            loaders: [{
                test: /\.jsx?$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel-loader',
                query: {
                    presets: ['react', 'es2015', 'stage-0'],
                    plugins: ['react-html-attrs', 'transform-decorators-legacy', 'transform-class-properties'],
                }
            },
                {
                    test: /\.css$/,
                    use: ['style-loader', 'css-loader'],
                },
                {
                    test: /\.scss$/,
                    exclude: /node_modules/,
                    loader: ExtractTextPlugin.extract({
                        fallback: 'style-loader',
                        use: [
                            {loader: 'css-loader', options: {minimize: true}},
                            'sass-loader'
                        ]
                    })
                },
                {
                    test: /\.(jpe?g|png|gif|svg|ttf)$/i,
                    use: [
                        {
                            loader: 'url-loader',
                            options: {
                                limit: 2000000
                            }
                        }
                    ]
                }
            ]
        },
        plugins: plugins
    }
};


