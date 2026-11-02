import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import DashboardView from './views/DashboardView.vue'
import ProfileView from './views/ProfileView.vue'
import TeamView from './views/TeamView.vue'
import TournamentView from './views/TournamentView.vue'
import ScheduleView from './views/ScheduleView.vue'
import AdminView from './views/AdminView.vue'
import AuthView from './views/AuthView.vue'
import ScreenGalleryView from './views/ScreenGalleryView.vue'

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'dashboard', component: DashboardView, meta: { title: 'Dashboard Player' } },
  { path: '/profile', name: 'profile', component: ProfileView, meta: { title: 'Profil Player & Statistik' } },
  { path: '/teams', name: 'teams', component: TeamView, meta: { title: 'Detail Tim' } },
  { path: '/tournaments', name: 'tournaments', component: TournamentView, meta: { title: 'Detail Turnamen' } },
  { path: '/schedule', name: 'schedule', component: ScheduleView, meta: { title: 'Jadwal Pertandingan' } },
  { path: '/admin', name: 'admin', component: AdminView, meta: { title: 'Dashboard Admin' } },
  { path: '/login', name: 'login', component: AuthView, meta: { title: 'Masuk' } },
  { path: '/register', name: 'register', component: AuthView, meta: { title: 'Daftar' } },
  { path: '/screens', name: 'screens', component: ScreenGalleryView, meta: { title: 'Screen Gallery' } },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
