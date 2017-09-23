export default {
  namespaced: true,
  state: { active: false },
  mutations: {
    opened(state) {
      state.active = true;
    },
    closed(state) {
      state.active = false;
    }
  }
};
