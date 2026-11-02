<template>
  <!-- DETAIL VIEW -->
  <div v-if="selectedTournament" class="page">
    <button class="back-to-catalog" @click="selectedTournament = null">
      <AppIcon name="arrow" :size="17" /> Kembali ke Semua Turnamen
    </button>
    <section class="tournament-hero">
      <img :src="photos.arena" alt="" />
      <div class="hero-shade" />
      <div class="tournament-hero-copy">
        <StatusBadge tone="green">{{ selectedTournament.status || 'open' }}</StatusBadge>
        <span class="event-code">API / ID #{{ selectedTournament.id }}</span>
        <h2>{{ selectedTournament.name }}</h2>
        <p>
          Turnamen resmi terdaftar di database Axum. Daftarkan tim Anda sekarang untuk memperebutkan gelar juara.
        </p>
        <div class="event-meta">
          <span>
            <AppIcon name="trophy" /> {{ selectedTournament.total_slots }} Kuota Tim
          </span>
          <span>
            <AppIcon name="users" /> {{ selectedTournament.available_slots }} Slot Tersedia
          </span>
        </div>
      </div>
    </section>

    <div class="tournament-layout">
      <section>
        <SectionTitle kicker="PARTICIPANTS" :title="`Tim Terdaftar (${registeredTeams.length})`" />
        <div class="roster-list" style="margin-top: 16px;">
          <template v-if="registeredTeams.length > 0">
            <article
              v-for="(team, idx) in registeredTeams"
              :key="team.team_id"
              class="roster-row"
            >
              <div :class="`avatar large av${idx % 4}`">
                {{ team.team_name.slice(0, 2).toUpperCase() }}
              </div>
              <div class="member-name">
                <strong>{{ team.team_name }}</strong>
                <small>Kapten: {{ team.captain_username }}</small>
              </div>
              <div class="member-role">
                <span>TERDAFTAR</span>
                <strong>{{ team.registered_at.slice(0, 10) }}</strong>
              </div>
              <StatusBadge tone="green">Terverifikasi</StatusBadge>
            </article>
          </template>
          <p v-else style="padding: 20px; color: var(--muted);">
            Belum ada tim yang mendaftar ke turnamen ini.
          </p>
        </div>
      </section>

      <aside>
        <div class="register-card">
          <span class="eyebrow">
            <i /> PENDAFTARAN TIM
          </span>
          <div class="slot-count">
            <strong>{{ filledSlots }}</strong>
            <span>
              / {{ selectedTournament.total_slots }}
              <br />
              TIM TERDAFTAR
            </span>
          </div>
          <div class="progress thick">
            <i :style="{ width: `${capacityPercentage}%` }" />
          </div>
          <div class="capacity-label">
            <span>Slot Terisi</span>
            <b>{{ capacityPercentage }}%</b>
          </div>
          <hr />

          <template v-if="myTeams.length > 0">
            <label class="field-label">PILIH TIM ANDA (SEBAGAI KAPTEN)</label>
            <select
              v-model="selectedTeamToRegister"
              class="input"
              style="margin-bottom: 16px;"
            >
              <option value="">-- Pilih Tim --</option>
              <option v-for="t in myTeams" :key="t.id" :value="t.name">
                {{ t.name }}
              </option>
            </select>
            <button
              class="btn primary full"
              :disabled="!selectedTeamToRegister || loading || selectedTournament.available_slots <= 0"
              @click="handleRegisterTeam(selectedTournament.name, selectedTeamToRegister)"
            >
              {{ loading ? 'Mendaftarkan...' : 'Daftarkan Tim Ini' }} <AppIcon name="arrow" />
            </button>
          </template>
          <p v-else style="font-size: 12px; color: var(--muted); margin-bottom: 14px;">
            {{ auth.username
              ? "Anda belum memimpin tim apapun. Buat tim terlebih dahulu di menu 'Tim Saya'."
              : "Silakan login untuk mendaftarkan tim Anda." }}
          </p>

          <button
            class="btn ghost full"
            style="margin-top: 10px;"
            @click="router.push('/schedule')"
          >
            Lihat Jadwal Pertandingan
          </button>
        </div>
      </aside>
    </div>
  </div>

  <!-- BROWSER VIEW -->
  <div v-else class="page tournament-browser">
    <section class="tournament-browser-head">
      <div>
        <span class="eyebrow">
          <i /> COMPETE & GROW
        </span>
        <h2>
          TURNAMEN <em>RESMI ESPORTS.</em>
        </h2>
        <p>
          Daftar turnamen aktif yang disinkronkan secara langsung dari backend database Axum.
        </p>
      </div>
      <div class="browser-total">
        <strong>{{ tournaments.length }}</strong>
        <span>TURNAMEN TERSEDIA</span>
      </div>
    </section>

    <div class="tournament-browser-tools">
      <label class="tournament-search">
        <AppIcon name="search" :size="18" />
        <input
          v-model="searchTournament"
          aria-label="Cari turnamen"
          placeholder="Cari turnamen esport..."
        />
        <button
          v-if="searchTournament"
          aria-label="Hapus pencarian"
          @click="searchTournament = ''"
        >
          <AppIcon name="close" :size="16" />
        </button>
      </label>
    </div>

    <div class="browser-result-head">
      <div>
        <span>TURNAMEN</span>
        <strong>Semua Kompetisi Aktif</strong>
      </div>
      <span>{{ visibleTournaments.length }} HASIL</span>
    </div>

    <div v-if="visibleTournaments.length > 0" class="tournament-catalog">
      <button
        v-for="tournament in visibleTournaments"
        :key="tournament.id"
        class="catalog-card"
        @click="selectedTournament = tournament"
      >
        <div class="catalog-cover">
          <img :src="photos.arena" alt="" />
          <div />
          <StatusBadge
            :tone="
              tournament.status === 'open'
                ? 'green'
                : tournament.status === 'completed'
                  ? 'blue'
                  : 'purple'
            "
          >
            {{ tournament.status || 'open' }}
          </StatusBadge>
          <span class="catalog-date">ID #{{ tournament.id }}</span>
        </div>
        <div class="catalog-body">
          <span>E-SPORT TOURNAMENT</span>
          <h3>{{ tournament.name }}</h3>
          <p>Single Elimination • Competitive Bracket</p>
          <div class="catalog-meta">
            <div>
              <small>STATUS</small>
              <strong>{{ tournament.status?.toUpperCase() || 'OPEN' }}</strong>
            </div>
            <span>
              {{ tournament.total_slots - tournament.available_slots }}/{{ tournament.total_slots }} TIM
            </span>
          </div>
          <div class="progress">
            <i :style="{ width: `${Math.round(((tournament.total_slots - tournament.available_slots) / tournament.total_slots) * 100)}%` }" />
          </div>
          <span class="catalog-link">
            Lihat Peserta & Daftar <AppIcon name="arrow" :size="16" />
          </span>
        </div>
      </button>
    </div>

    <div v-else class="empty-state">
      <div>
        <AppIcon name="search" :size="30" />
      </div>
      <h3>Turnamen tidak ditemukan</h3>
      <p>Belum ada turnamen yang sesuai atau dibuat di database backend.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api, getStoredAuth, ApiTournament, ApiTournamentTeam, ApiTeamSummary } from '../api'
