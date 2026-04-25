// Knowhere backend client.
// Hosted FastAPI at Railway. OAuth2 password flow, bearer token in localStorage.

export const API_BASE = "https://secret-backend-production-7b55.up.railway.app";
const TOKEN_KEY = "knowhere.token.v1";

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

export class ApiError extends Error {
  constructor(public status: number, message: string, public body?: unknown) {
    super(message);
  }
}

async function request<T>(
  path: string,
  init: RequestInit & { auth?: boolean; form?: Record<string, string> } = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.auth !== false) {
    const t = getToken();
    if (t) headers.set("Authorization", `Bearer ${t}`);
  }

  let body = init.body;
  if (init.form) {
    headers.set("Content-Type", "application/x-www-form-urlencoded");
    body = new URLSearchParams(init.form).toString();
  } else if (body && !(body instanceof FormData) && typeof body !== "string") {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(body);
  } else if (body && typeof body === "string" && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers, body });
  const text = await res.text();
  const parsed = text ? safeJson(text) : null;

  if (!res.ok) {
    const msg =
      (parsed && typeof parsed === "object" && "detail" in parsed
        ? String((parsed as { detail: unknown }).detail)
        : res.statusText) || `HTTP ${res.status}`;
    throw new ApiError(res.status, msg, parsed);
  }
  return parsed as T;
}

function safeJson(s: string): unknown {
  try {
    return JSON.parse(s);
  } catch {
    return s;
  }
}

// ─── Schema types (mirror /openapi.json) ──────────────────────────────────────

export interface ApiUser {
  username: string;
  email?: string | null;
  id: number;
  is_admin: boolean;
  api_key: string;
  description?: string | null;
  research_count: number;
}

export interface ApiEvent {
  title: string;
  description?: string | null;
  start_time: string;
  end_time: string;
  location: number[]; // [lng, lat] or [lat, lng] — backend choice
  id: number;
  owner_type: string;
  owner_id: number;
}

export interface ApiDetourEvent {
  event_id: number;
  order: number;
  event: ApiEvent;
}

export interface ApiDetour {
  name: string;
  description?: string | null;
  id: number;
  user_id: number;
  events: ApiDetourEvent[];
}

export interface ApiPassport {
  username: string;
  description?: string | null;
  attended_events: ApiEvent[];
}

export interface ApiPublicUser {
  id: number;
  username: string;
  email?: string | null;
  description?: string | null;
  research_count: number;
}

export interface ApiGroupMembership {
  user: ApiPublicUser;
  status: string;
  created_at: string;
}

export interface ApiGroup {
  id: number;
  name: string;
  description?: string | null;
  owner_id: number;
  created_at: string;
  memberships: ApiGroupMembership[];
}

export interface ApiGroupFavorite {
  id: number;
  group_id: number;
  title: string;
  description?: string | null;
  category?: string | null;
  estimated_cost?: number | null;
  created_by: ApiPublicUser;
  created_at: string;
  vote_count: number;
  voted_by_me: boolean;
}

