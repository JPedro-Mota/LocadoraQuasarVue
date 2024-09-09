<template>
  <q-layout class="centered-layout">
    <div class="form-container q-pa-md">
      <div class="form-title">
        <img src="../assets/altislab.png" alt="AltisLab Logo" width="200px" />
      </div>
      <q-form @submit="onSubmitEmail" class="q-gutter-md">
        <p style="display: flex; justify-content: center; font-size: 15px;">Será enviado um código de recuperação para o seu e-mail</p>
        <q-input
          bg-color="grey-5"
          rounded
          standout
          v-model="email"
          label="Digite seu email*"
          lazy-rules
          :rules="[val => val && val.includes('@') || 'Por favor, digite um email válido']"
        />
        <div class="btn-form">
          <q-btn
            rounded
            label="Confirmar Email"
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
const router = useRouter() // Certifique-se de importar e usar o useRouter corretamente
const email = ref(null)

function onSubmitEmail() {
  if (email.value) {
    api.post("/api/forgot", { email: email.value })
      .then(response => {
        if (response.status === 200) { // Verifique se a resposta é bem-sucedida
          router.push({ name: 'recovery-password' }) // Navegue para a página de recuperação
          showNotification('positive', 'Código de recuperação enviado para o email.')
        } else {
          showNotification('negative', 'Erro ao enviar código de recuperação. Tente novamente.')
        }
      })
      .catch(error => {
        showNotification('negative', 'Algo deu errado! Tente novamente.')
      })
  } else {
    showNotification('negative', 'Por favor, preencha o campo de email corretamente.')
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
