export default {
  namespaced: true,
  state: {
    pending: false,
    previews: []
  },
  mutations: {
    selected(state) {
      state.pending = true;
    },
    preview(state, obj) {
      console.log('mutations preview', obj);
      if (state.pending) {
        state.previews.push(obj);
      }
    }
  }
};
