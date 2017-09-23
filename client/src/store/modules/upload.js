import Vue from 'vue';

export default {
  namespaced: true,
  state: {
    pending: false,
    files: {}
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
          uploaded: false
        });
      }
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
