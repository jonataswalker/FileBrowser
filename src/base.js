var FileBrowser = function(opt_options){
  var defaultOptions = utils.deepExtend({}, FileBrowser.defaultOptions);
  this.options = utils.deepExtend(defaultOptions, opt_options);
  
  var $html = new FileBrowser.Html(this);
  var container = $html.createBrowser();
  var $drag = new FileBrowser.Drag(this);
  
  $html.createAlert();
  this.$tree = new FileBrowser.Tree(this);
  this.$alert = new FileBrowser.Alert(this);
  this.$upload = new FileBrowser.Upload(this);
  
  //this.maxZIndex = utils.getMaxZIndex();
  this.current_active = FileBrowser.elements.folder_tree_root;
  this.root_event_added = false;
  this.thumbs_root = [];
  this.thumbs_selected = [];
  this.path = utils.getPath();
  
  this.$tree.build();
  this.setListeners();
  $drag.when({
    start: function(){
      utils.addClass(container, 'dragging');
    },
    move: function(){
      container.style.left = this.x + 'px';
      container.style.top = this.y + 'px';
    },
    end: function(){
      utils.removeClass(container, 'dragging');
      if(this.y < 0) container.style.top = 0;
    }
  });
};
FileBrowser.prototype = {
  show: function(){
    FileBrowser.elements.container.style.zIndex = utils.getMaxZIndex() + 10;
    FileBrowser.elements.container.style.display = 'block';
    utils.setCenter(FileBrowser.elements.container);
  },
  setEditor: function(editor){
    //editor is an instance of CKeditor for instance
    this.options.editor = editor;
  },
  setListeners: function(){
    var
      $tree = this.$tree,
      $upload = this.$upload,
      els = FileBrowser.elements,
      //to not loose scope
      newFolder = function(){
        this.blur();
        $tree.newFolder();
      },
      removeFolder = function(){
        this.blur();
        $tree.removeFolder();
      },
      removeFile = function(){
        this.blur();
        $tree.removeFile();
      },
      sendEditor = function(){
        this.blur();
        $tree.sendEditor();
      },
      closeBrowser = function(){
        this.blur();
        $tree.closeBrowser();
      },
      upChoose = function(){
        this.blur();
        $upload.choose();
      },
      upStart = function(){
        this.blur();
        $upload.start();
      }
    ;
    els.btn_new_folder.addEventListener('click', newFolder, false);
    els.btn_del_folder.addEventListener('click', removeFolder, false);
    els.btn_upload_choose.addEventListener('click', upChoose, false);
    els.btn_upload_file.addEventListener('click', upStart, false);
    els.btn_del_file.addEventListener('click', removeFile, false);
    els.btn_editor.addEventListener('click', sendEditor, false);
    els.btn_close_grd.addEventListener('click', closeBrowser, false);
  }
};
FileBrowser.defaultOptions = {
  mode: 'plugin',
  root_http: 'http://localhost/testes/wrap2',
  server_http: '/gerenciador/gerenciador.php',
  regex_folder: /^[a-zA-Z0-9-_.]{1,10}$/,
  container_class: 'filebrowser-fb fb-container',
  alert_overlay_class: 'filebrowser-fb fb-alert-overlay',
  alert_container_class: 'filebrowser-fb fb-alert'
};
FileBrowser.constants = {
  'suffix-small': 'small',
  'suffix-medium': 'medium',
  'thumb-path': 'data-path',
  'thumb-sel': 'selected',
  'li-key': 'data-key'
};
FileBrowser.elements = {};
