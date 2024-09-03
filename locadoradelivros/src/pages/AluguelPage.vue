<template>
  <div class="title">
    <h6>
      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000">
        <path d="M856-390 570-104q-12 12-27 18t-30 6q-15 0-30-6t-27-18L103-457q-11-11-17-25.5T80-513v-287q0-33 23.5-56.5T160-880h287q16 0 31 6.5t26 17.5l352 353q12 12 17.5 27t5.5 30q0 15-5.5 29.5T856-390ZM260-640q25 0 42.5-17.5T320-700q0-25-17.5-42.5T260-760q-25 0-42.5 17.5T200-700q0 25 17.5 42.5T260-640Z"/>
      </svg>
      Aluguel
    </h6>
  </div>
  <q-page padding>
    <div class="tableHeader">
      <q-input bg-color="grey-4" rounded standout dense bottom-slots v-model="text" label="Pesquisar" class="input-field">
        <template v-slot:prepend>
          <q-icon name="search" @click="getTable(text)" />
        </template>
        <template v-slot:append>
          <q-icon name="close" @click="clearSearch" class="cursor-pointer" />
        </template>
      </q-input>
      <q-btn rounded dense icon="add" label="Criar" @click="openCreateDialog" color="green" class="button-field"></q-btn>
    </div>
    <TableComponents :columns="columns" :rows="filteredRows">
      <template #actions="{ row }">
        <div class="dialogsa">
          <q-btn flat round dense icon="check" @click="openConfirmDialog(row)" class="actions-bt" />

          <q-dialog v-model="confirmDialog.visible" persistent>
            <q-card>
              <q-card-section>
                <div class="text-h6">Confirmar Atualização de Status</div>
              </q-card-section>
              <q-card-section>
                <p>Você tem certeza de que deseja alterar o status para "DELIVERED"?</p>
              </q-card-section>
              <q-card-actions align="right">
                <q-btn flat label="Confirmar" color="primary" @click="confirmUpdateStatus" />
                <q-btn flat label="Cancelar" color="primary" v-close-popup />
              </q-card-actions>
            </q-card>
          </q-dialog>

          <q-dialog v-model="createDialog.visible" persistent>
            <q-card>
              <q-card-section>
                <div class="text-h6">Cadastrar de aluguel</div>
              </q-card-section>
              <q-card-section class="q-pt-none">
                <q-form @submit="onSubmit" class="q-gutter-md q-my-auto">
                  <q-input v-model="newRent.renterId" label="Id do locatário" />
                  <q-input v-model="newRent.bookId" label="Id do livro" />
                  <q-input v-model="newRent.deadline" label="Prazo final" type="date" />
                </q-form>
              </q-card-section>
              <q-card-actions align="right">
                <q-btn flat label="Salvar" color="primary" @click="saveNewRent" />
                <q-btn flat label="Cancelar" color="primary" v-close-popup />
              </q-card-actions>
            </q-card>
          </q-dialog>
        </div>
      </template>
    </TableComponents>
  </q-page>
</template>

<style>
.title {
  padding-left: 40px;
}
.actions-bt {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
}

.tableHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.input-field {
  flex: 1;
}
.button-field {
  margin-left: 10px;
  padding: 7px;
  margin-bottom: 2%;
}
</style>

<script setup>
import { onMounted, ref, computed } from 'vue';
import TableComponents from '../components/TableComponents.vue';
import { api, authenticate } from 'src/boot/axios';

onMounted(() => {
      getTable();
    })

const columns = [
  { name: 'renterName', align: 'center', label: 'Locatário', field: 'renterName' },
  { name: 'bookName', align: 'center', label: 'Livro', field: 'bookName' },
  { name: 'rentDate', align: 'center', label: 'Alugado', field: 'rentDate' },
  { name: 'deadLineDate', align: 'center', label: 'Devolução', field: 'deadLineDate' },
  { name: 'status', align: 'center', label: 'Status', field: 'status' },
  { name: 'actions', align: 'center', label: 'Ações', field: 'actions' },
];

const rows = ref([]);
const text = ref('');

const getTable = (inputSearch = '') => {
  api.get('/rents', { params: { search: inputSearch } })
    .then(response => {
      if (Array.isArray(response.data.content)) {
        rows.value = response.data.content;
        console.log("Dados obtidos com sucesso");
      } else {
        console.error('A resposta da API não é um array:', response.data);
        rows.value = [];
      }
      console.log('Resposta da API:', response.data);
    })
    .catch(error => {
      console.error("Erro ao obter dados:", error);
    });
}

const InfosEdit = ref({});

const newRent = ref({
  renterId: 0,
   bookId: 0,
   deadline: ''
});

const getApi = (id) => {
  api.get(`/rents/`)
    .then(response => {
      InfosEdit.value = response.data;
      console.log(InfosEdit.value);
    })
    .catch(error => {
      console.error("Erro", error);
    });
}

const createDialog = ref({
  visible: false,
  data: {}
});

const confirmDialog = ref({
  visible: false,
  data: {}
});

const openConfirmDialog = (row) => {
  confirmDialog.value.data = { ...row };
  confirmDialog.value.visible = true;
};

const confirmUpdateStatus = () => {
  const row = confirmDialog.value.data;
  const updatedStatus = "DELIVERED";
  api.put(`/rent/${row.id}`, { ...row, status: updatedStatus })
    .then(response => {
      console.log("Status atualizado com sucesso:", response.data);
      const index = rows.value.findIndex(r => r.id === row.id);
      if (index !== -1) {
        rows.value[index].status = updatedStatus;
      }
      confirmDialog.value.visible = false;
    })
    .catch(error => {
      console.error("Erro ao atualizar status:", error.response ? error.response.data : error.message);
    });
};


const openCreateDialog = () => {
  newRent.value = { renterId: '', bookId: '', deadline: ''};
  createDialog.value.visible = true;
}

const saveNewRent = () => {
  console.log("Tentando criar novo livro com:", newRent.value);
  api.post('/rent', newRent.value)
    .then(response => {
      console.log("Livro criado com sucesso:", response.data);
      rows.value.push(response.data);
      createDialog.value.visible = false;
    })
    .catch(error => {
      console.error("Erro ao criar novo livro:", error.response ? error.response.data : error.message);
    });
};

const clearSearch = () => {
  text.value = '';
  getTable();
};

const filteredRows = computed(() => {
  if (!text.value) {
    return rows.value;
  }
  return rows.value.filter(row =>
    Object.values(row).some(value =>
      value.toString().toLowerCase().includes(text.value.toLowerCase())
    )
  );
});

const onSubmit = () => {
  console.log("Teste");
};
</script>
