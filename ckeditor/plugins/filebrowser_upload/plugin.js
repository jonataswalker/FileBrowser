CKEDITOR.plugins.add('filebrowser_upload', {
  init: function( editor ) {
    editor.addCommand('FileBrowserDialog', new CKEDITOR.dialogCommand('FileBrowserDialog', {
      allowedContent: 'img[src,alt,width,height]'
    }));
    
    editor.ui.addButton('filebrowser_upload', {
      label: 'FileBrowser',
      command: 'FileBrowserDialog',
      toolbar: 'filebrowser,1',
      icon: this.path + 'camera.png'
    });
    
    editor.addCommand('FileBrowserDialog', {
      exec: showFileBrowser
    });
  }
});