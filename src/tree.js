/**
 * @constructor
 */
FB.Tree = function(){
  this.els = FB.elements;
  this.options = FB.options;
  this.lang = FB.lang[FB.options.lang];
  
  this.current_active = FB.elements.folder_tree_root;
  this.root_event_added = false;
  this.thumbs_root = [];
  this.thumbs_selected = [];
};

FB.Tree.prototype = {
  get: function(){
    utils.addClass(this.els.grd_preview, 'mapeando-spinner');
    
    var when = {}, this_ = this;
    utils.json(this.options.server_http, {
      action: FB.constants.actions.get_thumbs,
      lang: FB.options.lang
    }).when({
      ready: function(response) {
        
        utils.removeClass(this_.els.grd_preview, 'mapeando-spinner');
        if('files' in response.tree){
          this_.thumbs_root = response.tree.files;
          this_.loadThumbs(this_.thumbs_root);
        }
        if('dirs' in response.tree){
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
      var row = {
            folder: folder,
            'n-files': statistics.files,
            'n-files-all': statistics['files-all'],
            'n-folders': statistics.folders,
            last: last_created
          },
          html = this_.folderTemplate(row),
          ol = utils.createElement(['ol', {classname:'collapse'}], html),
          appended = parent.appendChild(ol);
      return appended;
    };
    var recursive = function(obj, parent){
      var keys = Object.keys(obj),
          len = keys.length,
          i = -1, prop, value,
          appended, last, statistics = {};
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
    var keys = Object.keys(json),
        len = keys.length,
        i = -1,
        prop, value, appended,
        last_created,
        statistics = {};
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
    utils.emptyArray(this.thumbs_root);
    this.current_active = false;
    
    if(Array.isArray(tree) && tree.length === 0){
      //empty return
      this.updateCountFolder();
      utils.fireClick(this.els.folder_tree_root);
      return;
    }
    
    if('files' in tree){
      this.thumbs_root = tree.files;
      this.loadThumbs(this.thumbs_root);
    }
    if('dirs' in tree){
      this.buildTree(tree.dirs);
      this.treeEvents(tree.dirs);
    }
    this.updateCountFolder();
    this.setFolderActive();
  },
  newFolder: function(){
    var this_ = this,
        regex = this.options.regex_folder,
        checkInput = function(){
          //this = input value
          if (regex.test(this)) {
            FB.$alert.hideInputError();
          } else {
            FB.$alert.showInputError(this_.lang.folder.minimum);
          }
        },
        submit = function(){
          //this = input value
          if(!regex.test(this)){
            FB.$alert.showInputError(this_.lang.folder.minimum);
            return;
          }

          this_.submitFolder(this, FB.constants.actions.new_folder).when({
            ready: function(response) {
              if(response.error === false){
                this_.renewTree(response.tree);
                FB.$alert.close();
              } else {
                FB.$alert.showInputError(response.msg);
              }
            }
          });
        },
        parents = this.getFolderPath(this.current_active),
        i = parents.length,
        path = '<span>'+ this.lang.root_folder +'</span>';
    parents.reverse();
    while(i--){
      path += '&nbsp;&rarr;&nbsp;<span>'+ parents[i] +'</span>';
    }
    
    var text = '<p>'+ this.lang.folder.creation +'</p>'
          + '<p class="folder-path">'+path+'</p>',
        html = {
          title: this.lang.folder.new_,
          text: text
        };
    FB.$alert.prompt({
      placeholder: this.lang.folder.new_,
      html: html,
      checkInput: checkInput,
      submit: submit
    });
  },
  submitFolder: function(value, action){
    //exclude current from parents
    var parents = (action == FB.constants.actions.delete_folder) ?
          this.getFolderPath(this.current_active, true) :
            this.getFolderPath(this.current_active),
        when = {};
    
    utils.post(this.options.server_http, {
      action: action,
      folder: value,
      parents: parents.join(),
      lang: FB.options.lang
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
    var this_ = this,
        folder = this.current_active.getAttribute('data-key'),
        n_files = this.current_active.getAttribute('data-files-all'),
        n_folders = this.current_active.getAttribute('data-folders'),
        submit = function(){
          this_.submitFolder(folder, FB.constants.actions.delete_folder).when({
            ready: function(response) {
              if(response.error === false){
                this_.renewTree(response.tree);
                FB.$alert.close();
              } else {
                FB.$alert.showInputError(response.msg);
              }
            }
          });
        },
        text = utils.templateLang(
          this.lang.folder.deletion, [folder, n_files, n_folders]),
        html = {
          title: this.lang.folder.del,
          text: text
        };
    
    FB.$alert.confirm({
      html: html,
      submit: submit
    });
  },
  removeFile: function(){
    var this_ = this,
        submit = function () {
          utils.post(this_.options.server_http, {
            action: FB.constants.actions.delete_file,
            files: this_.thumbs_selected.join(),
            lang: FB.options.lang
          }).when({
            ready: function(response) {
              this_.renewTree(response.tree);
              FB.$alert.close();
            }
          });
        },
        text = [
          '<p>',
            this.lang.file.total,
            '<span class="highlight">',
            this.thumbs_selected.length,
          '</span></p>'
        ].join(''),
        html = {
          title: this.lang.file.del,
          text: text
        };
    FB.$alert.confirm({
      html: html,
      submit: submit
    });
  },
  setFolderActive: function(){
    //find last created
    var this_ = this,
        lis = utils.find('li', this.els.folder_tree_root, true),
        lis_len = lis.length,
        found = false,
        li, attr,
        i = -1,
        setCreatedActive = function(li){
          var parent = li.parentNode,
              siblings, cond = true;
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
        };
    
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
    var this_ = this,
        lis = utils.find('li', this.els.folder_tree, true),
        lis_len = lis.length;
    
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
      var openned = utils.hasClass(li, 'open'),
          active = utils.hasClass(li, 'active'),
          children = utils.getChildren(li, 'ol'),
          children_ol_recursive = utils.getAllChildren(li, 'ol'),
          children_li_recursive = utils.getAllChildren(li, 'li');

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
      this_.current_active = li;
      utils.addClass(li, 'active');
    };
    var findFiles = function(keys, tree_node, depth){
      var len_keys = keys.length,
          k, files;

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
        this_.loadThumbs(this_.thumbs_root);
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
      FB.$upload.showTree();
      //this is <li>
      if(this != this_.current_active) {
        this_.removeThumbs();
        thumb(this, root_tree);
      }
      
      this_.current_active = this_.current_active || this_.els.folder_tree_root;

      utils.removeClass(this_.current_active, 'active');
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
      (function(i){
        var li = lis[i];
        if(i === 0){
          var children = utils.getChildren(li, 'ol');
          if(children.length > 0){
            utils.removeClass(children, 'collapse');
          }
        }
        if(li == this_.els.folder_tree_root){
          if(!this_.root_event_added){
            li.addEventListener('click', clickFolder, false);
            this_.root_event_added = true;
          }
        } else {
          li.addEventListener('click', clickFolder, false);
        }
      })(i);
    }
  },
  emptyThumbSelected: function(){
    var lis = utils.find('li', this.els.grd_preview, true);
    utils.emptyArray(this.thumbs_selected);
    utils.removeClass(lis, FB.constants.thumb_sel);
    this.buttonThumbRemoveHandler();
  },
  buttonThumbRemoveHandler: function(){
    var len_sel = this.thumbs_selected.length,
        btn_desc = (len_sel > 1) ? this.lang.file.dels : this.lang.file.del;
    if(len_sel > 0){
      utils.removeClass(this.els.btn_editor, 'hidden');
      utils.removeClass(this.els.btn_del_file, 'hidden');
      this.els.desc_btn_del_file.textContent = btn_desc + ' ('+len_sel+')';
      this.els.desc_btn_editor.textContent = 
        this.lang.send_to_editor + ' (' + len_sel + ')';
    } else {
      utils.addClass(this.els.btn_editor, 'hidden');
      utils.addClass(this.els.btn_del_file, 'hidden');
    }
  },
  updateCountFolder: function(){
    this.els.folder_root_desc.textContent = 
      this.lang.root_folder + ' ('+ this.thumbs_root.length +')';
  },
  removeThumbs: function(){
    utils.removeAllChildren(this.els.grd_preview);
  },
  loadThumbs: function(files){
    var this_ = this,
        row, html, li,
        i = -1, file, path, selected,
        url = this.options.root_http,
        count = files.length,
        thumbSelect = function(){
          utils.toggleClass(this, FB.constants.thumb_sel);
          var selected = utils.hasClass(this, FB.constants.thumb_sel),
              attr = this.getAttribute(FB.constants.thumb_path);
          if (selected) {
            this_.thumbs_selected.push(attr);
          } else {
            utils.removeArrayEntry(this_.thumbs_selected, attr);
          }
          this_.buttonThumbRemoveHandler();
        };
    
    while(++i < count){
      file = files[i];
      path = file.relative_path + file.filename;
      // FIXME change this ternary
      selected = (this.thumbs_selected.indexOf(path) > -1) ? true : false;
      row = {
        filename: file.filename,
        date: file.date,
        filesize: file.filesize,
        url: url + path
      };
      html = this.thumbTemplate(row);
      li = utils.createElement(['li',
        {
          classname: (selected) ? FB.constants.thumb_sel : '',
          attr: [{ 
            name: FB.constants.thumb_path,
            value: path
          }]
        }
      ], html);
      
      this.els.grd_preview.appendChild(li);
      li.addEventListener('click', thumbSelect, false);
    }
  },
  sendEditor: function(){
    var editor = this.options.editor,
        c = this.thumbs_selected.length,
        i = -1, filename;
    while(++i < c){
      filename = this.thumbs_selected[i].replace(
        FB.constants.suffix_small,
        FB.constants.suffix_big
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
