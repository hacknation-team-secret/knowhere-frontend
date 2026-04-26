// Adapter that maps the colleague's `api.*` calls onto our main `api` client.
import {
  api as mainApi,
  type ApiPublicUser,
  type ApiSharedWallet,
  type ApiWalletTransaction,
} from "@/lib/api";

const LOCAL_WALLETS_KEY = "knowhere.shared-wallets.local";
const localDemoUser: ApiPublicUser = {
  id: 0,
  username: "you",
  email: null,
  description: "Local demo mode",
  research_count: 0,
};

export function setAuthToken(token: string | null) {
  // Managed globally by api.ts
  void token;
}

function isNetworkError(error: unknown) {
  return error instanceof TypeError || (error instanceof Error && error.message === "Failed to fetch");
}

function readLocalWallets(): ApiSharedWallet[] {
  try {
    const raw = localStorage.getItem(LOCAL_WALLETS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ApiSharedWallet[];
  } catch {
    return [];
  }
}

function writeLocalWallets(wallets: ApiSharedWallet[]) {
  localStorage.setItem(LOCAL_WALLETS_KEY, JSON.stringify(wallets));
}

function generateJoinCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function nextWalletId(wallets: ApiSharedWallet[]) {
  return wallets.reduce((max, wallet) => Math.max(max, wallet.id), 0) + 1;
}

function nextTransactionId(wallets: ApiSharedWallet[]) {
  return (
    wallets.flatMap((wallet) => wallet.transactions).reduce((max, txn) => Math.max(max, txn.id), 0) + 1
  );
}

function createLocalWallet(payload: {
  name: string;
  currency?: string;
  spending_limit_cents?: number | null;
  alert_threshold_percent?: number;
}) {
  const wallets = readLocalWallets();
  const now = new Date().toISOString();
  const wallet: ApiSharedWallet = {
    id: nextWalletId(wallets),
    name: payload.name,
    currency: payload.currency ?? "USD",
    total_balance_cents: 0,
    spending_limit_cents: payload.spending_limit_cents ?? null,
    alert_threshold_percent: payload.alert_threshold_percent ?? 20,
    join_code: generateJoinCode(),
    created_by: localDemoUser.id,
    created_at: now,
    members: [
      {
        user: localDemoUser,
        role: "admin",
        contributed_cents: 0,
        spent_cents: 0,
        joined_at: now,
      },
    ],
    transactions: [],
  };
  writeLocalWallets([wallet, ...wallets]);
  return wallet;
}

function updateLocalWallet(
  walletId: number,
  updater: (wallet: ApiSharedWallet, allWallets: ApiSharedWallet[]) => ApiSharedWallet,
) {
  const wallets = readLocalWallets();
  const next = wallets.map((wallet) => (wallet.id === walletId ? updater(wallet, wallets) : wallet));
  writeLocalWallets(next);
  const updated = next.find((wallet) => wallet.id === walletId);
  if (!updated) throw new Error("Shared wallet not found");
  return updated;
}

function makeTransaction(
  wallets: ApiSharedWallet[],
  walletId: number,
  type: "topup" | "spend" | "refund",
  amount_cents: number,
  overrides: Partial<ApiWalletTransaction> = {},
): ApiWalletTransaction {
  return {
    id: nextTransactionId(wallets),
    wallet_id: walletId,
    type,
    amount_cents,
    initiated_by: localDemoUser.id,
    merchant: null,
    category: null,
    description: null,
    metadata_json: null,
    created_at: new Date().toISOString(),
    ...overrides,
  };
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

  async createCityGuidePlan(groupId: number) {
    return mainApi.createCityGuidePlan(groupId);
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
    try {
      return await mainApi.listSharedWallets();
    } catch (error) {
      if (!isNetworkError(error)) throw error;
      return readLocalWallets();
    }
  },

  async createSharedWallet(wallet: {
    name: string;
    currency?: string;
    spending_limit_cents?: number | null;
    alert_threshold_percent?: number;
  }) {
    try {
      return await mainApi.createSharedWallet(wallet);
    } catch (error) {
      if (!isNetworkError(error)) throw error;
      return createLocalWallet(wallet);
    }
  },

  async joinSharedWallet(joinCode: string) {
    try {
      return await mainApi.joinSharedWallet(joinCode);
    } catch (error) {
      if (!isNetworkError(error)) throw error;
      const wallets = readLocalWallets();
      const wallet = wallets.find((item) => item.join_code === joinCode);
      if (!wallet) throw new Error("Shared wallet not found");
      if (wallet.members.some((member) => member.user.id === localDemoUser.id)) {
        return wallet;
      }
      const updated = {
        ...wallet,
        members: [
          ...wallet.members,
          {
            user: localDemoUser,
            role: "member",
            contributed_cents: 0,
            spent_cents: 0,
            joined_at: new Date().toISOString(),
          },
        ],
      };
      writeLocalWallets(wallets.map((item) => (item.id === wallet.id ? updated : item)));
      return updated;
    }
  },

  async getSharedWallet(walletId: number) {
    try {
      return await mainApi.getSharedWallet(walletId);
    } catch (error) {
      if (!isNetworkError(error)) throw error;
      const wallet = readLocalWallets().find((item) => item.id === walletId);
      if (!wallet) throw new Error("Shared wallet not found");
      return wallet;
    }
  },

  async updateSharedWallet(
    walletId: number,
    updates: { spending_limit_cents?: number | null; alert_threshold_percent?: number | null },
  ) {
    try {
      return await mainApi.updateSharedWallet(walletId, updates);
    } catch (error) {
      if (!isNetworkError(error)) throw error;
      return updateLocalWallet(walletId, (wallet) => ({
        ...wallet,
        spending_limit_cents:
          updates.spending_limit_cents === undefined
            ? wallet.spending_limit_cents
            : updates.spending_limit_cents,
        alert_threshold_percent:
          updates.alert_threshold_percent === undefined
            ? wallet.alert_threshold_percent
            : updates.alert_threshold_percent,
      }));
    }
  },

  async listWalletTransactions(walletId: number) {
    try {
      return await mainApi.listWalletTransactions(walletId);
    } catch (error) {
      if (!isNetworkError(error)) throw error;
      const wallet = readLocalWallets().find((item) => item.id === walletId);
      return wallet?.transactions ?? [];
    }
  },

  async fundSharedWallet(
    walletId: number,
    payload: { amount_cents: number; payment_method: string; description?: string },
  ) {
    try {
      return await mainApi.fundSharedWallet(walletId, payload);
    } catch (error) {
      if (!isNetworkError(error)) throw error;
      return updateLocalWallet(walletId, (wallet, wallets) => {
        const transaction = makeTransaction(wallets, walletId, "topup", payload.amount_cents, {
          merchant: payload.payment_method,
          description: payload.description ?? `Funded via ${payload.payment_method}`,
          metadata_json: JSON.stringify({ payment_method: payload.payment_method }),
        });
        return {
          ...wallet,
          total_balance_cents: wallet.total_balance_cents + payload.amount_cents,
          members: wallet.members.map((member) =>
            member.user.id === localDemoUser.id
              ? { ...member, contributed_cents: member.contributed_cents + payload.amount_cents }
              : member,
          ),
          transactions: [transaction, ...wallet.transactions],
        };
      });
    }
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
    try {
      return await mainApi.spendSharedWallet(walletId, payload);
    } catch (error) {
      if (!isNetworkError(error)) throw error;
      return updateLocalWallet(walletId, (wallet, wallets) => {
        if (wallet.total_balance_cents < payload.amount_cents) {
          throw new Error("Insufficient shared wallet balance");
        }
        if (
          wallet.spending_limit_cents != null &&
          payload.amount_cents > wallet.spending_limit_cents
        ) {
          throw new Error("Spend exceeds wallet spending limit");
        }
        const transaction = makeTransaction(wallets, walletId, "spend", payload.amount_cents, {
          merchant: payload.merchant,
          category: payload.category ?? null,
          description: payload.description ?? null,
          metadata_json: payload.metadata_json ?? null,
        });
        return {
          ...wallet,
          total_balance_cents: wallet.total_balance_cents - payload.amount_cents,
          members: wallet.members.map((member) =>
            member.user.id === localDemoUser.id
              ? { ...member, spent_cents: member.spent_cents + payload.amount_cents }
              : member,
          ),
          transactions: [transaction, ...wallet.transactions],
        };
      });
    }
  },
};
