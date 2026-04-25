// Shell for the post-onboarding Knowhere app. Holds in-memory state
// (profile, passport, saved places) and provides the same context shape
// the colleague's pages expect — minus the mobile-only chrome.
//
// Visual: matches our brand (Fraunces serif, Ocean Glass, paper card).

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  Compass,
  LogOut,
  MapPin,
  RotateCcw,
  Route as RouteIcon,
  Ticket,
  User,
} from "lucide-react";
import type {
  Detour,
  PassportEntry,
  Profile,
} from "@/cityApp/lib/types";
import { setAuthToken } from "@/cityApp/lib/apiAdapter";
import { clearBridge } from "@/cityApp/bridge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface CityAuth {
  user: { username: string; email?: string | null; id: number } | null;
  token: string | null;
  signOut: () => void;
}

interface CityCtx {
  profile: Profile | null;
  passport: PassportEntry[];
  savedPlaceIds: string[];
  activeDetour: Detour | null;
  auth: CityAuth;
  setProfile: (p: Profile | null) => void;
  setAuth: (a: CityAuth) => void;
  addDetourToPassport: (d: Detour) => void;
  completeDetour: (id: string) => void;
  redeemPerk: (detourId: string, perkId: string) => void;
  togglePlaceSaved: (placeId: string) => void;
  resetProfile: () => void;
  // Onboarding has already happened upstream — kept as a no-op so colleague's
  // Onboarding page (unused) still type-checks if reintroduced.
  completeOnboarding: (p: Omit<Profile, "onboardedAt">) => void;
  requireAuth: (reason?: string) => Promise<boolean>;
}

const Ctx = createContext<CityCtx | null>(null);

export function useApp(): CityCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used inside CityShell");
  return ctx;
}

interface CityShellProps {
  initialProfile?: Profile | null;
  initialAuth?: CityAuth;
  children?: ReactNode;
}

export function CityShell({
  initialProfile = null,
  initialAuth,
  children,
}: CityShellProps) {
  const [profile, setProfile] = useState<Profile | null>(initialProfile);
  const [passport, setPassport] = useState<PassportEntry[]>([]);
  const [savedPlaceIds, setSavedPlaceIds] = useState<string[]>([]);
  const [auth, setAuth] = useState<CityAuth>(
    initialAuth ?? { user: null, token: null, signOut: () => {} },
  );
  const navigate = useNavigate();
  const location = useLocation();

  // Keep the API adapter's bearer token in sync with auth.
  useEffect(() => {
    setAuthToken(auth.token);
  }, [auth.token]);

  const value: CityCtx = useMemo(
    () => ({
      profile,
      passport,
      savedPlaceIds,
      activeDetour: passport.find((e) => !e.completedAt)?.detour ?? null,
      auth: {
        ...auth,
        signOut: () => {
          setAuth({ user: null, token: null, signOut: () => {} });
        },
      },
      setProfile,
      setAuth,
      addDetourToPassport: (detour) =>
        setPassport((prev) =>
          prev.some((e) => e.detour.id === detour.id)
            ? prev
            : [{ detour, addedAt: Date.now(), redeemedPerkIds: [] }, ...prev],
        ),
      completeDetour: (id) =>
        setPassport((prev) =>
          prev.map((e) =>
            e.detour.id === id && !e.completedAt
              ? { ...e, completedAt: Date.now() }
              : e,
          ),
        ),
      redeemPerk: (detourId, perkId) =>
        setPassport((prev) =>
          prev.map((e) =>
            e.detour.id === detourId
              ? {
                  ...e,
                  redeemedPerkIds: e.redeemedPerkIds.includes(perkId)
                    ? e.redeemedPerkIds
                    : [...e.redeemedPerkIds, perkId],
                }
              : e,
          ),
        ),
      togglePlaceSaved: (placeId) =>
        setSavedPlaceIds((prev) =>
          prev.includes(placeId)
            ? prev.filter((p) => p !== placeId)
            : [...prev, placeId],
        ),
      resetProfile: () => {
        setProfile(null);
        setPassport([]);
        setSavedPlaceIds([]);
        navigate("/");
      },
      completeOnboarding: () => {
        // No-op — onboarding handled by the dedicated flow at "/".
      },
      requireAuth: async () => !!auth.user,
    }),
    [profile, passport, savedPlaceIds, auth, navigate],
  );

  // If someone deep-links to /app/* without finishing onboarding,
  // bounce them back to the welcome flow.
  useEffect(() => {
    if (!profile && location.pathname.startsWith("/app")) {
      navigate("/", { replace: true });
    }
  }, [profile, location.pathname, navigate]);

  if (!profile) return null;

  return (
    <Ctx.Provider value={value}>
      <div className="min-h-screen bg-paper">
        <TopNav />
        <main className="mx-auto max-w-[1100px] px-6 py-8 md:py-12">
          {children ?? <Outlet />}
        </main>
        <Footer />
      </div>
    </Ctx.Provider>
  );
}

