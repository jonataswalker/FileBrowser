import { ROUTES } from 'konstants';
import axios from 'axios';

export default {
  namespaced: true,
  actions: {
    create({ commit, rootGetters, dispatch }, name) {
      return new Promise((resolve, reject) => {
        const path = `${rootGetters['tree/path']}/${name}`;
        axios.post(ROUTES.FOLDER.CREATE, { path }).then(res => {
          const { message } = res.data;
          const opts = { root: true };
          dispatch('tree/addFolder', name, opts);
          dispatch('message/show', { message, type: 'success' }, opts);
          resolve(res.data.message);
        }).catch(res => {
          const { message } = res.data;
          const opts = { root: true };
          dispatch('message/show', { message, type: 'alert' }, opts);
          reject();
        });
      });
    },
    remove({ commit, rootGetters, rootState, dispatch }) {
      return new Promise((resolve, reject) => {
        const path = rootGetters['tree/path'];
        axios.patch(ROUTES.FOLDER.REMOVE, { path }).then(res => {
          const { message } = res.data;
          const opts = { root: true };
          dispatch('tree/removeFolder', null, opts);
          dispatch('message/show', { message, type: 'success' }, opts);
          resolve();
        }).catch(res => {
          const { message } = res.data;
          const opts = { root: true };
          dispatch('message/show', { message, type: 'alert' }, opts);
          reject();
        });
      });
    }
  }
};
