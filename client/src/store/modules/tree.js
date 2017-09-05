import { ROUTES, ROOT_ID } from 'konstants';
import request from 'helpers/fetch';

export default {
  namespaced: true,
  state: {
    ready: false,
    hierarchy: [],
    selected: { id: '', parents: [], files: [] },
    tree: { name: '', files: [], folders: [] }
  },
  actions: {
    get({ dispatch, rootState }) {
      request(rootState.options.server + ROUTES.FILES.ALL)
        .then(tree => dispatch('load', tree))
        .catch(console.error);
    },
    load({ commit, dispatch, state, rootState }, tree) {
      tree.name = rootState.text.ROOT_FOLDER;
      console.log('load', tree);
      commit('update', tree);

      if (!state.selected.id) {
        dispatch('select', { id: ROOT_ID });
      }
    },
    select({ commit, state }, { id, parents = [] }) {
      let files;
      let hierarchy = [];

      if (id === ROOT_ID) {
        files = state.tree.files;
        hierarchy = [state.tree.name];
      } else if (parents.length === 0) {
        files = state.tree.folders[id].files;
        hierarchy = [state.tree.name, state.tree.folders[id].name];
      } else {
        hierarchy = [state.tree.name];

        files = parents.reduce((acc, curr, idx) => {
          hierarchy.push(acc[curr].name);

          if (idx === parents.length - 1) {
            hierarchy.push(acc[curr].folders[id].name);
            acc = acc[curr].folders[id].files;
          } else {
            acc = acc[curr].folders;
          }

          return acc;
        }, state.tree.folders);
      }

      commit('select', { id, parents, files, hierarchy });
      commit('file/removeSelected', null, { root: true });
    }
  },
  mutations: {
    update(state, tree) {
      console.log('tree/update mutations', tree);
      state.tree = tree;
      state.ready = true;
    },
    select(state, { id, parents, files, hierarchy }) {
      state.hierarchy = hierarchy;
      state.selected = { id, parents, files };
      // console.log('select', hierarchy);
      // console.log('mutations tree select', state.selected);
    },
    removeSelectedFiles(state, files) {
      state.selected.files =
        state.selected.files.filter((f, i) => !files.includes(i));
    }
  }
};
