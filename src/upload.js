/**
 * @constructor
 */
FB.Upload = function(){
  this.els = FB.elements;
  this.files = [];
  this.index = 0;
  this.active = false;
  this.path_parents = '';
  this.setListeners();
  this.lang = FB.lang[FB.options.lang];
};

FB.Upload.prototype = {
  setListeners: function(){
    var this_ = this;
    
    var isImageAndHasMinSize = function (file, info) {
      return /^image/.test(file.type) ?
          info.width >= FB.options.image.min_width && 
            info.height >= FB.options.image.min_height : false;
    };

    FileAPI.event.on(this.els.upload_input, 'change', function (evt){
      var files = FileAPI.getFiles(evt);
      
      FileAPI.filterFiles(files,
        function (file, info) {
          var check;
          // TODO prepare for other file types
          FB.options.upload_types.forEach(function(type){
            if (type == FB.constants.types.image) {
              check = isImageAndHasMinSize(file, info);
            }
          });
          return check;
        },
        function(files, rejected){
          if(rejected && rejected.length){
            FB.$tree.showHeaderMessage({
              msg: utils.templateLang(this_.lang.alert.image.not_min_size, 
                  [FB.options.image.min_width, FB.options.image.min_height]),
              duration: 3500,
              type: 'alert'
            });
          }
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

    this.path_parents = FB.$tree.getFolderPath(FB.$tree.current_active);
    if(this.active){
      FB.$tree.showHeaderMessage({
        msg: this.lang.alert.upload.sending,
        duration: 1500,
        type: 'alert'
      });
      return;
    } else{
      if(len === 0){
        FB.$tree.showHeaderMessage({
          msg: this.lang.alert.upload.none,
          duration: 1500,
          type: 'alert'
        });
        return;
      } else if(len == this.index){
        FB.$tree.showHeaderMessage({
          msg: this.lang.alert.upload.sent,
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
        opt_transform = FB.options.image.transform,
        progress_el = this.getEl_(file, '.fb-progress-bar');

    if (!file) return;

    console.info(opt_transform);
    file.xhr = FileAPI.upload({
      url: FB.options.server_http,
      files: { file: file },
      data: {
        action: FB.constants.actions.upload,
        parents: this.path_parents.join()
      },
      imageOriginal: false,
      imageTransform: {
        big: {
          maxWidth: opt_transform.big.maxWidth,
          maxHeight: opt_transform.big.maxHeight
        },
        small: {
          maxWidth: opt_transform.small.maxWidth,
          maxHeight: opt_transform.small.maxHeight
        }
      },
      filecomplete: function (err){
        if (err) {
          console.info(err);
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
          if(result.error === false){
            FB.$tree.showHeaderMessage({
              msg: this_.lang.alert.upload.sent,
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
