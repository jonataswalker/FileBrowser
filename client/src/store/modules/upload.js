import axios from 'axios';
import Vue from 'vue';
import { ROUTES } from 'konstants';

export default {
  namespaced: true,
  state: {
    pending: false,
    files: {}
  },
  getters: {
    progress: (state) => (id) => {
      return state.files[id].progress;
    }
  },
  actions: {
    send({ commit, dispatch, state, rootState }, file) {
      const data = new FormData();
      data.append('id', file.id);
      data.append('name', file.name);
      data.append('file', file.blob);
      data.append('directory', rootState.tree.hierarchy.slice(1).join('/'));

      const config = {
        onUploadProgress: (e) => {
          const progress = Math.round((e.loaded * 100) / e.total);
          commit('progress', { id: file.id, progress });
        }
      };

      return new Promise((resolve, reject) => {
        axios.post(ROUTES.FILES.UPLOAD, data, config)
          .then((res) => {
            dispatch('tree/addFile', res.data, { root: true });
            commit('done', file.id);
            console.log('upload/actions/send', res.data, rootState.tree.tree);
          }).catch(reject);
      });
    }
  },
  mutations: {
    selected(state) {
      state.pending = true;
    },
    preview(state, obj) {
      if (state.pending) {
        Vue.set(state.files, obj.id, {
          name: obj.name,
          blob: obj.blob,
          type: obj.type,
          mime: obj.mime,
          progress: 0,
          uploaded: false
        });
      }
    },
    progress(state, { id, progress }) {
      Vue.set(state.files[id], 'progress', progress);
    },
    addThumb(state, obj) {
      Vue.set(state.files[obj.id], 'thumb', obj.thumb);
    },
    done(state, id) {
      setTimeout(() => {
        Vue.delete(state.files, id);
        if (!Object.keys(state.files).length) {
          state.pending = false;
        }
      }, 1200);
    }
  }
};
