import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import(/* webpackChunkName: "home" */ '../views/home/Home.vue')
  },
  {
    path: '/registerAndLogin',
    name: 'RegisterAndLogin',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "registerAndLogin" */ '../views/registerAndLogin/RegisterAndLogin.vue')
  },
  {
    path: '/resetPass',
    name: 'ResetPass',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "resetPass" */ '../views/registerAndLogin/ResetPass.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
