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
      <div class="overflow-x-auto min-h-[400px]">
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
            <tr v-for="member in filteredMembers" :key="member.id" class="group hover:bg-white/[0.02] transition-colors cursor-pointer" @click="viewDetails(member)">
              <td class="px-8 py-6">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 font-bold text-sm uppercase overflow-hidden">
                    <img v-if="member.foto" :src="member.foto" class="w-full h-full object-cover" />
                    <span v-else>{{ member.nombre.substring(0, 2) }}</span>
                  </div>
                  <div>
                    <p class="font-black text-sm uppercase tracking-tight">{{ member.nombre }}</p>
                    <p class="text-[10px] font-mono text-gray-500 uppercase tracking-widest mt-0.5">MT-{{ member.id.toString().padStart(6, '0') }}</p>
                  </div>
                </div>
              </td>
              <td class="px-8 py-6">
                <span class="bg-white/5 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-300">
                  {{ member.plan_nombre || 'SIN PLAN' }}
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
              <td class="px-8 py-6 text-right relative" @click.stop>
                <button @click="toggleMenu(member.id)" class="text-gray-600 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5">
                  <MoreVertical class="w-5 h-5" />
                </button>
                
                <!-- Action Dropdown -->
                <div v-if="activeMenu === member.id" class="absolute right-8 top-16 w-56 bg-mutant-dark border border-white/10 rounded-2xl shadow-2xl z-40 overflow-hidden py-2 animate-in slide-in-from-top-2">
                  <button @click="openEditModal(member)" class="w-full text-left px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-white/5 hover:text-white flex items-center gap-3">
                    <Edit class="w-4 h-4" /> Editar Datos
                  </button>
                  <button @click="openRenewModal(member)" class="w-full text-left px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-white/5 hover:text-white flex items-center gap-3">
                    <RefreshCw class="w-4 h-4 text-mutant-neon" /> Renovar Plan
                  </button>
                  <button @click="viewDetails(member)" class="w-full text-left px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-white/5 hover:text-white flex items-center gap-3">
                    <History class="w-4 h-4" /> Ver Historial
                  </button>
                  <div class="h-px bg-white/5 my-1"></div>
                  <button @click="handleDelete(member.id)" class="w-full text-left px-6 py-3 text-[10px] font-black uppercase tracking-widest text-mutant-danger hover:bg-mutant-danger/5 flex items-center gap-3">
                    <Trash2 class="w-4 h-4" /> Dar de Baja
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modals -->
    <div v-if="modal.show" class="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-50 p-4" @click.self="closeModal">
      <div class="bg-mutant-dark border border-white/10 w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden">
        <div class="p-10 border-b border-white/5 flex justify-between items-center">
          <div>
            <h3 class="text-3xl font-black uppercase italic">{{ modal.title }}</h3>
            <p class="text-gray-500 text-sm mt-1">{{ modal.subtitle }}</p>
          </div>
          <button @click="closeModal" class="text-gray-500 hover:text-white"><X class="w-6 h-6" /></button>
        </div>
        
        <form @submit.prevent="modal.action" class="p-10 space-y-6">
          <div v-if="modal.type !== 'renew'" class="grid grid-cols-2 gap-6">
            <div class="col-span-2">
              <label class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2 block">Nombre Completo</label>
              <input v-model="form.nombre" required type="text" class="w-full bg-mutant-black border border-white/10 rounded-2xl p-4 focus:border-mutant-neon outline-none font-bold">
            </div>
            <div>
              <label class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2 block">Teléfono</label>
              <input v-model="form.telefono" type="text" class="w-full bg-mutant-black border border-white/10 rounded-2xl p-4 focus:border-mutant-neon outline-none font-mono">
            </div>
            <div v-if="modal.type === 'register'" class="relative">
              <label class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2 block">Plan Inicial</label>
              <select v-model="form.plan_id" required class="w-full bg-mutant-black border border-white/10 rounded-2xl p-4 focus:border-mutant-neon outline-none font-bold uppercase text-xs appearance-none">
                <option v-for="plan in sortedPlanes" :key="plan.id" :value="plan.id">
                  {{ plan.nombre }} (${{ plan.costo }})
                </option>
              </select>
              <ChevronDown class="absolute right-4 top-[3.2rem] w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>

          <div v-if="modal.type === 'renew'" class="space-y-6">
            <div class="bg-mutant-black p-6 rounded-2xl border border-white/5">
              <p class="text-[10px] font-black text-gray-500 uppercase mb-2">Vencimiento Actual</p>
              <p class="text-xl font-bold text-white">{{ form.current_expiration || 'Ya vencido' }}</p>
            </div>
            <div class="relative">
              <label class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2 block">Seleccionar Nuevo Plan</label>
              <select v-model="form.plan_id" required class="w-full bg-mutant-black border border-white/10 rounded-2xl p-4 focus:border-mutant-neon outline-none font-bold uppercase text-xs appearance-none">
                <option v-for="plan in sortedPlanes" :key="plan.id" :value="plan.id">{{ plan.nombre }} (${{ plan.costo }})</option>
              </select>
              <ChevronDown class="absolute right-4 top-[3.2rem] w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>

          <div class="flex gap-4 pt-4">
            <button type="button" @click="closeModal" class="flex-grow bg-white/5 text-gray-400 font-black py-5 rounded-2xl hover:bg-white/10 uppercase tracking-widest text-xs">Cancelar</button>
            <button type="submit" class="flex-grow bg-mutant-neon text-black font-black py-5 rounded-2xl hover:brightness-110 shadow-lg shadow-mutant-neon/20 uppercase tracking-widest text-xs">
              {{ modal.confirmText }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- History Modal -->
    <div v-if="historyModal.show" class="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-50 p-4" @click.self="historyModal.show = false">
      <div class="bg-mutant-dark border border-white/10 w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <div class="p-10 border-b border-white/5 flex justify-between items-center">
          <div>
            <h3 class="text-3xl font-black uppercase italic">Historial de {{ historyModal.member?.nombre }}</h3>
            <p class="text-gray-500 text-sm mt-1">Últimos 20 accesos registrados.</p>
          </div>
          <button @click="historyModal.show = false" class="text-gray-500 hover:text-white"><X class="w-6 h-6" /></button>
        </div>
        <div class="p-10 overflow-y-auto space-y-4 flex-grow custom-scroll">
          <div v-for="(log, i) in historyModal.logs" :key="i" class="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
            <div class="flex items-center gap-4">
              <div :class="`w-3 h-3 rounded-full ${log.resultado === 'exito' ? 'bg-mutant-neon' : 'bg-mutant-danger'}`"></div>
              <div>
                <p class="text-[10px] font-black text-gray-500 uppercase">{{ log.tipo }}</p>
                <p class="font-bold text-sm">{{ new Date(log.fecha_acceso).toLocaleString() }}</p>
              </div>
            </div>
            <span :class="`text-[10px] font-black uppercase px-3 py-1 rounded-lg ${log.resultado === 'exito' ? 'text-mutant-neon bg-mutant-neon/10' : 'text-mutant-danger bg-mutant-danger/10'}`">
              {{ log.resultado === 'exito' ? 'EXITOSO' : 'FALLIDO' }}
            </span>
          </div>
          <p v-if="historyModal.logs.length === 0" class="text-center text-gray-700 py-10 italic">Sin registros de acceso.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { 
  UserPlus, Search, ChevronDown, MoreVertical, X, Edit, RefreshCw, History, Trash2 
} from 'lucide-vue-next';

const members = ref([]);
const planes = ref([]);
const searchQuery = ref('');
const statusFilter = ref('all');
const activeMenu = ref(null);

const sortedPlanes = computed(() => {
  return [...planes.value].sort((a, b) => a.duracion_meses - b.duracion_meses);
});

const historyModal = ref({
  show: false,
  member: null,
  logs: []
});

const modal = ref({
  show: false,
  type: 'register',
  title: '',
  subtitle: '',
  confirmText: '',
  action: null
});

const form = ref({
  id: null,
  nombre: '',
  telefono: '',
  plan_id: null,
  current_expiration: ''
});

const fetchPlanes = async () => {
  try {
    const res = await axios.get('http://localhost:3000/api/stats/planes');
    planes.value = res.data;
  } catch (err) { console.error(err); }
};

const fetchMembers = async () => {
  try {
    const res = await axios.get('http://localhost:3000/api/members');
    members.value = res.data.map(m => {
      const days = getDaysLeft(m.fecha_fin);
      const isActive = days > 0 && m.estatus === 'activo';
      return {
        ...m,
        estatus: isActive ? 'ACTIVO' : 'VENCIDO',
        status_color: isActive ? 'bg-mutant-neon/10 text-mutant-neon' : 'bg-mutant-danger/10 text-mutant-danger',
        dot_color: isActive ? 'bg-mutant-neon' : 'bg-mutant-danger'
      };
    });
  } catch (err) { console.error(err); }
};

const filteredMembers = computed(() => {
  return members.value.filter(m => {
    const matchesSearch = m.nombre.toLowerCase().includes(searchQuery.value.toLowerCase()) || String(m.id).includes(searchQuery.value);
    const matchesStatus = statusFilter.value === 'all' || m.estatus.toLowerCase() === statusFilter.value;
    return matchesSearch && matchesStatus;
  });
});

const getDaysLeft = (date) => {
  if (!date) return 0;
  const d = new Date(date);
  const now = new Date();
  const diff = d - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const toggleMenu = (id) => { activeMenu.value = activeMenu.value === id ? null : id; };

const openRegisterModal = () => {
  modal.value = { show: true, type: 'register', title: 'Nuevo Socio', subtitle: 'Registra una nueva membresía.', confirmText: 'Registrar', action: handleRegister };
  form.value = { nombre: '', telefono: '', plan_id: planes.value[0]?.id };
};

const openEditModal = (member) => {
  activeMenu.value = null;
  modal.value = { show: true, type: 'edit', title: 'Editar Socio', subtitle: 'Actualiza los datos personales.', confirmText: 'Guardar Cambios', action: handleUpdate };
  form.value = { id: member.id, nombre: member.nombre, telefono: member.telefono };
};

const openRenewModal = (member) => {
  activeMenu.value = null;
  modal.value = { show: true, type: 'renew', title: 'Renovar Plan', subtitle: 'Añade tiempo a la membresía.', confirmText: 'Confirmar Renovación', action: handleRenew };
  form.value = { id: member.id, plan_id: planes.value[0]?.id, current_expiration: member.fecha_fin };
};

const closeModal = () => { modal.value.show = false; };

const handleRegister = async () => {
  try {
    await axios.post('http://localhost:3000/api/members/register', form.value);
    closeModal();
    fetchMembers();
  } catch (err) { alert('Error al registrar'); }
};

const handleUpdate = async () => {
  try {
    await axios.put(`http://localhost:3000/api/members/${form.value.id}`, form.value);
    closeModal();
    fetchMembers();
  } catch (err) { alert('Error al actualizar'); }
};

const handleRenew = async () => {
  try {
    await axios.post('http://localhost:3000/api/members/renew', { socio_id: form.value.id, plan_id: form.value.plan_id });
    closeModal();
    fetchMembers();
  } catch (err) { alert('Error al renovar'); }
};

const handleDelete = async (id) => {
  if (confirm('¿Estás seguro de dar de baja a este socio?')) {
    try {
      await axios.delete(`http://localhost:3000/api/members/${id}`);
      activeMenu.value = null;
      fetchMembers();
    } catch (err) { alert('Error al eliminar'); }
  }
};

const viewDetails = async (member) => {
  activeMenu.value = null;
  try {
    const res = await axios.get(`http://localhost:3000/api/members/${member.id}`);
    historyModal.value = {
      show: true,
      member: res.data,
      logs: res.data.historial_accesos
    };
  } catch (err) {
    alert('Error al obtener historial');
  }
};

onMounted(() => {
  fetchMembers();
  fetchPlanes();
  window.addEventListener('click', () => activeMenu.value = null);
});
</script>

<style scoped>
.animate-in { animation: slideUp 0.4s ease-out; }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
</style>
