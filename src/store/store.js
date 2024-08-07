import { createStore } from 'vuex';

export const store = createStore({
  state: {
    user: null,
  },
  mutations: {
    setUser(state, user) {
      state.user = user;
    },
  },
  actions: {
    setUser({ commit }, user) {
      commit('setUser', user);
    },
  },
  getters: {
    getUser(state) {
      return state.user;
    },
  },
});
