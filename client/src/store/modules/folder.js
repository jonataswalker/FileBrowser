import { ROUTES } from 'konstants';
import axios from 'axios';

export default {
  namespaced: true,
  actions: {
    create({ commit, rootState, dispatch }, name) {

      let hierarchy = rootState.tree.hierarchy.slice(1);
      hierarchy.push(name);

      const path = hierarchy.join('/');

      return new Promise((resolve, reject) => {
        axios.post(ROUTES.FOLDER.CREATE, { path }).then(res => {
          console.log('store folder/create res', res);
          const obj = { id: res.data.id, name };
          commit('tree/update', obj, { root: true });
          resolve(res.data.message);
        }).catch(reject);
      });
    }
  }
};
