import { app, store } from './app';
import { isObject } from 'helpers/object';

export default class FileBrowser {
  constructor(el, options = {}) {

    if (!(this instanceof FileBrowser)) {
      return new FileBrowser(el, options);
    }

    if (isObject(el)) {
      options = el;
      el = document.createElement('div');
      document.body.appendChild(el);
    }

    this.options = options;

    store.commit('mergeOptions', options);
    store.dispatch('tree/get');
    app.$mount(el);
  }

  show() {
    store.commit('modal/open');
  }

  hide() {
    store.commit('modal/close');
  }
}
