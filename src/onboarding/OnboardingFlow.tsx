import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shell } from "./Shell";
import { WelcomeScreen } from "./WelcomeScreen";
import { NameScreen } from "./NameScreen";
import { PromptScreen } from "./PromptScreen";
import { PasteScreen } from "./PasteScreen";
import { QuickPicksScreen } from "./QuickPicksScreen";
import { CityScreen } from "./CityScreen";
import { AuthScreen } from "./AuthScreen";
import { PassportPreviewScreen } from "./PassportPreviewScreen";
import { PassportRevealScreen } from "./PassportRevealScreen";
import { SocialsScreen } from "./SocialsScreen";
import { DEFAULT_STATE, type PassportState, type AuthInfo } from "./types";
import { Star } from "./decor";
import { ArrowRight, Bot, MapPin, Route as RouteIcon } from "lucide-react";
import { api } from "@/lib/api";
import { buildDescriptionFromState, parseProfile } from "./prompt";
import { buildProfileFromState, clearBridge, setBridge } from "@/cityApp/bridge";

type Screen =
  | "welcome"
  | "name"
  | "prompt"
  | "paste"
  | "picks"
  | "city"
  | "auth"
  | "socials"
  | "preview"
  | "reveal";

const ORDER_PROFILE: Screen[] = [
  "welcome",
  "name",
  "prompt",
  "paste",
  "city",
  "auth",
  "socials",
  "preview",
  "reveal",
];
const ORDER_PICKS: Screen[] = [
  "welcome",
  "name",
  "prompt",
  "picks",
  "city",
  "auth",
  "socials",
  "preview",
  "reveal",
];

