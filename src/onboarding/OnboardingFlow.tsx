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
import { DEFAULT_STATE, type PassportState, type AuthInfo } from "./types";
import { api } from "@/lib/api";
import { buildDescriptionFromState, parseProfile } from "./prompt";
import { buildProfileFromState, setBridge } from "@/cityApp/bridge";

type Screen =
  | "welcome"
  | "name"
  | "prompt"
  | "paste"
  | "picks"
  | "city"
  | "auth";

const ORDER_PROFILE: Screen[] = [
  "welcome",
  "name",
  "prompt",
  "paste",
  "city",
  "auth",
];
const ORDER_PICKS: Screen[] = [
  "welcome",
  "name",
  "prompt",
  "picks",
  "city",
  "auth",
];

export function OnboardingFlow() {
  const [state, setState] = useState<PassportState>(DEFAULT_STATE);
  const [screen, setScreen] = useState<Screen>("welcome");
  const [path, setPath] = useState<"profile" | "picks">("profile");
  const navigate = useNavigate();

  const order = path === "picks" ? ORDER_PICKS : ORDER_PROFILE;
  const idx = Math.max(0, order.indexOf(screen));
  const total = order.length;

  const goTo = (s: Screen) => setScreen(s);
  const back = idx > 0 ? () => goTo(order[idx - 1]) : undefined;

  const wide = screen === "welcome";

  const handleAuthed = async (auth: AuthInfo, current: PassportState) => {
    let nextState: PassportState = { ...current, auth };

    // If the user already has a description, use it to populate the profile.
    try {
      const user = await api.me();
      if (user.description && user.description.includes("KNOWHERE PASSPORT")) {
        const profile = parseProfile(user.description);
        nextState = { ...current, profile, auth };
      } else {
        // Persist a Knowhere description on the user account, fire-and-forget.
        const description = buildDescriptionFromState(current);
        if (description) {
          api.updateDescription(description).catch(() => {});
        }
      }
    } catch (e) {
      nextState = { ...current, auth };
    }
    setState(nextState);
    enterApp("/app/research", nextState);
  };

  const enterApp = (path: "/app" | "/app/detour" | "/app/research", nextState = state) => {
    const profile = buildProfileFromState(nextState);
    setBridge(
      profile,
      nextState.auth
        ? {
            user: {
              username: nextState.auth.username,
              email: nextState.auth.email,
              id: nextState.auth.userId,
            },
            token: nextState.auth.token,
            signOut: () => {},
          }
        : null,
    );
    navigate(path);
  };

  return (
    <Shell step={idx} total={total} onBack={back} wide={wide}>
      {screen === "welcome" && (
        <WelcomeScreen
          onNext={() => {
            setPath("profile");
            goTo("name");
          }}
          onSignIn={() => {
            setPath("profile");
            goTo("auth");
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
          initialInstagram={state.socials?.instagram}
          initialTiktok={state.socials?.tiktok}
          onUseProfile={(profile, socials) => {
            setState((s) => ({ ...s, profile, socials, usedQuickPicks: false }));
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
        />
        />
      )}
    </Shell>
  );
}
