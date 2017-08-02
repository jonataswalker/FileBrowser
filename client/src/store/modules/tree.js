import { ROUTES, ROOT_ID } from 'konstants';
import request from 'helpers/fetch';

export default {
  namespaced: true,
  state: {
    ready: false,
    selected: { id: '', parents: [] },
    tree: { name: '', files: [], folders: [] }
  },
  actions: {
    get({ commit, state, rootState }) {
      request(rootState.options.server + ROUTES.FILES.ALL).then(tree => {
        tree.name = rootState.text.ROOT_FOLDER;
        console.log('getTree', tree);
        commit('update', tree);
      }).catch(console.error);
    },
    select({ commit, state, rootState }, { id, parents }) {
      commit('select', { id, parents });

      console.log(id, parents, state.tree);

      let files;

      if (id === ROOT_ID) {
        files = state.tree.files;
      } else if (parents.length === 0) {
        files = state.tree.folders[id].files;
      } else {
        files = parents.reduce((acc, curr, idx) => {
          acc = idx === parents.length - 1
            ? acc[curr].folders[id].files
            : acc[curr].folders;
          return acc;
        }, state.tree.folders);
      }

      return files;
    }
  },
  mutations: {
    update(state, tree) {
      state.tree = tree;
      state.ready = true;
    },
    select(state, { id, parents }) {
      state.selected.id = id;
      state.selected.parents = parents;
      console.log('mutations tree select', state.selected);
    }
  }
};
