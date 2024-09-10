<template>
  <div class="title">
    <h6>
      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000">
        <path d="M40-160v-112q0-34 17.5-62.5T104-378q62-31 126-46.5T360-440q66 0 130 15.5T616-378q29 15 46.5 43.5T680-272v112H40Zm720 0v-120q0-44-24.5-84.5T666-434q51 6 96 20.5t84 35.5q36 20 55 44.5t19 53.5v120H760ZM360-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Zm400-160q0 66-47 113t-113 47q-11 0-28-2.5t-28-5.5q27-32 41.5-71t14.5-81q0-42-14.5-81T544-792q14-5 28-6.5t28-1.5q66 0 113 47t47 113Z"/>
      </svg>
      Usuário
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
            <q-card style="min-width: 300px;">
              <q-card-section>
                <div class="text-h6">Detalhes de Usuário</div>
              </q-card-section>
              <q-card-section class="q-pt-none">
                <div><strong>Nome:</strong> {{ InfosUser.name }}</div>
                <div><strong>Email:</strong> {{ InfosUser.email }}</div>
                <div><strong>Nível de acesso:</strong> {{ InfosUser.role }}</div>
              </q-card-section>
              <q-card-actions align="right">
                <q-btn flat label="Fechar" color="primary" v-close-popup />
              </q-card-actions>
            </q-card>
          </q-dialog>

          <q-dialog v-model="editDialog.visible" persistent>
            <q-card style="width: 400px; max-width: 100%;">
              <q-card-section>
                <div class="text-h6">Editar Usuário</div>
              </q-card-section>
              <q-card-section class="q-pt-none">
                <q-input v-model="userToEdit.name" label="Nome" />
                <q-input v-model="userToEdit.email" label="Email" />
                <q-input v-model="userToEdit.password" label="Senha" type="password" />
                <q-select filled v-model="userToEdit.role" :options="options" label="Nível de acesso" />
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
                Tem certeza que deseja excluir o usuário "{{ deleteDialog.data.name }}"?
              </q-card-section>
              <q-card-actions align="right">
                <q-btn flat label="Excluir" color="primary" @click="confirmDelete" />
                <q-btn flat label="Cancelar" color="primary" v-close-popup />
              </q-card-actions>
            </q-card>
          </q-dialog>

          <q-dialog v-model="createDialog.visible" persistent>
            <q-card style="min-width: 450px;">
              <q-card-section>
                <div class="text-h6">Cadastrar Usuário</div>
              </q-card-section>
              <q-card-section class="q-pt-none">
                <q-input v-model="userToCreate.name" label="Nome" />
                <q-input v-model="userToCreate.email" label="Email" />
                <q-input v-model="userToCreate.password" label="Senha" type="password" />
                <q-select filled v-model="userToCreate.role" :options="options" label="Nível de acesso"  emit-value map-options/>
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
import { useQuasar } from 'quasar';
import TableComponents from '../components/TableComponents.vue';
import { api } from 'src/boot/axios';

const $q = useQuasar();

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
  api.get('/user', { params: { search: inputSearch } })
    .then(response => {
      if (Array.isArray(response.data)) {
        rows.value = response.data;
        console.log("Dados obtidos com sucesso");
      } else {
        console.error('A resposta da API não é um array:', response.data);
        rows.value = [];
      }
    })
    .catch(error => {
      console.error("Erro ao obter dados:", error);
    });
}

const InfosUser = ref({});
const userToEdit = ref({ name: '', email: '', password: '', role: '' });
const userToCreate = ref({ name: '', email: '', password: '', role: '' });

const getApi = (id) => {
  api.get(`/user/${id}`)
    .then(response => {
      InfosUser.value = response.data;
      userToEdit.value = response.data;
    })
    .catch(error => {
      console.error("Erro", error);
    });
}

const viewDialog = ref({ visible: false });
const editDialog = ref({ visible: false });
const deleteDialog = ref({ visible: false, data: {} });
const createDialog = ref({ visible: false });

const openViewDialog = (row) => {
  getApi(row.id);
  viewDialog.value.visible = true;
};

const openEditDialog = (row) => {
  getApi(row.id);
  editDialog.value.visible = true;
};

const openDeleteDialog = (row) => {
  deleteDialog.value.data = row;
  deleteDialog.value.visible = true;
};

const openCreateDialog = () => {
  userToCreate.value = { name: '', email: '', password: '', role: '' };
  createDialog.value.visible = true;
}

const options = ref([
  { label: 'ADMIN', value: 'ADMIN' },
  { label: 'USER', value: 'USER' }
]);

const saveEdit = () => {
  api.put(`/user/${userToEdit.value.id}`, { ...userToEdit.value })
    .then(response => {
      const index = rows.value.findIndex(r => r.id === userToEdit.value.id);
      if (index !== -1) {
        rows.value[index] = { ...response.data };
        $q.notify({
          type: 'positive',
          message: 'Usuário atualizado com sucesso!'
        });
      }
      editDialog.value.visible = false;
    })
    .catch(error => {
      console.error("Erro ao salvar edição:", error);
      $q.notify({
        type: 'negative',
        message: 'Erro ao atualizar o usuário.'
      });
    });
};

const confirmDelete = () => {
  const index = rows.value.findIndex(r => r.id === deleteDialog.value.data.id);
  if (index !== -1) {
    api.delete(`/user/${deleteDialog.value.data.id}`)
      .then(() => {
        rows.value.splice(index, 1);
        $q.notify({
          type: 'positive',
          message: 'Usuário excluído com sucesso!'
        });
        deleteDialog.value.visible = false;
      })
      .catch(error => {
        console.error("Erro ao excluir:", error);
        $q.notify({
          type: 'negative',
          message: 'Erro ao excluir o usuário.'
        });
      });
  }
};

const saveNewUser = () => {
  const { role, ...rest } = userToCreate.value;
  api.post('/user', { ...rest, role: role })
    .then(response => {
      rows.value.push(response.data);
      $q.notify({
        type: 'positive',
        message: 'Usuário criado com sucesso!'
      });
      createDialog.value.visible = false;
    })
    .catch(error => {
      console.error("Erro ao criar novo usuário:", error);
      $q.notify({
        type: 'negative',
        message: 'Erro ao criar novo usuário.'
      });
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
</script>
