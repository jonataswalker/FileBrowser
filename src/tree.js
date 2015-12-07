(function(FileBrowser){
  
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
})(FileBrowser);
