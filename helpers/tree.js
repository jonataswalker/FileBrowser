import fs from 'fs';
import path from 'path';
import { TEXT, ROOT_ID } from 'konstants';
import { ID } from './mix';

export function createFolder(dir) {
  return new Promise((resolve, reject) => {
    let error = true;
    if (fs.existsSync(dir)) {
      reject({ error, message: TEXT.API.MESSAGES.FOLDER.EXISTS });
    } else {
      fs.mkdir(dir, err => {
        const id = ID();
        err ? reject({ error, message: err }) : resolve({ id });
      });
    }
  });
}

export async function getTree(dir, options = {}, parents = [], parentId) {
  const root = path.resolve(process.env.npm_package_config_ROOT_DIR);
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
    const file = path.resolve(dir, f);
    const stat = fs.statSync(file);
    if (!file) break;

    if (stat && stat.isDirectory()) {
      const id = ID();
      const recursive = await getTree(file, options, parents, id);

      results.folders[id] = {
        name: path.basename(file),
        files: recursive.files,
        folders: recursive.folders
      };

      if (parents.length) results.folders[id].parents = parents;

    } else if (stat && stat.isFile()) {
      const relativeDir = dir.replace(root, '').split(path.sep).join('/');
      const ext = path.extname(file).toLowerCase();
      const fileObj = {
        size: stat.size,
        name: path.basename(file),
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

export function removeFiles(folder, files) {
  return new Promise((resolve, reject) => {
    files.forEach((file, idx) => {
      file = path.join(folder, file);
      fs.unlink(file, err => {
        err && reject({ message: err });
        idx === files.length - 1 && resolve();
      });
    });
  });
}
