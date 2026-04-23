<template>
  <div class="flex items-center justify-center min-h-[80vh]">
    <div class="bg-mutant-card p-10 rounded-2xl border border-gray-800 shadow-2xl w-full max-w-md">
      <div class="text-center mb-10">
        <h2 class="text-4xl font-black mb-2 italic">BIENVENIDO</h2>
        <p class="text-gray-400">Identifícate para entrar al sistema</p>
      </div>
      
      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label class="block text-sm font-bold mb-2 text-gray-400 uppercase tracking-widest">Usuario</label>
          <input v-model="user" type="text" class="w-full bg-mutant-dark border border-gray-700 rounded-xl p-4 focus:border-mutant-accent outline-none transition-all" placeholder="admin / staff">
        </div>
        <div>
          <label class="block text-sm font-bold mb-2 text-gray-400 uppercase tracking-widest">Contraseña</label>
          <input v-model="password" type="password" class="w-full bg-mutant-dark border border-gray-700 rounded-xl p-4 focus:border-mutant-accent outline-none transition-all" placeholder="••••••••">
        </div>
        <button type="submit" class="w-full bg-mutant-accent text-mutant-dark font-black py-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-mutant-accent/20">
          ENTRAR AL SISTEMA
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../store/auth';
import { useRouter } from 'vue-router';

const user = ref('');
const password = ref('');
const auth = useAuthStore();
const router = useRouter();

const handleLogin = () => {
  // Simulación de login simple
  const role = user.value === 'admin' ? 'admin' : 'staff';
  auth.login({ username: user.value, role });
  router.push('/dashboard');
};
</script>
