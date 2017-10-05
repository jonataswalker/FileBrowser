export default {
  namespaced: true,
  state: { active: false },
  mutations: {
    open(state) {
      state.active = true;
    },
    close(state) {
      state.active = false;
    }
  }
};
