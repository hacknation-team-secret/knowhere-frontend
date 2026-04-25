# Add Sign Out / Restart Onboarding

Currently there's no way to get back to onboarding from inside `/app` without manually editing the URL. I'll add a small control in the City app header that signs the user out and returns them to the onboarding flow.

## Changes

### 1. `src/cityApp/CityShell.tsx` — Header sign-out menu
- Wrap the existing user chip (`@username` / `Guest`) in a small `DropdownMenu` (already in `components/ui/dropdown-menu`).
- Menu items:
  - **Restart onboarding** — clears the bridge + auth and navigates to `/`.
  - **Sign out** — same effect (the bridge holds both the profile and the API token, so they're tied together).
- The handler will:
  1. Call `clearBridge()` from `@/cityApp/bridge` to wipe sessionStorage.
  2. Reset local `auth` state to the empty default.
  3. Call `setAuthToken(null)` so the API adapter forgets the bearer token.
  4. `navigate("/", { replace: true })` to return to the onboarding flow.
- Apply the same control to both the desktop chip (top right) and keep the mobile nav row unchanged (the chip is already shared above it).

### 2. `src/cityApp/bridge.ts` — No changes needed
`clearBridge()` already exists and does exactly what we need.

## Visual
- Keep the existing rounded chip styling (border-line, paper bg, small user icon).
- Add a tiny chevron-down icon next to the username to signal it's clickable.
- Dropdown uses the project's existing shadcn `DropdownMenu` styling — no new design tokens.
- For the Guest state (no auth.user), the chip becomes a single-action button labeled "Restart onboarding" instead of a dropdown, since there's nothing to sign out of.

## Files touched
- `src/cityApp/CityShell.tsx` (only file changed)

## Out of scope
- No backend logout call — the Knowhere API is stateless JWT, so dropping the token client-side is sufficient.
- No confirmation dialog — restart is non-destructive (profile is rebuilt on next onboarding run).
