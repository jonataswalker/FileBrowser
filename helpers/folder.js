export function folderStatistics(folder) {
  const keys = Object.keys(folder.folders);
  let files = folder.files.length;
  let folders = keys.length;

  keys.forEach(id => {
    const subfolder = folder.folders[id];
    const subkeys = Object.keys(subfolder.folders);

    if (subkeys.length) {
      const result = folderStatistics(subfolder);
      files += result.files;
      folders += result.folders;
    } else {
      files += subfolder.files.length;
    }
  });

  return { files, folders };
}
