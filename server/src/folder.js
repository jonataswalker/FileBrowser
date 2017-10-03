import jetpack from 'fs-jetpack';
import { TEXT } from 'konstants';

export function removeFolder(path) {
  return new Promise((resolve, reject) => {
    jetpack.remove(path);
    resolve();
  });
}

export function createFolder(dir) {
  return new Promise((resolve, reject) => {
    if (jetpack.exists(dir) === false) {
      jetpack.dirAsync(dir).then(resolve).catch(reject);
    } else {
      reject({ message: TEXT.API.MESSAGES.FOLDER.EXISTS });
    }
  });
}
