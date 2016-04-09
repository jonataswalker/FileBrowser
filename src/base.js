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
  FB.$internal = new FB.Internal();
  
  FB.$tree.build();
  FB.$internal.setListeners();
};

FB.Base.prototype = {
  show: function(){
    FB.container.style.zIndex = utils.getMaxZIndex() + 10;
    FB.container.style.display = 'block';
    utils.setCenter(FB.container);
  },
  setEditor: function(editor){
    //editor is an instance of CKeditor for example
    FB.options.editor = editor;
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
  suffix_big: 'big',
  thumb_path: 'data-path',
  thumb_sel: 'selected',
  li_key: 'data-key'
};

FB.defaultOptions = {
  mode: 'plugin',
  lang: 'en',
  root_http: '/',
  server_http: 'filebrowser.php',
  regex_folder: /^[a-zA-Z0-9-_.]{1,10}$/,
  upload_types: [FB.constants.types.image],
  image: {
    min_width: 120, // pixels
    min_height: 120,
    transform: {
      big: { maxWidth: 1200, maxHeight: 800 },
      small: { maxWidth: 320, maxHeight: 240 }
    }
  }
};

FB.elements = {};

FB.lang = {};
