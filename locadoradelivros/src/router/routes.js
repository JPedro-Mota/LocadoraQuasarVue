const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') }
    ]
  },

  {
    path: '/dashboard',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', name:'dashboard', component: () => import('pages/IndexPage.vue') }
    ]
  },

  {
    path: '/biblioteca',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', name:'biblioteca', component: () => import('pages/BibliotecaPage.vue') }
    ]
  },

  {
    path: '/aluguel',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', name:'aluguel', component: () => import('pages/AluguelPage.vue') }
    ]
  },

  {
    path: '/usuario',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', name:'usuario', component: () => import('pages/UsuarioPage.vue') }
    ]
  },

  {
    path: '/editora',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', name: 'editora', component: () => import('pages/EditorasPage.vue') }
    ]
  },

  {
    path: '/locatario',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', name: 'locatarioteste', component: () => import('pages/LocatariosPage.vue') }
    ]
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
