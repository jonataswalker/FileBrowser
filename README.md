# FileBrowser

[![Build Status](https://travis-ci.org/jonataswalker/FileBrowser.svg?branch=master)](https://travis-ci.org/jonataswalker/FileBrowser)

A multi-purpose filebrowser. This is initially intended to be a [CKEditor](http://ckeditor.com/) file browser plugin but can be easily adapted to integrate with [TinyMCE](https://www.tinymce.com/) among others.

![FileBrowser anim](https://raw.githubusercontent.com/jonataswalker/FileBrowser/screenshot/images/anim.gif)

### Demo with CKEditor
See [here a demo](http://rawgit.com/jonataswalker/FileBrowser/master/examples/ex1-ckeditor.html).

### Installation
##### With CKEditor
*  __Download__ and __enable__ the FileBrowser plugin which is inside `ckeditor/plugins/`:

    ```javascript
    // plugin name
    var browser_plugin = 'filebrowser_upload';
    // path to plugin
    var plugin_path = 'http://example.com/ckeditor/plugins/'
    
    // add it to CKEditor
    CKEDITOR.plugins.addExternal(browser_plugin, plugin_path + browser_plugin + '/');
    
    // instantiate CKEditor
    var ckeditor = CKEDITOR.replace('editor', {
      extraPlugins: 'filebrowser_upload',
      extraAllowedContent: 'img[src,alt,width,height]',
      toolbarGroups: [
        { name: 'basicstyles', groups: ['basicstyles', 'cleanup', 'colors'] },
        { name: 'tools', groups: ['tools'] },
        { name: 'upload', groups: ['filebrowser'] } // <==== here we are
      ]
    });
    ```

* Instantiate FileBrowser with some options and tell it about which is your CKEDITOR instance:
    ```javascript
      var browser = new FileBrowser({
        root_http: 'http://example.com/server-side/writable',
        server_http: 'http://example.com/server-side/filebrowser.php',
      });
      // ckeditor == instanceof CKEDITOR
      browser.setEditor(ckeditor);
      
      // this is a must
      // it is a global function which is expected by FileBrowser plugin
      window.showFileBrowser = function(){
        browser.show();
      };
    ```

*  __Download__ `server-side/*.php` and adjust according to your needs

### Notes

OK, I admit, this documentation is a bit incomplete, but we will get there.