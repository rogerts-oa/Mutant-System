<template>
  <div class="space-y-10 animate-in">
    <!-- Header -->
    <div class="flex justify-between items-end">
      <div>
        <h2 class="text-4xl font-black uppercase tracking-tight mb-2">MÉTRICAS DE RENDIMIENTO</h2>
        <p class="text-gray-500 font-medium">Inteligencia de negocio y datos de uso de las instalaciones.</p>
      </div>
      <!-- Time Selector -->
      <div class="bg-mutant-dark/50 p-1.5 rounded-2xl border border-white/5 flex gap-1">
        <button v-for="t in ['HOY', 'SEMANA', 'MES', 'AÑO']" :key="t" :class="`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${activeTime === t ? 'bg-white/10 text-white shadow-xl' : 'text-gray-600 hover:text-gray-400'}`" @click="activeTime = t">
          {{ t }}
        </button>
      </div>
    </div>

    <!-- Metrics Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <!-- Total Revenue -->
      <div class="bg-mutant-dark/40 rounded-[32px] border border-white/5 p-8 group hover:border-mutant-neon/20 transition-all">
        <div class="flex justify-between items-start mb-8">
          <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Ingresos Totales</h3>
          <div class="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-mutant-neon text-xl font-bold group-hover:scale-110 transition-transform">$</div>
        </div>
        <p class="text-5xl font-black tracking-tighter mb-4">${{ income.total_monto?.toLocaleString() }}</p>
        <div class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-mutant-neon">
          <span>📈</span> +12.5% <span class="text-gray-600">desde el mes pasado</span>
        </div>
      </div>

      <!-- New Registrations -->
      <div class="bg-mutant-dark/40 rounded-[32px] border border-white/5 p-8 group hover:border-blue-500/20 transition-all">
        <div class="flex justify-between items-start mb-8">
          <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Nuevos Registros</h3>
          <div class="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-blue-500 text-xl group-hover:scale-110 transition-transform">👤</div>
        </div>
        <p class="text-5xl font-black tracking-tighter mb-4">${{ income.inscripciones?.monto?.toLocaleString() }}</p>
        <div class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-500">
          <span>📈</span> +18.3% <span class="text-gray-600">desde el mes pasado</span>
        </div>
      </div>

      <!-- Renewals -->
      <div class="bg-mutant-dark/40 rounded-[32px] border border-white/5 p-8 group hover:border-orange-500/20 transition-all">
        <div class="flex justify-between items-start mb-8">
          <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Ingresos por Renovación</h3>
          <div class="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-orange-500 text-xl group-hover:scale-110 transition-transform">🔄</div>
        </div>
        <p class="text-5xl font-black tracking-tighter mb-4">${{ income.renovaciones?.monto?.toLocaleString() }}</p>
        <div class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-orange-500">
          <span>📈</span> +6.7% <span class="text-gray-600">desde el mes pasado</span>
        </div>
      </div>
    </div>

    <!-- Charts Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Weekly Attendance -->
      <div class="bg-mutant-dark/30 rounded-[40px] border border-white/5 p-10 flex flex-col h-[400px]">
        <div class="flex justify-between items-center mb-8">
          <div>
            <h4 class="text-[10px] font-black text-mutant-neon uppercase tracking-[0.3em] mb-1">REPORTE DE AFLUENCIA SEMANAL</h4>
            <p class="text-xs font-bold text-gray-500 uppercase tracking-widest">Total de ingresos por día</p>
          </div>
          <button class="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 transition-all">Exportar</button>
        </div>
        <div class="flex-grow min-h-0">
          <Line v-if="historyData" :data="historyData" :options="chartOptions" />
        </div>
      </div>

      <!-- Peak Hours -->
      <div class="bg-mutant-dark/30 rounded-[40px] border border-white/5 p-10 flex flex-col h-[400px]">
        <div class="flex justify-between items-center mb-8">
          <div>
            <h4 class="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em] mb-1">IDENTIFICACIÓN DE HORAS PICO</h4>
            <p class="text-xs font-bold text-gray-500 uppercase tracking-widest">Tendencias de uso de la instalación</p>
          </div>
          <button class="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 transition-all">Opciones</button>
        </div>
        <div class="flex-grow min-h-0">
          <Bar v-if="peakData" :data="peakData" :options="chartOptions" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { Line, Bar } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement, BarElement } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement, BarElement);

const activeTime = ref('HOY');
const income = ref({});
const historyData = ref(null);
const peakData = ref(null);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: { 
      beginAtZero: true, 
      grid: { color: 'rgba(255, 255, 255, 0.03)', drawBorder: false },
      ticks: { color: '#444', font: { size: 10, weight: 'bold' } }
    },
    x: { 
      grid: { display: false },
      ticks: { color: '#444', font: { size: 10, weight: 'bold' } }
    }
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#121212',
      titleFont: { size: 12, weight: 'black' },
      bodyFont: { size: 12 },
      padding: 12,
      cornerRadius: 12,
      displayColors: false
    }
  }
};

const fetchData = async () => {
  try {
    const [incomeRes, peaksRes, historyRes] = await Promise.all([
      axios.get('http://localhost:3000/api/stats/income'),
      axios.get('http://localhost:3000/api/stats/peak-hours'),
      axios.get('http://localhost:3000/api/stats/history?period=day')
    ]);

    income.value = incomeRes.data;

    if (historyRes.data.length > 0) {
      historyData.value = {
        labels: historyRes.data.map(h => h.periodo.split('-').slice(1).join('/')),
        datasets: [{
          data: historyRes.data.map(h => h.total),
          borderColor: '#00ff00',
          borderWidth: 4,
          pointBackgroundColor: '#00ff00',
          pointRadius: 4,
          tension: 0.4,
          fill: true,
          backgroundColor: 'rgba(0, 255, 0, 0.05)'
        }]
      };
    }

    if (peaksRes.data.length > 0) {
      peakData.value = {
        labels: peaksRes.data.map(p => p.intervalo),
        datasets: [{
          data: peaksRes.data.map(p => p.ingresos),
          backgroundColor: '#ff9900',
          borderRadius: 12,
          barThickness: 20
        }]
      };
    }
  } catch (err) {
    console.error('Error:', err);
  }
};

onMounted(fetchData);
</script>

<style scoped>
.animate-in {
  animation: fadeIn 0.6s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
