const { readFileSync } = require('fs');
const sass = require('node-sass');
const jsonImporter = require('node-sass-json-importer');
const Watcher = require('node-sass-watcher');
const autoprefixer = require('autoprefixer');
const postcss = require('postcss');
const csso = require('csso');
const path = require('path');
const maxmin = require('maxmin');
const colors = require('colors');
const jetpack = require('fs-jetpack');

const dev = !!process.env.DEV;
const resolve = file => path.resolve(__dirname, file);
const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

const banner = readFileSync('./banner.js', 'utf-8')
  .replace('${name}', pkg.name)
  .replace('${version}', pkg.version)
  .replace('${description}', pkg.description)
  .replace('${homepage}', pkg.homepage)
  .replace('${time}', new Date());

const inputFile = resolve('../client/src/sass/app.scss');

if (dev) {
  const watcher = new Watcher(inputFile);
  watcher.on('init', render);
  watcher.on('update', render);
  watcher.run();
} else {
  render();
}

function render() {
  sass.render({
    file: inputFile,
    includePaths: [resolve('../node_modules')],
    importer: jsonImporter
  }, (err, result) => {
    if (err) throw err.message;

    postcss([autoprefixer({ browsers: ['last 2 versions'] })])
      .process(result.css)
      .then((res) => {
        res.warnings().forEach((warn) => {
          console.warn(warn.toString());
        });

        const cssFile = resolve('../dist/filebrowser.css');
        const cssFileMin = resolve('../dist/filebrowser.min.css');

        jetpack.remove(cssFile);
        jetpack.remove(cssFileMin);
        jetpack.write(cssFile, banner + res.css);

        let size = maxmin(res.css, res.css, true);

        console.log(colors.green.bold(
          `\nWritten: ${path.basename(cssFile)}
          \nSize: ${size.substr(size.indexOf(' → ') + 3)}
          \nNow: ${new Date()}\n`
        ));

        const cssMin = csso.minify(res.css, { restructure: false });
        jetpack.write(cssFileMin, banner + cssMin.css);
        size = maxmin(cssMin.css, cssMin.css, true);


        console.log(colors.green.bold(
          `\nWritten: ${path.basename(cssFileMin)}
          \nSize: ${size.substr(size.indexOf(' → ') + 3)}
          \nNow: ${new Date()}\n`
        ));
      }).catch(console.error);
  });
}
