<template>
  <!-- DETAIL VIEW -->
  <div v-if="selectedTeamName && teamDetail" class="page">
    <button class="back-to-catalog" @click="selectedTeamName = null">
      <AppIcon name="arrow" :size="17" /> Kembali ke Semua Tim
    </button>
    <section class="team-hero">
      <div class="team-badge">
        <AppIcon name="bolt" :size="42" />
      </div>
      <div>
        <span class="eyebrow">
          <i /> ACTIVE ROSTER
        </span>
        <h2>{{ teamDetail.name }}</h2>
        <p>
          ID Tim #{{ teamDetail.id }} • Total {{ teamDetail.members.length }} Pemain
        </p>
      </div>
      <div class="team-record">
        <div>
          <b>{{ teamDetail.members.length }}</b>
          <span>ANGGOTA</span>
        </div>
        <div>
          <b>5</b>
          <span>MAX SLOT</span>
        </div>
      </div>
      <button
        v-if="!isMember"
        class="btn primary"
        @click="handleJoinTeam(teamDetail.name)"
      >
        <AppIcon name="plus" :size="17" /> Gabung Tim Ini
      </button>
    </section>

    <div class="team-layout">
      <section>
        <SectionTitle
          kicker="ROSTER"
          :title="`Anggota Tim (${teamDetail.members.length}/5)`"
        >
          <template #action>
            <span class="permission">
              <AppIcon name="shield" :size="14" />
              {{ isCaptain ? 'Akses Kapten Aktif' : 'Akses Anggota' }}
            </span>
          </template>
        </SectionTitle>
        <div class="roster-list">
          <article
            v-for="(member, index) in teamDetail.members"
            :key="member.username"
            class="roster-row"
          >
            <div :class="`avatar large av${index % 4}`">
              {{ member.username.slice(0, 2).toUpperCase() }}
            </div>
            <div class="member-name">
              <strong>
                {{ member.username }}
                <span v-if="allTeams.find((t) => t.name === teamDetail?.name)?.captain_username === member.username" class="captain">
                  <AppIcon name="crown" :size="13" /> KAPTEN
                </span>
              </strong>
              <small>Status: {{ member.status }}</small>
            </div>
            <div class="member-role">
              <span>ROLE</span>
              <strong>{{ allTeams.find((t) => t.name === teamDetail?.name)?.captain_username === member.username ? 'Team Captain' : 'Player' }}</strong>
            </div>
            <StatusBadge>{{ member.status }}</StatusBadge>
            <div
              v-if="isCaptain && allTeams.find((t) => t.name === teamDetail?.name)?.captain_username !== member.username"
              class="row-actions"
            >
              <button
                class="small-action"
                @click="handleTransferCaptain(teamDetail.name, member.username)"
              >
                <AppIcon name="crown" :size="15" /> Pindah Kapten
              </button>
              <button
                class="danger-icon"
                :aria-label="`Hapus ${member.username}`"
                @click="handleRemoveMember(teamDetail.name, member.username)"
              >
                <AppIcon name="trash" :size="17" />
              </button>
            </div>
          </article>
        </div>
      </section>

      <aside>
        <SectionTitle kicker="TEAM ACTIONS" title="Tindakan Tim" />
        <div class="info-card">
          <div class="info-row">
            <span>Nama Tim</span>
            <b>{{ teamDetail.name }}</b>
          </div>
          <div class="info-row">
            <span>ID Backend</span>
            <b>#{{ teamDetail.id }}</b>
          </div>
          <div class="info-row">
            <span>Status</span>
            <StatusBadge tone="green">Aktif di API</StatusBadge>
          </div>
        </div>
        <div class="danger-zone" style="margin-top: 20px;">
          <div>
            <AppIcon name="shield" />
            <strong>{{ isCaptain ? 'Zona Kapten' : 'Zona Anggota' }}</strong>
            <p>
              {{ isCaptain
                ? 'Sebagai kapten, kamu dapat membubarkan tim atau keluar setelah transfer kapten.'
                : 'Kamu dapat keluar dari tim ini kapan saja.' }}
            </p>
          </div>
          <div v-if="isCaptain" style="display: flex; flex-direction: column; gap: 8px; width: 100%;">
            <button @click="handleLeaveTeam(teamDetail.name)">
              Keluar dari Tim (Pindah Kapten)
            </button>
            <button
              style="background: rgba(255, 118, 87, 0.2); border-color: var(--orange); color: var(--orange);"
              @click="handleDeleteTeam(teamDetail.name)"
            >
              Bubarkan Tim
            </button>
          </div>
          <button v-else-if="isMember" @click="handleLeaveTeam(teamDetail.name)">
            Keluar dari Tim
          </button>
        </div>
      </aside>
    </div>
  </div>

  <!-- LIST VIEW -->
  <div v-else class="page team-hub">
    <section class="team-hub-head">
      <div>
        <span class="eyebrow">
          <i /> MY SQUADS
        </span>
        <h2>
          TIM <em>SAYA.</em>
        </h2>
        <p>
          Daftar tim esport di mana Anda terdaftar sebagai anggota atau kapten tim.
        </p>
      </div>
      <div class="team-hub-actions">
        <button class="btn ghost" @click="joinOpen = true">
          <AppIcon name="users" :size="17" /> Gabung Tim
        </button>
        <button class="btn primary" @click="createOpen = true">
          <AppIcon name="plus" :size="17" /> Buat Tim Baru
        </button>
      </div>
    </section>

    <div class="team-hub-summary">
      <div>
        <strong>{{ joinedTeams.length }}</strong>
        <span>TIM YANG DIIKUTI</span>
      </div>
      <div>
        <strong>{{ joinedTeams.filter((t) => t.captain_username === auth.username).length }}</strong>
        <span>SEBAGAI KAPTEN</span>
      </div>
      <div>
        <strong>5</strong>
        <span>MAX ROSTER</span>
      </div>
    </div>

    <SectionTitle kicker="JOINED TEAMS" title="Tim yang Kamu Masuki" />

    <p v-if="loadingJoined" style="padding: 20px; color: var(--muted);">
      Memuat tim yang kamu ikuti...
    </p>
    <div v-else-if="joinedTeams.length > 0" class="player-team-grid">
      <button
        v-for="(team, index) in joinedTeams"
        :key="team.id"
        class="player-team-card"
        @click="selectedTeamName = team.name"
      >
        <div :class="`player-team-cover team-gradient-${index % 3}`">
          <span class="player-team-mark">
            {{ team.name.slice(0, 2).toUpperCase() }}
          </span>
          <StatusBadge :tone="team.captain_username === auth.username ? 'purple' : 'green'">
            {{ team.captain_username === auth.username ? 'Kapten' : 'Anggota' }}
          </StatusBadge>
        </div>
        <div class="player-team-body">
          <span>ID #{{ team.id }}</span>
          <h3>{{ team.name }}</h3>
          <p>Kapten: {{ team.captain_username }}</p>
          <div class="team-avatar-stack">
            <span>{{ team.captain_username.slice(0, 2).toUpperCase() }}</span>
            <span v-if="team.member_count > 1" class="empty-slot">+{{ team.member_count - 1 }}</span>
          </div>
          <div class="player-team-stats">
            <div>
              <strong>{{ team.member_count }}</strong>
              <span>ANGGOTA</span>
            </div>
            <div>
              <strong>5</strong>
              <span>SLOT</span>
            </div>
            <AppIcon name="arrow" :size="18" />
          </div>
        </div>
      </button>
    </div>
    <div v-else class="empty-state">
      <div>
        <AppIcon name="users" :size="32" />
      </div>
      <h3>Kamu belum bergabung ke tim manapun</h3>
      <p>Gunakan tombol di atas untuk membuat tim baru atau bergabung ke tim yang sudah ada.</p>
    </div>

    <!-- MODAL JOIN TEAM -->
    <ModalDialog v-if="joinOpen" title="Gabung ke Tim" @close="joinOpen = false">
      <p class="modal-copy">
        Ketik nama tim yang ingin Anda ikuti. Sistem akan mencocokkan nama tim yang terdaftar di database.
      </p>
      <label class="field-label">NAMA TIM</label>
      <input
        v-model="targetTeamJoin"
        class="input"
        placeholder="Ketik nama tim (contoh: PHOENIX FIVE, NOVA STRIKE...)"
        autofocus
      />
      <div
        v-if="targetTeamJoin"
        style="margin: 10px 0; max-height: 140px; overflow-y: auto; border: 1px solid var(--line); border-radius: 4px;"
      >
        <div
          v-for="t in allTeams.filter((tm) => tm.name.toLowerCase().includes(targetTeamJoin.toLowerCase()))"
          :key="t.id"
          :style="{
            padding: '8px 12px',
            cursor: 'pointer',
            borderBottom: '1px solid var(--line)',
            fontSize: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            background: targetTeamJoin.toLowerCase() === t.name.toLowerCase() ? 'rgba(199,241,53,0.12)' : 'transparent'
          }"
          @click="targetTeamJoin = t.name"
        >
          <strong>{{ t.name }}</strong>
          <span style="color: var(--muted);">Kapten: {{ t.captain_username }}</span>
        </div>
      </div>
      <button
        class="btn primary full"
        :disabled="!targetTeamJoin.trim() || loading"
        style="margin-top: 16px;"
        @click="handleJoinTeam(targetTeamJoin.trim())"
      >
        {{ loading ? 'Memproses...' : 'Gabung ke Tim' }} <AppIcon name="arrow" :size="17" />
      </button>
    </ModalDialog>

    <!-- MODAL CREATE TEAM -->
    <ModalDialog v-if="createOpen" title="Buat Tim Baru" @close="createOpen = false">
      <form @submit.prevent="handleCreateTeam">
        <label class="field-label">NAMA TIM</label>
        <input
          v-model="teamNameInput"
          class="input"
          required
          placeholder="Contoh: GARUDA CYBER"
        />
        <button
          class="btn primary full"
          type="submit"
          :disabled="loading"
          style="margin-top: 16px;"
        >
          {{ loading ? 'Membuat...' : 'Buat Tim Sekarang' }} <AppIcon name="arrow" :size="17" />
        </button>
      </form>
    </ModalDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { api, getStoredAuth, ApiTeamSummary, ApiTeamDetail } from '../api'
