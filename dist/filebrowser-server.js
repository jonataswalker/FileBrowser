/*!
 * FileBrowser - v1.3.0
 * A multi-purpose filebrowser.
 * https://github.com/jonataswalker/FileBrowser
 * Built: Sat Sep 30 2017 08:46:24 GMT-0300 (-03)
 */

'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Hapi = _interopDefault(require('hapi'));
var Good = _interopDefault(require('good'));
var Inert = _interopDefault(require('inert'));
var BrowserSync = _interopDefault(require('browser-sync'));
var Fs = _interopDefault(require('fs'));
var Path = _interopDefault(require('path'));
var Boom = _interopDefault(require('boom'));

const ROOT_ID = 'root';







const TEXT = {
  TITLE: 'Image Browser',
  ROOT_FOLDER: 'Root Folder',
  PREVIEW: 'Sending Preview',
  SEND_TO_EDITOR: 'Send to Editor',
  REQUIRED: 'Field is required',
  BUTTON: {
    CHOOSE: 'Choose',
    SEND: 'Send',
    DELETE_FILE: 'Delete File',
    DELETE_FOLDER: 'Delete Folder',
    NEW_FOLDER: 'New Folder',
    SEND_EDITOR: 'Send to Editor',
    SUBMIT: 'Submit',
    CONFIRM: 'Confirm',
    CANCEL: 'Cancel'
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
      },
      FILE: {
        REMOVED: 'File(s) removed!'
      }
    }
  }
};

