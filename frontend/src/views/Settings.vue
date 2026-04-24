<template>
  <div class="space-y-10 animate-in">
    <!-- Header -->
    <div>
      <h2 class="text-4xl font-black uppercase tracking-tight mb-2">CONFIGURACIÓN GLOBAL</h2>
      <p class="text-gray-500 font-medium">Gestiona los parámetros base y precios del sistema.</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      <!-- General Config Card -->
      <div class="bg-mutant-dark/40 rounded-[32px] border border-white/5 p-8 space-y-8">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-mutant-neon/10 rounded-2xl flex items-center justify-center text-mutant-neon">
            <Settings2 class="w-6 h-6" />
          </div>
          <h3 class="text-xl font-black uppercase tracking-tight">Parámetros del Gimnasio</h3>
        </div>

        <div class="space-y-6">
          <div>
            <label class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-3 block">Capacidad Máxima (Cupo)</label>
            <div class="flex gap-4">
              <input v-model="config.cupo_maximo" type="number" class="flex-grow bg-mutant-black border border-white/10 rounded-2xl p-4 focus:border-mutant-neon outline-none font-bold text-xl">
              <button @click="saveConfig('cupo_maximo', config.cupo_maximo)" class="bg-mutant-neon text-black font-black px-6 rounded-2xl hover:brightness-110 transition-all uppercase text-[10px] tracking-widest">Guardar</button>
            </div>
            <p class="text-[10px] text-gray-600 mt-2 italic uppercase">Este valor afecta los cálculos de saturación en el Panel de Control.</p>
          </div>
        </div>
      </div>

      <!-- Plans Management Card -->
      <div class="bg-mutant-dark/40 rounded-[32px] border border-white/5 p-8 space-y-8">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
            <CreditCard class="w-6 h-6" />
          </div>
          <h3 class="text-xl font-black uppercase tracking-tight">Precios de Membresías</h3>
        </div>

        <div class="space-y-4">
          <div v-for="plan in sortedPlanes" :key="plan.id" class="bg-mutant-black border border-white/5 rounded-2xl p-5 flex items-center justify-between group">
            <div>
              <p class="font-black uppercase tracking-tight text-sm">{{ plan.nombre }}</p>
              <p class="text-[10px] text-gray-500 uppercase font-bold">{{ plan.duracion_meses }} Mes(es)</p>
            </div>
            <div class="flex gap-3">
              <div class="relative">
                <span class="absolute left-4 top-4 text-gray-600 text-xs font-bold">$</span>
                <input v-model="plan.costo" type="number" class="w-32 bg-mutant-dark border border-white/10 rounded-xl p-3 pl-8 focus:border-mutant-neon outline-none font-mono text-sm text-right">
              </div>
              <button @click="savePlanPrice(plan)" class="bg-white/5 hover:bg-white/10 text-white p-3 rounded-xl transition-all">
                <Save class="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Feedback Toast (Simple) -->
    <div v-if="toast" class="fixed bottom-10 right-10 bg-mutant-neon text-black px-8 py-4 rounded-2xl font-black shadow-2xl animate-bounce">
      {{ toast }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { Settings2, CreditCard, Save } from 'lucide-vue-next';

const config = ref({ cupo_maximo: 300 });
const planes = ref([]);
const toast = ref('');

const fetchData = async () => {
  try {
    const [configRes, planesRes] = await Promise.all([
      axios.get('http://localhost:3000/api/stats/config'),
      axios.get('http://localhost:3000/api/stats/planes')
    ]);
    config.value = configRes.data;
    planes.value = planesRes.data;
  } catch (err) {
    console.error('Error fetching settings:', err);
  }
};

const sortedPlanes = computed(() => {
  return [...planes.value].sort((a, b) => a.duracion_meses - b.duracion_meses);
});

const saveConfig = async (clave, valor) => {
  try {
    await axios.post('http://localhost:3000/api/stats/config', { clave, valor: String(valor) });
    showToast('Configuración guardada');
  } catch (err) {
    alert('Error al guardar');
  }
};

const savePlanPrice = async (plan) => {
  try {
    await axios.put(`http://localhost:3000/api/stats/planes/${plan.id}`, { costo: plan.costo });
    showToast(`${plan.nombre} actualizado`);
  } catch (err) {
    alert('Error al actualizar plan');
  }
};

const showToast = (msg) => {
  toast.value = msg;
  setTimeout(() => toast.value = '', 3000);
};

onMounted(fetchData);
</script>

<style scoped>
.animate-in {
  animation: fadeIn 0.5s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
