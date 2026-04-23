<template>
  <div class="flex items-center justify-center min-h-[90vh]">
    <div class="bg-mutant-dark/50 p-12 rounded-[48px] border border-white/5 shadow-2xl w-full max-w-md backdrop-blur-xl">
      <div class="text-center mb-12">
        <div class="w-16 h-16 bg-mutant-neon rounded-2xl mx-auto flex items-center justify-center mb-6 rotate-12 shadow-[0_0_40px_rgba(0,255,0,0.3)]">
          <span class="text-black font-black text-2xl">M</span>
        </div>
        <h2 class="text-4xl font-black mb-2 italic tracking-tighter uppercase">BIENVENIDO</h2>
        <p class="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Identifícate para entrar al sistema</p>
      </div>
      
      <form @submit.prevent="handleLogin" class="space-y-8">
        <div>
          <label class="block text-[10px] font-black mb-3 text-gray-500 uppercase tracking-[0.3em] ml-2">Usuario</label>
          <input v-model="user" type="text" class="w-full bg-mutant-black border border-white/5 rounded-2xl p-5 focus:border-mutant-neon outline-none transition-all font-bold text-sm" placeholder="ADMIN / STAFF">
        </div>
        <div>
          <label class="block text-[10px] font-black mb-3 text-gray-500 uppercase tracking-[0.3em] ml-2">Contraseña</label>
          <input v-model="password" type="password" class="w-full bg-mutant-black border border-white/5 rounded-2xl p-5 focus:border-mutant-neon outline-none transition-all font-bold text-sm" placeholder="••••••••">
        </div>
        <button type="submit" class="w-full bg-mutant-neon text-black font-black py-5 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-mutant-neon/20 uppercase tracking-widest text-xs">
          ENTRAR AL SISTEMA
        </button>
      </form>

      <p class="text-center mt-12 text-[10px] font-black text-gray-700 uppercase tracking-[0.2em]">
        Mutant Gym © 2026 - Control de Acceso
      </p>
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
  const role = user.value.toLowerCase() === 'admin' ? 'admin' : 'staff';
  auth.login({ username: user.value, role });
  router.push('/dashboard');
};
</script>
