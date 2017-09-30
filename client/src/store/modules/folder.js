import { ROUTES } from 'konstants';
import axios from 'axios';

export default {
  namespaced: true,
  actions: {
    create({ commit, rootGetters, dispatch }, name) {
      const path = `${rootGetters.tree.path}/${name}`;
      return new Promise((resolve, reject) => {
        axios.post(ROUTES.FOLDER.CREATE, { path }).then(res => {
          const { id } = res.data;
          dispatch('tree/addFolder', { id, name }, { root: true });
          resolve(res.data.message);
        }).catch(reject);
      });
    }
  }
};
