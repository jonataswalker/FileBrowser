CKEDITOR.plugins.add('filebrowser_upload', {
  init: function( editor ) {
    editor.addCommand('uploadDialog', new CKEDITOR.dialogCommand('uploadDialog', {
      allowedContent: 'img[src,alt,width,height]'
    }));
    
    editor.ui.addButton('filebrowser_upload', {
      label: 'FileBrowser',
      command: 'uploadDialog',
      toolbar: 'filebrowser,1',
      icon: this.path + 'camera.png'
    });
    
    editor.addCommand('uploadDialog', {
      exec: showUploadDialog
    });
  }
});