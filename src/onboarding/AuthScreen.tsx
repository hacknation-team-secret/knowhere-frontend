import { useState } from "react";
import type { ReactNode } from "react";
import { Loader2, AtSign, KeyRound, User as UserIcon } from "lucide-react";
import { Actions } from "./Actions";
import { getToken, type ApiUser } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

interface Props {
  initialUsername?: string;
  initialMode: "signin" | "signup";
  onAuthed: (user: ApiUser, token: string) => void;
  onSkip?: () => void;
}

export function AuthScreen({ initialUsername, initialMode, onAuthed, onSkip }: Props) {
  const { signIn, signUp } = useAuth();
  const [username, setUsername] = useState(initialUsername ?? "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mode = initialMode;

  const submit = async () => {
    if (!username.trim() || password.length < 4) {
      setError("Pick a username and a password (4+ characters).");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const user: ApiUser =
        mode === "signin"
          ? await signIn(username.trim(), password)
          : await signUp(username.trim(), password, email.trim() || undefined);
      const token = getToken();
      if (!token) throw new Error("Missing auth token.");
      onAuthed(user, token);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong.";
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section>
      <p className="text-[11px] tracking-[0.22em] uppercase text-ink-soft mb-4">
        {mode === "signin" ? "Welcome back" : "Create your passport"}
      </p>
      <h1 className="font-serif text-[40px] md:text-[52px] leading-[1.02] text-ink mb-3">
        {mode === "signin" ? "Sign in" : "Sign up"}
      </h1>
      <p className="text-[15.5px] leading-[1.55] text-ink-soft max-w-[42ch] mb-10">
        {mode === "signin"
          ? "Pick up your saved Passport and keep going."
          : "Set up a new Passport so your stamps know where to land."}
      </p>

      <Field label="Username">
        <div className="paper-card flex items-center gap-3 px-5 py-3.5">
          <UserIcon className="size-4 text-ink-soft shrink-0" strokeWidth={1.6} />
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="travelername"
            autoComplete="username"
            spellCheck={false}
            className="flex-1 bg-transparent text-[15px] text-ink placeholder:text-ink-soft/45 focus:outline-none"
          />
        </div>
      </Field>

      {mode === "signup" && (
        <Field label="Email" optional>
          <div className="paper-card flex items-center gap-3 px-5 py-3.5">
            <AtSign className="size-4 text-ink-soft shrink-0" strokeWidth={1.6} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@somewhere.com"
              autoComplete="email"
              className="flex-1 bg-transparent text-[15px] text-ink placeholder:text-ink-soft/45 focus:outline-none"
            />
          </div>
        </Field>
      )}

      <Field label="Password">
        <div className="paper-card flex items-center gap-3 px-5 py-3.5">
          <KeyRound className="size-4 text-ink-soft shrink-0" strokeWidth={1.6} />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="••••••••"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            className="flex-1 bg-transparent text-[15px] text-ink placeholder:text-ink-soft/45 focus:outline-none"
          />
        </div>
      </Field>

      {error && (
        <p className="text-[13px] text-coral mt-2 mb-2">{error}</p>
      )}

      <Actions
        primary={{
          label: busy ? "Stamping…" : mode === "signin" ? "Sign in" : "Create account",
          onClick: submit,
          disabled: busy,
        }}
        secondary={onSkip ? { label: "Skip for now", onClick: onSkip } : undefined}
        helper={
          busy ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="size-3 animate-spin" /> talking to Knowhere…
            </span>
          ) : (
            mode === "signin"
              ? "Use your existing Passport account."
              : "We'll create a new Passport account."
          )
        }
      />
    </section>
  );
}

function Field({
  label,
  optional,
  children,
}: {
  label: string;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="mb-6">
      <div className="flex items-baseline justify-between mb-2">
        <label className="text-[10.5px] tracking-[0.2em] uppercase text-ink-soft">
          {label}
        </label>
        {optional && (
          <span className="text-[11px] text-ink-soft/70 italic">optional</span>
        )}
      </div>
      {children}
    </div>
  );
}
