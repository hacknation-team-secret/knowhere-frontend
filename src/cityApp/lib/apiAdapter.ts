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

  async listGroupFavorites(groupId: number) {
    return mainApi.listGroupFavorites(groupId);
  },

  async createGroupFavorite(
    groupId: number,
    favorite: {
      title: string;
      description?: string;
      category?: string;
      estimated_cost?: number;
    },
  ) {
    return mainApi.createGroupFavorite(groupId, favorite);
  },

  async toggleGroupFavoriteVote(groupId: number, favoriteId: number) {
    return mainApi.toggleGroupFavoriteVote(groupId, favoriteId);
  },

  async listGroupBudgets(groupId: number) {
    return mainApi.listGroupBudgets(groupId);
  },

  async upsertGroupBudget(
    groupId: number,
    budget: { total_budget: number; currency?: string; notes?: string },
  ) {
    return mainApi.upsertGroupBudget(groupId, budget);
  },

  async captureResearch(threadId: number, imageUrl?: string) {
    return mainApi.captureResearch(threadId, imageUrl);
  },

  async extractResearch(
    url: string,
    query?: string,
    extractDepth: "basic" | "advanced" = "advanced",
    includeImages = true,
  ) {
    return mainApi.extractResearch(url, query, extractDepth, includeImages);
  },

  async createDetour(name: string, eventIds: number[], description?: string) {
    return mainApi.createDetour(name, eventIds, description);
  },
};
