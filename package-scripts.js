const path = require('path');
const { series, concurrent } = require('nps-utils');
const resolve = file => path.resolve(__dirname, file);

const rollup = ({ browser = true, watch = true, dev = true } = {}) => {
  const env = [
    '--environment ',
    dev ? 'ENV:development' : 'ENV:production',
    browser ? ',BROWSER' : ',SERVER'
  ].join('');
  const w = watch ? ' --watch' : '';
  return `rollup -c ${resolve('./build/rollup.config.js')} ${env} ${w}`;
};

const bundleDeps = ({ browser = true, dev = true } = {}) => {
  const env = [
    'cross-env ',
    dev ? 'NODE_ENV=development' : 'NODE_ENV=production'
  ].join('');
  return `${env} node ${resolve('./build/write.js')}`;
};

const server = (dev = true) => {
  const index = resolve('./dist/filebrowser-server.js');
  const env = [
    'cross-env',
    dev ? 'NODE_ENV=development' : 'NODE_ENV=production',
    'PORT=3190',
    'DEBUG=express:application'
  ].join(' ');
  return dev
    ? `${env} nodemon --watch ${index} ${index}`
    : `${env} node ${index}`;
};

const css = (dev = true) => {
  return dev
    ? `node ${resolve('./build/watch.js')}`
    : `node ${resolve('./build/css.js')}`;
};

exports.scripts = {
  dev: {
    default: {
      script: concurrent.nps(
        'bundleDeps.dev',
        'build.css.dev',
        'build.server.dev',
        'build.browser.dev',
        'server.dev'
      )
    }
  },
  server: {
    default: { script: server(false) },
    dev: { script: server() }
  },
  build: {
    default: {
      script: series.nps('build.browser', 'build.css')
    },
    browser: {
      default: { script: rollup({ watch: false, dev: false }) },
      dev: { script: rollup() }
    },
    server: {
      default: { script: rollup({ browser: 0, watch: 0, dev: 0 }) },
      dev: { script: rollup({ browser: false }) }
    },
    css: {
      default: { script: css(false) },
      dev: { script: css() }
    }
  },
  bundleDeps: {
    default: { script: bundleDeps({ dev: false }) },
    dev: { script: bundleDeps() }
  }
};
