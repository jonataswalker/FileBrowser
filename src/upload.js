/**
 * @constructor
 */
FB.Upload = function(){
  this.els = FB.elements;
  this.options = FB.$base.options;
  this.files = [];
  this.index = 0;
  this.active = false;
  this.path_parents = '';
  this.setListeners();
};

FB.Upload.prototype = {
  setListeners: function(){
    var this_ = this;

    FileAPI.event.on(this.els.upload_input, 'change', function (evt){
      var files = FileAPI.getFiles(evt);
      
      FileAPI.filterFiles(files,
        function (file, info){
          return /^image/.test(file.type) ?
            info.width >= 120 && info.height >= 120 : false;
        },
        function(files, rejected){
          if(rejected && rejected.length > 0){
            FB.$tree.showHeaderMessage({
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
    var this_ = this,
        row, html, li, left;
    
    this.showPreview();
    FB.$tree.emptyThumbSelected();
    
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
    var len = this.files.length;

    this.path_parents = FB.$tree.getFolderPath(FB.$base.current_active);
    if(this.active){
      FB.$tree.showHeaderMessage({
        msg: 'Um envio já está em andamento!',
        duration: 1500,
        type: 'alert'
      });
      return;
    } else{
      if(len === 0){
        FB.$tree.showHeaderMessage({
          msg: 'Nenhum arquivo foi selecionado!',
          duration: 1500,
          type: 'alert'
        });
        return;
      } else if(len == this.index){
        FB.$tree.showHeaderMessage({
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
    var this_ = this,
        progress_el = this.getEl_(file, '.fb-progress-bar');

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
      filecomplete: function (err){
        if(err){
          console.info(err);
        } else {

        }
      },
      progress: function (evt){
        progress_el.style.width = evt.loaded / evt.total * 100 + '%';
      },
      complete: function (err, xhr){
        //var state = err ? 'error' : 'done';
        
        this_.index++;
        this_.active = false;
        this_.start_();
        
        if(this_.files.length == this_.index){
          var result = FileAPI.parseJSON(xhr.responseText);
          if(result.erro === false){
            FB.$tree.showHeaderMessage({
              msg: 'Todos os arquivos foram enviados!',
              duration: 2500,
              type: 'success'
            });
            window.setTimeout(function(){
              this_.showTree();
              FB.$tree.renewTree(result.tree);
            }, 1500);
          }
        }
      }
    });
  }
};
