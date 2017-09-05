import { ROUTES } from 'konstants';
import request from 'helpers/fetch';

export default {
  namespaced: true,
  state: {
    selected: []
  },
  actions: {
    remove({ state, rootState, commit, dispatch }) {
      console.log('remove', rootState.tree, rootState.tree.selected);

      const files = state.selected.map(k => {
        return rootState.tree.selected.files[k].name;
      });

      const hierarchy =
        rootState.tree.hierarchy.slice(1, rootState.tree.hierarchy.length);
      const folder = hierarchy.join('/');

      const config = { method: 'PATCH', body: { files, folder }};
      console.log('store file/remove', files);

      return new Promise((resolve, reject) => {
        request(ROUTES.FILES.REMOVE, config).then(res => {
          console.log('store folder/create res', res);

          dispatch('reset', null, { root: true });
          dispatch('tree/load', res.tree, { root: true });

          resolve(res.message);
        }).catch(res => reject(res.message));
      });
    }
  },
  mutations: {
    removeSelected(state) {
      state.selected = [];
    },
    toggleSelect(state, idx) {
      state.selected.includes(idx)
        ? state.selected.splice(state.selected.indexOf(idx), 1)
        : state.selected.push(idx);
    }
  }
};
