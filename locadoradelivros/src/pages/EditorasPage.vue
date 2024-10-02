<template>
  <div class="title">
    <h6>
      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="30px" fill="#000000">
        <path d="M120-120v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm584-528 56-56-56-56-56 56 56 56Z"/>
      </svg>
      Editora
    </h6>
  </div>

  <q-page padding>
    <div class="tableHeader">
      <q-input bg-color="grey-4" rounded standout dense bottom-slots v-model="text" label="Pesquisar" class="input-field" @keyup.enter="getTable(text)">
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
        <q-btn flat round dense icon="visibility" @click="openViewDialog(row)" class="actions-bt" />
        <q-btn flat round dense icon="edit" @click="openEditDialog(row)" class="actions-bt" />
        <q-btn flat round dense icon="delete" @click="openDeleteDialog(row)" class="actions-bt" />
      </template>
    </TableComponents>

    <q-dialog v-model="createDialog.visible" persistent>
      <q-card style="min-width: 500px;">
        <q-card-section>
          <div class="text-h6" style="display: flex; justify-content: center;">Cadastrar Editora</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-input v-model="newPublisher.name" label="Nome" />
          <q-input v-model="newPublisher.email" label="Email" />
          <q-input v-model="newPublisher.telephone" label="Telefone" />
          <q-input v-model="newPublisher.site" label="Site" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Salvar" color="primary" @click="saveNewPublisher" />
          <q-btn flat label="Cancelar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="viewDialog.visible" persistent>
      <q-card style="min-width: 300px;">
        <q-card-section>
          <div class="text-h6">Detalhes da Editora</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <div><strong>Nome:</strong> {{ InfosEdit.name }}</div>
          <div><strong>Email:</strong> {{ InfosEdit.email }}</div>
          <div><strong>Telefone:</strong> {{ InfosEdit.telephone }}</div>
          <div><strong>Site:</strong> {{ InfosEdit.site }}</div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Fechar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="editDialog.visible" persistent>
      <q-card style="min-width: 500px;">
        <q-card-section>
          <div class="text-h6" style="display: flex; justify-content: center;">Editar Editora</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-input v-model="publisherToEdit.name" label="Nome" />
          <q-input v-model="publisherToEdit.email" label="Email" />
          <q-input v-model="publisherToEdit.telephone" label="Telefone" />
          <q-input v-model="publisherToEdit.site" label="Site" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Salvar" color="primary" @click="saveEdit" />
          <q-btn flat label="Cancelar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="deleteDialog.visible" persistent>
      <q-card style="min-width: 200px;">
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
    <div class="row justify-center q-my-md">
    <q-btn icon="chevron_left" @click="pageDown" :disable="page.value <= 0" />
    <q-btn icon="chevron_right" @click="pageUp" :disable="page.value" />
  </div>
  </q-page>
</template>

<style scoped>
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
import { ref, onMounted} from 'vue';
import TableComponents from '../components/TableComponents.vue';
import { api } from 'src/boot/axios';
import { useQuasar } from 'quasar';

const $q = useQuasar();

const rows = ref([]);
const text = ref('');
const page = ref(0);
const totalPages = ref(1);
const newPublisher = ref({ name: '', email: '', telephone: '', site: '' });
const InfosEdit = ref({});
const publisherToEdit = ref({ id: '', name: '', email: '', telephone: 0, site: '' });

const viewDialog = ref({ visible: false });
const editDialog = ref({ visible: false });
const deleteDialog = ref({ visible: false });
const createDialog = ref({ visible: false });

const columns = [
  { name: 'name', required: true, label: 'Nome', align: 'center', field: row => row.name, sortable: true },
  { name: 'actions', label: 'Ações', align: 'center' }
];

const getTable = (inputSearch = '') => {
  api.get('/publisher', { params: { search: inputSearch, page: page.value } })
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

const getApi = (id) => {
  api.get(`/publisher/${id}`)
    .then(response => {
      InfosEdit.value = response.data;
      publisherToEdit.value = response.data;
    })
    .catch(error => {
      $q.notify({ type: 'negative', message: 'Erro ao obter dados da editora: ' + (error.response ? error.response.data.message : error.message), position: 'top-right' });
    });
};

const openViewDialog = (row) => {
  getApi(row.id);
  viewDialog.value.visible = true;
};

const openEditDialog = (row) => {
    publisherToEdit.value = { ...row };
    editDialog.value.visible = true;
};

const openDeleteDialog = (row) => {
  deleteDialog.value.data = row;
  deleteDialog.value.visible = true;
};

const openCreateDialog = () => {
  createDialog.value.visible = true;
};

const saveEdit = () => {
  api.put(`/publisher/${publisherToEdit.value.id}`, publisherToEdit.value)
    .then(response => {
      const index = rows.value.findIndex(r => r.id === response.data.id);
      if (index !== -1) {
        rows.value[index] = response.data;
      }
      editDialog.value.visible = false;
      $q.notify({ type: 'positive', message: 'Editora atualizada com sucesso!', position: 'top-right' });
    })
    .catch(error => {
      $q.notify({ type: 'negative', message: 'Erro ao atualizar editora: ' + (error.response ? error.response.data.message : error.message), position: 'top-right' });
    });
};

const confirmDelete = () => {
  api.delete(`/publisher/${deleteDialog.value.data.id}`)
    .then(() => {
      rows.value = rows.value.filter(row => row.id !== deleteDialog.value.data.id);
      deleteDialog.value.visible = false;
      $q.notify({ type: 'positive', message: 'Editora excluída com sucesso!', position: 'top-right' });
    })
    .catch(error => {
      $q.notify({ type: 'negative', message: 'Erro ao excluir editora: ' + (error.response ? error.response.data.message : error.message), position: 'top-right' });
    });
};

const saveNewPublisher = () => {
  api.post('/publisher', newPublisher.value)
    .then(response => {
      rows.value.push(response.data);
      createDialog.value.visible = false;
      $q.notify({ type: 'positive', message: 'Editora criada com sucesso!', position: 'top-right' });
    })
    .catch(error => {
      $q.notify({ type: 'negative', message: 'Erro ao criar editora: ' + (error.response ? error.response.data.message : error.message), position: 'top-right' });
    });
};

const clearSearch = () => {
  text.value = '';
  getTable();
};

onMounted(() => {
  getTable();
});
</script>
