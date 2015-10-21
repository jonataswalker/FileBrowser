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
