<template>
  <div class="space-y-10 animate-in">
    <!-- Header Section -->
    <div class="flex justify-between items-end">
      <div>
        <h2 class="text-4xl font-black uppercase tracking-tight mb-2">SOCIOS</h2>
        <p class="text-gray-500 font-medium">Administra las membresías y credenciales de acceso.</p>
      </div>
      <button @click="openRegisterModal" class="bg-mutant-neon text-black font-black px-6 py-4 rounded-2xl hover:scale-105 transition-all shadow-[0_0_30px_rgba(0,255,0,0.2)] flex items-center gap-2 uppercase text-sm tracking-tighter">
        <UserPlus class="w-5 h-5" /> NUEVO SOCIO
      </button>
    </div>

    <!-- Table Container -->
    <div class="bg-mutant-dark/30 rounded-[32px] border border-white/5 overflow-hidden shadow-2xl">
      <!-- Search & Filters -->
      <div class="p-6 flex flex-wrap gap-4 items-center">
        <div class="relative flex-grow max-w-xl">
          <input v-model="searchQuery" type="text" placeholder="Buscar por nombre, correo o ID..." class="w-full bg-mutant-dark border border-white/5 rounded-2xl p-4 pl-12 focus:border-mutant-neon outline-none text-sm font-medium transition-all">
          <Search class="absolute left-4 top-4 opacity-30 w-5 h-5" />
        </div>
        <div class="relative group">
          <select v-model="statusFilter" class="bg-mutant-dark border border-white/5 rounded-2xl p-4 text-xs font-bold uppercase tracking-widest outline-none appearance-none cursor-pointer hover:border-white/10 pr-12">
            <option value="all">TODOS LOS ESTATUS</option>
            <option value="activo">ACTIVOS</option>
            <option value="vencido">VENCIDOS</option>
          </select>
          <ChevronDown class="absolute right-4 top-4 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>
      </div>

      <!-- Table Content -->
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-black border-b border-white/5">
              <th class="px-8 py-5">Detalles del Socio</th>
              <th class="px-8 py-5">Plan Actual</th>
              <th class="px-8 py-5">Días Restantes</th>
              <th class="px-8 py-5">Estatus</th>
              <th class="px-8 py-5 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5">
            <tr v-for="member in filteredMembers" :key="member.id" class="group hover:bg-white/[0.02] transition-colors cursor-pointer" @click="viewDetails(member.id)">
              <td class="px-8 py-6">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 font-bold text-sm uppercase">
                    {{ member.nombre.substring(0, 2) }}
                  </div>
                  <div>
                    <p class="font-black text-sm uppercase tracking-tight">{{ member.nombre }}</p>
                    <p class="text-[10px] font-mono text-gray-500 uppercase tracking-widest mt-0.5">MT-{{ member.id.toString().padStart(6, '0') }}</p>
                  </div>
                </div>
              </td>
              <td class="px-8 py-6">
                <span class="bg-white/5 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-300">
                  {{ member.plan_nombre || 'N/A' }}
                </span>
              </td>
              <td class="px-8 py-6">
                <span :class="`font-bold text-sm ${getDaysLeft(member.fecha_fin) < 5 ? 'text-mutant-danger' : 'text-gray-400'}`">
                  {{ getDaysLeft(member.fecha_fin) }}
                </span>
              </td>
              <td class="px-8 py-6">
                <div :class="`inline-flex items-center gap-2 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${member.status_color}`">
                  <div :class="`w-1.5 h-1.5 rounded-full ${member.dot_color}`"></div>
                  {{ member.estatus }}
                </div>
              </td>
              <td class="px-8 py-6 text-right">
                <button class="text-gray-600 hover:text-white transition-colors">
                  <MoreVertical class="w-5 h-5" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="p-8 border-t border-white/5 flex justify-between items-center bg-white/[0.01]">
        <p class="text-xs font-black text-gray-600 uppercase tracking-widest">Mostrando <span class="text-gray-300">1 a {{ filteredMembers.length }}</span> de <span class="text-gray-300">{{ members.length }}</span></p>
        <div class="flex gap-2">
          <button class="w-10 h-10 rounded-xl border border-white/5 flex items-center justify-center text-gray-500 hover:bg-white/5 transition-all">
            <ChevronLeft class="w-4 h-4" />
          </button>
          <button class="w-10 h-10 rounded-xl bg-mutant-neon text-black font-black flex items-center justify-center text-xs">1</button>
          <button class="w-10 h-10 rounded-xl border border-white/5 flex items-center justify-center text-gray-500 hover:bg-white/5 transition-all">
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Registration Modal -->
    <div v-if="showRegisterModal" class="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-50 p-4">
      <div class="bg-mutant-dark border border-white/10 w-full max-w-xl rounded-[40px] shadow-[0_0_100px_rgba(0,255,0,0.05)] overflow-hidden">
        <div class="p-10 border-b border-white/5 flex justify-between items-center">
          <div>
            <h3 class="text-3xl font-black uppercase italic">Nuevo Socio</h3>
            <p class="text-gray-500 text-sm mt-1">Ingresa los datos para la nueva membresía.</p>
          </div>
          <button @click="showRegisterModal = false" class="text-gray-500 hover:text-white">
            <X class="w-6 h-6" />
          </button>
        </div>
        <form @submit.prevent="handleRegister" class="p-10 space-y-6">
          <div class="grid grid-cols-2 gap-6">
            <div class="col-span-2">
              <label class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2 block">Nombre Completo</label>
              <input v-model="form.nombre" required type="text" class="w-full bg-mutant-black border border-white/10 rounded-2xl p-4 focus:border-mutant-neon outline-none font-bold">
            </div>
            <div>
              <label class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2 block">Teléfono</label>
              <input v-model="form.telefono" type="text" class="w-full bg-mutant-black border border-white/10 rounded-2xl p-4 focus:border-mutant-neon outline-none font-mono">
            </div>
            <div class="relative">
              <label class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2 block">Plan</label>
              <select v-model="form.plan_id" required class="w-full bg-mutant-black border border-white/10 rounded-2xl p-4 focus:border-mutant-neon outline-none font-bold uppercase text-xs appearance-none">
                <option v-for="plan in planes" :key="plan.id" :value="plan.id">
                  {{ plan.nombre }} (${{ plan.costo }})
                </option>
              </select>
              <ChevronDown class="absolute right-4 top-[3.2rem] w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>
          <div class="flex gap-4 pt-4">
            <button type="button" @click="showRegisterModal = false" class="flex-grow bg-white/5 text-gray-400 font-black py-5 rounded-2xl hover:bg-white/10 uppercase tracking-widest text-xs">Cancelar</button>
            <button type="submit" class="flex-grow bg-mutant-neon text-black font-black py-5 rounded-2xl hover:brightness-110 shadow-lg shadow-mutant-neon/20 uppercase tracking-widest text-xs">Registrar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { 
  UserPlus, 
  Search, 
  ChevronDown, 
  MoreVertical, 
  ChevronLeft, 
  ChevronRight, 
  X 
} from 'lucide-vue-next';

