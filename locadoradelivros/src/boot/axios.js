import { boot } from 'quasar/wrappers'
import axios from 'axios'


const api = axios.create({ baseURL: 'https://livraria-api.altislabtech.com.br' })
const authenticate = () => {
  return api.post('/auth/login', {
    username: 'admin',
    password: '12345678'
  })
  .then(response => {
    const token = response.data.token;
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
