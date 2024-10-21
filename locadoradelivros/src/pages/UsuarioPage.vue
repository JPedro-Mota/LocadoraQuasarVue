<template>
  <div class="title">
    <h6>
      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000">
        <path d="M40-160v-112q0-34 17.5-62.5T104-378q62-31 126-46.5T360-440q66 0 130 15.5T616-378q29 15 46.5 43.5T680-272v112H40Zm720 0v-120q0-44-24.5-84.5T666-434q51 6 96 20.5t84 35.5q36 20 55 44.5t19 53.5v120H760ZM360-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Zm400-160q0 66-47 113t-113 47q-11 0-28-2.5t-28-5.5q27-32 41.5-71t14.5-81q0-42-14.5-81T544-792q14-5 28-6.5t28-1.5q66 0 113 47t47 113Z"/>
      </svg>
      Usuários
    </h6>
  </div>
  <q-page padding>
    <div class="tableHeader">
      <q-input bg-color="grey-4" rounded standout dense bottom-slots v-model="text" label="Pesquisar" class="input-field" @keyup.enter="getTable(text)">
        <template v-slot:prepend>
          <q-icon name="search" />
        </template>
        <template v-slot:append>
          <q-icon name="close" @click="clearSearch" class="cursor-pointer" />
        </template>
      </q-input>

      <q-btn v-if="user.role === 'ADMIN'" rounded dense icon="add" label="Criar" @click="openCreateDialog" color="green" class="button-field"></q-btn>
    </div>
    <TableComponents :columns="columns" :rows="rows">
      <template #actions="{ row }">
        <div class="dialogsa">
          <q-btn flat round dense icon="visibility" @click="openViewDialog(row)" class="actions-bt" />

          <q-btn v-if="user.role === 'ADMIN' && row.email !== 'admin@example.com'" flat round dense icon="edit" @click="openEditDialog(row)" class="actions-bt" />

          <q-dialog v-model="viewDialog.visible" persistent>
            <q-card style="min-width: 400px;">
              <q-card-section>
                <div class="text-h6" style="display: flex; align-items: end;"> <q-icon name="group" size="30px" style="align-items: center;"/>Detalhes do Usuário</div>
              </q-card-section>
              <q-card-section class="coloumn q-gutter-sm">
                <q-input v-model="InfosUser.name" label="Nome" rounded outlined readonly> <template v-slot:prepend>  <q-icon name="person"/></template></q-input>
                <q-input v-model="InfosUser.email" label="Email" rounded outlined readonly> <template v-slot:prepend>  <q-icon name="mail"/></template></q-input>
                <q-input v-model="InfosUser.role" label="Cargo" rounded outlined readonly> <template v-slot:prepend>  <q-icon name="workspace_premium"/></template></q-input>
              </q-card-section>
              <q-card-actions align="right">
                <q-btn flat label="Fechar" color="primary" v-close-popup />
              </q-card-actions>
            </q-card>
          </q-dialog>

          <q-dialog v-model="editDialog.visible" persistent>
            <q-card style="min-width: 500px; max-width: 100%;">
              <q-card-section>
                <div class="text-h6" style="display: flex; justify-content: center;">Editar Usuário</div>
              </q-card-section>
              <q-card-section class="q-pt-none">
                <q-input v-model="userToEdit.name" label="Nome" required lazy-rules :rules="[val => !!val || 'O nome é obrigatório']"/>
                <q-input v-model="userToEdit.email" label="Email" type="email" required lazy-rules :rules="[ val => !!val || 'Email é obrigatório', val => /.+@.+\..+/.test(val) || 'Email inválido']"/>
                <q-select filled v-model="userToEdit.role" :options="options" label="Nível de acesso" emit-value map-options required lazy-rules :rules="[val => !!val || 'O cargo é obrigatório']"  />
              </q-card-section>
              <q-card-actions align="right">
                <q-btn flat label="Salvar" color="primary" @click="saveEdit" />
                <q-btn flat label="Cancelar" color="primary" v-close-popup />
              </q-card-actions>
            </q-card>
          </q-dialog>

          <q-dialog v-model="createDialog.visible" persistent>
            <q-card style="min-width: 500px;">
              <q-card-section>
                <div class="text-h6" style="display: flex; justify-content: center;">Cadastrar Usuário</div>
              </q-card-section>
              <q-card-section class="q-pt-none">
                <q-input v-model="userToCreate.name" label="Nome" required lazy-rules :rules="[val => !!val || 'O nome é obrigatório']"/>
                <q-input v-model="userToCreate.email" label="Email" type="email" required lazy-rules :rules="[ val => !!val || 'Email é obrigatório', val => /.+@.+\..+/.test(val) || 'Email inválido']"/>
                <q-input v-model="userToCreate.password" label="Senha" type="password" required lazy-rules :rules="[val => !!val || 'A senha é obrigatório']" />
                <q-select filled v-model="userToCreate.role" :options="options" label="Nível de acesso" emit-value map-options required lazy-rules :rules="[val => !!val || 'O cargo é obrigatório']" />
              </q-card-section>
              <q-card-actions align="right">
                <q-btn flat label="Salvar" color="primary" @click="saveNewUser" />
                <q-btn flat label="Cancelar" color="primary" v-close-popup />
              </q-card-actions>
            </q-card>
          </q-dialog>
        </div>
      </template>
    </TableComponents>
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
.pagination-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 20px 0;
}
</style>

