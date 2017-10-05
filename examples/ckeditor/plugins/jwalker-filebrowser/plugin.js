CKEDITOR.plugins.add('jwalker-filebrowser', {
  init: function (editor) {
    editor.addCommand(
      'FileBrowserDialog',
      new CKEDITOR.dialogCommand('FileBrowserDialog', {
        allowedContent: 'img[src,alt,width,height]'
      })
    );

    editor.ui.addButton('jwalker-filebrowser', {
      label: 'FileBrowser',
      command: 'FileBrowserDialog',
      toolbar: 'filebrowser,1',
      icon: this.path + 'filebrowser.png'
    });

    editor.addCommand('FileBrowserDialog', {
      exec: showFileBrowser
    });
  }
});