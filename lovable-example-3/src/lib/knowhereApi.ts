// Thin client for the Knowhere backend.
// Docs: https://secret-backend-production-7b55.up.railway.app/docs

const BASE_URL = "https://secret-backend-production-7b55.up.railway.app";
const TIMEOUT_MS = 15000;

export type ApiUser = {
  username: string;
  email: string | null;
  id: number;
  is_admin: boolean;
  api_key: string;
  description: string | null;
  research_count: number;
};

export type ApiToken = { access_token: string; token_type: string };

export type ApiEvent = {
  id: number;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  location: [number, number];
  owner_type: string;
  owner_id: number;
};

export type ApiPassport = {
  username: string;
  description: string | null;
  attended_events: ApiEvent[];
};

export type ApiDetour = {
  id: number;
  name: string;
  description: string | null;
  user_id: number;
  events: { event_id: number; order: number; event: ApiEvent }[];
};

class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, body: unknown, message: string) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

class NetworkError extends Error {
  cause?: unknown;
  constructor(message: string, cause?: unknown) {
    super(message);
    this.cause = cause;
    this.name = "NetworkError";
  }
}

const NETWORK_ERROR_MESSAGE =
  "Couldn't reach Knowhere. Check your connection or disable ad-blockers for this preview, then try again.";

async function fetchOnce(
  url: string,
  init: RequestInit,
): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function request<T>(
  path: string,
  init: RequestInit & { token?: string } = {},
): Promise<T> {
  const { token, headers, ...rest } = init;
  const url = `${BASE_URL}${path}`;
  const finalInit: RequestInit = {
    ...rest,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
  };

  let res: Response | null = null;
  let lastNetworkError: unknown = null;

  // 1 retry on transient network errors / 5xx gateway issues
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      res = await fetchOnce(url, finalInit);
      // Retry on transient gateway statuses
      if (attempt === 0 && (res.status === 502 || res.status === 503 || res.status === 504)) {
        await new Promise((r) => setTimeout(r, 600));
        continue;
      }
      break;
    } catch (e) {
      lastNetworkError = e;
      // TypeError = "Failed to fetch" / AbortError = timeout
      if (attempt === 0) {
        await new Promise((r) => setTimeout(r, 600));
        continue;
      }
      throw new NetworkError(NETWORK_ERROR_MESSAGE, e);
    }
  }

  if (!res) {
    throw new NetworkError(NETWORK_ERROR_MESSAGE, lastNetworkError);
  }

  const text = await res.text();
  let body: unknown = text;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    /* keep text */
  }
  if (!res.ok) {
    const msg =
      (body && typeof body === "object" && "detail" in body
        ? String((body as { detail: unknown }).detail)
        : `Request failed (${res.status})`) || `Request failed (${res.status})`;
    throw new ApiError(res.status, body, msg);
  }
  return body as T;
}

export const knowhereApi = {
  async signup(input: { username: string; password: string; email?: string }) {
    return request<ApiUser>("/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: input.username,
        password: input.password,
        email: input.email || null,
      }),
    });
  },

  async login(username: string, password: string) {
    const form = new URLSearchParams();
    form.set("grant_type", "password");
    form.set("username", username);
    form.set("password", password);
    return request<ApiToken>("/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    });
  },

  async me(token: string) {
    return request<ApiUser>("/users/me", { token });
  },

  async updateDescription(token: string, description: string) {
    return request<ApiUser>("/users/me/description", {
      method: "PUT",
      token,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description }),
    });
  },

  async getPassport(username: string) {
    return request<ApiPassport>(
      `/users/${encodeURIComponent(username)}/passport`,
    );
  },

  async createDetour(
    token: string,
    input: { name: string; description?: string; event_ids: number[] },
  ) {
    return request<ApiDetour>("/detours", {
      method: "POST",
      token,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: input.name,
        description: input.description ?? null,
        event_ids: input.event_ids,
      }),
    });
  },

  async myDetours(token: string) {
    return request<ApiDetour[]>("/detours/me", { token });
  },
};

export { ApiError, NetworkError };
