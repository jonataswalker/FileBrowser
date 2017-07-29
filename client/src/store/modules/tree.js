import { ROUTES } from 'konstants';
import request from 'helpers/fetch';

export default {
  namespaced: true,
  state: {
    tree: { name: '', files: [], folders: [] }
  },
  actions: {
    get({ commit, state, rootState }) {
      return new Promise((resolve, reject) => {
        request(rootState.options.server + ROUTES.FILES.ALL)
          .then(tree => {
            tree.name = rootState.text.ROOT_FOLDER;
            console.log('getTree', tree);
            commit('update', tree);
            resolve();
          })
          .catch(reject);
      });
    }
  },
  mutations: {
    update(state, tree) {
      state.tree = tree;
    }
  }
};
