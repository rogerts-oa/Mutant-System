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
        <button v-for="t in ['HOY', 'SEMANA', 'MES', 'AÑO']" :key="t" :class="`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${activeTime === t ? 'bg-white/10 text-white shadow-xl' : 'text-gray-600 hover:text-gray-400'}`" @click="changeTime(t)">
          {{ t }}
        </button>
      </div>
    </div>

    <!-- Metrics Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <!-- Total Revenue -->
      <div class="bg-mutant-dark/40 rounded-[32px] border border-white/5 p-8 group hover:border-mutant-neon/20 transition-all relative">
        <div v-if="loading" class="absolute inset-0 bg-mutant-dark/20 backdrop-blur-sm flex items-center justify-center rounded-[32px] z-10">
          <Loader2 class="w-8 h-8 text-mutant-neon animate-spin" />
        </div>
        <div class="flex justify-between items-start mb-8">
          <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Ingresos Totales</h3>
          <div class="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-mutant-neon group-hover:scale-110 transition-transform">
            <DollarSign class="w-6 h-6" />
          </div>
        </div>
        <p class="text-5xl font-black tracking-tighter mb-4">${{ income.total_monto?.toLocaleString() || 0 }}</p>
        <div class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-mutant-neon">
          <TrendingUp class="w-3 h-3" /> +12.5% <span class="text-gray-600">desde el mes pasado</span>
        </div>
      </div>

      <!-- New Registrations -->
      <div class="bg-mutant-dark/40 rounded-[32px] border border-white/5 p-8 group hover:border-blue-500/20 transition-all relative">
        <div v-if="loading" class="absolute inset-0 bg-mutant-dark/20 backdrop-blur-sm flex items-center justify-center rounded-[32px] z-10">
          <Loader2 class="w-8 h-8 text-blue-500 animate-spin" />
        </div>
        <div class="flex justify-between items-start mb-8">
          <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Nuevos Registros</h3>
          <div class="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
            <UserPlus class="w-6 h-6" />
          </div>
        </div>
        <p class="text-5xl font-black tracking-tighter mb-4">${{ income.inscripciones?.monto?.toLocaleString() || 0 }}</p>
        <div class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-500">
          <TrendingUp class="w-3 h-3" /> +18.3% <span class="text-gray-600">desde el mes pasado</span>
        </div>
      </div>

      <!-- Renewals -->
      <div class="bg-mutant-dark/40 rounded-[32px] border border-white/5 p-8 group hover:border-orange-500/20 transition-all relative">
        <div v-if="loading" class="absolute inset-0 bg-mutant-dark/20 backdrop-blur-sm flex items-center justify-center rounded-[32px] z-10">
          <Loader2 class="w-8 h-8 text-orange-500 animate-spin" />
        </div>
        <div class="flex justify-between items-start mb-8">
          <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Ingresos por Renovación</h3>
          <div class="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
            <RefreshCw class="w-6 h-6" />
          </div>
        </div>
        <p class="text-5xl font-black tracking-tighter mb-4">${{ income.renovaciones?.monto?.toLocaleString() || 0 }}</p>
        <div class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-orange-500">
          <TrendingUp class="w-3 h-3" /> +6.7% <span class="text-gray-600">desde el mes pasado</span>
        </div>
      </div>
    </div>

    <!-- Charts Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Weekly Attendance -->
      <div class="bg-mutant-dark/30 rounded-[40px] border border-white/5 p-10 flex flex-col h-[400px] relative">
        <div v-if="loading" class="absolute inset-0 bg-mutant-dark/10 backdrop-blur-sm flex items-center justify-center rounded-[40px] z-10">
          <Loader2 class="w-12 h-12 text-mutant-neon animate-spin" />
        </div>
        <div class="flex justify-between items-center mb-8">
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 bg-mutant-neon/10 rounded-xl flex items-center justify-center text-mutant-neon">
              <Calendar class="w-5 h-5" />
            </div>
            <div>
              <h4 class="text-[10px] font-black text-mutant-neon uppercase tracking-[0.3em] mb-1">REPORTE DE AFLUENCIA ({{ activeTime }})</h4>
              <p class="text-xs font-bold text-gray-500 uppercase tracking-widest">Total de ingresos agrupados</p>
            </div>
          </div>
          <button @click="exportCSV" class="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 transition-all flex items-center gap-2">
            <Download class="w-3 h-3" /> Exportar CSV
          </button>
        </div>
        <div class="flex-grow min-h-0">
          <Line v-if="historyData" :data="historyData" :options="chartOptions" />
        </div>
      </div>

      <!-- Peak Hours -->
      <div class="bg-mutant-dark/30 rounded-[40px] border border-white/5 p-10 flex flex-col h-[400px] relative">
        <div v-if="loading" class="absolute inset-0 bg-mutant-dark/10 backdrop-blur-sm flex items-center justify-center rounded-[40px] z-10">
          <Loader2 class="w-12 h-12 text-orange-500 animate-spin" />
        </div>
        <div class="flex justify-between items-center mb-8">
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500">
              <Clock class="w-5 h-5" />
            </div>
            <div>
              <h4 class="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em] mb-1">IDENTIFICACIÓN DE HORAS PICO</h4>
              <p class="text-xs font-bold text-gray-500 uppercase tracking-widest">Zona Horaria Local (Real)</p>
            </div>
          </div>
          <button @click="fetchData" class="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 transition-all flex items-center gap-2">
            <RefreshCw class="w-3 h-3" /> Actualizar
          </button>
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
import { 
  DollarSign, TrendingUp, UserPlus, RefreshCw, Calendar, Download, Clock, Loader2
} from 'lucide-vue-next';

ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement, BarElement);

const activeTime = ref('HOY');
const income = ref({});
const historyData = ref(null);
const peakData = ref(null);
const loading = ref(true);

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

const changeTime = (t) => {
  activeTime.value = t;
  fetchData();
};

const exportCSV = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/stats/export', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'reporte_afluencia.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (err) { alert('Error al exportar'); }
};

const fetchData = async () => {
  loading.value = true;
  try {
    const [incomeRes, peaksRes, historyRes] = await Promise.all([
      axios.get('http://localhost:3000/api/stats/income'),
      axios.get('http://localhost:3000/api/stats/peak-hours'),
      axios.get(`http://localhost:3000/api/stats/history?period=${activeTime.value}`)
    ]);

    income.value = incomeRes.data;

    if (historyRes.data) {
      historyData.value = {
        labels: historyRes.data.map(h => h.periodo),
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

    if (peaksRes.data) {
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
  } finally {
    setTimeout(() => { loading.value = false; }, 600);
  }
};

onMounted(fetchData);
</script>

<style scoped>
.animate-in { animation: fadeIn 0.6s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
