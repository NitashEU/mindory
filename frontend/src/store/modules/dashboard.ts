import { Module } from 'vuex';

interface DashboardState {
  data: any[];
  loading: boolean;
  error: string | null;
}

const state: DashboardState = {
  data: [],
  loading: false,
  error: null,
};

const mutations = {
  SET_DATA(state: DashboardState, payload: any[]) {
    state.data = payload;
  },
  SET_LOADING(state: DashboardState, payload: boolean) {
    state.loading = payload;
  },
  SET_ERROR(state: DashboardState, payload: string | null) {
    state.error = payload;
  },
};

const actions = {
  async fetchData({ commit }: { commit: Function }) {
    commit('SET_LOADING', true);
    try {
      const response = await fetch('/api/dashboard'); // Adjust the API endpoint as needed
      const data = await response.json();
      commit('SET_DATA', data);
    } catch (error) {
      commit('SET_ERROR', error.message);
    } finally {
      commit('SET_LOADING', false);
    }
  },
};

const getters = {
  dashboardData: (state: DashboardState) => state.data,
  isLoading: (state: DashboardState) => state.loading,
  error: (state: DashboardState) => state.error,
};

const dashboardModule: Module<DashboardState, any> = {
  state,
  mutations,
  actions,
  getters,
};

export default dashboardModule;