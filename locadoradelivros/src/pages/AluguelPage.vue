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
      <q-input bg-color="grey-4" rounded standout dense bottom-slots v-model="text" label="Pesquisar" class="input-field"  @keyup.enter="getTable(text)">
        <template v-slot:prepend>
          <q-icon name="search"/>
        </template>
        <template v-slot:append>
          <q-icon name="close" @click="clearSearch" class="cursor-pointer" />
        </template>
      </q-input>
      <q-btn rounded dense icon="add" label="Criar" @click="openCreateDialog" color="green" class="button-field"></q-btn>
    </div>

    <TableComponents :columns="columns" :rows="rows">
      <template #actions="{ row }">
        <q-btn flat round dense icon="check" @click="openConfirmDialog(row)" class="actions-bt" />
      </template>
    </TableComponents>

    <q-dialog v-model="confirmDialog.visible" persistent>
      <q-card style="min-width: 300px;">
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
      <q-card style="min-width: 450px;">
        <q-card-section>
          <div class="text-h6" style="display:flex; justify-content: center;">Cadastro de aluguel</div>
        </q-card-section>
        <q-card-section class="q-pt-none q-gutter-sm">
          <q-select
              filled
              v-model="selectedRenter"
              use-input
              hide-selected
              fill-input
              input-debounce="0"
              :options="renters"
              option-label="name"
              label="Locatários"
              @filter="renterFilter"
              @update:model-value="onItemClickRegister(selectedRenter, newRent)"
            />


            <q-select
              filled
              v-model="selectedBook"
              use-input
              hide-selected
              fill-input
              input-debounce="0"
              :options="books"
              option-label="name"
              label="Livros"
              @filter="bookFilter"
              @update:model-value="onItemClickRegister(selectedBook, newRent)"
            />

          <q-input v-model="newRent.deadLine" label="Prazo final" type="date" style="width: 95%;" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Salvar" color="primary" @click="saveNewRent" />
          <q-btn flat label="Cancelar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <div class="row justify-center q-my-md">
    <q-btn icon="chevron_left" @click="pageDown" :disable="page.value <= 0" />
    <q-btn icon="chevron_right" @click="pageUp" :disable="page.value" />
  </div>
  </q-page>
</template>

<script setup>
import { onMounted, ref} from 'vue';
import TableComponents from '../components/TableComponents.vue';
import { api } from 'src/boot/axios';
import { useQuasar } from 'quasar';

const $q = useQuasar();

onMounted(() => {
  getTable();
  fetchRenters();
  fetchBooks();
});

const columns = [
  { name: 'renterName', align: 'center', label: 'Locatário', field: 'renterName' },
  { name: 'bookName', align: 'center', label: 'Livro', field: 'bookName' },
  { name: 'deadLine', align: 'center', label: 'Devolução', field: 'deadLine' },
  { name: 'status', align: 'center', label: 'Status', field: 'status' },
  { name: 'actions', align: 'center', label: 'Ações', field: 'actions' },
];

const rows = ref([]);
const text = ref('');
const page = ref(0);
const totalPages = ref(1);
const renters = ref([]);
const books = ref([]);
const selectedBook = ref([]);
const selectedRenter = ref([]);

const getTable = (inputSearch = '') => {
  api.get('/rents', { params: { search: inputSearch, page: page.value } })
  .then(response => {
      rows.value = response.data.content;
        totalPages.value = response.headers['x-total-pages'];
        console.log("Dados obtidos com sucesso", response.data);
    })
    .catch(error => {
      $q.notify({ type: 'negative', message: 'Erro ao carregar dados: ' + (error.response ? error.response.data.message : error.message), position: 'top-right' });
    });
};

const pageUp = () => {
    page.value++;
    getTable(text.value);
};

const pageDown = () => {
  if (page.value > 0) {
    page.value--;
    getTable(text.value);
  }
};

const fetchRenters = (inputSearch = '') => {
  api.get('/renter', {params: {search: inputSearch}})
    .then(response => {
      renters.value = response.data.content;
    })
    .catch(error => {
      console.error("Erro ao obter locatários:", error);
      $q.notify({
        type: 'negative',
        message: 'Erro ao obter os locatários. Tente novamente mais tarde.',
        icon: 'warning',
      });
    });
};

const fetchBooks = (inputSearch = '') => {
  api.get('/book', {params: {search: inputSearch}})
    .then(response => {
      books.value = response.data.content;
    })
    .catch(error => {
      console.error("Erro ao obter livros:", error);
      $q.notify({
        type: 'negative',
        message: 'Erro ao obter os livros. Tente novamente mais tarde.',
        icon: 'warning',
      });
    });
};


function bookFilter(val, update){
  if (val === '') {
    update(() => {
      fetchBooks();
    });
  } else {
    update (() => {
      const needle = val.toLowerCase();
      books.value = books.value.filter(books =>
        books.name.toLowerCase().includes(needle)
      );
    });
  }
}

function renterFilter(val, update){
  if (val === '') {
    update(() => {
      fetchRenters();
    });
  } else {
    update (() => {
      const needle = val.toLowerCase();
      renters.value = renters.value.filter(renters =>
        renters.name.toLowerCase().includes(needle)
      );
    });
  }
}

const confirmDialog = ref({
  visible: false,
  data: {}
});

const newRent = ref({ renterId: '', bookId: '', deadLine: '' });

const createDialog = ref({
  visible: false,
});

const openConfirmDialog = (row) => {
  confirmDialog.value.data = row;
  confirmDialog.value.visible = true;
};

const confirmUpdateStatus = () => {
  const row = confirmDialog.value.data;
  const updatedStatus = "DELIVERED";
  api.put(`/rents/${row.id}`, { ...row, status: updatedStatus })
    .then(response => {
      const index = rows.value.findIndex(r => r.id === row.id);
      if (index !== -1) {
        rows.value[index].status = updatedStatus;
      }
      $q.notify({
        type: 'positive',
        message: 'Status atualizado com sucesso!',
        icon: 'check',
      });
      confirmDialog.value.visible = false;
    })
    .catch(error => {
      console.error("Erro ao atualizar status:", error.response ? error.response.data : error.message);
      $q.notify({
        type: 'negative',
        message: 'Erro ao atualizar o status. Tente novamente mais tarde.',
        icon: 'warning',
      });
    });
};

const openCreateDialog = () => {
  createDialog.value.visible = true;
};

const saveNewRent = () => {
  const rentsData = {
    renterId: newRent.value.renterId.value,
    bookId: newRent.value.bookId.value,
    deadLine: newRent.value.deadLine,
  };

  if (!newRent.value.renterId || !newRent.value.bookId) {
  $q.notify({
    type: 'warning',
    message: 'Por favor, selecione um locatário e um livro.',
    icon: 'warning',
  });
  return;
  }

  api.post('/rents', rentsData)
    .then(response => {
      rows.value.push(response.data);
      createDialog.value.visible = false;
      $q.notify({
        type: 'positive',
        message: 'Novo aluguel criado com sucesso!',
        icon: 'check',
      });
      createDialog.value.visible = false;
      newRent.value = { renterId: '', bookId: '', deadLine: '' }
      getTable();
    })
    .catch(error => {
      console.error("Erro ao criar novo aluguel:", error.response ? error.response.data : error.message);
      $q.notify({
        type: 'negative',
        message: 'Erro ao criar o aluguel. Tente novamente mais tarde.',
        icon: 'warning',
      });
    });
};

const clearSearch = () => {
  text.value = '';
  getTable();
};

</script>

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
