CKEDITOR.plugins.add('filebrowser_upload', {
  init: function( editor ) {
    editor.addCommand('uploadDialog', new CKEDITOR.dialogCommand('uploadDialog'));
    
    editor.ui.addButton('filebrowser_upload', {
      label: 'Envio de Imagens',
      command: 'uploadDialog',
      toolbar: 'filebrowser,1',
      icon: this.path + 'camera.png'
    });
    
    editor.addCommand('uploadDialog', {
      exec: showUploadDialog
    });
  }
});