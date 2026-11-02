<template>
  <!-- AUTH VIEWS -->
  <router-view
    v-if="isAuthRoute"
    @login-success="handleLoginSuccess"
  />

  <!-- SCREEN GALLERY -->
  <router-view v-else-if="route.path === '/screens'" />

  <!-- ADMIN SHELL -->
  <div v-else-if="route.path === '/admin'" class="app-shell admin-shell">
    <div class="main-shell">
      <header class="topbar admin-topbar">
        <div class="admin-header-brand">
          <button class="logo" @click="router.push('/')" aria-label="Arena Core, kembali ke dashboard">
            <span class="logo-mark">
              <AppIcon name="bolt" :size="22" />
            </span>
            <span>
              ARENA<span>CORE</span>
            </span>
          </button>
          <span class="admin-header-divider" />
          <div>
            <span class="top-kicker">ADMIN WORKSPACE / OVERVIEW</span>
            <h1>Control Center</h1>
          </div>
        </div>
        <div class="top-actions">
          <label class="search">
            <AppIcon name="search" :size="17" />
            <input aria-label="Cari data admin" placeholder="Cari tim, match, ID..." />
            <kbd>⌘ K</kbd>
          </label>
          <span class="system-status">
            <i /> ALL SYSTEMS OPERATIONAL
          </span>
          <button class="icon-btn notification" aria-label="Notifikasi admin">
            <AppIcon name="bell" :size="19" />
            <i />
          </button>
          <button class="icon-btn" aria-label="Keluar" @click="logout">
            <AppIcon name="logOut" :size="18" />
          </button>
        </div>
      </header>
      <main>
        <router-view @toast="showToast" />
      </main>
    </div>

    <!-- TOAST -->
    <div v-if="toastMessage" class="toast" role="status">
      <span>
        <AppIcon name="check" :size="16" />
      </span>
      {{ toastMessage }}
    </div>
  </div>

  <!-- REGULAR APP SHELL -->
  <div v-else class="app-shell">
    <!-- SIDEBAR BACKDROP -->
    <button
      v-if="mobileNav"
      class="sidebar-backdrop"
      aria-label="Tutup navigasi"
      @click="mobileNav = false"
    />

    <!-- SIDEBAR -->
    <aside :class="['sidebar', { open: mobileNav }]">
      <div class="sidebar-head">
        <button class="logo" @click="router.push('/')" aria-label="Arena Core, kembali ke dashboard">
          <span class="logo-mark">
            <AppIcon name="bolt" :size="22" />
          </span>
          <span>
            ARENA<span>CORE</span>
          </span>
        </button>
        <button
          class="icon-btn close-mobile"
          aria-label="Tutup menu"
          @click="mobileNav = false"
        >
          <AppIcon name="close" />
        </button>
      </div>

      <div class="season-card">
        <span class="eyebrow">
          <i /> SEASON 08
        </span>
        <strong>RISE TO GLORY</strong>
        <div>
          <span>Berakhir 24 hari lagi</span>
          <b>68%</b>
        </div>
        <div class="progress">
          <i style="width: 68%;" />
        </div>
      </div>

      <nav aria-label="Navigasi utama">
        <p>MENU UTAMA</p>
        <button
          v-for="item in navItems"
          :key="item.path"
          :class="{ active: route.path === item.path }"
          @click="navigateTo(item.path)"
        >
          <AppIcon :name="item.icon" />
          <span>{{ item.label }}</span>
          <em v-if="item.path === '/schedule'">3</em>
        </button>

        <button
          v-if="currentRole === 'admin'"
          :class="{ active: route.path === '/admin' }"
          @click="navigateTo('/admin')"
        >
          <AppIcon name="shield" />
          <span>Admin Center</span>
        </button>
      </nav>

      <div class="sidebar-user">
        <div class="avatar">{{ currentUser.slice(0, 2).toUpperCase() }}</div>
        <div>
          <strong>{{ currentUser }}</strong>
          <span>
            <i /> Online
          </span>
        </div>
        <button aria-label="Keluar" @click="logout">
          <AppIcon name="logOut" :size="18" />
        </button>
      </div>
    </aside>

    <!-- MAIN SHELL -->
    <div class="main-shell">
      <header class="topbar">
        <div>
          <button
            class="icon-btn menu-btn"
            aria-label="Buka menu"
            @click="mobileNav = true"
          >
            <AppIcon name="menu" />
          </button>
          <div>
            <span class="top-kicker">ARENA CORE /</span>
            <h1>{{ pageTitle }}</h1>
          </div>
        </div>
        <div class="top-actions">
          <button class="icon-btn notification" aria-label="Notifikasi">
            <AppIcon name="bell" :size="19" />
            <i />
          </button>
        </div>
      </header>
      <main>
        <router-view
          @toast="showToast"
          @open-update-username="editUsernameOpen = true"
        />
      </main>
    </div>

    <!-- MODAL EDIT USERNAME -->
    <ModalDialog
      v-if="editUsernameOpen"
      title="Ubah Username Akun"
      @close="editUsernameOpen = false"
    >
      <form @submit.prevent="handleUpdateUsernameSubmit">
        <p class="modal-copy">
          Ubah username akun Anda saat ini. Perubahan akan disimpan secara permanen di database backend.
        </p>
        <label class="field-label">USERNAME BARU</label>
        <input
          v-model="newUsernameVal"
          class="input"
          required
          :minlength="3"
          placeholder="Masukkan username baru..."
        />
        <button class="btn primary full" type="submit" style="margin-top: 16px;">
          Simpan Username Baru <AppIcon name="check" />
        </button>
      </form>
    </ModalDialog>

    <!-- TOAST -->
    <div v-if="toastMessage" class="toast" role="status">
      <span>
        <AppIcon name="check" :size="16" />
      </span>
      {{ toastMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api, getStoredAuth, setStoredAuth, clearStoredAuth } from './api'
import AppIcon, { IconName } from './components/AppIcon.vue'
import ModalDialog from './components/ModalDialog.vue'

const route = useRoute()
const router = useRouter()

const navItems: { path: string; label: string; icon: IconName }[] = [
  { path: '/', label: 'Dashboard', icon: 'grid' },
  { path: '/profile', label: 'Profil Saya', icon: 'user' },
  { path: '/teams', label: 'Tim Saya', icon: 'users' },
  { path: '/tournaments', label: 'Turnamen', icon: 'trophy' },
  { path: '/schedule', label: 'Jadwal', icon: 'calendar' },
]

const currentUser = ref('Player')
const currentRole = ref('user')
const mobileNav = ref(false)
const toastMessage = ref('')
const editUsernameOpen = ref(false)
const newUsernameVal = ref('')

const isAuthRoute = computed(() => route.path === '/login' || route.path === '/register')

const pageTitle = computed(() => (route.meta?.title as string) || 'Dashboard Player')

const showToast = (text: string) => {
  toastMessage.value = text
  window.setTimeout(() => {
    toastMessage.value = ''
  }, 2800)
}

const syncAuth = () => {
  const auth = getStoredAuth()
  currentUser.value = auth.username || 'Player'
  currentRole.value = auth.role || 'user'
}

onMounted(() => {
  syncAuth()
})

const navigateTo = (path: string) => {
  router.push(path)
  mobileNav.value = false
}

const handleLoginSuccess = (user: string, role: string) => {
  currentUser.value = user
  currentRole.value = role
  showToast(`Selamat datang, ${user}!`)
}

const logout = () => {
  clearStoredAuth()
  currentUser.value = 'Player'
  currentRole.value = 'user'
  router.push('/login')
  showToast('Berhasil keluar dari akun')
}

const handleUpdateUsernameSubmit = async () => {
  if (!newUsernameVal.value.trim()) return
  const res = await api.updateUsername(newUsernameVal.value.trim())
  if (res.ok) {
    showToast(`Username berhasil diubah menjadi ${newUsernameVal.value.trim()}!`)
    const auth = getStoredAuth()
    currentUser.value = newUsernameVal.value.trim()
    setStoredAuth(auth.token || '', newUsernameVal.value.trim(), currentRole.value)
    editUsernameOpen.value = false
    newUsernameVal.value = ''
  } else {
    showToast(res.message || 'Gagal mengubah username')
  }
}
</script>