const ROUTES = {
  FILES: {
    ALL: '/files',
    UPLOAD: '/files',
    REMOVE: '/files'
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
  return Math.random().toString(36).substr(2, 9);
}

function createFolder(dir) {
  return new Promise((resolve, reject) => {
    let error = true;
    if (Fs.existsSync(dir)) {
      reject({ error, message: TEXT.API.MESSAGES.FOLDER.EXISTS });
    } else {
      Fs.mkdir(dir, err => {
        const id = stringToCharCode(Path.basename(dir));
        err ? reject({ error, message: err }) : resolve(id);
      });
    }
  });
}

async function getTree(dir, options = {}, parents = [], parentId) {
  const root = Path.resolve(process.env.npm_package_config_ROOT_DIR);
  const staticPath = process.env.npm_package_config_STATIC_PATH || '/static';

  const results = { files: [], folders: {}};
  const files = safeReadDirSync(dir);

  if (parentId) {
    parents = parents.concat(parentId);
  } else {
    parents.push(ROOT_ID);
  }

  if (!files) return { error: `Directory '${dir}' not found.` };

  while (files.length > 0) {
    const f = files.pop();
    const file = Path.resolve(dir, f);
    const stat = Fs.statSync(file);
    if (!file) break;

    if (stat && stat.isDirectory()) {
      const id = ID();
      const recursive = await getTree(file, options, parents, id);

      results.folders[id] = {
        parents,
        name: Path.basename(file),
        files: recursive.files,
        folders: recursive.folders
      };

    } else if (stat && stat.isFile()) {
      const relativeDir = dir.replace(root, '').split(Path.sep).join('/');
      const ext = Path.extname(file).toLowerCase();
      const fileObj = {
        size: stat.size,
        name: Path.basename(file),
        extension: ext,
        path: staticPath + relativeDir
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
  if (Fs.existsSync(dir)) {
    try {
      data = Fs.readdirSync(dir);
      // data.sort((a, b) => a.toUpperCase() > b.toUpperCase() ? -1 : 1);
    } catch (ex) {
      if (ex.code === 'EACCES') {
        //User does not have permissions, ignore directory
        return null;
      } else throw ex;
    }
  }
  return data;
}

function stringToCharCode(str) {
  const len = str.length;
  let pos = len;
  let out = 0;
  while ((pos -= 1) > -1) {
    out += (fixedCharCodeAt(str, pos) - 64) * Math.pow(26, len - 1 - pos);
  }
  return out;
}

function fixedCharCodeAt(str, idx = 0) {
  // ex. fixedCharCodeAt('\uD800\uDC00', 0); // 65536
  // ex. fixedCharCodeAt('\uD800\uDC00', 1); // false
  const code = str.charCodeAt(idx);
  let hi, low;

  // High surrogate (could change last hex to 0xDB7F
  // to treat high private surrogates
  // as single characters)
  if (0xD800 <= code && code <= 0xDBFF) {
    hi = code;
    low = str.charCodeAt(idx + 1);
    if (isNaN(low)) {
      throw 'High surrogate not followed by ' +
        'low surrogate in fixedCharCodeAt()';
    }
    return ((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000;
  }
  if (0xDC00 <= code && code <= 0xDFFF) { // Low surrogate
    // We return false to allow loops to skip
    // this iteration since should have already handled
    // high surrogate above in the previous iteration
    return false;
    // hi = str.charCodeAt(idx - 1);
    // low = code;
    // return ((hi - 0xD800) * 0x400) +
    //   (low - 0xDC00) + 0x10000;
  }
  return code;
}

function removeFiles(folder, files) {
  const path = (f) => Path.join(folder, f);
  const first = files.pop();

  if (!files.length) {
    return unlink(path(first));
  }

  return files.reduce((promise, file) => {
    return promise.then(unlink(path(file)), console.error);
  }, unlink(path(first)));
}


function unlink(file) {
  return new Promise((resolve, reject) => {
    Fs.unlink(file, (err) => err ? reject(err) : resolve());
  });
}

const resolve = file => Path.resolve(__dirname, file);
const root = Path.resolve(process.env.npm_package_config_ROOT_DIR);
const staticPath = process.env.npm_package_config_STATIC_PATH || '/static';

const routes = [
  {
    method: 'GET',
    path: ROUTES.FILES.ALL,
    handler: (request, reply) => {
      return getTree(root)
        .then(reply)
        .catch(console.error);
    }
  },
  {
    method: 'POST',
    path: ROUTES.FILES.UPLOAD,
    config: {
      payload: {
        maxBytes: 10 * 1024 * 1024,
        output: 'stream',
        allow: 'multipart/form-data',
        parse: true
      }
    },
    handler: (request, reply) => {
      const { id, name, file, directory } = request.payload;
      if (file) {
        const path = `${root}/${directory}/${name}`;
        const fileStream = Fs.createWriteStream(path);

        file.pipe(fileStream);
        file.on('error', err => console.error);
        file.on('end', () => {
          const stat = Fs.statSync(path);
          const fileObj = {
            id,
            name,
            size: stat.size,
            extension: Path.extname(path).toLowerCase(),
            path: Path.join(staticPath, directory)
          };
          reply(fileObj);
        });
      }
    }
  },
  {
    method: 'PATCH',
    path: ROUTES.FILES.REMOVE,
    handler: (request, reply) => {
      const message = TEXT.API.MESSAGES.FILE.REMOVED;
      const folder = Path.join(root, request.payload.folder);
      return removeFiles(folder, request.payload.files)
        .then(() => reply({ message }))
        .catch(err => reply(Boom.notAcceptable(err.message)));
    }
  },
  {
    method: 'POST',
    path: ROUTES.FOLDER.CREATE,
    handler: (request, reply) => {
      const dir = Path.join(root, request.payload.path);
      const message = TEXT.API.MESSAGES.FOLDER.CREATED;
      return createFolder(dir)
        .then(id => reply({ id, message }))
        .catch(err => reply(Boom.notAcceptable(err.message)));
    }
  },
  {
    method: 'GET',
    path: '/',
    handler: (request, reply) => {
      reply.file(resolve('../examples/index.html'));
    }
  },
  {
    method: 'GET',
    path: `${staticPath}/{p*}`,
    handler: {
      directory: {
        path: [
          resolve('../examples'),
          resolve('../examples/_uploads'),
          resolve('../dist')
        ]
      }
    }
  }
];

const router = {
  register: (server, options, next) => {
    server.route(routes);
    next();
  }
};

router.register.attributes = { name: 'routes' };

const server = new Hapi.Server();

const isProd = process.env.NODE_ENV === 'production';
const port = process.env.npm_package_config_PORT || process.env.PORT || 3000;

// const host = 'localhost';
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

server.connection({ port, routes: { cors: true }});
server.register([
  { register: Inert },
  { register: router },
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
        files: ['examples/index.html', 'dist/filebrowser.js']
      });
    }
  });
});
