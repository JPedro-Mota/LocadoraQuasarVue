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
import { api, authenticate } from 'src/boot/axios';

const mostRentedBooks = ref([]);

const getRents = async () => {
  try {
    await authenticate();
    for (let i = 1; i <= 3; i++) {
      const response = await api.get(`/rent/most-rented/${i}`);
      mostRentedBooks.value.push(response.data);
    }
  } catch (error) {
    console.error("Erro ao obter dados:", error);
  }
};

onMounted(async () => {
  await getRents();

  const ctx1 = document.getElementById('BooksChart').getContext('2d');

  new Chart(ctx1, {
    type: 'doughnut',
    data: {
      labels: mostRentedBooks.value.map(book => book.bookName),
      datasets: [{
        data: mostRentedBooks.value.map(book => book.rentedNumber),
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
