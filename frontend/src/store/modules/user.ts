import { Module } from 'vuex';

interface UserState {
  userInfo: Record<string, any> | null;
  isAuthenticated: boolean;
}

const state: UserState = {
  userInfo: null,
  isAuthenticated: false,
};

const mutations = {
  SET_USER(state: UserState, userInfo: Record<string, any>) {
    state.userInfo = userInfo;
    state.isAuthenticated = !!userInfo;
  },
  CLEAR_USER(state: UserState) {
    state.userInfo = null;
    state.isAuthenticated = false;
  },
};

const actions = {
  login({ commit }: { commit: Function }, userInfo: Record<string, any>) {
    // Simulate an API call
    commit('SET_USER', userInfo);
  },
  logout({ commit }: { commit: Function }) {
    commit('CLEAR_USER');
  },
};

const getters = {
  isAuthenticated: (state: UserState) => state.isAuthenticated,
  userInfo: (state: UserState) => state.userInfo,
};

const userModule: Module<UserState, any> = {
  state,
  mutations,
  actions,
  getters,
};

export default userModule;