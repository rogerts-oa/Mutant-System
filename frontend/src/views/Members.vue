<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <h2 class="text-3xl font-black italic uppercase tracking-tighter border-l-8 border-mutant-accent pl-6">Gestión de Socios 👥</h2>
      <button @click="openRegisterModal" class="bg-mutant-accent text-mutant-dark font-black px-6 py-3 rounded-xl hover:scale-105 transition-all shadow-lg shadow-mutant-accent/20 uppercase text-sm">
        + Nuevo Socio
      </button>
    </div>

    <!-- Filters & Search -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 bg-mutant-card p-4 rounded-2xl border border-gray-800">
      <input v-model="searchQuery" type="text" placeholder="Buscar por nombre o ID..." class="bg-mutant-dark border border-gray-700 rounded-xl p-3 focus:border-mutant-accent outline-none text-sm">
      <select v-model="statusFilter" class="bg-mutant-dark border border-gray-700 rounded-xl p-3 focus:border-mutant-accent outline-none text-sm">
        <option value="all">Todos los estatus</option>
        <option value="activo">Activos</option>
        <option value="vencido">Vencidos</option>
      </select>
    </div>

    <!-- Members Table -->
    <div class="bg-mutant-card border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-mutant-dark/50 text-gray-400 text-xs uppercase tracking-widest border-b border-gray-800">
              <th class="p-4">ID</th>
              <th class="p-4">Nombre</th>
              <th class="p-4">Plan</th>
              <th class="p-4">Vencimiento</th>
              <th class="p-4">Estatus</th>
              <th class="p-4">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-800">
            <tr v-for="member in filteredMembers" :key="member.id" class="hover:bg-white/5 transition-colors group cursor-pointer" @click="viewDetails(member.id)">
              <td class="p-4 text-xs font-mono text-gray-500">#{{ member.id }}</td>
              <td class="p-4 font-bold">{{ member.nombre }}</td>
              <td class="p-4 text-sm text-gray-400">{{ member.plan_nombre || 'Sin Plan' }}</td>
              <td class="p-4 text-sm font-mono">{{ member.fecha_fin || 'N/A' }}</td>
              <td class="p-4">
                <span :class="`px-3 py-1 rounded-full text-[10px] font-black uppercase ${member.estatus === 'activo' ? 'bg-mutant-accent/10 text-mutant-accent border border-mutant-accent/20' : 'bg-mutant-danger/10 text-mutant-danger border border-mutant-danger/20'}`">
                  {{ member.estatus || 'Inactivo' }}
                </span>
              </td>
              <td class="p-4">
                <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button @click.stop="confirmDelete(member.id)" class="text-mutant-danger hover:scale-110">🗑️</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Registration Modal -->
    <div v-if="showRegisterModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-mutant-card w-full max-w-lg rounded-3xl border border-gray-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div class="p-8 border-b border-gray-800 flex justify-between items-center">
          <h3 class="text-2xl font-black italic uppercase italic">Nuevo Socio</h3>
          <button @click="showRegisterModal = false" class="text-gray-500 hover:text-white text-2xl">&times;</button>
        </div>
        <form @submit.prevent="handleRegister" class="p-8 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="col-span-2">
              <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Nombre Completo</label>
              <input v-model="form.nombre" required type="text" class="w-full bg-mutant-dark border border-gray-700 rounded-xl p-3 focus:border-mutant-accent outline-none">
            </div>
            <div>
              <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Teléfono</label>
              <input v-model="form.telefono" type="text" class="w-full bg-mutant-dark border border-gray-700 rounded-xl p-3 focus:border-mutant-accent outline-none">
            </div>
            <div>
              <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Correo</label>
              <input v-model="form.correo" type="email" class="w-full bg-mutant-dark border border-gray-700 rounded-xl p-3 focus:border-mutant-accent outline-none">
            </div>
            <div class="col-span-2">
              <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Plan Inicial</label>
              <select v-model="form.plan_id" required class="w-full bg-mutant-dark border border-gray-700 rounded-xl p-3 focus:border-mutant-accent outline-none">
                <option :value="1">Mensual ($500)</option>
                <option :value="2">Trimestral ($1350)</option>
                <option :value="3">Anual ($4800)</option>
              </select>
            </div>
          </div>
          <button type="submit" class="w-full bg-mutant-accent text-mutant-dark font-black py-4 rounded-xl mt-4 hover:brightness-110 transition-all">FINALIZAR REGISTRO</button>
        </form>
      </div>
    </div>

    <!-- Detail Modal -->
    <div v-if="selectedMember" class="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div class="bg-mutant-card w-full max-w-4xl rounded-[40px] border border-gray-800 shadow-2xl overflow-hidden flex flex-col md:flex-row h-[90vh]">
        <!-- Left Sidebar (Photo & Basic Info) -->
        <div class="md:w-1/3 bg-mutant-dark/50 p-8 flex flex-col items-center text-center border-r border-gray-800">
          <div class="w-40 h-40 rounded-3xl bg-mutant-card border-2 border-mutant-accent overflow-hidden mb-6 shadow-[0_0_30px_rgba(34,197,94,0.1)]">
            <img v-if="selectedMember.foto" :src="selectedMember.foto" class="w-full h-full object-cover">
            <div v-else class="w-full h-full flex items-center justify-center text-6xl">👤</div>
          </div>
          <h3 class="text-2xl font-black uppercase mb-1">{{ selectedMember.nombre }}</h3>
          <p class="text-mutant-accent font-mono text-sm mb-6 tracking-widest">Socio #{{ selectedMember.id }}</p>
          
          <div class="w-full space-y-4 text-left bg-mutant-card p-4 rounded-2xl border border-gray-800">
            <div>
              <p class="text-[10px] text-gray-500 uppercase font-bold">Plan Actual</p>
              <p class="font-bold text-sm">{{ selectedMember.plan_nombre }}</p>
            </div>
            <div>
              <p class="text-[10px] text-gray-500 uppercase font-bold">Vencimiento</p>
              <p class="font-bold text-sm font-mono text-mutant-danger">{{ selectedMember.fecha_fin }}</p>
            </div>
          </div>

          <button @click="selectedMember = null" class="mt-auto text-gray-500 hover:text-white text-sm font-bold uppercase tracking-widest">Cerrar Detalle</button>
        </div>

        <!-- Right Content (Financial & Access) -->
        <div class="flex-grow p-10 overflow-y-auto space-y-10">
          <!-- Admin Only Section -->
          <div v-if="auth.isAdmin" class="space-y-4">
            <h4 class="text-sm font-black text-mutant-accent uppercase tracking-[0.3em] border-b border-mutant-accent/20 pb-2">Estatus Financiero (Admin Only)</h4>
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-mutant-dark p-4 rounded-2xl border border-gray-800">
                <p class="text-[10px] text-gray-500 uppercase">Costo del Plan</p>
                <p class="text-xl font-black">${{ selectedMember.plan_costo }} MXN</p>
              </div>
              <div class="bg-mutant-dark p-4 rounded-2xl border border-gray-800">
                <p class="text-[10px] text-gray-500 uppercase">Próximo Pago</p>
                <p class="text-xl font-black">{{ selectedMember.fecha_fin }}</p>
              </div>
            </div>
          </div>

          <!-- Access History -->
          <div class="space-y-4">
            <h4 class="text-sm font-black text-gray-400 uppercase tracking-[0.3em] border-b border-gray-800 pb-2">Historial de Accesos</h4>
            <div class="space-y-2">
              <div v-for="(acceso, i) in selectedMember.historial_accesos" :key="i" class="flex justify-between items-center p-3 bg-mutant-dark/30 rounded-xl border border-gray-800/50">
                <div class="flex items-center gap-4">
                  <span :class="`w-2 h-2 rounded-full ${acceso.resultado === 'exito' ? 'bg-mutant-accent' : 'bg-mutant-danger'}`"></span>
                  <span class="text-sm font-mono">{{ formatDateTime(acceso.fecha_acceso) }}</span>
                </div>
                <span class="text-[10px] font-bold uppercase text-gray-500">{{ acceso.tipo }}</span>
              </div>
              <p v-if="selectedMember.historial_accesos.length === 0" class="text-center py-4 text-gray-600 italic">No hay registros de acceso.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { useAuthStore } from '../store/auth';