export function OnboardingFlow() {
  const [state, setState] = useState<PassportState>(DEFAULT_STATE);
  const [screen, setScreen] = useState<Screen>("welcome");
  const [path, setPath] = useState<"profile" | "picks">("profile");
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  const order = path === "picks" ? ORDER_PICKS : ORDER_PROFILE;
  const idx = Math.max(0, order.indexOf(screen));
  const total = order.length;

  const goTo = (s: Screen) => setScreen(s);
  const back = idx > 0 ? () => goTo(order[idx - 1]) : undefined;

  const wide = screen === "welcome" || screen === "preview" || screen === "reveal";

  const handleAuthed = async (auth: AuthInfo, current: PassportState) => {
    // If the user already has a description, use it to populate the profile.
    try {
      const user = await api.me();
      if (user.description && user.description.includes("KNOWHERE PASSPORT")) {
        const profile = parseProfile(user.description);
        setState((s) => ({ ...s, profile, auth }));
      } else {
        // Persist a Knowhere description on the user account, fire-and-forget.
        const description = buildDescriptionFromState(current);
        if (description) {
          api.updateDescription(description).catch(() => {});
        }
        setState((s) => ({ ...s, auth }));
      }
    } catch (e) {
      setState((s) => ({ ...s, auth }));
    }
    goTo("socials");
  };

  const enterApp = (path: "/app" | "/app/detour" | "/app/research") => {
    const profile = buildProfileFromState(state);
    setBridge(
      profile,
      state.auth
        ? {
            user: {
              username: state.auth.username,
              email: state.auth.email,
              id: state.auth.userId,
            },
            token: state.auth.token,
            signOut: () => {},
          }
        : null,
    );
    navigate(path);
  };

  if (done) {
    return (
      <div className="min-h-screen grid place-items-center px-6 py-12">
        <div className="paper-card-lift p-8 md:p-10 max-w-[680px] w-full text-center">
          <Star className="size-5 text-gold mx-auto mb-4" />
          <h1 className="font-serif text-[34px] leading-[1.05] text-ink mb-3">
            You're inside Knowhere.
          </h1>
          <p className="text-[14.5px] text-ink-soft mb-8 leading-relaxed max-w-[42ch] mx-auto">
            {state.auth ? `Signed in as ${state.auth.username}. ` : ""}
            Pick where to land.
          </p>

          <div className="grid sm:grid-cols-3 gap-4 text-left">
            <LaunchTile
              icon={<MapPin className="size-4" strokeWidth={1.75} />}
              eyebrow="The city, right now"
              title="City Pulse"
              description="Live map, nearby Detours, and editable context."
              onClick={() => enterApp("/app")}
            />
            <LaunchTile
              icon={<RouteIcon className="size-4" strokeWidth={1.75} />}
              eyebrow="Plan a wander"
              title="Build a Detour"
              description="A route shaped to your taste and time."
              onClick={() => enterApp("/app/detour")}
            />
            <LaunchTile
              icon={<Bot className="size-4" strokeWidth={1.75} />}
              eyebrow="Groups + copilot"
              title="Trip Copilot"
              description="Coordinate groups, vote, budget, and ask the agent."
              onClick={() => enterApp("/app/research")}
            />
          </div>

          <div className="flex flex-col gap-2 items-center">
            <button
              onClick={() => {
                clearBridge();
                setDone(false);
                setState(DEFAULT_STATE);
                setPath("profile");
                setScreen("welcome");
              }}
              className="text-[12px] tracking-[0.18em] uppercase text-ink-soft hover:text-ink mt-8"
            >
              Restart onboarding
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Shell step={idx} total={total} onBack={back} wide={wide}>
      {screen === "welcome" && (
        <WelcomeScreen
          onNext={() => {
            setPath("profile");
            goTo("name");
          }}
        />
      )}

      {screen === "name" && (
        <NameScreen
          initialName={state.name}
          onContinue={(name) => {
            setState((s) => ({ ...s, name }));
            goTo("prompt");
          }}
        />
      )}

      {screen === "prompt" && (
        <PromptScreen onNext={() => goTo("paste")} />
      )}

      {screen === "paste" && (
        <PasteScreen
          onUseProfile={(profile) => {
            setState((s) => ({ ...s, profile, usedQuickPicks: false }));
            setPath("profile");
            goTo("city");
          }}
        />
      )}

      {screen === "picks" && (
        <QuickPicksScreen
          picks={state.picks}
          onChange={(picks) => setState((s) => ({ ...s, picks }))}
          onContinue={() => goTo("city")}
        />
      )}

      {screen === "city" && (
        <CityScreen
          trip={state.trip}
          onChange={(trip) => setState((s) => ({ ...s, trip }))}
          onContinue={() => goTo("auth")}
        />
      )}

      {screen === "auth" && (
        <AuthScreen
          initialUsername={state.name?.toLowerCase().replace(/[^a-z0-9_]/g, "")}
          onAuthed={(user, token) => {
            const auth: AuthInfo = {
              username: user.username,
              email: user.email,
              userId: user.id,
              token,
            };
            handleAuthed(auth, state);
          }}
          onSkip={() => goTo("socials")}
        />
      )}

      {screen === "socials" && (
        <SocialsScreen
          initialInstagram={state.socials?.instagram}
          initialTiktok={state.socials?.tiktok}
          onContinue={(socials) => {
            setState((s) => ({ ...s, socials }));
            goTo("preview");
          }}
        />
      )}

      {screen === "preview" && (
        <PassportPreviewScreen state={state} onEnter={() => goTo("reveal")} />
      )}

      {screen === "reveal" && (
        <PassportRevealScreen state={state} onContinue={() => setDone(true)} />
      )}
    </Shell>
  );
}

function LaunchTile({
  icon,
  eyebrow,
  title,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group relative paper-card hover:shadow-[0_12px_32px_-12px_hsl(var(--ocean)/0.30)] hover:-translate-y-0.5 transition-all duration-300 p-5 text-left flex flex-col gap-2"
    >
      <div className="flex items-center gap-2 text-ocean-deep">
        {icon}
        <span className="text-[10.5px] tracking-[0.2em] uppercase text-ink-soft">
          {eyebrow}
        </span>
      </div>
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-serif text-[22px] text-ink leading-tight">{title}</h3>
        <ArrowRight
          className="size-4 text-ink-soft transition-transform group-hover:translate-x-0.5 group-hover:text-ink"
          strokeWidth={1.75}
        />
      </div>
      <p className="text-[13px] leading-[1.5] text-ink-soft">{description}</p>
    </button>
  );
}
