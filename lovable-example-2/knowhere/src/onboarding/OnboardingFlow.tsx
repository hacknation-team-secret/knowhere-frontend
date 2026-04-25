import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shell } from "./Shell";
import { WelcomeScreen } from "./WelcomeScreen";
import { PromptScreen } from "./PromptScreen";
import { PasteScreen } from "./PasteScreen";
import { QuickPicksScreen } from "./QuickPicksScreen";
import { CityScreen } from "./CityScreen";
import { AuthScreen } from "./AuthScreen";
import { PassportPreviewScreen } from "./PassportPreviewScreen";
import { DEFAULT_STATE, type PassportState, type AuthInfo } from "./types";
import { Button } from "@/components/ui/button";
import { Star } from "./decor";
import { knowhereApi } from "@/lib/knowhereApi";
import { buildDescriptionFromState } from "./prompt";
import { buildProfileFromState, setBridge } from "@/cityApp/bridge";

type Screen =
  | "welcome"
  | "prompt"
  | "paste"
  | "picks"
  | "city"
  | "auth"
  | "preview";

const ORDER_PROFILE: Screen[] = [
  "welcome",
  "prompt",
  "paste",
  "city",
  "auth",
  "preview",
];
const ORDER_PICKS: Screen[] = [
  "welcome",
  "prompt",
  "picks",
  "city",
  "auth",
  "preview",
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

  const wide = screen === "welcome" || screen === "preview";

  const handleAuthed = async (auth: AuthInfo, current: PassportState) => {
    // Persist a Knowhere description on the user account, fire-and-forget.
    const description = buildDescriptionFromState(current);
    if (description) {
      knowhereApi.updateDescription(auth.token, description).catch(() => {});
    }
    setState((s) => ({ ...s, auth }));
    goTo("preview");
  };

  if (done) {
    return (
      <div className="min-h-screen grid place-items-center px-6 text-center">
        <div className="paper-card-lift p-10 max-w-md">
          <Star className="size-5 text-gold mx-auto mb-4" />
          <h1 className="font-serif text-[34px] leading-[1.05] text-ink mb-3">
            You're inside Knowhere.
          </h1>
          <p className="text-[14.5px] text-ink-soft mb-7 leading-relaxed">
            {state.auth ? `Signed in as ${state.auth.username}. ` : ""}
            Your Detours, stamps, and saved places live here.
          </p>
          <div className="flex flex-col gap-2 items-center">
            <Button
              size="lg"
              onClick={() => {
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
                navigate("/app");
              }}
            >
              Open Knowhere
            </Button>
            <button
              onClick={() => {
                setDone(false);
                setState(DEFAULT_STATE);
                setPath("profile");
                setScreen("welcome");
              }}
              className="text-[12px] tracking-[0.18em] uppercase text-ink-soft hover:text-ink mt-2"
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
          onAuthed={(user, token) => {
            const auth: AuthInfo = {
              username: user.username,
              email: user.email,
              userId: user.id,
              token,
            };
            handleAuthed(auth, state);
          }}
        />
      )}

      {screen === "preview" && (
        <PassportPreviewScreen state={state} onEnter={() => setDone(true)} />
      )}
    </Shell>
  );
}