<script setup>
import { onMounted, ref} from 'vue';
import { useQuasar } from 'quasar';
import TableComponents from '../components/TableComponents.vue';
import { api } from 'src/boot/axios';

const $q = useQuasar();

const rows = ref([]);
const text = ref('');
const page = ref(0);
const totalPages = ref(1);
const InfosUser = ref({});
const userToEdit = ref({ name: '', email: '', password: '', role: '' });
const userToCreate = ref({ name: '', email: '', password: '', role: '' });
const viewDialog = ref({ visible: false });
const editDialog = ref({ visible: false });
const createDialog = ref({ visible: false });
const user = ref({role:''});
const options = ref([
  { label: 'ADMIN', value: 'ADMIN' },
  { label: 'USER', value: 'USER' }
]);

const columns = [
  { name: 'name', required: true, label: 'Nome', align: 'center', field: row => row.name, sortable: true },
  { name: 'actions', label: 'Ações', align: 'center' }
];


onMounted(() => {
  getTable();
  userValid();
});

const userValid = () => {
  const role = localStorage.getItem('role');
  user.value.role = role;
}

const getTable = (inputSearch = '') => {
  api.get('/user', { params: { search: inputSearch, page: page.value } })
    .then(response => {
        rows.value = response.data.content;
        totalPages.value = response.headers['x-total-pages'];
        console.log("Dados obtidos com sucesso", response.data);
    })
    .catch(error => {
      console.error('Erro ao obter dados da API:', error);
    });
};

const clearSearch = () => {
  text.value = '';
  getTable();
};

const openCreateDialog = () => {
  userToCreate.value = { name: '', email: '', password: '', role: '' };
  createDialog.value.visible = true;
};

const saveNewUser = () => {
  api.post('/user', userToCreate.value)
    .then(() => {
      $q.notify({ type: 'positive', message: 'Usuário criado com sucesso!' });
      createDialog.value.visible = false;
      getTable();
    })
    .catch(error => {
       if (error.response.status === 400) {
        const errors = error.response.data;
          $q.notify({ type: 'negative', message: "Erro ao criar aluguel" });
      }

      else {
        $q.notify({ type: 'negative', message: 'Erro ao criar aluguel'});
      }
    });
};

const openViewDialog = (row) => {
  InfosUser.value = row;
  viewDialog.value.visible = true;
};

const openEditDialog = (row) => {
  userToEdit.value = { ...row };
  editDialog.value.visible = true;
};

const saveEdit = () => {
  api.put(`/user/${userToEdit.value.id}`, userToEdit.value)
    .then(() => {
      $q.notify({ type: 'positive', message: 'Usuário editado com sucesso!' });
      editDialog.value.visible = false;
      getTable();
    })
    .catch(error => {
      if (error.response && error.response.status === 400) {
        const errors = error.response.data;
        $q.notify({ type: 'negative', message: 'Erro ao criar aluguel: ' + (error.response ? error.response.data.message : error.message) });
      }
    });
};

const clearErrors = () => {
  errors.value = {
    name: "",
    email: "",
    role: null,
    password: "",
  };
};

const openDeleteDialog = (row) => {
  deleteDialog.value.visible = true;
  deleteDialog.value.data = row;
};

const pageUp = () => {
    page.value++;
    getTable();
};

const pageDown = () => {
  if (page.value > 0) {
    page.value--;
    getTable(text.value);
  }
};


</script>
