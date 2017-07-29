export default {
  namespaced: true,
  state: { show: false, class: '', message: '' },
  actions: {
    show({ commit, state, rootState }, { message, type }) {
      commit('show', { message, type });
      setTimeout(() => { commit('hide') }, 5000);
    }
  },
  mutations: {
    show(state, { message, type }) {
      state.show = true;
      state.message = message;
      state.class = type;
    },
    hide(state, type) {
      state.show = false;
    }
  }
};
