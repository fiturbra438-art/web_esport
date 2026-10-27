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

type Page = "dashboard" | "profile" | "team" | "tournament" | "schedule" | "admin" | "login"
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
  { page: "profile", label: "Profil Saya", icon: "user" },
  { page: "team", label: "Tim Saya", icon: "users" },
  { page: "tournament", label: "Turnamen", icon: "trophy" },
  { page: "schedule", label: "Jadwal", icon: "calendar" },
]

const pageTitles: Record<Page, string> = {
  dashboard: "Dashboard Player",
  profile: "Profil Player & Statistik",
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
  role,
  onLogout,
}: {
  page: Page
  setPage: (p: Page) => void
  open: boolean
  close: () => void
  username: string
  role: string
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
          {role === "admin" && (
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
          )}
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

function Header({
  page,
  openMenu,
  onUpdateUsername,
}: {
  page: Page
  openMenu: () => void
  onUpdateUsername?: () => void
}) {
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
        {onUpdateUsername && (
          <button
            className="btn ghost"
            style={{ fontSize: "12px", padding: "6px 12px", minHeight: "34px" }}
            onClick={onUpdateUsername}
            title="Ubah Username Player"
          >
            <Icon name="user" size={14} /> Ganti Username
          </button>
        )}
        <button className="icon-btn notification" aria-label="Notifikasi">
          <Icon name="bell" size={19} />
          <i />
        </button>
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
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [tournaments, setTournaments] = useState<ApiTournament[]>([])
  const [teams, setTeams] = useState<ApiTeamSummary[]>([])
  const auth = getStoredAuth()

  useEffect(() => {
    if (auth.username) {
      api.getProfileByUsername(auth.username).then((res) => {
        if (res.ok && res.data) setProfile(res.data)
      })
    }
    api.getTournaments().then((res) => {
      if (res.ok && res.data) setTournaments(res.data)
    })
    api.getTeams().then((res) => {
      if (res.ok && res.data) setTeams(res.data)
    })
  }, [auth.username])

  const username = profile?.username || auth.username || "Player"
  const mmr = profile?.mmr_point ?? 1000

  return (
    <div className="page dashboard-page">
      <section className="welcome-banner">
        <div className="banner-grid" />
        <div className="welcome-copy">
          <span className="eyebrow">
            <i /> PLAYER HUB {auth.role === "admin" && "(ADMIN)"}
          </span>
          <h2>
            SELAMAT DATANG, <em>{username.toUpperCase()}.</em>
          </h2>
          <p>Kelola tim dan turnamen secara real-time langsung melalui Rust backend API.</p>
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
          <span>MMR & RANKING</span>
          <div className="rank-emblem">
            <Icon name="shield" size={44} />
            <b>{Math.floor(mmr / 500)}</b>
          </div>
          <strong>{mmr >= 2000 ? "MASTER" : mmr >= 1500 ? "DIAMOND" : "GOLD"} TIER</strong>
          <small>{mmr} MMR Point</small>
          <div className="progress">
            <i style={{ width: `${Math.min(100, (mmr / 2500) * 100)}%` }} />
          </div>
        </div>
      </section>

      <section className="stats-grid">
        {[
          ["Turnamen Aktif", String(tournaments.length), "Tersedia di Rust API", "trophy"],
          ["Tim Terdaftar", String(teams.length), "Di seluruh liga", "users"],
          ["Status Akun", auth.role === "admin" ? "ADMINISTRATOR" : "VERIFIED PLAYER", auth.username ? "Online" : "Guest", "shield"],
          ["MMR Point", String(mmr), "#Regional Rank", "bolt"],
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
            kicker="REAL-TIME"
            title="Turnamen Terdaftar di API"
            action={
              <button
                className="text-btn"
                onClick={() => setPage("tournament")}
              >
                Lihat Semua <Icon name="arrow" size={15} />
              </button>
            }
          />
          {tournaments.length > 0 ? (
            tournaments.slice(0, 3).map((t) => (
              <TournamentRow
                key={t.id}
                image={photos.arena}
                title={t.name}
                game={`Max ${t.total_slots} Tim • ${t.available_slots} Slot Tersisa`}
                date={`ID #${t.id}`}
                status={t.status || "open"}
                onClick={() => setPage("tournament")}
              />
            ))
          ) : (
            <div className="empty-state" style={{ padding: "20px" }}>
              <p>Belum ada turnamen di database Rust. Buat baru di halaman Admin.</p>
            </div>
          )}
        </section>
        <section>
          <SectionTitle kicker="TEAMS DIRECTORY" title="Daftar Tim Terdaftar" />
          <div className="activity-card">
            {teams.length > 0 ? (
              teams.slice(0, 4).map((tm, i) => (
                <div className="activity" key={tm.id}>
                  <span className={`activity-icon a${i % 3}`}>
                    <Icon name="users" size={17} />
                  </span>
                  <div>
                    <strong>{tm.name}</strong>
                    <p>Kapten: {tm.captain_username} • {tm.member_count} Anggota</p>
                    <small>ID #{tm.id}</small>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ padding: "20px", color: "var(--muted)" }}>Belum ada tim yang terdaftar.</p>
            )}
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

function ProfilePage({
  setPage,
  toast,
  onUpdateUsername,
}: {
  setPage: (p: Page) => void
  toast: (s: string) => void
  onUpdateUsername: () => void
}) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [myTeams, setMyTeams] = useState<ApiTeamSummary[]>([])
  const [allTeams, setAllTeams] = useState<ApiTeamSummary[]>([])
  const [loading, setLoading] = useState(true)
  const auth = getStoredAuth()

  useEffect(() => {
    if (auth.username) {
      api.getProfileByUsername(auth.username).then((res) => {
        if (res.ok && res.data) setProfile(res.data)
        setLoading(false)
      })
    } else {
      setLoading(false)
    }

    api.getTeams().then((res) => {
      if (res.ok && res.data) {
        setAllTeams(res.data)
        setMyTeams(res.data.filter((t) => t.captain_username === auth.username))
      }
    })
  }, [auth.username])

  if (!auth.username) {
    return (
      <div className="page" style={{ textAlign: "center", paddingTop: "80px" }}>
        <div style={{ maxWidth: "440px", margin: "auto", background: "var(--panel)", padding: "32px", border: "1px solid var(--line)" }}>
          <Icon name="lock" size={44} />
          <h2 style={{ margin: "16px 0 8px" }}>Belum Masuk</h2>
          <p style={{ color: "var(--muted)", marginBottom: "20px" }}>
            Silakan login untuk melihat dashboard profil dan riwayat kompetisimu.
          </p>
          <button className="btn primary full" onClick={() => setPage("login")}>
            Masuk ke Arena
          </button>
        </div>
      </div>
    )
  }

  const mmr = profile?.mmr_point ?? 1000
  const tier = mmr >= 2200 ? "CHALLENGER" : mmr >= 1900 ? "MASTER" : mmr >= 1500 ? "DIAMOND" : "GOLD"

  return (
    <div className="page profile-page">
      <section className="welcome-banner" style={{ minHeight: "220px", marginBottom: "28px" }}>
        <div className="banner-grid" />
        <div className="welcome-copy">
          <span className="eyebrow">
            <i /> OFFICIAL PROFILE CARD
          </span>
          <h2>
            {profile?.username || auth.username} <em>#{profile?.id || "ID"}</em>
          </h2>
          <p>
            Role: <strong>{(auth.role || "user").toUpperCase()}</strong> • Status: Terverifikasi di Database
          </p>
          <div className="banner-actions" style={{ marginTop: "18px" }}>
            <button className="btn primary" onClick={onUpdateUsername}>
              <Icon name="user" size={16} /> Ubah Username
            </button>
            <button className="btn ghost" onClick={() => setPage("team")}>
              Kelola Tim Saya
            </button>
          </div>
        </div>
        <div className="rank-card">
          <span>RANK & TIER</span>
          <div className="rank-emblem">
            <Icon name="shield" size={44} />
            <b>{Math.floor(mmr / 500)}</b>
          </div>
          <strong>{tier} TIER</strong>
          <small>{mmr} Rating Points (MMR)</small>
          <div className="progress">
            <i style={{ width: `${Math.min(100, (mmr / 2500) * 100)}%` }} />
          </div>
        </div>
      </section>

      <section className="stats-grid">
        {[
          ["Player ID", `#${profile?.id || "-"}`, "Database Primary Key", "shield"],
          ["Rating MMR", `${mmr} PTS`, "Poin Kompetitif", "bolt"],
          ["Tim Dipimpin", `${myTeams.length} Tim`, "Sebagai Kapten", "crown"],
          ["Akses Role", (auth.role || "user").toUpperCase(), "Hak akses sistem", "users"],
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

      <div className="dashboard-columns" style={{ marginTop: "32px" }}>
        <section>
          <SectionTitle kicker="CAPTAINCY" title="Tim yang Kamu Pimpin" />
          <div className="roster-list" style={{ marginTop: "14px" }}>
            {myTeams.length > 0 ? (
              myTeams.map((t, idx) => (
                <article className="roster-row" key={t.id} style={{ cursor: "pointer" }} onClick={() => setPage("team")}>
                  <div className={`avatar large av${idx % 4}`}>
                    {t.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="member-name">
                    <strong>{t.name}</strong>
                    <small>ID #{t.id} • {t.member_count} Anggota</small>
                  </div>
                  <div className="member-role">
                    <span>ROLE</span>
                    <strong>KAPTEN</strong>
                  </div>
                  <Status tone="purple">Kapten</Status>
                </article>
              ))
            ) : (
              <p style={{ padding: "20px", color: "var(--muted)" }}>
                Kamu belum memimpin tim. Buat tim baru di menu "Tim Saya".
              </p>
            )}
          </div>
        </section>

        <aside>
          <SectionTitle kicker="SECURITY" title="Informasi Keamanan Akun" />
          <div className="info-card">
            <div className="info-row">
              <span>Enkripsi Password</span>
              <b>Argon2id Safe</b>
            </div>
            <div className="info-row">
              <span>Otorisasi Session</span>
              <b>JWT Bearer Token</b>
            </div>
            <div className="info-row">
              <span>Masa Berlaku Token</span>
              <b>1 Jam (3600s)</b>
            </div>
            <div className="info-row">
              <span>Status Akun</span>
              <Status tone="green">Aktif & Aman</Status>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

function TeamPage({ toast }: { toast: (s: string) => void }) {
  const [allTeams, setAllTeams] = useState<ApiTeamSummary[]>([])
  const [joinedTeams, setJoinedTeams] = useState<ApiTeamSummary[]>([])
  const [selectedTeamName, setSelectedTeamName] = useState<string | null>(null)
  const [teamDetail, setTeamDetail] = useState<ApiTeamDetail | null>(null)
  const [joinOpen, setJoinOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [teamNameInput, setTeamNameInput] = useState("")
  const [targetTeamJoin, setTargetTeamJoin] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingJoined, setLoadingJoined] = useState(true)
  const auth = getStoredAuth()

  const loadTeams = async () => {
    setLoadingJoined(true)
    const res = await api.getTeams()
    if (res.ok && res.data) {
      setAllTeams(res.data)
      if (!auth.username) {
        setJoinedTeams([])
        setLoadingJoined(false)
        return
      }

      // Cari tim-tim di mana user ini adalah anggota (baik kapten maupun member aktif)
      const joined: ApiTeamSummary[] = []
      await Promise.all(
        res.data.map(async (t) => {
          // Jika dia kaptennya, pasti anggota
          if (t.captain_username === auth.username) {
            joined.push(t)
            return
          }
          // Periksa detail tim untuk memastikan user ada di daftar members
          const detailRes = await api.getTeamProfile(t.name)
          if (detailRes.ok && detailRes.data) {
            const isMember = detailRes.data.members.some(
              (m) => m.username === auth.username
            )
            if (isMember) {
              joined.push(t)
            }
          }
        })
      )
      setJoinedTeams(joined)
    }
    setLoadingJoined(false)
  }

  useEffect(() => {
    loadTeams()
  }, [auth.username])

  useEffect(() => {
    if (selectedTeamName) {
      api.getTeamProfile(selectedTeamName).then((res) => {
        if (res.ok && res.data) setTeamDetail(res.data)
      })
    } else {
      setTeamDetail(null)
    }
  }, [selectedTeamName])

  const handleCreateTeam = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!auth.username) {
      toast("Silakan login terlebih dahulu untuk membuat tim.")
      return
    }
    setLoading(true)
    const res = await api.createTeam(teamNameInput, auth.username)
    setLoading(false)
    if (res.ok) {
      toast(`Tim "${teamNameInput}" berhasil dibuat!`)
      setCreateOpen(false)
      setTeamNameInput("")
      loadTeams()
      setSelectedTeamName(teamNameInput)
    } else {
      toast(res.message || "Gagal membuat tim")
    }
  }

  const handleJoinTeam = async (teamName: string) => {
    if (!auth.username) {
      toast("Silakan login terlebih dahulu untuk bergabung ke tim.")
      return
    }
    setLoading(true)
    const res = await api.joinTeam(teamName)
    setLoading(false)
    if (res.ok) {
      toast(`Berhasil bergabung ke tim ${teamName}!`)
      setJoinOpen(false)
      loadTeams()
      if (selectedTeamName === teamName) {
        api.getTeamProfile(teamName).then((r) => r.ok && r.data && setTeamDetail(r.data))
      }
    } else {
      toast(res.message || "Gagal bergabung ke tim")
    }
  }

  const handleLeaveTeam = async (teamName: string) => {
    if (isCaptain) {
      const eligibleMembers = teamDetail?.members.filter((m) => m.username !== auth.username) || []
      if (eligibleMembers.length === 0) {
        if (confirm(`Sebagai satu-satunya anggota dan kapten, keluar akan membubarkan tim ${teamName}. Lanjutkan bubarkan tim?`)) {
          return handleDeleteTeam(teamName)
        }
        return
      }
      const newCap = prompt(
        `Sebagai kapten, Anda wajib menentukan kapten baru sebelum keluar.\nPilih salah satu anggota:\n${eligibleMembers.map((m) => m.username).join(", ")}`
      )
      if (!newCap) return
      const res = await api.leaveTeam(teamName, newCap.trim())
      if (res.ok) {
        toast(`Berhasil keluar dari tim ${teamName}. Kapten baru: ${newCap}`)
        loadTeams()
        setSelectedTeamName(null)
      } else {
        toast(res.message || "Gagal keluar dari tim")
      }
      return
    }

    if (!confirm(`Yakin ingin keluar dari tim ${teamName}?`)) return
    const res = await api.leaveTeam(teamName)
    if (res.ok) {
      toast(`Berhasil keluar dari tim ${teamName}`)
      loadTeams()
      setSelectedTeamName(null)
    } else {
      toast(res.message || "Gagal keluar dari tim")
    }
  }

  const handleDeleteTeam = async (teamName: string) => {
    if (!confirm(`Yakin ingin membubarkan tim ${teamName}?`)) return
    const res = await api.deleteTeam(teamName)
    if (res.ok) {
      toast(`Tim ${teamName} berhasil dibubarkan`)
      loadTeams()
      setSelectedTeamName(null)
    } else {
      toast(res.message || "Hanya kapten yang dapat membubarkan tim")
    }
  }

  const handleTransferCaptain = async (teamName: string, newCaptain: string) => {
    const res = await api.transferCaptain(teamName, newCaptain)
    if (res.ok) {
      toast(`Kapten tim berhasil dipindahkan ke ${newCaptain}`)
      api.getTeamProfile(teamName).then((r) => r.ok && r.data && setTeamDetail(r.data))
    } else {
      toast(res.message || "Gagal memindahkan kapten")
    }
  }

  const handleRemoveMember = async (teamName: string, memberUsername: string) => {
    const res = await api.removeTeamMember(teamName, memberUsername)
    if (res.ok) {
      toast(`${memberUsername} berhasil dikeluarkan dari tim`)
      api.getTeamProfile(teamName).then((r) => r.ok && r.data && setTeamDetail(r.data))
    } else {
      toast(res.message || "Gagal mengeluarkan anggota")
    }
  }

  if (!selectedTeamName || !teamDetail) {
    return (
      <div className="page team-hub">
        <section className="team-hub-head">
          <div>
            <span className="eyebrow">
              <i /> MY SQUADS
            </span>
            <h2>
              TIM <em>SAYA.</em>
            </h2>
            <p>
              Daftar tim esport di mana Anda terdaftar sebagai anggota atau kapten tim.
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
            <strong>{joinedTeams.length}</strong>
            <span>TIM YANG DIIKUTI</span>
          </div>
          <div>
            <strong>{joinedTeams.filter((t) => t.captain_username === auth.username).length}</strong>
            <span>SEBAGAI KAPTEN</span>
          </div>
          <div>
            <strong>5</strong>
            <span>MAX ROSTER</span>
          </div>
        </div>
        <SectionTitle kicker="JOINED TEAMS" title="Tim yang Kamu Masuki" />
        {loadingJoined ? (
          <p style={{ padding: "20px", color: "var(--muted)" }}>Memuat tim yang kamu ikuti...</p>
        ) : joinedTeams.length > 0 ? (
          <div className="player-team-grid">
            {joinedTeams.map((team, index) => {
              const isMyTeam = team.captain_username === auth.username
              return (
                <button
                  className="player-team-card"
                  key={team.id}
                  onClick={() => setSelectedTeamName(team.name)}
                >
                  <div className={`player-team-cover team-gradient-${index % 3}`}>
                    <span className="player-team-mark">
                      {team.name.slice(0, 2).toUpperCase()}
                    </span>
                    <Status tone={isMyTeam ? "purple" : "green"}>
                      {isMyTeam ? "Kapten" : "Anggota"}
                    </Status>
                  </div>
                  <div className="player-team-body">
                    <span>ID #{team.id}</span>
                    <h3>{team.name}</h3>
                    <p>Kapten: {team.captain_username}</p>
                    <div className="team-avatar-stack">
                      <span>{team.captain_username.slice(0, 2).toUpperCase()}</span>
                      {team.member_count > 1 && (
                        <span className="empty-slot">+{team.member_count - 1}</span>
                      )}
                    </div>
                    <div className="player-team-stats">
                      <div>
                        <strong>{team.member_count}</strong>
                        <span>ANGGOTA</span>
                      </div>
                      <div>
                        <strong>5</strong>
                        <span>SLOT</span>
                      </div>
                      <Icon name="arrow" size={18} />
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="empty-state">
            <div>
              <Icon name="users" size={32} />
            </div>
            <h3>Kamu belum bergabung ke tim manapun</h3>
            <p>Gunakan tombol di atas untuk membuat tim baru atau bergabung ke tim yang sudah ada.</p>
          </div>
        )}

        {joinOpen && (
          <Modal title="Gabung ke Tim" close={() => setJoinOpen(false)}>
            <p className="modal-copy">
              Ketik nama tim yang ingin Anda ikuti. Sistem akan mencocokkan nama tim yang terdaftar di database.
            </p>
            <label className="field-label">NAMA TIM</label>
            <input
              className="input"
              value={targetTeamJoin}
              onChange={(e) => setTargetTeamJoin(e.target.value)}
              placeholder="Ketik nama tim (contoh: PHOENIX FIVE, NOVA STRIKE...)"
              autoFocus
            />
            {targetTeamJoin && (
              <div style={{ margin: "10px 0", maxHeight: "140px", overflowY: "auto", border: "1px solid var(--line)", borderRadius: "4px" }}>
                {allTeams
                  .filter((t) => t.name.toLowerCase().includes(targetTeamJoin.toLowerCase()))
                  .map((t) => (
                    <div
                      key={t.id}
                      onClick={() => setTargetTeamJoin(t.name)}
                      style={{
                        padding: "8px 12px",
                        cursor: "pointer",
                        borderBottom: "1px solid var(--line)",
                        fontSize: "12px",
                        display: "flex",
                        justifyContent: "space-between",
                        background: targetTeamJoin.toLowerCase() === t.name.toLowerCase() ? "rgba(199,241,53,0.12)" : "transparent",
                      }}
                    >
                      <strong>{t.name}</strong>
                      <span style={{ color: "var(--muted)" }}>Kapten: {t.captain_username}</span>
                    </div>
                  ))}
              </div>
            )}
            <button
              className="btn primary full"
              disabled={!targetTeamJoin.trim() || loading}
              style={{ marginTop: "16px" }}
              onClick={() => handleJoinTeam(targetTeamJoin.trim())}
            >
              {loading ? "Memproses..." : "Gabung ke Tim"} <Icon name="arrow" size={17} />
            </button>
          </Modal>
        )}

        {createOpen && (
          <Modal title="Buat Tim Baru" close={() => setCreateOpen(false)}>
            <form onSubmit={handleCreateTeam}>
              <label className="field-label">NAMA TIM</label>
              <input
                className="input"
                required
                value={teamNameInput}
                onChange={(e) => setTeamNameInput(e.target.value)}
                placeholder="Contoh: GARUDA CYBER"
              />
              <button className="btn primary full" type="submit" disabled={loading} style={{ marginTop: "16px" }}>
                {loading ? "Membuat..." : "Buat Tim Sekarang"} <Icon name="arrow" size={17} />
              </button>
            </form>
          </Modal>
        )}
      </div>
    )
  }

  const isCaptain = teamDetail.members.some(
    (m) => m.username === auth.username && teamDetail.captain_id
  ) || allTeams.find((t) => t.name === teamDetail.name)?.captain_username === auth.username

  const isMember = teamDetail.members.some((m) => m.username === auth.username)

  return (
    <div className="page">
      <button
        className="back-to-catalog"
        onClick={() => setSelectedTeamName(null)}
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
          <h2>{teamDetail.name}</h2>
          <p>
            ID Tim #{teamDetail.id} • Total {teamDetail.members.length} Pemain
          </p>
        </div>
        <div className="team-record">
          <div>
            <b>{teamDetail.members.length}</b>
            <span>ANGGOTA</span>
          </div>
          <div>
            <b>5</b>
            <span>MAX SLOT</span>
          </div>
        </div>
        {!isMember && (
          <button
            className="btn primary"
            onClick={() => handleJoinTeam(teamDetail.name)}
          >
            <Icon name="plus" size={17} /> Gabung Tim Ini
          </button>
        )}
      </section>

      <div className="team-layout">
        <section>
          <SectionTitle
            kicker="ROSTER"
            title={`Anggota Tim (${teamDetail.members.length}/5)`}
            action={
              <span className="permission">
                <Icon name="shield" size={14} />{" "}
                {isCaptain ? "Akses Kapten Aktif" : "Akses Anggota"}
              </span>
            }
          />
          <div className="roster-list">
            {teamDetail.members.map((member, index) => {
              const isMemberCaptain =
                allTeams.find((t) => t.name === teamDetail.name)?.captain_username === member.username
              return (
                <article className="roster-row" key={member.username}>
                  <div className={`avatar large av${index % 4}`}>
                    {member.username.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="member-name">
                    <strong>
                      {member.username}
                      {isMemberCaptain && (
                        <span className="captain">
                          <Icon name="crown" size={13} /> KAPTEN
                        </span>
                      )}
                    </strong>
                    <small>Status: {member.status}</small>
                  </div>
                  <div className="member-role">
                    <span>ROLE</span>
                    <strong>{isMemberCaptain ? "Team Captain" : "Player"}</strong>
                  </div>
                  <Status>{member.status}</Status>
                  {isCaptain && !isMemberCaptain && (
                    <div className="row-actions">
                      <button
                        className="small-action"
                        onClick={() => handleTransferCaptain(teamDetail.name, member.username)}
                      >
                        <Icon name="crown" size={15} /> Pindah Kapten
                      </button>
                      <button
                        className="danger-icon"
                        onClick={() => handleRemoveMember(teamDetail.name, member.username)}
                        aria-label={`Hapus ${member.username}`}
                      >
                        <Icon name="trash" size={17} />
                      </button>
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        </section>
        <aside>
          <SectionTitle kicker="TEAM ACTIONS" title="Tindakan Tim" />
          <div className="info-card">
            <div className="info-row">
              <span>Nama Tim</span>
              <b>{teamDetail.name}</b>
            </div>
            <div className="info-row">
              <span>ID Backend</span>
              <b>#{teamDetail.id}</b>
            </div>
            <div className="info-row">
              <span>Status</span>
              <Status tone="green">Aktif di API</Status>
            </div>
          </div>
          <div className="danger-zone" style={{ marginTop: "20px" }}>
            <div>
              <Icon name="shield" />
              <strong>{isCaptain ? "Zona Kapten" : "Zona Anggota"}</strong>
              <p>
                {isCaptain
                  ? "Sebagai kapten, kamu dapat membubarkan tim atau keluar setelah transfer kapten."
                  : "Kamu dapat keluar dari tim ini kapan saja."}
              </p>
            </div>
            {isCaptain ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
                <button onClick={() => handleLeaveTeam(teamDetail.name)}>
                  Keluar dari Tim (Pindah Kapten)
                </button>
                <button onClick={() => handleDeleteTeam(teamDetail.name)} style={{ background: "rgba(255, 118, 87, 0.2)", borderColor: "var(--orange)", color: "var(--orange)" }}>
                  Bubarkan Tim
                </button>
              </div>
            ) : isMember ? (
              <button onClick={() => handleLeaveTeam(teamDetail.name)}>
                Keluar dari Tim
              </button>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  )
}

function TournamentPage({
  toast,
  setPage,
}: {
  toast: (s: string) => void
  setPage: (p: Page) => void
}) {
  const [tournaments, setTournaments] = useState<ApiTournament[]>([])
  const [selectedTournament, setSelectedTournament] = useState<ApiTournament | null>(null)
  const [registeredTeams, setRegisteredTeams] = useState<ApiTournamentTeam[]>([])
  const [myTeams, setMyTeams] = useState<ApiTeamSummary[]>([])
  const [selectedTeamToRegister, setSelectedTeamToRegister] = useState("")
  const [searchTournament, setSearchTournament] = useState("")
  const [loading, setLoading] = useState(false)
  const auth = getStoredAuth()

  const loadTournaments = () => {
    api.getTournaments().then((res) => {
      if (res.ok && res.data) setTournaments(res.data)
    })
  }

  useEffect(() => {
    loadTournaments()
    api.getTeams().then((res) => {
      if (res.ok && res.data) {
        // Tim di mana pengguna ini adalah kaptennya
        setMyTeams(res.data.filter((t) => t.captain_username === auth.username))
      }
    })
  }, [auth.username])

  useEffect(() => {
    if (selectedTournament) {
      api.getTournamentTeams(selectedTournament.name).then((res) => {
        if (res.ok && res.data) setRegisteredTeams(res.data)
      })
    } else {
      setRegisteredTeams([])
    }
  }, [selectedTournament])

  const handleRegisterTeam = async (tournamentName: string, teamName: string) => {
    if (!auth.username) {
      toast("Silakan login sebagai kapten tim untuk mendaftar.")
      return
    }
    if (!teamName) {
      toast("Pilih tim Anda terlebih dahulu.")
      return
    }
    setLoading(true)
    const res = await api.registerTournament(tournamentName, teamName)
    setLoading(false)
    if (res.ok) {
      toast(`Tim ${teamName} berhasil didaftarkan ke ${tournamentName}!`)
      api.getTournamentTeams(tournamentName).then((r) => r.ok && r.data && setRegisteredTeams(r.data))
      loadTournaments()
    } else {
      toast(res.message || "Gagal mendaftarkan tim ke turnamen")
    }
  }

  const visibleTournaments = tournaments.filter((t) =>
    t.name.toLowerCase().includes(searchTournament.toLowerCase())
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
              TURNAMEN <em>RESMI ESPORTS.</em>
            </h2>
            <p>
              Daftar turnamen aktif yang disinkronkan secara langsung dari backend database Axum.
            </p>
          </div>
          <div className="browser-total">
            <strong>{tournaments.length}</strong>
            <span>TURNAMEN TERSEDIA</span>
          </div>
        </section>
        <div className="tournament-browser-tools">
          <label className="tournament-search">
            <Icon name="search" size={18} />
            <input
              aria-label="Cari turnamen"
              placeholder="Cari turnamen esport..."
              value={searchTournament}
              onChange={(e) => setSearchTournament(e.target.value)}
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
        </div>
        <div className="browser-result-head">
          <div>
            <span>TURNAMEN</span>
            <strong>Semua Kompetisi Aktif</strong>
          </div>
          <span>{visibleTournaments.length} HASIL</span>
        </div>
        {visibleTournaments.length > 0 ? (
          <div className="tournament-catalog">
            {visibleTournaments.map((tournament) => {
              const filledSlots = tournament.total_slots - tournament.available_slots
              const percentage = Math.round((filledSlots / tournament.total_slots) * 100)
              return (
                <button
                  className="catalog-card"
                  key={tournament.id}
                  onClick={() => setSelectedTournament(tournament)}
                >
                  <div className="catalog-cover">
                    <img src={photos.arena} alt="" />
                    <div />
                    <Status
                      tone={
                        tournament.status === "open"
                          ? "green"
                          : tournament.status === "completed"
                            ? "blue"
                            : "purple"
                      }
                    >
                      {tournament.status || "open"}
                    </Status>
                    <span className="catalog-date">ID #{tournament.id}</span>
                  </div>
                  <div className="catalog-body">
                    <span>E-SPORT TOURNAMENT</span>
                    <h3>{tournament.name}</h3>
                    <p>Single Elimination • Competitive Bracket</p>
                    <div className="catalog-meta">
                      <div>
                        <small>STATUS</small>
                        <strong>{tournament.status?.toUpperCase() || "OPEN"}</strong>
                      </div>
                      <span>
                        {filledSlots}/{tournament.total_slots} TIM
                      </span>
                    </div>
                    <div className="progress">
                      <i style={{ width: `${percentage}%` }} />
                    </div>
                    <span className="catalog-link">
                      Lihat Peserta & Daftar <Icon name="arrow" size={16} />
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
            <p>Belum ada turnamen yang sesuai atau dibuat di database backend.</p>
          </div>
        )}
      </div>
    )
  }

  const filledSlots = selectedTournament.total_slots - selectedTournament.available_slots
  const capacityPercentage = Math.round(
    (filledSlots / selectedTournament.total_slots) * 100
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
        <img src={photos.arena} alt="" />
        <div className="hero-shade" />
        <div className="tournament-hero-copy">
          <Status tone="green">{selectedTournament.status || "open"}</Status>
          <span className="event-code">API / ID #{selectedTournament.id}</span>
          <h2>{selectedTournament.name}</h2>
          <p>
            Turnamen resmi terdaftar di database Axum. Daftarkan tim Anda sekarang untuk memperebutkan gelar juara.
          </p>
          <div className="event-meta">
            <span>
              <Icon name="trophy" /> {selectedTournament.total_slots} Kuota Tim
            </span>
            <span>
              <Icon name="users" /> {selectedTournament.available_slots} Slot Tersedia
            </span>
          </div>
        </div>
      </section>

      <div className="tournament-layout">
        <section>
          <SectionTitle kicker="PARTICIPANTS" title={`Tim Terdaftar (${registeredTeams.length})`} />
          <div className="roster-list" style={{ marginTop: "16px" }}>
            {registeredTeams.length > 0 ? (
              registeredTeams.map((team, idx) => (
                <article className="roster-row" key={team.team_id}>
                  <div className={`avatar large av${idx % 4}`}>
                    {team.team_name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="member-name">
                    <strong>{team.team_name}</strong>
                    <small>Kapten: {team.captain_username}</small>
                  </div>
                  <div className="member-role">
                    <span>TERDAFTAR</span>
                    <strong>{team.registered_at.slice(0, 10)}</strong>
                  </div>
                  <Status tone="green">Terverifikasi</Status>
                </article>
              ))
            ) : (
              <p style={{ padding: "20px", color: "var(--muted)" }}>
                Belum ada tim yang mendaftar ke turnamen ini.
              </p>
            )}
          </div>
        </section>

        <aside>
          <div className="register-card">
            <span className="eyebrow">
              <i /> PENDAFTARAN TIM
            </span>
            <div className="slot-count">
              <strong>{filledSlots}</strong>
              <span>
                / {selectedTournament.total_slots}
                <br />
                TIM TERDAFTAR
              </span>
            </div>
            <div className="progress thick">
              <i style={{ width: `${capacityPercentage}%` }} />
            </div>
            <div className="capacity-label">
              <span>Slot Terisi</span>
              <b>{capacityPercentage}%</b>
            </div>
            <hr />

            {myTeams.length > 0 ? (
              <>
                <label className="field-label">PILIH TIM ANDA (SEBAGAI KAPTEN)</label>
                <select
                  className="input"
                  value={selectedTeamToRegister}
                  onChange={(e) => setSelectedTeamToRegister(e.target.value)}
                  style={{ marginBottom: "16px" }}
                >
                  <option value="">-- Pilih Tim --</option>
                  {myTeams.map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <button
                  className="btn primary full"
                  disabled={!selectedTeamToRegister || loading || selectedTournament.available_slots <= 0}
                  onClick={() => handleRegisterTeam(selectedTournament.name, selectedTeamToRegister)}
                >
                  {loading ? "Mendaftarkan..." : "Daftarkan Tim Ini"} <Icon name="arrow" />
                </button>
              </>
            ) : (
              <p style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "14px" }}>
                {auth.username
                  ? "Anda belum memimpin tim apapun. Buat tim terlebih dahulu di menu 'Tim Saya'."
                  : "Silakan login untuk mendaftarkan tim Anda."}
              </p>
            )}

            <button
              className="btn ghost full"
              style={{ marginTop: "10px" }}
              onClick={() => setPage("schedule")}
            >
              Lihat Jadwal Pertandingan
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}

function SchedulePage() {
  const [tournaments, setTournaments] = useState<ApiTournament[]>([])
  const [selectedTournament, setSelectedTournament] = useState<string>("")
  const [matches, setMatches] = useState<ApiMatch[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.getTournaments().then((res) => {
      if (res.ok && res.data && res.data.length > 0) {
        setTournaments(res.data)
        setSelectedTournament(res.data[0].name)
      }
    })
  }, [])

  useEffect(() => {
    if (selectedTournament) {
      setLoading(true)
      api.getTournamentMatches(selectedTournament).then((res) => {
        setLoading(false)
        if (res.ok && res.data) {
          setMatches(res.data)
        } else {
          setMatches([])
        }
      })
    }
  }, [selectedTournament])

  return (
    <div className="page">
      <div className="schedule-head">
        <div>
          <span className="eyebrow">
            <i /> BRACKET & MATCHES
          </span>
          <h2>
            JADWAL <em>PERTANDINGAN</em>
          </h2>
          <p>Semua jadwal dan hasil pertandingan sinkron dari database backend.</p>
        </div>
        <div className="tournament-select">
          <span>PILIH TURNAMEN</span>
          <select
            className="input"
            value={selectedTournament}
            onChange={(e) => setSelectedTournament(e.target.value)}
            style={{ width: "240px" }}
          >
            {tournaments.map((t) => (
              <option key={t.id} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <section className="match-day" style={{ marginTop: "24px" }}>
        <SectionTitle
          kicker={selectedTournament ? selectedTournament.toUpperCase() : "TURNAMEN"}
          title={`Jadwal Pertandingan (${matches.length} Match)`}
        />
        {loading ? (
          <p style={{ padding: "20px", color: "var(--muted)" }}>Memuat jadwal pertandingan...</p>
        ) : matches.length > 0 ? (
          <div className="matches">
            {matches.map((m) => (
              <article className="match-card" key={m.id}>
                <div className="match-time">
                  <strong>{m.schedule_time ? m.schedule_time.slice(11, 16) : "TBD"}</strong>
                  <span>{m.schedule_time ? m.schedule_time.slice(0, 10) : "WIB"}</span>
                  {m.winner_name ? (
                    <Status tone="blue">WIN: {m.winner_name}</Status>
                  ) : (
                    <Status tone="orange">{m.status || "Scheduled"}</Status>
                  )}
                </div>
                <div className="match-main">
                  <div className="match-id">
                    <span>MATCH #{m.id}</span>
                    <small>Ronde {m.round_number}</small>
                  </div>
                  <div className="versus">
                    <div>
                      <strong style={{ color: m.winner_name === m.team1_name ? "var(--lime)" : "inherit" }}>
                        {m.team1_name}
                      </strong>
                      <span className="mini-badge">{m.team1_name.slice(0, 2).toUpperCase()}</span>
                    </div>
                    <b>VS</b>
                    <div>
                      <span className="mini-badge alt">{m.team2_name.slice(0, 2).toUpperCase()}</span>
                      <strong style={{ color: m.winner_name === m.team2_name ? "var(--lime)" : "inherit" }}>
                        {m.team2_name}
                      </strong>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div>
              <Icon name="calendar" size={32} />
            </div>
            <h3>Belum ada jadwal pertandingan</h3>
            <p>Admin dapat membuat jadwal pertandingan baru melalui menu Control Center Admin.</p>
          </div>
        )}
      </section>
    </div>
  )
}

function AdminPage({ toast }: { toast: (s: string) => void }) {
  const [tournaments, setTournaments] = useState<ApiTournament[]>([])
  const [teams, setTeams] = useState<ApiTeamSummary[]>([])
  const [modal, setModal] = useState<"tournament" | "match" | "result" | null>(null)
  const [newTourneyName, setNewTourneyName] = useState("")
  const [newTourneySlots, setNewTourneySlots] = useState(16)

  // Form Buat Pertandingan
  const [matchTourney, setMatchTourney] = useState("")
  const [matchTeam1, setMatchTeam1] = useState("")
  const [matchTeam2, setMatchTeam2] = useState("")
  const [matchRound, setMatchRound] = useState(1)

  // Form Hasil Pertandingan
  const [resTourney, setResTourney] = useState("")
  const [resTeam, setResTeam] = useState("")
  const [resWinner, setResWinner] = useState("")

  const [loading, setLoading] = useState(false)
  const auth = getStoredAuth()

  const loadData = () => {
    api.getTournaments().then((res) => {
      if (res.ok && res.data) {
        setTournaments(res.data)
        if (res.data.length > 0 && !matchTourney) {
          setMatchTourney(res.data[0].name)
          setResTourney(res.data[0].name)
        }
      }
    })
    api.getTeams().then((res) => {
      if (res.ok && res.data) setTeams(res.data)
    })
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCreateTournament = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await api.createTournament(newTourneyName, newTourneySlots)
    setLoading(false)
    if (res.ok) {
      toast(`Turnamen "${newTourneyName}" berhasil dibuat!`)
      setModal(null)
      setNewTourneyName("")
      loadData()
    } else {
      toast(res.message || "Gagal membuat turnamen (Pastikan Anda login sebagai role 'admin')")
    }
  }

  const handleDeleteTournament = async (name: string) => {
    if (!confirm(`Hapus turnamen "${name}"?`)) return
    const res = await api.deleteTournament(name)
    if (res.ok) {
      toast(`Turnamen "${name}" berhasil dihapus.`)
      loadData()
    } else {
      toast(res.message || "Gagal menghapus turnamen (hanya admin)")
    }
  }

  const handleCreateMatch = async (e: FormEvent) => {
    e.preventDefault()
    if (matchTeam1 === matchTeam2) {
      toast("Tim 1 dan Tim 2 tidak boleh sama!")
      return
    }
    setLoading(true)
    const res = await api.createMatch(matchTourney, matchTeam1, matchTeam2, matchRound)
    setLoading(false)
    if (res.ok) {
      toast("Pertandingan berhasil dibuat dan masuk jadwal!")
      setModal(null)
    } else {
      toast(res.message || "Gagal membuat match (hanya admin)")
    }
  }

  const handleSetMatchResult = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await api.setMatchResult(resTourney, resTeam, resWinner)
    setLoading(false)
    if (res.ok) {
      toast(`Hasil match turnamen ${resTourney} dicatat! Pemenang: ${resWinner}`)
      setModal(null)
    } else {
      toast(res.message || "Gagal mencatat pemenang (hanya admin)")
    }
  }

  return (
    <div className="page admin-page">
      <section className="admin-welcome" id="admin-overview">
        <div>
          <span className="eyebrow">
            <i /> CONTROL CENTER (ROLE: {(auth.role || "USER").toUpperCase()})
          </span>
          <h2>
            KENDALIKAN <em>ARENA.</em>
          </h2>
          <p>Kelola turnamen resmi, buat bracket pertandingan, dan catat pemenang turnamen.</p>
        </div>
        <div className="admin-actions">
          <button className="btn ghost" onClick={() => setModal("result")}>
            <Icon name="crown" /> Catat Hasil Match
          </button>
          <button className="btn ghost" onClick={() => setModal("match")}>
            <Icon name="swords" /> Buat Pertandingan
          </button>
          <button className="btn primary" onClick={() => setModal("tournament")}>
            <Icon name="plus" /> Buat Turnamen
          </button>
        </div>
      </section>

      <section className="stats-grid admin-stats">
        {[
          ["Turnamen di Database", String(tournaments.length), "Tersimpan di PostgreSQL", "trophy"],
          ["Tim Terdaftar", String(teams.length), "Aktif di server Axum", "users"],
          ["Akses Admin", auth.role === "admin" ? "AKTIF" : "NON-ADMIN", auth.username || "Anonymous", "shield"],
          ["Status API", "ONLINE", "127.0.0.1:8080", "bolt"],
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

      <section style={{ marginTop: "20px" }}>
        <SectionTitle kicker="MANAGEMENT" title="Daftar Turnamen di Database" />
        <div className="table-card">
          <div className="table-head">
            <span>TURNAMEN</span>
            <span>KUOTA & TERISI</span>
            <span>STATUS</span>
            <span>AKSI ADMIN</span>
          </div>
          {tournaments.map((t) => (
            <div className="table-row" key={t.id}>
              <div>
                <span className="game-logo">{t.name.slice(0, 2).toUpperCase()}</span>
                <p>
                  <strong>{t.name}</strong>
                  <small>ID #{t.id}</small>
                </p>
              </div>
              <span>
                {t.total_slots - t.available_slots} / {t.total_slots} TIM
              </span>
              <Status tone={t.status === "open" ? "green" : "purple"}>
                {t.status || "open"}
              </Status>
              <div className="table-actions">
                <button
                  className="danger-icon"
                  aria-label={`Hapus ${t.name}`}
                  onClick={() => handleDeleteTournament(t.name)}
                  title="Hapus Turnamen (Khusus Admin)"
                >
                  <Icon name="trash" size={17} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {modal === "tournament" && (
        <Modal title="Buat Turnamen Baru" close={() => setModal(null)}>
          <form onSubmit={handleCreateTournament}>
            <label className="field-label">NAMA TURNAMEN</label>
            <input
              className="input"
              required
              value={newTourneyName}
              onChange={(e) => setNewTourneyName(e.target.value)}
              placeholder="Contoh: VALORANT MASTERS 2026"
            />
            <label className="field-label">KUOTA MAKSIMAL TIM</label>
            <input
              className="input"
              type="number"
              min="2"
              max="64"
              required
              value={newTourneySlots}
              onChange={(e) => setNewTourneySlots(Number(e.target.value))}
            />
            <button className="btn primary full" type="submit" disabled={loading} style={{ marginTop: "16px" }}>
              {loading ? "Menyimpan..." : "Buat Turnamen di Database"} <Icon name="arrow" />
            </button>
          </form>
        </Modal>
      )}

      {modal === "match" && (
        <Modal title="Buat Pertandingan Baru" close={() => setModal(null)}>
          <form onSubmit={handleCreateMatch}>
            <label className="field-label">PILIH TURNAMEN</label>
            <select
              className="input"
              value={matchTourney}
              onChange={(e) => setMatchTourney(e.target.value)}
            >
              {tournaments.map((t) => (
                <option key={t.id} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>
            <label className="field-label">TIM 1</label>
            <select
              className="input"
              value={matchTeam1}
              onChange={(e) => setMatchTeam1(e.target.value)}
              required
            >
              <option value="">-- Pilih Tim 1 --</option>
              {teams.map((t) => (
                <option key={t.id} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>
            <label className="field-label">TIM 2</label>
            <select
              className="input"
              value={matchTeam2}
              onChange={(e) => setMatchTeam2(e.target.value)}
              required
            >
              <option value="">-- Pilih Tim 2 --</option>
              {teams.map((t) => (
                <option key={t.id} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>
            <label className="field-label">NOMOR RONDE</label>
            <input
              className="input"
              type="number"
              min="1"
              max="10"
              value={matchRound}
              onChange={(e) => setMatchRound(Number(e.target.value))}
            />
            <button className="btn primary full" type="submit" disabled={loading} style={{ marginTop: "16px" }}>
              {loading ? "Menyimpan..." : "Simpan Pertandingan"} <Icon name="calendar" />
            </button>
          </form>
        </Modal>
      )}

      {modal === "result" && (
        <Modal title="Catat Pemenang Pertandingan" close={() => setModal(null)}>
          <form onSubmit={handleSetMatchResult}>
            <label className="field-label">TURNAMEN</label>
            <select
              className="input"
              value={resTourney}
              onChange={(e) => setResTourney(e.target.value)}
            >
              {tournaments.map((t) => (
                <option key={t.id} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>
            <label className="field-label">SALAH SATU TIM YANG BERTANDING</label>
            <select
              className="input"
              value={resTeam}
              onChange={(e) => setResTeam(e.target.value)}
              required
            >
              <option value="">-- Pilih Tim --</option>
              {teams.map((t) => (
                <option key={t.id} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>
            <label className="field-label">TIM PEMENANG</label>
            <select
              className="input"
              value={resWinner}
              onChange={(e) => setResWinner(e.target.value)}
              required
            >
              <option value="">-- Pilih Tim Pemenang --</option>
              {teams.map((t) => (
                <option key={t.id} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>
            <button className="btn primary full" type="submit" disabled={loading} style={{ marginTop: "16px" }}>
              {loading ? "Menyimpan..." : "Kukuhkan Pemenang Match"} <Icon name="check" />
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
              USERNAME (3-32 KARAKTER: HURUF, ANGKA, _ ATAU -)
            </label>
            <div className="input-icon">
              <Icon name="user" />
              <input
                id="username"
                required
                minLength={3}
                maxLength={32}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Contoh: player_satu"
              />
            </div>
            <div className="label-row">
              <label className="field-label" htmlFor="password">
                PASSWORD (MINIMAL 6 KARAKTER)
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
  profile: "/profile",
  team: "/teams",
  tournament: "/tournaments",
  schedule: "/schedule",
  admin: "/admin",
  login: "/login",
}

const pathPages: Record<string, Page> = {
  "/": "dashboard",
  "/profile": "profile",
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
  const [currentRole, setCurrentRole] = useState<string>(getStoredAuth().role || "user")
  const [mobileNav, setMobileNav] = useState(false)
  const [message, setMessage] = useState("")
  const toast = (text: string) => {
    setMessage(text)
    window.setTimeout(() => setMessage(""), 2800)
  }
  const logout = () => {
    clearStoredAuth()
    setCurrentUser("Player")
    setCurrentRole("user")
    navigate("/login")
    toast("Berhasil keluar dari akun")
  }
  const [editUsernameOpen, setEditUsernameOpen] = useState(false)
  const [newUsernameVal, setNewUsernameVal] = useState("")

  const handleUpdateUsernameSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!newUsernameVal.trim()) return
    const res = await api.updateUsername(newUsernameVal.trim())
    if (res.ok) {
      toast(`Username berhasil diubah menjadi ${newUsernameVal.trim()}!`)
      setCurrentUser(newUsernameVal.trim())
      setStoredAuth(getStoredAuth().token || "", newUsernameVal.trim(), currentRole)
      setEditUsernameOpen(false)
      setNewUsernameVal("")
    } else {
      toast(res.message || "Gagal mengubah username")
    }
  }

  if (page === "login")
    return (
      <AuthPage
        initialRegister={location.pathname === "/register"}
        onLogin={(username) => {
          const auth = getStoredAuth()
          setCurrentUser(username)
          setCurrentRole(auth.role || "user")
          navigate("/")
          toast(`Selamat datang, ${username}!`)
        }}
      />
    )
  if (page === "admin") {
    const auth = getStoredAuth()
    if (auth.role !== "admin") {
      return (
        <div className="page" style={{ textAlign: "center", paddingTop: "100px" }}>
          <div style={{ maxWidth: "480px", margin: "auto", background: "var(--panel)", padding: "36px", border: "1px solid var(--line)" }}>
            <div style={{ color: "var(--orange)", marginBottom: "16px" }}>
              <Icon name="shield" size={48} />
            </div>
            <h2 style={{ marginBottom: "12px" }}>Akses Ditolak (403)</h2>
            <p style={{ color: "var(--muted)", marginBottom: "24px" }}>
              Halaman Control Center Admin hanya dapat diakses oleh akun dengan role <strong>admin</strong>. Akun player biasa tidak memiliki izin ke halaman ini.
            </p>
            <button className="btn primary full" onClick={() => navigate("/")}>
              Kembali ke Dashboard Player
            </button>
          </div>
        </div>
      )
    }
    return (
      <div className="app-shell admin-shell">
        <div className="main-shell">
          <AdminHeader logout={logout} />
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
  }
  return (
    <div className="app-shell">
      <Sidebar
        page={page}
        setPage={setPage}
        open={mobileNav}
        close={() => setMobileNav(false)}
        username={currentUser}
        role={currentRole}
        onLogout={logout}
      />
      <div className="main-shell">
        <Header
          page={page}
          openMenu={() => setMobileNav(true)}
          onUpdateUsername={currentUser !== "Player" ? () => setEditUsernameOpen(true) : undefined}
        />
        <main>
          {page === "dashboard" && <Dashboard setPage={setPage} />}
          {page === "profile" && <ProfilePage setPage={setPage} toast={toast} onUpdateUsername={() => setEditUsernameOpen(true)} />}
          {page === "team" && <TeamPage toast={toast} />}
          {page === "tournament" && (
            <TournamentPage toast={toast} setPage={setPage} />
          )}
          {page === "schedule" && <SchedulePage />}
        </main>
      </div>
      {editUsernameOpen && (
        <Modal title="Ubah Username Akun" close={() => setEditUsernameOpen(false)}>
          <form onSubmit={handleUpdateUsernameSubmit}>
            <p className="modal-copy">
              Ubah username akun Anda saat ini. Perubahan akan disimpan secara permanen di database backend.
            </p>
            <label className="field-label">USERNAME BARU</label>
            <input
              className="input"
              required
              minLength={3}
              value={newUsernameVal}
              onChange={(e) => setNewUsernameVal(e.target.value)}
              placeholder="Masukkan username baru..."
            />
            <button className="btn primary full" type="submit" style={{ marginTop: "16px" }}>
              Simpan Username Baru <Icon name="check" />
            </button>
          </form>
        </Modal>
      )}
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
