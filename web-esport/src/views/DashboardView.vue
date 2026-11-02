<template>
  <div class="page dashboard-page">
    <section class="welcome-banner">
      <div class="banner-grid" />
      <div class="welcome-copy">
        <span class="eyebrow">
          <i /> PLAYER HUB {{ auth.role === 'admin' ? '(ADMIN)' : '' }}
        </span>
        <h2>
          SELAMAT DATANG, <em>{{ username.toUpperCase() }}.</em>
        </h2>
        <p>Kelola tim dan turnamen secara real-time langsung melalui Rust backend API.</p>
        <div class="banner-actions">
          <button class="btn primary" @click="router.push('/tournaments')">
            Jelajahi Turnamen <AppIcon name="arrow" :size="18" />
          </button>
          <button class="btn ghost" @click="router.push('/teams')">
            Kelola Tim
          </button>
        </div>
      </div>
      <div class="rank-card">
        <span class="rank-label">STATUS KOMPETITIF</span>
        <div class="rank-emblem">
          <AppIcon name="shield" :size="48" />
          <b>{{ Math.max(1, Math.floor(mmr / 500)) }}</b>
        </div>
        <strong class="rank-title">{{ tierTitle }}</strong>
        <div class="rank-meta-row">
          <span>Rating MMR</span>
          <b>{{ mmr }} PTS</b>
        </div>
        <div class="progress">
          <i :style="{ width: `${Math.min(100, (mmr / 2500) * 100)}%` }" />
        </div>
        <small class="rank-sub">Target Tier Berikutnya: 2,500 MMR</small>
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

    <div class="dashboard-columns">
      <section>
        <SectionTitle kicker="REAL-TIME" title="Turnamen Terdaftar di API">
          <template #action>
            <button class="text-btn" @click="router.push('/tournaments')">
              Lihat Semua <AppIcon name="arrow" :size="15" />
            </button>
          </template>
        </SectionTitle>
        <div v-if="tournaments.length > 0">
          <button
            v-for="t in tournaments.slice(0, 3)"
            :key="t.id"
            class="tournament-row"
            @click="router.push('/tournaments')"
          >
            <img :src="photos.arena" alt="" />
            <span class="date-block">
              <b>ID</b>
              <small>#{{ t.id }}</small>
            </span>
            <span class="row-copy">
              <strong>{{ t.name }}</strong>
              <small>Max {{ t.total_slots }} Tim • {{ t.available_slots }} Slot Tersisa</small>
            </span>
            <StatusBadge :tone="(t.status || 'open').includes('buka') ? 'purple' : 'green'">
              {{ t.status || 'open' }}
            </StatusBadge>
            <AppIcon name="chevron" :size="18" />
          </button>
        </div>
        <div v-else class="empty-state" style="padding: 20px;">
          <p>Belum ada turnamen di database Rust. Buat baru di halaman Admin.</p>
        </div>
      </section>

      <section>
        <SectionTitle kicker="TEAMS DIRECTORY" title="Daftar Tim Terdaftar" />
        <div class="activity-card">
          <div
            v-for="(tm, i) in teams.slice(0, 4)"
            :key="tm.id"
            class="activity"
          >
            <span :class="`activity-icon a${i % 3}`">
              <AppIcon name="users" :size="17" />
            </span>
            <div>
              <strong>{{ tm.name }}</strong>
              <p>Kapten: {{ tm.captain_username }} • {{ tm.member_count }} Anggota</p>
              <small>ID #{{ tm.id }}</small>
            </div>
          </div>
          <p v-if="teams.length === 0" style="padding: 20px; color: var(--muted);">
            Belum ada tim yang terdaftar.
          </p>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api, getStoredAuth, ApiTournament, ApiTeamSummary, UserProfile } from '../api'
import AppIcon, { IconName } from '../components/AppIcon.vue'
import SectionTitle from '../components/SectionTitle.vue'
import StatusBadge from '../components/StatusBadge.vue'

const router = useRouter()
const profile = ref<UserProfile | null>(null)
const tournaments = ref<ApiTournament[]>([])
const teams = ref<ApiTeamSummary[]>([])
const auth = ref(getStoredAuth())

const photos = {
  arena: "https://images.unsplash.com/photo-1633545495735-25df17fb9f31?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=1600",
}

const username = computed(() => profile.value?.username || auth.value.username || 'Player')
const mmr = computed(() => profile.value?.mmr_point ?? 1000)
const tierTitle = computed(() => {
  const m = mmr.value
  if (m >= 2200) return 'CHALLENGER'
  if (m >= 1900) return 'MASTER'
  if (m >= 1500) return 'DIAMOND'
  return 'GOLD'
})

const stats = computed<{ label: string; value: string; meta: string; icon: IconName }[]>(() => [
  { label: 'Turnamen Aktif', value: String(tournaments.value.length), meta: 'Tersedia di Rust API', icon: 'trophy' },
  { label: 'Tim Terdaftar', value: String(teams.value.length), meta: 'Di seluruh liga', icon: 'users' },
  { label: 'Status Akun', value: auth.value.role === 'admin' ? 'ADMINISTRATOR' : 'VERIFIED PLAYER', meta: auth.value.username ? 'Online' : 'Guest', icon: 'shield' },
  { label: 'MMR Point', value: String(mmr.value), meta: '#Regional Rank', icon: 'bolt' },
])

onMounted(async () => {
  auth.value = getStoredAuth()
  if (auth.value.username) {
    const res = await api.getProfileByUsername(auth.value.username)
    if (res.ok && res.data) profile.value = res.data
  }
  const tourneyRes = await api.getTournaments()
  if (tourneyRes.ok && tourneyRes.data) tournaments.value = tourneyRes.data

  const teamRes = await api.getTeams()
  if (teamRes.ok && teamRes.data) teams.value = teamRes.data
})
</script>
