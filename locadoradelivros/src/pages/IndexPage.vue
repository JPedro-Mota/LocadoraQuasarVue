<template>
  <q-page padding>
    <div class="graphics-top" style="width: 100%;">
      <div class="doughnut" style="width: 50%; height: 40vh; box-shadow: black;">
        <chart-bar-component canvasId="relacoesLivrosChart"></chart-bar-component>
      </div>
      <div class="doughnut" style="width: 50%; height: 40vh; box-shadow: black;">
        <chart-doughnut-component canvasId="BooksChart"></chart-doughnut-component>
      </div><br/>
    </div>
    <div class="tb" style="width: 100%; box-shadow: black;">
      <div id="title">Top 3 locatários mais ativos</div>
      <TableComponents :columns="columns" :rows="rows">
      </TableComponents>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import TableComponents from '../components/TableComponents.vue';
import chartBarComponent from '../components/chartBarComponent.vue';
import chartDoughnutComponent from 'src/components/chartDoughnutComponent.vue';
import { api} from 'src/boot/axios';

onMounted(() => {
   getTable();
});

const columns = [
  { name: 'name', align: 'center', label: 'Locatário', field: 'name' },
  { name: 'rentsQuantity', align: 'center', label: 'Devolução', field: 'rentsQuantity' },
  { name: 'rentsActive', align: 'center', label: 'Alugado', field: 'rentsActive' },
];

const rows = ref([]);

const getTable = async () => {
  try {

    const response = await api.get('dashboard/rentsPerRenter');

    if (Array.isArray(response.data)) {
      rows.value = response.data
        .sort((a, b) => b.totalRents - a.totalRents)
        .slice(0, 3);
      console.log("Dados obtidos com sucesso");
    } else {
      console.error('A resposta da API não é um array:', response.data);
      rows.value = [];
    }
    console.log('Resposta da API:', response.data);
  } catch (error) {
    console.error("Erro ao obter dados:", error);
  }
};
</script>
