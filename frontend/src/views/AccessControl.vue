<template>
  <div class="space-y-8">
    <!-- Header Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-mutant-card border border-gray-800 p-6 rounded-2xl">
        <h3 class="text-gray-400 text-sm font-bold uppercase tracking-widest mb-1">Capacidad en Vivo</h3>
        <p class="text-5xl font-black text-mutant-accent">{{ liveCount }} <span class="text-xl text-gray-600">/ 100</span></p>
      </div>
      <div class="bg-mutant-card border border-gray-800 p-6 rounded-2xl md:col-span-2 flex justify-between items-center">
        <div>
          <h3 class="text-gray-400 text-sm font-bold uppercase tracking-widest mb-1">Estatus del Sistema</h3>
          <p class="text-mutant-accent font-bold flex items-center gap-2">
            <span class="w-2 h-2 bg-mutant-accent rounded-full animate-pulse"></span>
            OPERATIVO - TIEMPO REAL ACTIVO
          </p>
        </div>
        <button @click="testCheckIn" class="bg-gray-800 hover:bg-gray-700 text-xs px-4 py-2 rounded-lg font-bold uppercase tracking-tighter transition-all">Simular Check-in</button>
      </div>
    </div>

    <!-- Main Control Panel -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Last Alert -->
      <div class="space-y-4">
        <h2 class="text-xl font-bold italic uppercase tracking-tighter border-l-4 border-mutant-accent pl-4">Último Acceso</h2>
        <div v-if="lastAlert" :class="`p-8 rounded-3xl border-2 transition-all duration-500 transform ${lastAlert.success ? 'bg-mutant-accent/5 border-mutant-accent shadow-[0_0_50px_rgba(34,197,94,0.1)]' : 'bg-mutant-danger/5 border-mutant-danger shadow-[0_0_50px_rgba(239,68,68,0.1)]'}`">
          <div class="flex items-center gap-8">
            <div class="w-32 h-32 rounded-2xl overflow-hidden bg-mutant-dark border-2 border-gray-800 flex-shrink-0">
              <img v-if="lastAlert.foto" :src="lastAlert.foto" class="w-full h-full object-cover">
              <div v-else class="w-full h-full flex items-center justify-center text-4xl">👤</div>
            </div>
            <div class="flex-grow">
              <span :class="`inline-block px-3 py-1 rounded-full text-xs font-black uppercase mb-3 ${lastAlert.success ? 'bg-mutant-accent text-mutant-dark' : 'bg-mutant-danger text-mutant-text'}`">
                {{ lastAlert.message }}
              </span>
              <h3 class="text-3xl font-black mb-1 uppercase">{{ lastAlert.nombre }}</h3>
              <p class="text-gray-400 font-mono">Vence: {{ lastAlert.fecha_fin || 'N/A' }}</p>
            </div>
          </div>
        </div>
        <div v-else class="h-48 border-2 border-dashed border-gray-800 rounded-3xl flex items-center justify-center text-gray-600 font-bold uppercase">Esperando señal...</div>
      </div>

      <!-- History List -->
      <div class="space-y-4">
        <h2 class="text-xl font-bold italic uppercase tracking-tighter border-l-4 border-gray-700 pl-4">Registro Reciente</h2>
        <div class="bg-mutant-card border border-gray-800 rounded-3xl overflow-hidden">
          <div class="max-h-[400px] overflow-y-auto p-2 space-y-2">
            <div v-for="(log, idx) in accessLogs" :key="idx" class="flex items-center justify-between p-4 bg-mutant-dark/50 rounded-xl border border-gray-900/50">
              <div class="flex items-center gap-4">
                <div :class="`w-2 h-2 rounded-full ${log.success ? 'bg-mutant-accent' : 'bg-mutant-danger'}`"></div>
                <span class="font-bold">{{ log.nombre || 'Desconocido' }}</span>
              </div>
              <span class="text-xs text-gray-500 font-mono">{{ new Date().toLocaleTimeString() }}</span>
            </div>
            <div v-if="accessLogs.length === 0" class="p-8 text-center text-gray-600 italic">No hay actividad reciente</div>
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

const liveCount = ref(0);
const lastAlert = ref(null);
const accessLogs = ref([]);
let socket = null;

const fetchLiveCount = async () => {
  try {
    const res = await axios.get('http://localhost:3000/api/stats/live');
    liveCount.value = res.data.en_vivo;
  } catch (err) {
    console.error('Error fetching live count:', err);
  }
};

const testCheckIn = async () => {
  try {
    // Simular un acceso exitoso al API
    await axios.post('http://localhost:3000/api/access/check', { socio_id: 1 });
  } catch (err) {
    console.error('Error in simulation:', err);
  }
};

onMounted(() => {
  fetchLiveCount();
  
  socket = io('http://localhost:3000');
  
  socket.on('access_alert', (data) => {
    lastAlert.value = data;
    accessLogs.value.unshift(data);
    if (accessLogs.value.length > 10) accessLogs.value.pop();
    
    // Actualizar conteo después de un acceso
    fetchLiveCount();
  });
});

onUnmounted(() => {
  if (socket) socket.disconnect();
});
</script>
