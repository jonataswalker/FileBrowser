import { app } from '../app';

export const draggable = {
  bind(el, binding, vnode) {
    let startX, startY, initialMouseX, initialMouseY;

    el.addEventListener('mousedown', (e) => {
      const container = app.$children[0].$refs.container;
      startX = container.offsetLeft;
      startY = container.offsetTop;
      initialMouseX = e.clientX;
      initialMouseY = e.clientY;
      document.addEventListener('mousemove', mousemove);
      document.addEventListener('mouseup', mouseup);
      return false;
    });

    function mousemove(e) {
      const container = app.$children[0].$refs.container;
      const dx = e.clientX - initialMouseX;
      const dy = e.clientY - initialMouseY;
      container.style.top = startY + dy + 'px';
      container.style.left = startX + dx + 'px';
      return false;
    }

    function mouseup() {
      document.removeEventListener('mousemove', mousemove);
      document.removeEventListener('mouseup', mouseup);
    }
  }
};
