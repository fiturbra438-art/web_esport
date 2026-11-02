<template>
  <div v-if="auth.role !== 'admin'" class="page" style="text-align: center; padding-top: 100px;">
    <div style="max-width: 480px; margin: auto; background: var(--panel); padding: 36px; border: 1px solid var(--line);">
      <div style="color: var(--orange); margin-bottom: 16px;">
        <AppIcon name="shield" :size="48" />
      </div>
      <h2 style="margin-bottom: 12px;">Akses Ditolak (403)</h2>
      <p style="color: var(--muted); margin-bottom: 24px;">
        Halaman Control Center Admin hanya dapat diakses oleh akun dengan role <strong>admin</strong>. Akun player biasa tidak memiliki izin ke halaman ini.
      </p>
      <button class="btn primary full" @click="router.push('/')">
        Kembali ke Dashboard Player
      </button>
    </div>
  </div>

  <div v-else class="page admin-page">
    <section class="admin-welcome" id="admin-overview">
      <div>
        <span class="eyebrow">
          <i /> CONTROL CENTER (ROLE: {{ (auth.role || 'USER').toUpperCase() }})
        </span>
        <h2>
          KENDALIKAN <em>ARENA.</em>
        </h2>
        <p>Kelola turnamen resmi, buat bracket pertandingan, dan catat pemenang turnamen.</p>
      </div>
      <div class="admin-actions">
        <button class="btn ghost" @click="modal = 'result'">
          <AppIcon name="crown" /> Catat Hasil Match
        </button>
        <button class="btn ghost" @click="modal = 'match'">
          <AppIcon name="swords" /> Buat Pertandingan
        </button>
        <button class="btn primary" @click="modal = 'tournament'">
          <AppIcon name="plus" /> Buat Turnamen
        </button>
      </div>
    </section>

    <section class="stats-grid admin-stats">
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

    <section style="margin-top: 20px;">
      <SectionTitle kicker="MANAGEMENT" title="Daftar Turnamen di Database" />
      <div class="table-card">
        <div class="table-head">
          <span>TURNAMEN</span>
          <span>KUOTA & TERISI</span>
          <span>STATUS</span>
          <span>AKSI ADMIN</span>
        </div>
        <div
          v-for="t in tournaments"
          :key="t.id"
          class="table-row"
        >
          <div>
            <span class="game-logo">{{ t.name.slice(0, 2).toUpperCase() }}</span>
            <p>
              <strong>{{ t.name }}</strong>
              <small>ID #{{ t.id }}</small>
            </p>
          </div>
          <span>
            {{ t.total_slots - t.available_slots }} / {{ t.total_slots }} TIM
          </span>
          <StatusBadge :tone="t.status === 'open' ? 'green' : 'purple'">
            {{ t.status || 'open' }}
          </StatusBadge>
          <div class="table-actions">
            <button
              class="danger-icon"
              :aria-label="`Hapus ${t.name}`"
              title="Hapus Turnamen (Khusus Admin)"
              @click="handleDeleteTournament(t.name)"
            >
              <AppIcon name="trash" :size="17" />
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- MODAL CREATE TOURNAMENT -->
    <ModalDialog v-if="modal === 'tournament'" title="Buat Turnamen Baru" @close="modal = null">
      <form @submit.prevent="handleCreateTournament">
        <label class="field-label">NAMA TURNAMEN</label>
        <input
          v-model="newTourneyName"
          class="input"
          required
          placeholder="Contoh: VALORANT MASTERS 2026"
        />
        <label class="field-label">KUOTA MAKSIMAL TIM</label>
        <input
          v-model.number="newTourneySlots"
          class="input"
          type="number"
          min="2"
          max="64"
          required
        />
        <button
          class="btn primary full"
          type="submit"
          :disabled="loading"
          style="margin-top: 16px;"
        >
          {{ loading ? 'Menyimpan...' : 'Buat Turnamen di Database' }} <AppIcon name="arrow" />
        </button>
      </form>
    </ModalDialog>

    <!-- MODAL CREATE MATCH -->
    <ModalDialog v-if="modal === 'match'" title="Buat Pertandingan Baru" @close="modal = null">
      <form @submit.prevent="handleCreateMatch">
        <label class="field-label">PILIH TURNAMEN</label>
        <select v-model="matchTourney" class="input">
          <option v-for="t in tournaments" :key="t.id" :value="t.name">
            {{ t.name }}
          </option>
        </select>
        <label class="field-label">TIM 1</label>
        <select v-model="matchTeam1" class="input" required>
          <option value="">-- Pilih Tim 1 --</option>
          <option v-for="t in teams" :key="t.id" :value="t.name">
            {{ t.name }}
          </option>
        </select>
        <label class="field-label">TIM 2</label>
        <select v-model="matchTeam2" class="input" required>
          <option value="">-- Pilih Tim 2 --</option>
          <option v-for="t in teams" :key="t.id" :value="t.name">
            {{ t.name }}
          </option>
        </select>
        <label class="field-label">NOMOR RONDE</label>
        <input
          v-model.number="matchRound"
          class="input"
          type="number"
          min="1"
          max="10"
        />
        <button
          class="btn primary full"
          type="submit"
          :disabled="loading"
          style="margin-top: 16px;"
        >
          {{ loading ? 'Menyimpan...' : 'Simpan Pertandingan' }} <AppIcon name="calendar" />
        </button>
      </form>
    </ModalDialog>

    <!-- MODAL SET RESULT -->
    <ModalDialog v-if="modal === 'result'" title="Catat Pemenang Pertandingan" @close="modal = null">
      <form @submit.prevent="handleSetMatchResult">
        <label class="field-label">TURNAMEN</label>
        <select v-model="resTourney" class="input">
          <option v-for="t in tournaments" :key="t.id" :value="t.name">
            {{ t.name }}
          </option>
        </select>
        <label class="field-label">SALAH SATU TIM YANG BERTANDING</label>
        <select v-model="resTeam" class="input" required>
          <option value="">-- Pilih Tim --</option>
          <option v-for="t in teams" :key="t.id" :value="t.name">
            {{ t.name }}
          </option>
        </select>
        <label class="field-label">TIM PEMENANG</label>
        <select v-model="resWinner" class="input" required>
          <option value="">-- Pilih Tim Pemenang --</option>
          <option v-for="t in teams" :key="t.id" :value="t.name">
            {{ t.name }}
          </option>
        </select>
        <button
          class="btn primary full"
          type="submit"
          :disabled="loading"
          style="margin-top: 16px;"
        >
          {{ loading ? 'Menyimpan...' : 'Kukuhkan Pemenang Match' }} <AppIcon name="check" />
        </button>
      </form>
    </ModalDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api, getStoredAuth, ApiTournament, ApiTeamSummary } from '../api'
