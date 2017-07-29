import Vuex from 'vuex';
import { OPTIONS, TEXT, LANG } from 'konstants';
import TEXT_BR from 'konstants/lang/pt-br';
import folder from './modules/folder';
import tree from './modules/tree';
import file from './modules/file';
import message from './modules/message';

export default new Vuex.Store({
  modules: { folder, tree, file, message },
  state: {
    text: {},
    options: OPTIONS
  },
  mutations: {
    mergeOptions(state, opts) {
      state.options = Object.assign(state.options, opts);
      switch (state.options.lang) {
        case LANG.BR:
          state.text = TEXT_BR;
          break;
        default:
          state.text = TEXT;
      }
    }
  }
});