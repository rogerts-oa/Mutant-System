<template>
  <div class="min-h-screen bg-mutant-dark text-mutant-text">
    <nav v-if="auth.isAuthenticated" class="border-b border-gray-800 p-4 flex justify-between items-center bg-mutant-card">
      <h1 class="text-2xl font-black tracking-tighter text-mutant-accent italic">MUTANT SYSTEM 🛠️</h1>
      <div class="flex gap-6 items-center">
        <router-link to="/dashboard" class="hover:text-mutant-accent transition-colors" active-class="text-mutant-accent">Control</router-link>
        <router-link v-if="auth.isAdmin" to="/admin/analytics" class="hover:text-mutant-accent transition-colors" active-class="text-mutant-accent">Analíticas</router-link>
        <button @click="logout" class="bg-mutant-danger/10 text-mutant-danger px-4 py-1 rounded-md border border-mutant-danger/20 hover:bg-mutant-danger/20 transition-all text-sm font-bold uppercase">Salir</button>
      </div>
    </nav>
    <main class="container mx-auto p-6">
      <router-view></router-view>
    </main>
  </div>
</template>

<script setup>
import { useAuthStore } from './store/auth';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();

const logout = () => {
  auth.logout();
  router.push('/login');
};
</script>
