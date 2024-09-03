import { boot } from 'quasar/wrappers'
import axios from 'axios'


const api = axios.create({
  baseURL: 'http://localhost:8040',
  headers: {
    "Content-Type": "application/json"
  }
});

const token = localStorage.getItem('authToken');
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

const authenticate = (username, password) => {
  return api.post('/auth/login', {
    username: username,
    password: password
  })
  .then(response => {
    const token = response.data.token;
    if (token)
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  })
  .catch(error => {
    console.error('Erro na autenticação:', error);
    throw error;
  });
}

export default boot(({ app }) => {
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;
  app.config.globalProperties.$authenticate = authenticate;
});

export { api, authenticate };
