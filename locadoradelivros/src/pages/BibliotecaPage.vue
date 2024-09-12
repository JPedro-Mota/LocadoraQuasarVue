<template>
  <q-page padding>
    <div class="title">
      <h6>Biblioteca</h6>
    </div>
    <div class="tableHeader">
      <q-input
        bg-color="grey-4"
        rounded
        standout
        dense
        bottom-slots
        v-model="text"
        label="Pesquisar"
        class="input-field"
      >
        <template v-slot:prepend>
          <q-icon name="search" @click="getTable(text)" />
        </template>
        <template v-slot:append>
          <q-icon name="close" @click="clearSearch" class="cursor-pointer" />
        </template>
      </q-input>
      <q-btn
        rounded
        dense
        icon="add"
        label="Criar"
        @click="openCreateDialog"
        color="green"
        class="button-field"
      ></q-btn>
    </div>
    <TableComponents :columns="columns" :rows="filteredRows">
      <template #actions="{ row }">
        <div class="dialogsa">
          <q-btn
            flat
            round
            dense
            icon="visibility"
            @click="openViewDialog(row)"
            class="actions-bt"
          />
          <q-btn
            flat
            round
            dense
            icon="edit"
            @click="openEditDialog(row)"
            class="actions-bt"
          />
          <q-btn
            flat
            round
            dense
            icon="delete"
            @click="openDeleteDialog(row)"
            class="actions-bt"
          />
        </div>
      </template>
    </TableComponents>

    <!-- Dialogs -->
    <q-dialog v-model="viewDialogVisible" persistent>
      <q-card style="max-width: 300px;">
        <q-card-section>
          <div class="text-h6">Detalhes do Livro</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <div><strong>ID:</strong> {{ InfosEdit.id }}</div>
          <div><strong>Nome:</strong> {{ InfosEdit.name }}</div>
          <div><strong>Autor:</strong> {{ InfosEdit.author }}</div>
          <div><strong>Quantidade Total:</strong> {{ InfosEdit.totalQuantity }}</div>
          <div><strong>Data de Lançamento:</strong> {{ InfosEdit.launchDate }}</div>
          <div><strong>Editora:</strong> {{ InfosEdit.publisherName }}</div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Fechar" color="primary" @click="closeViewDialog" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="editDialogVisible" persistent>
      <q-card style="min-width: 300px;">
        <q-card-section>
          <div class="text-h6">Editar Livro</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-input v-model="bookToEdit.name" label="Nome" />
          <q-input v-model="bookToEdit.author" label="Autor" />
          <q-input v-model="bookToEdit.totalQuantity" label="Quantidade Total" />
          <q-input v-model="bookToEdit.launchDate" label="Data de Lançamento" type="date" />
          <q-select
            v-model="bookToEdit.publisherId"
            :options="publishers.map(p => ({ label: p.name, value: p.id }))"
            label="Editora"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Salvar" color="primary" @click="saveEdit" />
          <q-btn flat label="Cancelar" color="primary" @click="closeEditDialog" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="deleteDialogVisible" persistent>
      <q-card>
        <q-card-section>
          <div class="text-h6">Confirmar Exclusão</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          Tem certeza que deseja excluir o livro "{{ deleteDialogData.name }}"?
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Excluir" color="primary" @click="confirmDelete" />
          <q-btn flat label="Cancelar" color="primary" @click="closeDeleteDialog" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="createDialogVisible" persistent>
      <q-card style="min-width: 400px;">
        <q-card-section>
          <div class="text-h6" style="display: flex; justify-content: center;">Cadastro de Livro</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-form @submit.prevent="saveNewBook" class="q-gutter-md q-my-auto">
            <q-input v-model="newBook.name" label="Nome" />
            <q-input v-model="newBook.author" label="Autor" />
            <q-input v-model="newBook.totalQuantity" label="Quantidade Total" />
            <q-input v-model="newBook.launchDate" label="Data de Lançamento" type="date" />
            <q-select
              v-model="newBook.publisherId"
              :options="publishers.map(p => ({ label: p.name, value: p.id }))"
              label="Editora"
            />
          </q-form>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Salvar" color="primary" @click="saveNewBook" />
          <q-btn flat label="Cancelar" color="primary" @click="closeCreateDialog" />
        </q-card-actions>
      </q-card>
    </q-dialog>
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
import { api } from 'src/boot/axios';
import { useQuasar } from 'quasar';

