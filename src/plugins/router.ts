import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/utils/firebase'

const ListGroups = () => import('../views/ListGroups.vue')
const ListTasks = () => import('../views/ListTasks.vue')
const TheSign = () => import('../views/TheSign.vue')
const TheError = () => import('../views/TheError.vue')

// const TestTools = () => import('@/views/TestTools.vue');

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'groups',
    component: ListGroups
  },
  {
    path: '/:id',
    name: 'tasks',
    component: ListTasks
  },
  {
    path: '/sign',
    name: 'sign',
    component: TheSign
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'error',
    component: TheError
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from) => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      return true
    } else return { name: 'sign' }
  })
})

router.onError(() => {
  router.replace('/error')
})

export default router
