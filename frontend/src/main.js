import { createApp } from 'vue'
import {
  createRouter,
  createWebHistory,
} from 'vue-router'

import App from './App.vue'

import EditView from './views/Edit.vue'
import MainView from './views/Main.vue'

const routes = [
  { path: '/', component: MainView },
  { path: '/assignments/:assignmentId', component: EditView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

const app = createApp(App)

app.use(router)

app.mount('#app')
