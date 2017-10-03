import { readFileSync } from 'fs';
import nodeResolve from 'rollup-plugin-node-resolve';
import buble from 'rollup-plugin-buble';
import commonjs from 'rollup-plugin-commonjs';
import eslint from 'rollup-plugin-eslint';
import bundleSize from 'rollup-plugin-filesize';
import uglify from 'rollup-plugin-uglify';
import vue from 'rollup-plugin-vue';
import includePaths from 'rollup-plugin-includepaths';
import { minify } from 'uglify-es';
import colors from 'colors';


const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));
const external = Object.keys(pkg.dependencies);
let includeExternal = ['file-type'];

includeExternal.forEach(e => {
  const idx = external.indexOf(e);
  if (idx !== -1) external.splice(idx, 1);
});

const dev = !!process.env.DEV;

const mdc = [
  ['@material/checkbox', 'mdc.checkbox'],
  ['@material/dialog', 'mdc.dialog'],
  ['@material/radio', 'mdc.radio'],
  ['@material/ripple', 'mdc.ripple'],
  ['@material/textfield', 'mdc.textfield']
];

const globals = {
  vue: 'Vue',
  vuex: 'Vuex',
  pica: 'pica',
  axios: 'axios',
  deepmerge: 'deepmerge',
  'fast-sort': 'sort.js',
  'es6-object-assign': 'ObjectAssign'
};

mdc.forEach(each => {
  external.push(each[0]);
  globals[each[0]] = each[1];
});

const dest = dev ? './dist/filebrowser.js' : './dist/filebrowser.min.js';

const extensions = ['.js', '.vue'];
const lintOpts = {
  extensions,
  cache: true,
  throwOnError: false
};

const includePathOptions = {
  extensions,
  paths: ['', './client/src/components']
};

const plugins = [
  includePaths(includePathOptions),
  eslint(Object.assign(lintOpts, pkg.eslintConfig)),
  bundleSize(),
  nodeResolve({ extensions, browser: true }),
  commonjs(),
  vue({
    compileTemplate: true,
    compileOptions: { preserveWhitespace: false },
    css: true,
    cssModules: { generateScopedName: 'fb-[hash:base64:5]' },
    scss: { includePaths: ['./node_modules', './client/src/sass'] }
  }),
  buble({
    target: { ie: 11 },
    // objectAssign: 'Object.assign',
    exclude: ['node_modules/**']
  }),
  !dev && uglify({ output: { comments: /^!/ }}, minify)
];

const banner = readFileSync('banner.js', 'utf-8')
  .replace('${name}', pkg.name)
  .replace('${version}', pkg.version)
  .replace('${time}', new Date());

colors.setTheme({ custom: ['green', 'bgWhite'] });
console.log(colors.green.bold(
  `\nRunning Rollup in ${dev ? 'development' : 'production'} mode on browser
  \nBundle: ${dest}
  \nNow: ${new Date()}\n`
));

export default {
  external,
  banner,
  globals,
  plugins,
  name: 'FileBrowser',
  input: './client/src/entry.js',
  output: {
    file: dest,
    format: 'iife'
  }
};