const auth = useAuthStore();
const members = ref([]);
const searchQuery = ref('');
const statusFilter = ref('all');
const showRegisterModal = ref(false);
const selectedMember = ref(null);

const form = ref({
  nombre: '',
  telefono: '',
  correo: '',
  plan_id: 1
});

const fetchMembers = async () => {
  try {
    const res = await axios.get('http://localhost:3000/api/members');
    members.value = res.data;
  } catch (err) {
    console.error('Error al cargar socios:', err);
  }
};

const filteredMembers = computed(() => {
  return members.value.filter(m => {
    const matchesSearch = m.nombre.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                         String(m.id).includes(searchQuery.value);
    const matchesStatus = statusFilter.value === 'all' || m.estatus === statusFilter.value;
    return matchesSearch && matchesStatus;
  });
});

const openRegisterModal = () => {
  form.value = { nombre: '', telefono: '', correo: '', plan_id: 1 };
  showRegisterModal.value = true;
};

const handleRegister = async () => {
  try {
    await axios.post('http://localhost:3000/api/members/register', form.value);
    showRegisterModal.value = false;
    fetchMembers();
    alert('Socio registrado con éxito');
  } catch (err) {
    alert('Error al registrar: ' + err.response?.data?.error);
  }
};

const viewDetails = async (id) => {
  try {
    const res = await axios.get(`http://localhost:3000/api/members/${id}`);
    selectedMember.value = res.data;
  } catch (err) {
    console.error('Error al cargar detalle:', err);
  }
};

const confirmDelete = async (id) => {
  if (confirm('¿Estás seguro de dar de baja a este socio?')) {
    try {
      await axios.delete(`http://localhost:3000/api/members/${id}`);
      fetchMembers();
    } catch (err) {
      alert('Error al eliminar');
    }
  }
};

const formatDateTime = (dt) => {
  return new Date(dt).toLocaleString();
};

onMounted(fetchMembers);
</script>

<style scoped>
.animate-in {
  animation: modalIn 0.3s ease-out;
}
@keyframes modalIn {
  from { opacity: 0; transform: scale(0.95) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
</style>
