/*!
 * FileBrowser - v1.3.0
 * A multi-purpose filebrowser.
 * https://github.com/jonataswalker/FileBrowser
 * Built: Thu Jul 13 2017 16:18:21 GMT-0300 (-03)
 */

'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var express = _interopDefault(require('express'));
var path = _interopDefault(require('path'));
var bodyParser = _interopDefault(require('body-parser'));
var cors = _interopDefault(require('cors'));
var crypto = _interopDefault(require('crypto'));
var multer = _interopDefault(require('multer'));
var mime = _interopDefault(require('mime-types'));
var url = _interopDefault(require('url'));
var util = _interopDefault(require('util'));

// import { ROUTES, UPLOAD } from '../constants';

const router = express.Router();
const resolve$1 = file => path.resolve(__dirname, file);

// const uploadFotos = multer({
//   storage: storageFotos,
//   fileFilter: imageFilter
// }).array('test');
// router.put(ROUTES.FOTOS.UPLOAD, handleUploadFotos);

// Always return the main index.html
// so router render the route in the client
router.all('*', (req, res) => {
  const file = path.basename(url.parse(req.url).pathname);
  const mime_ = mime.lookup(file);
  mime_ && res.setHeader('Content-Type', mime_);
  res.sendFile(resolve$1('../examples/index.html'));
});

const server = express();
const bs = require('browser-sync').create();

const isProd = process.env.NODE_ENV === 'production';
const port = process.env.PORT || 3000;
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
