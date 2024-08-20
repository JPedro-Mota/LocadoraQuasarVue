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
            <q-card>
              <q-card-section>
                <div class="text-h6">Editar Editora</div>
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
                <div class="text-h6">Cadastrar Editora</div>
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
  authenticate()
    .then(() => {
      console.log("Sucesso");
      getTable();
    })
    .catch(error => {
      console.error("Erro na autenticação", error);
    });
});

const columns = [
  { name: 'name', required: true, label: 'Nome', align: 'center', field: row => row.name, sortable: true },
  { name: 'actions', label: 'Ações', align: 'center' }
];

const rows = ref([]);
const text = ref('');

const getTable = (inputSearch = '') => {
  api.get('/publisher', { params: { search: inputSearch } })
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
const newPublisher = ref({ name: '', email: '', telephone: '', site: '' });

const getApi = (id) => {
  api.get(`/publisher/${id}`)
    .then(response => {
      InfosEdit.value = response.data;
      publisherToEdit.value = response.data;
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
  editDialog.value.visible = true;
};

const openDeleteDialog = (row) => {
  deleteDialog.value.data = row;
  deleteDialog.value.visible = true;
};

const openCreateDialog = () => {
  newPublisher.value = { name: '', email: '', telephone: '', site: '' };
  createDialog.value.visible = true;
}

const publisherToEdit = ref({
  id: '',
  name: '',
  email: '',
  telephone: 0,
  site: ''
});

const saveEdit = () => {
  console.log("Dados antes de salvar a edição:", publisherToEdit.value);
  const index = rows.value.findIndex(r => r.id === editDialog.value.data.id);
  if (index !== -1) {
    api.put( `/publisher`, {...publisherToEdit.value})
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
    api.delete(`/publisher/${deleteDialog.value.data.id}`)
      .then(() => {
        rows.value.splice(index, 1);
        deleteDialog.value.visible = false;
      })
      .catch(error => {
        console.error("Erro ao excluir:", error);
      });
  }
};

const saveNewPublisher = () => {
  api.post('/publisher', newPublisher.value)
    .then(response => {
      rows.value.push(response.data);
      createDialog.value.visible = false;
    })
    .catch(error => {
      console.error("Erro ao criar nova editora:", error);
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
