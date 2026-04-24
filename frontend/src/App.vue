<template>
  <div class="flex h-screen bg-mutant-black text-mutant-text font-sans overflow-hidden">
    <!-- Sidebar - Conditionally rendered -->
    <aside v-if="!isLoginPage && auth.isAuthenticated" class="w-64 bg-mutant-black border-r border-white/5 flex flex-col p-6 h-full flex-shrink-0">
      <!-- Logo -->
      <div class="flex items-center gap-3 mb-12">
        <div class="w-8 h-8 bg-mutant-neon rounded-lg flex items-center justify-center">
          <Dumbbell class="text-black w-5 h-5" />
        </div>
        <h1 class="text-xl font-black tracking-tighter uppercase">MUTANT<span class="text-mutant-neon">GYM</span></h1>
      </div>

      <!-- Menu -->
      <nav class="flex-grow space-y-2">
        <p class="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 px-3">Menú</p>
        
        <router-link to="/dashboard" class="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group" active-class="bg-mutant-neon/10 text-mutant-neon">
          <LayoutDashboard class="w-5 h-5" />
          <span class="font-bold text-sm">Panel de Control</span>
          <div v-if="$route.path === '/dashboard'" class="ml-auto w-1 h-1 bg-mutant-neon rounded-full"></div>
        </router-link>

        <router-link to="/members" class="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group" active-class="bg-mutant-neon/10 text-mutant-neon">
          <Users class="w-5 h-5" />
          <span class="font-bold text-sm">Gestión de Socios</span>
          <div v-if="$route.path === '/members'" class="ml-auto w-1 h-1 bg-mutant-neon rounded-full"></div>
        </router-link>

        <router-link v-if="auth.isAdmin" to="/admin/analytics" class="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group" active-class="bg-mutant-neon/10 text-mutant-neon">
          <BarChart3 class="w-5 h-5" />
          <span class="font-bold text-sm">Analíticas</span>
          <div v-if="$route.path === '/admin/analytics'" class="ml-auto w-1 h-1 bg-mutant-neon rounded-full"></div>
        </router-link>

        <router-link v-if="auth.isAdmin" to="/admin/settings" class="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group" active-class="bg-mutant-neon/10 text-mutant-neon">
          <Settings2 class="w-5 h-5" />
          <span class="font-bold text-sm">Configuración</span>
          <div v-if="$route.path === '/admin/settings'" class="ml-auto w-1 h-1 bg-mutant-neon rounded-full"></div>
        </router-link>
      </nav>

      <!-- User Profile at bottom -->
      <div class="mt-auto pt-6 border-t border-white/5 flex items-center gap-3 bg-mutant-dark/50 p-3 rounded-2xl">
        <div class="w-10 h-10 rounded-xl bg-mutant-neon/20 flex items-center justify-center text-mutant-neon font-bold text-sm uppercase">
          {{ auth.user?.username?.substring(0, 2) || 'US' }}
        </div>
        <div class="flex-grow min-w-0">
          <p class="text-sm font-bold truncate">{{ auth.user?.username || 'Usuario' }}</p>
          <p class="text-[10px] text-mutant-neon font-bold uppercase tracking-tighter">{{ auth.user?.role === 'admin' ? 'Pro Manager' : 'Staff Member' }}</p>
        </div>
        <button @click="logout" class="text-gray-500 hover:text-mutant-danger transition-colors">
          <LogOut class="w-5 h-5" />
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main :class="`flex-grow overflow-y-auto bg-mutant-black ${isLoginPage ? '' : 'p-10'}`">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from './store/auth';
import { useRouter, useRoute } from 'vue-router';
import { 
  Dumbbell, 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  LogOut,
  Settings2
} from 'lucide-vue-next';

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

const isLoginPage = computed(() => route.path === '/login');

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
  transition: all 0.3s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
