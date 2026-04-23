<template>
  <div class="space-y-8">
    <div class="flex justify-between items-center">
      <h2 class="text-3xl font-black italic uppercase tracking-tighter border-l-8 border-mutant-accent pl-6">Panel de Inteligencia 🧠</h2>
      <button @click="fetchData" class="bg-mutant-accent/10 text-mutant-accent border border-mutant-accent/20 px-4 py-2 rounded-lg text-sm font-bold hover:bg-mutant-accent/20 transition-all">Actualizar Datos</button>
    </div>

    <!-- Top Metrics -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-mutant-card border border-gray-800 p-6 rounded-2xl">
        <h3 class="text-gray-400 text-xs font-bold uppercase mb-2">Ingresos Totales</h3>
        <p class="text-3xl font-black">${{ income.total_monto || 0 }}</p>
      </div>
      <div class="bg-mutant-card border border-gray-800 p-6 rounded-2xl">
        <h3 class="text-gray-400 text-xs font-bold uppercase mb-2">Inscripciones</h3>
        <p class="text-3xl font-black text-mutant-accent">{{ income.inscripciones?.cantidad || 0 }}</p>
      </div>
      <div class="bg-mutant-card border border-gray-800 p-6 rounded-2xl">
        <h3 class="text-gray-400 text-xs font-bold uppercase mb-2">Renovaciones</h3>
        <p class="text-3xl font-black text-blue-500">{{ income.renovaciones?.cantidad || 0 }}</p>
      </div>
      <div class="bg-mutant-card border border-gray-800 p-6 rounded-2xl">
        <h3 class="text-gray-400 text-xs font-bold uppercase mb-2">Hora Pico Hoy</h3>
        <p class="text-3xl font-black text-yellow-500">{{ peakHour }}</p>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Attendance Chart -->
      <div class="bg-mutant-card border border-gray-800 p-8 rounded-3xl">
        <h3 class="text-xl font-bold mb-6 italic uppercase">Afluencia Histórica</h3>
        <div class="h-64">
          <Line v-if="historyData" :data="historyData" :options="chartOptions" />
          <div v-else class="h-full flex items-center justify-center text-gray-700 italic">Cargando gráfica...</div>
        </div>
      </div>

      <!-- Peak Hours Chart -->
      <div class="bg-mutant-card border border-gray-800 p-8 rounded-3xl">
        <h3 class="text-xl font-bold mb-6 italic uppercase">Distribución por Horas</h3>
        <div class="h-64">
          <Bar v-if="peakData" :data="peakData" :options="chartOptions" />
          <div v-else class="h-full flex items-center justify-center text-gray-700 italic">Cargando gráfica...</div>
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

const income = ref({});
const peakHour = ref('N/A');
const historyData = ref(null);
const peakData = ref(null);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: { beginAtZero: true, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
    x: { grid: { display: false } }
  },
  plugins: {
    legend: { display: false }
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
    
    if (peaksRes.data.length > 0) {
      peakHour.value = peaksRes.data[0].intervalo;
      peakData.value = {
        labels: peaksRes.data.map(p => p.intervalo),
        datasets: [{
          label: 'Ingresos',
          data: peaksRes.data.map(p => p.ingresos),
          backgroundColor: '#22C55E',
          borderRadius: 8
        }]
      };
    }

    if (historyRes.data.length > 0) {
      historyData.value = {
        labels: historyRes.data.map(h => h.periodo),
        datasets: [{
          label: 'Accesos',
          data: historyRes.data.map(h => h.total),
          borderColor: '#22C55E',
          tension: 0.4,
          fill: true,
          backgroundColor: 'rgba(34, 197, 94, 0.1)'
        }]
      };
    }
  } catch (err) {
    console.error('Error fetching analytics:', err);
  }
};

onMounted(fetchData);
</script>
