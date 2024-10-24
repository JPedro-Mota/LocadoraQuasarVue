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
      <q-btn rounded dense v-if="user.role === 'ADMIN'" icon="add" label="Criar" @click="openCreateDialog" color="green" class="button-field"></q-btn>
    </div>

    <TableComponents :columns="columns" :rows="rows">
      <template #actions="{ row }">
        <div class="dialogsa">
          <q-btn flat round dense icon="visibility" @click="openViewDialog(row)" class="actions-bt" />
          <q-btn flat round dense v-if="user.role === 'ADMIN'" icon="edit" @click="openEditDialog(row)" class="actions-bt" />
          <q-btn flat round dense v-if="user.role === 'ADMIN'" icon="delete" @click="openDeleteDialog(row)" class="actions-bt" />
        </div>
      </template>
    </TableComponents>

    <q-dialog v-model="viewDialog.visible" persistent>
      <q-card style="min-width: 400px;">
        <q-card-section>
          <div class="text-h6" style="display: flex; align-items: end;"> <q-icon name="book" size="30px" style="align-items: center;"/> Detalhes do Livro</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <div class="row q-gutter-md q-justify-center">
            <div class="column q-gutter-sm">
              <q-input v-model="InfosEdit.id" label="Id do Livro" rounded outlined readonly> <template v-slot:prepend>  <q-icon name="key"/></template></q-input>
              <q-input v-model="InfosEdit.name" label="Nome" rounded outlined readonly><template v-slot:prepend>  <q-icon name="book"/></template></q-input>
              <q-input v-model="InfosEdit.author" label="Autor" rounded outlined readonly><template v-slot:prepend>  <q-icon name="boy"/></template></q-input>
            </div>

            <div class="column q-gutter-sm">
              <q-input v-model="InfosEdit.totalQuantity" label="Quantidade total" rounded outlined readonly><template v-slot:prepend>  <q-icon name="library_books"/></template></q-input>
              <q-input v-model="InfosEdit.launchDate" label="Data de lançamento" rounded outlined readonly><template v-slot:prepend> <q-icon name="calendar_month"/></template></q-input>
              <q-input v-model="InfosEdit.publisherName" label="Nome da Editora" rounded outlined readonly type="textarea" autogrow><template v-slot:prepend> <q-icon name="edit"/></template></q-input>
            </div>
          </div>
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
          <q-select
              filled
              v-model="selectedPublisher"
              use-input
              hide-selected
              fill-input
              input-debounce="0"
              :options="publishers"
              option-label="name"
              label="Editora"
              @filter="publisherFilter"
              @update:model-value="onItemClickRegister(selectedPublisher, newBook)"
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
          <div class="text-h6" style="display: flex; justify-content: center;">Cadastro de Livro</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-form @submit.prevent="saveNewBook" class="q-gutter-md q-my-auto">
            <q-input v-model="newBook.name" label="Nome" />
            <q-input v-model="newBook.author" label="Autor" :rules="[val => val && val.length > 3 || 'É necessário ter mais de três caracteres']" />
            <q-input v-model="newBook.totalQuantity" label="Quantidade Total" :rules="[val => val > 0 || 'É necessário que a quantidade seja maior que 0']" />
            <q-input v-model="newBook.launchDate" label="Data de Lançamento" type="date" :rules="[val => val && val.length >= 6 || 'Adicione uma data válida' ]" :max="today" />

            <q-select
              filled
              v-model="selectedPublisher"
              use-input
              hide-selected
              fill-input
              input-debounce="0"
              :options="publishers"
              option-label="name"
              label="Editora"
              @filter="publisherFilter"
              @update:model-value="onItemClickRegister(selectedPublisher, newBook)"
            />

          </q-form>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Salvar" color="primary" @click="saveNewBook" />
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
import { onMounted, ref } from 'vue';
import TableComponents from '../components/TableComponents.vue';
import { api } from 'src/boot/axios';
import { useQuasar } from 'quasar';

const $q = useQuasar();

const columns = [
  { name: 'name', required: true, label: 'Nome', align: 'center', field: row => row.name, sortable: true },
  { name: 'actions', label: 'Ações', align: 'center' }
];

const rows = ref([]);
const page = ref(0);
const totalPages = ref(1);
const publishers = ref([]);
const text = ref('');
const InfosEdit = ref({});
const newBook = ref({ name: '', author: '', totalQuantity: '', launchDate: '', publisherId: '' });
const bookToEdit = ref({ id: '', name: '', author: '', totalQuantity: '', launchDate: '', publisherId: '' });
const errors = ref({  name: null,   author: null, totalQuantity: null, launchDate: null, publisherId: null});
const viewDialog = ref({ visible: false });
const editDialog = ref({ visible: false });
const deleteDialog = ref({ visible: false, data: {} });
const createDialog = ref({ visible: false });
const user = ref({role:''});
const today = ref(new Date().toISOString().split('T')[0]);


