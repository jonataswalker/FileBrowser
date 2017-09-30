import Fs from 'fs';
import Path from 'path';
import { TEXT, ROOT_ID } from 'konstants';
import { ID } from 'helpers/mix';

export function createFolder(dir) {
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

export async function getTree(dir, options = {}, parents = [], parentId) {
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
