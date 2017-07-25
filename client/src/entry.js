import { app, store } from './app';

export default class FileBrowser {
  constructor(el, options = {}) {
    store.commit('mergeOptions', options);
    store.dispatch('getTree');
    app.$mount(el);
  }
}
