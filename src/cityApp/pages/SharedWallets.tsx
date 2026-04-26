import { useEffect, useState } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import {
  ArrowRightLeft,
  CreditCard,
  Loader2,
  PiggyBank,
  Plus,
  QrCode,
  ReceiptText,
  Users,
  Wallet,
} from "lucide-react";
import { Link } from "react-router-dom";

import { api } from "@/cityApp/lib/apiAdapter";
import { useApp } from "@/cityApp/CityShell";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import type { ApiSharedWallet } from "@/lib/api";
import { cn } from "@/lib/utils";

type PaymentMethod = "card" | "bank_account";

export default function SharedWallets() {
  const { auth, requireAuth } = useApp();
  const { toast } = useToast();
  const [wallets, setWallets] = useState<ApiSharedWallet[]>([]);
  const [selectedWalletId, setSelectedWalletId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [fundOpen, setFundOpen] = useState(false);
  const [spendOpen, setSpendOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [walletName, setWalletName] = useState("Barcelona Trip Wallet");
  const [walletLimit, setWalletLimit] = useState("600");
  const [walletThreshold, setWalletThreshold] = useState("20");
  const [joinCode, setJoinCode] = useState("");
  const [fundAmount, setFundAmount] = useState("120");
  const [fundMethod, setFundMethod] = useState<PaymentMethod>("card");
  const [spendAmount, setSpendAmount] = useState("48");
  const [spendMerchant, setSpendMerchant] = useState("Tapas dinner");
  const [spendCategory, setSpendCategory] = useState("food");
  const [spendDescription, setSpendDescription] = useState("Shared meal for the group");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!auth.user) {
          const ok = await requireAuth("Sign in to manage shared trip wallets.");
          if (!ok) {
            if (!cancelled) {
              setLoading(false);
              setError("Sign in to use shared wallets.");
            }
            return;
          }
        }

        const nextWallets = await api.listSharedWallets();
        if (cancelled) return;
        setWallets(nextWallets);
        setSelectedWalletId((current) => current ?? nextWallets[0]?.id ?? null);
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [auth.user, requireAuth]);

  const selectedWallet =
    wallets.find((wallet) => wallet.id === selectedWalletId) ?? wallets[0] ?? null;

  useEffect(() => {
    if (!selectedWallet) return;
    setWalletLimit(
      selectedWallet.spending_limit_cents != null
        ? formatMoneyInput(selectedWallet.spending_limit_cents)
        : "",
    );
    setWalletThreshold(String(selectedWallet.alert_threshold_percent));
  }, [selectedWallet]);

  const updateWalletInState = (nextWallet: ApiSharedWallet) => {
    setWallets((prev) => {
      const exists = prev.some((wallet) => wallet.id === nextWallet.id);
      if (!exists) return [nextWallet, ...prev];
      return prev.map((wallet) => (wallet.id === nextWallet.id ? nextWallet : wallet));
    });
    setSelectedWalletId(nextWallet.id);
  };

  const handleCreateWallet = async () => {
    setSaving(true);
    try {
      const limitCents = parseMoneyToCents(walletLimit);
      const wallet = await api.createSharedWallet({
        name: walletName.trim(),
        currency: "USD",
        spending_limit_cents: limitCents,
        alert_threshold_percent: walletThreshold ? Number(walletThreshold) : 20,
      });
      updateWalletInState(wallet);
      setCreateOpen(false);
      toast({ title: "Shared wallet ready", description: "Your group can now fund and spend together." });
    } catch (e) {
      toast({ title: "Could not create wallet", description: (e as Error).message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleJoinWallet = async () => {
    setSaving(true);
    try {
      const wallet = await api.joinSharedWallet(joinCode.trim().toUpperCase());
      updateWalletInState(wallet);
      setJoinOpen(false);
      setJoinCode("");
      toast({ title: "Joined wallet", description: "You now have live visibility into the shared budget." });
    } catch (e) {
      toast({ title: "Could not join wallet", description: (e as Error).message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleFundWallet = async () => {
    if (!selectedWallet) return;
    setSaving(true);
    const previous = selectedWallet;
    const amount = parseMoneyToCents(fundAmount);
    if (!amount || amount <= 0) {
      setSaving(false);
      toast({
        title: "Enter an amount",
        description: "Add a positive dollar amount to preload funds.",
        variant: "destructive",
      });
      return;
    }
    updateWalletInState({
      ...selectedWallet,
      total_balance_cents: selectedWallet.total_balance_cents + amount,
    });

    try {
      const wallet = await api.fundSharedWallet(selectedWallet.id, {
        amount_cents: amount,
        payment_method: fundMethod,
        description: `Preloaded from ${fundMethod === "card" ? "card" : "bank account"}`,
      });
      updateWalletInState(wallet);
      setFundOpen(false);
      toast({ title: "Funds added", description: "The shared wallet balance is updated." });
    } catch (e) {
      updateWalletInState(previous);
      toast({ title: "Funding failed", description: (e as Error).message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleSpendWallet = async () => {
    if (!selectedWallet) return;
    setSaving(true);
    const previous = selectedWallet;
    const amount = parseMoneyToCents(spendAmount);
    if (!amount || amount <= 0) {
      setSaving(false);
      toast({
        title: "Enter an amount",
        description: "Choose a positive dollar amount before paying.",
        variant: "destructive",
      });
      return;
    }
    updateWalletInState({
      ...selectedWallet,
      total_balance_cents: selectedWallet.total_balance_cents - amount,
    });

    try {
      const wallet = await api.spendSharedWallet(selectedWallet.id, {
        amount_cents: amount,
        merchant: spendMerchant.trim(),
        category: spendCategory.trim() || undefined,
        description: spendDescription.trim() || undefined,
      });
      updateWalletInState(wallet);
      setSpendOpen(false);
      toast({ title: "Payment confirmed", description: "The spend has been logged against the shared wallet." });
    } catch (e) {
      updateWalletInState(previous);
      toast({ title: "Payment blocked", description: (e as Error).message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveControls = async () => {
    if (!selectedWallet) return;
    try {
      const limitCents = parseMoneyToCents(walletLimit);
      const wallet = await api.updateSharedWallet(selectedWallet.id, {
        spending_limit_cents: limitCents,
        alert_threshold_percent: walletThreshold ? Number(walletThreshold) : null,
      });
      updateWalletInState(wallet);
      toast({ title: "Budget controls saved", description: "The wallet rules are updated for every member." });
    } catch (e) {
      toast({ title: "Could not save controls", description: (e as Error).message, variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-stamp" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="rounded-[2rem] border border-line bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-ink">
              <Wallet className="h-5 w-5 text-stamp" strokeWidth={2} />
              <h2 className="font-serif text-3xl">Shared Wallets</h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              Keep trip money pooled, visible, and ready to tap when the group needs it. Funding, spending, member accountability, and budget guardrails all stay on this one screen.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="passport" onClick={() => setCreateOpen(true)}>
              <Plus />
              Create wallet
            </Button>
            <Button variant="outline" onClick={() => setJoinOpen(true)}>
              <Users />
              Join with code
            </Button>
            <Link
              to="/app/research"
              className="inline-flex items-center gap-2 rounded-full border border-line bg-paper-soft px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-stamp hover:opacity-80"
            >
              <ArrowRightLeft className="h-3.5 w-3.5" />
              Trip copilot
            </Link>
          </div>
        </div>

        <div className="mt-5">
          {wallets.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line p-5 text-sm text-ink-soft">
              No shared wallets yet. Create one for a trip, dinner pool, or weekend budget.
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {wallets.map((wallet) => {
                const active = wallet.id === selectedWallet?.id;
                return (
                  <button
                    key={wallet.id}
                    type="button"
                    onClick={() => setSelectedWalletId(wallet.id)}
                    className={cn(
                      "rounded-2xl border p-4 text-left transition-colors",
                      active ? "border-ocean/40 bg-ocean/10" : "border-line bg-paper hover:border-ocean/30",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-ink">{wallet.name}</p>
                        <p className="mt-1 text-xs text-ink-soft">
                          {formatCurrency(wallet.total_balance_cents, wallet.currency)}
                        </p>
                      </div>
                      <span className={statusPillClass(wallet)}>{walletStatus(wallet)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {selectedWallet ? (
        <>
          <section className="rounded-[2rem] border border-line bg-card p-6 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className={statusPillClass(selectedWallet)}>{walletStatus(selectedWallet)}</span>
                  <span className="rounded-full bg-paper px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-soft">
                    {selectedWallet.members.length} members
                  </span>
                </div>
                <h1 className="mt-3 font-serif text-3xl text-ink">{selectedWallet.name}</h1>
                <p className="mt-2 text-sm text-ink-soft">
                  Join code <span className="font-semibold text-ink">{selectedWallet.join_code}</span>
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <MetricCard label="Available" value={formatCurrency(selectedWallet.total_balance_cents, selectedWallet.currency)} />
                <MetricCard label="Spend limit" value={selectedWallet.spending_limit_cents ? formatCurrency(selectedWallet.spending_limit_cents, selectedWallet.currency) : "None"} />
                <MetricCard label="Alert" value={`${selectedWallet.alert_threshold_percent}%`} />
              </div>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <article className="rounded-[2rem] border border-line bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-serif text-2xl text-ink">Preload funds</h2>
                  <p className="mt-1 text-sm text-ink-soft">
                    Choose a source, confirm the amount, and the whole group sees the balance move immediately.
                  </p>
                </div>
                <Button variant="passport" onClick={() => setFundOpen(true)}>
                  <PiggyBank />
                  Add money
                </Button>
              </div>
            </article>

            <article className="rounded-[2rem] border border-line bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-serif text-2xl text-ink">Tap to pay</h2>
                  <p className="mt-1 text-sm text-ink-soft">
                    Quick pay opens a lightweight confirmation flow with the remaining balance visible before anything is logged.
                  </p>
                </div>
                <Button
                  variant="coral"
                  onClick={() => setSpendOpen(true)}
                  disabled={selectedWallet.total_balance_cents <= 0}
                >
                  <QrCode />
                  Quick pay
                </Button>
              </div>

              <div className="mt-4 rounded-2xl border border-line bg-paper p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft">Remaining after next spend</p>
                    <p className="mt-1 font-serif text-2xl text-ink">
                      {formatCurrency(
                        selectedWallet.total_balance_cents - (parseMoneyToCents(spendAmount) ?? 0),
                        selectedWallet.currency,
                      )}
                    </p>
                  </div>
                  {selectedWallet.total_balance_cents - (parseMoneyToCents(spendAmount) ?? 0) < 0 ? (
                    <span className="rounded-full bg-destructive/10 px-3 py-1 text-xs font-semibold text-destructive">
                      Insufficient funds
                    </span>
                  ) : null}
                </div>
              </div>
            </article>
          </section>

          <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <article className="rounded-[2rem] border border-line bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-stamp" />
                <h2 className="font-serif text-2xl text-ink">Members</h2>
              </div>
              <div className="mt-4 space-y-3">
                {selectedWallet.members.map((member) => (
                  <div key={member.user.id} className="rounded-2xl border border-line bg-paper p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-ink">@{member.user.username}</p>
                        <p className="mt-1 text-xs text-ink-soft">{member.role}</p>
                      </div>
                      <div className="text-right text-xs text-ink-soft">
                        <p>Contributed {formatCurrency(member.contributed_cents, selectedWallet.currency)}</p>
                        <p className="mt-1">Spent {formatCurrency(member.spent_cents, selectedWallet.currency)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-[2rem] border border-line bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-ocean-deep" />
                <h2 className="font-serif text-2xl text-ink">Budget controls</h2>
              </div>
              <div className="mt-4 grid gap-3">
                <Field label="Spending limit" value={walletLimit} onChange={setWalletLimit} inputMode="decimal" placeholder="$600.00" money />
                <Field label="Alert threshold (%)" value={walletThreshold} onChange={setWalletThreshold} inputMode="numeric" />
                <Button variant="outline" onClick={handleSaveControls}>
                  Save controls
                </Button>
              </div>
            </article>
          </section>

          <section className="rounded-[2rem] border border-line bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <ReceiptText className="h-5 w-5 text-ocean-deep" />
              <h2 className="font-serif text-2xl text-ink">Transactions</h2>
            </div>
            <div className="mt-4 space-y-3">
              {selectedWallet.transactions.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-line p-4 text-sm text-ink-soft">
                  No transactions yet. Once the wallet is funded, every top-up and spend will appear here.
                </p>
              ) : (
                selectedWallet.transactions.map((transaction) => {
                  const actor = selectedWallet.members.find((member) => member.user.id === transaction.initiated_by)?.user.username;
                  return (
                    <div key={transaction.id} className="rounded-2xl border border-line bg-paper p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-ink">
                            {transaction.merchant || transaction.description || transaction.type}
                          </p>
                          <p className="mt-1 text-xs text-ink-soft">
                            {transaction.type} by @{actor || "member"} · {formatDate(transaction.created_at)}
                          </p>
                        </div>
                        <span
                          className={cn(
                            "shrink-0 text-sm font-semibold",
                            transaction.type === "spend" ? "text-coral" : "text-ocean-deep",
                          )}
                        >
                          {transaction.type === "spend" ? "-" : "+"}
                          {formatCurrency(transaction.amount_cents, selectedWallet.currency)}
                        </span>
                      </div>
                      {(transaction.category || transaction.description) ? (
                        <p className="mt-2 text-xs text-ink-soft">
                          {[transaction.category, transaction.description].filter(Boolean).join(" · ")}
                        </p>
                      ) : null}
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </>
      ) : (
        <section className="rounded-[2rem] border border-line bg-card p-8 shadow-sm">
          <h1 className="font-serif text-3xl text-ink">Shared wallet budgeting</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
            This page is set up for fast group spending: preload funds, choose who joins, and keep every payment visible without bouncing between personal balances.
          </p>
        </section>
      )}

      <WalletDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Create shared wallet"
        description="Set the name, trip limit, and low-balance threshold once. Members can join with the code."
        saving={saving}
        confirmLabel="Create wallet"
        onConfirm={handleCreateWallet}
      >
        <Field label="Wallet name" value={walletName} onChange={setWalletName} />
        <Field label="Spending limit" value={walletLimit} onChange={setWalletLimit} inputMode="decimal" placeholder="$600.00" money />
        <Field label="Alert threshold (%)" value={walletThreshold} onChange={setWalletThreshold} inputMode="numeric" />
      </WalletDialog>

      <WalletDialog
        open={joinOpen}
        onOpenChange={setJoinOpen}
        title="Join shared wallet"
        description="Paste the join code from your organizer and you'll appear in the member ledger right away."
        saving={saving}
        confirmLabel="Join wallet"
        onConfirm={handleJoinWallet}
      >
        <Field label="Join code" value={joinCode} onChange={setJoinCode} autoCapitalize="characters" />
      </WalletDialog>

      <WalletDialog
        open={fundOpen}
        onOpenChange={setFundOpen}
        title="Preload funds"
        description="Choose the source and confirm how much to move into the shared wallet."
        saving={saving}
        confirmLabel="Confirm funding"
        onConfirm={handleFundWallet}
      >
        <Field label="Amount" value={fundAmount} onChange={setFundAmount} inputMode="decimal" placeholder="$120.00" money />
        <ChoiceField
          label="Funding source"
          value={fundMethod}
          options={[
            { value: "card", label: "Personal card" },
            { value: "bank_account", label: "Bank account" },
          ]}
          onChange={(value) => setFundMethod(value as PaymentMethod)}
        />
        <p className="text-xs text-ink-soft">Fees are not modeled in this environment, so the full amount lands in the wallet.</p>
      </WalletDialog>

      <WalletDialog
        open={spendOpen}
        onOpenChange={setSpendOpen}
        title="Quick pay"
        description="Confirm the merchant, amount, and category before the spend hits the ledger."
        saving={saving}
        confirmLabel="Pay from wallet"
        onConfirm={handleSpendWallet}
      >
        <Field label="Merchant" value={spendMerchant} onChange={setSpendMerchant} />
        <Field label="Amount" value={spendAmount} onChange={setSpendAmount} inputMode="decimal" placeholder="$48.00" money />
        <Field label="Category" value={spendCategory} onChange={setSpendCategory} />
        <Field label="Description" value={spendDescription} onChange={setSpendDescription} />
        {selectedWallet ? (
          <div className="rounded-2xl border border-line bg-paper p-3 text-sm text-ink-soft">
            Remaining balance after payment:{" "}
            <span className="font-semibold text-ink">
              {formatCurrency(
                selectedWallet.total_balance_cents - (parseMoneyToCents(spendAmount) ?? 0),
                selectedWallet.currency,
              )}
            </span>
          </div>
        ) : null}
      </WalletDialog>

      {error ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}
    </div>
  );
}

function WalletDialog({
  open,
  onOpenChange,
  title,
  description,
  saving,
  confirmLabel,
  onConfirm,
  children,
}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  title: string;
  description: string;
  saving: boolean;
  confirmLabel: string;
  onConfirm: () => void;
  children: ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-line bg-paper-soft sm:rounded-[24px]">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-ink">{title}</DialogTitle>
          <DialogDescription className="text-ink-soft">{description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">{children}</div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="passport" onClick={onConfirm} disabled={saving}>
            {saving ? <Loader2 className="animate-spin" /> : null}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  value,
  onChange,
  inputMode,
  autoCapitalize,
  placeholder,
  money,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
  autoCapitalize?: string;
  placeholder?: string;
  money?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft">{label}</span>
      <div className="relative">
        {money ? (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-soft">
            $
          </span>
        ) : null}
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          inputMode={inputMode}
          autoCapitalize={autoCapitalize}
          placeholder={placeholder}
          className={cn(
            "h-11 w-full rounded-xl border border-line bg-paper text-sm text-ink focus:border-stamp focus:outline-none",
            money ? "pl-8 pr-3" : "px-3",
          )}
        />
      </div>
    </label>
  );
}

function ChoiceField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft">{label}</span>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-xl border px-3 py-3 text-left text-sm transition-colors",
              value === option.value
                ? "border-ocean/40 bg-ocean/10 text-ocean-deep"
                : "border-line bg-paper text-ink hover:border-ocean/30",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </label>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-paper p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft">{label}</p>
      <p className="mt-2 font-serif text-2xl text-ink">{value}</p>
    </div>
  );
}

function walletStatus(wallet: ApiSharedWallet) {
  const threshold = Math.max(
    0,
    Math.floor(((wallet.spending_limit_cents ?? 0) * wallet.alert_threshold_percent) / 100),
  );
  if (wallet.total_balance_cents <= 0) return "Funding required";
  if (wallet.spending_limit_cents && wallet.total_balance_cents <= threshold) return "Low balance";
  return "Active";
}

function statusPillClass(wallet: ApiSharedWallet) {
  const status = walletStatus(wallet);
  if (status === "Funding required") {
    return "rounded-full bg-destructive/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-destructive";
  }
  if (status === "Low balance") {
    return "rounded-full bg-gold/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink";
  }
  return "rounded-full bg-stamp/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-stamp";
}

function formatCurrency(amountCents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amountCents / 100);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function parseMoneyToCents(value: string) {
  const normalized = value.replace(/[^0-9.]/g, "").trim();
  if (!normalized) return null;
  const amount = Number(normalized);
  if (!Number.isFinite(amount)) return null;
  return Math.round(amount * 100);
}

function formatMoneyInput(amountCents: number) {
  return (amountCents / 100).toFixed(2).replace(/\.00$/, "");
}


