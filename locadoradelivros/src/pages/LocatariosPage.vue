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
            <q-card>
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
            <q-card>
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

          <q-dialog v-model="createDialog.visible" persistent>
            <q-card>
              <q-card-section>
                <div class="text-h6">Cadastrar Locatário</div>
              </q-card-section>
              <q-card-section class="q-pt-none">
                <q-form @submit="onSubmit" class="q-gutter-md q-my-auto">
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
  api.get('/renter', { params: { search: inputSearch } })
    .then(response => {
      if (Array.isArray(response.data)) {
        rows.value = response.data;
        console.log(response.data);
      } else {
        console.error('A resposta da API não é um array:', response.data);
        rows.value = [];
      }
      console.log('Resposta da API:', response.data);
    })
    .catch(error => {
      console.error("aaaaaaaaaaaaaaaaaaaaaaaaa:", error);
    });
}

const InfosEdit = ref({});
const newRenter = ref({ name: '', email: '', telephone: '', address: '', cpf: '' });

const getApi = (id) => {
  api.get(`/renter/${id}`)
    .then(response => {
      InfosEdit.value = response.data;
      renterToEdit.value = response.data;
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
  editDialog.value.visible = true;
};

const openDeleteDialog = (row) => {
  deleteDialog.value.data = row;
  deleteDialog.value.visible = true;
};

const openCreateDialog = () => {
  newRenter.value = { name: '', email: '', telephone: '', address: '', cpf: '' };
  createDialog.value.visible = true;
}

const renterToEdit = ref({
  id: 0,
  name: '',
  email: '',
  telephone: 0,
  address: '',
  cpf: 0
});

const saveEdit = () => {
  api.put(`/renter`, { ...renterToEdit.value, telephone: Number(renterToEdit.value.telephone) })
    .then(() => {
      const index = rows.value.findIndex(r => r.id === renterToEdit.value.id);
      if (index !== -1) {
        rows.value[index] = { ...renterToEdit.value };
      }
      editDialog.value.visible = false;
    })
    .catch(error => {
      console.error("Erro ao salvar edição:", error);
    });
};

const confirmDelete = () => {
  const index = rows.value.findIndex(r => r.id === deleteDialog.value.data.id);
  if (index !== -1) {
    api.delete(`/renter/${deleteDialog.value.data.id}`)
      .then(() => {
        rows.value.splice(index, 1);
        deleteDialog.value.visible = false;
      })
      .catch(error => {
        console.error("Erro ao excluir:", error);
      });
  }
};

const saveNewRenter = () => {
  console.log("Tentando criar novo locatário com:", newRenter.value);
  api.post('/renter', newRenter.value)
    .then(response => {
      console.log("Locatário criado com sucesso:", response.data);
      rows.value.push(response.data);
      createDialog.value.visible = false;
    })
    .catch(error => {
      console.error("Erro ao criar novo locatário:", error.response ? error.response.data : error.message);
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
