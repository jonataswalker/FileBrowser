/**
 * @constructor
 */
FB.Drag = function(){
  var handle = FB.elements.drag_handle || FB.container,
      lastX, lastY, currentX, currentY, x, y,
      when = {},
      dragging = function(evt){
        evt.preventDefault && evt.preventDefault();
        
        currentX = parseInt(FB.container.style.left, 10) || 0;
        currentY = parseInt(FB.container.style.top, 10) || 0;
        
        x = currentX + (evt.clientX - lastX);
        y = currentY + (evt.clientY - lastY);
        
        when.move.call({
          target: FB.container,
          x: x,
          y: y
        });
        lastX = evt.clientX;
        lastY = evt.clientY;
      },
      stopDragging = function(){
        document.removeEventListener('mousemove', dragging, false);
        document.removeEventListener('mouseup', stopDragging, false);
        
        when.end.call({
          target: FB.container,
          x: x,
          y: y
        });
      },
      startDragging = function(evt){
        if(evt.button !== 0) return;
        lastX = evt.clientX;
        lastY = evt.clientY;
        when.start.call({target: FB.container});
        document.addEventListener('mousemove', dragging, false);
        document.addEventListener('mouseup', stopDragging, false);
      };
  handle.addEventListener('mousedown', startDragging, false);
  return {
    when: function(obj){
      when.start = obj.start;
      when.move = obj.move;
      when.end = obj.end;
    }
  };
};
