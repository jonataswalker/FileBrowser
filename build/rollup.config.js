import path from 'path';
import { readFileSync } from 'fs';
import nodeResolve from 'rollup-plugin-node-resolve';
import buble from 'rollup-plugin-buble';
import commonjs from 'rollup-plugin-commonjs';
import bundleSize from 'rollup-plugin-bundle-size';
import eslint from 'rollup-plugin-eslint';
import vue from 'rollup-plugin-vue';
import colors from 'colors';

const resolve = file => path.resolve(__dirname, file);
const pkg = JSON.parse(readFileSync(resolve('../package.json'), 'utf-8'));

const mdc = [
  ['@material/checkbox', 'mdc.checkbox'],
  ['@material/dialog', 'mdc.dialog'],
  ['@material/radio', 'mdc.radio'],
  ['@material/ripple', 'mdc.ripple'],
  ['@material/textfield', 'mdc.textfield']
];

const external = Object.keys(pkg.dependencies).concat([
  'path', 'url', 'util', 'crypto'
]);
const globals = {
  'axios': 'axios',
  'quill': 'Quill',
  'vue': 'Vue',
  'vuex': 'Vuex',
  'vue-router': 'VueRouter',
  'vuelidate': 'vuelidate'
};

mdc.forEach(each => {
  external.push(each[0]);
  globals[each[0]] = each[1];
});

const env = process.env.ENV;
const isProduction = env === 'production';
const isBrowser = process.env.BROWSER || false;

const dest = isBrowser
  ? isProduction
    ? resolve('../dist/filebrowser.min.js')
    : resolve('../dist/filebrowser.js')
  : resolve('../dist/filebrowser-server.js');

const lintOpts = {
  extensions: ['.js', '.vue'],
  cache: true,
  throwOnError: true
};

const plugins = [
  eslint(Object.assign(lintOpts, pkg.eslintConfig)),
  bundleSize(),
  commonjs(),
  nodeResolve({ extensions: ['.js', '.vue'] })
];
const browserPlugins = plugins.concat([
  vue({ compileTemplate: true }),
  buble({ target: { chrome: 50 }})
]);

const serverPlugins = plugins;

const banner = readFileSync(resolve('./banner.js'), 'utf-8')
  .replace('${name}', pkg.name)
  .replace('${version}', pkg.version)
  .replace('${description}', pkg.description)
  .replace('${homepage}', pkg.homepage)
  .replace('${time}', new Date());

colors.setTheme({ custom: ['green', 'bgWhite'] });
console.log(colors.green.bold(
  `\nRunning Rollup in ${env} mode on ${isBrowser ? 'browser' : 'server'}
  \nBundle: ${dest}
  \nNow: ${new Date()}\n`
));

export default {
  external,
  banner,
  dest,
  globals,
  moduleName: 'FileBrowser',
  format: isBrowser ? 'umd' : 'cjs',
  entry: isBrowser ?
    resolve('../src/entry.js') : resolve('../src/server/index.js'),
  watch: { exclude: 'node_modules/**' },
  plugins: isBrowser ? browserPlugins : serverPlugins
};
