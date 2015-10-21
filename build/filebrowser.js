(function(win, doc){
  'use strict';
  
  var FileBrowser = (function(){

    var FileBrowser = function(opt_options){
  var
    defaultOptions = utils.deepExtend({}, FileBrowser.defaultOptions),
    options = this.options = utils.deepExtend(defaultOptions, opt_options),
    $html = new FileBrowser.Html(this),
    container = $html.createBrowser(),
    $drag = new FileBrowser.Drag(this)
  ;
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
(function(FileBrowser, win, doc){
  
  FileBrowser.Tree = function(browser){
    this.browser = browser;
    this.els = FileBrowser.elements;
    this.options = browser.options;
  };
  FileBrowser.Tree.prototype = {
    get: function(){
      utils.addClass(this.els.grd_preview, 'mapeando-spinner');
      
      var when = {}, this_ = this;
      utils.json(this.options.server_http, {
        action: 'thumbs'
      }).when({
        ready: function(response) {
          
          utils.removeClass(this_.els.grd_preview, 'mapeando-spinner');
          if("files" in response.tree){
            this_.browser.thumbs_root = response.tree.files;
            this_.loadThumbs(this_.browser.thumbs_root);
          }
          if("dirs" in response.tree){
            when.ready.call(undefined, {
              dirs: response.tree.dirs
            });
          }
          this_.updateCountFolder();
        }
      });
      
      return {
        when: function(obj){
          when.ready = obj.ready;
        }
      };
    },
    build: function(){
      var this_ = this;
      this.get().when({
        ready: function(response) {
          this_.buildTree(response.dirs);
          this_.treeEvents(response.dirs);
        }
      });
    },
    buildTree: function(json){
      var this_ = this;
      var createFolder = function(folder, statistics, parent, last_created){
        var
          row = {
            folder: folder,
            'n-files': statistics.files,
            'n-files-all': statistics['files-all'],
            'n-folders': statistics.folders,
            last: last_created
          },
          html = this_.folderTemplate(row),
          ol = utils.createElement(['ol',{classname:'collapse'}], html),
          appended = parent.appendChild(ol)
        ;
        return appended;
      };
      var recursive = function(obj, parent){
        var keys = Object.keys(obj),
          len = keys.length,
          i = -1, prop, value,
          appended, last, statistics = {}
        ;
        while (++i < len) {
          prop = keys[i];
          value = obj[prop];
          last = (value.last === true) ? 1 : 0;
          statistics = {
            files: (value.files) ? value.files.length : 0,
            'files-all': value['c-files'],
            folders: value['c-folders']
          };
          
          appended = createFolder(prop, statistics, parent, last);
          
          if(value.dirs){
            recursive(value.dirs, appended.firstChild);
          }
        }
      };
      var 
        keys = Object.keys(json),
        len = keys.length,
        i = -1,
        prop, value, appended,
        last_created,
        statistics = {}
      ;
      while (++i < len) {
        prop = keys[i];
        value = json[prop];
        last_created = (value.last === true) ? 1 : 0;
        statistics = {
          files: (value.files) ? value.files.length : 0,
          'files-all': value['c-files'],
          folders: value['c-folders']
        };
        
        appended = createFolder(
          prop,
          statistics,
          this.els.folder_tree_root,
          last_created
        );
        
        if(value.dirs){
          recursive(value.dirs, appended.firstChild);
        }
      }
    },
    showHeaderMessage: function(obj){
      var this_ = this;
      this.els.grd_msg.textContent = obj.msg;
      utils.addClass(this.els.grd_msg, ['show', obj.type]);
      window.setTimeout(function(){
          utils.removeClass(this_.els.grd_msg, ['show', obj.type]);
      }, obj.duration);
    },
    renewTree: function(tree){
      this.removeTree();
      this.emptyThumbSelected();
      //to renew thumbs
      this.removeThumbs();
      utils.emptyArray(this.browser.thumbs_root);
      this.browser.current_active = false;
      
      if(Array.isArray(tree) && tree.length === 0){
        //empty return
        this.updateCountFolder();
        utils.fireClick(this.els.folder_tree_root);
        return;
      }
      
      if("files" in tree){
        this.browser.thumbs_root = tree.files;
        this.loadThumbs(this.browser.thumbs_root);
      }
      if("dirs" in tree){
        this.buildTree(tree.dirs);
        this.treeEvents(tree.dirs);
      }
      this.updateCountFolder();
      this.setFolderActive();
    },
    newFolder: function(){
      var
        this_ = this,
        $alert = this.browser.$alert,
        regex = this.options.regex_folder,
        msg_error = '<p>Preenchimento mínimo: 1 - máximo: 10;<br>Apenas '
          + '<strong>letras</strong>, <strong>números</strong> e os seguintes'
          + ' caracteres: <span class="destaque">. - _</span></p>',
        checkInput = function(){
          //this = input value
          if (regex.test(this)) {
            $alert.hideInputError();
          } else {
            $alert.showInputError(msg_error);
          }
        },
        submit = function(){
          //this = input value
          if(!regex.test(this)){
            $alert.showInputError(msg_error);
            return;
          }

          this_.submitFolder(this, 'nova-pasta').when({
            ready: function(response) {
              if(response.erro === false){
                this_.renewTree(response.tree);
                $alert.close();
              } else {
                $alert.showInputError(response.msg);
              }
            }
          });
        },
        parents = this.getFolderPath(this.browser.current_active),
        i = parents.length,
        path = '<span>Pasta Principal</span>'
      ;
      parents.reverse();
      while(i--){
        path += '&nbsp;&rarr;&nbsp;<span>'+ parents[i] +'</span>';
      }
      
      var
        text = '<p>Esta pasta será criada em: </p>'
          + '<p class="folder-path">'+path+'</p>',
        msg_input = 'Preenchimento mínimo: 1 - máximo: 10;<br>Apenas '
          + '<strong>letras</strong>, <strong>números</strong>'
          + ' e os seguintes caracteres: <span class="destaque">. - _</span>',
        html = {
          title: 'Nova Pasta',
          text: text
        }
      ;
      $alert.prompt({
        placeholder: 'Nova Pasta',
        html: html,
        checkInput: checkInput,
        submit: submit
      });
    },
    submitFolder: function(value, action){
      //exclude current from parents
      var 
        parents = (action == 'del-pasta') ?
          this.getFolderPath(this.browser.current_active, true) :
          this.getFolderPath(this.browser.current_active),
        when = {}
      ;
      
      utils.post(this.options.server_http, {
        action: action,
        folder: value,
        parents: parents.join()
      }).when({
        ready: function(response) {
          when.ready.call(undefined, response);
        }
      });
      return {
        when: function(obj){
          when.ready = obj.ready;
        }
      };
    },
    removeFolder: function(){
      var
        this_ = this,
        $alert = this.browser.$alert,
        current = this.browser.current_active,
        parent = this.getFolderParent(current),
        folder = current.getAttribute('data-key'),
        n_files = current.getAttribute('data-files-all'),
        n_folders = current.getAttribute('data-folders'),
        submit = function(){
          this_.submitFolder(folder, 'del-pasta').when({
            ready: function(response) {
              if(response.erro === false){
                this_.renewTree(response.tree);
                $alert.close();
              } else {
                $alert.showInputError(response.msg);
              }
            }
          });
        },
        text = [
          '<p class="folder-path">Esta pasta <span>'+folder+'</span>',
          'será removida e também todo seu conteúdo: </p>',
          '<p>Total de Arquivos: <span class="destaque">'+n_files+'</span>',
          ' &mdash; Total de Subpastas: <span class="destaque">',
          n_folders + '</span></p>'
        ].join(''),
        html = {
          title: 'Remover Pasta',
          text: text
        }
      ;
      
      $alert.confirm({
        html: html,
        submit: submit
      });
    },
    removeFile: function(){
      var
        this_ = this,
        $alert = this.browser.$alert,
        parent = this.getFolderParent(this.browser.current_active),
        submit = function(){
          utils.post(this_.options.server_http, {
            action: 'del-file',
            files: this_.browser.thumbs_selected.join()
          }).when({
            ready: function(response) {
              this_.renewTree(response.tree);
              $alert.close();
            }
          });
        },
        text = '<p>Total de Arquivos: <span class="destaque">' +
          this.browser.thumbs_selected.length+'</span></p>',
        html = {
          title: 'Remover Arquivo(s)',
          text: text
        }
      ;
      $alert.confirm({
        html: html,
        submit: submit
      });
    },
    setFolderActive: function(){
      //find last created
      var
        this_ = this,
        lis = utils.find('li', this.els.folder_tree_root, true),
        lis_len = lis.length,
        found = false,
        li, attr, parents,
        i = -1,
        setCreatedActive = function(li){
          var
            parent = li.parentNode,
            siblings, cond = true
          ;
          while(cond){
            if(parent){
              if(parent == this_.els.folder_tree_root){
                cond = false;
              } else if(parent.tagName == 'OL'){
                siblings = utils.getSiblings(parent, 'ol');
                utils.removeClass(siblings, 'collapse');
                utils.removeClass(parent, 'collapse');
              }
            } else {
              cond = false;
            }
            parent = parent.parentNode;
          }
          utils.fireClick(li);
        }
      ;
      
      while(++i < lis_len){
        li = lis[i];
        attr = li.getAttribute('data-last');
        
        if(attr == 1){
          found = true;
          setCreatedActive(li);
          break;
        }
      }
      //if none found click root folder
      if(!found || lis_len === 0){
        utils.fireClick(this.els.folder_tree_root);
      }
    },
    getFolderPath: function(li, exclude){
      var parents = [];
      if(exclude){
        li = li.parentNode;
      }
      while (li && li !== this.els.folder_tree_root) {
        if (li.tagName == 'LI') {
          parents.unshift(li.getAttribute('data-key'));
        }
        li = li.parentNode;
      }
      return parents;
    },
    getFolderParent: function(li){
      li = li.parentNode;
      var cond = true, parent;
      while (li && cond) {
        if(li.tagName == 'LI'){
          parent = li;
          cond = false;
        }
        li = li.parentNode;
      }
      return parent;
    },
    treeEvents: function(root_tree){
      var 
        this_ = this,
        $upload = this.browser.$upload,
        lis = utils.find('li', this.els.folder_tree, true),
        lis_len = lis.length
      ;
      // FIXME return what?
      if(lis_len === 0) return;
      
      var setParentOpen = function(li){
        var cond = true;
        li = li.parentNode;
        while (li && cond) {
          if(li.tagName == 'LI'){
            utils.addClass(li, 'open');
            if(li == this_.els.folder_tree_root){
              cond = false;
            }
          }
          li = li.parentNode;
        }
      };
      var toggle = function(li){
        var 
          openned = utils.hasClass(li, 'open'),
          active = utils.hasClass(li, 'active'),
          children = utils.getChildren(li, 'ol'),
          children_ol_recursive = utils.getAllChildren(li, 'ol'),
          children_li_recursive = utils.getAllChildren(li, 'li')
        ;

        if(openned && active){
          utils.addClass(children_ol_recursive, 'collapse');
          utils.removeClass(children_li_recursive, 'open');
          utils.removeClass(li, 'open');
        } else if(openned){
          utils.addClass(children_ol_recursive, 'collapse');
          utils.removeClass(children_li_recursive, 'open');
          utils.removeClass(li, 'open');
        } else{
          utils.removeClass(children, 'collapse');
          utils.addClass(li, 'open');
        }
        this_.browser.current_active = li;
        utils.addClass(li, 'active');
      };
      var findFiles = function(keys, tree_node, depth){
        var len_tree = Object.keys(tree_node).length,
          len_keys = keys.length,
          k, current, files;

        depth = depth || 1;
        for(k in tree_node){
          if(k == keys[depth - 1]){ //root coincide
            if(depth == len_keys){ //don't go deeper
              files = tree_node[k];
              if(files && 'files' in files){
                this_.loadThumbs(files.files);
                break;
              }
            } else {
              ++depth;
              findFiles(keys, tree_node[k].dirs, depth);
            }
          }
        }
        return false;
      };
      var thumb = function(li, tree){
        if(li == this_.els.folder_tree_root){
          this_.loadThumbs(this_.browser.thumbs_root);
          return;
        }
        
        var keys = [];
        while (li && li !== this_.els.folder_tree_root) {
          if(li.tagName == 'LI'){
            keys.unshift(li.getAttribute('data-key'));
          }
          li = li.parentNode;
        }
        findFiles(keys, tree);
      };
      var clickFolder = function(evt){
        evt.stopPropagation();
        $upload.showTree();
        //this is <li>
        if(this != this_.browser.current_active) {
          this_.removeThumbs();
          thumb(this, root_tree);
        }
        
        this_.browser.current_active = 
            this_.browser.current_active || this_.els.folder_tree_root;

        utils.removeClass(this_.browser.current_active, 'active');
        setParentOpen(this);
        toggle(this);
        
        //hide btn_del_folder if root
        if (this == this_.els.folder_tree_root) {
          this_.els.btn_del_folder.style.display = 'none';
        } else {
          this_.els.btn_del_folder.style.display = '';
        }
      };
      var i = -1;
      while(++i < lis_len){
        // FIXME maybe move this to a function
        // https://jslinterrors.com/dont-make-functions-within-a-loop
        (function(i){
          var li = lis[i];
          if(i === 0){
            var children = utils.getChildren(li, 'ol');
            if(children.length > 0){
              utils.removeClass(children, 'collapse');
            }
          }
          if(li == this_.els.folder_tree_root){
            if(!this_.browser.root_event_added){
              li.addEventListener('click', clickFolder, false);
              this_.browser.root_event_added = true;
            }
          } else {
            li.addEventListener('click', clickFolder, false);
          }
        })(i);
      }
    },
    emptyThumbSelected: function(){
      var lis = utils.find('li', this.els.grd_preview, true);
      utils.emptyArray(this.browser.thumbs_selected);
      utils.removeClass(lis, FileBrowser.constants['thumb-sel']);
      this.buttonThumbRemoveHandler();
    },
    buttonThumbRemoveHandler: function(){
      var 
        len_sel = this.browser.thumbs_selected.length,
        btn_desc = (len_sel > 1) ? 'Remover Arquivos' : 'Remover Arquivo'
      ;
      if(len_sel > 0){
        utils.removeClass(this.els.btn_editor, 'hidden');
        utils.removeClass(this.els.btn_del_file, 'hidden');
        this.els.desc_btn_del_file.textContent = btn_desc + ' ('+len_sel+')';
        this.els.desc_btn_editor.textContent = 
            'Enviar para o Editor ('+len_sel+')';
      } else {
        utils.addClass(this.els.btn_editor, 'hidden');
        utils.addClass(this.els.btn_del_file, 'hidden');
      }
    },
    updateCountFolder: function(){
      this.els.folder_root_desc.textContent = 
          'Pasta Principal ('+ this.browser.thumbs_root.length +')';
    },
    removeThumbs: function(){
      utils.removeAllChildren(this.els.grd_preview);
    },
    loadThumbs: function(files, initial){
      var 
        this_ = this,
        row, html, li,
        url = this.options.root_http,
        count = files.length,
        i = -1, file, path, selected,
        thumbSelect = function(){
          utils.toggleClass(this, FileBrowser.constants['thumb-sel']);
          var 
            selected = utils.hasClass(this, FileBrowser.constants['thumb-sel']),
            attr = this.getAttribute(FileBrowser.constants['thumb-path'])
          ;
          if (selected) {
            this_.browser.thumbs_selected.push(attr);
          } else {
            utils.removeArrayEntry(this_.browser.thumbs_selected, attr);
          }

          this_.buttonThumbRemoveHandler();
        }
      ;
      
      while(++i < count){
        file = files[i];
        path = file.relative_path + file.filename;
        // FIXME change this ternary
        selected = (this.browser.thumbs_selected.indexOf(path) > -1) ? true : false;
        row = {
          filename: file.filename,
          date: file.date,
          filesize: file.filesize,
          url: url + path
        };
        html = this.thumbTemplate(row);
        li = utils.createElement([
          'li',
          {
            classname: (selected) ? FileBrowser.constants['thumb-sel'] : '',
            attr: [{ 
              name: FileBrowser.constants['thumb-path'],
              value: path
            }]
          }
        ], html);
        
        this.els.grd_preview.appendChild(li);
        li.addEventListener('click', thumbSelect, false);
      }
    },
    sendEditor: function(){
      var
        editor = this.options.editor,
        c = this.browser.thumbs_selected.length,
        i = -1, img, filename
      ;
      while(++i < c){
        filename = this.browser.thumbs_selected[i].replace(
          FileBrowser.constants['suffix-small'],
          FileBrowser.constants['suffix-medium']
        );
        editor.insertHtml('<img src="'+ this.options.root_http + filename+'">');
      }
      this.emptyThumbSelected();
      this.closeBrowser();
    },
    closeBrowser: function(){
      this.els.container.style.display = 'none';
    },
    removeTree: function(){
      var elements = this.els.folder_tree_root.getElementsByTagName('ol');
      utils.removeAll(elements);
    },
    thumbTemplate: function(row){
      var str = [
        '<a class="brankic-checked" style="background-image:url({url})">',
          '<span class="fb-fileinfo">',
            '<span class="fb-fileinfo-center">',
              '<span>{filename}</span>',
              '<span>{date}<br>{filesize}</span>',
            '</span>',
          '</span>',
        '</a>'
      ].join('');
      return utils.template(str, row);
    },
    folderTemplate: function(row){
      var str = [
        '<li data-key="{folder}" data-last="{last}" ',
          'data-files-all="{n-files-all}" data-folders="{n-folders}"><a>',
          '<i class="icomoon-folder"></i>',
          '<span>{folder} ({n-files})</span>',
        '</a></li>'
      ].join('');
      return utils.template(str, row);
    }
  };
})(FileBrowser, win, doc);

(function(FileBrowser, win, doc){

  FileBrowser.Html = function(browser){
    this.browser = browser;
  };
  FileBrowser.Html.prototype = {
    createBrowser: function(){
      var
        options = this.browser.options,
        container = utils.createElement([
          'div', { classname: options.container_class }
        ], FileBrowser.Html.browser),
        elements = {
          container: container,
          drag_handle: container.querySelector('.fb-header'),
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
          btn_close_grd: container.querySelector('.fb-header button')
        }
      ;
      //add elements to FileBrowser.elements
      for(var el in elements){
        FileBrowser.elements[el] = elements[el];
      }
      container.style.zIndex = this.browser.maxZIndex + 10;
      container.style.display = 'none';
      doc.body.appendChild(container);
      return container;
    },
    createAlert: function(){
      var
        options = this.browser.options,
        overlay = doc.createElement('div'),
        container = utils.createElement([
          'div', { classname: options.alert_container_class }
        ], FileBrowser.Html.alert),
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
        }
      ;
      //add elements to FileBrowser.elements
      for(var el in elements){
        FileBrowser.elements[el] = elements[el];
      }
      
      overlay.className = options.alert_overlay_class;
      overlay.style.zIndex = this.browser.maxZIndex + 11;
      container.style.zIndex = this.browser.maxZIndex + 12;
      container.style.display = 'none';
      doc.body.appendChild(overlay);
      doc.body.appendChild(container);
      
      return container;
    }
  };
  
  FileBrowser.Html.browser = [
    '<div class="fb-header unselectable">',
      '<span>Gerenciador de Imagens</span>',
      '<button>&times;</button>',
    '</div>',
    '<h5 class="fb-message"></h5>',
    '<div class="fb-toolbar">',
      '<div class="fb-toolbar-items">',
        '<button id="btn-upload-choose" class="button-filebrowser">',
          '<i class="brankic-attachment"></i>',
          '<span>Escolha</span>',
        '</button>',
        '<button class="button-filebrowser hidden" id="btn-upload-send">',
          '<i class="brankic-upload"></i>',
          '<span>Envie</span>',
        '</button>',
        '<button class="button-filebrowser hidden" id="btn-del-file">',
          '<i class="brankic-trashcan"></i>',
          '<span>Remover Arquivo</span>',
        '</button>',
        '<button class="button-filebrowser" id="btn-new-folder">',
          '<i class="icomoon-folder-plus"></i>',
          '<span>Nova Pasta</span>',
        '</button>',
        '<button class="button-filebrowser" id="btn-del-folder" ',
          'style="display:none">',
          '<i class="icomoon-folder-minus"></i>',
          '<span>Remover Pasta</span>',
        '</button>',
        '<button class="button-filebrowser hidden" id="btn-editor">',
          '<i class="brankic-edit"></i>',
          '<span>Enviar para o Editor</span>',
        '</button>',
      '</div>',
    '</div>',
    '<div class="fb-body clearfix">',
      '<div class="fb-tree-container">',
        '<ol id="fb-tree">',
          '<li id="fb-tree-folder-root" class="active open">',
            '<a>',
              '<i class="icomoon-folder"></i>',
              '<span id="folder-root-desc">Pasta Principal</span>',
            '</a>',
          '</li>',
        '</ol>',
      '</div>',
      '<div id="" class="fb-thumb-container">',
        '<ul id="fb-thumb" class="fb-thumb"></ul>',
        //<!-- "js-fileapi-wrapper" -- required class -->
        '<div class="js-fileapi-wrapper">',
          '<input id="upload-input" class="input-file" name="files" ',
            'type="file" multiple />',
        '</div>',
        '<ul id="upload-thumb" class="fb-upload-thumb" ',
          'data-label="Prévia do Envio"></ul>',
      '</div>',
    '</div>',
    '<div class="fb-footer">',
      '<span></span><span></span>',
    '</div>'
  ].join('');
  FileBrowser.Html.alert = [
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
      '<button class="button-filebrowser cancel">Cancelar</button>',
      '<button class="button-filebrowser ok">OK</button>',
    '</div>'
  ].join('');
})(FileBrowser, win, doc);
(function(FileBrowser, win, doc){

  FileBrowser.Drag = function(browser, options){
    this.browser = browser;
    var
      container = FileBrowser.elements.container,
      handle = FileBrowser.elements.drag_handle || container,
      lastX, lastY, currentX, currentY, x, y,
      when = {},
      startDragging = function(evt){
        if(evt.button !== 0) return;
        lastX = evt.clientX;
        lastY = evt.clientY;
        when.start.call({target: container});
        doc.addEventListener('mousemove', dragging, false);
        doc.addEventListener('mouseup', stopDragging, false);
      },
      dragging = function(evt){
        /* jshint -W030 */
        evt.preventDefault && evt.preventDefault();
        
        currentX = parseInt(container.style.left, 10) || 0;
        currentY = parseInt(container.style.top, 10) || 0;
        
        x = currentX + (evt.clientX - lastX);
        y = currentY + (evt.clientY - lastY);
        
        when.move.call({
          target: container,
          x: x,
          y: y
        });
        lastX = evt.clientX;
        lastY = evt.clientY;
      },
      stopDragging = function(evt){
        doc.removeEventListener('mousemove', dragging, false);
        doc.removeEventListener('mouseup', stopDragging, false);
        
        when.end.call({
          target: container,
          x: x,
          y: y
        });
      }
    ;
    handle.addEventListener('mousedown', startDragging, false);
    return {
      when: function(obj){
        when.start = obj.start;
        when.move = obj.move;
        when.end = obj.end;
      }
    };
  };
})(FileBrowser, win, doc);
(function(FileBrowser, win, doc){

  FileBrowser.Upload = function(browser, options){
    this.browser = browser;
    this.els = FileBrowser.elements;
    this.options = browser.options;
    this.files = [];
    this.index = 0;
    this.active = false;
    this.path_parents = '';
    this.setListeners();
  };
  FileBrowser.Upload.prototype = {
    setListeners: function(){
      var
        this_ = this,
        $tree = this.browser.$tree
      ;
      FileAPI.event.on(this.els.upload_input, 'change', function (evt){
        var files = FileAPI.getFiles(evt);
        
        FileAPI.filterFiles(files,
          function (file, info){
            return /^image/.test(file.type) ?
              info.width >= 120 && info.height >= 120 : false;
          },
          function(files, rejected){
            if(rejected && rejected.length > 0){
              $tree.showHeaderMessage({
                msg: 'Apenas imagens com no mínimo 120x120!',
                duration: 3500,
                type: 'alert'
              });
            }
            /* jshint -W030 */
            files.length && this_.add(files);
          }
        );
      });
    },
    choose: function(){
      utils.fireClick(this.els.upload_input);
    },
    showPreview: function(){
      this.els.grd_preview.style.display = 'none';
      this.els.images_list.style.display = '';
      utils.removeClass(this.els.btn_upload_file, 'hidden');
    },
    showTree: function(){
      this.els.grd_preview.style.display = '';
      this.els.images_list.style.display = 'none';
      utils.addClass(this.els.btn_upload_file, 'hidden');
    },
    add: function(files){
      var
        this_ = this,
        $tree = this.browser.$tree,
        row, html, li, left
      ;
      
      this.showPreview();
      $tree.emptyThumbSelected();
      
      FileAPI.each(files, function(file){
        this_.files.push(file);
        FileAPI.Image(file).preview(70).get(function(err, img){
          row = {
            name: file.name,
            size: utils.bytesToSize(file.size)
          };
          html = this_.thumbTemplate(row);
          li = utils.createElement('li', html);
          li.id = 'file-' + FileAPI.uid(file);
          this_.els.images_list.appendChild(li);
          left = utils.find('.fb-preview-left', li);
          left.appendChild(img);
        });
      });
      window.setTimeout(function(){
        utils.fireClick(this_.els.btn_upload_file);
      }, 300);
    },
    thumbTemplate: function(row){
      var str = [
        '<div class="fb-preview-left"></div>',
        '<div class="fb-preview-right">',
          '<div class="fb-preview-filename">',
            '<span>{name}</span><br/>',
            '<span>tamanho: {size}</span>',
          '</div>',
          '<div class="fb-preview-progress">',
            '<div class="fb-progress-bar"></div>',
          '</div>',
        '</div>'
      ].join('');
      return utils.template(str, row);
    },
    getFileById: function(id){
      var i = this.files.length;
      while( i-- ){
        if( FileAPI.uid(this.files[i]) == id ){
          return this.files[i];
        }
      }
    },
    start: function(){
      var
        this_ = this,
        $tree = this.browser.$tree,
        len = this.files.length
      ;

      this.path_parents = $tree.getFolderPath(this.browser.current_active);
      if(this.active){
        $tree.showHeaderMessage({
          msg: 'Um envio já está em andamento!',
          duration: 1500,
          type: 'alert'
        });
        return;
      } else{
        if(len === 0){
          $tree.showHeaderMessage({
            msg: 'Nenhum arquivo foi selecionado!',
            duration: 1500,
            type: 'alert'
          });
          return;
        } else if(len == this.index){
          $tree.showHeaderMessage({
            msg: 'Todos os arquivos já foram enviados!',
            duration: 1500,
            type: 'alert'
          });
          return;
        }
      }
      this.start_();
    },
    start_: function(){
      if(!this.active && (this.active = this.files.length > this.index)){
        this.upload_(this.files[this.index]);
      }
    },
    abort: function(id){
      var file = this.getFileById(id);
      if (file.xhr) {
        file.xhr.abort();
      }
    },
    getEl_: function(file, sel){
      var el = utils.$('file-'+FileAPI.uid(file));
      return (sel) ? utils.find(sel, el) : el;
    },
    upload_: function(file){
      var
        this_ = this,
        $tree = this.browser.$tree,
        li = this.getEl_(file),
        progress_el = this.getEl_(file, '.fb-progress-bar')
      ;

      if (!file) return;
 
      file.xhr = FileAPI.upload({
        url: this.options.server_http,
        files: { file: file },
        data: {
          action: 'upload',
          parents: this.path_parents.join()
        },
        imageOriginal: false,
        imageTransform: {
          big: { maxWidth: 800, maxHeight: 600 },
          medium: { maxWidth: 320, maxHeight: 240},
          small: { maxWidth: 100, maxHeight: 100 }
        },
        filecomplete: function (err, xhr){
          if(err){
            log(err);
          } else {

          }
        },
        progress: function (evt){
          progress_el.style.width = evt.loaded / evt.total * 100 + '%';
        },
        complete: function (err, xhr){
          var state = err ? 'error' : 'done';
          
          this_.index++;
          this_.active = false;
          this_.start_();
          
          if(this_.files.length == this_.index){
            var result = FileAPI.parseJSON(xhr.responseText);
            if(result.erro === false){
              $tree.showHeaderMessage({
                msg: 'Todos os arquivos foram enviados!',
                duration: 2500,
                type: 'success'
              });
              window.setTimeout(function(){
                this_.showTree();
                $tree.renewTree(result.tree);
              }, 1500);
            }
          }
        }
      });
    }
  };
})(FileBrowser, win, doc);
(function(FileBrowser, win, doc){

  FileBrowser.Alert = function(browser){
    this.browser = browser;
    this.els = FileBrowser.elements;
    this.setListeners();
    this.opened = false;
    // this will be filled later by methods (prompt, confirm, etc)
    this.options = {};
  };
  FileBrowser.Alert.prototype = {
    show: function() {
      var
        container = this.els.alert_container,
        browser_zindex = parseInt(this.els.container.style.zIndex)
      ;
      this.els.alert_title.textContent = this.options.html.title;
      this.els.alert_text.innerHTML = this.options.html.text;
      utils.addClass(doc.body, 'filebrowser-fb-stop-scrolling');
      utils.fadeIn(this.els.alert_overlay);
      this.els.alert_overlay.style.zIndex = browser_zindex + 1;
      container.style.marginTop = utils.getTopMargin(container);
      container.style.opacity = '';
      container.style.zIndex = browser_zindex + 2;
      container.style.display = 'block';
      utils.addClass(container, 'fb-alert-show');
      utils.removeClass(container, 'fb-alert-hide');
      win.previousActiveElement = doc.activeElement;
      this.opened = true;
      this.hideInputError();
    },
    close: function(){
      this.opened = false;
      utils.fadeOut(this.els.alert_overlay);
      utils.fadeOut(this.els.alert_container);
      utils.addClass(this.els.alert_container, 'fb-alert-hide');
      utils.removeClass(this.els.alert_container, 'fb-alert-show');
      utils.removeClass(doc.body, 'filebrowser-fb-stop-scrolling');
      if (win.previousActiveElement) {
        //win.previousActiveElement.focus();
      }
    },
    checkInput: function(keyCode, value){
      //enter key 13
      if (keyCode === 13) {
        this.options.submit.call(value);
      } else {
        this.options.checkInput.call(value);
      }
    },
    submit: function(){
      //this.options.submit is application submit function
      this.options.submit.call(this.els.alert_input.value);
    },
    prompt: function(options) {
      this.options = options;
      
      this.show();
      this.els.alert_icon_warning.style.display = 'none';
      this.els.alert_input.style.display = '';
      this.els.alert_input.setAttribute('placeholder', options.placeholder);
      this.els.alert_input.focus();
    },
    confirm: function(options) {
      this.options = options;
      
      this.show();
      this.els.alert_icon_warning.style.display = '';
      this.els.alert_input.style.display = 'none';
      this.els.alert_input.focus();
    },
    showInputError: function(html){
      utils.addClass(this.els.alert_input, 'invalid');
      utils.addClass(this.els.alert_elem_error, 'show');
      this.els.alert_error_text.innerHTML = html;
    },
    hideInputError: function(){
      utils.removeClass(this.els.alert_input, 'invalid');
      utils.removeClass(this.els.alert_elem_error, 'show');
    },
    setListeners: function(){
      var
        this_ = this,
        //to not loose scope
        submit = function(){
          this.blur();
          this_.submit();
        },
        close = function(evt){
          this.blur();
          this_.close();
        },
        checkInput = function(evt){
          this_.checkInput(evt.keyCode, this.value);
        },
        keydown = function(evt){
          if (evt.keyCode === 27 && this_.opened){ //esc key
            this_.close();
          }
        }
      ;
      this.els.alert_ok.addEventListener('click', submit, false);
      this.els.alert_cancel.addEventListener('click', close, false);
      this.els.alert_input.addEventListener('keyup', checkInput, false);
      doc.addEventListener('keydown', keydown, false);
    }
  };
})(FileBrowser, win, doc);(function(FileBrowser, win, doc){

  var getXhr = function() {
    var xhr = false;
    if (win.XMLHttpRequest) {
      xhr = new XMLHttpRequest();
    } else if (win.ActiveXObject) {
      try {
        xhr = new ActiveXObject("Msxml2.XMLHTTP");
      } catch(e) {
        try {
          xhr = new ActiveXObject("Microsoft.XMLHTTP");
        } catch(e) {
          xhr = false;
        }
      }
    }
    return xhr;
  };
  var toQueryString = function(obj){
    return Object.keys(obj).reduce(function(a, k) {
      a.push(
        (typeof obj[k] === 'object') ? toQueryString(obj[k]) :
        encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])
      );
      return a;
    }, []).join('&');
  };
  var encodeUrlXhr = function(url, data){
    if(data && typeof(data) === 'object') {
      var str_data = toQueryString(data);
      url += (/\?/.test(url) ? '&' : '?') + str_data;
    }
    return url;
  };
  
  FileBrowser.Utils = {
    whiteSpaceRegex: /\s+/,
    json: function(url, data) {
      var
        xhr = getXhr(),
        when = {},
        onload = function() {
          if (xhr.status === 200) {
            when.ready.call(undefined, JSON.parse(xhr.response));
          } else {
            log("Status code was " + xhr.status);
          }
        },
        onerror = function() {
          log("Can't XHR " + JSON.stringify(url));
        },
        onprogress = function(event) {}
      ;
      url = encodeUrlXhr(url, data);
      xhr.open("GET", url, true);
      xhr.setRequestHeader("Accept","application/json");
      xhr.onload = onload;
      xhr.onerror = onerror;
      xhr.onprogress = onprogress;
      xhr.send(null);
      
      return {
        when: function(obj){
          when.ready = obj.ready;
        }
      };
    },
    post: function(url, data) {
      var 
        xhr = getXhr(),
        when = {},
        onload = function() {
          if (xhr.status === 200) {
            when.ready.call(undefined, JSON.parse(xhr.response));
          } else {
            log("Status code was " + xhr.status);
          }
        },
        onerror = function() {
          log("Can't XHR " + JSON.stringify(url));
        },
        onprogress = function(){}
      ;
      
      data = utils.toQueryString(data);
      xhr.open('POST', url, true);
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      xhr.onload = onload;
      xhr.onerror = onerror;
      xhr.onprogress = onprogress;
      xhr.send(data);
      
      return {
        when: function(obj){
          when.ready = obj.ready;
        }
      };
    },
    getPath: function(){
      var parts = win.location.pathname.split('/');
      parts.shift();
      parts.pop();
      return '/' + parts.join('/') + '/';
    },
    stopEventPropagation: function(e) {
      if (typeof e.stopPropagation === 'function') {
        e.stopPropagation();
        e.preventDefault();
      } else if (win.event && win.event.hasOwnProperty('cancelBubble')) {
        win.event.cancelBubble = true;
      }
    },
    fireClick: function(node) {
      if (typeof MouseEvent === 'function') {
        var mevt = new MouseEvent('click', {
          view: win,
          bubbles: false,
          cancelable: true
        });
        node.dispatchEvent(mevt);
      } else if ( doc.createEvent ) {
        // Fallback
        var evt = doc.createEvent('MouseEvents');
        evt.initEvent('click', false, false);
        node.dispatchEvent(evt);
      } else if (doc.createEventObject) {
        node.fireEvent('onclick') ;
      } else if (typeof node.onclick === 'function' ) {
        node.onclick();
      }
    },
    classRegex: function(classname) {
      return new RegExp('(^|\\s+)' + classname + '(\\s+|$)');
    },
    _addClass: function(el, c, timeout){
      if (el.classList) {
        el.classList.add(c);
      } else {
        el.className = (el.className + ' ' + c).trim();
      }
      
      if(timeout && utils.isNumeric(timeout)){
        win.setTimeout(function(){
          utils._removeClass(el, c);
        }, timeout);
      }
    },
    addClass: function(el, classname, timeout){
      if(Array.isArray(el)){
        el.forEach(function(each){
          utils.addClass(each, classname);
        });
        return;
      }
      
      //classname can be ['class1', 'class2'] or 'class1 class2'
      var 
        array = (Array.isArray(classname)) ?
          classname : classname.split(utils.whiteSpaceRegex),
        i = array.length
      ;
      while(i--){
        if(!utils.hasClass(el, array[i])) {
          utils._addClass(el, array[i], timeout);
        }
      }
    },
    _removeClass: function(el, c){
      if (el.classList){
        el.classList.remove(c);
      } else {
        el.className = (el.className.replace(utils.classReg(c), ' ')).trim();
      }
    },
    removeClass: function(el, classname){
      if(Array.isArray(el)){
        el.forEach(function(each){
          utils.removeClass(each, classname);
        });
        return;
      }
      
      //classname can be ['class1', 'class2'] or 'class1 class2'
      var 
        array = (Array.isArray(classname)) ?
        classname : classname.split(utils.whiteSpaceRegex),
        i = array.length
      ;
      while(i--){
        if(utils.hasClass(el, array[i])) {
          utils._removeClass(el, array[i]);
        }
      }
    },
    hasClass: function(el, c){
      return (el.classList) ? 
        el.classList.contains(c) : utils.classReg(c).test(el.className);
    },
    toggleClass: function(el, c){
      if(Array.isArray(el)) {
        el.forEach(function(each) {
          utils.toggleClass(each, c);
        });
        return;
      }
      
      if(el.classList) {
        el.classList.toggle(c);
      } else {
        if(utils.hasClass(el, c)){
          utils._removeClass(el, c);
        } else {
          utils._addClass(el, c);
        }
      }
    },
    $: function(id){
      id = (id[0] === '#') ? id.substr(1, id.length) : id;
      return doc.getElementById(id);
    },
    isElement: function(obj){
      // DOM, Level2
      if ("HTMLElement" in win) {
        return (!!obj && obj instanceof HTMLElement);
      }
      // Older browsers
      return (!!obj && typeof obj === "object" && 
      obj.nodeType === 1 && !!obj.nodeName);
    },
    find: function(selector, context, find_all){
      var simpleRe = /^(#?[\w-]+|\.[\w-.]+)$/, 
        periodRe = /\./g, 
        slice = [].slice,
        matches = []
      ;
      if(simpleRe.test(selector)){
        switch(selector[0]){
          case '#':
            matches = [utils.$(selector.substr(1))];
            break;
          case '.':
            matches = slice.call(context.getElementsByClassName(
                selector.substr(1).replace(periodRe, ' ')));
            break;
          default:
            matches = slice.call(context.getElementsByTagName(selector));
        }
      } else{
        // If not a simple selector, query the DOM as usual 
        // and return an array for easier usage
        matches = slice.call(context.querySelectorAll(selector));
      }
      
      return (find_all) ? matches : matches[0];
    },
    getAllChildren: function(node, tag){
      return [].slice.call(node.getElementsByTagName(tag));
    },
    getSiblings: function(node, tagname) {
      return Array.prototype.filter.call(node.parentNode.children, 
        function(child){
          if(tagname){
            if(tagname.toUpperCase() == child.tagName){
              return child !== node;
            }
          } else{
            return child !== node;
          }
        });
    },
    emptyArray: function(array){
      while(array.length) array.pop();
    },
    removeAllChildren: function(node) {
      while (node.firstChild) node.removeChild(node.firstChild);
    },
    removeAll: function(collection) {
      var node;
      while ((node = collection[0]))
        node.parentNode.removeChild(node);
    },
    getChildren: function(node, tag){
      return [].filter.call(node.childNodes, function(el) {
        return (tag) ? 
          el.nodeType == 1 && el.tagName.toLowerCase() == tag : el.nodeType == 1;
      });
    },
    template: function(html, row){
      var this_ = this;
      
      return html.replace(/\{ *([\w_-]+) *\}/g, function (html, key) {
        var value = (row[key]  === undefined) ? '' : row[key];
        return this_.htmlEscape(value);
      });
    },
    htmlEscape: function(str){
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, "&#039;");
    },
    getMaxZIndex: function () {
      var zIndex,
        max = 0,
        all = utils.find('*', doc, true),
        len = all.length,
        i = -1
      ;
      while(++i < len){
        zIndex = parseInt(win.getComputedStyle(all[i]).zIndex, 10);
        max = (zIndex) ? Math.max(max, zIndex) : max;
      }
      return max;
    },
    deepExtend: function (destination, source) {
      var property, propertyValue;
  
      for (property in source) if (source.hasOwnProperty(property)) {
        propertyValue = source[property];
        if (propertyValue !== undefined && propertyValue !== null && 
              propertyValue.constructor !== undefined &&
              propertyValue.constructor === Object) {
          destination[property] = destination[property] || {};
          utils.deepExtend(destination[property], propertyValue);
        } else {
          destination[property] = propertyValue;
        }
      }
      return destination;
    },
    createElement: function(node, html){
      var elem;
      if(Array.isArray(node)){
        elem = doc.createElement(node[0]);
        
        if(node[1].id) elem.id = node[1].id;
        if(node[1].classname) elem.className = node[1].classname;
        
        if(node[1].attr){
          var attr = node[1].attr;
          if(Array.isArray(attr)){
            var i = -1;
            while(++i < attr.length){
              elem.setAttribute(attr[i].name, attr[i].value);
            }
          } else {
            elem.setAttribute(attr.name, attr.value);
          }
        }
      } else{
        elem = doc.createElement(node);
      }
      elem.innerHTML = html;
      var frag = doc.createDocumentFragment();
      
      while (elem.childNodes[0]) {
        frag.appendChild(elem.childNodes[0]);
      }
      elem.appendChild(frag);
      return elem;
    },
    setCenter: function(node, parent){
      parent = parent || win;
      var
        parent_size = utils.getSize(parent),
        node_size = utils.getSize(node),
        scroll_x = (parent == win) ? win.pageXOffset : parent.scrollLeft,
        scroll_y = (parent == win) ? win.pageYOffset : parent.scrollTop,
        top = Math.max(0, (
          (parent_size.height - node_size.height) / 2) + scroll_y),
        left = Math.max(0, (
          (parent_size.width - node_size.width) / 2) + scroll_x)
      ;
      node.style.position = 'absolute';
      node.style.top = top + 'px';
      node.style.left = left + 'px';
    },
    getSize: function(element){
      if(element == win || element == doc){
        return utils.getWindowSize();
      } else {
        return {
          width: element.offsetWidth,
          height: element.offsetHeight
        };
      }
    },
    getWindowSize: function(){
      return {
        width: win.innerWidth ||
            doc.documentElement.clientWidth || doc.body.clientWidth,
        height: win.innerHeight ||
            doc.documentElement.clientHeight || doc.body.clientHeight
      };
    },
    fadeIn: function(elem, interval) {
      if (+elem.style.opacity < 1) {
        interval = interval || 16;
        elem.style.opacity = 0;
        elem.style.display = 'block';
        var last = +new Date();
        var tick = function() {
          elem.style.opacity = +elem.style.opacity + (new Date() - last) / 100;
          last = +new Date();
          
          if (+elem.style.opacity < 1) {
            setTimeout(tick, interval);
          }
        };
        tick();
      }
      elem.style.display = 'block';
    },
    fadeOut: function(elem, interval) {
      interval = interval || 16;
      elem.style.opacity = 1;
      var last = +new Date();
      var tick = function() {
        elem.style.opacity = +elem.style.opacity - (new Date() - last) / 100;
        last = +new Date();
        
        if (+elem.style.opacity > 0) {
          setTimeout(tick, interval);
        } else {
          elem.style.display = 'none';
        }
      };
      tick();
    },
    getTopMargin: function(elem) {
      elem.style.left = '-9999px';
      elem.style.display = 'block';
      
      var height = elem.clientHeight, padding;
      if (typeof getComputedStyle !== "undefined") {
        padding = parseInt(getComputedStyle(elem).paddingTop, 10);
      } else {
        padding = parseInt(elem.currentStyle.padding);
      }
      
      elem.style.left = '';
      elem.style.display = 'none';
      return ('-' + parseInt((height + padding) / 2) + 'px');
    },
    toType: function(obj) {
      if(obj == win && obj.doc && obj.location){
        return 'window';
      } else if(obj == doc){
        return 'htmldocument';
      } else if(typeof obj === 'string'){
        return 'string';
      } else if(utils.isElement(obj)){
        return 'element';
      }
    },
    typeOf: function(obj){
      return ({}).toString.call(obj)
        .match(/\s([a-zA-Z]+)/)[1].toLowerCase();
    },
    removeArrayEntry: function(array, value){
      var index = array.indexOf(value);
      /* jshint -W030 */
      index > -1 && array.splice(index, 1);
    },
    bytesToSize: function(bytes) {
      if(bytes === 0) return '0 Byte';
      var
        k = 1000,
        sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
        i = Math.floor(Math.log(bytes) / Math.log(k))
      ;
      return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
    }
  };
})(FileBrowser, win, doc);

    return FileBrowser;
  })(),
  log = function(m){console.info(m);},
  utils = FileBrowser.Utils;

  if (typeof define === 'function' && define.amd) {
    define(function () { return FileBrowser; });
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = FileBrowser;
  } else if (typeof this !== 'undefined') {
    this.FileBrowser = FileBrowser;
  }
}).call(this, window, document);