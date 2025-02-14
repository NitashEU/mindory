import { createStore } from 'vuex';
import user from './modules/user';
import dashboard from './modules/dashboard';

const store = createStore({
  modules: {
    user,
    dashboard,
  },
});

export default store;