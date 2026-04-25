
# Knowhere — Demo MVP Plan

A personal travel passport that learns your taste and recommends places in new cities. Warm, filmic, editorial — inspired by the Pinterest moodboard (golden-hour travel photography, real passport stamps, sun-soaked nature).

## Visual direction

- **Palette:** cream paper `#F5EFE4` base, deep ink `#1F1B16` text, terracotta `#B5573A` primary accent, sea teal `#2B6F73` and moss `#5A6B3E` secondary, faded stamp-red `#A53A2A` for stamp graphics
- **Typography:** Instrument Serif (large editorial headlines, italics for warmth) + Work Sans (UI + body)
- **Texture:** subtle paper grain, soft shadows, rounded corners (12–16px), generous whitespace
- **Motion:** gentle fade/slide on stamp reveal, slight rotation on stamp cards for hand-stamped feel
- **Mobile-first** layout, max ~480px content width, comfortable on desktop too

## Screens & flow

### 1. Passport Home (`/`)
- Header with user avatar, name "Alex Rivera", and a serif tagline persona ("Cultural Explorer · Slow Wanderer")
- Stat strip: cities visited · experiences logged · top vibe
- "Your cities" — horizontal scroll of city chips, each with a count of stamps
- "Recent stamps" — vertical feed of the most recent 3–4 experience stamps
- Bottom nav: Passport · Taste · Discover · (Add button as floating CTA)

### 2. Experience Stamps
- **Stamp card** styled like a real rubber stamp: circular/oval border, rotated 2–6°, ink-bleed SVG texture, place name + city + date arranged radially or stacked
- Each stamp also has a clean info panel below it: category, tags as small pill chips, liked/not-liked indicator (filled heart vs outline)
- **Add Experience flow:** floating "+" button opens a modal/sheet with fields: place name, city, category (select: café, restaurant, bar, museum, walk, shop, nature, nightlife), tags (multi-select chips), liked toggle, optional note
- New stamps animate in with a subtle stamp-down motion

### 3. Taste Profile (`/taste`)
- Editorial headline: "You, in places."
- **Vibe summary card** — auto-generated short paragraph from data (e.g. "You gravitate toward quiet, historic corners with great coffee and a touch of grit.")
- **You tend to like** — top 5 tags + top 3 categories as warm pill chips with frequency bars
- **You tend to avoid** — low-rated tags shown muted/struck-through
- **City breakdown** — small bar showing tag distribution per city visited
- All logic mocked client-side: tally tags/categories from liked vs not-liked stamps

### 4. New City Recommendations (`/discover`)
- City selector at top (chips: Boston, Lisbon, Mexico City, Tokyo, Paris)
- 3–5 recommendation cards per city, each with:
  - Place name (serif), category, neighborhood
  - Short evocative description (1–2 lines)
  - **"Because you loved ___ in ___"** explainer line in italic — the personalization moment
  - Tag pills matching the user's profile
- Recommendations mocked from a static seed list, filtered/ranked by overlap with the user's top tags

## Data & persistence

- TypeScript types: `Experience`, `City`, `Recommendation`, `UserProfile`
- `localStorage` adapter behind a clean `useExperiences()` hook so swapping to a real API later is one file
- Seed data: ~6 pre-loaded stamps across 2–3 cities so the demo looks alive on first load
- Mock recommendation engine: scores candidate places by tag overlap with user's liked tags, returns top N with the highest-scoring liked stamp as the "because you liked…" reference

## Components

- `PassportHeader`, `StatStrip`, `CityChip`, `StampCard`, `StampDetail`, `AddExperienceSheet`, `TagPill`, `VibeSummary`, `TasteBar`, `CitySelector`, `RecommendationCard`, `BottomNav`, `PaperBackground`
- All built on the existing shadcn primitives (Sheet, Dialog, Button, Input, Select, Badge)

## Out of scope for this build

Auth, real backend, maps, payments, chat/AI, social features, wallet — all noted in the PRD but not part of the demo flow. Architecture leaves clean seams to add them later.
