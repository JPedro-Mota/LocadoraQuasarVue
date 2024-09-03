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
            <q-card>
              <q-card-section>
                <div class="text-h6">Detalhes da Biblioteca</div>
              </q-card-section>
              <q-card-section class="q-pt-none">
                <div><strong>ID:</strong> {{ InfosEdit.id }}</div>
                <div><strong>Nome:</strong> {{ InfosEdit.name }}</div>
                <div><strong>Autor:</strong> {{ InfosEdit.author }}</div>
                <div><strong>Quantidade Total:</strong> {{ InfosEdit.totalQuantity }}</div>
                <div><strong>Data de lançamento:</strong> {{ InfosEdit.launchDate }}</div>
              </q-card-section>
              <q-card-actions align="right">
                <q-btn flat label="Fechar" color="primary" v-close-popup />
              </q-card-actions>
            </q-card>
          </q-dialog>

          <q-dialog v-model="editDialog.visible" persistent>
            <q-card>
              <q-card-section>
                <div class="text-h6">Editar Livro</div>
              </q-card-section>
              <q-card-section class="q-pt-none">
                <q-input v-model="bookToEdit.id" label="Id" />
                <q-input v-model="bookToEdit.name" label="Nome" />
                <q-input v-model="bookToEdit.author" label="Autor" />
                <q-input v-model="bookToEdit.totalQuantity" label="Quantidade total" />
                <q-input v-model="bookToEdit.launchDate" label="Data de lançamento" type="date" />
                <q-input v-model="bookToEdit.publisherId" label="Id da editora"/>
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
                Tem certeza que deseja excluir a editora "{{ deleteDialog.data.name }}"?
              </q-card-section>
              <q-card-actions align="right">
                <q-btn flat label="Excluir" color="primary" @click="confirmDelete" />
                <q-btn flat label="Cancelar" color="primary" v-close-popup />
              </q-card-actions>
            </q-card>
          </q-dialog>

          <q-dialog v-model="createDialog.visible" persistent>
            <q-card>
              <q-card-section>
                <div class="text-h6">Cadastrar de livro</div>
              </q-card-section>
              <q-card-section class="q-pt-none">
                <q-form @submit="onSubmit" class="q-gutter-md q-my-auto">
                  <q-input v-model="newBook.name" label="Nome" />
                  <q-input v-model="newBook.author" label="Autor" />
                  <q-input v-model="newBook.totalQuantity" label="Quantidade Total" />
                  <q-input v-model="newBook.launchDate" label="Data de lançamento" type="date" />
                  <q-input v-model="newBook.publisherId" label="Id da Editora" />
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
import { api, authenticate } from 'src/boot/axios';

onMounted(() => {
      getTable();
});

const columns = [
  { name: 'name', required: true, label: 'Nome', align: 'center', field: row => row.name, sortable: true },
  { name: 'actions', label: 'Ações', align: 'center' }
];

const rows = ref([]);
const text = ref('');

const getTable = (inputSearch = '') => {
  api.get('/book', { params: { search: inputSearch } })
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
const newBook = ref({ name: '', author: '', totalQuantity: '', launchDate: '', publisherId: '' });

const getApi = (id) => {
  api.get(`/book/` + id)
    .then(response => {
      InfosEdit.value = response.data;
      console.log(InfosEdit.value);
    })
    .catch(error => {
      console.error("Erro", error);
    });
}

const viewDialog = ref({
  visible: false,
  data: {},
});

const editDialog = ref({
  visible: false,
  data: {}
});

const deleteDialog = ref({
  visible: false,
  data: {}
});

const createDialog = ref({
  visible: false,
  data: {}
});

const openViewDialog = (row) => {
  getApi(row.id);
  viewDialog.value.visible = true;
};

const openEditDialog = (row) => {
  getApi(row.id);
  editDialog.value.data = { ...row };
  bookToEdit.value = {
    id: row.id,
    name: row.name,
    author: row.author,
    totalQuantity: row.totalQuantity,
    launchDate: row.launchDate,
    publisherId: row.publisherId
  };
  editDialog.value.visible = true;
};

const openCreateDialog = () => {
  newBook.value = { name: '', author: '', totalQuantity: '', launchDate: '', publisherId: '' };
  createDialog.value.visible = true;
}

const bookToEdit = ref({
  id: '',
  name: '',
  author: '',
  totalQuantity: '',
  launchDate: '',
  publisherId: ''
});

const saveEdit = () => {
  console.log("Dados antes de salvar a edição:", bookToEdit.value);
  const index = rows.value.findIndex(r => r.id === editDialog.value.data.id);
  if (index !== -1) {
    api.put( `/book`, {...bookToEdit.value, publisherId: Number(bookToEdit.value.publisherId)})
      .then(response => {
        console.log("Resposta da API ao salvar a edição:", response.data);
        rows.value[index] = { ...response.data };
        editDialog.value.visible = false;
      })
      .catch(error => {
        console.error("Erro ao salvar edição:", error.response ? error.response.data : error.message);
      });
  }
};

const confirmDelete = () => {
  const index = rows.value.findIndex(r => r.id === deleteDialog.value.data.id);
  if (index !== -1) {
    api.delete(`/book/${deleteDialog.value.data.id}`)
      .then(() => {
        rows.value.splice(index, 1);
        deleteDialog.value.visible = false;
      })
      .catch(error => {
        console.error("Erro ao excluir:", error);
      });
  }
};

const saveNewBook = () => {
  console.log("Tentando criar novo livro com:", newBook.value);
  api.post('/book', newBook.value)
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
