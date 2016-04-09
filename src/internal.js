/**
 * @constructor
 */
FB.Internal = function () {
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

FB.Internal.prototype = {
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
