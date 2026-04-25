// Adapter that maps the colleague's `api.*` calls onto our main `api` client.
import { api as mainApi } from "@/lib/api";

export function setAuthToken(token: string | null) {
  // Managed globally by api.ts
  void token;
}

export const api = {
  async research(query: string): Promise<{ answer: string }> {
    return mainApi.research(query);
  },

  async chat(message: string): Promise<{ answer: string }> {
    return mainApi.chat(message);
  },

  async createDetour(name: string, eventIds: number[], description?: string) {
    return mainApi.createDetour(name, eventIds, description);
  },
};
