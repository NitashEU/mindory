import { createRouter, createWebHistory, RouteLocationNormalized, NavigationGuardNext } from 'vue-router';
import { useSupabaseClient } from '@/composables/useSupabase';
import LoginView from '../pages/LoginView.vue';
import RepositoriesView from '../modules/repositories/RepositoriesView.vue';
import AboutView from '@/pages/AboutView.vue';

const routes = [
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { requiresAuth: false }
  },
  {
    path: '/auth/callback',
    name: 'auth-callback',
    meta: { requiresAuth: false },
    component: LoginView,
    beforeEnter: async (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
      const supabase = useSupabaseClient();
      const { error } = await supabase.auth.getSession();
      if (error) {
        next('/login');
      } else {
        next('/');
      }
    }
  },
  {
    path: '/',
    name: 'dashboard',
    component: RepositoriesView,
    meta: { requiresAuth: true }
  },
  {
    path: '/about',
    name: 'about',
    component: AboutView,
    meta: { requiresAuth: true }
  }

];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const supabase = useSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  if (requiresAuth && !user) {
    next('/login');
  } else if (to.path === '/login' && user) {
    next('/');
  } else {
    next();
  }
});

export default router;