import AppIcon, { IconName } from '../components/AppIcon.vue'
import SectionTitle from '../components/SectionTitle.vue'
import StatusBadge from '../components/StatusBadge.vue'
import ModalDialog from '../components/ModalDialog.vue'

const emit = defineEmits<{
  (e: 'toast', msg: string): void
}>()

const router = useRouter()
const tournaments = ref<ApiTournament[]>([])
const teams = ref<ApiTeamSummary[]>([])
const modal = ref<'tournament' | 'match' | 'result' | null>(null)
const newTourneyName = ref('')
const newTourneySlots = ref(16)

const matchTourney = ref('')
const matchTeam1 = ref('')
const matchTeam2 = ref('')
const matchRound = ref(1)

const resTourney = ref('')
const resTeam = ref('')
const resWinner = ref('')

const loading = ref(false)
const auth = ref(getStoredAuth())

const stats = computed<{ label: string; value: string; meta: string; icon: IconName }[]>(() => [
  { label: 'Turnamen di Database', value: String(tournaments.value.length), meta: 'Tersimpan di PostgreSQL', icon: 'trophy' },
  { label: 'Tim Terdaftar', value: String(teams.value.length), meta: 'Aktif di server Axum', icon: 'users' },
  { label: 'Akses Admin', value: auth.value.role === 'admin' ? 'AKTIF' : 'NON-ADMIN', meta: auth.value.username || 'Anonymous', icon: 'shield' },
  { label: 'Status API', value: 'ONLINE', meta: '127.0.0.1:8080', icon: 'bolt' },
])

const loadData = async () => {
  const tourneyRes = await api.getTournaments()
  if (tourneyRes.ok && tourneyRes.data) {
    tournaments.value = tourneyRes.data
    if (tourneyRes.data.length > 0 && !matchTourney.value) {
      matchTourney.value = tourneyRes.data[0].name
      resTourney.value = tourneyRes.data[0].name
    }
  }
  const teamsRes = await api.getTeams()
  if (teamsRes.ok && teamsRes.data) teams.value = teamsRes.data
}

onMounted(() => {
  auth.value = getStoredAuth()
  loadData()
})

const handleCreateTournament = async () => {
  loading.value = true
  const res = await api.createTournament(newTourneyName.value, newTourneySlots.value)
  loading.value = false
  if (res.ok) {
    emit('toast', `Turnamen "${newTourneyName.value}" berhasil dibuat!`)
    modal.value = null
    newTourneyName.value = ''
    loadData()
  } else {
    emit('toast', res.message || "Gagal membuat turnamen (Pastikan Anda login sebagai role 'admin')")
  }
}

const handleDeleteTournament = async (name: string) => {
  if (!confirm(`Hapus turnamen "${name}"?`)) return
  const res = await api.deleteTournament(name)
  if (res.ok) {
    emit('toast', `Turnamen "${name}" berhasil dihapus.`)
    loadData()
  } else {
    emit('toast', res.message || 'Gagal menghapus turnamen (hanya admin)')
  }
}

const handleCreateMatch = async () => {
  if (matchTeam1.value === matchTeam2.value) {
    emit('toast', 'Tim 1 dan Tim 2 tidak boleh sama!')
    return
  }
  loading.value = true
  const res = await api.createMatch(matchTourney.value, matchTeam1.value, matchTeam2.value, matchRound.value)
  loading.value = false
  if (res.ok) {
    emit('toast', 'Pertandingan berhasil dibuat dan masuk jadwal!')
    modal.value = null
  } else {
    emit('toast', res.message || 'Gagal membuat match (hanya admin)')
  }
}

const handleSetMatchResult = async () => {
  loading.value = true
  const res = await api.setMatchResult(resTourney.value, resTeam.value, resWinner.value)
  loading.value = false
  if (res.ok) {
    emit('toast', `Hasil match turnamen ${resTourney.value} dicatat! Pemenang: ${resWinner.value}`)
    modal.value = null
  } else {
    emit('toast', res.message || 'Gagal mencatat pemenang (hanya admin)')
  }
}
</script>
