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

const getTreeSync = (dir, done) => {
  const results = {
    files: [],
    folders: []
  };

  const list = safeReadDirSync(dir);
  let pending = list.length;
  if (!pending) return done(null, results);

  list.forEach(file => {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);

    if (stat && stat.isDirectory()) {
      getTreeSync(file, (err, res) => {
        results.folders.push({
          name: path.basename(file),
          files: res.files,
          folders: res.folders
        });
        if (!--pending) done(null, results);
      });
    } else {
      if (stat && stat.isFile()) {
        const ext = path.extname(file).toLowerCase();

        if (['.vue'].includes(ext)) {
          results.files.push({
            size: stat.size,
            name: path.basename(file)
          });
        }
      }

      if (!--pending) done(null, results);
    }
  });
};

var dirTree = ('/var/www/FileBrowser');

getTreeSync(dirTree, (err, res) => {
  if (err) throw err;

  fs.writeFile('tree.json', JSON.stringify(res), err => {
    if (err) throw err;
    console.log('written');
  });

  // console.log(JSON.stringify(res));
});


// const dirTree__ = require('directory-tree');
// const filteredTree = dirTree__(dirTree, { extensions:/\.vue/ });

// fs.writeFile('tree2.json', JSON.stringify(filteredTree), err => {
//   if (err) throw err;
//   console.log('written');
// });

function safeReadDirSync(_path_) {
  let dirData = {};
  try {
    dirData = fs.readdirSync(_path_);
  } catch (ex) {
    if (ex.code === 'EACCES') {
      //User does not have permissions, ignore directory
      return null;
    } else throw ex;
  }
  return dirData;
}
