<template>
  <div class="page">
    <div class="schedule-head">
      <div>
        <span class="eyebrow">
          <i /> BRACKET & MATCHES
        </span>
        <h2>
          JADWAL <em>PERTANDINGAN</em>
        </h2>
        <p>Semua jadwal dan hasil pertandingan sinkron dari database backend.</p>
      </div>
      <div class="tournament-select">
        <span>PILIH TURNAMEN</span>
        <select
          v-model="selectedTournament"
          class="input"
          style="width: 240px;"
        >
          <option v-for="t in tournaments" :key="t.id" :value="t.name">
            {{ t.name }}
          </option>
        </select>
      </div>
    </div>

    <section class="match-day" style="margin-top: 24px;">
      <SectionTitle
        :kicker="selectedTournament ? selectedTournament.toUpperCase() : 'TURNAMEN'"
        :title="`Jadwal Pertandingan (${matches.length} Match)`"
      />
      <p v-if="loading" style="padding: 20px; color: var(--muted);">
        Memuat jadwal pertandingan...
      </p>
      <div v-else-if="matches.length > 0" class="matches">
        <article
          v-for="m in matches"
          :key="m.id"
          class="match-card"
        >
          <div class="match-time">
            <strong>{{ m.schedule_time ? m.schedule_time.slice(11, 16) : 'TBD' }}</strong>
            <span>{{ m.schedule_time ? m.schedule_time.slice(0, 10) : 'WIB' }}</span>
            <StatusBadge v-if="m.winner_name" tone="blue">WIN: {{ m.winner_name }}</StatusBadge>
            <StatusBadge v-else tone="orange">{{ m.status || 'Scheduled' }}</StatusBadge>
          </div>
          <div class="match-main">
            <div class="match-id">
              <span>MATCH #{{ m.id }}</span>
              <small>Ronde {{ m.round_number }}</small>
            </div>
            <div class="versus">
              <div>
                <strong :style="{ color: m.winner_name === m.team1_name ? 'var(--lime)' : 'inherit' }">
                  {{ m.team1_name }}
                </strong>
                <span class="mini-badge">{{ m.team1_name.slice(0, 2).toUpperCase() }}</span>
              </div>
              <b>VS</b>
              <div>
                <span class="mini-badge alt">{{ m.team2_name.slice(0, 2).toUpperCase() }}</span>
                <strong :style="{ color: m.winner_name === m.team2_name ? 'var(--lime)' : 'inherit' }">
                  {{ m.team2_name }}
                </strong>
              </div>
            </div>
          </div>
        </article>
      </div>
      <div v-else class="empty-state">
        <div>
          <AppIcon name="calendar" :size="32" />
        </div>
        <h3>Belum ada jadwal pertandingan</h3>
        <p>Admin dapat membuat jadwal pertandingan baru melalui menu Control Center Admin.</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { api, ApiTournament, ApiMatch } from '../api'
import AppIcon from '../components/AppIcon.vue'
import SectionTitle from '../components/SectionTitle.vue'
import StatusBadge from '../components/StatusBadge.vue'

const tournaments = ref<ApiTournament[]>([])
const selectedTournament = ref<string>('')
const matches = ref<ApiMatch[]>([])
const loading = ref(false)

const loadMatches = async (tourneyName: string) => {
  if (!tourneyName) return
  loading.value = true
  const res = await api.getTournamentMatches(tourneyName)
  loading.value = false
  if (res.ok && res.data) {
    matches.value = res.data
  } else {
    matches.value = []
  }
}

watch(selectedTournament, (newVal) => {
  if (newVal) loadMatches(newVal)
})

onMounted(async () => {
  const res = await api.getTournaments()
  if (res.ok && res.data && res.data.length > 0) {
    tournaments.value = res.data
    selectedTournament.value = res.data[0].name
  }
})
</script>
