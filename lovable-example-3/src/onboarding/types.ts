export type ParsedProfile = {
  travelStyle?: string;
  repeatedSignals?: string[];
  pulls?: string[];
  pushes?: string[];
  pace?: string;
  movement?: string;
  spending?: string;
  foodDrink?: string;
  socialContext?: string;
  bestDetour?: string;
  avoid?: string;
  distinctive?: string[];
  confidence?: string;
  raw?: string;
};

export type QuickPicks = {
  userType?: string;
  interests: string[];
  mobility?: string;
  budget?: string;
  vibes: string[];
  avoids: string[];
};

export type Trip = {
  city: string;
  area?: string;
  timing?: string;
};

export type AuthInfo = {
  username: string;
  email?: string | null;
  userId: number;
  token: string;
};

export type PassportState = {
  step: number;
  name?: string;
  profile?: ParsedProfile;
  picks: QuickPicks;
  trip: Trip;
  usedQuickPicks: boolean;
  auth?: AuthInfo;
  attendedEvents?: import("@/lib/knowhereApi").ApiEvent[];
  createdDetourId?: number;
  socials?: { instagram?: string; tiktok?: string };
};

export const DEFAULT_STATE: PassportState = {
  step: 0,
  picks: { interests: [], vibes: [], avoids: [] },
  trip: { city: "Boston", area: "Kendall / Cambridge", timing: "this weekend" },
  usedQuickPicks: false,
};