import AppIcon from '../components/AppIcon.vue'
import SectionTitle from '../components/SectionTitle.vue'
import StatusBadge from '../components/StatusBadge.vue'
import ModalDialog from '../components/ModalDialog.vue'

const emit = defineEmits<{
  (e: 'toast', msg: string): void
}>()

const allTeams = ref<ApiTeamSummary[]>([])
const joinedTeams = ref<ApiTeamSummary[]>([])
const selectedTeamName = ref<string | null>(null)
const teamDetail = ref<ApiTeamDetail | null>(null)
const joinOpen = ref(false)
const createOpen = ref(false)
const teamNameInput = ref('')
const targetTeamJoin = ref('')
const loading = ref(false)
const loadingJoined = ref(true)
const auth = ref(getStoredAuth())

const isCaptain = computed(() => {
  if (!teamDetail.value) return false
  const directMatch = teamDetail.value.members.some(
    (m) => m.username === auth.value.username && teamDetail.value?.captain_id
  )
  const summaryMatch = allTeams.value.find((t) => t.name === teamDetail.value?.name)?.captain_username === auth.value.username
  return directMatch || summaryMatch
})

const isMember = computed(() => {
  if (!teamDetail.value) return false
  return teamDetail.value.members.some((m) => m.username === auth.value.username)
})

