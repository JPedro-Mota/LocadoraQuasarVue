<template>
  <q-layout class="centered-layout">
    <div class="form-container q-pa-md">
      <div class="form-title">
        <img src="../assets/altislab.png" alt="AltisLab Logo" width="200px" />
      </div>
      <q-form @submit="onSubmitEmailTokenAndPassword" class="q-gutter-md">
        <q-input
          bg-color="grey-5"
          rounded
          standout
          v-model="email"
          label="Digite seu email*"
          type="email"
          lazy-rules
          :rules="[val => val && val.includes('@') || 'Por favor, digite um email válido']"
        />
        <q-input
          bg-color="grey-5"
          rounded
          standout
          v-model="tokenInput"
          label="Digite o token*"
          lazy-rules
          :rules="[val => !!val || 'O token é obrigatório']"
        />
        <q-input
          bg-color="grey-5"
          rounded
          standout
          v-model="newPassword"
          type="password"
          label="Digite sua nova senha*"
          lazy-rules
          :rules="[val => val && val.length >= 6 || 'A senha deve ter pelo menos 6 caracteres']"
        />
        <div class="btn-form">
          <q-btn
            rounded
            label="Alterar Senha"
            type="submit"
            style="font-size: 14px; padding: 10px 20px; background-color: #220127; color: white;"
          />
        </div>
      </q-form>
    </div>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import { useRouter } from 'vue-router'

const $q = useQuasar()
const router = useRouter()

const email = ref(null)
const tokenInput = ref(null)
const newPassword = ref(null)

function onSubmitEmailTokenAndPassword() {
  if (email.value && tokenInput.value && newPassword.value) {
    api.post("/api/reset-password", {
      email: email.value,
      token: tokenInput.value,
      newPassword: newPassword.value
    })
      .then(response => {
        router.push({ name: 'login' });
        showNotification('positive', 'Senha alterada com sucesso.');
      })
      .catch(error => {
        showNotification('negative', 'Token inválido ou erro ao alterar a senha. Tente novamente.');
      });
  } else {
    showNotification('negative', 'Por favor, preencha todos os campos corretamente.');
  }
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
</style>
