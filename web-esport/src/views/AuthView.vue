<template>
  <main class="auth-page">
    <section
      class="auth-visual"
      :style="{ backgroundImage: `url(${photos.players})` }"
    >
      <div class="auth-overlay" />
      <div class="auth-logo">
        <button class="logo" @click="router.push('/')" aria-label="Arena Core, kembali ke dashboard">
          <span class="logo-mark">
            <AppIcon name="bolt" :size="22" />
          </span>
          <span>
            ARENA<span>CORE</span>
          </span>
        </button>
      </div>
      <div class="auth-quote">
        <span class="eyebrow">
          <i /> ENTER THE ARENA
        </span>
        <h1>
          BUILD YOUR TEAM.
          <br />
          CLAIM YOUR <em>GLORY.</em>
        </h1>
        <p>
          Satu platform untuk berkompetisi, berkembang, dan menjadi legenda
          esports berikutnya.
        </p>
        <div class="auth-stats">
          <div>
            <strong>12K+</strong>
            <span>PLAYERS</span>
          </div>
          <div>
            <strong>480+</strong>
            <span>TOURNAMENTS</span>
          </div>
          <div>
            <strong>2.4B</strong>
            <span>PRIZE POOL</span>
          </div>
        </div>
      </div>
      <small class="photo-credit">Foto oleh ELLA DON / Unsplash</small>
    </section>

    <section class="auth-form-wrap">
      <div class="auth-mobile-logo">
        <button class="logo" @click="router.push('/')">
          <span class="logo-mark">
            <AppIcon name="bolt" :size="22" />
          </span>
          <span>
            ARENA<span>CORE</span>
          </span>
        </button>
      </div>
      <div class="auth-form">
        <span class="eyebrow">
          <i /> PLAYER ACCESS
        </span>
        <h2>{{ isRegister ? 'BUAT AKUN BARU' : 'SELAMAT DATANG' }}</h2>
        <p>
          {{ isRegister
            ? 'Daftar dan mulai perjalanan kompetitifmu.'
            : 'Masuk untuk melanjutkan perjalananmu di arena.' }}
        </p>
        <div class="auth-tabs">
          <button
            :class="{ active: !isRegister }"
            @click="isRegister = false"
          >
            MASUK
          </button>
          <button
            :class="{ active: isRegister }"
            @click="isRegister = true"
          >
            DAFTAR
          </button>
        </div>
        <form @submit.prevent="handleSubmit">
          <div
            v-if="errorMsg"
            style="padding: 10px 14px; background: rgba(255, 118, 87, 0.15); border: 1px solid var(--orange); border-radius: 4px; color: var(--orange); margin-bottom: 16px; fontSize: 12px;"
          >
            {{ errorMsg }}
          </div>
          <label class="field-label" for="username">
            USERNAME (3-32 KARAKTER: HURUF, ANGKA, _ ATAU -)
          </label>
          <div class="input-icon">
            <AppIcon name="user" />
            <input
              id="username"
              v-model="username"
              required
              :minlength="3"
              :maxlength="32"
              placeholder="Contoh: player_satu"
            />
          </div>
          <div class="label-row">
            <label class="field-label" for="password">
              PASSWORD (MINIMAL 6 KARAKTER)
            </label>
            <button v-if="!isRegister" type="button">Lupa password?</button>
          </div>
          <div class="input-icon">
            <AppIcon name="lock" />
            <input
              id="password"
              v-model="password"
              type="password"
              required
              :minlength="6"
              placeholder="••••••••••••"
            />
          </div>
          <label v-if="isRegister" class="terms">
            <input type="checkbox" required />
            <span>
              Saya menyetujui <a href="#">Syarat Layanan</a> dan
              <a href="#">Kebijakan Privasi</a>.
            </span>
          </label>
          <button
            class="btn primary full auth-submit"
            type="submit"
            :disabled="loading"
          >
            {{ loading ? 'Memproses...' : isRegister ? 'Buat Akun' : 'Masuk ke Arena' }} <AppIcon name="arrow" />
          </button>
        </form>
        <div class="divider">
          <span>ATAU LANJUTKAN DENGAN</span>
        </div>
        <button class="social-btn" @click="handleGuestLogin">
          <span>G</span> Google
        </button>
        <p class="switch-auth">
          {{ isRegister ? 'Sudah punya akun?' : 'Belum punya akun?' }}
          <button @click="isRegister = !isRegister">
            {{ isRegister ? 'Masuk sekarang' : 'Daftar gratis' }}
          </button>
        </p>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { api, setStoredAuth } from '../api'
import AppIcon from '../components/AppIcon.vue'

const emit = defineEmits<{
  (e: 'login-success', username: string, role: string): void
}>()

const router = useRouter()
const route = useRoute()

const photos = {
  players: "https://images.unsplash.com/photo-1633545491399-54a16aa6a871?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=1200",
}

const isRegister = ref(route.path === '/register')
const username = ref('')
const password = ref('')
const errorMsg = ref('')
const loading = ref(false)

onMounted(() => {
  if (route.path === '/register') {
    isRegister.value = true
  }
})

const handleSubmit = async () => {
  errorMsg.value = ''
  loading.value = true

  if (isRegister.value) {
    const res = await api.register(username.value, password.value)
    if (!res.ok) {
      errorMsg.value = res.message || 'Gagal registrasi akun'
      loading.value = false
      return
    }
    const loginRes = await api.login(username.value, password.value)
    loading.value = false
    if (loginRes.ok && loginRes.data) {
      setStoredAuth(loginRes.data.access_token, username.value, loginRes.data.user?.role || 'user')
      emit('login-success', username.value, loginRes.data.user?.role || 'user')
      router.push('/')
    } else {
      isRegister.value = false
      errorMsg.value = 'Registrasi sukses! Silakan login.'
    }
  } else {
    const res = await api.login(username.value, password.value)
    loading.value = false
    if (!res.ok || !res.data) {
      errorMsg.value = res.message || 'Username atau password salah'
      return
    }
    const role = res.data.user?.role || 'user'
    setStoredAuth(res.data.access_token, username.value, role)
    emit('login-success', username.value, role)
    router.push('/')
  }
}

const handleGuestLogin = () => {
  setStoredAuth('dummy_token', 'GuestPlayer', 'user')
  emit('login-success', 'GuestPlayer', 'user')
  router.push('/')
}
</script>
