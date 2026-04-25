// Adapter that maps the colleague's `api.*` calls onto our main `api` client.
import { api as mainApi } from "@/lib/api";

export function setAuthToken(token: string | null) {
  // Managed globally by api.ts
  void token;
}

export const api = {
  async research(query: string, threadId?: number, groupId?: number): Promise<{ answer: string; thread_id: number }> {
    return mainApi.research(query, threadId, groupId);
  },

  async chat(message: string, threadId?: number, groupId?: number): Promise<{ answer: string; thread_id: number }> {
    return mainApi.chat(message, threadId, groupId);
  },

  async listUsers() {
    return mainApi.listUsers();
  },

  async listGroups() {
    return mainApi.listGroups();
  },

  async createGroup(name: string, description?: string) {
    return mainApi.createGroup(name, description);
  },

  async inviteToGroup(groupId: number, username: string) {
    return mainApi.inviteToGroup(groupId, username);
  },

  async acceptGroupInvite(groupId: number) {
    return mainApi.acceptGroupInvite(groupId);
  },

  async captureResearch(threadId: number, imageUrl?: string) {
    return mainApi.captureResearch(threadId, imageUrl);
  },

  async createDetour(name: string, eventIds: number[], description?: string) {
    return mainApi.createDetour(name, eventIds, description);
  },
};