import AppIcon from '../components/AppIcon.vue'
import SectionTitle from '../components/SectionTitle.vue'
import StatusBadge from '../components/StatusBadge.vue'

const emit = defineEmits<{
  (e: 'toast', msg: string): void
}>()

const router = useRouter()
const tournaments = ref<ApiTournament[]>([])
const selectedTournament = ref<ApiTournament | null>(null)
const registeredTeams = ref<ApiTournamentTeam[]>([])
const myTeams = ref<ApiTeamSummary[]>([])
const selectedTeamToRegister = ref('')
const searchTournament = ref('')
const loading = ref(false)
const auth = ref(getStoredAuth())

const photos = {
  arena: "https://images.unsplash.com/photo-1633545495735-25df17fb9f31?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=1600",
}

const filledSlots = computed(() => {
  if (!selectedTournament.value) return 0
  return selectedTournament.value.total_slots - selectedTournament.value.available_slots
})

const capacityPercentage = computed(() => {
  if (!selectedTournament.value) return 0
  return Math.round((filledSlots.value / selectedTournament.value.total_slots) * 100)
})

const visibleTournaments = computed(() =>
  tournaments.value.filter((t) =>
    t.name.toLowerCase().includes(searchTournament.value.toLowerCase())
  )
)

const loadTournaments = async () => {
  const res = await api.getTournaments()
  if (res.ok && res.data) tournaments.value = res.data
}

watch(selectedTournament, async (newVal) => {
  if (newVal) {
    const res = await api.getTournamentTeams(newVal.name)
    if (res.ok && res.data) registeredTeams.value = res.data
  } else {
    registeredTeams.value = []
  }
})

onMounted(async () => {
  auth.value = getStoredAuth()
  await loadTournaments()
  const teamsRes = await api.getTeams()
  if (teamsRes.ok && teamsRes.data) {
    myTeams.value = teamsRes.data.filter((t) => t.captain_username === auth.value.username)
  }
})

const handleRegisterTeam = async (tournamentName: string, teamName: string) => {
  if (!auth.value.username) {
    emit('toast', 'Silakan login sebagai kapten tim untuk mendaftar.')
    return
  }
  if (!teamName) {
    emit('toast', 'Pilih tim Anda terlebih dahulu.')
    return
  }
  loading.value = true
  const res = await api.registerTournament(tournamentName, teamName)
  loading.value = false
  if (res.ok) {
    emit('toast', `Tim ${teamName} berhasil didaftarkan ke ${tournamentName}!`)
    const r = await api.getTournamentTeams(tournamentName)
    if (r.ok && r.data) registeredTeams.value = r.data
    await loadTournaments()
    if (selectedTournament.value) {
      const updated = tournaments.value.find((t) => t.name === selectedTournament.value?.name)
      if (updated) selectedTournament.value = updated
    }
  } else {
    emit('toast', res.message || 'Gagal mendaftarkan tim ke turnamen')
  }
}
</script>
