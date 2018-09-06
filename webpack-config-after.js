var fs = require('fs');
var postcss = require('postcss');
var classPrfx = require('postcss-class-prefix');

var css = fs.readFileSync('css/my-file.css', 'utf8').toString();
var out = postcss()
    .use(classPrfx('my-prefix-', { ignore: [/ng-/, 'some-class-to-ignore'] }))
    .process(css);


fs.writeFile(file, out, (err) => {
    if (err) {
        console.log(err)
        throw err
    }
    // success case, the file was saved
    console.log('view saved for bundle ' + BUNDLE_NAME);
});