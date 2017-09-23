import Vue from 'vue';
import axios from 'axios';
import deepmerge from 'deepmerge';
import { ROUTES, ROOT_ID } from 'konstants';
import { deepCopy } from 'helpers/mix';

export default {
  namespaced: true,
  state: {
    ready: false,
    hierarchy: [],
    selected: { id: ROOT_ID, parents: [], files: [] },
    tree: {}
  },
  actions: {
    get({ dispatch, rootState }) {
      axios(rootState.options.server + ROUTES.FILES.ALL)
        .then(res => dispatch('load', res.data))
        .catch(console.error);
    },
    load({ commit, dispatch, state, rootState }, tree) {
      tree.name = rootState.text.ROOT_FOLDER;

      commit('load', tree);

      const { id, parents } = state.selected;

      console.log('tree/load', tree, state.tree);

      dispatch('select', { id, parents });
    },
    select({ commit, state }, { id, parents = [] }) {
      let files;
      let hierarchy = [];
      const rootTree = state.tree[ROOT_ID];

      if (id === ROOT_ID) {
        files = rootTree.files;
        hierarchy = [rootTree.name];
      // } else if (parents.length === 0) {
        // files = state.tree.folders[id].files;
        // hierarchy = [state.tree.name, state.tree.folders[id].name];
      } else {
        files = parents.reduce((acc, curr, idx) => {
          console.log('select/reduce', acc, curr, idx, id);
          hierarchy.push(acc[curr].name);

          if (idx === parents.length - 1) {
            hierarchy.push(acc[curr].folders[id].name);
            acc = acc[curr].folders[id].files;
          } else {
            acc = acc[curr].folders;
          }

          return acc;
        }, state.tree);
      }

      console.log('tree/actions/select', parents);
      console.log('tree/actions/select', files);
      console.log('tree/actions/select', hierarchy);

      commit('select', { id, parents, files, hierarchy });
      commit('file/removeSelected', null, { root: true });
    }
  },
  mutations: {
    load(state, tree) {
      state.tree[ROOT_ID] = tree;
      state.ready = true;
    },
    update(state, { id, name }) {
      console.log('tree/mutations/update',
        id, name, state.selected, state.tree);

      const { parents } = state.selected;
      const parentId = state.selected.id;

      let partialObj = {};
      let newTree = {};
      const newFolder = { name, folders: {}, files: [], parents: [] };

      if (parents.length === 0) {
        newTree = deepCopy(state.tree);
        newTree.root.folders[id] = newFolder;
      } else {
        parents.reduce((acc, curr, idx) => {
          acc = acc[curr].folders;

          if (idx === parents.length - 1) {
            newFolder.parents = parents.concat(parentId);

            let tmpObj = { folders: {}};
            tmpObj.folders = deepCopy(acc);
            tmpObj.folders[parentId].folders[id] = newFolder;
            partialObj = deepmerge(partialObj, tmpObj);

            console.log('last', partialObj, curr, parentId, tmpObj);
          } else {
            partialObj = deepmerge(partialObj, acc[parents[idx + 1]]);
          }


          console.log('reduce', acc, curr, parents[idx + 1], parentId);
          return acc;
        }, state.tree);

        newTree[parents[0]] = {
          folders: { [parents[1]]: deepCopy(partialObj) }
        };
      }

      state.tree = deepmerge(state.tree, newTree);

      console.log('tree/mutations/update newTree', newTree);
      console.log('tree/mutations/update trees', state.tree);

    },
    select(state, { id, parents, files, hierarchy }) {
      console.log('tree/mutations/select', id, parents);

      state.hierarchy = hierarchy;
      state.selected = { id, parents, files };
      // console.log('select', hierarchy);
      // console.log('mutations tree select', state.selected);
    },
    removeSelectedFiles(state, files) {
      const result = state.selected.files.filter((f, i) => !files.includes(i));
      state.selected.files = result;
    }
  }
};
