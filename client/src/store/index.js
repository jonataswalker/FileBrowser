import Vuex from 'vuex';
import { OPTIONS, TEXT, LANG } from 'konstants';
import TEXT_BR from 'konstants/lang/pt-br';

export default new Vuex.Store({
  state: {
    options: OPTIONS,
    text: {},
    tree: {},
    folderSelected: null
  },
  actions: {
    getTree({ commit, state }) {
      const config = {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      };

      fetch(state.options.server + '/files', config)
        .then(res => res.json())
        .then(tree => {
          console.log('getTree', tree);
          commit('changeTree', tree);
        })
        .catch(console.error);
    }
  },
  mutations: {
    changeTree(state, tree) {
      state.tree = tree;
    },
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
