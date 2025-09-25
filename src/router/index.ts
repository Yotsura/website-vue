import { createRouter, createWebHistory } from 'vue-router'
import { projectAuth } from '../firebase/config'

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
      path: '/',
      redirect: { name: 'gallery' }
    },
    // {
    //   path: '/category', name: 'category',
    //   component: () => import('../views/CategoryView.vue')
    // },
    {
      path: '/gallery', name: 'gallery',
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
