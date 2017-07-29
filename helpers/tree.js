import fs from 'fs';
import path from 'path';
import { TEXT } from 'konstants';

export function createFolder(dir) {
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

export async function directoryTree(dir, options, done) {
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
