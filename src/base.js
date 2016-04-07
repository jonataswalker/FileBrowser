/**
 * @constructor
 * @param {Object|undefined} opt_options Options.
 */
FB.Base = function(opt_options){
  var defaultOptions = utils.deepExtend({}, FB.defaultOptions);
  FB.options = utils.deepExtend(defaultOptions, opt_options);
  
  FB.$base = this;
  FB.$html = new FB.Html();
  FB.$html.createBrowser();
  FB.$html.createAlert();
  
  FB.$drag = new FB.DragAndResize();
  FB.$tree = new FB.Tree();
  FB.$alert = new FB.Alert();
  FB.$upload = new FB.Upload();
  
  //this.maxZIndex = utils.getMaxZIndex();
  this.current_active = FB.elements.folder_tree_root;
  this.root_event_added = false;
  this.thumbs_root = [];
  this.thumbs_selected = [];
  this.path = utils.getPath();
  
  FB.$tree.build();
  this.setListeners();
  FB.$drag.when({
    startDragging: function(){
      utils.addClass(FB.container, 'dragging');
    },
    dragging: function(){
      FB.container.style.left = this.x + 'px';
      FB.container.style.top = this.y + 'px';
    },
    endDragging: function(){
      utils.removeClass(FB.container, 'dragging');
      if(this.y < 0) FB.container.style.top = 0;
    },
    resizing: function(){
      FB.container.style.width = this.w + 'px';
      FB.container.style.height = this.h + 'px';
    },
    endResizing: function(){
      var min_width = 400, min_height = 300;
      if(this.w < min_width)
        FB.container.style.width = min_width + 'px';
      if(this.h < min_height)
        FB.container.style.height = min_height + 'px';
    }
  });
};
FB.Base.prototype = {
  show: function(){
    FB.container.style.zIndex = utils.getMaxZIndex() + 10;
    FB.container.style.display = 'block';
    utils.setCenter(FB.container);
  },
  setEditor: function(editor){
    //editor is an instance of CKeditor for instance
    FB.options.editor = editor;
  },
  setListeners: function(){
    var els = FB.elements,
        //to not loose scope
        newFolder = function(){
          this.blur();
          FB.$tree.newFolder();
        },
        removeFolder = function(){
          this.blur();
          FB.$tree.removeFolder();
        },
        removeFile = function(){
          this.blur();
          FB.$tree.removeFile();
        },
        sendEditor = function(){
          this.blur();
          FB.$tree.sendEditor();
        },
        closeBrowser = function(){
          this.blur();
          FB.$tree.closeBrowser();
        },
        upChoose = function(){
          this.blur();
          FB.$upload.choose();
        },
        upStart = function(){
          this.blur();
          FB.$upload.start();
        };
    els.btn_new_folder.addEventListener('click', newFolder, false);
    els.btn_del_folder.addEventListener('click', removeFolder, false);
    els.btn_upload_choose.addEventListener('click', upChoose, false);
    els.btn_upload_file.addEventListener('click', upStart, false);
    els.btn_del_file.addEventListener('click', removeFile, false);
    els.btn_editor.addEventListener('click', sendEditor, false);
    els.btn_close_grd.addEventListener('click', closeBrowser, false);
  }
};

FB.constants = {
  css: {
    container: 'filebrowser-fb fb-container',
    alert_overlay: 'filebrowser-fb fb-alert-overlay',
    alert_container: 'filebrowser-fb fb-alert'
  },
  types: {
    image: 'image'
  },
  actions: {
    upload: 'upload',
    new_folder: 'new-folder',
    delete_folder: 'del-folder',
    delete_file: 'del-file',
    get_thumbs: 'get-thumbs',
  },
  suffix_small: 'small',
  suffix_medium: 'medium',
  thumb_path: 'data-path',
  thumb_sel: 'selected',
  li_key: 'data-key'
};

FB.defaultOptions = {
  mode: 'plugin',
  lang: 'en',
  root_http: '/',
  server_http: 'browser.php',
  regex_folder: /^[a-zA-Z0-9-_.]{1,10}$/,
  upload_types: [FB.constants.types.image],
  image: {
    min_width: 120, // pixels
    min_height: 120
  }
};

FB.elements = {};

FB.lang = {};
