import { ROUTES } from 'konstants';
import axios from 'axios';

export default {
  namespaced: true,
  state: {
    selected: []
  },
  actions: {
    remove({ state, rootState, rootGetters, dispatch, commit }) {
      const folder = rootGetters['tree/path'];
      const files =
        state.selected.map(k => rootState.tree.selected.files[k].name);

      return new Promise((resolve, reject) => {
        axios.patch(ROUTES.FILES.REMOVE, { files, folder }).then(res => {
          const selected = state.selected.slice();
          resolve(res.data.message);
          commit('removeSelected');
          dispatch('tree/removeFiles', selected, { root: true });
        }).catch(res => reject(res.data.message));
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
