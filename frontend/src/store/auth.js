import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.user,
    isAdmin: (state) => state.user?.role === 'admin',
    isStaff: (state) => state.user?.role === 'staff' || state.user?.role === 'admin',
  },
  actions: {
    login(userData) {
      this.user = userData;
      this.token = 'dummy-token'; // En un sistema real vendría del backend
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', this.token);
    },
    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }
});
