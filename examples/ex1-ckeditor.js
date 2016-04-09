(function(win, doc){
  'use strict';
  
  var getRootPath = function(){
        var parts = win.location.pathname.split('/');
        parts.shift(); // remove first
        parts.pop(); // remove last
        parts.pop(); // yes, twice
        var path = parts.join('/');
        return '/' + path;
      },
      root_http = getRootPath(),
      browser_plugin = 'filebrowser_upload',
      plugin_dir = root_http + '/ckeditor/plugins/',
      openshift = 'http://filebrowser4openshift-jwalker.rhcloud.com',
      browser = new FileBrowser({
        root_http: openshift + '/server-side/writable',
        server_http: openshift + '/server-side/filebrowser.php',
      });

  CKEDITOR.plugins.addExternal(browser_plugin, plugin_dir + browser_plugin + '/');
  var ckeditor = CKEDITOR.replace('editor', {
    extraPlugins: 'filebrowser_upload',
    extraAllowedContent: 'img[src,alt,width,height]',
    toolbarGroups: [
      { name: 'basicstyles', groups: ['basicstyles', 'cleanup', 'colors'] },
      { name: 'tools', groups: ['tools'] },
      { name: 'upload', groups: ['filebrowser'] }
    ]
  });
  
  browser.setEditor(ckeditor);

  window.showFileBrowser = function(){
    browser.show();
  };
})(window, document);

