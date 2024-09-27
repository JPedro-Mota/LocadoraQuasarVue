<template>
  <div class="title">
    <h6>
      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="30px" fill="#000000">
        <path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Z"/>
      </svg>
      Locatário
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
        <q-btn flat round dense icon="visibility" @click="openViewDialog(row)" />
        <q-btn flat round dense icon="edit" @click="openEditDialog(row)" />
        <q-btn flat round dense icon="delete" @click="openDeleteDialog(row)" />
      </template>
    </TableComponents>

    <q-dialog v-model="createDialog.visible" persistent>
      <q-card style="min-width: 500px;">
        <q-card-section>
          <div class="text-h6" style="display: flex; justify-content: center;">Cadastrar Locatário</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit.prevent="saveNewRenter">
            <q-input v-model="newRenter.name" label="Nome" />
            <q-input v-model="newRenter.email" label="Email" />
            <q-input v-model="newRenter.telephone" label="Telefone" />
            <q-input v-model="newRenter.address" label="Endereço" />
            <q-input v-model="newRenter.cpf" label="CPF" mask="###.###.###-##" />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Salvar" color="primary" @click="saveNewRenter" />
          <q-btn flat label="Cancelar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="viewDialog.visible" persistent>
      <q-card style="min-width: 300px;">
        <q-card-section>
          <div class="text-h6">Detalhes do Locatário</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <div><strong>ID:</strong> {{ InfosEdit.id }}</div>
          <div><strong>Nome:</strong> {{ InfosEdit.name }}</div>
          <div><strong>Email:</strong> {{ InfosEdit.email }}</div>
          <div><strong>Telefone:</strong> {{ InfosEdit.telephone }}</div>
          <div><strong>Endereço:</strong> {{ InfosEdit.address }}</div>
          <div><strong>CPF:</strong> {{ InfosEdit.cpf }}</div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Fechar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="editDialog.visible" persistent>
      <q-card style="min-width: 500px;">
        <q-card-section>
          <div class="text-h6">Editar Locatário</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-input v-model="renterToEdit.name" label="Nome" />
          <q-input v-model="renterToEdit.email" label="Email" />
          <q-input v-model="renterToEdit.telephone" label="Telefone" />
          <q-input v-model="renterToEdit.address" label="Endereço" />
          <q-input v-model="renterToEdit.cpf" label="CPF" mask="###.###.###-##" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Salvar" color="primary" @click="saveEdit" />
          <q-btn flat label="Cancelar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="deleteDialog.visible" persistent>
      <q-card style="min-width: 300px;">
        <q-card-section>
          <div class="text-h6">Confirmar Exclusão</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          Tem certeza que deseja excluir o locatário "{{ deleteDialog.data.name }}"?
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Excluir" color="primary" @click="confirmDelete" />
          <q-btn flat label="Cancelar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

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
const text = ref('');
const newRenter = ref({ name: '', email: '', telephone: '', address: '', cpf: '' });
const renterToEdit = ref({
  id: 0,
  name: '',
  email: '',
  telephone: '',
  address: '',
  cpf: ''
});
const InfosEdit = ref({});

const viewDialog = ref({ visible: false });
const editDialog = ref({ visible: false });
const deleteDialog = ref({ visible: false });
const createDialog = ref({ visible: false });

onMounted(() => {
  getTable();
});

const getTable = (inputSearch = '') => {
  api.get('/renter', { params: { search: inputSearch } })
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

const saveNewRenter = () => {
  api.post('/renter', newRenter.value)
    .then(response => {
      rows.value.push(response.data);
      createDialog.value.visible = false;
      $q.notify({
        type: 'positive',
        message: 'Locatário criado com sucesso!',
        position: 'top-right'
      });
    })
    .catch(error => {
      console.error("Erro ao criar locatário:", error);
      $q.notify({
        type: 'negative',
        message: 'Erro ao criar locatário: ' + (error.response ? error.response.data.message : error.message),
        position: 'top-right'
      });
    });
};

const openCreateDialog = () => {
  createDialog.value.visible = true;
};

const openViewDialog = (row) => {
  getApi(row.id);
  viewDialog.value.visible = true;
};

const openEditDialog = (row) => {
  renterToEdit.value = { ...row };
  editDialog.value.visible = true;
};

const openDeleteDialog = (row) => {
  deleteDialog.value.data = row;
  deleteDialog.value.visible = true;
};

const getApi = (id) => {
  api.get(`/renter/${id}`)
    .then(response => {
      InfosEdit.value = response.data;
    })
    .catch(error => {
      console.error("Erro ao buscar dados do locatário:", error);
      $q.notify({
        type: 'negative',
        message: 'Erro ao buscar dados do locatário: ' + (error.response ? error.response.data.message : error.message),
        position: 'top-right'
      });
    });
};

const saveEdit = () => {
  api.put(`/renter/${renterToEdit.value.id}`, renterToEdit.value)
    .then(response => {
      const index = rows.value.findIndex(r => r.id === renterToEdit.value.id);
      rows.value[index] = response.data;
      editDialog.value.visible = false;
      $q.notify({
        type: 'positive',
        message: 'Locatário atualizado com sucesso!',
        position: 'top-right'
      });
    })
    .catch(error => {
      console.error("Erro ao atualizar locatário:", error);
      $q.notify({
        type: 'negative',
        message: 'Erro ao atualizar locatário: ' + (error.response ? error.response.data.message : error.message),
        position: 'top-right'
      });
    });
};

const confirmDelete = () => {
  api.delete(`/renter/${deleteDialog.value.data.id}`)
    .then(() => {
      rows.value = rows.value.filter(r => r.id !== deleteDialog.value.data.id);
      deleteDialog.value.visible = false;
      $q.notify({
        type: 'positive',
        message: 'Locatário excluído com sucesso!',
        position: 'top-right'
      });
    })
    .catch(error => {
      console.error("Erro ao excluir locatário:", error);
      $q.notify({
        type: 'negative',
        message: 'Erro ao excluir locatário: ' + (error.response ? error.response.data.message : error.message),
        position: 'top-right'
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
}

.actions-bt {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
}
</style>
