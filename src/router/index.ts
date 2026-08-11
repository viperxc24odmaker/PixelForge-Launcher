import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import Home from '@/views/Home.vue'
import Instances from '@/views/Instances.vue'
import Mods from '@/views/Mods.vue'
import Settings from '@/views/Settings.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/instances',
    name: 'Instances',
    component: Instances
  },
  {
    path: '/mods',
    name: 'Mods',
    component: Mods
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
