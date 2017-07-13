const { readFileSync } = require('fs');
const sass = require('node-sass');
const jsonImporter = require('node-sass-json-importer');
const autoprefixer = require('autoprefixer');
const postcss = require('postcss');
const cssnano = require('cssnano');
const path = require('path');
const maxmin = require('maxmin');
const colors = require('colors');
const jetpack = require('fs-jetpack');

const resolve = file => path.resolve(__dirname, file);
const pkg = JSON.parse(readFileSync(resolve('../package.json'), 'utf-8'));

const banner = readFileSync(resolve('./banner.js'), 'utf-8')
  .replace('${name}', pkg.name)
  .replace('${version}', pkg.version)
  .replace('${description}', pkg.description)
  .replace('${homepage}', pkg.homepage)
  .replace('${time}', new Date());

sass.render({
  file: resolve('../src/css/app.scss'),
  includePaths: [resolve('../node_modules')],
  importer: jsonImporter
}, (err, result) => {
  if (err) throw err.message;

  postcss([autoprefixer({ remove: false, browsers: ['last 2 versions'] })])
    .process(result.css)
    .then((res) => {
      res.warnings().forEach((warn) => {
        console.warn(warn.toString());
      });

      const cssFile = resolve('../dist/filebrowser.css');
      const cssFileMin = resolve('../dist/filebrowser.min.css');

      jetpack.remove(cssFile);
      jetpack.write(cssFile, banner + res.css);

      let size = maxmin(res.css, res.css, true);

      console.log(colors.green.bold(
        `\nWritten: ${path.basename(cssFile)}
        \nSize: ${size.substr(size.indexOf(' → ') + 3)}
        \nNow: ${new Date()}\n`
      ));

      cssnano.process(res.css).then((r) => {
        jetpack.remove(cssFileMin);
        jetpack.write(cssFileMin, banner + r.css);
        size = maxmin(r.css, r.css, true);

        console.log(colors.green.bold(
          `\nWritten: ${path.basename(cssFileMin)}
          \nSize: ${size.substr(size.indexOf(' → ') + 3)}
          \nNow: ${new Date()}\n`
        ));
      });
    });
});
