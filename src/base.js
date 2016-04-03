/**
 * @constructor
 * @param {Object|undefined} opt_options Options.
 */
FB.Base = function(opt_options){
  var defaultOptions = utils.deepExtend({}, FB.defaultOptions);
  this.options = utils.deepExtend(defaultOptions, opt_options);
  
  FB.$base = this;
  FB.$html = new FB.Html();
  FB.$html.createBrowser();
  FB.$html.createAlert();
  
  FB.$drag = new FB.Drag();
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
  console.info(this);
  this.setListeners();
  FB.$drag.when({
    start: function(){
      utils.addClass(FB.container, 'dragging');
    },
    move: function(){
      FB.container.style.left = this.x + 'px';
      FB.container.style.top = this.y + 'px';
    },
    end: function(){
      utils.removeClass(FB.container, 'dragging');
      if(this.y < 0) FB.container.style.top = 0;
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
    this.options.editor = editor;
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
FB.defaultOptions = {
  mode: 'plugin',
  root_http: 'http://localhost/testes/wrap2',
  server_http: '/gerenciador/gerenciador.php',
  regex_folder: /^[a-zA-Z0-9-_.]{1,10}$/,
  container_class: 'filebrowser-fb fb-container',
  alert_overlay_class: 'filebrowser-fb fb-alert-overlay',
  alert_container_class: 'filebrowser-fb fb-alert'
};
FB.constants = {
  'suffix-small': 'small',
  'suffix-medium': 'medium',
  'thumb-path': 'data-path',
  'thumb-sel': 'selected',
  'li-key': 'data-key'
};
FB.elements = {};
