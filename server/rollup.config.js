import { readFileSync } from 'fs';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import eslint from 'rollup-plugin-eslint';
import includePaths from 'rollup-plugin-includepaths';
import colors from 'colors';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));
const external = Object.keys(pkg.dependencies).concat([
  'path', 'fs', 'url', 'net', 'dns', 'browser-sync', 'util', 'crypto'
]);

const lintOpts = {
  cache: true,
  throwOnError: true
};

const plugins = [
  includePaths({ paths: [''] }),
  eslint(Object.assign(lintOpts, pkg.eslintConfig)),
  nodeResolve(),
  commonjs()
];

colors.setTheme({ custom: ['green', 'bgWhite'] });
console.log(colors.green.bold(
  `\nRunning Rollup on server
  \nNow: ${new Date()}\n`
));

const banner = readFileSync('./banner.js', 'utf-8')
  .replace('${name}', pkg.name)
  .replace('${version}', pkg.version)
  .replace('${description}', pkg.description)
  .replace('${homepage}', pkg.homepage)
  .replace('${time}', new Date());

export default {
  external,
  banner,
  plugins,
  input: './server/src/entry.js',
  output: { file: './dist/filebrowser-server.js', format: 'cjs' }
};
