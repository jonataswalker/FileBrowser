import Path from 'path';
import Hapi from 'hapi';
import Good from 'good';
import Inert from 'inert';
import BrowserSync from 'browser-sync';
import Router from './routes';

const server = new Hapi.Server();

const isProd = process.env.NODE_ENV === 'production';
const port = process.env.npm_package_config_PORT || process.env.PORT || 3000;

const host = 'localhost';
const options = {
  ops: { interval: 10000 },
  reporters: {
    console: [
      {
        module: 'good-squeeze',
        name: 'Squeeze',
        args: [{ log: '*', response: '*', request: '*' }]
      },
      { module: 'good-console' },
      'stdout'
    ]
  }
};

server.connection({ host, port, routes: { cors: true }});
server.register([
  { register: Inert },
  { register: Router },
  { register: Good, options }
], (err) => {
  if (err) return console.error(err);

  server.start(() => {
    console.info(`Server started at ${ server.info.uri }`);

    if (!isProd) {
      const bs = BrowserSync.create();
      bs.init({
        ui: false,
        notify: false,
        logLevel: 'info',
        proxy: 'localhost:' + port,
        files: ['examples/index.html', 'dist/**/*.js', 'dist/**/*.css']
      });
    }
  });
});
