const path = require('path');
const webpack = require('webpack');
//const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CleanPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const CompressionPlugin = require('compression-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const WebpackShellPlugin = require('./webpack-shell-plugin');
//const ThemesGeneratorPlugin = require('themes-switch/ThemesGeneratorPlugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");


//const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin')



// var classPrfx = require('postcss-class-prefix');
// //var precss = require('precss');    // for scss support

// var postcss = () => {
//     return [ classPrfx('kyber-widget-', { ignore: [/some-class-/] }) ];
//   }

function recursiveIssuer(m) {
    if (m.issuer) {
        return recursiveIssuer(m.issuer);
    } else if (m.name) {
        return m.name;
    } else {
        return false;
    }
}

//module.exports = env => {
var getConfig =  env => {
    //console.log(env)
    //const outputPath = env.chain ? 'dist/' + env.chain : '/src';
    const folder = env.folder ? env.folder : ""
    const outputPath = `dist/${folder}`

    const timestamp = Date.now();

    let entry = {
        app: ['babel-polyfill', path.resolve(__dirname, 'src/js/client.js'), path.resolve(__dirname, 'src/assets/css/app.scss')],
        // css: path.resolve(__dirname, ),
        //themes:  path.resolve(__dirname, '/assets/css/themes')
    };
    let plugins = [
        new webpack.ProgressPlugin(),
        // new ExtractTextPlugin(`[name].bundle.css?v=${timestamp}`, {
        //     allChunks: true
        // }),        
        new HtmlWebpackPlugin({
            title: 'Wallet - kyber.network',
            filename: 'index.html',
            template: './app.html',
            favicon: './assets/img/favicon.png',
            inject: 'body'
        }),
        new MiniCssExtractPlugin({
            filename: "[name].css",
        })
        // new webpack.HashedModuleIdsPlugin(),
        // new CopyWebpackPlugin([
        //   { from: './assets/img/kyber-payment.png', to: '' }
        // ])       

    ];
   // if (env && env.logger === 'true') {
        //entry['libary'] = ['./assets/css/foundation-float.min.css', './assets/css/foundation-prototype.min.css']
        // plugins.push(new webpack.DefinePlugin({
        //     //'env': JSON.stringify(env.chain),
        //     'process.env': {
        //         'logger': 'true'
        //     }
        // }));
        
    //}
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
        plugins.push(new CleanPlugin([outputPath + '/app.*', outputPath + '/libary.*']))
        // plugins.push(new UglifyJsPlugin({
        //     uglifyOptions: {
        //         comments: false,
        //         compress: {
        //             drop_console: true,
        //             warnings: false
        //         }
        //     }
        // }));
        // plugins.push(
        //     new webpack.DefinePlugin({
        //         //'env': JSON.stringify(env.chain),
        //         'process.env': {
        //             'NODE_ENV': JSON.stringify('production')                    
        //         }
        //     })
        // );
        // plugins.push(new CompressionPlugin({
        //         asset: `[path].gz[query]`,
        //         algorithm: 'gzip',
        //         test: /\.js$|\.css$|\.html$/,
        //         threshold: 10240,
        //         minRatio: 0.8
        //     })
        // )
    }
    return {
        context: path.join(__dirname, 'src'),
        devtool: env && env.build !== 'true' ? 'inline-sourcemap' : false,
        mode: env.build !== 'true' ? 'development' : 'production',
        entry: entry,
        optimization: {
            // splitChunks: {
            //     cacheGroups: {
            //         themesStyles: {
            //             name: 'themes',
            //             test: (m, c, entry = 'themes') => m.constructor.name === 'CssModule' && recursiveIssuer(m) === entry,
            //             chunks: 'all',
            //             enforce: true
            //         }
            //     }
            // },
            minimizer: [
                new TerserPlugin({
                    parallel: true,
                    //comments: false,
                    terserOptions: {
                      ecma: 6,
                      compress: {
                        drop_console: true,
                        warnings: false
                        }
                    }                  
                  }),
        
            ]
        },
        // optimization: {
        //     splitChunks: {
        //         cacheGroups: {
        //             cssStyles: {
        //                 name: 'css',
        //                 test: (m, c, entry = 'foo') => m.constructor.name === 'CssModule' && recursiveIssuer(m) === entry,
        //                 chunks: 'all',
        //                 enforce: true
        //             }
        //         }
        //     }
        // },
        output: {
            path: path.join(__dirname, outputPath),
            filename: `[name].min.js?v=${timestamp}`,
            publicPath: ''
        },
        module: {
            rules: [
                {
                    test: /\.jsx?$/,
                    exclude: /(node_modules|bower_components)/,
                    loader: 'babel-loader',
                    query: {
                        presets: ['react', 'es2015', 'stage-0'],
                        plugins: ['react-html-attrs', 'transform-decorators-legacy', 'transform-class-properties'],
                    }
                },
                {
                    test: /\.(css|sass|scss)$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        {
                            loader: 'css-loader',
                            options: {
                                importLoaders: 2,
                                sourceMap: true
                            }
                        },                        
                        {
                            loader: 'sass-loader',
                            options: {
                                sourceMap: true
                            }
                        }
                    ]
                },
                {
                    test: /\.(jpe?g|png|gif|svg|ttf)$/i,
                    use: [
                        {
                            loader: 'url-loader',
                            options: {
                                limit: 15000
                            }
                        }
                    ]
                }
            ]
            // rules: [{
            //     test: /\.jsx?$/,
            //     exclude: /(node_modules|bower_components)/,
            //     loader: 'babel-loader',
            //     query: {
            //         presets: ['react', 'es2015', 'stage-0'],
            //         plugins: ['react-html-attrs', 'transform-decorators-legacy', 'transform-class-properties'],
            //     }
            // },
            //     {
            //         test: /\.css$/,
            //         use: ['style-loader', 'css-loader'],
            //     },
            //     {
            //         test: /\.scss$/,
            //         exclude: /node_modules/
            //         // loader: ExtractTextPlugin.extract({
            //         //     fallback: 'style-loader',
            //         //     use: [
            //         //         {loader: 'css-loader', options: {minimize: true}},
            //         //         'sass-loader'
            //         //     ]
            //         // })
            //     },
            //     {
            //         test: /\.(jpe?g|png|gif|svg|ttf)$/i,
            //         use: [
            //             {
            //                 loader: 'url-loader',
            //                 options: {
            //                     limit: 10000
            //                 }
            //             }
            //         ]
            //     }
            // ]
        },
        plugins: plugins
    }
};
//console.log(getConfig({build: 'true', folder:'native'}))


console.log(process.env.NODE_ENV)
//var argv = require('minimist')(process.argv.slice(2));
// process.argv.forEach((val, index) => {
//     console.log(`${index}: ${val}`)
//   })
var config 
switch(process.env.NODE_ENV)  {
    case "production":
        config = {
            build: true,
            folder: 'native'            
        }
        break
    default: 
        config = {
            build: false,
            folder: 'dev'
        }
        break
}

module.exports = getConfig(config)