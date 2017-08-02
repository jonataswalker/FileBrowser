/*!
 * FileBrowser - v1.3.0
 * A multi-purpose filebrowser.
 * https://github.com/jonataswalker/FileBrowser
 * Built: Wed Aug 02 2017 16:47:40 GMT-0300 (-03)
 */

'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var express = _interopDefault(require('express'));
var path = _interopDefault(require('path'));
var bodyParser = _interopDefault(require('body-parser'));
var cors = _interopDefault(require('cors'));
var mime = _interopDefault(require('mime-types'));
var url = _interopDefault(require('url'));
var util = _interopDefault(require('util'));
var fs = _interopDefault(require('fs'));

const TEXT = {
  TITLE: 'Image Browser',
  ROOT_FOLDER: 'Root Folder',
  PREVIEW: 'Sending Preview',
  SEND_TO_EDITOR: 'Send to Editor',
  REQUIRED: 'Field is required',
  TOOLBAR: {
    BTN_CHOOSE: 'Choose',
    BTN_SEND: 'Send',
    BTN_DEL_FILE: 'Delete File',
    BTN_NEW_FOLDER: 'New Folder',
    BTN_DEL_FOLDER: 'Delete Folder',
    BTN_SEND_EDITOR: 'Send to Editor'
  },
  FILE: {
    TOTAL: 'Total Files:',
    DEL: 'Delete File',
    DELS: 'Delete Files'
  },
  FOLDER: {
    NEW: 'New Folder',
    DEL: 'Delete Folder',
    CREATION: 'This folder will be created inside:',
    VALIDATION: [
      'Only <strong>letters, numbers</strong>',
      ' and the following characters: <span class="highlight">- _</span>'
    ].join(''),
    DELETION: [
      '<p class="folder-path">This folder <span>%1</span>',
      ' will be removed with all its contents: </p>',
      '<p>Total Files: <span class="destaque">%2</span>',
      ' &mdash; Total Subfolders: <span class="destaque">%3</span></p>'
    ].join('')
  },
  ALERT: {
    BTN_OK: 'OK',
    BTN_CANCEL: 'Cancel',
    IMAGE: {
      NOT_MIN_SIZE: 'Only images with minimum %1 x %2!'
    },
    UPLOAD: {
      SENDING: 'An upload is already in progress!',
      NONE: 'No file!',
      SENT: 'All done!'
    }
  },
  API: {
    MESSAGES: {
      FOLDER: {
        CREATED: 'Folder created!',
        RENAMED: 'Folder renamed!',
        EXISTS: 'This folder already exists!'
      }
    }
  }
};

const ROUTES = {
  FILES: {
    ALL: '/files',
    CREATE: '/files',
    REMOVE: '/files/:id'
  },
  FOLDER: {
    CREATE: '/folder',
    EDIT: '/folder/:id',
    REMOVE: '/folder/:id'
  }
};

/**
 * Generates a GUID string.
 * @returns {String} The generated GUID.
 * @example af8a8416-6e18-a307-bd9c-f2c947bbb3aa
 * @author Slavik Meltser (slavik@meltser.info).
 * @link http://slavik.meltser.info/?p=142
 */


function ID() {
  return '_' + Math.random().toString(36).substr(2, 9);
}

function createFolder(dir) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dir)) {
      reject(TEXT.API.MESSAGES.FOLDER.EXISTS);
    } else {
      fs.mkdir(dir, err => {
        err ? reject(err) : resolve(TEXT.API.MESSAGES.FOLDER.CREATED);
      });
    }
  });
}

async function directoryTree(
  dir, options = {}, parents = [], parentId
) {
  const results = { files: [], folders: {}, parents: [] };
  const files = safeReadDirSync(dir);

  if (parentId) {
    parents = parents.concat(parentId);
  }

  if (!files) return { error: `Directory '${dir}' not found.` };

  while (files.length > 0) {
    const f = files.pop();
    const file = path.resolve(dir, f);
    const stat = fs.statSync(file);
    if (!file) break;

    if (stat && stat.isDirectory()) {
      const id = ID();
      const recursive = await directoryTree(file, options, parents, id);

      results.folders[id] = {
        name: path.basename(file),
        files: recursive.files,
        folders: recursive.folders,
        parents: parents
      };
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

// const uploadRoot = UPLOAD.ROOT.replace('{root}', resolve('../'));

// const storageFotos = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, `${uploadRoot}/${UPLOAD.FOTOS}/`);
//   },
//   filename: (req, file, cb) => {
//     crypto.pseudoRandomBytes(16, (err, raw) => {
//       const ext = mime.extension(file.mimetype);
//       cb(null, `${raw.toString('hex')}-${Date.now()}.${ext}`);
//     });
//   }
// });

// const imageFilter = (req, file, cb) => {
//   // accept image only
//   console.log(file);
//   const ext = mime.extension(file.mimetype);
//   ['jpg', 'jpeg', 'png', 'gif'].includes(ext)
//     ? cb(null, true)
//     : cb(new Error('Only image files are allowed!'), false);
// };

// const uploadFotos = multer({
//   storage: storageFotos,
//   fileFilter: imageFilter
// }).array('test');
// router.put(ROUTES.FOTOS.UPLOAD, handleUploadFotos);

router.get(ROUTES.FILES.ALL, (req, res, next) => {
  directoryTree(root)
    .then(tree => res.json(tree))
    .catch(e => res.status(500).send({ message: e }));
});

router.post(ROUTES.FOLDER.CREATE, (req, res, next) => {
  const dir = path.join(root, '.' + req.body.path);
  const response = {};
  createFolder(dir)
    .then(msg => {
      response.message = msg;
      return directoryTree(root);
    })
    .then(tree => {
      response.tree = tree;
      res.json(response);
    })
    .catch(e => res.status(500).send({ message: e }));
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
