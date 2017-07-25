const fs = require('fs');
const path = require('path');

// const getTree = (dir, done) => {
//   const results = {
//     files: [],
//     folders: []
//   };

//   fs.readdir(dir, (err, list) => {
//     if (err) return done(err);

//     let pending = list.length;

//     if (!pending) return done(null, results);

//     list.forEach(file => {
//       file = path.resolve(dir, file);
//       fs.stat(file, (err, stat) => {
//         if (stat && stat.isDirectory()) {
//           getTree(file, (err, res) => {
//             results.folders.push({
//               name: path.basename(file),
//               files: res.files,
//               folders: res.folders
//             });
//             if (!--pending) done(null, results);
//           });
//         } else {
//           if (stat && stat.isFile()) {
//             const ext = path.extname(file).toLowerCase();

//             if (['.vue'].includes(ext)) {
//               results.files.push({
//                 size: stat.size,
//                 name: path.basename(file)
//               });
//             }
//           }

//           if (!--pending) done(null, results);
//         }
//       });
//     });
//   });
// };

async function directoryTree(dir, options = {}) {
  const results = {
    files: [],
    folders: []
  };

  const files = safeReadDirSync(dir);

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

// const getTreeSync = (dir, done) => {
//   const results = {
//     files: [],
//     folders: []
//   };

//   const list = safeReadDirSync(dir);

//   let pending = list.length;
//   if (!pending) return done(null, results);

//   list.forEach((file, i) => {
//     file = path.resolve(dir, file);
//     const stat = fs.statSync(file);

//     if (stat && stat.isDirectory()) {
//       getTreeSync(file, (err, res) => {
//         results.folders.push({
//           name: path.basename(file),
//           files: res.files,
//           folders: res.folders
//         });
//         if (!--pending) done(null, results);
//       });
//     } else {
//       if (stat && stat.isFile()) {
//         const ext = path.extname(file).toLowerCase();

//         if (['.vue'].includes(ext)) {
//           results.files.push({
//             size: stat.size,
//             name: path.basename(file)
//           });
//         }
//       }

//       if (!--pending) done(null, results);
//     }
//   });
// };

const dirTree = ('/var/www/FileBrowser/client');
directoryTree(dirTree).then(tree => {
  fs.writeFile('tree.json', JSON.stringify(tree), err => {
    if (err) throw err;
    console.log('written');
  });
}).catch(console.error);


// getTreeSync(dirTree, (err, res) => {
//   if (err) throw err;

//   fs.writeFile('tree.json', JSON.stringify(res), err => {
//     if (err) throw err;
//     console.log('written');
//   });

//   // console.log(JSON.stringify(res));
// });


// const dirTree__ = require('directory-tree');
// const filteredTree = dirTree__(dirTree, { extensions:/\.vue/ });

// fs.writeFile('tree2.json', JSON.stringify(filteredTree), err => {
//   if (err) throw err;
//   console.log('written');
// });

function safeReadDirSync(dir) {
  let dirData = {};
  try {
    dirData = fs.readdirSync(dir);
  } catch (ex) {
    if (ex.code === 'EACCES') {
      //User does not have permissions, ignore directory
      return null;
    } else throw ex;
  }
  return dirData;
}
