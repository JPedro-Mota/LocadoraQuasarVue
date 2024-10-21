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
      <q-btn v-if="user.role === 'ADMIN'" rounded dense icon="add" label="Criar" @click="openCreateDialog" color="green" class="button-field"></q-btn>
    </div>

    <TableComponents :columns="columns" :rows="rows">
      <template #actions="{ row }">
        <q-btn flat round dense icon="visibility" @click="openViewDialog(row)" />
        <q-btn v-if="user.role === 'ADMIN'" flat round dense icon="edit" @click="openEditDialog(row)" />
        <q-btn v-if="user.role === 'ADMIN'" flat round dense icon="delete" @click="openDeleteDialog(row)" />
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
            <q-input v-model="newRenter.telephone" label="Telefone" mask="(##) #####-####" fill-mask />
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
      <q-card>
        <q-card-section>
          <div class="text-h6" style="display: flex; align-items: end;"> <q-icon name="person" size="30px" style="align-items: center;"/> Detalhes do Locatário</div>
        </q-card-section>
        <q-card-section class="q-pt-none">

        <div class="row q-gutter-md q-justify-center">
          <div class="column q-gutter-sm">
              <q-input v-model="InfosEdit.id" label="Id" rounded outlined readonly> <template v-slot:prepend>  <q-icon name="person"/></template></q-input>
              <q-input v-model="InfosEdit.name" label="Nome " rounded outlined readonly> <template v-slot:prepend>  <q-icon name="person"/></template></q-input>
              <q-input v-model="InfosEdit.email" label="Email " rounded outlined readonly> <template v-slot:prepend>  <q-icon name="mail"/></template></q-input>
          </div>

          <div class="column q-gutter-sm">
            <q-input v-model="InfosEdit.telephone" label="Telefone" rounded outlined readonly> <template v-slot:prepend>  <q-icon name="phone"/></template></q-input>
            <q-input v-model="InfosEdit.address" label="Endereço" rounded outlined readonly > <template v-slot:prepend>  <q-icon name="home"/></template></q-input>
            <q-input v-model="InfosEdit.cpf" label="CPF" rounded outlined readonly > <template v-slot:prepend>  <q-icon name="badge"/></template></q-input>
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
          <div class="text-h6">Editar Locatário</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-input v-model="renterToEdit.name" label="Nome" />
          <q-input v-model="renterToEdit.email" label="Email" />
          <q-input v-model="renterToEdit.telephone" label="Telefone" mask="(##) #####-####" fill-mask  />
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
    <div class="row justify-center q-my-md">
    <q-btn icon="chevron_left" @click="pageDown" :disable="page.value <= 0" />
    <q-btn icon="chevron_right" @click="pageUp" :disable="page.value" />
  </div>
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
const page = ref(0);
const totalPages = ref(1);
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
const user = ref({role:''});

onMounted(() => {
  getTable();
  userValid();
});

const userValid = () => {
  const role = localStorage.getItem('role');
  user.value.role = role;
}

const getTable = (inputSearch = '') => {
  api.get('/renter', { params: { search: inputSearch, page: page.value } })
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
      if (error.response && error.response.status === 400) {
        const errors = error.response.data;

        if (errors.name) {
          $q.notify({ type: 'negative', message: errors.name });
        }
        if (errors.email) {
          $q.notify({ type: 'negative', message: errors.email });
        }
        if (errors.cpf) {
          $q.notify({ type: 'negative', message: errors.cpf });
        }
        if (errors.telephone) {
          $q.notify({ type: 'negative', message: errors.telephone });
        }
        if (errors.address) {
          $q.notify({ type: 'negative', message: errors.address });
        }
      } else {
        $q.notify({ type: 'negative', message: 'Erro ao criar aluguel: ' + (error.response ? error.response.data.message : error.message) });
      }
    });
};

const clearErrors = () => {
  errors.value = {
    name: "",
    email: "",
    cpf: "",
    telephone: "",
    address: ""
  };
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
