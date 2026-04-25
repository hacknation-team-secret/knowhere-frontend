// Adapter that maps the colleague's `api.*` calls onto our main `api` client.
import { api as mainApi } from "@/lib/api";

export function setAuthToken(token: string | null) {
  // Managed globally by api.ts
  void token;
}

export const api = {
  async research(query: string, threadId?: number): Promise<{ answer: string; thread_id: number }> {
    return mainApi.research(query, threadId);
  },

  async chat(message: string, threadId?: number): Promise<{ answer: string; thread_id: number }> {
    return mainApi.chat(message, threadId);
  },

  async captureResearch(threadId: number, imageUrl?: string) {
    return mainApi.captureResearch(threadId, imageUrl);
  },

  async createDetour(name: string, eventIds: number[], description?: string) {
    return mainApi.createDetour(name, eventIds, description);
  },
};
