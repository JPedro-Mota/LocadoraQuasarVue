<template>
  <q-page padding>
    <div style="width: 100%; height: 30vh;">
      <div id="title">Livros mais alugados</div>
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
      <canvas id="BooksChart"></canvas>
    </div><br/>
  </q-page>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import Chart from 'chart.js/auto';
import { api } from 'src/boot/axios';

const numberMonths = ref(1);
const mostRented1 = ref({});
const mostRented2 = ref({});
const mostRented3 = ref({});
let chartInstance = null;

const getRents = async () => {
  try {
    const response = await api.get('/dashboard/bookMoreRented', { params: { numberMonths: numberMonths.value } });
    mostRented1.value = response.data[0] || {};
    mostRented2.value = response.data[1] || {};
    mostRented3.value = response.data[2] || {};
    updateChart();
  } catch (error) {
    console.error("Erro ao obter dados:", error);
  }
};

const createChart = () => {
  const ctx1 = document.getElementById('BooksChart').getContext('2d');

  chartInstance = new Chart(ctx1, {
    type: 'doughnut',
    data: {
      labels: [mostRented1.value.name, mostRented2.value.name, mostRented3.value.name],
      datasets: [{
        data: [mostRented1.value.totalRents, mostRented2.value.totalRents, mostRented3.value.totalRents],
        backgroundColor: ['rgb(217, 2, 9)', 'rgb(54, 162, 235)', 'rgb(34, 1, 39)'],
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
    }
  });
};

const updateChart = () => {
  if (chartInstance) {
    chartInstance.data.labels = [mostRented1.value.name, mostRented2.value.name, mostRented3.value.name];
    chartInstance.data.datasets[0].data = [mostRented1.value.totalRents, mostRented2.value.totalRents, mostRented3.value.totalRents];
    chartInstance.update();
  }
};

onMounted(async () => {
  await getRents();
  createChart();
});


watch(numberMonths, async (newValue) => {
  await getRents();
});
</script>

