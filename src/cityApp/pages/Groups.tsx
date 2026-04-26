import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  CircleDashed,
  DollarSign,
  Heart,
  Loader2,
  Sparkles,
  UserPlus,
  Users,
} from "lucide-react";

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
  const inviteSectionRef = useRef<HTMLDivElement | null>(null);

  const selectedGroup = groups.find((group) => group.id === selectedGroupId);
  const selectedMembership = selectedGroup?.memberships.find(
    (membership) => membership.user.id === auth.user?.id,
  );
  const canUseSelectedGroup = !!selectedGroup && selectedMembership?.status === "accepted";
  const invitableUsers = users.filter(
    (user) =>
      user.id !== auth.user?.id &&
      !selectedGroup?.memberships.some((membership) => membership.user.id === user.id),
  );
  const visibleInvitees = invitableUsers
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
  const invitedMemberCount = selectedGroup?.memberships.filter(
    (membership) => membership.status === "pending",
  ).length ?? 0;
  const averageBudget = budgets.length
    ? budgets.reduce((sum, budget) => sum + budget.total_budget, 0) / budgets.length
    : 0;
  const favoriteCostTotal = favorites
    .filter((favorite) => favorite.voted_by_me)
    .reduce((sum, favorite) => sum + (favorite.estimated_cost ?? 0), 0);
  const myBudget = budgets.find((budget) => budget.user.id === auth.user?.id);
  const hasSavedBudget = !!myBudget;
  const hasGroup = !!selectedGroup;
  const hasFavorites = favorites.length > 0;

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
        const mine = nextBudgets.find((budget) => budget.user.id === auth.user?.id);
        setBudgetAmount(mine ? String(mine.total_budget) : "");
        setBudgetNotes(mine?.notes ?? "");
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
      toast({ title: "Joined group", description: "Group Guide can now plan with this group." });
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
        title: "Group Guide started",
        description: "The shared research thread now has passports, budget, and location.",
      });
    } catch (e) {
      toast({ title: "Planning failed", description: (e as Error).message, variant: "destructive" });
    } finally {
      setGroupLoading(false);
    }
  };

  const heroAction = !hasGroup
    ? {
        label: "Create group",
        onClick: () => void createGroup(),
        disabled: groupLoading || !groupName.trim(),
      }
    : !canUseSelectedGroup && selectedGroup
      ? {
          label: "Join group",
          onClick: () => void acceptInvite(selectedGroup.id),
          disabled: groupLoading,
        }
      : !hasSavedBudget
        ? {
            label: "Save budget",
            onClick: () => void saveBudget(),
            disabled: groupLoading || !budgetAmount,
          }
        : {
            label: "Open Group Guide",
            onClick: () => void confirmBudgetAndLaunchCityGuide(),
            disabled: groupLoading || !selectedGroup || !budgetAmount,
          };

  const checklist = [
    { label: "Create group", done: hasGroup },
    { label: "Invite friends", done: invitedMemberCount + acceptedMemberCount > 1 },
    { label: "Add favorites", done: hasFavorites },
    { label: "Set budget", done: hasSavedBudget },
    { label: "Open Group Guide", done: hasSavedBudget },
  ];

  if (!auth.user) {
    return (
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-dashed border-line p-6 text-center text-sm text-ink-soft">
        Sign in to create groups, invite people, and manage budgets.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <section className="rounded-[2rem] border border-line bg-gradient-to-br from-paper via-paper-soft to-stamp/10 p-5 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stamp">Group Passport</p>
              <h1 className="mt-1 font-serif text-[30px] leading-none text-ink">{selectedGroup?.name ?? "Weekend crew"}</h1>
              <p className="mt-2 max-w-2xl text-sm text-ink-soft">
                Plan a Boston Detour that fits everyone&apos;s taste, budget, and pace.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusChip>{acceptedMemberCount} accepted</StatusChip>
              <StatusChip>{invitedMemberCount} invited</StatusChip>
              <StatusChip tone={hasSavedBudget ? "done" : "pending"}>
                {hasSavedBudget ? "Budget saved" : "Budget pending"}
              </StatusChip>
              <StatusChip tone={hasFavorites ? "done" : "pending"}>
                {hasFavorites ? `${favorites.length} favorites` : "Favorites empty"}
              </StatusChip>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 lg:justify-end">
            <button
              type="button"
              onClick={heroAction.onClick}
              disabled={heroAction.disabled}
              className="inline-flex items-center gap-2 rounded-full bg-ocean-deep px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-sm disabled:opacity-50"
            >
              {groupLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {heroAction.label}
            </button>
            <button
              type="button"
              onClick={() => inviteSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })}
              disabled={!selectedGroup || !canUseSelectedGroup}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-paper-soft px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-ink-soft disabled:opacity-50"
            >
              <UserPlus className="h-4 w-4" />
              Invite friends
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-[1.6rem] border border-line bg-card p-4 shadow-sm">
        <div className="flex flex-wrap gap-3">
          {checklist.map((step) => (
            <div
              key={step.label}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium",
                step.done ? "border-ocean/30 bg-ocean/10 text-ocean-deep" : "border-line bg-paper text-ink-soft",
              )}
            >
              {step.done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <CircleDashed className="h-3.5 w-3.5" />}
              {step.label}
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-5">
          {error && <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

          <section className="rounded-[2rem] border border-line bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2 text-ink">
              <Users className="h-5 w-5 text-stamp" strokeWidth={2} />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft">Group setup</p>
                <h2 className="font-serif text-2xl text-ink">Group Passport</h2>
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft">Group name</span>
                <input
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="h-11 w-full rounded-xl border border-line bg-paper px-3 text-sm focus:border-stamp focus:outline-none"
                  placeholder="Weekend crew"
                />
              </label>
              <label className="space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft">Active group</span>
                <select
                  value={selectedGroupId ?? ""}
                  onChange={(e) => setSelectedGroupId(Number(e.target.value) || undefined)}
                  className="h-11 w-full rounded-xl border border-line bg-paper px-3 text-sm focus:border-stamp focus:outline-none"
                >
                  <option value="">Select a group</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="mt-4 block space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft">Short description</span>
              <textarea
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
                className="min-h-24 w-full rounded-xl border border-line bg-paper px-3 py-2.5 text-sm focus:border-stamp focus:outline-none"
                placeholder="Food, culture, pace, must-dos"
              />
            </label>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void createGroup()}
                disabled={groupLoading || !groupName.trim()}
                className="inline-flex items-center gap-2 rounded-full bg-ocean-deep px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-white disabled:opacity-50"
              >
                {groupLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                Create group
              </button>
              {selectedGroup?.memberships.some((item) => item.user.id === auth.user?.id && item.status === "pending") && (
                <button
                  type="button"
                  onClick={() => void acceptInvite(selectedGroup.id)}
                  disabled={groupLoading}
                  className="inline-flex items-center gap-2 rounded-full border border-stamp/30 bg-stamp/10 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-stamp disabled:opacity-50"
                >
                  Join group
                </button>
              )}
            </div>

            <div className="mt-5 space-y-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft">Members</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedGroup?.memberships.length ? (
                    selectedGroup.memberships.map((membership) => (
                      <span
                        key={membership.user.id}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-xs",
                          membership.status === "accepted" ? "border-stamp/30 bg-stamp/10 text-stamp" : "border-line bg-paper text-ink-soft",
                        )}
                      >
                        @{membership.user.username}
                        {membership.status === "pending" ? " · pending" : ""}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-ink-soft">Create or pick a group to start inviting people.</p>
                  )}
                </div>
              </div>

              <div ref={inviteSectionRef} className="rounded-[1.5rem] border border-line bg-paper p-4">
                <div className="flex flex-col gap-3 md:flex-row">
                  <input
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    className="h-11 min-w-0 flex-1 rounded-xl border border-line bg-card px-3 text-sm focus:border-stamp focus:outline-none"
                    placeholder="Search people"
                  />
                  <select
                    value={inviteUsername}
                    onChange={(e) => setInviteUsername(e.target.value)}
                    className="h-11 min-w-0 flex-1 rounded-xl border border-line bg-card px-3 text-sm focus:border-stamp focus:outline-none"
                  >
                    <option value="">Invite username</option>
                    {visibleInvitees.map((user) => (
                      <option key={user.id} value={user.username}>
                        @{user.username}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => void inviteUserToSelected(inviteUsername)}
                    disabled={groupLoading || !inviteUsername || !canUseSelectedGroup}
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-stamp/30 bg-stamp px-4 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    Invite
                  </button>
                </div>
                <p className="mt-2 text-xs text-ink-soft">
                  {visibleInvitees.length > 0
                    ? "Invite friends from Knowhere into this shared passport."
                    : "No matching invite options right now."}
                </p>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-5">
          <section className="rounded-[2rem] border border-line bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-stamp" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft">Trip context</p>
                  <h3 className="text-sm font-semibold text-ink">Favorites</h3>
                </div>
              </div>
              <span className="rounded-full border border-line bg-paper px-2.5 py-1 text-[11px] text-ink-soft">
                {favorites.length} saved
              </span>
            </div>

            {!canUseSelectedGroup && (
              <p className="mt-4 text-sm text-ink-soft">Accept or select a group to start adding favorites.</p>
            )}

            <div className="mt-4 space-y-3">
              <input
                value={favoriteTitle}
                onChange={(e) => setFavoriteTitle(e.target.value)}
                className="h-11 w-full rounded-xl border border-line bg-paper px-3 text-sm focus:border-stamp focus:outline-none"
                placeholder="Favorite place or idea"
              />
              <input
                value={favoriteDescription}
                onChange={(e) => setFavoriteDescription(e.target.value)}
                className="h-11 w-full rounded-xl border border-line bg-paper px-3 text-sm focus:border-stamp focus:outline-none"
                placeholder="Why it matters"
              />
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  value={favoriteCost}
                  onChange={(e) => setFavoriteCost(e.target.value)}
                  className="h-11 w-full rounded-xl border border-line bg-paper px-3 text-sm focus:border-stamp focus:outline-none sm:max-w-[140px]"
                  inputMode="decimal"
                  placeholder="Cost / person"
                />
                <button
                  type="button"
                  onClick={() => void addFavorite()}
                  disabled={groupLoading || !favoriteTitle.trim() || !canUseSelectedGroup}
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-stamp/30 bg-stamp/10 px-4 text-sm font-semibold text-stamp disabled:opacity-50"
                >
                  Add favorite
                </button>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {favorites.length === 0 ? (
                <div className="rounded-[1.5rem] border border-dashed border-line bg-paper p-4 text-sm text-ink-soft">
                  Add a restaurant, museum, walk, or must-do stop.
                </div>
              ) : (
                favorites.map((favorite) => (
                  <button
                    key={favorite.id}
                    type="button"
                    onClick={() => void toggleFavoriteVote(favorite.id)}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 rounded-[1.25rem] border px-4 py-3 text-left transition-colors",
                      favorite.voted_by_me ? "border-stamp/40 bg-stamp/10" : "border-line bg-paper hover:border-stamp/30",
                    )}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink">{favorite.title}</p>
                      <p className="mt-0.5 truncate text-xs text-ink-soft">
                        {favorite.description || "Tap to vote this into the plan."}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs font-semibold text-stamp">
                        {favorite.vote_count} vote{favorite.vote_count === 1 ? "" : "s"}
                      </p>
                      {favorite.estimated_cost != null && (
                        <p className="text-[11px] text-ink-soft">${favorite.estimated_cost.toFixed(0)}/pp</p>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </section>

          <section className="rounded-[2rem] border border-line bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-ocean-deep" />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft">Trip context</p>
                <h3 className="text-sm font-semibold text-ink">Budget</h3>
              </div>
            </div>

            {!canUseSelectedGroup && (
              <p className="mt-4 text-sm text-ink-soft">Pick an accepted group to save a shared budget.</p>
            )}

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <MetricCard label="Avg / person" value={`$${averageBudget.toFixed(0)}`} />
              <MetricCard label="My vote" value={`$${favoriteCostTotal.toFixed(0)}`} />
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-[160px_1fr]">
              <input
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(e.target.value)}
                className="h-11 rounded-xl border border-line bg-paper px-3 text-sm focus:border-stamp focus:outline-none"
                inputMode="decimal"
                placeholder="Budget / person"
              />
              <input
                value={budgetNotes}
                onChange={(e) => setBudgetNotes(e.target.value)}
                className="h-11 min-w-0 rounded-xl border border-line bg-paper px-3 text-sm focus:border-stamp focus:outline-none"
                placeholder="Notes"
              />
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => void saveBudget()}
                disabled={groupLoading || !budgetAmount || !canUseSelectedGroup}
                className="inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-ocean-deep px-4 text-sm font-semibold text-white disabled:opacity-50"
              >
                Save budget
              </button>
              <button
                type="button"
                onClick={() => void confirmBudgetAndLaunchCityGuide()}
                disabled={groupLoading || !selectedGroup || !budgetAmount || !canUseSelectedGroup}
                className="inline-flex h-11 flex-1 items-center justify-center rounded-xl border border-stamp/30 bg-stamp/10 px-4 text-sm font-semibold text-stamp disabled:opacity-50"
              >
                {hasSavedBudget ? "Open Group Guide" : "Confirm budget"}
              </button>
            </div>

            {budgets.length > 0 && (
              <div className="mt-4 rounded-[1.5rem] border border-line bg-paper p-4">
                <div className="space-y-1.5">
                  {budgets.map((budget) => (
                    <p key={budget.user.id} className="text-sm text-ink-soft">
                      <span className="font-medium text-ink">@{budget.user.username}</span>: {budget.currency} {budget.total_budget.toFixed(0)}
                      {budget.notes ? ` · ${budget.notes}` : ""}
                    </p>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 flex items-center justify-between gap-3 rounded-[1.5rem] border border-line bg-paper p-4">
              <div>
                <p className="text-sm font-semibold text-ink">Ready for the shared brief</p>
                <p className="text-xs text-ink-soft">
                  {acceptedMemberCount} accepted and {invitedMemberCount} invited.
                </p>
              </div>
              <button
                type="button"
                onClick={() => void confirmBudgetAndLaunchCityGuide()}
                disabled={groupLoading || !selectedGroup || !budgetAmount || !canUseSelectedGroup}
                className="inline-flex items-center gap-2 rounded-full bg-ocean-deep px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-white disabled:opacity-50"
              >
                Open Group Guide
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="mt-4">
              <Link
                to="/app/wallets/shared"
                className="inline-flex items-center gap-2 rounded-full border border-line bg-paper-soft px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink-soft hover:opacity-80"
              >
                <DollarSign className="h-3.5 w-3.5" />
                Shared wallet
              </Link>
            </div>
          </section>
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
    "You are Group Guide, the personal research agent for this Boston group.",
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

function StatusChip({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "done" | "pending";
}) {
  return (
    <span
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-medium",
        tone === "done" && "border-ocean/30 bg-ocean/10 text-ocean-deep",
        tone === "pending" && "border-stamp/20 bg-paper text-ink-soft",
        tone === "default" && "border-line bg-card text-ink-soft",
      )}
    >
      {children}
    </span>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] border border-line bg-paper p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">{label}</p>
      <p className="mt-1 font-serif text-2xl text-ink">{value}</p>
    </div>
  );
}
