import axios from 'axios';
import Vue from 'vue';
// import deepmerge from 'deepmerge';
import { ROUTES, ROOT_ID } from 'konstants';

export default {
  namespaced: true,
  state: {
    ready: false,
    hierarchy: [],
    selected: { id: ROOT_ID, parents: [], files: [] },
    tree: {}
  },
  getters: {
    path: (state) => {
      return state.hierarchy.slice(1).join('/');
    },
    folder: (state) => (id, parents) => {
      const parents_ = parents.slice(1);
      let hierarchy = [state.tree[ROOT_ID].name];
      let folder;

      if (id === ROOT_ID) {
        return { folder: state.tree[ROOT_ID], hierarchy };
      } else if (parents_.length) {
        parents_.reduce((acc, curr, idx) => {
          if (idx === parents_.length - 1) {
            folder = acc[curr].folders[id];
          }
          hierarchy.push(acc[curr].name);
          return acc[curr].folders;
        }, state.tree[ROOT_ID].folders);
      } else {
        folder = state.tree[ROOT_ID].folders[id];
      }

      hierarchy.push(folder.name);
      return { folder, hierarchy };
    }
  },
  actions: {
    get({ dispatch, rootState }) {
      axios(rootState.options.server + ROUTES.FILES.ALL)
        .then(res => dispatch('load', res.data))
        .catch(console.error);
    },
    load({ commit, dispatch, state, rootState }, tree) {
      const { id, parents } = state.selected;
      tree.name = rootState.text.ROOT_FOLDER;
      commit('load', tree);
      dispatch('select', { id, parents });
    },
    select({ commit, state, getters }, { id, parents = [] }) {
      const { folder, hierarchy } = getters.folder(id, parents);
      console.log('tree/select folder', folder);

      commit('select', {
        id,
        parents,
        files: folder.files,
        hierarchy: hierarchy
      });
      commit('file/removeSelected', null, { root: true });
    },
    addFolder({ commit, getters, state }, { id, name }) {
      const parentId = state.selected.id;
      const { parents } = state.selected;
      const { folder } = getters.folder(parentId, parents);
      commit('addFolder', { id, name, parentFolder: folder });
    },
    addFile({ commit, getters, state }, file) {
      const { id, parents } = state.selected;
      const { folder } = getters.folder(id, parents);
      commit('addFile', { folder, file });
    },
    removeFiles({ commit, getters, state }, files) {
      const { id, parents } = state.selected;
      const { folder } = getters.folder(id, parents);
      commit('removeFiles', { folder, files });
    }
  },
  mutations: {
    load(state, tree) {
      Vue.set(state.tree, ROOT_ID, tree);
      state.ready = true;
      console.log('tree/mutations load', state.tree);
    },
    addFolder(state, { id, name, parentFolder }) {
      const parentId = state.selected.id;
      const folder = {
        name,
        files: [],
        folders: {},
        parents: state.selected.parents.concat(parentId)
      };
      Vue.set(parentFolder.folders, id, folder);
    },
    addFile(state, { folder, file }) {
      folder.files.push(file);
    },
    removeFiles(state, { folder, files }) {
      state.selected.files = folder.files = folder.files.filter((e, i) => {
        return !files.includes(i);
      });
    },
    select(state, { id, parents, files, hierarchy }) {
      state.hierarchy = hierarchy;
      state.selected = { id, parents, files };
    }
  }
};
