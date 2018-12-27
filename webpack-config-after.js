var fs = require('fs');
var postcss = require('postcss');
var classPrfx = require('postcss-class-prefix');

var folder = process.env.FOLDER


var file = `dist/${folder}/app.css`
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
});
