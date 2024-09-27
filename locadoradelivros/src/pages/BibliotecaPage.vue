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
      <q-input bg-color="grey-4" rounded standout dense bottom-slots v-model="text" label="Pesquisar" class="input-field" @keyup.enter="getTable(text)">
        <template v-slot:prepend>
          <q-icon name="search" @click="getTable(text)" />
        </template>
        <template v-slot:append>
          <q-icon name="close" @click="clearSearch" class="cursor-pointer" />
        </template>
      </q-input>
      <q-btn rounded dense icon="add" label="Criar" @click="openCreateDialog" color="green" class="button-field"></q-btn>
    </div>

    <TableComponents :columns="columns" :rows="rows">
      <template #actions="{ row }">
        <div class="dialogsa">
          <q-btn flat round dense icon="visibility" @click="openViewDialog(row)" class="actions-bt" />
          <q-btn flat round dense icon="edit" @click="openEditDialog(row)" class="actions-bt" />
          <q-btn flat round dense icon="delete" @click="openDeleteDialog(row)" class="actions-bt" />
        </div>
      </template>
    </TableComponents>

    <q-dialog v-model="viewDialog.visible" persistent>
      <q-card style="min-width: 300px;">
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
          <q-btn flat label="Fechar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="editDialog.visible" persistent>
      <q-card style="min-width: 500px;">
        <q-card-section>
          <div class="text-h6" style="display: flex; justify-content: center;" >Editar Livro</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-input v-model="bookToEdit.name" label="Nome" />
          <q-input v-model="bookToEdit.author" label="Autor" />
          <q-input v-model="bookToEdit.totalQuantity" label="Quantidade Total" />
          <q-input v-model="bookToEdit.launchDate" label="Data de Lançamento" type="date" />
          <q-select v-model.number="bookToEdit.publisherId" :options="publishers.map(p => ({ label: p.name, value: p.id }))" label="Editora"/>
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
          <div class="text-h6" style="display: flex; justify-content: center;">Cadastro de Livro</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-form @submit.prevent="saveNewBook" class="q-gutter-md q-my-auto">
            <q-input v-model="newBook.name" label="Nome" />
            <q-input v-model="newBook.author" label="Autor" />
            <q-input v-model="newBook.totalQuantity" label="Quantidade Total" />
            <q-input v-model="newBook.launchDate" label="Data de Lançamento" type="date" />
            <q-select v-model.number="newBook.publisherId" :options="publishers.map(p => ({ label: p.name, value: p.id }))" label="Editora"/>
          </q-form>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Salvar" color="primary" @click="saveNewBook" />
          <q-btn flat label="Cancelar" color="primary" v-close-popup />
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
import { onMounted, ref} from 'vue';
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

const viewDialog = ref({ visible: false });
const editDialog = ref({ visible: false });
const deleteDialog = ref({ visible: false, data: {} });
const createDialog = ref({ visible: false });

const getTable = (inputSearch = '') => {
  api.get('/book', { params: { search: inputSearch } })
    .then(response => {
      if (Array.isArray(response.data)) {
        rows.value = response.data;
        $q.notify({ type: 'positive', message: 'Dados carregados com sucesso!', position: 'top-right' });
      } else {
        rows.value = [];
        $q.notify({ type: 'negative', message: 'Dados retornados não são válidos.', position: 'top-right' });
      }
    })
    .catch(error => {
      $q.notify({ type: 'negative', message: 'Erro ao carregar dados: ' + (error.response ? error.response.data.message : error.message), position: 'top-right' });
    });
};

const getPublishers = () => {
  api.get('/publisher')
    .then(response => {
      publishers.value = Array.isArray(response.data) ? response.data : [];
    })
    .catch(error => {
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
  if (!newBook.value.name || !newBook.value.author || !newBook.value.totalQuantity || !newBook.value.launchDate || !newBook.value.publisherId) {
    $q.notify({
      type: 'negative',
      message: 'Preencha todos os campos.',
      icon: 'warning',
    });
    return;
  }
  const bookData = {
    name: newBook.value.name,
    author: newBook.value.author,
    totalQuantity: Number(newBook.value.totalQuantity),
    launchDate: newBook.value.launchDate,
    publisherId: newBook.value.publisherId.value || newBook.value.publisherId,
  };
  api.post('/book', bookData)
    .then(() => {
      $q.notify({
        type: 'positive',
        message: 'Livro cadastrado com sucesso.',
        icon: 'check',
      });
      createDialog.value.visible = false;
      newBook.value = { name: '', author: '', totalQuantity: '', launchDate: '', publisherId: '' };
      getTable();
    })
    .catch(error => {
      $q.notify({
        type: 'negative',
        message: 'Erro ao cadastrar livro. Tente novamente.',
        icon: 'warning',
      });
    });
};

const saveEdit = () => {
  const bookData = {
    ...bookToEdit.value,
    totalQuantity: Number(bookToEdit.value.totalQuantity),
    publisherId: bookToEdit.value.publisherId
  };

  api.put(`/book/${bookToEdit.value.id}`, bookData)
    .then(() => {
      $q.notify({
        type: 'positive',
        message: 'Livro atualizado com sucesso.',
        icon: 'check',
      });
      editDialog.value.visible = false;
      getTable();
    })
    .catch(error => {
      $q.notify({
        type: 'negative',
        message: 'Erro ao atualizar livro. Tente novamente.',
        icon: 'warning',
      });
    });
};

const openViewDialog = (row) => {
  getDataById(row.id);
  viewDialog.value.visible = true;
};

const openEditDialog = (row) => {
  bookToEdit.value = { ...row };
  editDialog.value.visible = true;
};

const openDeleteDialog = (row) => {
  deleteDialog.value.data = row;
  deleteDialog.value.visible = true;
};

const confirmDelete = () => {
  api.delete(`/book/${deleteDialog.value.data.id}`)
    .then(() => {
      $q.notify({
        type: 'positive',
        message: 'Livro excluído com sucesso.',
        icon: 'check',
      });
      deleteDialog.value.visible = false;
      getTable();
    })
    .catch(error => {
      $q.notify({
        type: 'negative',
        message: 'Erro ao excluir livro. Tente novamente.',
        icon: 'warning',
      });
    });
};

const openCreateDialog = () => {
  createDialog.value.visible = true;
};

const clearSearch = () => {
  text.value = '';
  getTable();
};


</script>