const userValid = () => {
  const role = localStorage.getItem('role');
  user.value.role = role;
}

const getTable = async (inputSearch = '') => {
  rows.value = [];
  api.get('/book', { params: { search: inputSearch, page: page.value } })
    .then(response => {
      rows.value = response.data.content;
      totalPages.value = response.headers['x-total-pages'];
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

const getPublishers = (inputSearch = '') => {
  api.get('/publisher/all', {params: {search: inputSearch}})
    .then(response => {
      publishers.value = response.data;
    })
    .catch(error => {
      $q.notify({ type: 'negative', message: 'Erro ao carregar editoras: ' + (error.response ? error.response.data.message : error.message), position: 'top-right' });
    });
};

function publisherFilter(val, update) {
  if (val === '') {
    update(() => {
      getPublishers();
    });
  } else {
    update(() => {
      const needle = val.toLowerCase();
      publishers.value = publishers.value.filter(publisher =>
        publisher.name.toLowerCase().includes(needle)
      );
    });
  }
}


function onItemClickRegister(selected, book){
  if (selected) {
    book.publisherId = selected.id;
  }
}

const openViewDialog = (row) => {
  InfosEdit.value = row;
  viewDialog.value.visible = true;
};

const openEditDialog = (row) => {
  bookToEdit.value = { ...row };
  editDialog.value.visible = true;
};

const saveEdit = () => {
  api.put(`/book/${bookToEdit.value.id}`, bookToEdit.value)
    .then(() => {
      $q.notify({ type: 'positive', message: 'Livro atualizado com sucesso.' });
      editDialog.value.visible = false;
      getTable();
    })
    .catch(error => {
      if (error.response && error.response.status === 400) {
        const errors = error.response.data;

        if (errors.name) {
          $q.notify({ type: 'negative', message: errors.name });
        }
        if (errors.author) {
          $q.notify({ type: 'negative', message: errors.author });
        }
        if (errors.launchDate) {
          $q.notify({ type: 'negative', message: errors.launchDate });
        }
        if(errors.publisherId){
          $q.notify({ type: 'negative', message: errors.publisherId });
        }
      } else {
        $q.notify({ type: 'negative', message: 'Erro ao criar livro ' });
      }
    });
};



const openDeleteDialog = (row) => {
  deleteDialog.value.visible = true;
  deleteDialog.value.data = row;
};

const confirmDelete = () => {
  api.delete(`/book/${deleteDialog.value.data.id}`)
    .then(() => {
      $q.notify({ type: 'positive', message: 'Livro excluído com sucesso.' });
      deleteDialog.value.visible = false;
      getTable(text.value);
    })
    .catch(error => {
      if (error.response.status === 400) {
        errors.value = error.response.data;
      } else if (error.response.status === 403) {
        $q.notify({ type: 'negative', message: 'Você não tem permissão para usar essa função' });
      } else {
        $q.notify({ type: 'negative', message: 'Erro ao atualizar livro' });
      }
    });
};

const clearSearch = () => {
  text.value = '';
  getTable();
};

const openCreateDialog = () => {
  createDialog.value.visible = true;
};

const saveNewBook = () => {
  api.post('/book', newBook.value)
    .then(() => {
      $q.notify({ type: 'positive', message: 'Livro criado com sucesso.' });
      createDialog.value.visible = false;
      getTable();
      clearForm();
    })
    .catch(error => {
      if (error.response && error.response.status === 400) {
        const errors = error.response.data;

        if (errors.name) {
          $q.notify({ type: 'negative', message: errors.name });
        }
        if (errors.author) {
          $q.notify({ type: 'negative', message: errors.author });
        }
        if (errors.launchDate) {
          $q.notify({ type: 'negative', message: errors.launchDate });
        }
        if(errors.publisherId){
          $q.notify({ type: 'negative', message: errors.publisherId });
        }
      } else {
        $q.notify({ type: 'negative', message: 'Erro ao criar livro: ' + (error.response ? error.response.data.message : error.message) });
      }
    });
};

onMounted(() => {
  getTable();
  getPublishers();
  userValid();
});

const clearErrors = () => {
  errors.value = {
    name: null,
    author: null,
    totalQuantity: null,
    launchDate: null,
    publisherId: null
  };
};
</script>
