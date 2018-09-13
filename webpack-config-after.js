
//const BUNDLE_NAME = process.env.BUNDLE_NAME || 'bundle'

var fs = require('fs');
var postcss = require('postcss');
var classPrfx = require('postcss-class-prefix');

var folder = process.env.FOLDER

console.log(folder)
var file = `dist/${folder}/app.bundle.css`
var css = fs.readFileSync(file, 'utf8').toString();
var out = postcss()
    .use(classPrfx('kyber-widget-', { ignore: [/ng-/, 'kyber-widget'] }))
    .process(css);


fs.writeFile(file, out, (err) => {
    if (err) {
        console.log(err)
        throw err
    }
    // success case, the file was saved
    //console.log('view saved for bundle ' + BUNDLE_NAME);
});