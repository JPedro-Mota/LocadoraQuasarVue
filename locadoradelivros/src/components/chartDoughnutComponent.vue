<template>
  <q-page padding>
    <div style="width: 100%; height: 30vh;">
      <div id="title">Livros mais alugados</div>
      <canvas id="BooksChart"></canvas>
    </div><br/>
  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import Chart from 'chart.js/auto';
import { api, } from 'src/boot/axios';

const mostRented1 = ref('');
const mostRented2 = ref('');
const mostRented3 = ref('');

const getRents = async () => {
  try {
      const response = await api.get('/dashboard/bookMoreRented');
      mostRented1.value = response.data[0];
       mostRented2.value = response.data[1];
      mostRented3.value = response.data[2];
  } catch (error) {
    console.error("Erro ao obter dadosllllllllll:", error);
  }
};

onMounted(async () => {
  await getRents();

  const ctx1 = document.getElementById('BooksChart').getContext('2d');

  new Chart(ctx1, {
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
});
</script>
