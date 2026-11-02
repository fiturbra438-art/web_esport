<template>
  <div class="screen-gallery">
    <div class="gallery-header">
      <div>
        <span>ARENA CORE · DESIGN HANDOFF</span>
        <h1>Screen Gallery</h1>
        <p>
          Pilih satu screen lalu buka dalam ukuran penuh sebelum menggunakan
          Copy to Figma Design. Preview bertingkat dinonaktifkan agar proses
          source resolution tetap cepat.
        </p>
      </div>
      <router-link to="/">
        Buka Aplikasi <AppIcon name="arrow" :size="17" />
      </router-link>
    </div>
    <nav class="gallery-index" aria-label="Daftar screen">
      <a
        v-for="(screen, index) in screens"
        :key="screen.path"
        :href="`#screen-${index + 1}`"
      >
        <span>{{ String(index + 1).padStart(2, '0') }}</span>
        {{ screen.title }}
      </a>
    </nav>
    <div class="gallery-grid">
      <div
        v-for="(screen, index) in screens"
        :id="`screen-${index + 1}`"
        :key="screen.path"
        class="gallery-frame-card"
      >
        <div class="gallery-frame-title">
          <div>
            <span>{{ screen.group }}</span>
            <h2>{{ screen.title }}</h2>
            <code>{{ screen.path }}</code>
          </div>
          <router-link :to="screen.path" target="_blank" rel="noreferrer">
            Buka Full Screen <AppIcon name="arrow" :size="15" />
          </router-link>
        </div>
        <router-link class="gallery-screen-link" :to="screen.path">
          <div :class="`gallery-screen-number gallery-color-${index % 3}`">
            <span>{{ String(index + 1).padStart(2, '0') }}</span>
            <AppIcon :name="screen.icon" :size="30" />
          </div>
          <div>
            <span>{{ screen.group }}</span>
            <strong>{{ screen.title }}</strong>
            <p>{{ screen.description }}</p>
          </div>
          <AppIcon name="arrow" :size="22" />
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppIcon, { IconName } from '../components/AppIcon.vue'

const screens: {
  title: string
  path: string
  group: string
  description: string
  icon: IconName
}[] = [
  {
    title: 'Login',
    path: '/login',
    group: 'Account',
    description: 'Akses player dan admin.',
    icon: 'lock',
  },
  {
    title: 'Register',
    path: '/register',
    group: 'Account',
    description: 'Pendaftaran akun player baru.',
    icon: 'user',
  },
  {
    title: 'Dashboard Player',
    path: '/',
    group: 'Player',
    description: 'Ringkasan rank, statistik, dan aktivitas.',
    icon: 'grid',
  },
  {
    title: 'Tim Player',
    path: '/teams',
    group: 'Player',
    description: 'Hub multi-tim dan pengelolaan roster.',
    icon: 'users',
  },
  {
    title: 'Katalog Turnamen',
    path: '/tournaments',
    group: 'Player',
    description: 'Daftar, filter, dan detail turnamen.',
    icon: 'trophy',
  },
  {
    title: 'Jadwal Pertandingan',
    path: '/schedule',
    group: 'Player',
    description: 'Jadwal pertandingan per tanggal.',
    icon: 'calendar',
  },
  {
    title: 'Admin Control Center',
    path: '/admin',
    group: 'Admin',
    description: 'Turnamen, tim peserta, dan jadwal admin.',
    icon: 'shield',
  },
]
</script>