export interface ApiGroupBudget {
  group_id: number;
  user: ApiPublicUser;
  total_budget: number;
  currency: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApiResearchMessage {
  id: number;
  role: string;
  content: string;
  created_at: string;
}

export interface ApiResearchThread {
  id: number;
  title: string | null;
  created_at: string;
  messages: ApiResearchMessage[];
}

// ─── Endpoints ────────────────────────────────────────────────────────────────

export const api = {
  signup: (username: string, password: string, email?: string) =>
    request<ApiUser>("/signup", {
      method: "POST",
      auth: false,
      body: JSON.stringify({ username, password, email }),
      headers: { "Content-Type": "application/json" },
    }),

  login: async (username: string, password: string) => {
    const tok = await request<{ access_token: string; token_type: string }>("/token", {
      method: "POST",
      auth: false,
      form: { username, password, grant_type: "password" },
    });
    setToken(tok.access_token);
    return tok;
  },

  logout: () => setToken(null),

  me: () => request<ApiUser>("/users/me"),

  listUsers: () => request<ApiPublicUser[]>("/users"),

  updateDescription: (description: string) =>
    request<unknown>("/users/me/description", {
      method: "PUT",
      body: JSON.stringify({ description }),
      headers: { "Content-Type": "application/json" },
    }),

  // Events
  listEvents: () => request<ApiEvent[]>("/items"), // /items returns list per OpenAPI
  listCities: () => 
    request<{ id: number; name: string; description: string | null }[]>("/cities").catch(() => []),
  attendEvent: (eventId: number) =>
    request<unknown>(`/events/${eventId}/attend`, { method: "POST" }),

  // Detours
  createDetour: (name: string, eventIds: number[], description?: string) =>
    request<ApiDetour>("/detours", {
      method: "POST",
      body: JSON.stringify({ name, description, event_ids: eventIds }),
      headers: { "Content-Type": "application/json" },
    }),
  myDetours: () => request<ApiDetour[]>("/detours/me"),
  sharedDetours: () => request<ApiDetour[]>("/detours/shared"),
  getDetour: (id: number) => request<ApiDetour>(`/detours/${id}`),
  shareDetour: (id: number) =>
    request<unknown>(`/detours/${id}/share`, { method: "POST" }),

  passport: (username: string) =>
    request<ApiPassport>(`/users/${encodeURIComponent(username)}/passport`),

  createGroup: (name: string, description?: string) =>
    request<ApiGroup>("/groups", {
      method: "POST",
      body: JSON.stringify({ name, description }),
      headers: { "Content-Type": "application/json" },
    }),

  listGroups: () => request<ApiGroup[]>("/groups"),

  inviteToGroup: (groupId: number, username: string) =>
    request<ApiGroup>(`/groups/${groupId}/invite`, {
      method: "POST",
      body: JSON.stringify({ username }),
      headers: { "Content-Type": "application/json" },
    }),

  acceptGroupInvite: (groupId: number) =>
    request<ApiGroup>(`/groups/${groupId}/accept`, { method: "POST" }),

  listGroupFavorites: (groupId: number) =>
    request<ApiGroupFavorite[]>(`/groups/${groupId}/favorites`),

  createGroupFavorite: (
    groupId: number,
    favorite: {
      title: string;
      description?: string;
      category?: string;
      estimated_cost?: number;
    },
  ) =>
    request<ApiGroupFavorite>(`/groups/${groupId}/favorites`, {
      method: "POST",
      body: JSON.stringify(favorite),
      headers: { "Content-Type": "application/json" },
    }),

  toggleGroupFavoriteVote: (groupId: number, favoriteId: number) =>
    request<{ voted: boolean }>(`/groups/${groupId}/favorites/${favoriteId}/vote`, {
      method: "POST",
    }),

  listGroupBudgets: (groupId: number) =>
    request<ApiGroupBudget[]>(`/groups/${groupId}/budgets`),

  upsertGroupBudget: (
    groupId: number,
    budget: { total_budget: number; currency?: string; notes?: string },
  ) =>
    request<ApiGroupBudget>(`/groups/${groupId}/budget`, {
      method: "PUT",
      body: JSON.stringify(budget),
      headers: { "Content-Type": "application/json" },
    }),

  chat: (message: string, threadId?: number, groupId?: number) =>
    request<{ answer: string; thread_id: number }>("/research", {
      method: "POST",
      body: JSON.stringify({ query: message, thread_id: threadId, group_id: groupId }),
      headers: { "Content-Type": "application/json" },
    }),

  research: (query: string, threadId?: number, groupId?: number) =>
    request<{ answer: string; thread_id: number }>("/research", {
      method: "POST",
      body: JSON.stringify({ query, thread_id: threadId, group_id: groupId }),
      headers: { "Content-Type": "application/json" },
    }),

  createThread: (title?: string) =>
    request<ApiResearchThread>("/research/threads", {
      method: "POST",
      body: JSON.stringify({ title }),
      headers: { "Content-Type": "application/json" },
    }),

  listThreads: () =>
    request<ApiResearchThread[]>("/research/threads"),

  captureResearch: (threadId: number, imageUrl?: string) =>
    request<unknown>("/research/capture", {
      method: "POST",
      body: JSON.stringify({ thread_id: threadId, image_url: imageUrl }),
      headers: { "Content-Type": "application/json" },
    }),
};
