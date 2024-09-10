<template>
  <div class="title">
    <h6>
      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000">
        <path d="M480-60q-72-68-165-104t-195-36v-440q101 0 194 36.5T480-498q73-69 166-105.5T840-640v440q-103 0-195.5 36T480-60Zm0-540q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Z"/>
      </svg>
      Biblioteca
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
          <q-btn flat round dense icon="visibility" @click="openViewDialog(row)" class="actions-bt" />
          <q-btn flat round dense icon="edit" @click="openEditDialog(row)" class="actions-bt" />
          <q-btn flat round dense icon="delete" @click="openDeleteDialog(row)" class="actions-bt" />

          <q-dialog v-model="viewDialog.visible" persistent>
            <q-card style="max-width: 300px;">
              <q-card-section>
                <div class="text-h6">Detalhes da Biblioteca</div>
              </q-card-section>
              <q-card-section class="q-pt-none">
                <div><strong>ID:</strong> {{ InfosEdit.id }}</div>
                <div><strong>Nome:</strong> {{ InfosEdit.name }}</div>
                <div><strong>Autor:</strong> {{ InfosEdit.author }}</div>
                <div><strong>Quantidade Total:</strong> {{ InfosEdit.totalQuantity }}</div>
                <div><strong>Data de lançamento:</strong> {{ InfosEdit.launchDate }}</div>
                <div><strong>Editora:</strong> {{ InfosEdit.publisherName }}</div>
              </q-card-section>
              <q-card-actions align="right">
                <q-btn flat label="Fechar" color="primary" v-close-popup />
              </q-card-actions>
            </q-card>
          </q-dialog>

          <q-dialog v-model="editDialog.visible" persistent>
            <q-card style="min-width: 300px;">
              <q-card-section>
                <div class="text-h6">Editar Livro</div>
              </q-card-section>
              <q-card-section class="q-pt-none">
                <q-input v-model="bookToEdit.name" label="Nome" />
                <q-input v-model="bookToEdit.author" label="Autor" />
                <q-input v-model="bookToEdit.totalQuantity" label="Quantidade total" />
                <q-input v-model="bookToEdit.launchDate" label="Data de lançamento" type="date" />
                <q-select
                  v-model="bookToEdit.publisherId"
                  :options="publishers.map(p => ({ label: p.name, value: p.id }))"
                  label="Editora"
                />
              </q-card-section>
              <q-card-actions align="right">
                <q-btn flat label="Salvar" color="primary" @click="saveEdit" />
                <q-btn flat label="Cancelar" color="primary" v-close-popup />
              </q-card-actions>
            </q-card>
          </q-dialog>

          <q-dialog v-model="deleteDialog.visible" persistent>
            <q-card>
              <q-card-section>
                <div class="text-h6">Confirmar Exclusão</div>
              </q-card-section>
              <q-card-section class="q-pt-none">
                Tem certeza que deseja excluir o livro "{{ deleteDialog.data.name }}"?
              </q-card-section>
              <q-card-actions align="right">
                <q-btn flat label="Excluir" color="primary" @click="confirmDelete" />
                <q-btn flat label="Cancelar" color="primary" v-close-popup />
              </q-card-actions>
            </q-card>
          </q-dialog>

          <q-dialog v-model="createDialog.visible" persistent>
            <q-card style="min-width: 400px;">
              <q-card-section>
                <div class="text-h6" style="display: flex; justify-content: center;">Cadastro de livro</div>
              </q-card-section>
              <q-card-section class="q-pt-none">
                <q-form @submit.prevent="saveNewBook" class="q-gutter-md q-my-auto">
                  <q-input v-model="newBook.name" label="Nome" />
                  <q-input v-model="newBook.author" label="Autor" />
                  <q-input v-model="newBook.totalQuantity" label="Quantidade Total" />
                  <q-input v-model="newBook.launchDate" label="Data de lançamento" type="date" />
                  <q-select
                    v-model="newBook.publisherId"
                    :options="publishers.map(p => ({ label: p.name, value: p.id }))"
                    label="Editora"
                  />
                </q-form>
              </q-card-section>
              <q-card-actions align="right">
                <q-btn flat label="Salvar" color="primary" @click="saveNewBook" />
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

const viewDialog = ref({ visible: false, data: {} });
const editDialog = ref({ visible: false, data: {} });
const deleteDialog = ref({ visible: false, data: {} });
const createDialog = ref({ visible: false, data: {} });

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
      console.error("Erro ao obter dados:", error);
      $q.notify({
        type: 'negative',
        message: 'Erro ao obter dados. Tente novamente.',
        icon: 'warning',
      });
    });
}

const getPublishers = () => {
  api.get('/publisher')
    .then(response => {
      if (Array.isArray(response.data)) {
        publishers.value = response.data;
      } else {
        console.error('A resposta da API não é um array:', response.data);
        publishers.value = [];
      }
    })
    .catch(error => {
      console.error("Erro ao obter publishers:", error);
      $q.notify({
        type: 'negative',
        message: 'Erro ao obter editoras. Tente novamente.',
        icon: 'warning',
      });
    });
};

onMounted(() => {
  getTable();
  getPublishers();
});

const getDataById = (id) => {
  api.get(`/book/${id}`)
    .then(response => {
      InfosEdit.value = response.data;
    })
    .catch(error => {
      console.error("Erro ao obter dados:", error);
    });
}

const saveNewBook = () => {
  api.post('/book', newBook.value)
    .then(response => {
      $q.notify({
        type: 'positive',
        message: 'Livro criado com sucesso!',
        icon: 'check_circle',
      });
      getTable();
      createDialog.value.visible = false;
      newBook.value = { name: '', author: '', totalQuantity: '', launchDate: '', publisherId: '' };
    })
    .catch(error => {
      console.error("Erro ao criar novo livro:", error);
      $q.notify({
        type: 'negative',
        message: 'Erro ao criar novo livro. Tente novamente.',
        icon: 'warning',
      });
    });
}

const openCreateDialog = () => {
  createDialog.value.visible = true;
};

const openViewDialog = (row) => {
  getDataById(row.id);
  viewDialog.value.visible = true;
};

const openEditDialog = (row) => {
  bookToEdit.value = { ...row };
  editDialog.value.visible = true;
};

const saveEdit = () => {
  api.put(`/book/${bookToEdit.value.id}`, bookToEdit.value)
    .then(response => {
      $q.notify({
        type: 'positive',
        message: 'Livro atualizado com sucesso!',
        icon: 'check_circle',
      });
      getTable();
      editDialog.value.visible = false;
    })
    .catch(error => {
      console.error("Erro ao editar livro:", error);
      $q.notify({
        type: 'negative',
        message: 'Erro ao editar livro. Tente novamente.',
        icon: 'warning',
      });
    });
};

const openDeleteDialog = (row) => {
  deleteDialog.value.visible = true;
  deleteDialog.value.data = { ...row };
};

const confirmDelete = () => {
  api.delete(`/book/${deleteDialog.value.data.id}`)
    .then(response => {
      $q.notify({
        type: 'positive',
        message: 'Livro excluído com sucesso!',
        icon: 'check_circle',
      });
      getTable();
      deleteDialog.value.visible = false;
    })
    .catch(error => {
      console.error("Erro ao excluir livro:", error);
      $q.notify({
        type: 'negative',
        message: 'Erro ao excluir livro. Tente novamente.',
        icon: 'warning',
      });
    });
};

const clearSearch = () => {
  text.value = '';
  getTable();
};

const filteredRows = computed(() => {
  return rows.value.filter(row => row.name.toLowerCase().includes(text.value.toLowerCase()));
});
</script>
