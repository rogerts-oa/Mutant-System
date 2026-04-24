<template>
  <div class="space-y-10 animate-in">
    <!-- Header -->
    <div>
      <h2 class="text-4xl font-black uppercase tracking-tight mb-2">CENTRO DE CONTROL DE ACCESO</h2>
      <p class="text-gray-500 font-medium">Estado del gimnasio y registros de entrada en tiempo real.</p>
    </div>

    <!-- Main Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <!-- Center Status (Massive Card) -->
      <div class="lg:col-span-2 relative h-[500px] bg-mutant-dark/20 rounded-[48px] border border-white/5 overflow-hidden flex flex-col items-center justify-center p-12 text-center group">
        <!-- Background Glow -->
        <div :class="`absolute inset-0 opacity-10 transition-colors duration-1000 ${lastAlert?.success ? 'bg-mutant-neon' : lastAlert ? 'bg-mutant-danger' : 'bg-gray-800'}`"></div>
        
        <div v-if="lastAlert" class="relative z-10 space-y-8 animate-in zoom-in">
          <!-- Big Icon -->
          <div :class="`w-32 h-32 mx-auto rounded-[40px] flex items-center justify-center shadow-2xl transition-all ${lastAlert.success ? 'bg-mutant-neon text-black shadow-mutant-neon/20' : 'bg-mutant-danger text-white shadow-mutant-danger/20'}`">
            <Check v-if="lastAlert.success" :size="64" stroke-width="3" />
            <X v-else :size="64" stroke-width="3" />
          </div>
          
          <div>
            <h3 :class="`text-6xl font-black uppercase tracking-tighter mb-2 ${lastAlert.success ? 'text-mutant-neon' : 'text-mutant-danger'}`">
              {{ lastAlert.success ? 'ACCESO PERMITIDO' : 'ACCESO DENEGADO' }}
            </h3>
            <p class="text-2xl font-bold uppercase text-gray-300">{{ lastAlert.nombre }}</p>
            <p class="text-gray-500 mt-4 font-medium italic">"{{ lastAlert.success ? '¡Ten un excelente entrenamiento!' : 'Tu membresía ha vencido. Por favor, acude a recepción.' }}"</p>
          </div>
        </div>

        <div v-else class="relative z-10 space-y-6 opacity-30">
          <div class="w-32 h-32 mx-auto rounded-[40px] border-4 border-dashed border-gray-700 flex items-center justify-center">
            <Radio class="w-16 h-16 text-gray-500 animate-pulse" />
          </div>
          <p class="text-2xl font-black uppercase tracking-widest text-gray-500">Esperando señal...</p>
        </div>

        <!-- Simulation Buttons Overlay -->
        <div class="absolute bottom-8 flex gap-4">
          <button @click="testCheckIn" class="bg-mutant-neon/5 hover:bg-mutant-neon/10 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-mutant-neon transition-all border border-mutant-neon/20 flex items-center gap-2">
            <LogIn class="w-4 h-4" /> Simular Entrada
          </button>
          <button @click="testCheckOut" class="bg-mutant-danger/5 hover:bg-mutant-danger/10 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-mutant-danger transition-all border border-mutant-danger/20 flex items-center gap-2">
            <LogOut class="w-4 h-4" /> Simular Salida
          </button>
        </div>
      </div>

      <!-- Widgets Column -->
      <div class="space-y-6">
        <!-- Live Capacity -->
        <div class="bg-mutant-dark/40 rounded-[32px] border border-white/5 p-8 relative overflow-hidden">
          <div class="flex justify-between items-start mb-6">
            <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Capacidad en Vivo</h3>
            <div class="w-10 h-10 bg-mutant-neon/10 rounded-xl flex items-center justify-center text-mutant-neon">
              <Users class="w-5 h-5" />
            </div>
          </div>
          <div class="flex items-baseline gap-2 mb-4">
            <span class="text-6xl font-black tracking-tighter">{{ liveCount }}</span>
            <span class="text-xl font-bold text-gray-700">/ 300</span>
          </div>
          <div class="w-full bg-white/5 h-2 rounded-full overflow-hidden mb-2">
            <div class="bg-mutant-neon h-full transition-all duration-1000" :style="`width: ${(liveCount/300)*100}%`"></div>
          </div>
          <div class="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
            <p class="text-gray-500">Actual: <span class="text-mutant-neon">{{ Math.round((liveCount/300)*100) }}%</span></p>
            <p class="text-mutant-neon">Óptimo</p>
          </div>
        </div>

        <!-- Total Check-ins -->
        <div class="bg-mutant-dark/40 rounded-[32px] border border-white/5 p-8">
          <div class="flex justify-between items-start mb-6">
            <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Entradas Hoy</h3>
            <div class="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-gray-400">
              <Activity class="w-5 h-5" />
            </div>
          </div>
          <p class="text-5xl font-black tracking-tighter mb-2">{{ totalToday }}</p>
          <p class="text-[10px] font-black uppercase tracking-widest text-mutant-neon">
            +12.4% <span class="text-gray-600">vs ayer</span>
          </p>
        </div>

        <!-- Recent Entries Mini List -->
        <div class="bg-mutant-dark/40 rounded-[32px] border border-white/5 p-8">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Ingresos Recientes</h3>
            <button class="text-[10px] font-black uppercase text-mutant-neon hover:underline">Ver Todo</button>
          </div>
          <div class="space-y-4">
            <div v-for="(log, i) in accessLogs.slice(0, 3)" :key="i" class="flex items-center gap-3">
              <div :class="`w-1 h-8 rounded-full ${log.success ? 'bg-mutant-neon' : 'bg-mutant-danger'}`"></div>
              <div class="min-w-0">
                <p class="text-xs font-bold truncate uppercase">{{ log.nombre || 'Anónimo' }}</p>
                <p class="text-[10px] text-gray-600 font-mono">{{ log.time }}</p>
              </div>
            </div>
            <p v-if="accessLogs.length === 0" class="text-[10px] text-gray-700 italic uppercase font-bold text-center py-4">Sin actividad</p>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { io } from 'socket.io-client';
import axios from 'axios';
import { 
  Check, 
  X, 
  Radio, 
  LogIn, 
  LogOut, 
  Users, 
  Activity 
} from 'lucide-vue-next';

const liveCount = ref(0);
const totalToday = ref(0);
const lastAlert = ref(null);
const accessLogs = ref([]);
let socket = null;

const fetchData = async () => {
  try {
    const res = await axios.get('http://localhost:3000/api/stats/live');
    liveCount.value = res.data.en_vivo;
    totalToday.value = res.data.detalles.entradas;
  } catch (err) {
    console.error('Error:', err);
  }
};

const testCheckIn = async () => {
  try {
    await axios.post('http://localhost:3000/api/access/check', { socio_id: 1 });
  } catch (err) {
    console.error('Error:', err);
  }
};

const testCheckOut = async () => {
  try {
    await axios.post('http://localhost:3000/api/access/exit', { socio_id: 1 });
    // Refrescar datos después de salida
    fetchData();
  } catch (err) {
    console.error('Error:', err);
  }
};

onMounted(() => {
  fetchData();
  socket = io('http://localhost:3000');
  
  socket.on('access_alert', (data) => {
    lastAlert.value = data;
    accessLogs.value.unshift({
      ...data,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    if (accessLogs.value.length > 10) accessLogs.value.pop();
    fetchData();
  });

  socket.on('exit_alert', () => {
    fetchData();
  });
});

onUnmounted(() => {
  if (socket) socket.disconnect();
});
</script>

<style scoped>
.animate-in {
  animation: fadeIn 0.5s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
