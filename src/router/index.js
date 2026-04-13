import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory('/iller7/'),
  routes: [
    { path: '/', name: 'home', component: () => import('@/views/HomeView.vue') },
    { path: '/dashboard/:subject', name: 'dashboard', component: () => import('@/views/DashboardView.vue') },
    { path: '/quiz', name: 'quiz', component: () => import('@/views/QuizView.vue') },
    { path: '/review', name: 'review', component: () => import('@/views/ReviewView.vue') },
    { path: '/stats', name: 'stats', component: () => import('@/views/StatsView.vue') },
    { path: '/search', name: 'search', component: () => import('@/views/SearchView.vue') },
    { path: '/exam', name: 'exam', component: () => import('@/views/ExamView.vue') },
  ]
})

export default router
