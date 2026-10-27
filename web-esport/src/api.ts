export interface AuthResponse {
  access_token: string
  token_type: string
  expires_in: number
  user: {
    id: number
    username: string
    role: string
  }
}

export interface UserProfile {
  id: number
  username: string
  mmr_point?: number
  role?: string
}

export interface ApiTournament {
  id: number
  name: string
  status: string | null
  total_slots: number
  available_slots: number
}

export interface ApiTeamSummary {
  id: number
  name: string
  captain_id: number
  captain_username: string
  member_count: number
}

export interface ApiTeamMember {
  username: string
  status: string
}

export interface ApiTeamDetail {
  id: number
  name: string
  captain_id: number
  members: ApiTeamMember[]
}

export interface ApiTournamentTeam {
  team_id: number
  team_name: string
  captain_id: number
  captain_username: string
  registered_at: string
}

export interface ApiMatch {
  id: number
  round_number: number
  schedule_time: string | null
  status: string | null
  team1_name: string
  team2_name: string
  winner_name: string | null
}

export function getStoredAuth(): {
  token: string | null
  username: string | null
  role: string | null
} {
  return {
    token: localStorage.getItem("token"),
    username: localStorage.getItem("username"),
    role: localStorage.getItem("role") || "user",
  }
}

export function setStoredAuth(token: string, username: string, role: string = "user") {
  localStorage.setItem("token", token)
  localStorage.setItem("username", username)
  localStorage.setItem("role", role)
}

export function clearStoredAuth() {
  localStorage.removeItem("token")
  localStorage.removeItem("username")
  localStorage.removeItem("role")
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: {
    method?: string
    body?: any
    requiresAuth?: boolean
  } = {}
): Promise<{ ok: boolean; status: number; data?: T; message?: string }> {
  const { method = "GET", body, requiresAuth = false } = options
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }

  if (requiresAuth) {
    const token = localStorage.getItem("token")
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }
  }

  try {
    const res = await fetch(endpoint, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })

    const contentType = res.headers.get("content-type")
    const isJson = contentType && contentType.includes("application/json")
    const resData = isJson ? await res.json() : await res.text()

    if (!res.ok) {
      const errMsg =
        typeof resData === "object" && resData?.message
          ? resData.message
          : `Error HTTP ${res.status}`
      return { ok: false, status: res.status, message: errMsg }
    }

    return {
      ok: true,
      status: res.status,
      data: (typeof resData === "object" && "data" in resData ? resData.data : resData) as T,
      message: typeof resData === "object" && "message" in resData ? resData.message : undefined,
    }
  } catch (err: any) {
    return {
      ok: false,
      status: 0,
      message: err?.message || "Gagal menghubungi backend Rust API",
    }
  }
}

export const api = {
  // Auth & Profile
  register: (username: string, password: string, mmr_point = 1000) =>
    apiRequest("/api/users", { method: "POST", body: { username, password, mmr_point } }),

  login: (username: string, password: string) =>
    apiRequest<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: { username, password },
    }),

  getProfileByUsername: (username: string) =>
    apiRequest<UserProfile>(`/api/users/by-username/${encodeURIComponent(username)}`),

  updateUsername: (username: string) =>
    apiRequest("/api/users/me", {
      method: "PUT",
      body: { username },
      requiresAuth: true,
    }),

  // Tournaments
  getTournaments: () =>
    apiRequest<ApiTournament[]>("/api/tournaments"),

  createTournament: (name: string, max_teams: number) =>
    apiRequest<ApiTournament>("/api/tournaments", {
      method: "POST",
      body: { name, max_teams },
      requiresAuth: true,
    }),

  deleteTournament: (name: string) =>
    apiRequest(`/api/tournaments/${encodeURIComponent(name)}`, {
      method: "DELETE",
      requiresAuth: true,
    }),

  registerTournament: (tournament_name: string, team_name: string) =>
    apiRequest("/api/tournaments/register", {
      method: "POST",
      body: { tournament_name, team_name },
      requiresAuth: true,
    }),

  getTournamentTeams: (tournament_name: string) =>
    apiRequest<ApiTournamentTeam[]>(`/api/tournaments/by-name/${encodeURIComponent(tournament_name)}/teams`),

  getTournamentMatches: (tournament_name: string) =>
    apiRequest<ApiMatch[]>(`/api/tournaments/by-name/${encodeURIComponent(tournament_name)}/matches`),

  // Teams
  getTeams: () =>
    apiRequest<ApiTeamSummary[]>("/api/teams/list"),

  getTeamProfile: (team_name: string) =>
    apiRequest<ApiTeamDetail>(`/api/teams/by-name/${encodeURIComponent(team_name)}`),

  createTeam: (name: string, captain_username: string) =>
    apiRequest<{ id: number; name: string; captain_id: number }>("/api/teams", {
      method: "POST",
      body: { name, captain_username },
      requiresAuth: true,
    }),

  joinTeam: (team_name: string) =>
    apiRequest("/api/teams/join", {
      method: "POST",
      body: { team_name },
      requiresAuth: true,
    }),

  leaveTeam: (team_name: string, new_captain_username?: string) =>
    apiRequest("/api/teams/leave", {
      method: "POST",
      body: { team_name, new_captain_username },
      requiresAuth: true,
    }),

  removeTeamMember: (team_name: string, username: string) =>
    apiRequest("/api/teams/members", {
      method: "DELETE",
      body: { team_name, username },
      requiresAuth: true,
    }),

  transferCaptain: (team_name: string, new_captain_username: string) =>
    apiRequest("/api/teams/captain", {
      method: "PUT",
      body: { team_name, new_captain_username },
      requiresAuth: true,
    }),

  deleteTeam: (team_name: string) =>
    apiRequest("/api/teams/delete", {
      method: "DELETE",
      body: { team_name },
      requiresAuth: true,
    }),

  // Matches
  createMatch: (
    tournament_name: string,
    team1_name: string,
    team2_name: string,
    round_number = 1
  ) =>
    apiRequest<{ id: number }>("/api/matches", {
      method: "POST",
      body: { tournament_name, team1_name, team2_name, round_number },
      requiresAuth: true,
    }),

  updateMatchSchedule: (tournament_name: string, team_name: string, schedule_time: string) =>
    apiRequest("/api/matches/by-name/schedule", {
      method: "PUT",
      body: { tournament_name, team_name, schedule_time },
      requiresAuth: true,
    }),

  setMatchResult: (tournament_name: string, team_name: string, winner_team_name: string) =>
    apiRequest("/api/matches/by-name/result", {
      method: "PUT",
      body: { tournament_name, team_name, winner_team_name },
      requiresAuth: true,
    }),
}
