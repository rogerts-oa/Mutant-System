import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../store/auth';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/AccessControl.vue'),
    meta: { requiresAuth: true, role: 'staff' }
  },
  {
    path: '/admin/analytics',
    name: 'Analytics',
    component: () => import('../views/AnalyticsDashboard.vue'),
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/',
    redirect: '/dashboard'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const auth = useAuthStore();
  
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    next('/login');
  } else if (to.meta.role === 'admin' && !auth.isAdmin) {
    next('/dashboard');
  } else {
    next();
  }
});

export default router;