function TopNav() {
  const { auth, setAuth } = useApp();
  const navigate = useNavigate();

  const handleSignOut = () => {
    clearBridge();
    setAuthToken(null);
    setAuth({ user: null, token: null, signOut: () => {} });
    navigate("/", { replace: true });
  };

  return (
    <header className="border-b border-line/60 bg-paper-soft/70 backdrop-blur">
      <div className="mx-auto flex max-w-[1100px] items-center justify-between px-6 py-4">
        <Link to="/app" className="flex items-baseline gap-3">
          <span className="font-serif text-[22px] text-ink">Knowhere</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <NavItem to="/app" end icon={<MapPin className="h-3.5 w-3.5" strokeWidth={1.75} />}>
            Pulse
          </NavItem>
          <NavItem to="/app/detour" icon={<RouteIcon className="h-3.5 w-3.5" strokeWidth={1.75} />}>
            Detour
          </NavItem>
          <NavItem to="/app/experiences" icon={<Ticket className="h-3.5 w-3.5" strokeWidth={1.75} />}>
            Experiences
          </NavItem>
        </nav>

        <div className="flex items-center gap-2">
          {auth.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-full border border-line/70 bg-card px-3 py-1.5 text-[12px] text-ink hover:bg-card/70 transition-colors"
                  aria-label="Account menu"
                >
                  <User className="h-3.5 w-3.5 text-ink-soft" strokeWidth={1.75} />
                  <span className="font-medium">@{auth.user.username}</span>
                  <ChevronDown className="h-3 w-3 text-ink-soft" strokeWidth={1.75} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                  <RotateCcw className="mr-2 h-3.5 w-3.5" strokeWidth={1.75} />
                  Restart onboarding
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-coral focus:text-coral">
                  <LogOut className="mr-2 h-3.5 w-3.5" strokeWidth={1.75} />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-line/70 px-3 py-1.5 text-[11px] tracking-[0.18em] uppercase text-ink-soft hover:text-ink hover:border-line transition-colors"
            >
              <RotateCcw className="h-3 w-3" strokeWidth={1.75} />
              Restart
            </button>
          )}
        </div>
      </div>
      {/* Mobile nav row */}
      <nav className="flex justify-center gap-1 border-t border-line/40 pb-2 pt-2 md:hidden">
        <NavItem to="/app" end icon={<MapPin className="h-3.5 w-3.5" strokeWidth={1.75} />}>
          Pulse
        </NavItem>
        <NavItem to="/app/detour" icon={<RouteIcon className="h-3.5 w-3.5" strokeWidth={1.75} />}>
          Detour
        </NavItem>
        <NavItem to="/app/experiences" icon={<Ticket className="h-3.5 w-3.5" strokeWidth={1.75} />}>
          Experiences
        </NavItem>
      </nav>
    </header>
  );
}

function NavItem({
  to,
  end,
  icon,
  children,
}: {
  to: string;
  end?: boolean;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12.5px] tracking-tight transition-colors ${
          isActive
            ? "bg-[hsl(var(--ocean)/0.10)] text-ocean-deep"
            : "text-ink-soft hover:text-ink"
        }`
      }
    >
      {icon}
      {children}
    </NavLink>
  );
}

function Footer() {
  return (
    <footer className="mx-auto max-w-[1100px] px-6 pb-10 pt-2 text-center">
      <div className="ink-rule mx-auto mb-3 max-w-[120px]" />
      <p className="font-serif text-[13px] italic text-ink-soft">
        Know where to go. <Compass className="ml-1 inline h-3 w-3" strokeWidth={1.75} />
      </p>
    </footer>
  );
}
