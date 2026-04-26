import { useEffect, useState } from "react";
import { Check, Loader2, Wallet } from "lucide-react";

import { api } from "@/cityApp/lib/apiAdapter";
import { useApp } from "@/cityApp/CityShell";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { ApiCityGuidePlanResponse, ApiPublicUser, ApiSharedWallet } from "@/lib/api";

type Step = "name" | "people" | "budget" | "plan";

const STEPS: { id: Step; label: string }[] = [
  { id: "name", label: "Group" },
  { id: "people", label: "People" },
  { id: "budget", label: "Budget" },
  { id: "plan", label: "Plan" },
];

export default function GroupWizard() {
  const { auth } = useApp();
  const { toast } = useToast();

  const [step, setStep] = useState<Step>("name");
  const [groupName, setGroupName] = useState("");
  const [users, setUsers] = useState<ApiPublicUser[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [userQuery, setUserQuery] = useState("");
  const [budget, setBudget] = useState("");
  const [budgetNotes, setBudgetNotes] = useState("");
  const [generating, setGenerating] = useState(false);
  const [plan, setPlan] = useState<ApiCityGuidePlanResponse | null>(null);
  const [genError, setGenError] = useState<string | null>(null);

  // Wallet
  const [wallet, setWallet] = useState<ApiSharedWallet | null>(null);
  const [creatingWallet, setCreatingWallet] = useState(false);
  const [walletAction, setWalletAction] = useState<"idle" | "fund" | "spend">("idle");
  const [fundAmount, setFundAmount] = useState("");
  const [spendAmount, setSpendAmount] = useState("");
  const [spendMerchant, setSpendMerchant] = useState("");

  useEffect(() => {
    if (!auth.user) return;
    api.listUsers().then(setUsers).catch(() => {});
  }, [auth.user]);

  const visibleUsers = users
    .filter((u) => u.id !== auth.user?.id)
    .filter((u) => {
      const q = userQuery.toLowerCase();
      if (!q) return true;
      return (
        u.username.toLowerCase().includes(q) ||
        (u.description ?? "").toLowerCase().includes(q)
      );
    })
    .slice(0, 12);

  const selectedUsers = users.filter((u) => selectedUserIds.includes(u.id));

  const toggleUser = (id: number) =>
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const generate = async () => {
    if (!auth.user || !groupName.trim() || !budget) return;
    setGenerating(true);
    setGenError(null);
    setStep("plan");
    try {
      const group = await api.createGroup(groupName.trim());
      for (const user of selectedUsers) {
        try {
          await api.inviteToGroup(group.id, user.username);
        } catch {
          // non-fatal — invited user might not yet have accepted
        }
      }
      await api.upsertGroupBudget(group.id, {
        total_budget: Number(budget),
        currency: "USD",
        notes: budgetNotes.trim() || undefined,
      });
      const result = await api.createCityGuidePlan(group.id);
      setPlan(result);
    } catch (e) {
      const msg = (e as Error).message;
      setGenError(msg);
      toast({ title: "Failed to generate", description: msg, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const createWallet = async () => {
    setCreatingWallet(true);
    try {
      const w = await api.createSharedWallet({ name: `${groupName} Wallet`, currency: "USD" });
      setWallet(w);
      toast({ title: "Wallet created", description: `Share code: ${w.join_code}` });
    } catch (e) {
      toast({ title: "Wallet failed", description: (e as Error).message, variant: "destructive" });
    } finally {
      setCreatingWallet(false);
    }
  };

  const fundWallet = async () => {
    if (!wallet || !fundAmount) return;
    try {
      const w = await api.fundSharedWallet(wallet.id, {
        amount_cents: Math.round(Number(fundAmount) * 100),
        payment_method: "card",
      });
      setWallet(w);
      setFundAmount("");
      setWalletAction("idle");
      toast({ title: "Funded" });
    } catch (e) {
      toast({ title: "Fund failed", description: (e as Error).message, variant: "destructive" });
    }
  };

  const spendWallet = async () => {
    if (!wallet || !spendAmount || !spendMerchant) return;
    try {
      const w = await api.spendSharedWallet(wallet.id, {
        amount_cents: Math.round(Number(spendAmount) * 100),
        merchant: spendMerchant,
      });
      setWallet(w);
      setSpendAmount("");
      setSpendMerchant("");
      setWalletAction("idle");
      toast({ title: "Logged" });
    } catch (e) {
      toast({ title: "Spend failed", description: (e as Error).message, variant: "destructive" });
    }
  };

  if (!auth.user) {
    return (
      <div className="mx-auto max-w-lg py-24 text-center">
        <p className="font-serif text-2xl text-ink">Sign in to plan a trip</p>
        <p className="mt-3 text-sm text-ink-soft">
          You need an account to create group detours.
        </p>
      </div>
    );
  }

  const stepIndex = STEPS.findIndex((s) => s.id === step);

  return (
    <div className="mx-auto max-w-lg py-6 md:py-12">
      {/* Step bar */}
      <div className="mb-10 flex items-center">
        {STEPS.map((s, i) => {
          const done = i < stepIndex;
          const active = s.id === step;
          return (
            <div key={s.id} className="flex flex-1 items-center">
              <div className="flex items-center gap-2 shrink-0">
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold transition-colors",
                    done
                      ? "bg-stamp text-white"
                      : active
                        ? "bg-ink text-white"
                        : "bg-line/50 text-ink-soft",
                  )}
                >
                  {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </div>
                <span
                  className={cn(
                    "hidden text-[11px] uppercase tracking-[0.18em] sm:block transition-colors",
                    active ? "font-semibold text-ink" : done ? "text-stamp" : "text-ink-soft",
                  )}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "mx-3 h-px flex-1 transition-colors",
                    done ? "bg-stamp/40" : "bg-line/50",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* ── Step 1: Group name ─────────────────────────────────────────── */}
      {step === "name" && (
        <div className="space-y-6">
          <div>
            <h1 className="font-serif text-[38px] leading-[1.06] text-ink">
              What's the trip?
            </h1>
            <p className="mt-2 text-sm text-ink-soft">Give your group a name.</p>
          </div>

          <div className="paper-card p-6">
            <input
              autoFocus
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && groupName.trim() && setStep("people")}
              className="h-14 w-full rounded-2xl border border-line bg-paper px-4 font-serif text-xl text-ink placeholder:text-ink-soft/50 focus:border-ink focus:outline-none"
              placeholder="Weekend crew, Paris April…"
            />
          </div>

          <button
            type="button"
            disabled={!groupName.trim()}
            onClick={() => setStep("people")}
            className="w-full rounded-2xl bg-ink py-4 font-serif text-lg text-white disabled:opacity-40"
          >
            Continue →
          </button>
        </div>
      )}

      {/* ── Step 2: Add people ─────────────────────────────────────────── */}
      {step === "people" && (
        <div className="space-y-6">
          <div>
            <h1 className="font-serif text-[38px] leading-[1.06] text-ink">
              Who's coming?
            </h1>
            <p className="mt-2 text-sm text-ink-soft">
              Select people to add to <span className="font-semibold text-ink">{groupName}</span>.
            </p>
          </div>

          {selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => toggleUser(u.id)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-stamp/40 bg-stamp/10 px-3 py-1.5 text-[12px] font-semibold text-stamp"
                >
                  @{u.username}
                  <span className="text-stamp/50">×</span>
                </button>
              ))}
            </div>
          )}

          <input
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            className="h-10 w-full rounded-xl border border-line bg-paper px-3 text-sm placeholder:text-ink-soft/60 focus:border-ink focus:outline-none"
            placeholder="Search by username…"
          />

          <div className="paper-card overflow-hidden divide-y divide-line/60">
            {visibleUsers.length === 0 ? (
              <p className="p-4 text-sm text-ink-soft">No users found.</p>
            ) : (
              visibleUsers.map((u) => {
                const selected = selectedUserIds.includes(u.id);
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => toggleUser(u.id)}
                    className={cn(
                      "flex w-full items-center justify-between px-4 py-3 text-left transition-colors",
                      selected ? "bg-stamp/5" : "hover:bg-paper-soft",
                    )}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink">@{u.username}</p>
                      {u.description && (
                        <p className="mt-0.5 line-clamp-1 text-xs text-ink-soft">
                          {u.description}
                        </p>
                      )}
                    </div>
                    <div
                      className={cn(
                        "ml-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                        selected ? "border-stamp bg-stamp" : "border-line/60",
                      )}
                    >
                      {selected && <Check className="h-3.5 w-3.5 text-white" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep("name")}
              className="flex-1 rounded-2xl border border-line py-4 text-sm font-semibold text-ink-soft hover:text-ink transition-colors"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={() => setStep("budget")}
              className="flex-[3] rounded-2xl bg-ink py-4 font-serif text-lg text-white"
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: Budget ─────────────────────────────────────────────── */}
      {step === "budget" && (
        <div className="space-y-6">
          <div>
            <h1 className="font-serif text-[38px] leading-[1.06] text-ink">
              What's the budget?
            </h1>
            <p className="mt-2 text-sm text-ink-soft">
              Per person in USD — this shapes the detour.
            </p>
          </div>

          <div className="paper-card p-6 space-y-3">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-serif text-xl text-ink-soft">
                $
              </span>
              <input
                autoFocus
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && budget && void generate()}
                className="h-14 w-full rounded-2xl border border-line bg-paper pl-8 pr-4 font-serif text-xl text-ink placeholder:text-ink-soft/50 focus:border-ink focus:outline-none"
                placeholder="100"
                min="0"
              />
            </div>
            <input
              value={budgetNotes}
              onChange={(e) => setBudgetNotes(e.target.value)}
              className="h-10 w-full rounded-xl border border-line bg-paper px-3 text-sm placeholder:text-ink-soft/60 focus:border-ink focus:outline-none"
              placeholder="Notes: meals, transit, a splurge…"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep("people")}
              className="flex-1 rounded-2xl border border-line py-4 text-sm font-semibold text-ink-soft hover:text-ink transition-colors"
            >
              ← Back
            </button>
            <button
              type="button"
              disabled={!budget}
              onClick={() => void generate()}
              className="flex-[3] rounded-2xl bg-stamp py-4 font-serif text-lg text-white disabled:opacity-40"
            >
              Generate Detour →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 4: Plan result ────────────────────────────────────────── */}
      {step === "plan" && (
        <div className="space-y-10">
          {generating && (
            <div className="flex flex-col items-center py-24 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-stamp" />
              <p className="mt-5 font-serif text-2xl text-ink">Crafting your detour…</p>
              <p className="mt-2 text-sm text-ink-soft">
                Reading passports, checking events, balancing the group.
              </p>
            </div>
          )}

          {!generating && genError && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-coral/20 bg-coral/5 p-4 text-sm text-coral">
                {genError}
              </div>
              <button
                type="button"
                onClick={() => {
                  setGenError(null);
                  setStep("budget");
                }}
                className="w-full rounded-2xl border border-line py-3 text-sm font-semibold text-ink-soft hover:text-ink transition-colors"
              >
                ← Try again
              </button>
            </div>
          )}

          {!generating && plan && (
            <>
              {/* Detour */}
              <div className="space-y-5">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.22em] text-stamp">
                    Your Group Detour
                  </p>
                  <h2 className="mt-1 font-serif text-[34px] leading-[1.08] text-ink">
                    {plan.detour.name}
                  </h2>
                  {plan.detour.description && (
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                      {plan.detour.description}
                    </p>
                  )}
                </div>

                <ol className="space-y-3">
                  {plan.detour.events
                    .slice()
                    .sort((a, b) => a.order - b.order)
                    .map(({ event, order }) => (
                      <li key={event.id} className="paper-card flex gap-4 p-5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-stamp/10 font-serif text-base text-stamp">
                          {order + 1}
                        </span>
                        <div>
                          <p className="font-serif text-[19px] leading-snug text-ink">
                            {event.title}
                          </p>
                          {event.description && (
                            <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                              {event.description}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                </ol>
              </div>

              {/* Wallet */}
              <div className="border-t border-line/60 pt-8 space-y-5">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.22em] text-ink-soft">
                    Group Wallet
                  </p>
                  <h3 className="mt-1 font-serif text-[24px] text-ink">Split the cost</h3>
                  <p className="mt-1 text-sm text-ink-soft">
                    Create a shared wallet to track spending together.
                  </p>
                </div>

                {!wallet ? (
                  <button
                    type="button"
                    disabled={creatingWallet}
                    onClick={() => void createWallet()}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-ink py-4 font-serif text-lg text-white disabled:opacity-50"
                  >
                    {creatingWallet ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Wallet className="h-4 w-4" />
                    )}
                    Create Group Wallet
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="paper-card p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.18em] text-ink-soft">
                            Balance
                          </p>
                          <p className="mt-1 font-serif text-4xl text-ink">
                            ${(wallet.total_balance_cents / 100).toFixed(2)}
                          </p>
                        </div>
                        <div className="rounded-xl border border-line bg-paper px-3 py-2 text-right">
                          <p className="text-[10px] uppercase tracking-[0.18em] text-ink-soft">
                            Join code
                          </p>
                          <p className="mt-0.5 font-mono text-sm font-bold text-ink">
                            {wallet.join_code}
                          </p>
                        </div>
                      </div>
                      <div className="mt-5 flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setWalletAction(walletAction === "fund" ? "idle" : "fund")
                          }
                          className={cn(
                            "flex-1 rounded-xl border py-2.5 text-sm font-semibold transition-colors",
                            walletAction === "fund"
                              ? "border-ink bg-ink text-white"
                              : "border-line bg-paper text-ink hover:bg-paper-soft",
                          )}
                        >
                          + Add funds
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setWalletAction(walletAction === "spend" ? "idle" : "spend")
                          }
                          className={cn(
                            "flex-1 rounded-xl border py-2.5 text-sm font-semibold transition-colors",
                            walletAction === "spend"
                              ? "border-stamp bg-stamp text-white"
                              : "border-stamp/30 bg-stamp/10 text-stamp hover:bg-stamp/20",
                          )}
                        >
                          Record spend
                        </button>
                      </div>
                    </div>

                    {walletAction === "fund" && (
                      <div className="paper-card p-4 space-y-3">
                        <p className="text-sm font-semibold text-ink">Add funds</p>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-soft">
                              $
                            </span>
                            <input
                              autoFocus
                              type="number"
                              value={fundAmount}
                              onChange={(e) => setFundAmount(e.target.value)}
                              className="h-10 w-full rounded-xl border border-line bg-paper pl-6 pr-3 text-sm focus:border-ink focus:outline-none"
                              placeholder="50"
                            />
                          </div>
                          <button
                            type="button"
                            disabled={!fundAmount}
                            onClick={() => void fundWallet()}
                            className="rounded-xl bg-ink px-5 text-sm font-semibold text-white disabled:opacity-40"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    )}

                    {walletAction === "spend" && (
                      <div className="paper-card p-4 space-y-3">
                        <p className="text-sm font-semibold text-ink">Record spend</p>
                        <input
                          autoFocus
                          value={spendMerchant}
                          onChange={(e) => setSpendMerchant(e.target.value)}
                          className="h-10 w-full rounded-xl border border-line bg-paper px-3 text-sm focus:border-ink focus:outline-none"
                          placeholder="e.g. Dinner at North End"
                        />
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-soft">
                              $
                            </span>
                            <input
                              type="number"
                              value={spendAmount}
                              onChange={(e) => setSpendAmount(e.target.value)}
                              className="h-10 w-full rounded-xl border border-line bg-paper pl-6 pr-3 text-sm focus:border-ink focus:outline-none"
                              placeholder="48"
                            />
                          </div>
                          <button
                            type="button"
                            disabled={!spendAmount || !spendMerchant}
                            onClick={() => void spendWallet()}
                            className="rounded-xl bg-stamp px-5 text-sm font-semibold text-white disabled:opacity-40"
                          >
                            Log
                          </button>
                        </div>
                      </div>
                    )}

                    {wallet.transactions.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-ink-soft">
                          Transactions
                        </p>
                        <div className="paper-card divide-y divide-line/60 overflow-hidden">
                          {wallet.transactions
                            .slice()
                            .reverse()
                            .slice(0, 6)
                            .map((txn) => (
                              <div
                                key={txn.id}
                                className="flex items-center justify-between px-4 py-3"
                              >
                                <div>
                                  <p className="text-sm font-medium text-ink">
                                    {txn.merchant ?? txn.type}
                                  </p>
                                  {txn.description && (
                                    <p className="text-xs text-ink-soft">{txn.description}</p>
                                  )}
                                </div>
                                <p
                                  className={cn(
                                    "font-mono text-sm font-semibold",
                                    txn.type === "topup" ? "text-moss" : "text-coral",
                                  )}
                                >
                                  {txn.type === "topup" ? "+" : "−"}$
                                  {(txn.amount_cents / 100).toFixed(2)}
                                </p>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
