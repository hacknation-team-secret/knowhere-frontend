import { useState, useRef, useEffect } from "react";
import { Loader2, Send, Sparkles, User, Bot, BookmarkPlus, Check, Users, UserPlus, Heart, DollarSign, Instagram, Globe, Link as LinkIcon, Images } from "lucide-react";
import { useApp } from "@/cityApp/CityShell";
import { api } from "@/cityApp/lib/apiAdapter";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import type { ApiGroup, ApiGroupBudget, ApiGroupFavorite, ApiPublicUser, ApiResearchExtractResponse } from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "Plan an itinerary for my group using everyone's passports.",
  "What should I do this weekend based on my passport?",
  "Analyze my travel style from my detours.",
  "Recommend a new neighborhood for me to explore.",
];

export default function Research() {
  const { auth, requireAuth, passport } = useApp();
  const { toast } = useToast();
  const location = useLocation();
  const initialInstagramUrl =
    typeof location.state?.instagramUrl === "string" ? location.state.instagramUrl : "";
  const [text, setText] = useState("");
  const [thinking, setThinking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [threadId, setThreadId] = useState<number | undefined>(
    location.state?.threadId
  );
  const [isCapturing, setIsCapturing] = useState(false);
  const [isCaptured, setIsCaptured] = useState(false);
  const [users, setUsers] = useState<ApiPublicUser[]>([]);
  const [groups, setGroups] = useState<ApiGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number | undefined>();
  const [userQuery, setUserQuery] = useState("");
  const [groupName, setGroupName] = useState("Weekend crew");
  const [groupDescription, setGroupDescription] = useState("A shared trip plan that balances food, culture, pace, and budget.");
  const [inviteUsername, setInviteUsername] = useState("");
  const [groupLoading, setGroupLoading] = useState(false);
  const [favorites, setFavorites] = useState<ApiGroupFavorite[]>([]);
  const [budgets, setBudgets] = useState<ApiGroupBudget[]>([]);
  const [favoriteTitle, setFavoriteTitle] = useState("");
  const [favoriteDescription, setFavoriteDescription] = useState("");
  const [favoriteCost, setFavoriteCost] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [budgetNotes, setBudgetNotes] = useState("");
  const [extractUrl, setExtractUrl] = useState(initialInstagramUrl);
  const [extractQuery, setExtractQuery] = useState("Extract public profile details, links, and visible taste signals.");
  const [extractResult, setExtractResult] = useState<ApiResearchExtractResponse | null>(null);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const selectedGroup = groups.find((group) => group.id === selectedGroupId);
  const selectedMembership = selectedGroup?.memberships.find(
    (membership) => membership.user.id === auth.user?.id,
  );
  const canUseSelectedGroup = !!selectedGroup && selectedMembership?.status === "accepted";
  const invitableUsers = users.filter(
    (user) => !selectedGroup?.memberships.some((membership) => membership.user.id === user.id),
  );
  const visibleUsers = users
    .filter((user) => user.id !== auth.user?.id)
    .filter((user) => {
      const query = userQuery.trim().toLowerCase();
      if (!query) return true;
      return [user.username, user.email, user.description]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query));
    })
    .slice(0, 8);
  const acceptedMemberCount = selectedGroup?.memberships.filter(
    (membership) => membership.status === "accepted",
  ).length ?? 0;
  const averageBudget = budgets.length
    ? budgets.reduce((sum, budget) => sum + budget.total_budget, 0) / budgets.length
    : 0;
  const favoriteCostTotal = favorites
    .filter((favorite) => favorite.voted_by_me)
    .reduce((sum, favorite) => sum + (favorite.estimated_cost ?? 0), 0);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, thinking]);

  // If we have a threadId but no messages, we could fetch history.
  // For now, let's at least maintain the ID for continuity.
  useEffect(() => {
    if (threadId && messages.length === 0) {
      // In a real app, we'd fetch the thread history here.
      // api.getThread(threadId).then(t => setMessages(t.messages.map(m => ({role: m.role, content: m.content}))))
    }
  }, [messages.length, threadId]);

  useEffect(() => {
    if (!auth.user) return;

    let cancelled = false;
    const loadGroups = async () => {
      try {
        const [nextUsers, nextGroups] = await Promise.all([
          api.listUsers(),
          api.listGroups(),
        ]);
        if (cancelled) return;
        setUsers(nextUsers);
        setGroups(nextGroups);
        setSelectedGroupId((current) => current ?? nextGroups[0]?.id);
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      }
    };

    void loadGroups();
    return () => {
      cancelled = true;
    };
  }, [auth.user]);

  useEffect(() => {
    if (!auth.user || !selectedGroupId || selectedMembership?.status !== "accepted") {
      setFavorites([]);
      setBudgets([]);
      return;
    }

    let cancelled = false;
    const loadPlanningData = async () => {
      try {
        const [nextFavorites, nextBudgets] = await Promise.all([
          api.listGroupFavorites(selectedGroupId),
          api.listGroupBudgets(selectedGroupId),
        ]);
        if (cancelled) return;
        setFavorites(nextFavorites);
        setBudgets(nextBudgets);
        const myBudget = nextBudgets.find((budget) => budget.user.id === auth.user?.id);
        setBudgetAmount(myBudget ? String(myBudget.total_budget) : "");
        setBudgetNotes(myBudget?.notes ?? "");
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      }
    };

    void loadPlanningData();
    return () => {
      cancelled = true;
    };
  }, [auth.user, selectedGroupId, selectedMembership?.status]);

  const submit = async (raw: string) => {
    const query = raw.trim();
    if (!query) return;

    setError(null);
    setMessages((prev) => [...prev, { role: "user", content: query }]);
    setText("");
    setThinking(true);
    setIsCaptured(false);

    try {
      if (!auth.user) {
        const ok = await requireAuth("Sign in to chat with the research agent.");
        if (!ok) {
          setThinking(false);
          return;
        }
      }

      const res = await api.chat(query, threadId, canUseSelectedGroup && selectedGroup ? selectedGroup.id : undefined);
      setMessages((prev) => [...prev, { role: "assistant", content: res.answer }]);
      if (res.thread_id) {
        setThreadId(res.thread_id);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setThinking(false);
    }
  };

  const createGroup = async () => {
    if (!groupName.trim()) return;
    setGroupLoading(true);
    try {
      const group = await api.createGroup(groupName.trim(), groupDescription.trim() || undefined);
      setGroups((prev) => [group, ...prev]);
      setSelectedGroupId(group.id);
      toast({ title: "Group created", description: "Invite platform users to plan together." });
    } catch (e) {
      toast({ title: "Group failed", description: (e as Error).message, variant: "destructive" });
    } finally {
      setGroupLoading(false);
    }
  };

  const inviteUser = async () => {
    if (!selectedGroup || !inviteUsername) return;
    await inviteUserToSelected(inviteUsername);
  };

  const inviteUserToSelected = async (username: string) => {
    if (!selectedGroup || !username) return;
    setGroupLoading(true);
    try {
      const group = await api.inviteToGroup(selectedGroup.id, username);
      setGroups((prev) => prev.map((item) => item.id === group.id ? group : item));
      setInviteUsername("");
      toast({ title: "Invite sent", description: `${username} can now join this trip group.` });
    } catch (e) {
      toast({ title: "Invite failed", description: (e as Error).message, variant: "destructive" });
    } finally {
      setGroupLoading(false);
    }
  };

  const acceptInvite = async (groupId: number) => {
    setGroupLoading(true);
    try {
      const group = await api.acceptGroupInvite(groupId);
      setGroups((prev) => prev.map((item) => item.id === group.id ? group : item));
      setSelectedGroupId(group.id);
      toast({ title: "Joined group", description: "The research agent can now plan with this group." });
    } catch (e) {
      toast({ title: "Join failed", description: (e as Error).message, variant: "destructive" });
    } finally {
      setGroupLoading(false);
    }
  };

  const addFavorite = async () => {
    if (!selectedGroup || !favoriteTitle.trim()) return;
    setGroupLoading(true);
    try {
      const favorite = await api.createGroupFavorite(selectedGroup.id, {
        title: favoriteTitle.trim(),
        description: favoriteDescription.trim() || undefined,
        estimated_cost: favoriteCost ? Number(favoriteCost) : undefined,
      });
      setFavorites((prev) => [favorite, ...prev]);
      setFavoriteTitle("");
      setFavoriteDescription("");
      setFavoriteCost("");
      toast({ title: "Favorite added", description: "Your vote was added automatically." });
    } catch (e) {
      toast({ title: "Favorite failed", description: (e as Error).message, variant: "destructive" });
    } finally {
      setGroupLoading(false);
    }
  };

  const toggleFavoriteVote = async (favoriteId: number) => {
    if (!selectedGroup) return;
    const current = favorites.find((favorite) => favorite.id === favoriteId);
    if (!current) return;

    setFavorites((prev) => prev.map((favorite) => {
      if (favorite.id !== favoriteId) return favorite;
      return {
        ...favorite,
        voted_by_me: !favorite.voted_by_me,
        vote_count: favorite.vote_count + (favorite.voted_by_me ? -1 : 1),
      };
    }));

    try {
      await api.toggleGroupFavoriteVote(selectedGroup.id, favoriteId);
    } catch (e) {
      setFavorites((prev) => prev.map((favorite) => favorite.id === favoriteId ? current : favorite));
      toast({ title: "Vote failed", description: (e as Error).message, variant: "destructive" });
    }
  };

  const saveBudget = async () => {
    if (!selectedGroup || !budgetAmount) return;
    setGroupLoading(true);
    try {
      const budget = await api.upsertGroupBudget(selectedGroup.id, {
        total_budget: Number(budgetAmount),
        currency: "USD",
        notes: budgetNotes.trim() || undefined,
      });
      setBudgets((prev) => {
        const exists = prev.some((item) => item.user.id === budget.user.id);
        return exists
          ? prev.map((item) => item.user.id === budget.user.id ? budget : item)
          : [...prev, budget];
      });
      toast({ title: "Budget saved", description: "Your spend target is part of the group simulation." });
    } catch (e) {
      toast({ title: "Budget failed", description: (e as Error).message, variant: "destructive" });
    } finally {
      setGroupLoading(false);
    }
  };

  const handleCapture = async () => {
    if (!threadId) return;
    setIsCapturing(true);
    try {
      await api.captureResearch(threadId);
      setIsCaptured(true);
      toast({
        title: "Captured to Passport",
        description: "This research session has been saved to your passport.",
      });
    } catch (e) {
      toast({
        title: "Capture failed",
        description: (e as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsCapturing(false);
    }
  };

  const handleExtract = async () => {
    const url = extractUrl.trim();
    if (!url) return;

    setExtractError(null);
    setExtractResult(null);
    setExtracting(true);

    try {
      if (!auth.user) {
        const ok = await requireAuth("Sign in to extract a public profile URL.");
        if (!ok) {
          setExtracting(false);
          return;
        }
      }

      const result = await api.extractResearch(
        url,
        extractQuery.trim() || undefined,
        "advanced",
        true,
      );
      setExtractResult(result);
      if (result.failed) {
        setExtractError(result.error || "Extraction returned no usable result.");
      }
    } catch (e) {
      setExtractError((e as Error).message);
    } finally {
      setExtracting(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[320px_1fr]">
      <aside className="rounded-[2rem] border border-line bg-card p-5 shadow-sm h-fit">
        <div className="flex items-center gap-2 text-ink">
          <Users className="h-5 w-5 text-stamp" strokeWidth={2} />
          <h2 className="font-serif text-xl">Trip Groups</h2>
        </div>
        <p className="mt-2 text-sm text-ink-soft">
          Discover platform groups, invite users on Knowhere, then ask the copilot for itineraries that combine everyone's passport.
        </p>

        {!auth.user ? (
          <p className="mt-5 rounded-2xl border border-dashed border-line p-4 text-sm text-ink-soft">
            Sign in to discover users and create a group trip.
          </p>
        ) : (
          <div className="mt-5 space-y-5">
            <div className="space-y-2">
              <input
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="h-10 w-full rounded-xl border border-line bg-paper px-3 text-sm focus:border-stamp focus:outline-none"
                placeholder="Group name"
              />
              <textarea
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
                className="min-h-20 w-full rounded-xl border border-line bg-paper px-3 py-2 text-sm focus:border-stamp focus:outline-none"
                placeholder="Trip goals, dates, constraints"
              />
              <button
                type="button"
                onClick={createGroup}
                disabled={groupLoading || !groupName.trim()}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {groupLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                Create Group
              </button>
            </div>

            {groups.length > 0 && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft">
                    Active Group
                  </label>
                  <select
                    value={selectedGroupId ?? ""}
                    onChange={(e) => setSelectedGroupId(Number(e.target.value) || undefined)}
                    className="h-10 w-full rounded-xl border border-line bg-paper px-3 text-sm focus:border-stamp focus:outline-none"
                  >
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>{group.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft">
                    All Platform Groups
                  </p>
                  <div className="space-y-2">
                    {groups.map((group) => {
                      const membership = group.memberships.find((item) => item.user.id === auth.user?.id);
                      const accepted = group.memberships.filter((item) => item.status === "accepted").length;
                      return (
                        <button
                          key={group.id}
                          type="button"
                          onClick={() => setSelectedGroupId(group.id)}
                          className={cn(
                            "w-full rounded-2xl border p-3 text-left transition-colors",
                            selectedGroupId === group.id
                              ? "border-ocean/40 bg-ocean/10"
                              : "border-line bg-paper hover:border-ocean/30",
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-ink">{group.name}</p>
                              {group.description && (
                                <p className="mt-0.5 line-clamp-2 text-xs text-ink-soft">{group.description}</p>
                              )}
                            </div>
                            <span className="shrink-0 rounded-full bg-card px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-soft">
                              {membership?.status ?? "view"}
                            </span>
                          </div>
                          <p className="mt-2 text-xs text-ink-soft">
                            {accepted} accepted member{accepted === 1 ? "" : "s"}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3 rounded-2xl border border-line bg-paper p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft">
                    Find People
                  </p>
                  <p className="mt-1 text-xs text-ink-soft">
                    Search users on Knowhere and invite them into the active trip group.
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-card px-2 py-1 text-xs font-semibold text-ink-soft">
                  {Math.max(users.length - 1, 0)} users
                </span>
              </div>

              <input
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                className="h-10 w-full rounded-xl border border-line bg-card px-3 text-sm focus:border-stamp focus:outline-none"
                placeholder="Search username, email, taste notes"
              />

              <div className="space-y-2">
                {visibleUsers.length > 0 ? (
                  visibleUsers.map((user) => {
                    const membership = selectedGroup?.memberships.find((item) => item.user.id === user.id);
                    const canInvite = !!selectedGroup && selectedMembership?.status === "accepted" && !membership;
                    return (
                      <div key={user.id} className="rounded-2xl border border-line bg-card p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-ink">@{user.username}</p>
                            {user.description && (
                              <p className="mt-0.5 line-clamp-2 text-xs text-ink-soft">{user.description}</p>
                            )}
                          </div>
                          {canInvite ? (
                            <button
                              type="button"
                              onClick={() => {
                                setInviteUsername(user.username);
                                void inviteUserToSelected(user.username);
                              }}
                              disabled={groupLoading}
                              className="shrink-0 rounded-full bg-stamp px-3 py-1 text-xs font-semibold text-white disabled:opacity-50"
                            >
                              Invite
                            </button>
                          ) : (
                            <span className="shrink-0 rounded-full bg-paper px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-soft">
                              {membership?.status ?? "select group"}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="rounded-xl border border-dashed border-line p-3 text-xs text-ink-soft">
                    No matching users found.
                  </p>
                )}
              </div>
            </div>

            {selectedGroup && (
              <div className="rounded-2xl border border-line bg-paper-soft p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-serif text-lg text-ink">{selectedGroup.name}</h3>
                    <p className="text-xs text-ink-soft">{selectedGroup.description}</p>
                  </div>
                  {selectedMembership?.status === "pending" && (
                    <button
                      type="button"
                      onClick={() => acceptInvite(selectedGroup.id)}
                      className="rounded-full bg-stamp px-3 py-1 text-xs font-semibold text-white"
                    >
                      Join
                    </button>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedGroup.memberships.map((membership) => (
                    <span
                      key={membership.user.id}
                      className={cn(
                        "rounded-full border px-2.5 py-1 text-xs",
                        membership.status === "accepted"
                          ? "border-stamp/30 bg-stamp/10 text-stamp"
                          : "border-line bg-card text-ink-soft",
                      )}
                    >
                      @{membership.user.username} {membership.status === "pending" ? "(pending)" : ""}
                    </span>
                  ))}
                </div>

                {selectedMembership?.status === "accepted" && invitableUsers.length > 0 && (
                  <div className="mt-4 flex gap-2">
                    <select
                      value={inviteUsername}
                      onChange={(e) => setInviteUsername(e.target.value)}
                      className="h-10 min-w-0 flex-1 rounded-xl border border-line bg-card px-3 text-sm focus:border-stamp focus:outline-none"
                    >
                      <option value="">Invite user</option>
                      {invitableUsers.map((user) => (
                        <option key={user.id} value={user.username}>@{user.username}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={inviteUser}
                      disabled={groupLoading || !inviteUsername}
                      className="rounded-xl bg-stamp px-3 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      Invite
                    </button>
                  </div>
                )}

                {selectedMembership?.status === "accepted" && (
                  <div className="mt-5 space-y-5 border-t border-line pt-5">
                    <section className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Heart className="h-4 w-4 text-stamp" />
                          <h4 className="text-sm font-semibold text-ink">Favorites to Vote On</h4>
                        </div>
                        <span className="text-xs text-ink-soft">
                          {favorites.length} ideas
                        </span>
                      </div>

                      <div className="space-y-2">
                        <input
                          value={favoriteTitle}
                          onChange={(e) => setFavoriteTitle(e.target.value)}
                          className="h-10 w-full rounded-xl border border-line bg-card px-3 text-sm focus:border-stamp focus:outline-none"
                          placeholder="Add restaurant, museum, hike..."
                        />
                        <div className="grid grid-cols-[1fr_96px] gap-2">
                          <input
                            value={favoriteDescription}
                            onChange={(e) => setFavoriteDescription(e.target.value)}
                            className="h-10 min-w-0 rounded-xl border border-line bg-card px-3 text-sm focus:border-stamp focus:outline-none"
                            placeholder="Why should it make the plan?"
                          />
                          <input
                            value={favoriteCost}
                            onChange={(e) => setFavoriteCost(e.target.value)}
                            className="h-10 rounded-xl border border-line bg-card px-3 text-sm focus:border-stamp focus:outline-none"
                            inputMode="decimal"
                            placeholder="$/pp"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={addFavorite}
                          disabled={groupLoading || !favoriteTitle.trim()}
                          className="w-full rounded-xl border border-stamp/30 bg-stamp/10 px-3 py-2 text-sm font-semibold text-stamp disabled:opacity-50"
                        >
                          Add and Vote
                        </button>
                      </div>

                      <div className="space-y-2">
                        {favorites.map((favorite) => (
                          <button
                            key={favorite.id}
                            type="button"
                            onClick={() => toggleFavoriteVote(favorite.id)}
                            className={cn(
                              "w-full rounded-2xl border p-3 text-left transition-colors",
                              favorite.voted_by_me
                                ? "border-stamp/40 bg-stamp/10"
                                : "border-line bg-card hover:border-stamp/30",
                            )}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-ink">{favorite.title}</p>
                                {favorite.description && (
                                  <p className="mt-0.5 text-xs text-ink-soft">{favorite.description}</p>
                                )}
                              </div>
                              <span className="shrink-0 rounded-full bg-card px-2 py-1 text-xs font-semibold text-stamp">
                                {favorite.vote_count} vote{favorite.vote_count === 1 ? "" : "s"}
                              </span>
                            </div>
                            {favorite.estimated_cost != null && (
                              <p className="mt-2 text-xs text-ink-soft">
                                Est. ${favorite.estimated_cost.toFixed(0)} per person
                              </p>
                            )}
                          </button>
                        ))}
                      </div>
                    </section>

                    <section className="space-y-3">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-ocean-deep" />
                        <h4 className="text-sm font-semibold text-ink">Budget Simulation</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded-xl border border-line bg-card p-3">
                          <p className="uppercase tracking-[0.14em] text-ink-soft">Avg / person</p>
                          <p className="mt-1 font-serif text-xl text-ink">${averageBudget.toFixed(0)}</p>
                        </div>
                        <div className="rounded-xl border border-line bg-card p-3">
                          <p className="uppercase tracking-[0.14em] text-ink-soft">My voted cost</p>
                          <p className="mt-1 font-serif text-xl text-ink">${favoriteCostTotal.toFixed(0)}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-[112px_1fr] gap-2">
                        <input
                          value={budgetAmount}
                          onChange={(e) => setBudgetAmount(e.target.value)}
                          className="h-10 rounded-xl border border-line bg-card px-3 text-sm focus:border-stamp focus:outline-none"
                          inputMode="decimal"
                          placeholder="Budget"
                        />
                        <input
                          value={budgetNotes}
                          onChange={(e) => setBudgetNotes(e.target.value)}
                          className="h-10 min-w-0 rounded-xl border border-line bg-card px-3 text-sm focus:border-stamp focus:outline-none"
                          placeholder="Notes: meals, transit, splurge..."
                        />
                      </div>
                      <button
                        type="button"
                        onClick={saveBudget}
                        disabled={groupLoading || !budgetAmount}
                        className="w-full rounded-xl bg-ocean-deep px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                      >
                        Save Budget
                      </button>
                      {budgets.length > 0 && (
                        <div className="space-y-1 text-xs text-ink-soft">
                          {budgets.map((budget) => (
                            <p key={budget.user.id}>
                              @{budget.user.username}: {budget.currency} {budget.total_budget.toFixed(0)}
                              {budget.notes ? `, ${budget.notes}` : ""}
                            </p>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-ink-soft">
                        {acceptedMemberCount} accepted member{acceptedMemberCount === 1 ? "" : "s"}; the agent will balance votes against these budgets.
                      </p>
                    </section>
                  </div>
                )}
              </div>
            )}

            <div className="rounded-2xl border border-line bg-paper-soft p-4">
              <div className="flex items-center gap-2 text-ink">
                <Instagram className="h-4 w-4 text-stamp" strokeWidth={2} />
                <h3 className="font-serif text-lg">Public Profile Extract</h3>
              </div>
              <p className="mt-2 text-sm text-ink-soft">
                Paste a public Instagram profile URL and inspect what Tavily Extract can actually pull back before we rely on it.
              </p>

              <div className="mt-4 space-y-2">
                <input
                  value={extractUrl}
                  onChange={(e) => setExtractUrl(e.target.value)}
                  className="h-10 w-full rounded-xl border border-line bg-card px-3 text-sm focus:border-stamp focus:outline-none"
                  placeholder="https://www.instagram.com/yourhandle/"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                />
                <textarea
                  value={extractQuery}
                  onChange={(e) => setExtractQuery(e.target.value)}
                  className="min-h-20 w-full rounded-xl border border-line bg-card px-3 py-2 text-sm focus:border-stamp focus:outline-none"
                  placeholder="Optional extraction hint"
                />
                <button
                  type="button"
                  onClick={handleExtract}
                  disabled={extracting || !extractUrl.trim()}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-stamp px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {extracting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
                  Run Tavily Extract
                </button>
              </div>

              {extractError && (
                <div className="mt-4 rounded-2xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                  {extractError}
                </div>
              )}

              {extractResult && (
                <div className="mt-4 space-y-4">
                  <div className="rounded-2xl border border-line bg-card p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-stamp/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-stamp">
                        {extractResult.platform}
                      </span>
                      <span className="rounded-full bg-paper px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-soft">
                        {extractResult.extract_depth}
                      </span>
                      {extractResult.tavily_response_time != null && (
                        <span className="text-xs text-ink-soft">
                          {extractResult.tavily_response_time.toFixed(2)}s
                        </span>
                      )}
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <Metric label="Username" value={extractResult.profile?.username} />
                      <Metric label="Display name" value={extractResult.profile?.display_name} />
                      <Metric label="Followers" value={formatNumber(extractResult.profile?.follower_count)} />
                      <Metric label="Following" value={formatNumber(extractResult.profile?.following_count)} />
                      <Metric label="Posts" value={formatNumber(extractResult.profile?.post_count)} />
                      <Metric label="Images" value={String(extractResult.images.length)} />
                    </div>

                    {extractResult.profile?.bio && (
                      <div className="mt-3 rounded-xl border border-line bg-paper p-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft">Bio</p>
                        <p className="mt-1 text-sm text-ink">{extractResult.profile.bio}</p>
                      </div>
                    )}

                    {(extractResult.profile?.external_url || extractResult.url) && (
                      <div className="mt-3 space-y-2 text-xs text-ink-soft">
                        <div className="flex items-start gap-2">
                          <LinkIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-soft" />
                          <a
                            href={extractResult.url}
                            target="_blank"
                            rel="noreferrer"
                            className="break-all text-ocean-deep hover:underline"
                          >
                            {extractResult.url}
                          </a>
                        </div>
                        {extractResult.profile?.external_url && (
                          <div className="flex items-start gap-2">
                            <Globe className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-soft" />
                            <a
                              href={extractResult.profile.external_url}
                              target="_blank"
                              rel="noreferrer"
                              className="break-all text-ocean-deep hover:underline"
                            >
                              {extractResult.profile.external_url}
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {extractResult.images.length > 0 && (
                    <div className="rounded-2xl border border-line bg-card p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <Images className="h-4 w-4 text-ocean-deep" />
                        <p className="text-sm font-semibold text-ink">Returned Images</p>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {extractResult.images.slice(0, 6).map((imageUrl) => (
                          <a
                            key={imageUrl}
                            href={imageUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="overflow-hidden rounded-xl border border-line bg-paper"
                          >
                            <img
                              src={imageUrl}
                              alt=""
                              className="h-24 w-full object-cover"
                              loading="lazy"
                            />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {extractResult.raw_content && (
                    <div className="rounded-2xl border border-line bg-card p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft">
                        Extracted Content Preview
                      </p>
                      <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap font-sans text-xs leading-relaxed text-ink-soft">
                        {extractResult.raw_content}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </aside>

      <div className="flex flex-col h-[calc(100vh-180px)] min-w-0">
      <header className="mb-6 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-stamp" strokeWidth={2} />
            <h1 className="font-serif text-3xl text-ink">Trip Copilot</h1>
          </div>
          <p className="mt-2 text-ink-soft italic font-serif">
            Plan with your passport, your groups, votes, and shared budgets.
          </p>
        </div>

        {threadId && messages.length > 0 && (
          <button
            onClick={handleCapture}
            disabled={isCapturing || isCaptured}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all",
              isCaptured 
                ? "bg-green-100 text-green-700 border border-green-200"
                : "bg-stamp/10 text-stamp hover:bg-stamp/20 border border-stamp/20"
            )}
          >
            {isCapturing ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : isCaptured ? (
              <>
                <Check className="h-4 w-4" />
                Captured to Passport
              </>
            ) : (
              <>
                <BookmarkPlus className="h-4 w-4" />
                Capture Session
              </>
            )}
          </button>
        )}
      </header>

      {/* Chat Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2 scrollbar-thin scrollbar-thumb-line"
      >
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-stamp/10 text-stamp mb-4">
              <Bot className="h-6 w-6" />
            </div>
            <h2 className="font-serif text-xl text-ink">How can I help you explore?</h2>
            <p className="text-ink-soft text-sm mt-1 max-w-sm mx-auto">
              I can analyze your {passport.length} collected detours{canUseSelectedGroup && selectedGroup ? ` plus ${selectedGroup.memberships.filter((m) => m.status === "accepted").length} group passports` : ""} and suggest what's next.
            </p>
            {canUseSelectedGroup && selectedGroup && (
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-stamp">
                Planning with {selectedGroup.name}
              </p>
            )}
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-3 max-w-lg mx-auto">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => submit(s)}
                  className="text-left p-3 rounded-xl border border-line bg-card hover:border-stamp/50 hover:bg-stamp/5 transition-colors text-[13px] text-ink-soft leading-snug"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={cn(
              "flex gap-3 max-w-[85%]",
              m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
            )}
          >
            <div className={cn(
              "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
              m.role === "user" ? "bg-ocean/10 text-ocean-deep" : "bg-stamp/10 text-stamp"
            )}>
              {m.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>
            <div className={cn(
              "rounded-2xl p-4 text-[15px] leading-relaxed",
              m.role === "user" 
                ? "bg-ocean-deep text-white rounded-tr-none" 
                : "bg-card border border-line rounded-tl-none font-serif italic whitespace-pre-line"
            )}>
              {m.content}
            </div>
          </div>
        ))}

        {thinking && (
          <div className="flex gap-3 mr-auto">
            <div className="h-8 w-8 rounded-full bg-stamp/10 text-stamp flex items-center justify-center">
              <Bot className="h-4 w-4" />
            </div>
            <div className="bg-card border border-line rounded-2xl rounded-tl-none p-4">
              <Loader2 className="h-4 w-4 animate-spin text-stamp" />
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(text);
        }}
        className="relative"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ask about your travel style or next adventure…"
          className="h-14 w-full rounded-2xl border border-line bg-card pl-5 pr-14 text-[15px] placeholder:text-ink-soft/50 focus:border-stamp focus:outline-none focus:ring-4 focus:ring-stamp/5 shadow-sm"
        />
        <button
          type="submit"
          disabled={!text.trim() || thinking}
          className={cn(
            "absolute right-2 top-2 bottom-2 w-10 flex items-center justify-center rounded-xl transition-all",
            text.trim() && !thinking
              ? "bg-stamp text-white hover:opacity-90 scale-100"
              : "bg-line text-ink-soft/30 scale-95"
          )}
        >
          <Send className="h-5 w-5" strokeWidth={2} />
        </button>
      </form>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-xl border border-line bg-paper p-3">
      <p className="uppercase tracking-[0.14em] text-ink-soft">{label}</p>
      <p className="mt-1 text-sm font-semibold text-ink">{value || "—"}</p>
    </div>
  );
}

function formatNumber(value?: number | null) {
  if (value == null) return undefined;
  return new Intl.NumberFormat("en-US").format(value);
}
