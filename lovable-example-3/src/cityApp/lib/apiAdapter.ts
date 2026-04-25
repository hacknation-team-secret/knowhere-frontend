// Adapter that maps the colleague's `api.*` calls onto our existing
// `knowhereApi` client (which holds the bearer token at the app layer
// rather than in localStorage). Token is injected on each call via
// `setAuthToken` so the adapter stays drop-in compatible.

import { knowhereApi } from "@/lib/knowhereApi";

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

function requireToken(): string {
  if (!authToken) throw new Error("Sign in to use Knowhere AI features.");
  return authToken;
}

export const api = {
  async research(query: string): Promise<{ answer: string }> {
    // Backend research endpoint isn't wired into our client yet —
    // return a graceful local stub so Ask Knowhere keeps working.
    void query;
    return {
      answer:
        "Regenerated your route locally. Sign-in needed for the live model in this demo.",
    };
  },

  async createDetour(name: string, eventIds: number[], description?: string) {
    const token = requireToken();
    return knowhereApi.createDetour(token, {
      name,
      description,
      event_ids: eventIds,
    });
  },
};
