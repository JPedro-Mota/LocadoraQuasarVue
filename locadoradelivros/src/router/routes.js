const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', name:'login', component: () => import('pages/IndexPage.vue') }
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
      path: '/reset-password',
      name: 'reset-password',
      component: () => import('pages/ResetPasswordPage.vue')
    },

    {
      path: '/recovery-password',
      name: 'recovery-password',
      component: () => import('pages/RecoveryPasswordPage.vue')
    },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