const loadTeams = async () => {
  loadingJoined.value = true
  auth.value = getStoredAuth()
  const res = await api.getTeams()
  if (res.ok && res.data) {
    allTeams.value = res.data
    if (!auth.value.username) {
      joinedTeams.value = []
      loadingJoined.value = false
      return
    }

    const joined: ApiTeamSummary[] = []
    await Promise.all(
      res.data.map(async (t) => {
        if (t.captain_username === auth.value.username) {
          joined.push(t)
          return
        }
        const detailRes = await api.getTeamProfile(t.name)
        if (detailRes.ok && detailRes.data) {
          const isUserIn = detailRes.data.members.some((m) => m.username === auth.value.username)
          if (isUserIn) joined.push(t)
        }
      })
    )
    joinedTeams.value = joined
  }
  loadingJoined.value = false
}

watch(selectedTeamName, async (newVal) => {
  if (newVal) {
    const res = await api.getTeamProfile(newVal)
    if (res.ok && res.data) teamDetail.value = res.data
  } else {
    teamDetail.value = null
  }
})

onMounted(() => {
  loadTeams()
})

const handleCreateTeam = async () => {
  if (!auth.value.username) {
    emit('toast', 'Silakan login terlebih dahulu untuk membuat tim.')
    return
  }
  loading.value = true
  const res = await api.createTeam(teamNameInput.value, auth.value.username)
  loading.value = false
  if (res.ok) {
    emit('toast', `Tim "${teamNameInput.value}" berhasil dibuat!`)
    createOpen.value = false
    const createdName = teamNameInput.value
    teamNameInput.value = ''
    await loadTeams()
    selectedTeamName.value = createdName
  } else {
    emit('toast', res.message || 'Gagal membuat tim')
  }
}

