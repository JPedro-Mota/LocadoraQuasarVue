<template>
  <q-layout view="lHh Lpr lFf" v-if="token">
    <q-header class="transparent-header">
      <q-toolbar class="transparent-toolbar">

        <q-toolbar-title style="display: flex; justify-content: space-between; margin-top: 10px;">
          <img src="../assets/altislab.png"  alt="AltisLab Logo" width="150px" height="40px"/>
          <q-btn-dropdown flat dense :icon="user.role === 'Administrador' ? 'supervised_user_circle' : 'account_circle'"  @click="openViewDialog(row)" size="20px" style="color: #220127; border-radius: 50px;" >
           <div style="max-width: 100%; max-height: 100%;">
              <div class="row" style="display: flex; justify-content: left; align-items: center; width: 450px; height: 130px;">
                <q-avatar :icon="user.role === 'Administrador' ? 'supervised_user_circle' : 'account_circle'" size="150px" style="color: #220127; width: 65px; height: 65px; margin-left: 35px;" />

                <hr style="width: 3px; height: 60%; background-color: #220127; margin: 1px 0; border-radius: 50px; margin-right: 1px; margin-left: 10px;"/>

                  <div style="margin-left: 5px; text-align: start; ">
                      <p style="font-size: medium; margin: 1px;">{{ user.role }}</p>
                      <p style="font-size: medium; margin: 1px;">{{ user.name }}</p>
                  </div>
                </div>

                <div style="display: flex; align-items: center; justify-content: center;">
                  <q-btn color="red" style="width: 45%; height: 45%;  border-radius: 10px;" clickable exact class="q-mx-auto q-mb-sm logout" @click="logout">
                        <q-item-section avatar>
                          <q-icon name="logout" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>Desconectar</q-item-label>
                        </q-item-section>
                  </q-btn>
              </div>
            </div>
          </q-btn-dropdown>
        </q-toolbar-title>
      </q-toolbar>
    </q-header>



    <q-drawer
      v-model="drawer"
      show-if-above
      :mini="miniSidebar"
      :width="200"
      :breakpoint="200"
      bordered
      style="background-color: #220127; color: white; height: 100vh; display: flex; flex-direction: column; justify-content: space-between;"
    >
      <q-list>
        <q-item class="buttom">
          <q-btn
            flat
            dense
            round
            icon="menu"
            aria-label="Menu"
            @click="toggleSidebar"
          />

        </q-item>
        <div class="space"></div>
        <EssentialLink
          v-for="link in linksList"
          :key="link.title"
          v-bind="link"
        />


      </q-list>


      <q-space />


    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>

  <q-layout v-else class="centered-layout">
    <div class="form-container q-pa-md">
      <div class="form-title">
        <img src="../assets/altislab.png" alt="AltisLab Logo" width="200px" />
      </div>
      <q-form @submit="onSubmit" @reset="onReset" class="q-gutter-md">
        <q-input
          bg-color="grey-5"
          rounded
          standout
          v-model="email"
          type="email"
           required lazy-rules
          :rules="[ val => !!val || 'Email é obrigatório', val => /.+@.+\..+/.test(val) || 'Email inválido']"
          label="Digite seu email*"
        />
        <q-input
          bg-color="grey-5"
          rounded
          standout
          type="password"
          v-model="password"
          label="Digite sua senha*"
          lazy-rules
          :rules="[
            val => val && val.length > 0 || 'Por favor, digite sua senha',
            val => val.length >= 6 || 'A senha deve ter pelo menos 6 caracteres'
          ]"
        />
        <div class="btn-form">
          <q-btn
            rounded
            label="Confirmar"
            type="submit"
            style="font-size: 14px; padding: 10px 20px; background-color: #220127; color: white;"
          />
        </div>

      <div class="link-text">
        <router-link to="/reset-password" class="link">Esqueceu a senha?</router-link>
      </div>
      </q-form>
    </div>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import EssentialLink from 'components/EssentialLink.vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import { onMounted } from 'vue';

const $q = useQuasar()

const email = ref(null)
const password = ref(null)
const drawer = ref(false)
const miniSidebar = ref(false)
const token = ref(localStorage.getItem('authToken'))

onMounted(() => {
  const token = localStorage.getItem('authToken');
  const name = localStorage.getItem('name');
  const role = localStorage.getItem('role');

  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  console.log('Role recuperado do localStorage:', role);
  console.log('Nome recuperado do localStorage:', name);

  user.value.role = formatRole(role);
  user.value.name = formatRole(name);
});

function formatRole(role) {
  const roleMap = {
    'ADMIN': 'Administrador',
    'USER': 'Locatário'
  };
  return roleMap[role] || role;
}

const user = ref({name:'', role:''});


const linksList = [
  {
    title: 'Dashboard',
    caption: 'quasar.dev',
    icon: 'dashboard',
    route: { name: 'dashboard' }
  },
  {
    title: 'Biblioteca',
    caption: 'github.com/quasarframework',
    icon: 'local_library',
    route: { name: 'biblioteca' }
  },
  {
    title: 'Aluguéis',
    caption: 'chat.quasar.dev',
    icon: 'sell',
    route: { name: 'aluguel' }
  },
  {
    title: 'Usuários',
    caption: 'forum.quasar.dev',
    icon: 'group',
    route: { name: 'usuario' }
  },
  {
    title: 'Locatários',
    icon: 'person',
    route: { name: 'locatarioteste' }
  },
  {
    title: 'Editoras',
    icon: 'edit',
    route: { name: 'editora' }
  }
]

function toggleSidebar() {
  miniSidebar.value = !miniSidebar.value
}

function onSubmit() {
  if (email.value && password.value) {
    api.post("/auth/login", {
      email: email.value,
      password: password.value
    })
    .then(response => {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('role', response.data.role);
      localStorage.setItem('name', response.data.name);
      token.value = response.data.token;
      email.value = null;
      password.value = null;
      window.location.reload();
    })
    .catch(error => {
      showNotification('negative', 'Algo deu errado! Tente novamente.');
    })
  } else {
    showNotification('negative', 'Preencha os campos corretamente.');
  }
}

function onReset() {
  email.value = null
  password.value = null
}

function logout() {
  localStorage.removeItem('authToken');
  token.value = null;
  window.location.reload();
}

function showNotification(color, message) {
  $q.notify({
    color: color,
    message: message,
    position: 'top',
    timeout: 3000
  })
}
</script>

<style scoped>
.transparent-header {
  background: transparent;
  box-shadow: none !important;
}
.transparent-toolbar {
  box-shadow: none !important;
}
.space {
  height: 150px;
}
.centered-layout {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
.form-container {
  width: 100%;
  max-width: 500px;
  padding: 2em;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
}
.form-title {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30px;
}
.btn-form {
  display: flex;
  align-items: center;
  justify-content: center;
}
.q-drawer {
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.link-text{
  display: flex;
  justify-content: center;
  align-items: center;
  text-decoration: none;

}
</style>
