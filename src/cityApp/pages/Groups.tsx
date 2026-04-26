import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DollarSign, Heart, Loader2, UserPlus, Users } from "lucide-react";

import { useApp } from "@/cityApp/CityShell";
import { api } from "@/cityApp/lib/apiAdapter";
import { useResearchAgent } from "@/components/ResearchAgent";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Profile } from "@/cityApp/lib/types";
import type { ApiGroup, ApiGroupBudget, ApiGroupFavorite, ApiPassport, ApiPublicUser } from "@/lib/api";

export default function Groups() {
  const { auth, profile } = useApp();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { sendMessage } = useResearchAgent();
  const [users, setUsers] = useState<ApiPublicUser[]>([]);
  const [groups, setGroups] = useState<ApiGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number | undefined>();
  const [userQuery, setUserQuery] = useState("");
  const [groupName, setGroupName] = useState("Weekend crew");
  const [groupDescription, setGroupDescription] = useState(
    "A shared trip plan that balances food, culture, pace, and budget.",
  );
  const [inviteUsername, setInviteUsername] = useState("");
  const [groupLoading, setGroupLoading] = useState(false);
  const [favorites, setFavorites] = useState<ApiGroupFavorite[]>([]);
  const [budgets, setBudgets] = useState<ApiGroupBudget[]>([]);
  const [favoriteTitle, setFavoriteTitle] = useState("");
  const [favoriteDescription, setFavoriteDescription] = useState("");
  const [favoriteCost, setFavoriteCost] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [budgetNotes, setBudgetNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

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
  const recommendedInvitees = invitableUsers.slice(0, 3);
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
    if (!auth.user) return;

    let cancelled = false;
    const load = async () => {
      try {
        const [nextUsers, nextGroups] = await Promise.all([api.listUsers(), api.listGroups()]);
        if (cancelled) return;
        setUsers(nextUsers);
        setGroups(nextGroups);
        setSelectedGroupId((current) => current ?? nextGroups[0]?.id);
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      }
    };

    void load();
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
    const load = async () => {
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

    void load();
    return () => {
      cancelled = true;
    };
  }, [auth.user, selectedGroupId, selectedMembership?.status]);

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

  const inviteUserToSelected = async (username: string) => {
    if (!selectedGroup || !username) return;
    setGroupLoading(true);
    try {
      const group = await api.inviteToGroup(selectedGroup.id, username);
      setGroups((prev) => prev.map((item) => (item.id === group.id ? group : item)));
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
      setGroups((prev) => prev.map((item) => (item.id === group.id ? group : item)));
      setSelectedGroupId(group.id);
      toast({ title: "Joined group", description: "City Guide can now plan with this group." });
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

    setFavorites((prev) =>
      prev.map((favorite) => {
        if (favorite.id !== favoriteId) return favorite;
        return {
          ...favorite,
          voted_by_me: !favorite.voted_by_me,
          vote_count: favorite.vote_count + (favorite.voted_by_me ? -1 : 1),
        };
      }),
    );

    try {
      await api.toggleGroupFavoriteVote(selectedGroup.id, favoriteId);
    } catch (e) {
      setFavorites((prev) => prev.map((favorite) => (favorite.id === favoriteId ? current : favorite)));
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
        return exists ? prev.map((item) => (item.user.id === budget.user.id ? budget : item)) : [...prev, budget];
      });
      toast({ title: "Budget saved", description: "Your spend target is part of the group simulation." });
    } catch (e) {
      toast({ title: "Budget failed", description: (e as Error).message, variant: "destructive" });
    } finally {
      setGroupLoading(false);
    }
  };

  const createGuidedGroup = async () => {
    if (!groupName.trim()) return;
    setGroupLoading(true);
    setError(null);
    try {
      const group = await api.createGroup(groupName.trim(), groupDescription.trim() || undefined);
      setGroups((prev) => [group, ...prev]);
      setSelectedGroupId(group.id);

      for (const user of recommendedInvitees) {
        const updated = await api.inviteToGroup(group.id, user.username);
        setGroups((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      }

      toast({
        title: "Group created",
        description: "City Guide will use these invited members to shape the route.",
      });
    } catch (e) {
      toast({ title: "Group failed", description: (e as Error).message, variant: "destructive" });
    } finally {
      setGroupLoading(false);
    }
  };

  const confirmBudgetAndLaunchCityGuide = async () => {
    if (!selectedGroup || !budgetAmount) return;
    setGroupLoading(true);
    setError(null);
    try {
      const budget = await api.upsertGroupBudget(selectedGroup.id, {
        total_budget: Number(budgetAmount),
        currency: "USD",
        notes: budgetNotes.trim() || undefined,
      });
      setBudgets((prev) => {
        const exists = prev.some((item) => item.user.id === budget.user.id);
        return exists ? prev.map((item) => (item.user.id === budget.user.id ? budget : item)) : [...prev, budget];
      });

      const nextGroup =
        (await api.listGroups()).find((item) => item.id === selectedGroup.id) ?? selectedGroup;
      const guidePrompt = await buildCityGuidePrompt({
        group: nextGroup,
        profile,
        budget,
      });
      await sendMessage(guidePrompt, nextGroup.id);
      navigate("/app/research");
      toast({
        title: "City Guide started",
        description: "The shared research thread now has passports, budget, and location.",
      });
    } catch (e) {
      toast({ title: "Planning failed", description: (e as Error).message, variant: "destructive" });
    } finally {
      setGroupLoading(false);
    }
  };

  if (!auth.user) {
    return (
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-dashed border-line p-6 text-center text-sm text-ink-soft">
        Sign in to create groups, invite people, and manage budgets.
      </div>
    );
  }

  return (
    <div className="mx-auto space-y-6 max-w-6xl">
      <section className="rounded-[2rem] border border-stamp/30 bg-gradient-to-br from-stamp/10 to-paper p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stamp">Happy path</p>
            <h2 className="mt-1 font-serif text-2xl text-ink">Create the group, confirm budget, then start City Guide.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
              We will invite a few matching members, lock the budget, and open a thread that uses passports, budget, and Boston location in one place.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void createGuidedGroup()}
              disabled={groupLoading || !groupName.trim()}
              className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white disabled:opacity-50"
            >
              {groupLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              Create group + invite
            </button>
            <button
              type="button"
              onClick={() => void confirmBudgetAndLaunchCityGuide()}
              disabled={groupLoading || !selectedGroup || !budgetAmount}
              className="inline-flex items-center gap-2 rounded-full border border-stamp/30 bg-stamp/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-stamp disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" />
              Confirm budget + start City Guide
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {recommendedInvitees.length > 0 ? (
            recommendedInvitees.map((user) => (
              <span
                key={user.id}
                className="rounded-full border border-line bg-card px-3 py-1 text-xs font-medium text-ink-soft"
              >
                Invite @{user.username}
              </span>
            ))
          ) : (
            <span className="text-xs text-ink-soft">No additional invite recommendations right now.</span>
          )}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <aside className="space-y-4 rounded-[2rem] border border-line bg-card p-5 shadow-sm h-fit">
        <div className="flex items-center gap-2 text-ink">
          <Users className="h-5 w-5 text-stamp" strokeWidth={2} />
          <h2 className="font-serif text-xl">Trip Groups</h2>
        </div>
        <p className="text-sm text-ink-soft">
          Create a trip group here, invite the right people, then hand it to City Guide.
        </p>

        <div className="space-y-2 rounded-2xl border border-line bg-paper p-4">
          <input
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="h-10 w-full rounded-xl border border-line bg-card px-3 text-sm focus:border-stamp focus:outline-none"
            placeholder="Group name"
          />
          <textarea
            value={groupDescription}
            onChange={(e) => setGroupDescription(e.target.value)}
            className="min-h-20 w-full rounded-xl border border-line bg-card px-3 py-2 text-sm focus:border-stamp focus:outline-none"
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
          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft">Active group</label>
            <select
              value={selectedGroupId ?? ""}
              onChange={(e) => setSelectedGroupId(Number(e.target.value) || undefined)}
              className="h-10 w-full rounded-xl border border-line bg-card px-3 text-sm focus:border-stamp focus:outline-none"
            >
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>
        )}

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
                  selectedGroupId === group.id ? "border-ocean/40 bg-ocean/10" : "border-line bg-paper hover:border-ocean/30",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">{group.name}</p>
                    {group.description && <p className="mt-0.5 line-clamp-2 text-xs text-ink-soft">{group.description}</p>}
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

        <Link
          to="/app/research"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-paper px-3 py-2 text-sm font-semibold text-stamp hover:opacity-80"
        >
          Open City Guide
        </Link>
      </aside>

      <div className="space-y-6">
        {error && <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

        <section className="rounded-[2rem] border border-line bg-card p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft">Group details</p>
              <h3 className="mt-1 font-serif text-2xl text-ink">{selectedGroup?.name ?? "Select a group"}</h3>
              <p className="mt-1 text-sm text-ink-soft">{selectedGroup?.description ?? "Choose a group to manage members and budget."}</p>
            </div>
            {selectedGroup?.memberships.some((item) => item.user.id === auth.user?.id && item.status === "pending") && (
              <button
                type="button"
                onClick={() => void acceptInvite(selectedGroup.id)}
                className="rounded-full bg-stamp px-3 py-1 text-xs font-semibold text-white"
              >
                Join
              </button>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {selectedGroup?.memberships.map((membership) => (
              <span
                key={membership.user.id}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-xs",
                  membership.status === "accepted" ? "border-stamp/30 bg-stamp/10 text-stamp" : "border-line bg-card text-ink-soft",
                )}
              >
                @{membership.user.username} {membership.status === "pending" ? "(pending)" : ""}
              </span>
            ))}
          </div>

          {canUseSelectedGroup && invitableUsers.length > 0 && (
            <div className="mt-4 flex gap-2">
              <select
                value={inviteUsername}
                onChange={(e) => setInviteUsername(e.target.value)}
                className="h-10 min-w-0 flex-1 rounded-xl border border-line bg-card px-3 text-sm focus:border-stamp focus:outline-none"
              >
                <option value="">Invite user</option>
                {invitableUsers.map((user) => (
                  <option key={user.id} value={user.username}>
                    @{user.username}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => void inviteUserToSelected(inviteUsername)}
                disabled={groupLoading || !inviteUsername}
                className="rounded-xl bg-stamp px-3 text-sm font-semibold text-white disabled:opacity-50"
              >
                Invite
              </button>
            </div>
          )}
        </section>

        {canUseSelectedGroup && (
          <div className="grid gap-6 xl:grid-cols-2">
            <section className="space-y-3 rounded-[2rem] border border-line bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-stamp" />
                  <h4 className="text-sm font-semibold text-ink">Favorites</h4>
                </div>
                <span className="text-xs text-ink-soft">{favorites.length} ideas</span>
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
                    onClick={() => void toggleFavoriteVote(favorite.id)}
                    className={cn(
                      "w-full rounded-2xl border p-3 text-left transition-colors",
                      favorite.voted_by_me ? "border-stamp/40 bg-stamp/10" : "border-line bg-card hover:border-stamp/30",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-ink">{favorite.title}</p>
                        {favorite.description && <p className="mt-0.5 text-xs text-ink-soft">{favorite.description}</p>}
                      </div>
                      <span className="shrink-0 rounded-full bg-card px-2 py-1 text-xs font-semibold text-stamp">
                        {favorite.vote_count} vote{favorite.vote_count === 1 ? "" : "s"}
                      </span>
                    </div>
                    {favorite.estimated_cost != null && (
                      <p className="mt-2 text-xs text-ink-soft">Est. ${favorite.estimated_cost.toFixed(0)} per person</p>
                    )}
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-3 rounded-[2rem] border border-line bg-card p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-ocean-deep" />
                <h4 className="text-sm font-semibold text-ink">Budget</h4>
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
              <button
                type="button"
                onClick={() => void confirmBudgetAndLaunchCityGuide()}
                disabled={groupLoading || !selectedGroup || !budgetAmount}
                className="w-full rounded-xl border border-stamp/30 bg-stamp/10 px-3 py-2 text-sm font-semibold text-stamp disabled:opacity-50"
              >
                Confirm budget and start City Guide
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
                {acceptedMemberCount} accepted member{acceptedMemberCount === 1 ? "" : "s"}; City Guide will use the shared context.
              </p>
            </section>
          </div>
        )}

        <section className="rounded-[2rem] border border-line bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft">Users</p>
              <p className="mt-1 text-xs text-ink-soft">Search users on Knowhere and invite them into the active trip group.</p>
            </div>
            <span className="shrink-0 rounded-full bg-card px-2 py-1 text-xs font-semibold text-ink-soft">
              {Math.max(users.length - 1, 0)} users
            </span>
          </div>

          <input
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            className="mt-4 h-10 w-full rounded-xl border border-line bg-card px-3 text-sm focus:border-stamp focus:outline-none"
            placeholder="Search username, email, taste notes"
          />

          <div className="mt-3 space-y-2">
            {visibleUsers.length > 0 ? (
              visibleUsers.map((user) => {
                const membership = selectedGroup?.memberships.find((item) => item.user.id === user.id);
                const canInvite = !!selectedGroup && selectedMembership?.status === "accepted" && !membership;
                return (
                  <div key={user.id} className="rounded-2xl border border-line bg-card p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-ink">@{user.username}</p>
                        {user.description && <p className="mt-0.5 line-clamp-2 text-xs text-ink-soft">{user.description}</p>}
                      </div>
                      {canInvite ? (
                        <button
                          type="button"
                          onClick={() => void inviteUserToSelected(user.username)}
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
              <p className="rounded-xl border border-dashed border-line p-3 text-xs text-ink-soft">No matching users found.</p>
            )}
          </div>
        </section>

        <div className="flex gap-2">
          <Link
            to="/app/research"
            className="inline-flex items-center gap-2 rounded-full border border-line bg-paper-soft px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-stamp hover:opacity-80"
          >
            City Guide
          </Link>
          <Link
            to="/app/wallets/shared"
            className="inline-flex items-center gap-2 rounded-full border border-line bg-paper-soft px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-stamp hover:opacity-80"
          >
            <DollarSign className="h-3.5 w-3.5" />
            Shared wallet
          </Link>
        </div>
      </div>
      </div>
    </div>
  );
}

async function buildCityGuidePrompt({
  group,
  profile,
  budget,
}: {
  group: ApiGroup;
  profile: Profile | null;
  budget: ApiGroupBudget;
}): Promise<string> {
  const passportSummaries = await Promise.all(
    group.memberships.map(async ({ user, status }) => {
      try {
        const passport = await api.passport(user.username);
        return `@${user.username} (${status}): ${summarizePassport(passport)}`;
      } catch {
        return `@${user.username} (${status}): passport unavailable`;
      }
    }),
  );

  const location = profile?.startingLocation || "Boston";
  const interests = profile?.interests.length ? profile.interests.join(", ") : "not yet set";
  const vibe = profile?.vibe || "local";
  const mobility = profile?.mobility || "mixed";
  const userBudget = `${budget.currency} ${budget.total_budget.toFixed(0)}`;

  return [
    "You are City Guide, the personal research agent for this Boston group.",
    `Build a detour from ${location} that keeps the whole group within ${userBudget}.`,
    `Use the current user's passport profile: vibe=${vibe}, mobility=${mobility}, interests=${interests}.`,
    `Group context: ${group.name}${group.description ? ` — ${group.description}` : ""}.`,
    "Use the member passport summaries below to find overlap, location fit, and a realistic route.",
    ...passportSummaries,
    "Respond with the best shared detour, not just research notes.",
  ].join("\n");
}

function summarizePassport(passport: ApiPassport) {
  const events = passport.attended_events.slice(0, 4).map((event) => event.title);
  const details = events.length ? events.join(", ") : "no attended events yet";
  const description = passport.description?.trim();
  return `${description ? `${description}. ` : ""}${details}`;
}
