// Adapter that maps the colleague's `api.*` calls onto our main `api` client.
import {
  ApiError,
  api as mainApi,
  getDemoUser,
  type ApiCityGuidePlanResponse,
  type ApiDetour,
  type ApiDetourEvent,
  type ApiEvent,
  type ApiGroup,
  type ApiGroupBudget,
  type ApiGroupFavorite,
  type ApiPublicUser,
  type ApiSharedWallet,
  type ApiWalletTransaction,
} from "@/lib/api";

const LOCAL_GROUPS_KEY = "knowhere.groups.local";
const LOCAL_GROUP_FAVORITES_KEY = "knowhere.group-favorites.local";
const LOCAL_GROUP_BUDGETS_KEY = "knowhere.group-budgets.local";
const LOCAL_WALLETS_KEY = "knowhere.shared-wallets.local";
const fallbackDemoUser: ApiPublicUser = {
  id: 0,
  username: "you",
  email: null,
  description: "Local demo mode",
  research_count: 0,
};
const sampleUsers: ApiPublicUser[] = [
  {
    id: 101,
    username: "alina",
    email: null,
    description: "Museum afternoons and candlelit dinners",
    research_count: 0,
  },
  {
    id: 102,
    username: "marco",
    email: null,
    description: "Late reservations, rooftops, and strong espresso",
    research_count: 0,
  },
  {
    id: 103,
    username: "zoe",
    email: null,
    description: "Parks, bookstores, and cozy hidden corners",
    research_count: 0,
  },
  {
    id: 104,
    username: "dev",
    email: null,
    description: "Good seafood, walkability, and one memorable splurge",
    research_count: 0,
  },
];

export function setAuthToken(token: string | null) {
  // Managed globally by api.ts
  void token;
}

function isNetworkError(error: unknown) {
  return (
    error instanceof TypeError ||
    (error instanceof Error && error.message === "Failed to fetch") ||
    (error instanceof ApiError && error.status >= 500)
  );
}

