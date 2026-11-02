<template>
  <div v-if="!auth.username" class="page" style="text-align: center; padding-top: 80px;">
    <div style="max-width: 440px; margin: auto; background: var(--panel); padding: 32px; border: 1px solid var(--line);">
      <AppIcon name="lock" :size="44" />
      <h2 style="margin: 16px 0 8px;">Belum Masuk</h2>
      <p style="color: var(--muted); margin-bottom: 20px;">
        Silakan login untuk melihat dashboard profil dan riwayat kompetisimu.
      </p>
      <button class="btn primary full" @click="router.push('/login')">
        Masuk ke Arena
      </button>
    </div>
  </div>

  <div v-else class="page profile-page">
    <section class="welcome-banner" style="min-height: 220px; margin-bottom: 28px;">
      <div class="banner-grid" />
      <div class="welcome-copy">
        <span class="eyebrow">
          <i /> OFFICIAL PROFILE CARD
        </span>
        <h2>
          {{ profile?.username || auth.username }} <em>#{{ profile?.id || 'ID' }}</em>
        </h2>
        <p>
          Role: <strong>{{ (auth.role || 'user').toUpperCase() }}</strong> • Status: Terverifikasi di Database
        </p>
        <div class="banner-actions" style="margin-top: 18px;">
          <button class="btn primary" @click="emit('open-update-username')">
            <AppIcon name="user" :size="16" /> Ubah Username
          </button>
          <button class="btn ghost" @click="router.push('/teams')">
            Kelola Tim Saya
          </button>
        </div>
      </div>
      <div class="rank-card">
        <span class="rank-label">RANK & TIER RESMI</span>
        <div class="rank-emblem">
          <AppIcon name="shield" :size="48" />
          <b>{{ Math.max(1, Math.floor(mmr / 500)) }}</b>
        </div>
        <strong class="rank-title">{{ tierTitle }} TIER</strong>
        <div class="rank-meta-row">
          <span>Rating Kompetitif</span>
          <b>{{ mmr }} PTS</b>
        </div>
        <div class="progress">
          <i :style="{ width: `${Math.min(100, (mmr / 2500) * 100)}%` }" />
        </div>
        <small class="rank-sub">Maksimal Divisi: Master / Challenger</small>
      </div>
    </section>

    <section class="stats-grid">
      <article
        v-for="(item, i) in stats"
        :key="item.label"
        class="stat-card"
      >
        <div :class="`stat-icon c${i}`">
          <AppIcon :name="item.icon" />
        </div>
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
        <small>{{ item.meta }}</small>
      </article>
    </section>

    <div class="dashboard-columns" style="margin-top: 32px;">
      <section>
        <SectionTitle kicker="CAPTAINCY" title="Tim yang Kamu Pimpin" />
        <div class="roster-list" style="margin-top: 14px;">
          <template v-if="myTeams.length > 0">
            <article
              v-for="(t, idx) in myTeams"
              :key="t.id"
              class="roster-row"
              style="cursor: pointer;"
              @click="router.push('/teams')"
            >
              <div :class="`avatar large av${idx % 4}`">
                {{ t.name.slice(0, 2).toUpperCase() }}
              </div>
              <div class="member-name">
                <strong>{{ t.name }}</strong>
                <small>ID #{{ t.id }} • {{ t.member_count }} Anggota</small>
              </div>
              <div class="member-role">
                <span>ROLE</span>
                <strong>KAPTEN</strong>
              </div>
              <StatusBadge tone="purple">Kapten</StatusBadge>
            </article>
          </template>
          <p v-else style="padding: 20px; color: var(--muted);">
            Kamu belum memimpin tim. Buat tim baru di menu "Tim Saya".
          </p>
        </div>
      </section>

      <aside>
        <SectionTitle kicker="SECURITY" title="Informasi Keamanan Akun" />
        <div class="info-card">
          <div class="info-row">
            <span>Enkripsi Password</span>
            <b>Argon2id Safe</b>
          </div>
          <div class="info-row">
            <span>Otorisasi Session</span>
            <b>JWT Bearer Token</b>
          </div>
          <div class="info-row">
            <span>Masa Berlaku Token</span>
            <b>1 Jam (3600s)</b>
          </div>
          <div class="info-row">
            <span>Status Akun</span>
            <StatusBadge tone="green">Aktif & Aman</StatusBadge>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api, getStoredAuth, ApiTeamSummary, UserProfile } from '../api'
import AppIcon, { IconName } from '../components/AppIcon.vue'
import SectionTitle from '../components/SectionTitle.vue'
import StatusBadge from '../components/StatusBadge.vue'

const emit = defineEmits<{
  (e: 'toast', msg: string): void
  (e: 'open-update-username'): void
}>()

const router = useRouter()
const profile = ref<UserProfile | null>(null)
const myTeams = ref<ApiTeamSummary[]>([])
const auth = ref(getStoredAuth())

const mmr = computed(() => profile.value?.mmr_point ?? 1000)
const tierTitle = computed(() => {
  const m = mmr.value
  if (m >= 2200) return 'CHALLENGER'
  if (m >= 1900) return 'MASTER'
  if (m >= 1500) return 'DIAMOND'
  return 'GOLD'
})

const stats = computed<{ label: string; value: string; meta: string; icon: IconName }[]>(() => [
  { label: 'Player ID', value: `#${profile.value?.id || '-'}`, meta: 'Database Primary Key', icon: 'shield' },
  { label: 'Rating MMR', value: `${mmr.value} PTS`, meta: 'Poin Kompetitif', icon: 'bolt' },
  { label: 'Tim Dipimpin', value: `${myTeams.value.length} Tim`, meta: 'Sebagai Kapten', icon: 'crown' },
  { label: 'Akses Role', value: (auth.value.role || 'user').toUpperCase(), meta: 'Hak akses sistem', icon: 'users' },
])

onMounted(async () => {
  auth.value = getStoredAuth()
  if (auth.value.username) {
    const pRes = await api.getProfileByUsername(auth.value.username)
    if (pRes.ok && pRes.data) profile.value = pRes.data
  }
  const teamsRes = await api.getTeams()
  if (teamsRes.ok && teamsRes.data) {
    myTeams.value = teamsRes.data.filter((t) => t.captain_username === auth.value.username)
  }
})
</script>
