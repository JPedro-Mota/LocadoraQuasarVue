<template>
  <div style="width: 100%; height: 70%;">
    <div id="title">Relações de livros</div>

    <div class="flex justify-center">
        <span class="flex items-center">
          Meses:
          <q-input
            v-model="numberMonths"
            type="number"
            filled
            class="inputMonths"
            dense
            style="width: 70px;"
            min="1"
          />
        </span>
      </div>

    <canvas :id="canvasId"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, defineProps, watch } from 'vue';
import { Chart, registerables } from 'chart.js';
import { api } from 'src/boot/axios';

Chart.register(...registerables);

const props = defineProps({
  canvasId: {
    type: String,
    required: true
  }
});

const numberMonths = ref(1);
const rentsQtd = ref(0);
const inTime = ref(0);
const delivered = ref(0);
const delayed = ref(0);
let chart = null;

const fetchData = async () => {
  try {
    const response = await api.get('/dashboard/rentsQuantity', { params: { numberMonths: numberMonths.value } });
    rentsQtd.value = response.data;

    const delayedResponse = await api.get('/dashboard/deliveredWithDelayQuantity', { params: { numberMonths: numberMonths.value } });
    delayed.value = delayedResponse.data;

    const inTimeResponse = await api.get('/dashboard/rentsInTime', { params: { numberMonths: numberMonths.value } });
    inTime.value = inTimeResponse.data;

    const lateQuantityResponse = await api.get('/dashboard/rentsLateQuantity', { params: { numberMonths: numberMonths.value } });
    delivered.value = lateQuantityResponse.data;

    console.log(rentsQtd.value, delayed.value, inTime.value, delivered.value);
  } catch (error) {
    console.error("Erro ao obter dados:", error);
  }
};

const updateChart = () => {
  if (chart) {
    chart.data.datasets[0].data = [rentsQtd.value, delayed.value, inTime.value, delivered.value];
    chart.update();
  } else {
    const ctx = document.getElementById(props.canvasId).getContext('2d');
    chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Alugados', 'Atrasados', 'No prazo', 'Fora do prazo'],
        datasets: [{
          data: [rentsQtd.value, delayed.value, inTime.value, delivered.value],
          backgroundColor: ['rgb(34, 1, 39)', 'rgb(217, 2, 9)', 'rgb(54, 162, 235)', 'rgb(217, 2, 9)'],
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
  }
};

onMounted(async () => {
  await fetchData();
  updateChart();
});

watch(numberMonths, async () => {
  await fetchData();
  updateChart();
});
</script>

<style scoped>
#title {
  font-weight: bold;
}

canvas {
  width: 100%;
  height: 100%;
}
</style>
