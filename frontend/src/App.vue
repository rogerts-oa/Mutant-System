<template>
  <div class="flex h-screen bg-mutant-black text-mutant-text font-sans overflow-hidden">
    <!-- Sidebar -->
    <aside class="w-64 bg-mutant-black border-r border-white/5 flex flex-col p-6 h-full flex-shrink-0">
      <!-- Logo -->
      <div class="flex items-center gap-3 mb-12">
        <div class="w-8 h-8 bg-mutant-neon rounded-lg flex items-center justify-center">
          <span class="text-black font-black text-xs">M</span>
        </div>
        <h1 class="text-xl font-black tracking-tighter uppercase">MUTANT<span class="text-mutant-neon">GYM</span></h1>
      </div>

      <!-- Menu -->
      <nav class="flex-grow space-y-2">
        <p class="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 px-3">Menú</p>
        
        <router-link to="/dashboard" class="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group" active-class="bg-mutant-neon/10 text-mutant-neon">
          <span class="text-lg">🏠</span>
          <span class="font-bold text-sm">Panel de Control</span>
          <div v-if="$route.path === '/dashboard'" class="ml-auto w-1 h-1 bg-mutant-neon rounded-full"></div>
        </router-link>

        <router-link to="/members" class="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group" active-class="bg-mutant-neon/10 text-mutant-neon">
          <span class="text-lg">👥</span>
          <span class="font-bold text-sm">Gestión de Socios</span>
          <div v-if="$route.path === '/members'" class="ml-auto w-1 h-1 bg-mutant-neon rounded-full"></div>
        </router-link>

        <router-link v-if="auth.isAdmin" to="/admin/analytics" class="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group" active-class="bg-mutant-neon/10 text-mutant-neon">
          <span class="text-lg">📊</span>
          <span class="font-bold text-sm">Analíticas</span>
          <div v-if="$route.path === '/admin/analytics'" class="ml-auto w-1 h-1 bg-mutant-neon rounded-full"></div>
        </router-link>
      </nav>

      <!-- User Profile at bottom -->
      <div v-if="auth.isAuthenticated" class="mt-auto pt-6 border-t border-white/5 flex items-center gap-3 bg-mutant-dark/50 p-3 rounded-2xl">
        <div class="w-10 h-10 rounded-xl bg-mutant-neon/20 flex items-center justify-center text-mutant-neon font-bold text-sm">AD</div>
        <div class="flex-grow min-w-0">
          <p class="text-sm font-bold truncate">Administrador</p>
          <p class="text-[10px] text-mutant-neon font-bold uppercase tracking-tighter">Pro Manager</p>
        </div>
        <button @click="logout" class="text-gray-500 hover:text-mutant-danger transition-colors text-lg">⚙️</button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-grow overflow-y-auto bg-mutant-black p-10">
      <router-view></router-view>
    </main>
  </div>
</template>

<script setup>
import { useAuthStore } from './store/auth';
import { useRouter, useRoute } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

const logout = () => {
  auth.logout();
  router.push('/login');
};
</script>

<style>
/* Estilos globales para Scrollbar */
::-webkit-scrollbar {
  width: 5px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #121212;
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: #222;
}

/* Transiciones de página */
.page-enter-active, .page-leave-active {
  transition: opacity 0.2s ease;
}
.page-enter-from, .page-leave-to {
  opacity: 0;
}
</style>
