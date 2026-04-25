// Single source of truth for Knowhere client state.
// Backed by localStorage today; swap for an API later without touching consumers.

import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  Detour,
  MerchantCampaign,
  PassportEntry,
  Profile,
} from "@/lib/types";

const STORAGE = {
  profile: "knowhere.profile.v1",
  passport: "knowhere.passport.v1",
  saved: "knowhere.saved.v1",
  campaigns: "knowhere.campaigns.v1",
};

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota — ignore */
  }
}

export function useKnowhere() {
  const [profile, setProfile] = useState<Profile | null>(() =>
    load<Profile | null>(STORAGE.profile, null),
  );
  const [passport, setPassport] = useState<PassportEntry[]>(() =>
    load<PassportEntry[]>(STORAGE.passport, []),
  );
  const [savedPlaceIds, setSavedPlaceIds] = useState<string[]>(() =>
    load<string[]>(STORAGE.saved, []),
  );
  const [campaigns, setCampaigns] = useState<MerchantCampaign[]>(() =>
    load<MerchantCampaign[]>(STORAGE.campaigns, []),
  );

  useEffect(() => save(STORAGE.profile, profile), [profile]);
  useEffect(() => save(STORAGE.passport, passport), [passport]);
  useEffect(() => save(STORAGE.saved, savedPlaceIds), [savedPlaceIds]);
  useEffect(() => save(STORAGE.campaigns, campaigns), [campaigns]);

  const completeOnboarding = useCallback((p: Omit<Profile, "onboardedAt">) => {
    setProfile({ ...p, onboardedAt: Date.now() });
  }, []);

  const resetProfile = useCallback(() => {
    setProfile(null);
    setPassport([]);
    setSavedPlaceIds([]);
  }, []);

  const addDetourToPassport = useCallback((detour: Detour) => {
    setPassport((prev) => {
      if (prev.some((e) => e.detour.id === detour.id)) return prev;
      return [
        { detour, addedAt: Date.now(), redeemedPerkIds: [] },
        ...prev,
      ];
    });
  }, []);

  const completeDetour = useCallback((detourId: string) => {
    setPassport((prev) =>
      prev.map((e) =>
        e.detour.id === detourId && !e.completedAt
          ? { ...e, completedAt: Date.now() }
          : e,
      ),
    );
  }, []);

  const redeemPerk = useCallback((detourId: string, perkId: string) => {
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
    );
  }, []);

  const togglePlaceSaved = useCallback((placeId: string) => {
    setSavedPlaceIds((prev) =>
      prev.includes(placeId) ? prev.filter((p) => p !== placeId) : [...prev, placeId],
    );
  }, []);

  const addCampaign = useCallback(
    (c: Omit<MerchantCampaign, "id" | "createdAt">) => {
      setCampaigns((prev) => [
        { ...c, id: `c_${Date.now().toString(36)}`, createdAt: Date.now() },
        ...prev,
      ]);
    },
    [],
  );

  const activeDetour = useMemo(
    () => passport.find((e) => !e.completedAt)?.detour ?? null,
    [passport],
  );

  return {
    profile,
    passport,
    savedPlaceIds,
    campaigns,
    activeDetour,
    completeOnboarding,
    resetProfile,
    addDetourToPassport,
    completeDetour,
    redeemPerk,
    togglePlaceSaved,
    addCampaign,
  };
}
