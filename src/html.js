/**
 * @constructor
 */
FB.Html = function () {};

FB.Html.prototype = {
  createBrowser: function () {
    var lang = FB.lang[FB.options.lang];
    
    var html = [
      '<div class="fb-wrap">',
      '<header>',
        '<div class="fb-header unselectable">',
          '<span>',
            lang.title,
          '</span>',
          '<span class="close"></span>',
        '</div>',
        '<h5 class="fb-message"></h5>',
        '<div class="fb-toolbar">',
          '<div class="fb-toolbar-items">',
            '<button id="btn-upload-choose" class="button-filebrowser">',
              '<i class="brankic-attachment"></i>',
              '<span>',
                lang.toolbar.bt_choose,
              '</span>',
            '</button>',
            '<button class="button-filebrowser hidden" id="btn-upload-send">',
              '<i class="brankic-upload"></i>',
              '<span>',
                lang.toolbar.bt_send,
              '</span>',
            '</button>',
            '<button class="button-filebrowser hidden" id="btn-del-file">',
              '<i class="brankic-trashcan"></i>',
              '<span>',
                lang.toolbar.bt_del_file,
              '</span>',
            '</button>',
            '<button class="button-filebrowser" id="btn-new-folder">',
              '<i class="icomoon-folder-plus"></i>',
              '<span>',
                lang.toolbar.bt_new_folder,
              '</span>',
            '</button>',
            '<button class="button-filebrowser" id="btn-del-folder" ',
              'style="display:none">',
              '<i class="icomoon-folder-minus"></i>',
              '<span>',
                lang.toolbar.bt_del_folder,
              '</span>',
            '</button>',
            '<button class="button-filebrowser hidden" id="btn-editor">',
              '<i class="brankic-edit"></i>',
              '<span>',
                lang.toolbar.bt_send_editor,
              '</span>',
            '</button>',
          '</div>',
        '</div>',
      '</header>',
      '<div class="fb-body clearfix">',
        '<div class="fb-tree-container">',
          '<ol id="fb-tree">',
            '<li id="fb-tree-folder-root" class="active open">',
              '<a>',
                '<i class="icomoon-folder"></i>',
                '<span id="folder-root-desc">',
                  lang.root_folder,
                '</span>',
              '</a>',
            '</li>',
          '</ol>',
        '</div>',
        '<div class="fb-thumb-container">',
          '<ul id="fb-thumb" class="fb-thumb clearfix"></ul>',
          //<!-- "js-fileapi-wrapper" -- required class -->
          '<div class="js-fileapi-wrapper">',
            '<input id="upload-input" class="input-file" name="files" ',
              'type="file" multiple />',
          '</div>',
          '<ul id="upload-thumb" class="fb-upload-thumb" data-label="',
            lang.preview,
          '"></ul>',
        '</div>',
      '</div>',
      '<footer class="fb-footer clearfix">',
        '<span></span>',
      '</footer>',
      '</div>'
    ].join('');
    
    
    var container = utils.createElement([
          'div', { classname: FB.constants.css.container }
        ], html),
        elements = {
          container: container,
          drag_handle: container.querySelector('.fb-header'),
          resize_handle: container.querySelector('.fb-footer > span'),
          grd_preview: container.querySelector('#fb-thumb'),
          folder_tree: container.querySelector('#fb-tree'),
          folder_tree_root: container.querySelector('#fb-tree-folder-root'),
          folder_root_desc: container.querySelector('#folder-root-desc'),
          upload_input: container.querySelector('#upload-input'),
          btn_upload_choose: container.querySelector('#btn-upload-choose'),
          btn_new_folder: container.querySelector('#btn-new-folder'),
          btn_del_folder: container.querySelector('#btn-del-folder'),
          btn_del_file: container.querySelector('#btn-del-file'),
          btn_upload_file: container.querySelector('#btn-upload-send'),
          btn_editor: container.querySelector('#btn-editor'),
          images_list: container.querySelector('#upload-thumb'),
          grd_msg: container.querySelector('.fb-message'),
          grd_drag: container.querySelector('.fb-header'),
          grd_resize: container.querySelector('.fb-footer'),
          desc_btn_del_file: container.querySelector('#btn-del-file span'),
          desc_btn_editor: container.querySelector('#btn-editor span'),
          btn_close_grd: container.querySelector('.fb-header span.close')
        };
    //add elements to FB.elements
    for(var el in elements){
      FB.elements[el] = elements[el];
    }
    container.style.position = 'fixed';
    container.style.zIndex = FB.$base.maxZIndex + 10;
    container.style.display = 'none';
    document.body.appendChild(container);
    FB.container = container;
  },
  createAlert: function () {
    var lang = FB.lang[FB.options.lang];
    
    var html = [
      '<div class="fb-icon fb-error" style="display:none;">',
        '<span class="fb-x-mark">',
        '<span class="fb-line fb-left"></span>',
        '<span class="fb-line fb-right"></span>',
        '</span>',
      '</div>',
      '<div class="fb-icon fb-warning" style="display:none;">',
        '<span class="fb-body"></span>',
        '<span class="fb-dot"></span>',
      '</div>',
      '<div class="fb-icon fb-info" style="display:none;"></div>',
      '<h2 class="fb-title"></h2>',
      '<div class="fb-text"></div>',
      '<fieldset><input type="text" style="display:none;"></fieldset>',
      '<div class="fb-error-container">',
        '<div class="icon">!</div>',
        '<div class="fb-error-text"></div>',
      '</div>',
      '<div class="fb-button-container">',
        '<button class="button-filebrowser cancel">',
          lang.alert.bt_cancel,
        '</button>',
        '<button class="button-filebrowser ok">',
          lang.alert.bt_ok,
        '</button>',
      '</div>'
    ].join('');
    
    var overlay = document.createElement('div'),
        container = utils.createElement([
          'div', { classname: FB.constants.css.alert_container }
        ], html),
        elements = {
          alert_overlay: overlay,
          alert_container: container,
          alert_title: container.querySelector('.fb-title'),
          alert_text: container.querySelector('.fb-text'),
          alert_input: container.querySelector('input[type="text"]'),
          alert_icon_error: container.querySelector('.fb-icon.fb-error'),
          alert_icon_warning: container.querySelector('.fb-icon.fb-warning'),
          alert_icon_info: container.querySelector('.fb-icon.fb-info'),
          alert_icon_success: container.querySelector('.fb-icon.fb-success'),
          alert_elem_error: container.querySelector('.fb-error-container'),
          alert_error_text: container.querySelector('.fb-error-text'),
          alert_ok: container.querySelector('button.ok'),
          alert_cancel: container.querySelector('button.cancel')
        };
    //add elements to FB.elements
    for(var el in elements){
      FB.elements[el] = elements[el];
    }
    
    overlay.className = FB.constants.css.alert_overlay;
    overlay.style.zIndex = FB.$base.maxZIndex + 11;
    container.style.zIndex = FB.$base.maxZIndex + 12;
    container.style.display = 'none';
    document.body.appendChild(overlay);
    document.body.appendChild(container);
    
    return container;
  }
};
