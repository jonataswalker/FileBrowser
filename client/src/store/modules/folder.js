import { ROUTES } from 'konstants';
import request from 'helpers/fetch';

export default {
  namespaced: true,
  state: { selected: '/' },
  actions: {
    create({ commit, state, dispatch }, name) {
      const path = state.selected + name;
      const config = { method: 'POST', body: { path }};
      console.log('store folder/create', path);

      return new Promise((resolve, reject) => {
        request(ROUTES.FOLDER.CREATE, config).then(res => {
          console.log('store folder/create res', res);
          commit('tree/update', res.tree, { root: true });
          resolve(res.message);
        }).catch(res => reject(res.message));
      });
    }
  },
  mutations: {}
};
