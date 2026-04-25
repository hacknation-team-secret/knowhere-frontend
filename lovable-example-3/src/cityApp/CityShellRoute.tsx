// Route entry that reads the onboarding → city bridge and mounts CityShell.

import { CityShell } from "@/cityApp/CityShell";
import { readBridge } from "@/cityApp/bridge";

export function CityShellRoute() {
  const { profile, auth } = readBridge();
  return (
    <CityShell
      initialProfile={profile}
      initialAuth={auth ?? undefined}
    />
  );
}
