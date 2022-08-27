import { createRouter, createWebHistory } from 'vue-router'
import { projectAuth } from '../firebase/config'
import HomeView from '../views/HomeView.vue'

const requireAuth = (to: any, from: any, next: any) => {
  if (!projectAuth.currentUser ) {
    next({ name: 'login' });
  } else {
    next();
  }
}

const requireNoAuth = (to: any, from: any, next: any) => {
  if ( projectAuth.currentUser ) {
    next({ name: 'admin' });
  } else {
    next();
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/', name: 'home',
      component: HomeView
    },
    {
      path: '/event', name: 'event',
      component: () => import('../views/EventView.vue')
    },
    {
      path: '/gallery', name: 'gallery', props: true,
      component: () => import('../views/GalleryView.vue')
    },
    {
      path: '/contact', name: 'contact',
      component: () => import('../views/ContactView.vue')
    },
    {
      path: '/Login', name: 'login',
      component: () => import('../views/LoginView.vue'),
      beforeEnter: requireNoAuth
    },
    {
      path: '/admin', name: 'admin',
      component: () => import('../views/AdminView.vue'),
      beforeEnter: requireAuth
    }
  ]
})

export default router
