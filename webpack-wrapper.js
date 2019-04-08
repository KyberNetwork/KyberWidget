const path = require('path');
const CleanPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

var BLOCKCHAIN_INFO = require("./env")
const fetch = require("node-fetch");
var fs = require('fs');

var getConfig = env => {
  const folder = env.folder ? env.folder : ""
  const outputPath = `dist/${folder}`

  const timestamp = Date.now();

  let entry = {
    app: ['babel-polyfill', path.resolve(__dirname, 'src/js/client.js'), path.resolve(__dirname, 'src/assets/css/app.scss')]
  };
  let plugins = [
    new webpack.ProgressPlugin(),
    new HtmlWebpackPlugin({
      title: 'Wallet - kyber.network',
      filename: 'index.html',
      template: './app.html',
      favicon: './assets/img/favicon.png',
      inject: 'body'
    }),
    new MiniCssExtractPlugin({
      filename: `[name].css`,
    }),
    new OptimizeCssAssetsPlugin({
      cssProcessor: require('cssnano'),
      cssProcessorPluginOptions: {
        preset: ['default', { discardComments: { removeAll: true } }],
      },
      canPrint: true
    })
  ];
  if (env && env.build !== 'true') {
    plugins.push(new webpack.DefinePlugin({
      'process.env': {
        'logger': 'false',
        'NODE_ENV': JSON.stringify(process.env.NODE_ENV)
      }
    }));
  } else {
    plugins.push(new CleanPlugin([outputPath + '/app.*', outputPath + '/libary.*']))
  }
  return {
    context: path.join(__dirname, 'src'),
    devtool: false,
    mode: 'production',
    entry: entry,
    optimization: {
      minimizer: [
        new TerserPlugin({
          parallel: true,
          terserOptions: {
            ecma: 6,
            compress: {
              drop_console: true,
              warnings: false
            }
          }
        }),
        new OptimizeCssAssetsPlugin({
          filename: `[name].css`,
        })
      ]
    },
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
                limit: 10000
              }
            }
          ]
        }
      ]
    },
    plugins: plugins
  }
};

async function getTokenApi(network) {
  return new Promise((resolve, result) => {
    fetch(BLOCKCHAIN_INFO[network].api_tokens, {
      method: 'GET',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      },
    }).then((response) => {
      return response.json()
    })
      .then((result) => {
        if (result.success) {
          var tokens = {}
          result.data.map(val => {
            tokens[val.symbol] = val
          })
          resolve(tokens)
        }
      }).catch((err) => {
      console.log(err)
      var tokens = BLOCKCHAIN_INFO[network].tokens
      resolve(tokens)
    })
  })

}

// async function renderThemeFiles(){
//   const themesFolder = path.resolve(__dirname, 'src/assets/css/themes');
//   const fs = require('fs');
//
//   fs.readdirSync(themesFolder).forEach(file => {
//     var fileName = file.split('.').slice(0, -1).join('.')
//     sass.render({
//       file: path.resolve(__dirname, 'src/assets/css/themes/' + fileName + ".scss"),
//       outputStyle: 'compressed'
//     }, function(error, result) { // node-style callback from v3.0.0 onwards
//       if (error) {
//         console.log(error)
//       }
//       else {
//         fs.writeFile(path.resolve(__dirname, 'dist/native/themes/' + fileName + ".css"), result.css, function(err){
//           if(!err){
//             //file written on disk
//             console.log("generate theme " + fileName + " successfully")
//           }
//         });
//       }
//     });
//   })
// }

var webpack = require('webpack');

async function saveBackupTokens() {
  //get backup tokens
  var listFiles = ["production", "rinkeby", "ropsten", "staging"]
  for (var i = 0; i < listFiles.length; i++) {
    var file = "./env/config-env/" + listFiles[i] + ".json"
    var obj = JSON.parse(fs.readFileSync(file, 'utf8'));

    var tokens = await getTokenApi(listFiles[i])
    obj.tokens = tokens

    fs.writeFileSync(file, JSON.stringify(obj, null, 4));
  }
}

function addPrefixCss() {
  var fs = require('fs');
  var postcss = require('postcss');
  var classPrfx = require('postcss-class-prefix');
  var file = `dist/native/app.css`
  var css = fs.readFileSync(file, 'utf8').toString();

  var out = postcss()
    .use(classPrfx('kyber_widget-', { ignore: [
        "kyber_widget",
        "dropdown",
        "ReactModalPortal",
        "dropdown--active",
        "dropdown__trigger",
        "dropdown__content",
        "rc-slider-handle",
        "rc-slider-handle:focus",
        "rc-slider-handle:active"
      ] }))
    .process(css);

  fs.writeFile(file, out, (err) => {
    if (err) {
      console.log(err)
      throw err
    }

    fs.copyFile(file, 'dist/native/app.bundle.css', (err) => {
      if (err) throw err;
    });
  });
}

async function main() {
  await saveBackupTokens()

  var config
  switch (process.env.NODE_ENV) {
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

  var webpackConfig = await getConfig(config)
  var compiler = await webpack(webpackConfig)
  await compiler.run(function (err, stats) {
    if (!err) {
      console.log("success")
      addPrefixCss();
    } else {
      console.log("fail")
      console.log(err)
    }
  })

  // await renderThemeFiles()
}

main()
