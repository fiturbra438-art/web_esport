import { FormEvent, ReactNode, useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router"
import {
  api,
  getStoredAuth,
  setStoredAuth,
  clearStoredAuth,
  ApiTournament,
  ApiTeamSummary,
  ApiTeamDetail,
  ApiTournamentTeam,
  ApiMatch,
  UserProfile,
} from "./api"

type Page = "dashboard" | "team" | "tournament" | "schedule" | "admin" | "login"
type IconName = "grid" | "users" | "trophy" | "calendar" | "shield" | "logOut" | "bell" | "search" | "arrow" | "plus" | "trash" | "crown" | "check" | "clock" | "swords" | "menu" | "close" | "user" | "mail" | "lock" | "gamepad" | "chevron" | "more" | "bolt"

const photos = {
  arena:
    "https://images.unsplash.com/photo-1633545495735-25df17fb9f31?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=1600",
  players:
    "https://images.unsplash.com/photo-1633545491399-54a16aa6a871?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=1200",
  neon: "https://images.unsplash.com/photo-1549231777-e2258a665606?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=1200",
}

const paths: Record<IconName, ReactNode> = {
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </>
  ),
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  trophy: (
    <>
      <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4Z" />
      <path d="M7 6H3v2a4 4 0 0 0 4 4M17 6h4v2a4 4 0 0 1-4 4" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </>
  ),
  shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />,
  logOut: (
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
    </>
  ),
  bell: (
    <>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </>
  ),
  arrow: (
    <>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  trash: (
    <>
      <path d="M3 6h18M8 6V4h8v2M19 6l-1 15H6L5 6M10 11v5M14 11v5" />
    </>
  ),
  crown: <path d="m3 7 4 4 5-7 5 7 4-4-2 11H5L3 7Z" />,
  check: <path d="m5 12 4 4L19 6" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  swords: (
    <>
      <path d="m14.5 17.5 3 3 3-3-3-3M13 19l6-6M5 3l6 6M9 5l2-2 2 2M5 9 3 7l2-2M3 21l7-7" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  user: (
    <>
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="7" r="4" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </>
  ),
  lock: (
    <>
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </>
  ),
  gamepad: (
    <>
      <path d="M8 6h8a6 6 0 0 1 5.7 7.9l-1 3A3 3 0 0 1 16 18l-2-2h-4l-2 2a3 3 0 0 1-4.7-1.1l-1-3A6 6 0 0 1 8 6Z" />
      <path d="M7 10v4M5 12h4M16 11h.01M18 14h.01" />
    </>
  ),
  chevron: <path d="m9 18 6-6-6-6" />,
  more: (
    <>
      <circle cx="5" cy="12" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
    </>
  ),
  bolt: <path d="m13 2-9 12h7l-1 8 9-12h-7l1-8Z" />,
}

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}

const navItems: { page: Page; label: string; icon: IconName }[] = [
  { page: "dashboard", label: "Dashboard", icon: "grid" },
  { page: "team", label: "Tim Saya", icon: "users" },
  { page: "tournament", label: "Turnamen", icon: "trophy" },
  { page: "schedule", label: "Jadwal", icon: "calendar" },
]

const pageTitles: Record<Page, string> = {
  dashboard: "Dashboard Player",
  team: "Detail Tim",
  tournament: "Detail Turnamen",
  schedule: "Jadwal Pertandingan",
  admin: "Dashboard Admin",
  login: "Masuk",
}

function Logo() {
  return (
    <button className="logo" aria-label="Arena Core, kembali ke dashboard">
      <span className="logo-mark">
        <Icon name="bolt" size={22} />
      </span>
      <span>
        ARENA<span>CORE</span>
      </span>
    </button>
  )
}

function Sidebar({
  page,
  setPage,
  open,
  close,
  username,
  onLogout,
}: {
  page: Page
  setPage: (p: Page) => void
  open: boolean
  close: () => void
  username: string
  onLogout: () => void
}) {
  return (
    <>
      {open && (
        <button
          className="sidebar-backdrop"
          onClick={close}
          aria-label="Tutup navigasi"
        />
      )}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-head">
          <Logo />
          <button
            className="icon-btn close-mobile"
            onClick={close}
            aria-label="Tutup menu"
          >
            <Icon name="close" />
          </button>
        </div>
        <div className="season-card">
          <span className="eyebrow">
            <i /> SEASON 08
          </span>
          <strong>RISE TO GLORY</strong>
          <div>
            <span>Berakhir 24 hari lagi</span>
            <b>68%</b>
          </div>
          <div className="progress">
            <i style={{ width: "68%" }} />
          </div>
        </div>
        <nav aria-label="Navigasi utama">
          <p>MENU UTAMA</p>
          {navItems.map((item) => (
            <button
              key={item.page}
              className={page === item.page ? "active" : ""}
              onClick={() => {
                setPage(item.page)
                close()
              }}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
              {item.page === "schedule" && <em>3</em>}
            </button>
          ))}
          <button
            className={page === "admin" ? "active" : ""}
            onClick={() => {
              setPage("admin")
              close()
            }}
          >
            <Icon name="shield" />
            <span>Admin Center</span>
          </button>
        </nav>
        <div className="sidebar-user">
          <div className="avatar">{username.slice(0, 2).toUpperCase()}</div>
          <div>
            <strong>{username}</strong>
            <span>
              <i /> Online
            </span>
          </div>
          <button aria-label="Keluar" onClick={onLogout}>
            <Icon name="logOut" size={18} />
          </button>
        </div>
      </aside>
    </>
  )
}

function Header({ page, openMenu }: { page: Page; openMenu: () => void }) {
  return (
    <header className="topbar">
      <div>
        <button
          className="icon-btn menu-btn"
          onClick={openMenu}
          aria-label="Buka menu"
        >
          <Icon name="menu" />
        </button>
        <div>
          <span className="top-kicker">ARENA CORE /</span>
          <h1>{pageTitles[page]}</h1>
        </div>
      </div>
      <div className="top-actions">
        <label className="search">
          <Icon name="search" size={17} />
          <input aria-label="Cari" placeholder="Cari turnamen, tim..." />
          <kbd>⌘ K</kbd>
        </label>
        <button className="icon-btn notification" aria-label="Notifikasi">
          <Icon name="bell" size={19} />
          <i />
        </button>
        <div className="xp">
          <span>LVL 28</span>
          <b>2,840 XP</b>
        </div>
      </div>
    </header>
  )
}

function AdminHeader({ logout }: { logout: () => void }) {
  return (
    <header className="topbar admin-topbar">
      <div className="admin-header-brand">
        <Logo />
        <span className="admin-header-divider" />
        <div>
          <span className="top-kicker">ADMIN WORKSPACE / OVERVIEW</span>
          <h1>Control Center</h1>
        </div>
      </div>
      <div className="top-actions">
        <label className="search">
          <Icon name="search" size={17} />
          <input
            aria-label="Cari data admin"
            placeholder="Cari tim, match, ID..."
          />
          <kbd>⌘ K</kbd>
        </label>
        <span className="system-status">
          <i /> ALL SYSTEMS OPERATIONAL
        </span>
        <button className="icon-btn notification" aria-label="Notifikasi admin">
          <Icon name="bell" size={19} />
          <i />
        </button>
        <button className="icon-btn" onClick={logout} aria-label="Keluar">
          <Icon name="logOut" size={18} />
        </button>
      </div>
    </header>
  )
}

function SectionTitle({
  kicker,
  title,
  action,
}: {
  kicker?: string
  title: string
  action?: ReactNode
}) {
  return (
    <div className="section-title">
      <div>
        {kicker && <span>{kicker}</span>}
        <h2>{title}</h2>
      </div>
      {action}
    </div>
  )
}

function Status({
  children,
  tone = "green",
}: {
  children: ReactNode
  tone?: "green" | "purple" | "orange" | "blue" | "gray"
}) {
  return (
    <span className={`status ${tone}`}>
      <i />
      {children}
    </span>
  )
}

function Dashboard({ setPage }: { setPage: (p: Page) => void }) {
  return (
    <div className="page dashboard-page">
      <section className="welcome-banner">
        <div className="banner-grid" />
        <div className="welcome-copy">
          <span className="eyebrow">
            <i /> PLAYER HUB
          </span>
          <h2>
            SELAMAT DATANG, <em>RAKA.</em>
          </h2>
          <p>Siapkan strategi. Turnamen berikutnya menunggumu.</p>
          <div className="banner-actions">
            <button
              className="btn primary"
              onClick={() => setPage("tournament")}
            >
              Jelajahi Turnamen <Icon name="arrow" size={18} />
            </button>
            <button className="btn ghost" onClick={() => setPage("team")}>
              Kelola Tim
            </button>
          </div>
        </div>
        <div className="rank-card">
          <span>RANK MUSIM INI</span>
          <div className="rank-emblem">
            <Icon name="shield" size={44} />
            <b>III</b>
          </div>
          <strong>DIAMOND III</strong>
          <small>1,840 / 2,000 RP</small>
          <div className="progress">
            <i style={{ width: "82%" }} />
          </div>
        </div>
      </section>

      <section className="stats-grid">
        {[
          ["Turnamen Diikuti", "12", "+3 musim ini", "trophy"],
          ["Total Kemenangan", "38", "Win rate 64%", "swords"],
          ["Tim Aktif", "1", "NOVA STRIKE", "users"],
          ["Poin Ranking", "1,840", "#284 regional", "bolt"],
        ].map(([label, value, meta, icon], i) => (
          <article className="stat-card" key={label}>
            <div className={`stat-icon c${i}`}>
              <Icon name={icon as IconName} />
            </div>
            <span>{label}</span>
            <strong>{value}</strong>
            <small>{meta}</small>
          </article>
        ))}
      </section>

      <div className="dashboard-columns">
        <section>
          <SectionTitle
            kicker="UP NEXT"
            title="Turnamen Mendatang"
            action={
              <button
                className="text-btn"
                onClick={() => setPage("tournament")}
              >
                Lihat Semua <Icon name="arrow" size={15} />
              </button>
            }
          />
          <TournamentRow
            image={photos.arena}
            title="NEXUS CHAMPIONSHIP"
            game="Valorant • 5v5"
            date="18 JUN"
            status="Tim terdaftar"
            onClick={() => setPage("tournament")}
          />
          <TournamentRow
            image={photos.neon}
            title="MIDNIGHT BRAWL #12"
            game="Mobile Legends • 5v5"
            date="24 JUN"
            status="Pendaftaran buka"
            onClick={() => setPage("tournament")}
          />
        </section>
        <section>
          <SectionTitle kicker="ACTIVITY" title="Aktivitas Terbaru" />
          <div className="activity-card">
            {[
              [
                "check",
                "Pendaftaran berhasil",
                "NOVA STRIKE terdaftar di Nexus Championship",
                "12 menit",
              ],
              [
                "crown",
                "Kapten baru",
                "Kamu ditunjuk sebagai kapten tim",
                "2 jam",
              ],
              [
                "calendar",
                "Jadwal diperbarui",
                "Match #A-204 dipindahkan ke 19:30",
                "Kemarin",
              ],
            ].map(([icon, title, desc, time], i) => (
              <div className="activity" key={title}>
                <span className={`activity-icon a${i}`}>
                  <Icon name={icon as IconName} size={17} />
                </span>
                <div>
                  <strong>{title}</strong>
                  <p>{desc}</p>
                  <small>{time}</small>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

function TournamentRow({
  image,
  title,
  game,
  date,
  status,
  onClick,
}: {
  image: string
  title: string
  game: string
  date: string
  status: string
  onClick: () => void
}) {
  return (
    <button className="tournament-row" onClick={onClick}>
      <img src={image} alt="" />
      <span className="date-block">
        <b>{date.split(" ")[0]}</b>
        <small>{date.split(" ")[1]}</small>
      </span>
      <span className="row-copy">
        <strong>{title}</strong>
        <small>{game}</small>
      </span>
      <Status tone={status.includes("buka") ? "purple" : "green"}>
        {status}
      </Status>
      <Icon name="chevron" size={18} />
    </button>
  )
}

type Member = {
  name: string
  tag: string
  role: string
  initials: string
  captain?: boolean
  status?: string
}
const initialMembers: Member[] = [
  {
    name: "RakaXtreme",
    tag: "#RX28",
    role: "Duelist",
    initials: "RX",
    captain: true,
  },
  { name: "SoraByte", tag: "#SB11", role: "Controller", initials: "SB" },
  { name: "Vexel", tag: "#VX07", role: "Sentinel", initials: "VX" },
  { name: "KiroZen", tag: "#KZ99", role: "Initiator", initials: "KZ" },
  { name: "Nami.exe", tag: "#NM04", role: "Flex", initials: "NM" },
]

type PlayerTeam = {
  id: string
  name: string
  game: string
  region: string
  created: string
  wins: number
  losses: number
  rank: string
  capacity: number
  code: string
  isCaptain: boolean
  recruitment: "Terbuka" | "Tertutup"
}

const initialPlayerTeams: PlayerTeam[] = [
  {
    id: "nova",
    name: "NOVA STRIKE",
    game: "VALORANT",
    region: "Asia Pacific",
    created: "14 Jan 2025",
    wins: 24,
    losses: 9,
    rank: "#84",
    capacity: 5,
    code: "NVST-28AX",
    isCaptain: true,
    recruitment: "Tertutup",
  },
  {
    id: "garuda",
    name: "GARUDA FORCE",
    game: "MOBILE LEGENDS",
    region: "Indonesia",
    created: "02 Mar 2025",
    wins: 18,
    losses: 7,
    rank: "#126",
    capacity: 5,
    code: "GRDA-71ML",
    isCaptain: false,
    recruitment: "Terbuka",
  },
  {
    id: "skyward",
    name: "SKYWARD UNIT",
    game: "APEX LEGENDS",
    region: "Asia Pacific",
    created: "21 Apr 2025",
    wins: 11,
    losses: 5,
    rank: "#203",
    capacity: 3,
    code: "SKYW-09AP",
    isCaptain: true,
    recruitment: "Terbuka",
  },
]

const initialTeamRosters: Record<string, Member[]> = {
  nova: initialMembers,
  garuda: [
    {
      name: "Mikael",
      tag: "#MK12",
      role: "Jungler",
      initials: "MK",
      captain: true,
    },
    { name: "RakaXtreme", tag: "#RX28", role: "Gold Lane", initials: "RX" },
    { name: "Sena", tag: "#SN08", role: "Mid Lane", initials: "SN" },
    { name: "Arka", tag: "#AR17", role: "Roamer", initials: "AR" },
  ],
  skyward: [
    {
      name: "RakaXtreme",
      tag: "#RX28",
      role: "Assault",
      initials: "RX",
      captain: true,
    },
    { name: "NovaRay", tag: "#NR52", role: "Support", initials: "NR" },
    { name: "Kaze", tag: "#KZ18", role: "Skirmisher", initials: "KZ" },
  ],
}

function TeamPage({ toast }: { toast: (s: string) => void }) {
  const [teams, setTeams] = useState(initialPlayerTeams)
  const [teamRosters, setTeamRosters] = useState(initialTeamRosters)
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null)
  const [joinOpen, setJoinOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const selectedTeam = teams.find((team) => team.id === selectedTeamId)
  const members = selectedTeamId ? (teamRosters[selectedTeamId] ?? []) : []

  const setMembers = (nextMembers: Member[]) => {
    if (!selectedTeamId) return
    setTeamRosters({ ...teamRosters, [selectedTeamId]: nextMembers })
  }

  const makeCaptain = (index: number) => {
    setMembers(members.map((m, i) => ({ ...m, captain: i === index })))
    toast(`${members[index].name} sekarang menjadi kapten.`)
  }
  const remove = (index: number) => {
    toast(`${members[index].name} dihapus dari tim.`)
    setMembers(members.filter((_, i) => i !== index))
  }

  const createTeam = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const name = String(data.get("name"))
    const game = String(data.get("game"))
    const id = `team-${teams.length + 1}`
    const capacity = game === "APEX LEGENDS" ? 3 : 5
    const newTeam: PlayerTeam = {
      id,
      name,
      game,
      region: "Indonesia",
      created: "Hari ini",
      wins: 0,
      losses: 0,
      rank: "Unranked",
      capacity,
      code: `${name.slice(0, 4).toUpperCase()}-${teams.length + 28}`,
      isCaptain: true,
      recruitment: "Terbuka",
    }
    setTeams([...teams, newTeam])
    setTeamRosters({
      ...teamRosters,
      [id]: [
        {
          name: "RakaXtreme",
          tag: "#RX28",
          role: "Flex",
          initials: "RX",
          captain: true,
        },
      ],
    })
    setCreateOpen(false)
    setSelectedTeamId(id)
    toast(`${name} berhasil dibuat.`)
  }

  if (!selectedTeam) {
    return (
      <div className="page team-hub">
        <section className="team-hub-head">
          <div>
            <span className="eyebrow">
              <i /> YOUR SQUADS
            </span>
            <h2>
              SEMUA TIMMU, <em>SATU TEMPAT.</em>
            </h2>
            <p>
              Berpindah roster, pantau performa, dan kelola tim untuk setiap
              game yang kamu mainkan.
            </p>
          </div>
          <div className="team-hub-actions">
            <button className="btn ghost" onClick={() => setJoinOpen(true)}>
              <Icon name="users" size={17} /> Gabung Tim
            </button>
            <button className="btn primary" onClick={() => setCreateOpen(true)}>
              <Icon name="plus" size={17} /> Buat Tim Baru
            </button>
          </div>
        </section>
        <div className="team-hub-summary">
          <div>
            <strong>{teams.length}</strong>
            <span>TIM AKTIF</span>
          </div>
          <div>
            <strong>{teams.filter((team) => team.isCaptain).length}</strong>
            <span>SEBAGAI KAPTEN</span>
          </div>
          <div>
            <strong>
              {teams.reduce((total, team) => total + team.wins, 0)}
            </strong>
            <span>TOTAL MENANG</span>
          </div>
        </div>
        <SectionTitle kicker="MY TEAMS" title="Tim yang Kamu Ikuti" />
        <div className="player-team-grid">
          {teams.map((team, index) => {
            const roster = teamRosters[team.id] ?? []
            return (
              <button
                className="player-team-card"
                key={team.id}
                onClick={() => setSelectedTeamId(team.id)}
              >
                <div className={`player-team-cover team-gradient-${index % 3}`}>
                  <span className="player-team-mark">
                    {team.name.slice(0, 2)}
                  </span>
                  <Status tone={team.isCaptain ? "purple" : "gray"}>
                    {team.isCaptain ? "Kapten" : "Anggota"}
                  </Status>
                </div>
                <div className="player-team-body">
                  <span>{team.game}</span>
                  <h3>{team.name}</h3>
                  <p>
                    {team.region} · {roster.length}/{team.capacity} pemain
                  </p>
                  <div className="team-avatar-stack">
                    {roster.slice(0, 5).map((member) => (
                      <span key={member.tag}>{member.initials}</span>
                    ))}
                    {roster.length < team.capacity && (
                      <span className="empty-slot">
                        +{team.capacity - roster.length}
                      </span>
                    )}
                  </div>
                  <div className="player-team-stats">
                    <div>
                      <strong>{team.wins}</strong>
                      <span>MENANG</span>
                    </div>
                    <div>
                      <strong>{team.losses}</strong>
                      <span>KALAH</span>
                    </div>
                    <div>
                      <strong>{team.rank}</strong>
                      <span>RANK</span>
                    </div>
                    <Icon name="arrow" size={18} />
                  </div>
                </div>
              </button>
            )
          })}
        </div>
        {joinOpen && (
          <Modal title="Gabung ke Tim" close={() => setJoinOpen(false)}>
            <p className="modal-copy">
              Masukkan kode undangan dari kapten tim untuk menambahkannya ke
              koleksi timmu.
            </p>
            <label className="field-label">KODE UNDANGAN</label>
            <input className="input" placeholder="Contoh: NVST-28AX" />
            <button
              className="btn primary full"
              onClick={() => {
                setJoinOpen(false)
                toast("Permintaan bergabung berhasil dikirim.")
              }}
            >
              Kirim Permintaan <Icon name="arrow" size={17} />
            </button>
          </Modal>
        )}
        {createOpen && (
          <Modal title="Buat Tim Baru" close={() => setCreateOpen(false)}>
            <form onSubmit={createTeam}>
              <label className="field-label">NAMA TIM</label>
              <input
                className="input"
                name="name"
                required
                placeholder="Contoh: Crimson Nova"
              />
              <label className="field-label">GAME UTAMA</label>
              <select className="input" name="game">
                <option>VALORANT</option>
                <option>MOBILE LEGENDS</option>
                <option>APEX LEGENDS</option>
                <option>PUBG MOBILE</option>
              </select>
              <button className="btn primary full" type="submit">
                Buat Tim <Icon name="arrow" size={17} />
              </button>
            </form>
          </Modal>
        )}
      </div>
    )
  }

  return (
    <div className="page">
      <button
        className="back-to-catalog"
        onClick={() => setSelectedTeamId(null)}
      >
        <Icon name="arrow" size={17} /> Kembali ke Semua Tim
      </button>
      <section className="team-hero">
        <div className="team-badge">
          <Icon name="bolt" size={42} />
        </div>
        <div>
          <span className="eyebrow">
            <i /> ACTIVE ROSTER
          </span>
          <h2>{selectedTeam.name}</h2>
          <p>
            {selectedTeam.game} • {selectedTeam.region} <span>•</span> Dibentuk{" "}
            {selectedTeam.created}
          </p>
        </div>
        <div className="team-record">
          <div>
            <b>{selectedTeam.wins}</b>
            <span>MENANG</span>
          </div>
          <div>
            <b>{selectedTeam.losses}</b>
            <span>KALAH</span>
          </div>
          <div>
            <b>{selectedTeam.rank}</b>
            <span>RANK</span>
          </div>
        </div>
        <button
          className="btn primary"
          onClick={() => toast(`Tautan undangan ${selectedTeam.name} disalin.`)}
        >
          <Icon name="plus" size={17} /> Undang Anggota
        </button>
      </section>

      <div className="team-layout">
        <section>
          <SectionTitle
            kicker="SQUAD"
            title={`Roster Utama (${members.length}/${selectedTeam.capacity})`}
            action={
              <span className="permission">
                <Icon name="shield" size={14} />{" "}
                {selectedTeam.isCaptain ? "Hak akses kapten" : "Akses anggota"}
              </span>
            }
          />
          <div className="roster-list">
            {members.map((member, index) => (
              <article className="roster-row" key={member.tag}>
                <div className={`avatar large av${index}`}>
                  {member.initials}
                </div>
                <div className="member-name">
                  <strong>
                    {member.name}
                    {member.captain && (
                      <span className="captain">
                        <Icon name="crown" size={13} /> KAPTEN
                      </span>
                    )}
                  </strong>
                  <small>{member.tag}</small>
                </div>
                <div className="member-role">
                  <span>ROLE</span>
                  <strong>{member.role}</strong>
                </div>
                <Status>Online</Status>
                {selectedTeam.isCaptain && !member.captain && (
                  <div className="row-actions">
                    <button
                      className="small-action"
                      onClick={() => makeCaptain(index)}
                    >
                      <Icon name="crown" size={15} /> Pindah Kapten
                    </button>
                    <button
                      className="danger-icon"
                      onClick={() => remove(index)}
                      aria-label={`Hapus ${member.name}`}
                    >
                      <Icon name="trash" size={17} />
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
        <aside>
          <SectionTitle kicker="TEAM INFO" title="Informasi Tim" />
          <div className="info-card">
            <div className="info-row">
              <span>Game utama</span>
              <b>{selectedTeam.game}</b>
            </div>
            <div className="info-row">
              <span>Region</span>
              <b>{selectedTeam.region}</b>
            </div>
            <div className="info-row">
              <span>Bahasa</span>
              <b>Indonesia</b>
            </div>
            <div className="info-row">
              <span>Status rekrutmen</span>
              <Status
                tone={
                  selectedTeam.recruitment === "Terbuka" ? "green" : "orange"
                }
              >
                {selectedTeam.recruitment}
              </Status>
            </div>
            <hr />
            <label>KODE UNDANGAN</label>
            <div className="invite-code">
              <code>{selectedTeam.code}</code>
              <button
                onClick={() =>
                  toast(`Kode undangan ${selectedTeam.name} disalin.`)
                }
              >
                SALIN
              </button>
            </div>
          </div>
          <div className="danger-zone">
            <div>
              <Icon name="shield" />
              <strong>
                {selectedTeam.isCaptain ? "Zona Kapten" : "Keanggotaan"}
              </strong>
              <p>
                {selectedTeam.isCaptain
                  ? "Aksi berikut hanya dapat dilakukan oleh kapten tim."
                  : "Kamu dapat keluar dari tim ini kapan saja."}
              </p>
            </div>
            <button
              onClick={() =>
                toast(
                  selectedTeam.isCaptain
                    ? "Permintaan bubarkan tim perlu konfirmasi."
                    : `Permintaan keluar dari ${selectedTeam.name} perlu konfirmasi.`,
                )
              }
            >
              {selectedTeam.isCaptain ? "Bubarkan Tim" : "Keluar dari Tim"}
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}

type PlayerTournament = {
  id: string
  title: string
  game: string
  format: string
  date: string
  prize: string
  image: string
  status: "Pendaftaran Dibuka" | "Segera Hadir" | "Berlangsung"
  teams: number
  capacity: number
}

const playerTournaments: PlayerTournament[] = [
  {
    id: "nexus",
    title: "Nexus Championship",
    game: "VALORANT",
    format: "5v5 · PC",
    date: "18–22 JUN 2025",
    prize: "IDR 50.000.000",
    image: photos.arena,
    status: "Pendaftaran Dibuka",
    teams: 24,
    capacity: 32,
  },
  {
    id: "midnight",
    title: "Midnight Brawl #12",
    game: "MOBILE LEGENDS",
    format: "5v5 · Mobile",
    date: "24–26 JUN 2025",
    prize: "IDR 25.000.000",
    image: photos.neon,
    status: "Pendaftaran Dibuka",
    teams: 12,
    capacity: 16,
  },
  {
    id: "apex",
    title: "Apex Sunday Series",
    game: "APEX LEGENDS",
    format: "Trio · PC",
    date: "29 JUN 2025",
    prize: "IDR 15.000.000",
    image: photos.players,
    status: "Segera Hadir",
    teams: 0,
    capacity: 20,
  },
  {
    id: "valorant-rising",
    title: "Valorant Rising Stars",
    game: "VALORANT",
    format: "5v5 · PC",
    date: "04–06 JUL 2025",
    prize: "IDR 20.000.000",
    image: photos.players,
    status: "Pendaftaran Dibuka",
    teams: 18,
    capacity: 32,
  },
  {
    id: "garuda",
    title: "Garuda Battle Royale",
    game: "PUBG MOBILE",
    format: "Squad · Mobile",
    date: "10 JUL 2025",
    prize: "IDR 30.000.000",
    image: photos.arena,
    status: "Segera Hadir",
    teams: 8,
    capacity: 24,
  },
  {
    id: "weekend",
    title: "Weekend Legends Cup",
    game: "MOBILE LEGENDS",
    format: "5v5 · Mobile",
    date: "12–13 JUL 2025",
    prize: "IDR 12.000.000",
    image: photos.neon,
    status: "Berlangsung",
    teams: 16,
    capacity: 16,
  },
]

function TournamentPage({
  toast,
  setPage,
}: {
  toast: (s: string) => void
  setPage: (p: Page) => void
}) {
  const [selectedTournament, setSelectedTournament] =
    useState<PlayerTournament | null>(null)
  const [registered, setRegistered] = useState<string[]>([])
  const [searchTournament, setSearchTournament] = useState("")
  const [gameFilter, setGameFilter] = useState("Semua")
  const visibleTournaments = playerTournaments.filter(
    (tournament) =>
      (gameFilter === "Semua" || tournament.game === gameFilter) &&
      `${tournament.title} ${tournament.game}`
        .toLowerCase()
        .includes(searchTournament.toLowerCase()),
  )

  if (!selectedTournament) {
    return (
      <div className="page tournament-browser">
        <section className="tournament-browser-head">
          <div>
            <span className="eyebrow">
              <i /> COMPETE & GROW
            </span>
            <h2>
              TEMUKAN TURNAMEN <em>BERIKUTNYA.</em>
            </h2>
            <p>
              Semua turnamen langsung tersedia di sini. Gunakan pencarian hanya
              saat kamu membutuhkan hasil yang lebih spesifik.
            </p>
          </div>
          <div className="browser-total">
            <strong>{playerTournaments.length}</strong>
            <span>TURNAMEN TERSEDIA</span>
          </div>
        </section>
        <div className="tournament-browser-tools">
          <label className="tournament-search">
            <Icon name="search" size={18} />
            <input
              aria-label="Cari turnamen"
              placeholder="Cari nama turnamen atau game..."
              value={searchTournament}
              onChange={(event) => setSearchTournament(event.target.value)}
            />
            {searchTournament && (
              <button
                aria-label="Hapus pencarian"
                onClick={() => setSearchTournament("")}
              >
                <Icon name="close" size={16} />
              </button>
            )}
          </label>
          <div className="game-filters" aria-label="Filter game">
            {[
              "Semua",
              "VALORANT",
              "MOBILE LEGENDS",
              "APEX LEGENDS",
              "PUBG MOBILE",
            ].map((game) => (
              <button
                key={game}
                className={gameFilter === game ? "active" : ""}
                onClick={() => setGameFilter(game)}
              >
                {game}
              </button>
            ))}
          </div>
        </div>
        <div className="browser-result-head">
          <div>
            <span>TURNAMEN</span>
            <strong>
              {gameFilter === "Semua" ? "Semua Kompetisi" : gameFilter}
            </strong>
          </div>
          <span>{visibleTournaments.length} HASIL</span>
        </div>
        {visibleTournaments.length > 0 ? (
          <div className="tournament-catalog">
            {visibleTournaments.map((tournament) => {
              const percentage = Math.round(
                (tournament.teams / tournament.capacity) * 100,
              )
              return (
                <button
                  className="catalog-card"
                  key={tournament.id}
                  onClick={() => setSelectedTournament(tournament)}
                >
                  <div className="catalog-cover">
                    <img src={tournament.image} alt="" />
                    <div />
                    <Status
                      tone={
                        tournament.status === "Pendaftaran Dibuka"
                          ? "green"
                          : tournament.status === "Berlangsung"
                            ? "orange"
                            : "purple"
                      }
                    >
                      {tournament.status}
                    </Status>
                    <span className="catalog-date">{tournament.date}</span>
                  </div>
                  <div className="catalog-body">
                    <span>{tournament.game}</span>
                    <h3>{tournament.title}</h3>
                    <p>{tournament.format}</p>
                    <div className="catalog-meta">
                      <div>
                        <small>TOTAL HADIAH</small>
                        <strong>{tournament.prize}</strong>
                      </div>
                      <span>
                        {tournament.teams}/{tournament.capacity} TIM
                      </span>
                    </div>
                    <div className="progress">
                      <i style={{ width: `${percentage}%` }} />
                    </div>
                    <span className="catalog-link">
                      Lihat Detail <Icon name="arrow" size={16} />
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="empty-state">
            <div>
              <Icon name="search" size={30} />
            </div>
            <h3>Turnamen tidak ditemukan</h3>
            <p>Coba gunakan nama game lain atau hapus kata kunci pencarian.</p>
            <button
              className="btn ghost"
              onClick={() => {
                setSearchTournament("")
                setGameFilter("Semua")
              }}
            >
              Reset Filter
            </button>
          </div>
        )}
      </div>
    )
  }

  const isRegistered = registered.includes(selectedTournament.id)
  const capacityPercentage = Math.round(
    (selectedTournament.teams / selectedTournament.capacity) * 100,
  )
  return (
    <div className="page">
      <button
        className="back-to-catalog"
        onClick={() => setSelectedTournament(null)}
      >
        <Icon name="arrow" size={17} /> Kembali ke Semua Turnamen
      </button>
      <section className="tournament-hero">
        <img
          src={selectedTournament.image}
          alt={`Suasana turnamen ${selectedTournament.title}`}
        />
        <div className="hero-shade" />
        <div className="tournament-hero-copy">
          <Status
            tone={
              selectedTournament.status === "Pendaftaran Dibuka"
                ? "green"
                : selectedTournament.status === "Berlangsung"
                  ? "orange"
                  : "purple"
            }
          >
            {selectedTournament.status}
          </Status>
          <span className="event-code">
            AC / {selectedTournament.id.toUpperCase()}
          </span>
          <h2>{selectedTournament.title}</h2>
          <p>
            Turnamen VALORANT 5v5 terbesar musim ini. Rebut total hadiah dan
            buktikan tim terbaikmu.
          </p>
          <div className="event-meta">
            <span>
              <Icon name="calendar" />
              {selectedTournament.date}
            </span>
            <span>
              <Icon name="gamepad" />
              {selectedTournament.game} • {selectedTournament.format}
            </span>
            <span>
              <Icon name="trophy" />
              {selectedTournament.prize}
            </span>
          </div>
        </div>
      </section>
      <div className="tournament-layout">
        <section>
          <SectionTitle kicker="OVERVIEW" title="Tentang Turnamen" />
          <div className="content-card prose">
            <p>
              {selectedTournament.title} mempertemukan{" "}
              {selectedTournament.capacity} tim terbaik dari seluruh Indonesia
              dalam format single elimination. Seluruh pertandingan berlangsung
              online, dengan semifinal dan final disiarkan secara langsung.
            </p>
            <h3>Format Kompetisi</h3>
            <div className="format-grid">
              <div>
                <b>01</b>
                <strong>Babak Awal</strong>
                <span>Best of 1</span>
              </div>
              <div>
                <b>02</b>
                <strong>Quarterfinal</strong>
                <span>Best of 3</span>
              </div>
              <div>
                <b>03</b>
                <strong>Grand Final</strong>
                <span>Best of 5</span>
              </div>
            </div>
            <h3>Persyaratan</h3>
            <ul>
              <li>
                <Icon name="check" size={16} />
                Roster berisi tepat 5 pemain aktif
              </li>
              <li>
                <Icon name="check" size={16} />
                Seluruh pemain minimal berusia 16 tahun
              </li>
              <li>
                <Icon name="check" size={16} />
                Rank minimal Platinum pada musim berjalan
              </li>
            </ul>
          </div>
        </section>
        <aside>
          <div className="register-card">
            <span className="eyebrow">
              <i /> SLOT TIM
            </span>
            <div className="slot-count">
              <strong>{selectedTournament.teams}</strong>
              <span>
                / {selectedTournament.capacity}
                <br />
                TIM TERDAFTAR
              </span>
            </div>
            <div className="progress thick">
              <i style={{ width: `${capacityPercentage}%` }} />
            </div>
            <div className="capacity-label">
              <span>Kapasitas terisi</span>
              <b>{capacityPercentage}%</b>
            </div>
            <hr />
            <div className="deadline">
              <Icon name="clock" />
              <div>
                <span>Pendaftaran ditutup</span>
                <b>15 Juni 2025 • 23:59 WIB</b>
              </div>
            </div>
            <button
              className={`btn full ${isRegistered ? "registered" : "primary"}`}
              disabled={selectedTournament.status !== "Pendaftaran Dibuka"}
              onClick={() => {
                setRegistered([...registered, selectedTournament.id])
                toast("NOVA STRIKE berhasil didaftarkan.")
              }}
            >
              {isRegistered ? (
                <>
                  <Icon name="check" /> Tim Sudah Terdaftar
                </>
              ) : selectedTournament.status === "Pendaftaran Dibuka" ? (
                <>
                  Daftarkan NOVA STRIKE <Icon name="arrow" />
                </>
              ) : (
                <>Pendaftaran Belum Tersedia</>
              )}
            </button>
            <button
              className="btn ghost full"
              onClick={() => setPage("schedule")}
            >
              Lihat Jadwal
            </button>
          </div>
          <div className="organizer">
            <div className="organizer-logo">AC</div>
            <div>
              <span>DISELENGGARAKAN OLEH</span>
              <strong>Arena Core Official</strong>
              <small>
                <Icon name="check" size={12} /> Terverifikasi
              </small>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

const matches = [
  {
    id: "A-201",
    time: "15:00",
    a: "PHOENIX FIVE",
    ai: "P5",
    b: "VOID REAPERS",
    bi: "VR",
    stage: "Round of 32",
    live: true,
  },
  {
    id: "A-202",
    time: "17:00",
    a: "NOVA STRIKE",
    ai: "NS",
    b: "KRAKEN ID",
    bi: "KI",
    stage: "Round of 32",
  },
  {
    id: "A-203",
    time: "19:30",
    a: "RIFT WALKERS",
    ai: "RW",
    b: "ECHO PRIME",
    bi: "EP",
    stage: "Round of 32",
  },
]

function SchedulePage() {
  const [day, setDay] = useState(0)
  const dates = [
    ["18", "RAB"],
    ["19", "KAM"],
    ["20", "JUM"],
    ["21", "SAB"],
    ["22", "MIN"],
  ]
  return (
    <div className="page">
      <div className="schedule-head">
        <div>
          <span className="eyebrow">
            <i /> NEXUS CHAMPIONSHIP
          </span>
          <h2>
            JADWAL <em>PERTANDINGAN</em>
          </h2>
          <p>Semua waktu ditampilkan dalam zona WIB (UTC+7).</p>
        </div>
        <div className="tournament-select">
          <span>TURNAMEN</span>
          <button>
            Nexus Championship <Icon name="chevron" size={15} />
          </button>
        </div>
      </div>
      <div className="date-tabs">
        {dates.map((d, i) => (
          <button
            key={d[0]}
            className={day === i ? "active" : ""}
            onClick={() => setDay(i)}
          >
            <small>{d[1]}</small>
            <strong>{d[0]}</strong>
            <span>JUN</span>
            {i === 0 && <i />}
          </button>
        ))}
      </div>
      {day === 0 ? (
        <section className="match-day">
          <SectionTitle
            kicker="RABU, 18 JUNI"
            title="Round of 32"
            action={<span className="match-count">3 PERTANDINGAN</span>}
          />
          <div className="matches">
            {matches.map((m) => (
              <article className="match-card" key={m.id}>
                <div className="match-time">
                  <strong>{m.time}</strong>
                  <span>WIB</span>
                  {m.live && <Status tone="orange">LIVE</Status>}
                </div>
                <div className="match-main">
                  <div className="match-id">
                    <span>MATCH #{m.id}</span>
                    <small>{m.stage}</small>
                  </div>
                  <div className="versus">
                    <div>
                      <strong>{m.a}</strong>
                      <span className="mini-badge">{m.ai}</span>
                    </div>
                    <b>VS</b>
                    <div>
                      <span className="mini-badge alt">{m.bi}</span>
                      <strong>{m.b}</strong>
                    </div>
                  </div>
                </div>
                <button
                  className="icon-btn"
                  aria-label={`Detail pertandingan ${m.id}`}
                >
                  <Icon name="chevron" />
                </button>
              </article>
            ))}
          </div>
        </section>
      ) : (
        <div className="empty-state">
          <div>
            <Icon name="calendar" size={32} />
          </div>
          <h3>Jadwal segera hadir</h3>
          <p>
            Bracket untuk tanggal ini akan diumumkan setelah babak sebelumnya
            selesai.
          </p>
        </div>
      )}
    </div>
  )
}

type TournamentStatus = "Draft" | "Pendaftaran Dibuka" | "Berlangsung" | "Selesai" | "Diarsipkan"

type AdminTournament = {
  id: string
  name: string
  game: string
  teams: string
  status: TournamentStatus
}

type TeamRegistrationStatus = "Terverifikasi" | "Menunggu" | "Ditolak"

type AdminTeam = {
  name: string
  code: string
  captain: string
  members: number
  status: TeamRegistrationStatus
}

const initialAdminTeams: AdminTeam[] = [
  {
    name: "NOVA STRIKE",
    code: "NVST",
    captain: "RakaXtreme",
    members: 5,
    status: "Terverifikasi",
  },
  {
    name: "PHOENIX FIVE",
    code: "PHX5",
    captain: "AresNova",
    members: 5,
    status: "Terverifikasi",
  },
  {
    name: "VOID REAPERS",
    code: "VOID",
    captain: "Noctis",
    members: 5,
    status: "Menunggu",
  },
  {
    name: "KRAKEN ID",
    code: "KRKN",
    captain: "TidalWave",
    members: 4,
    status: "Menunggu",
  },
  {
    name: "ECHO PRIME",
    code: "ECHO",
    captain: "Reverb",
    members: 5,
    status: "Ditolak",
  },
]

const initialTeamsByTournament: Record<string, AdminTeam[]> = {
  nexus: initialAdminTeams,
  midnight: [
    {
      name: "GARUDA FORCE",
      code: "GRDA",
      captain: "SkyLark",
      members: 5,
      status: "Terverifikasi",
    },
    {
      name: "ONYX SQUAD",
      code: "ONYX",
      captain: "Mikael",
      members: 5,
      status: "Menunggu",
    },
    {
      name: "RED COMETS",
      code: "RDCM",
      captain: "Blaze",
      members: 4,
      status: "Menunggu",
    },
  ],
  apex: [],
}

const tournamentStatuses: TournamentStatus[] = [
  "Draft",
  "Pendaftaran Dibuka",
  "Berlangsung",
  "Selesai",
  "Diarsipkan",
]

function tournamentStatusTone(
  status: TournamentStatus,
): "green" | "purple" | "orange" | "blue" | "gray" {
  if (status === "Pendaftaran Dibuka") return "green"
  if (status === "Berlangsung") return "orange"
  if (status === "Selesai") return "blue"
  if (status === "Diarsipkan") return "gray"
  return "purple"
}

function AdminPage({ toast }: { toast: (s: string) => void }) {
  const [tournaments, setTournaments] = useState<AdminTournament[]>([
    {
      id: "nexus",
      name: "Nexus Championship",
      game: "VALORANT",
      teams: "24 / 32",
      status: "Pendaftaran Dibuka",
    },
    {
      id: "midnight",
      name: "Midnight Brawl #12",
      game: "MOBILE LEGENDS",
      teams: "12 / 16",
      status: "Berlangsung",
    },
    {
      id: "apex",
      name: "Apex Sunday Series",
      game: "APEX LEGENDS",
      teams: "0 / 20",
      status: "Draft",
    },
  ])
  const [modal, setModal] = useState<"tournament" | "match" | null>(null)
  const [actionMenu, setActionMenu] = useState<number | null>(null)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [teamManagerId, setTeamManagerId] = useState<string | null>(null)
  const [teamsByTournament, setTeamsByTournament] = useState(
    initialTeamsByTournament,
  )
  const [teamSearch, setTeamSearch] = useState("")
  const [teamFilter, setTeamFilter] =
    useState<"Semua" | TeamRegistrationStatus>("Semua")

  const managedTournament = tournaments.find(
    (tournament) => tournament.id === teamManagerId,
  )
  const managedTeams = teamManagerId
    ? (teamsByTournament[teamManagerId] ?? [])
    : []
  const visibleTeams = managedTeams.filter(
    (team) =>
      (teamFilter === "Semua" || team.status === teamFilter) &&
      `${team.name} ${team.captain}`
        .toLowerCase()
        .includes(teamSearch.toLowerCase()),
  )

  const updateTeamStatus = (code: string, status: TeamRegistrationStatus) => {
    if (!teamManagerId) return
    const team = managedTeams.find((item) => item.code === code)
    setTeamsByTournament({
      ...teamsByTournament,
      [teamManagerId]: managedTeams.map((item) =>
        item.code === code ? { ...item, status } : item,
      ),
    })
    toast(`${team?.name} ditandai sebagai ${status.toLowerCase()}.`)
  }

  const removeTeam = (code: string) => {
    if (!teamManagerId) return
    const team = managedTeams.find((item) => item.code === code)
    setTeamsByTournament({
      ...teamsByTournament,
      [teamManagerId]: managedTeams.filter((item) => item.code !== code),
    })
    toast(`${team?.name} telah dihapus dari turnamen.`)
  }

  const updateStatus = (index: number, status: TournamentStatus) => {
    setTournaments(
      tournaments.map((tournament, tournamentIndex) =>
        tournamentIndex === index ? { ...tournament, status } : tournament,
      ),
    )
    setActionMenu(null)
    toast(`Status ${tournaments[index].name} diubah menjadi ${status}.`)
  }

  const duplicateTournament = (index: number) => {
    const source = tournaments[index]
    setTournaments([
      ...tournaments,
      {
        ...source,
        id: `${source.id}-copy-${tournaments.length + 1}`,
        name: `${source.name} Copy`,
        teams: source.teams.replace(/^\d+/, "0"),
        status: "Draft",
      },
    ])
    setActionMenu(null)
    toast(`${source.name} berhasil diduplikasi sebagai draft.`)
  }

  const editTournament = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (editingIndex === null) return
    const data = new FormData(e.currentTarget)
    const updatedName = String(data.get("name"))
    setTournaments(
      tournaments.map((tournament, index) =>
        index === editingIndex
          ? {
              ...tournament,
              name: updatedName,
              game: String(data.get("game")),
              status: String(data.get("status")) as TournamentStatus,
            }
          : tournament,
      ),
    )
    setEditingIndex(null)
    toast(`${updatedName} berhasil diperbarui.`)
  }

  const addTournament = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    setTournaments([
      ...tournaments,
      {
        id: `tournament-${tournaments.length + 1}`,
        name: String(data.get("name")),
        game: String(data.get("game")),
        teams: "0 / 32",
        status: "Draft",
      },
    ])
    setModal(null)
    toast("Turnamen baru berhasil dibuat.")
  }
  return (
    <div className="page admin-page">
      <section className="admin-welcome" id="admin-overview">
        <div>
          <span className="eyebrow">
            <i /> CONTROL CENTER
          </span>
          <h2>
            KENDALIKAN <em>ARENA.</em>
          </h2>
          <p>Kelola turnamen, pertandingan, dan jadwal dari satu tempat.</p>
        </div>
        <div className="admin-actions">
          <button className="btn ghost" onClick={() => setModal("match")}>
            <Icon name="swords" /> Buat Pertandingan
          </button>
          <button
            className="btn primary"
            onClick={() => setModal("tournament")}
          >
            <Icon name="plus" /> Buat Turnamen
          </button>
        </div>
      </section>
      <section className="stats-grid admin-stats">
        {[
          [
            "Turnamen Aktif",
            String(
              tournaments.filter(
                (t) =>
                  t.status === "Pendaftaran Dibuka" ||
                  t.status === "Berlangsung",
              ).length,
            ).padStart(2, "0"),
            `${tournaments.filter((t) => t.status === "Pendaftaran Dibuka").length} pendaftaran dibuka`,
            "trophy",
          ],
          [
            "Total Tim",
            String(
              Object.values(teamsByTournament).reduce(
                (total, teams) => total + teams.length,
                0,
              ),
            ),
            "Di semua turnamen",
            "users",
          ],
          ["Match Hari Ini", "08", "1 sedang live", "swords"],
          [
            "Perlu Tindakan",
            String(
              Object.values(teamsByTournament)
                .flat()
                .filter((team) => team.status === "Menunggu").length,
            ).padStart(2, "0"),
            "Pendaftaran menunggu",
            "bell",
          ],
        ].map(([label, value, meta, icon], i) => (
          <article className="stat-card" key={label}>
            <div className={`stat-icon c${i}`}>
              <Icon name={icon as IconName} />
            </div>
            <span>{label}</span>
            <strong>{value}</strong>
            <small>{meta}</small>
          </article>
        ))}
      </section>
      <div className="admin-grid">
        <section id="admin-tournaments">
          <SectionTitle
            kicker="MANAGEMENT"
            title="Daftar Turnamen"
            action={
              <div className="section-actions">
                <button
                  className="text-btn manage-all-teams"
                  onClick={() => setTeamManagerId(tournaments[0]?.id ?? null)}
                >
                  <Icon name="users" size={15} /> Kelola Semua Tim
                </button>
                <button
                  className="text-btn"
                  onClick={() => setModal("tournament")}
                >
                  <Icon name="plus" size={15} /> Tambah Baru
                </button>
              </div>
            }
          />
          <div className="table-card">
            <div className="table-head">
              <span>TURNAMEN</span>
              <span>KAPASITAS</span>
              <span>STATUS</span>
              <span>AKSI</span>
            </div>
            {tournaments.map((t, i) => (
              <div className="table-row" key={`${t.name}-${i}`}>
                <div>
                  <span className="game-logo">
                    {t.name.slice(0, 2).toUpperCase()}
                  </span>
                  <p>
                    <strong>{t.name}</strong>
                    <small>{t.game}</small>
                  </p>
                </div>
                <span>
                  {
                    (teamsByTournament[t.id] ?? []).filter(
                      (team) => team.status !== "Ditolak",
                    ).length
                  }{" "}
                  / {t.teams.split("/")[1]?.trim() ?? "32"} TIM
                </span>
                <Status tone={tournamentStatusTone(t.status)}>
                  {t.status}
                </Status>
                <div className="table-actions">
                  <button
                    className="danger-icon"
                    aria-label={`Hapus ${t.name}`}
                    onClick={() => {
                      setTournaments(
                        tournaments.filter((_, index) => index !== i),
                      )
                      setActionMenu(null)
                      toast(`${t.name} telah dihapus.`)
                    }}
                  >
                    <Icon name="trash" size={17} />
                  </button>
                  <button
                    className="icon-btn"
                    aria-label={`Menu aksi ${t.name}`}
                    aria-expanded={actionMenu === i}
                    onClick={() => setActionMenu(actionMenu === i ? null : i)}
                  >
                    <Icon name="more" size={18} />
                  </button>
                  {actionMenu === i && (
                    <div className="tournament-menu">
                      <div className="menu-heading">
                        <span>AKSI TURNAMEN</span>
                        <strong>{t.name}</strong>
                      </div>
                      <button
                        onClick={() => {
                          setEditingIndex(i)
                          setActionMenu(null)
                        }}
                      >
                        <Icon name="grid" size={16} />
                        Edit detail
                      </button>
                      <button
                        onClick={() => {
                          setTeamManagerId(t.id)
                          setActionMenu(null)
                        }}
                      >
                        <Icon name="users" size={16} />
                        Kelola tim peserta
                      </button>
                      <button
                        onClick={() => {
                          setActionMenu(null)
                          setModal("match")
                        }}
                      >
                        <Icon name="calendar" size={16} />
                        Atur jadwal
                      </button>
                      <button onClick={() => duplicateTournament(i)}>
                        <Icon name="plus" size={16} />
                        Duplikat turnamen
                      </button>
                      <div className="menu-status">
                        <span>UBAH STATUS</span>
                        {tournamentStatuses.map((status) => (
                          <button
                            key={status}
                            className={t.status === status ? "selected" : ""}
                            onClick={() => updateStatus(i, status)}
                          >
                            <i
                              className={`status-dot ${tournamentStatusTone(status)}`}
                            />
                            {status}
                            {t.status === status && (
                              <Icon name="check" size={14} />
                            )}
                          </button>
                        ))}
                      </div>
                      <button
                        className="archive-action"
                        onClick={() => updateStatus(i, "Diarsipkan")}
                        disabled={t.status === "Diarsipkan"}
                      >
                        <Icon name="shield" size={16} />
                        Arsipkan turnamen
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
        <aside id="admin-schedule">
          <SectionTitle kicker="TODAY" title="Jadwal Hari Ini" />
          <div className="timeline">
            {matches.map((m, i) => (
              <div className="timeline-row" key={m.id}>
                <div>
                  <strong>{m.time}</strong>
                  <span>WIB</span>
                </div>
                <i className={i === 0 ? "live" : ""} />
                <p>
                  <span>MATCH #{m.id}</span>
                  <strong>
                    {m.a} <em>vs</em> {m.b}
                  </strong>
                  <small>
                    {i === 0 ? "Sedang berlangsung" : "Belum dimulai"}
                  </small>
                </p>
                <button
                  className="icon-btn"
                  aria-label="Atur jadwal"
                  onClick={() => toast(`Jadwal match ${m.id} siap diedit.`)}
                >
                  <Icon name="calendar" size={17} />
                </button>
              </div>
            ))}
            <button className="timeline-add" onClick={() => setModal("match")}>
              <Icon name="plus" size={16} /> Tambah pertandingan
            </button>
          </div>
        </aside>
      </div>
      {modal === "tournament" && (
        <Modal title="Buat Turnamen Baru" close={() => setModal(null)}>
          <form onSubmit={addTournament}>
            <label className="field-label">NAMA TURNAMEN</label>
            <input
              className="input"
              name="name"
              required
              placeholder="Contoh: Arena Masters"
            />
            <label className="field-label">GAME</label>
            <select className="input" name="game">
              <option>VALORANT</option>
              <option>MOBILE LEGENDS</option>
              <option>APEX LEGENDS</option>
            </select>
            <button className="btn primary full" type="submit">
              Buat Turnamen <Icon name="arrow" />
            </button>
          </form>
        </Modal>
      )}
      {editingIndex !== null && (
        <Modal title="Edit Detail Turnamen" close={() => setEditingIndex(null)}>
          <form onSubmit={editTournament}>
            <label className="field-label" htmlFor="edit-name">
              NAMA TURNAMEN
            </label>
            <input
              className="input"
              id="edit-name"
              name="name"
              required
              defaultValue={tournaments[editingIndex].name}
            />
            <label className="field-label" htmlFor="edit-game">
              GAME
            </label>
            <select
              className="input"
              id="edit-game"
              name="game"
              defaultValue={tournaments[editingIndex].game}
            >
              <option>VALORANT</option>
              <option>MOBILE LEGENDS</option>
              <option>APEX LEGENDS</option>
            </select>
            <label className="field-label" htmlFor="edit-status">
              STATUS
            </label>
            <select
              className="input"
              id="edit-status"
              name="status"
              defaultValue={tournaments[editingIndex].status}
            >
              {tournamentStatuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
            <button className="btn primary full" type="submit">
              Simpan Perubahan <Icon name="check" />
            </button>
          </form>
        </Modal>
      )}
      {teamManagerId !== null && managedTournament && (
        <Modal
          key={teamManagerId}
          title="Kelola Tim Peserta"
          close={() => {
            setTeamManagerId(null)
            setTeamSearch("")
            setTeamFilter("Semua")
          }}
          wide
        >
          <div className="team-manager">
            <div className="tournament-switcher">
              <div>
                <span>PILIH TURNAMEN</span>
                <p>
                  Berpindah turnamen tanpa kembali ke daftar atau melakukan
                  pencarian ulang.
                </p>
              </div>
              <label>
                <Icon name="trophy" size={17} />
                <select
                  aria-label="Pilih turnamen yang akan dikelola"
                  value={teamManagerId}
                  onChange={(event) => {
                    setTeamManagerId(event.target.value)
                    setTeamSearch("")
                    setTeamFilter("Semua")
                  }}
                >
                  {tournaments.map((tournament) => (
                    <option key={tournament.id} value={tournament.id}>
                      {tournament.name} · {tournament.status}
                    </option>
                  ))}
                </select>
                <Icon name="chevron" size={16} />
              </label>
            </div>
            <div className="team-manager-summary">
              <div>
                <span>TURNAMEN</span>
                <strong>{managedTournament.name}</strong>
                <small>
                  {managedTournament.game} · {managedTournament.status}
                </small>
              </div>
              <div className="team-summary-count">
                <strong>
                  {
                    managedTeams.filter(
                      (team) => team.status === "Terverifikasi",
                    ).length
                  }
                </strong>
                <span>TIM LOLOS</span>
              </div>
              <div className="team-summary-count pending">
                <strong>
                  {
                    managedTeams.filter((team) => team.status === "Menunggu")
                      .length
                  }
                </strong>
                <span>MENUNGGU</span>
              </div>
            </div>
            <div className="team-manager-tools">
              <label className="team-search">
                <Icon name="search" size={17} />
                <input
                  aria-label="Cari tim atau kapten"
                  placeholder="Cari tim atau kapten..."
                  value={teamSearch}
                  onChange={(event) => setTeamSearch(event.target.value)}
                />
              </label>
              <button
                className="invite-team"
                onClick={() => toast("Tautan undangan tim berhasil disalin.")}
              >
                <Icon name="plus" size={16} />
                Undang Tim
              </button>
            </div>
            <div className="team-filter" aria-label="Filter status tim">
              {(["Semua", "Terverifikasi", "Menunggu", "Ditolak"] as const).map(
                (filter) => (
                  <button
                    key={filter}
                    className={teamFilter === filter ? "active" : ""}
                    onClick={() => setTeamFilter(filter)}
                  >
                    {filter}
                    <span>
                      {filter === "Semua"
                        ? managedTeams.length
                        : managedTeams.filter((team) => team.status === filter)
                            .length}
                    </span>
                  </button>
                ),
              )}
            </div>
            <div className="managed-team-list">
              {visibleTeams.length > 0 ? (
                visibleTeams.map((team) => (
                  <article className="managed-team" key={team.code}>
                    <div className="managed-team-logo">
                      {team.code.slice(0, 2)}
                    </div>
                    <div className="managed-team-name">
                      <strong>{team.name}</strong>
                      <small>
                        ID {team.code} · Kapten {team.captain}
                      </small>
                    </div>
                    <div className="managed-team-roster">
                      <span>ROSTER</span>
                      <strong>{team.members}/5 pemain</strong>
                    </div>
                    <Status
                      tone={
                        team.status === "Terverifikasi"
                          ? "green"
                          : team.status === "Menunggu"
                            ? "orange"
                            : "gray"
                      }
                    >
                      {team.status}
                    </Status>
                    <div className="managed-team-actions">
                      {team.status !== "Terverifikasi" && (
                        <button
                          className="approve-team"
                          onClick={() =>
                            updateTeamStatus(team.code, "Terverifikasi")
                          }
                          disabled={team.members < 5}
                          title={
                            team.members < 5
                              ? "Roster harus berisi 5 pemain"
                              : "Setujui tim"
                          }
                        >
                          <Icon name="check" size={16} />
                          Setujui
                        </button>
                      )}
                      {team.status === "Menunggu" && (
                        <button
                          className="reject-team"
                          onClick={() => updateTeamStatus(team.code, "Ditolak")}
                          aria-label={`Tolak ${team.name}`}
                        >
                          <Icon name="close" size={16} />
                        </button>
                      )}
                      {team.status === "Terverifikasi" && (
                        <button
                          className="reject-team"
                          onClick={() => removeTeam(team.code)}
                          aria-label={`Hapus ${team.name} dari turnamen`}
                        >
                          <Icon name="trash" size={16} />
                        </button>
                      )}
                    </div>
                  </article>
                ))
              ) : (
                <div className="team-empty">
                  <Icon name="users" size={26} />
                  <strong>Tim tidak ditemukan</strong>
                  <span>Coba kata kunci atau filter yang berbeda.</span>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
      {modal === "match" && (
        <Modal title="Buat Pertandingan" close={() => setModal(null)}>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              setModal(null)
              toast("Pertandingan berhasil ditambahkan ke jadwal.")
            }}
          >
            <label className="field-label">TIM A</label>
            <input className="input" required placeholder="Pilih tim pertama" />
            <label className="field-label">TIM B</label>
            <input className="input" required placeholder="Pilih tim kedua" />
            <div className="split-fields">
              <div>
                <label className="field-label">TANGGAL</label>
                <input className="input" type="date" required />
              </div>
              <div>
                <label className="field-label">WAKTU</label>
                <input className="input" type="time" required />
              </div>
            </div>
            <button className="btn primary full" type="submit">
              Simpan Jadwal <Icon name="calendar" />
            </button>
          </form>
        </Modal>
      )}
    </div>
  )
}

function Modal({
  title,
  close,
  children,
  wide = false,
}: {
  title: string
  close: () => void
  children: ReactNode
  wide?: boolean
}) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={close}>
      <div
        className={`modal ${wide ? "modal-wide" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <div>
            <span>ARENA CORE</span>
            <h2>{title}</h2>
          </div>
          <button
            className="icon-btn"
            onClick={close}
            aria-label="Tutup dialog"
          >
            <Icon name="close" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function AuthPage({
  onLogin,
  initialRegister = false,
}: {
  onLogin: (username: string) => void
  initialRegister?: boolean
}) {
  const [register, setRegister] = useState(initialRegister)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [errorMsg, setErrorMsg] = useState("")
  const [loading, setLoading] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setErrorMsg("")
    setLoading(true)

    if (register) {
      const res = await api.register(username, password)
      if (!res.ok) {
        setErrorMsg(res.message || "Gagal registrasi akun")
        setLoading(false)
        return
      }
      // Otomatis login setelah registrasi
      const loginRes = await api.login(username, password)
      setLoading(false)
      if (loginRes.ok && loginRes.data) {
        setStoredAuth(loginRes.data.access_token, username)
        onLogin(username)
      } else {
        setRegister(false)
        setErrorMsg("Registrasi sukses! Silakan login.")
      }
    } else {
      const res = await api.login(username, password)
      setLoading(false)
      if (!res.ok || !res.data) {
        setErrorMsg(res.message || "Username atau password salah")
        return
      }
      setStoredAuth(res.data.access_token, username)
      onLogin(username)
    }
  }
  return (
    <main className="auth-page">
      <section
        className="auth-visual"
        style={{ backgroundImage: `url(${photos.players})` }}
      >
        <div className="auth-overlay" />
        <div className="auth-logo">
          <Logo />
        </div>
        <div className="auth-quote">
          <span className="eyebrow">
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
          <div className="auth-stats">
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
        <small className="photo-credit">Foto oleh ELLA DON / Unsplash</small>
      </section>
      <section className="auth-form-wrap">
        <div className="auth-mobile-logo">
          <Logo />
        </div>
        <div className="auth-form">
          <span className="eyebrow">
            <i /> PLAYER ACCESS
          </span>
          <h2>{register ? "BUAT AKUN BARU" : "SELAMAT DATANG"}</h2>
          <p>
            {register
              ? "Daftar dan mulai perjalanan kompetitifmu."
              : "Masuk untuk melanjutkan perjalananmu di arena."}
          </p>
          <div className="auth-tabs">
            <button
              className={!register ? "active" : ""}
              onClick={() => setRegister(false)}
            >
              MASUK
            </button>
            <button
              className={register ? "active" : ""}
              onClick={() => setRegister(true)}
            >
              DAFTAR
            </button>
          </div>
          <form onSubmit={submit}>
            {errorMsg && (
              <div style={{ padding: "10px 14px", background: "rgba(255, 118, 87, 0.15)", border: "1px solid var(--orange)", borderRadius: "4px", color: "var(--orange)", marginBottom: "16px", fontSize: "12px" }}>
                {errorMsg}
              </div>
            )}
            <label className="field-label" htmlFor="username">
              USERNAME
            </label>
            <div className="input-icon">
              <Icon name="user" />
              <input
                id="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username (min 3 karakter)"
              />
            </div>
            <div className="label-row">
              <label className="field-label" htmlFor="password">
                PASSWORD
              </label>
              {!register && <button type="button">Lupa password?</button>}
            </div>
            <div className="input-icon">
              <Icon name="lock" />
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                placeholder="••••••••••••"
              />
            </div>
            {register && (
              <label className="terms">
                <input type="checkbox" required />
                <span>
                  Saya menyetujui <a href="#">Syarat Layanan</a> dan{" "}
                  <a href="#">Kebijakan Privasi</a>.
                </span>
              </label>
            )}
            <button className="btn primary full auth-submit" type="submit" disabled={loading}>
              {loading ? "Memproses..." : register ? "Buat Akun" : "Masuk ke Arena"} <Icon name="arrow" />
            </button>
          </form>
          <div className="divider">
            <span>ATAU LANJUTKAN DENGAN</span>
          </div>
          <button className="social-btn" onClick={() => onLogin("GuestPlayer")}>
            <span>G</span> Google
          </button>
          <p className="switch-auth">
            {register ? "Sudah punya akun?" : "Belum punya akun?"}{" "}
            <button onClick={() => setRegister(!register)}>
              {register ? "Masuk sekarang" : "Daftar gratis"}
            </button>
          </p>
        </div>
      </section>
    </main>
  )
}

const pagePaths: Record<Page, string> = {
  dashboard: "/",
  team: "/teams",
  tournament: "/tournaments",
  schedule: "/schedule",
  admin: "/admin",
  login: "/login",
}

const pathPages: Record<string, Page> = {
  "/": "dashboard",
  "/teams": "team",
  "/tournaments": "tournament",
  "/schedule": "schedule",
  "/admin": "admin",
  "/login": "login",
  "/register": "login",
}

export function ScreenGallery() {
  const screens = [
    {
      title: "Login",
      path: "/login",
      group: "Account",
      description: "Akses player dan admin.",
      icon: "lock" as IconName,
    },
    {
      title: "Register",
      path: "/register",
      group: "Account",
      description: "Pendaftaran akun player baru.",
      icon: "user" as IconName,
    },
    {
      title: "Dashboard Player",
      path: "/",
      group: "Player",
      description: "Ringkasan rank, statistik, dan aktivitas.",
      icon: "grid" as IconName,
    },
    {
      title: "Tim Player",
      path: "/teams",
      group: "Player",
      description: "Hub multi-tim dan pengelolaan roster.",
      icon: "users" as IconName,
    },
    {
      title: "Katalog Turnamen",
      path: "/tournaments",
      group: "Player",
      description: "Daftar, filter, dan detail turnamen.",
      icon: "trophy" as IconName,
    },
    {
      title: "Jadwal Pertandingan",
      path: "/schedule",
      group: "Player",
      description: "Jadwal pertandingan per tanggal.",
      icon: "calendar" as IconName,
    },
    {
      title: "Admin Control Center",
      path: "/admin",
      group: "Admin",
      description: "Turnamen, tim peserta, dan jadwal admin.",
      icon: "shield" as IconName,
    },
  ]

  return (
    <div className="screen-gallery">
      <div className="gallery-header">
        <div>
          <span>ARENA CORE · DESIGN HANDOFF</span>
          <h1>Screen Gallery</h1>
          <p>
            Pilih satu screen lalu buka dalam ukuran penuh sebelum menggunakan
            Copy to Figma Design. Preview bertingkat dinonaktifkan agar proses
            source resolution tetap cepat.
          </p>
        </div>
        <a href="/">
          Buka Aplikasi <Icon name="arrow" size={17} />
        </a>
      </div>
      <nav className="gallery-index" aria-label="Daftar screen">
        {screens.map((screen, index) => (
          <a href={`#screen-${index + 1}`} key={screen.path}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            {screen.title}
          </a>
        ))}
      </nav>
      <div className="gallery-grid">
        {screens.map((screen, index) => (
          <div
            className="gallery-frame-card"
            id={`screen-${index + 1}`}
            key={screen.path}
          >
            <div className="gallery-frame-title">
              <div>
                <span>{screen.group}</span>
                <h2>{screen.title}</h2>
                <code>{screen.path}</code>
              </div>
              <a href={screen.path} target="_blank" rel="noreferrer">
                Buka Full Screen <Icon name="arrow" size={15} />
              </a>
            </div>
            <a className="gallery-screen-link" href={screen.path}>
              <div
                className={`gallery-screen-number gallery-color-${index % 3}`}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <Icon name={screen.icon} size={30} />
              </div>
              <div>
                <span>{screen.group}</span>
                <strong>{screen.title}</strong>
                <p>{screen.description}</p>
              </div>
              <Icon name="arrow" size={22} />
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const page = pathPages[location.pathname] ?? "dashboard"
  const setPage = (nextPage: Page) => navigate(pagePaths[nextPage])
  const [currentUser, setCurrentUser] = useState<string>(getStoredAuth().username || "Player")
  const [mobileNav, setMobileNav] = useState(false)
  const [message, setMessage] = useState("")
  const toast = (text: string) => {
    setMessage(text)
    window.setTimeout(() => setMessage(""), 2800)
  }
  const logout = () => {
    clearStoredAuth()
    setCurrentUser("Player")
    navigate("/login")
    toast("Berhasil keluar dari akun")
  }
  if (page === "login")
    return (
      <AuthPage
        initialRegister={location.pathname === "/register"}
        onLogin={(username) => {
          setCurrentUser(username)
          navigate("/")
          toast(`Selamat datang, ${username}!`)
        }}
      />
    )
  if (page === "admin")
    return (
      <div className="app-shell admin-shell">
        <div className="main-shell">
          <AdminHeader logout={() => navigate("/login")} />
          <main>
            <AdminPage toast={toast} />
          </main>
        </div>
        {message && (
          <div className="toast" role="status">
            <span>
              <Icon name="check" size={16} />
            </span>
            {message}
          </div>
        )}
      </div>
    )
  return (
    <div className="app-shell">
      <Sidebar
        page={page}
        setPage={setPage}
        open={mobileNav}
        close={() => setMobileNav(false)}
        username={currentUser}
        onLogout={logout}
      />
      <div className="main-shell">
        <Header page={page} openMenu={() => setMobileNav(true)} />
        <main>
          {page === "dashboard" && <Dashboard setPage={setPage} />}
          {page === "team" && <TeamPage toast={toast} />}
          {page === "tournament" && (
            <TournamentPage toast={toast} setPage={setPage} />
          )}
          {page === "schedule" && <SchedulePage />}
        </main>
      </div>
      {message && (
        <div className="toast" role="status">
          <span>
            <Icon name="check" size={16} />
          </span>
          {message}
        </div>
      )}
    </div>
  )
}
