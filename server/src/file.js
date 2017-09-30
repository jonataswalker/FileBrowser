import Fs from 'fs';
import Path from 'path';

export function removeFiles(folder, files) {
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
