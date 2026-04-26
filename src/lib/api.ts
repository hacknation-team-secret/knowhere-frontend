// Knowhere backend client.
// Hosted FastAPI at Railway. OAuth2 password flow, bearer token in localStorage.

export const API_BASE =
  import.meta.env.VITE_API_BASE ?? "/api";
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
  location: number[]; // [longitude, latitude]
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

export interface ApiCityGuideStep {
  phase: string;
  title: string;
  detail: string;
}

export interface ApiCityGuidePlanResponse {
  steps: ApiCityGuideStep[];
  detour: ApiDetour;
}

export interface ApiWalletMember {
  user: ApiPublicUser;
  role: string;
  contributed_cents: number;
  spent_cents: number;
  joined_at: string;
}

export interface ApiWalletTransaction {
  id: number;
  wallet_id: number;
  type: "topup" | "spend" | "refund";
  amount_cents: number;
  initiated_by: number;
  merchant?: string | null;
  category?: string | null;
  description?: string | null;
  metadata_json?: string | null;
  created_at: string;
}

export interface ApiSharedWallet {
  id: number;
  name: string;
  currency: string;
  total_balance_cents: number;
  spending_limit_cents?: number | null;
  alert_threshold_percent: number;
  join_code: string;
  created_by: number;
  created_at: string;
  members: ApiWalletMember[];
  transactions: ApiWalletTransaction[];
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

export interface ApiInstagramProfileData {
  username?: string | null;
  display_name?: string | null;
  bio?: string | null;
  post_count?: number | null;
  follower_count?: number | null;
  following_count?: number | null;
  external_url?: string | null;
  profile_image_url?: string | null;
}

export interface ApiResearchExtractResponse {
  url: string;
  platform: string;
  extract_depth: "basic" | "advanced";
  raw_content?: string | null;
  images: string[];
  favicon?: string | null;
  profile?: ApiInstagramProfileData | null;
  failed: boolean;
  error?: string | null;
  tavily_request_id?: string | null;
  tavily_response_time?: number | null;
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
  listEvents: () => request<ApiEvent[]>("/events"),
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

  createCityGuidePlan: (groupId: number) =>
    request<ApiCityGuidePlanResponse>(`/groups/${groupId}/city-guide-plan`, {
      method: "POST",
    }),

  listSharedWallets: () => request<ApiSharedWallet[]>("/wallets/shared"),

  createSharedWallet: (wallet: {
    name: string;
    currency?: string;
    spending_limit_cents?: number | null;
    alert_threshold_percent?: number;
  }) =>
    request<ApiSharedWallet>("/wallets/shared", {
      method: "POST",
      body: JSON.stringify(wallet),
      headers: { "Content-Type": "application/json" },
    }),

  joinSharedWallet: (join_code: string) =>
    request<ApiSharedWallet>("/wallets/shared/join", {
      method: "POST",
      body: JSON.stringify({ join_code }),
      headers: { "Content-Type": "application/json" },
    }),

  getSharedWallet: (walletId: number) =>
    request<ApiSharedWallet>(`/wallets/${walletId}`),

  updateSharedWallet: (
    walletId: number,
    updates: { spending_limit_cents?: number | null; alert_threshold_percent?: number | null },
  ) =>
    request<ApiSharedWallet>(`/wallets/${walletId}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
      headers: { "Content-Type": "application/json" },
    }),

  listWalletTransactions: (walletId: number) =>
    request<ApiWalletTransaction[]>(`/wallets/${walletId}/transactions`),

  fundSharedWallet: (
    walletId: number,
    payload: { amount_cents: number; payment_method: string; description?: string },
  ) =>
    request<ApiSharedWallet>(`/wallets/${walletId}/fund`, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    }),

  spendSharedWallet: (
    walletId: number,
    payload: {
      amount_cents: number;
      merchant: string;
      category?: string;
      description?: string;
      metadata_json?: string;
    },
  ) =>
    request<ApiSharedWallet>(`/wallets/${walletId}/spend`, {
      method: "POST",
      body: JSON.stringify(payload),
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

  extractResearch: (
    url: string,
    query?: string,
    extractDepth: "basic" | "advanced" = "advanced",
    includeImages = true,
  ) =>
    request<ApiResearchExtractResponse>("/research/extract", {
      method: "POST",
      body: JSON.stringify({
        url,
        query,
        extract_depth: extractDepth,
        include_images: includeImages,
      }),
      headers: { "Content-Type": "application/json" },
    }),
};