const $q = useQuasar();

const columns = [
  { name: 'name', required: true, label: 'Nome', align: 'center', field: row => row.name, sortable: true },
  { name: 'actions', label: 'Ações', align: 'center' }
];

const rows = ref([]);
const publishers = ref([]);
const text = ref('');

const InfosEdit = ref({});
const newBook = ref({ name: '', author: '', totalQuantity: '', launchDate: '', publisherId: '' });
const bookToEdit = ref({ id: '', name: '', author: '', totalQuantity: '', launchDate: '', publisherId: '' });

const viewDialogVisible = ref(false);
const editDialogVisible = ref(false);
const deleteDialogVisible = ref(false);
const createDialogVisible = ref(false);

const deleteDialogData = ref({ name: '' });

const getTable = (inputSearch = '') => {
  api.get('/book', { params: { search: inputSearch } })
    .then(response => {
      if (Array.isArray(response.data)) {
        rows.value = response.data;
        console.log("Dados obtidos com sucesso");
      } else {
        console.error('A resposta da API não é um array:', response.data);
        rows.value = [];
      }
      console.log('Resposta da API:', response.data);
    })
    .catch(error => {
      console.error('Erro ao buscar os dados:', error);
    });
};

const getPublishers = () => {
  api.get('/publishers')
    .then(response => {
      publishers.value = response.data;
    })
    .catch(error => {
      console.error('Erro ao buscar editoras:', error);
    });
};

const openCreateDialog = () => {
  createDialogVisible.value = true;
  getPublishers();
};

const closeCreateDialog = () => {
  createDialogVisible.value = false;
};

const saveNewBook = () => {
  api.post('/book', newBook.value)
    .then(() => {
      $q.notify({ type: 'positive', message: 'Livro criado com sucesso!' });
      closeCreateDialog();
      getTable();
    })
    .catch(error => {
      console.error('Erro ao criar livro:', error);
    });
};

const openViewDialog = (row) => {
  InfosEdit.value = row;
  viewDialogVisible.value = true;
};

const closeViewDialog = () => {
  viewDialogVisible.value = false;
};

const openEditDialog = (row) => {
  bookToEdit.value = { ...row };
  getPublishers();
  editDialogVisible.value = true;
};

const closeEditDialog = () => {
  editDialogVisible.value = false;
};

const saveEdit = () => {
  api.put(`/book/${bookToEdit.value.id}`, bookToEdit.value)
    .then(() => {
      $q.notify({ type: 'positive', message: 'Livro atualizado com sucesso!' });
      closeEditDialog();
      getTable();
    })
    .catch(error => {
      console.error('Erro ao editar livro:', error);
    });
};

const openDeleteDialog = (row) => {
  deleteDialogData.value = row;
  deleteDialogVisible.value = true;
};

const closeDeleteDialog = () => {
  deleteDialogVisible.value = false;
};

const confirmDelete = () => {
  api.delete(`/book/${deleteDialogData.value.id}`)
    .then(() => {
      $q.notify({ type: 'positive', message: 'Livro excluído com sucesso!' });
      closeDeleteDialog();
      getTable();
    })
    .catch(error => {
      console.error('Erro ao excluir livro:', error);
    });
};

const clearSearch = () => {
  text.value = '';
  getTable();
};

const filteredRows = computed(() => {
  return rows.value.filter(row => row.name.toLowerCase().includes(text.value.toLowerCase()));
});

onMounted(() => {
  getTable();
});
</script>
