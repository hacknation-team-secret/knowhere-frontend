// Sign-in sheet — anonymous by default; calling open() lets the user
// sign in or create an account against the Knowhere backend.

import { useState } from "react";
import { LogIn, Loader2, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface SignInSheetProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  reason?: string;
}

export function SignInSheet({ open, onClose, onSuccess, reason }: SignInSheetProps) {
  const { signIn, signUp, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (mode === "signin") await signIn(username.trim(), password);
      else await signUp(username.trim(), password, email.trim() || undefined);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError((err as Error).message || "Something went wrong");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/30 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-[480px] rounded-t-3xl bg-card p-6 shadow-lift sm:rounded-3xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stamp">
              {mode === "signin" ? "Welcome back" : "Join Knowhere"}
            </p>
            <h2 className="mt-1 font-serif text-2xl">
              {mode === "signin" ? "Sign in to sync" : "Create your account"}
            </h2>
            {reason && <p className="mt-1 text-xs text-muted-foreground">{reason}</p>}
          </div>
          <button onClick={onClose} aria-label="Close" className="text-muted-foreground">
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>

        <form onSubmit={submit} className="mt-5 space-y-3">
          <Field
            label="Username"
            value={username}
            onChange={setUsername}
            autoComplete="username"
            required
          />
          {mode === "signup" && (
            <Field
              label="Email (optional)"
              value={email}
              onChange={setEmail}
              type="email"
              autoComplete="email"
            />
          )}
          <Field
            label="Password"
            value={password}
            onChange={setPassword}
            type="password"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            required
          />

          {error && (
            <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !username.trim() || !password}
            className={cn(
              "flex h-11 w-full items-center justify-center gap-2 rounded-full bg-stamp text-sm font-semibold text-stamp-foreground transition-opacity",
              loading || !username.trim() || !password ? "opacity-50" : "hover:opacity-90",
            )}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogIn className="h-4 w-4" strokeWidth={2} />
            )}
            {mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <button
          onClick={() => {
            setMode((m) => (m === "signin" ? "signup" : "signin"));
            setError(null);
          }}
          className="mt-4 w-full text-center text-[12px] text-muted-foreground hover:text-foreground"
        >
          {mode === "signin"
            ? "No account yet? Create one"
            : "Have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        required={required}
        className="h-11 w-full rounded-xl border border-border bg-background px-3 text-[14px] focus:border-foreground focus:outline-none focus:ring-2 focus:ring-foreground/10"
      />
    </label>
  );
}