const handleJoinTeam = async (teamName: string) => {
  if (!auth.value.username) {
    emit('toast', 'Silakan login terlebih dahulu untuk bergabung ke tim.')
    return
  }
  loading.value = true
  const res = await api.joinTeam(teamName)
  loading.value = false
  if (res.ok) {
    emit('toast', `Berhasil bergabung ke tim ${teamName}!`)
    joinOpen.value = false
    await loadTeams()
    if (selectedTeamName.value === teamName) {
      const r = await api.getTeamProfile(teamName)
      if (r.ok && r.data) teamDetail.value = r.data
    }
  } else {
    emit('toast', res.message || 'Gagal bergabung ke tim')
  }
}

const handleDeleteTeam = async (teamName: string) => {
  if (!confirm(`Yakin ingin membubarkan tim ${teamName}?`)) return
  const res = await api.deleteTeam(teamName)
  if (res.ok) {
    emit('toast', `Tim ${teamName} berhasil dibubarkan`)
    await loadTeams()
    selectedTeamName.value = null
  } else {
    emit('toast', res.message || 'Hanya kapten yang dapat membubarkan tim')
  }
}

const handleLeaveTeam = async (teamName: string) => {
  if (isCaptain.value) {
    const eligibleMembers = teamDetail.value?.members.filter((m) => m.username !== auth.value.username) || []
    if (eligibleMembers.length === 0) {
      if (confirm(`Sebagai satu-satunya anggota dan kapten, keluar akan membubarkan tim ${teamName}. Lanjutkan bubarkan tim?`)) {
        return handleDeleteTeam(teamName)
      }
      return
    }
    const newCap = prompt(
      `Sebagai kapten, Anda wajib menentukan kapten baru sebelum keluar.\nPilih salah satu anggota:\n${eligibleMembers.map((m) => m.username).join(', ')}`
    )
    if (!newCap) return
    const res = await api.leaveTeam(teamName, newCap.trim())
    if (res.ok) {
      emit('toast', `Berhasil keluar dari tim ${teamName}. Kapten baru: ${newCap}`)
      await loadTeams()
      selectedTeamName.value = null
    } else {
      emit('toast', res.message || 'Gagal keluar dari tim')
    }
    return
  }

  if (!confirm(`Yakin ingin keluar dari tim ${teamName}?`)) return
  const res = await api.leaveTeam(teamName)
  if (res.ok) {
    emit('toast', `Berhasil keluar dari tim ${teamName}`)
    await loadTeams()
    selectedTeamName.value = null
  } else {
    emit('toast', res.message || 'Gagal keluar dari tim')
  }
}

const handleTransferCaptain = async (teamName: string, newCaptain: string) => {
  const res = await api.transferCaptain(teamName, newCaptain)
  if (res.ok) {
    emit('toast', `Kapten tim berhasil dipindahkan ke ${newCaptain}`)
    const r = await api.getTeamProfile(teamName)
    if (r.ok && r.data) teamDetail.value = r.data
  } else {
    emit('toast', res.message || 'Gagal memindahkan kapten')
  }
}

const handleRemoveMember = async (teamName: string, memberUsername: string) => {
  const res = await api.removeTeamMember(teamName, memberUsername)
  if (res.ok) {
    emit('toast', `${memberUsername} berhasil dikeluarkan dari tim`)
    const r = await api.getTeamProfile(teamName)
    if (r.ok && r.data) teamDetail.value = r.data
  } else {
    emit('toast', res.message || 'Gagal mengeluarkan anggota')
  }
}
</script>
