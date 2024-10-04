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

const authenticate = (email, password) => {
  return api.post('/auth/login', {
    email: email,
    password: password
  })
  .then(response => {
    const token = response.data.token;
    const name = response.data.name;
    const role = response.data.role;
    const responsee = responsee;
    localStorage.setItem('response', responsee);

    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      localStorage.setItem('authToken', token);
      localStorage.setItem('name', name);
      localStorage.setItem('role', role);

      console.log('Token armazenado:', token);
      console.log('Nome armazenado:', name);
      console.log('Role armazenada:', role);
    }
  })
  .catch(error => {
    console.error('Erro na autenticação:', error);
    throw error;
  });
};

export default boot(({ app }) => {
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;
  app.config.globalProperties.$authenticate = authenticate;
});

export { api, authenticate };
