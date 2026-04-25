import { Outlet, NavLink, useLocation } from "react-router-dom";
import { Compass, MapPin, Route as RouteIcon, LogIn, LogOut, User } from "lucide-react";
import { useKnowhere } from "@/hooks/useKnowhere";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import { SignInSheet } from "@/components/SignInSheet";

type Knowhere = ReturnType<typeof useKnowhere>;
type Auth = ReturnType<typeof useAuth>;

interface AppCtx extends Knowhere {
  auth: Auth;
  requireAuth: (reason?: string) => Promise<boolean>;
}

const AppCtx = createContext<AppCtx | null>(null);

export function useApp(): AppCtx {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used within AppShell");
  return ctx;
}

export default function AppShell({ children }: { children?: ReactNode }) {
  const knowhere = useKnowhere();
  const auth = useAuth();
  const location = useLocation();
  const [authPrompt, setAuthPrompt] = useState<{ open: boolean; reason?: string; resolve?: (v: boolean) => void }>({
    open: false,
  });

  const requireAuth = (reason?: string) =>
    new Promise<boolean>((resolve) => {
      if (auth.user) return resolve(true);
      setAuthPrompt({ open: true, reason, resolve });
    });

  const closePrompt = (success: boolean) => {
    authPrompt.resolve?.(success);
    setAuthPrompt({ open: false });
  };

  const needsOnboarding =
    !knowhere.profile && location.pathname !== "/onboarding";

  if (needsOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  if (location.pathname === "/onboarding") {
    return (
      <AppCtx.Provider value={{ ...knowhere, auth, requireAuth }}>
        {children ?? <Outlet />}
        <SignInSheet
          open={authPrompt.open}
          reason={authPrompt.reason}
          onClose={() => closePrompt(false)}
          onSuccess={() => closePrompt(true)}
        />
      </AppCtx.Provider>
    );
  }

  return (
    <AppCtx.Provider value={{ ...knowhere, auth, requireAuth }}>
      <div className="min-h-dvh bg-background paper-grain">
        <div className="mx-auto flex min-h-dvh max-w-[520px] flex-col">
          <TopBar onSignIn={() => setAuthPrompt({ open: true })} />
          <main className="flex-1 px-5 pb-28 pt-3">{children ?? <Outlet />}</main>
          <BottomNav />
        </div>
      </div>
      <SignInSheet
        open={authPrompt.open}
        reason={authPrompt.reason}
        onClose={() => closePrompt(false)}
        onSuccess={() => closePrompt(true)}
      />
    </AppCtx.Provider>
  );
}

function TopBar({ onSignIn }: { onSignIn: () => void }) {
  const { auth } = useApp();
  return (
    <div className="flex items-center justify-between px-5 pt-5">
      <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
        Knowhere · Boston
      </span>
      {auth.user ? (
        <button
          onClick={() => auth.signOut()}
          className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-semibold"
        >
          <User className="h-3.5 w-3.5" strokeWidth={2} />
          {auth.user.username}
          <LogOut className="ml-0.5 h-3 w-3 text-muted-foreground" strokeWidth={2} />
        </button>
      ) : (
        <button
          onClick={onSignIn}
          className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-semibold hover:bg-secondary"
        >
          <LogIn className="h-3.5 w-3.5" strokeWidth={2} />
          Sign in
        </button>
      )}
    </div>
  );
}

function BottomNav() {
  const items = [
    { to: "/", label: "Pulse", Icon: MapPin, end: true },
    { to: "/detour", label: "Detour", Icon: RouteIcon },
  ];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[520px] border-t border-border/60 bg-card/95 backdrop-blur">
      <div className="grid grid-cols-2">
        {items.map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] transition-colors ${
                isActive ? "text-stamp" : "text-muted-foreground"
              }`
            }
          >
            <Icon className="h-5 w-5" strokeWidth={1.75} />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export { Compass };
