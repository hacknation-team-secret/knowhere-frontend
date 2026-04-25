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

  async listSharedWallets() {
    return mainApi.listSharedWallets();
  },

  async createSharedWallet(wallet: {
    name: string;
    currency?: string;
    spending_limit_cents?: number | null;
    alert_threshold_percent?: number;
  }) {
    return mainApi.createSharedWallet(wallet);
  },

  async joinSharedWallet(joinCode: string) {
    return mainApi.joinSharedWallet(joinCode);
  },

  async getSharedWallet(walletId: number) {
    return mainApi.getSharedWallet(walletId);
  },

  async updateSharedWallet(
    walletId: number,
    updates: { spending_limit_cents?: number | null; alert_threshold_percent?: number | null },
  ) {
    return mainApi.updateSharedWallet(walletId, updates);
  },

  async listWalletTransactions(walletId: number) {
    return mainApi.listWalletTransactions(walletId);
  },

  async fundSharedWallet(
    walletId: number,
    payload: { amount_cents: number; payment_method: string; description?: string },
  ) {
    return mainApi.fundSharedWallet(walletId, payload);
  },

  async spendSharedWallet(
    walletId: number,
    payload: {
      amount_cents: number;
      merchant: string;
      category?: string;
      description?: string;
      metadata_json?: string;
    },
  ) {
    return mainApi.spendSharedWallet(walletId, payload);
  },
};
