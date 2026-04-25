import { useState } from "react";
import { Loader2, AtSign, KeyRound, User as UserIcon } from "lucide-react";
import { Actions } from "./Actions";
import { knowhereApi, ApiError, type ApiUser } from "@/lib/knowhereApi";

interface Props {
  initialUsername?: string;
  onAuthed: (user: ApiUser, token: string) => void;
  onSkip?: () => void;
}

export function AuthScreen({ initialUsername, onAuthed, onSkip }: Props) {
  const [username, setUsername] = useState(initialUsername ?? "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!username.trim() || password.length < 4) {
      setError("Pick a username and a password (4+ characters).");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      let user: ApiUser;
      try {
        user = await knowhereApi.signup({
          username: username.trim(),
          password,
          email: email.trim() || undefined,
        });
      } catch (e) {
        // Likely username taken — try login instead
        if (e instanceof ApiError && (e.status === 400 || e.status === 409)) {
          // fallthrough to login
        } else if (!(e instanceof ApiError)) {
          throw e;
        }
        const token = await knowhereApi.login(username.trim(), password);
        user = await knowhereApi.me(token.access_token);
        onAuthed(user, token.access_token);
        return;
      }
      const token = await knowhereApi.login(username.trim(), password);
      onAuthed(user, token.access_token);
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
        Sign the passport
      </p>
      <h1 className="font-serif text-[40px] md:text-[52px] leading-[1.02] text-ink mb-3">
        Who's holding the pen?
      </h1>
      <p className="text-[15.5px] leading-[1.55] text-ink-soft max-w-[42ch] mb-10">
        A name for the cover, so your stamps know where to land.
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

      <Field label="Password">
        <div className="paper-card flex items-center gap-3 px-5 py-3.5">
          <KeyRound className="size-4 text-ink-soft shrink-0" strokeWidth={1.6} />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="••••••••"
            autoComplete="new-password"
            className="flex-1 bg-transparent text-[15px] text-ink placeholder:text-ink-soft/45 focus:outline-none"
          />
        </div>
      </Field>

      {error && (
        <p className="text-[13px] text-coral mt-2 mb-2">{error}</p>
      )}

      <Actions
        primary={{
          label: busy ? "Stamping…" : "Stamp my Passport",
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
            "We'll create or sign in to your Passport."
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
  children: React.ReactNode;
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
