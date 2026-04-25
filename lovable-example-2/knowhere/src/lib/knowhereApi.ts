// Thin client for the Knowhere backend.
// Docs: https://secret-backend-production-7b55.up.railway.app/docs

const BASE_URL = "https://secret-backend-production-7b55.up.railway.app";

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

async function request<T>(
  path: string,
  init: RequestInit & { token?: string } = {},
): Promise<T> {
  const { token, headers, ...rest } = init;
  const res = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
  });
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

export { ApiError };
