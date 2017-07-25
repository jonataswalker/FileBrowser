import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import cors from 'cors';
import router from './routes';

const server = express();
const bs = require('browser-sync').create();

const isProd = process.env.NODE_ENV === 'production';
const port = process.env.npm_package_config_PORT || process.env.PORT || 3000;

const resolve = file => path.resolve(__dirname, file);
const serve = (path_, cache) => express.static(resolve(path_), {
  maxAge: cache && isProd ? 1000 * 60 * 60 * 24 * 30 : 0
});

server.use('/static', serve('../examples', true));
server.use('/static', serve('../dist', true));

// support parsing of application/json type post data
server.use(bodyParser.json());

// support parsing of application/x-www-form-urlencoded post data
server.use(bodyParser.urlencoded({ extended: false }));
server.use(cors());

server.use('/', router);

server.listen(port, listening);
console.log(`Express running - localhost:${port}`);

function listening() {
  bs.init({
    ui: false,
    notify: false,
    logLevel: 'info',
    proxy: 'localhost:' + port,
    files: ['examples/index.html', 'dist/**/*.js', 'dist/**/*.css']
  });
}
