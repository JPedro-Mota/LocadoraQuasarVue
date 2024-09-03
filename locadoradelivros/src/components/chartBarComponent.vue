<template>
  <div style="width: 100%; height: 35vh;">
    <div id="title">Relações de livros</div>
    <canvas :id="canvasId"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, defineProps } from 'vue';
import { Chart, registerables } from 'chart.js';
import { api, authenticate } from 'src/boot/axios';

Chart.register(...registerables);

const props = defineProps({
  canvasId: {
    type: String,
    required: true
  }
});

const rentsQtd = ref(0);
const inTime = ref(0);
const delivered = ref(0);
const delayed = ref(0);

const fetchData = async () => {
  try {
    await authenticate();

    const totalResponse = await api.get('/rent');
    rentsQtd.value = totalResponse.data.totalElements;

    const inTimeResponse = await api.get('/rent', { params: { status: 'IN_TIME' } });
    inTime.value = inTimeResponse.data.totalElements;

    const deliveredResponse = await api.get('/rent', { params: { status: 'DELIVERED' } });
    delivered.value = deliveredResponse.data.totalElements;

    const delayedResponse = await api.get('/rent', { params: { status: 'DELAYED' } });
    delayed.value = delayedResponse.data.totalElements;

  } catch (error) {
    console.error("Erro ao obter dados:", error);
  }
};

onMounted(async () => {
  await fetchData();

  const ctx = document.getElementById(props.canvasId).getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Alugados', 'Atrasados', 'No prazo', 'Fora do prazo'],
      datasets: [{
        data: [rentsQtd.value, delayed.value, inTime.value, delivered.value],
        backgroundColor: ['rgb(34, 1, 39)', 'rgb(217, 2, 9)', 'rgb(54, 162, 235)',  'rbg(217, 2, 9)'],
        borderWidth: 0,
        borderRadius: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true
        }
      },
      plugins: {
        legend: {
          display: false,
          position: 'top',
        }
      }
    }
  });
});
</script>

<style scoped>

.title {
  font-weight: bold;
}

canvas {
  width: 100%;
  height: 100%;
}
</style>
