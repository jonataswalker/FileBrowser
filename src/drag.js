/**
 * @constructor
 */
FB.DragAndResize = function(){
  var lastX, lastY, currentX, currentY, x, y,
      when = {};
  
  /*
   * Dragging
   */
  FB.elements.drag_handle.addEventListener('mousedown', function (evt) {
    if(evt.button !== 0) return;
    
    evt.preventDefault();
    lastX = evt.clientX;
    lastY = evt.clientY;
    
    function mousemove (e) {
      currentX = parseInt(FB.container.style.left, 10) || 0;
      currentY = parseInt(FB.container.style.top, 10) || 0;
      
      x = currentX + (e.clientX - lastX);
      y = currentY + (e.clientY - lastY);
      
      when.dragging.call({
        target: FB.container,
        x: x,
        y: y
      });
      
      lastX = e.clientX;
      lastY = e.clientY;
    }
    
    function mouseup () {
      window.removeEventListener('mousemove', mousemove, false);
      window.removeEventListener('mouseup', mouseup, false);
      
      when.endDragging.call({
        target: FB.container,
        x: x,
        y: y
      });
    }
    
    when.startDragging.call({ target: FB.container });
    window.addEventListener('mousemove', mousemove, false);
    window.addEventListener('mouseup', mouseup, false);
  }, false);

  /*
   * Resizing
   */
  FB.elements.resize_handle.addEventListener('mousedown', function (evt) {
    evt.preventDefault();
    
    if (evt.which == 2 || evt.which == 3) return;
    
    function mousemove (e) {
      var offset = utils.offset(FB.container);
      x = e.clientX - offset.left;
      y = e.clientY - offset.top;
      
      when.resizing.call({
        target: FB.container,
        w: x,
        h: y
      });
    }
    
    function mouseup () {
      window.removeEventListener('mousemove', mousemove, false);
      window.removeEventListener('mouseup', mouseup, false);
      
      when.endResizing.call({
        target: FB.container,
        w: x,
        h: y
      });
    }
    
    window.addEventListener('mousemove', mousemove, false);
    window.addEventListener('mouseup', mouseup, false);
  }, false);
  
  return {
    when: function(obj){
      when = {
        startDragging: obj.startDragging,
        endDragging: obj.endDragging,
        dragging: obj.dragging,
        startResizing: obj.startResizing,
        endResizing: obj.endResizing,
        resizing: obj.resizing
      };
    }
  };
};
