import Fs from 'fs';
import Path from 'path';
import jetpack from 'fs-jetpack';
import { ROOT_ID } from 'konstants';
import { ID } from 'helpers/mix';

export async function getTree(dir, options = {}, parents = [], parentId) {
  const root = Path.resolve(process.env.npm_package_config_ROOT_DIR);
  const staticPath = process.env.npm_package_config_STATIC_PATH || '/static';

  const results = { files: [], folders: {}};
  const files = jetpack.list(dir);

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