function currentDemoUser(): ApiPublicUser {
  const demoUser = getDemoUser();
  if (!demoUser) return fallbackDemoUser;
  return {
    id: demoUser.id,
    username: demoUser.username,
    email: demoUser.email ?? null,
    description: demoUser.description ?? "Demo mode",
    research_count: demoUser.research_count ?? 0,
  };
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

function readLocalWallets(): ApiSharedWallet[] {
  return readJson<ApiSharedWallet[]>(LOCAL_WALLETS_KEY, []);
}

function writeLocalWallets(wallets: ApiSharedWallet[]) {
  writeJson(LOCAL_WALLETS_KEY, wallets);
}

function readLocalGroups() {
  return readJson<ApiGroup[]>(LOCAL_GROUPS_KEY, []);
}

function writeLocalGroups(groups: ApiGroup[]) {
  writeJson(LOCAL_GROUPS_KEY, groups);
}

function readLocalFavorites() {
  return readJson<Record<number, ApiGroupFavorite[]>>(LOCAL_GROUP_FAVORITES_KEY, {});
}

function writeLocalFavorites(favorites: Record<number, ApiGroupFavorite[]>) {
  writeJson(LOCAL_GROUP_FAVORITES_KEY, favorites);
}

function readLocalBudgets() {
  return readJson<Record<number, ApiGroupBudget[]>>(LOCAL_GROUP_BUDGETS_KEY, {});
}

function writeLocalBudgets(budgets: Record<number, ApiGroupBudget[]>) {
  writeJson(LOCAL_GROUP_BUDGETS_KEY, budgets);
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
    created_by: currentDemoUser().id,
    created_at: now,
    members: [
      {
        user: currentDemoUser(),
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
    initiated_by: currentDemoUser().id,
    merchant: null,
    category: null,
    description: null,
    metadata_json: null,
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

function nextGroupId(groups: ApiGroup[]) {
  return groups.reduce((max, group) => Math.max(max, group.id), 0) + 1;
}

function nextFavoriteId(favorites: Record<number, ApiGroupFavorite[]>) {
  return (
    Object.values(favorites)
      .flat()
      .reduce((max, favorite) => Math.max(max, favorite.id), 0) + 1
  );
}

function listLocalUsers() {
  const demoUser = currentDemoUser();
  return [demoUser, ...sampleUsers.filter((user) => user.id !== demoUser.id)];
}

function createLocalGroup(name: string, description?: string) {
  const groups = readLocalGroups();
  const owner = currentDemoUser();
  const group: ApiGroup = {
    id: nextGroupId(groups),
    name,
    description: description ?? null,
    owner_id: owner.id,
    created_at: new Date().toISOString(),
    memberships: [
      {
        user: owner,
        status: "accepted",
        created_at: new Date().toISOString(),
      },
    ],
  };
  writeLocalGroups([group, ...groups]);
  return group;
}

function updateLocalGroup(groupId: number, updater: (group: ApiGroup) => ApiGroup) {
  const groups = readLocalGroups();
  const next = groups.map((group) => (group.id === groupId ? updater(group) : group));
  writeLocalGroups(next);
  const updated = next.find((group) => group.id === groupId);
  if (!updated) throw new Error("Group not found");
  return updated;
}

function makeDetourEvent(
  groupName: string,
  budgetAmount: number,
  favorite: ApiGroupFavorite | undefined,
  order: number,
): ApiDetourEvent {
  const ideas = [
    {
      title: "Sunlit cafe start",
      description: "A slow espresso stop with room to settle in and set the tone.",
    },
    {
      title: "Gallery drift",
      description: "A polished culture stop with enough texture for the whole crew.",
    },
    {
      title: "Golden-hour harbor walk",
      description: "An easy scenic stretch that feels thoughtful, not overplanned.",
    },
    {
      title: "Signature dinner reservation",
      description: "A polished table that lands the night without blowing the budget.",
    },
  ];
  const chosen = favorite
    ? {
        title: favorite.title,
        description: favorite.description || `Built around ${favorite.title.toLowerCase()} for ${groupName}.`,
      }
    : ideas[order] ?? ideas[ideas.length - 1];
  const event: ApiEvent = {
    id: Date.now() + order,
    title: chosen.title,
    description:
      chosen.description +
      (budgetAmount
        ? ` Keeps the vibe around $${Math.round(budgetAmount)} per person.`
        : ""),
    start_time: new Date().toISOString(),
    end_time: new Date(Date.now() + (order + 1) * 60 * 60 * 1000).toISOString(),
    location: [-71.0589 + order * 0.01, 42.3601 + order * 0.01],
    owner_type: "group",
    owner_id: 0,
  };
  return { event_id: event.id, order, event };
}

function createLocalPlan(groupId: number): ApiCityGuidePlanResponse {
  const group = readLocalGroups().find((entry) => entry.id === groupId);
  if (!group) throw new Error("Group not found");
  const favoriteMap = readLocalFavorites();
  const favorites = favoriteMap[groupId] ?? [];
  const budgetMap = readLocalBudgets();
  const budget = budgetMap[groupId]?.[0];
  const budgetAmount = budget?.total_budget ?? 0;
  const chosenFavorites = favorites.slice(0, 3);
  const events = [0, 1, 2].map((order) =>
    makeDetourEvent(group.name, budgetAmount, chosenFavorites[order], order),
  );
  const detour: ApiDetour = {
    id: groupId,
    user_id: currentDemoUser().id,
    name: `${group.name} in Boston`,
    description: "A polished little run of stops shaped around the group's taste, pace, and budget.",
    events,
  };
  return {
    steps: [
      { phase: "sync", title: "Crew vibe locked", detail: `${group.memberships.length} travelers aligned around one easy plan.` },
      { phase: "budget", title: "Budget held", detail: budgetAmount ? `Designed around about $${Math.round(budgetAmount)} per person.` : "Designed to stay flexible and easy." },
      { phase: "detour", title: "Detour ready", detail: "A few elegant stops with enough room to wander." },
    ],
    detour,
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
    try {
      return await mainApi.listUsers();
    } catch (error) {
      if (!isNetworkError(error)) throw error;
      return listLocalUsers();
    }
  },

  async listGroups() {
    try {
      return await mainApi.listGroups();
    } catch (error) {
      if (!isNetworkError(error)) throw error;
      return readLocalGroups();
    }
  },

  async createGroup(name: string, description?: string) {
    try {
      return await mainApi.createGroup(name, description);
    } catch (error) {
      if (!isNetworkError(error)) throw error;
      return createLocalGroup(name, description);
    }
  },

  async inviteToGroup(groupId: number, username: string) {
    try {
      return await mainApi.inviteToGroup(groupId, username);
    } catch (error) {
      if (!isNetworkError(error)) throw error;
      const user = listLocalUsers().find((candidate) => candidate.username === username);
      if (!user) throw new Error("User not found");
      return updateLocalGroup(groupId, (group) => ({
        ...group,
        memberships: group.memberships.some((membership) => membership.user.id === user.id)
          ? group.memberships
          : [
              ...group.memberships,
              {
                user,
                status: "invited",
                created_at: new Date().toISOString(),
              },
            ],
      }));
    }
  },

  async acceptGroupInvite(groupId: number) {
    try {
      return await mainApi.acceptGroupInvite(groupId);
    } catch (error) {
      if (!isNetworkError(error)) throw error;
      const me = currentDemoUser();
      return updateLocalGroup(groupId, (group) => ({
        ...group,
        memberships: group.memberships.some((membership) => membership.user.id === me.id)
          ? group.memberships.map((membership) =>
              membership.user.id === me.id ? { ...membership, status: "accepted" } : membership,
            )
          : [
              ...group.memberships,
              { user: me, status: "accepted", created_at: new Date().toISOString() },
            ],
      }));
    }
  },

  async listGroupFavorites(groupId: number) {
    try {
      return await mainApi.listGroupFavorites(groupId);
    } catch (error) {
      if (!isNetworkError(error)) throw error;
      return readLocalFavorites()[groupId] ?? [];
    }
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
    try {
      return await mainApi.createGroupFavorite(groupId, favorite);
    } catch (error) {
      if (!isNetworkError(error)) throw error;
      const allFavorites = readLocalFavorites();
      const created: ApiGroupFavorite = {
        id: nextFavoriteId(allFavorites),
        group_id: groupId,
        title: favorite.title,
        description: favorite.description ?? null,
        category: favorite.category ?? null,
        estimated_cost: favorite.estimated_cost ?? null,
        created_by: currentDemoUser(),
        created_at: new Date().toISOString(),
        vote_count: 1,
        voted_by_me: true,
      };
      allFavorites[groupId] = [created, ...(allFavorites[groupId] ?? [])];
      writeLocalFavorites(allFavorites);
      return created;
    }
  },

  async toggleGroupFavoriteVote(groupId: number, favoriteId: number) {
    try {
      return await mainApi.toggleGroupFavoriteVote(groupId, favoriteId);
    } catch (error) {
      if (!isNetworkError(error)) throw error;
      const allFavorites = readLocalFavorites();
      const groupFavorites = allFavorites[groupId] ?? [];
      let voted = false;
      allFavorites[groupId] = groupFavorites.map((favorite) => {
        if (favorite.id !== favoriteId) return favorite;
        voted = !favorite.voted_by_me;
        return {
          ...favorite,
          voted_by_me: voted,
          vote_count: Math.max(0, favorite.vote_count + (voted ? 1 : -1)),
        };
      });
      writeLocalFavorites(allFavorites);
      return { voted };
    }
  },

  async listGroupBudgets(groupId: number) {
    try {
      return await mainApi.listGroupBudgets(groupId);
    } catch (error) {
      if (!isNetworkError(error)) throw error;
      return readLocalBudgets()[groupId] ?? [];
    }
  },

  async upsertGroupBudget(
    groupId: number,
    budget: { total_budget: number; currency?: string; notes?: string },
  ) {
    try {
      return await mainApi.upsertGroupBudget(groupId, budget);
    } catch (error) {
      if (!isNetworkError(error)) throw error;
      const allBudgets = readLocalBudgets();
      const saved: ApiGroupBudget = {
        group_id: groupId,
        user: currentDemoUser(),
        total_budget: budget.total_budget,
        currency: budget.currency ?? "USD",
        notes: budget.notes ?? null,
        created_at: allBudgets[groupId]?.[0]?.created_at ?? new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      allBudgets[groupId] = [saved];
      writeLocalBudgets(allBudgets);
      return saved;
    }
  },

  async createCityGuidePlan(groupId: number) {
    try {
      return await mainApi.createCityGuidePlan(groupId);
    } catch (error) {
      if (!isNetworkError(error)) throw error;
      return createLocalPlan(groupId);
    }
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
      if (wallet.members.some((member) => member.user.id === currentDemoUser().id)) {
        return wallet;
      }
      const updated = {
        ...wallet,
        members: [
          ...wallet.members,
          {
            user: currentDemoUser(),
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
            member.user.id === currentDemoUser().id
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
            member.user.id === currentDemoUser().id
              ? { ...member, spent_cents: member.spent_cents + payload.amount_cents }
              : member,
          ),
          transactions: [transaction, ...wallet.transactions],
        };
      });
    }
  },
};
