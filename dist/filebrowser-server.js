/*!
 * FileBrowser - v1.3.0
 * A multi-purpose filebrowser.
 * https://github.com/jonataswalker/FileBrowser
 * Built: Tue Jul 25 2017 15:34:15 GMT-0300 (-03)
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
var fs = _interopDefault(require('fs'));

async function directoryTree(dir, options, done) {
  const results = {
    files: [],
    folders: []
  };

  const files = safeReadDirSync(dir);

  if (!files) return { error: `Directory '${dir}' not found.` };

  while (files.length > 0) {
    const f = files.pop();
    const file = path.resolve(dir, f);
    const stat = fs.statSync(file);
    if (!file) break;

    if (stat && stat.isDirectory()) {
      const recursive = await directoryTree(file);
      results.folders.push({
        name: path.basename(file),
        files: recursive.files,
        folders: recursive.folders
      });
    } else if (stat && stat.isFile()) {
      const ext = path.extname(file).toLowerCase();
      const fileObj = {
        size: stat.size,
        name: path.basename(file),
        extension: ext
      };

      if (options.extensions || options.exclude) {
        if (options.extensions.includes(ext)) {
          results.files.push(fileObj);
        }

      } else {
        results.files.push(fileObj);
      }
    }
  }
  return results;
}

function safeReadDirSync(dir) {
  let data;
  if (fs.existsSync(dir)) {
    try {
      data = fs.readdirSync(dir);
    } catch (ex) {
      if (ex.code === 'EACCES') {
        //User does not have permissions, ignore directory
        return null;
      } else throw ex;
    }
  }
  return data;
}

const router = express.Router();
const resolve$1 = file => path.resolve(__dirname, file);
const root = path.resolve(process.env.npm_package_config_ROOT_DIR);

router.get('/files', (req, res, next) => {
  directoryTree(root)
    .then(tree => {
      if (tree.error) {
        res.status(500).send({ error: tree.error });
      } else {
        res.json(tree);
      }
    })
    .catch(error => {
      res.status(500).send({ error });
      next();
    });
});


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
