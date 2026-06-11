import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/index.js'

const routes = [
  { path: '/', name: 'Home', component: () => import('../views/Home.vue') },
  { path: '/login', name: 'Login', component: () => import('../views/Login.vue'), meta: { guestOnly: true } },
  { path: '/register', name: 'Register', component: () => import('../views/Register.vue'), meta: { guestOnly: true } },
  { path: '/profile', name: 'Profile', component: () => import('../views/Profile.vue'), meta: { requiresAuth: true } },
  { path: '/learning-path', name: 'LearningPath', component: () => import('../views/LearningPath.vue'), meta: { requiresAuth: true } },
  { path: '/daily-plan', name: 'DailyPlan', component: () => import('../views/DailyPlan.vue'), meta: { requiresAuth: true } },
  { path: '/knowledge/:chapterId', name: 'Knowledge', component: () => import('../views/Knowledge.vue'), props: true, meta: { requiresAuth: true } },
  { path: '/practice/:chapterId', name: 'Practice', component: () => import('../views/Practice.vue'), props: true, meta: { requiresAuth: true } },
  { path: '/wrong-notebook', name: 'WrongNotebook', component: () => import('../views/WrongNotebook.vue'), meta: { requiresAuth: true } },
  { path: '/game', name: 'Game', component: () => import('../views/Game.vue'), meta: { requiresAuth: true } },
  { path: '/progress', name: 'Progress', component: () => import('../views/Progress.vue'), meta: { requiresAuth: true } },
  { path: '/resources', name: 'Resources', component: () => import('../views/Resources.vue'), meta: { requiresAuth: true } },
  { path: '/mock-exam', name: 'MockExam', component: () => import('../views/MockExam.vue'), meta: { requiresAuth: true } },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: () => import('../views/NotFound.vue') }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0 }
  }
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isLogin) {
    return next({ name: 'Login', query: { redirect: to.fullPath } })
  }
  if (to.meta.guestOnly && auth.isLogin) {
    return next('/')
  }
  next()
})

router.onError((err) => {
  console.error('路由错误：', err)
})

export default router