const members = ref([]);
const planes = ref([]);
const searchQuery = ref('');
const statusFilter = ref('all');
const showRegisterModal = ref(false);

const form = ref({
  nombre: '',
  telefono: '',
  plan_id: null
});

const fetchPlanes = async () => {
  try {
    const res = await axios.get('http://localhost:3000/api/stats/planes');
    planes.value = res.data;
    if (planes.value.length > 0) form.value.plan_id = planes.value[0].id;
  } catch (err) {
    console.error('Error fetching planes:', err);
  }
};

const fetchMembers = async () => {
  try {
    const res = await axios.get('http://localhost:3000/api/members');
    members.value = res.data.map(m => {
      const today = new Date();
      const expiration = new Date(m.fecha_fin);
      const diffTime = expiration - today;
      const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      const isActive = days > 0 && m.estatus === 'activo';
      
      return {
        ...m,
        days_left: days > 0 ? days : '-',
        estatus: isActive ? 'ACTIVO' : 'VENCIDO',
        status_color: isActive ? 'bg-mutant-neon/10 text-mutant-neon' : 'bg-mutant-danger/10 text-mutant-danger',
        dot_color: isActive ? 'bg-mutant-neon' : 'bg-mutant-danger'
      };
    });
  } catch (err) {
    console.error('Error:', err);
  }
};

const filteredMembers = computed(() => {
  return members.value.filter(m => {
    const matchesSearch = m.nombre.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                         String(m.id).includes(searchQuery.value);
    const matchesStatus = statusFilter.value === 'all' || m.estatus.toLowerCase() === statusFilter.value;
    return matchesSearch && matchesStatus;
  });
});

const getDaysLeft = (date) => {
  const d = new Date(date);
  const now = new Date();
  const diff = d - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const openRegisterModal = () => {
  form.value = { nombre: '', telefono: '', plan_id: 1 };
  showRegisterModal.value = true;
};

const handleRegister = async () => {
  try {
    await axios.post('http://localhost:3000/api/members/register', form.value);
    showRegisterModal.value = false;
    fetchMembers();
  } catch (err) {
    alert('Error');
  }
};

const viewDetails = (id) => {
  console.log('View details for member:', id);
};

onMounted(() => {
  fetchMembers();
  fetchPlanes();
});
</script>

<style scoped>
.animate-in {
  animation: slideUp 0.4s ease-out;
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
