# Nexus

Premium, UI‑first Expo app with animated gradients, full light/dark theme support, and smooth 60fps animations across core screens.

## Quick start

1) Install dependencies

```bash
npm install
```

2) Start the app

```bash
npx expo start
```

## What’s implemented (UI‑first milestones)

- Theme system
  - Semantic tokens for light/dark (colors, gradients, spacing, typography, radius, shadows)
  - File: constants/theme/tokens.ts
- Animated gradient bottom tab bar
  - Gradient background, active indicator animation, center FAB with haptics and safe‑area
  - File: components/navigation/AnimatedGradientTabBar.tsx
- Reusable UI
  - GradientButton (brandPrimary)
  - Chip with press animation
  - Files: components/common/GradientButton.tsx, components/common/Chip.tsx
- Screen polish
  - Onboarding: gradient CTA, animated dots, chip selection
  - Circle Detail: parallax header with gradient overlay, sticky tabs with animated underline, gradient Join button, tokens applied
  - Home: skeleton loaders for circles/meetups; tokenized surfaces
- Filters
  - Filters modal header uses gradient; Apply button uses GradientButton

## Milestones in progress

- Milestone 2: motion primitives + Home polish (staggered list reveal, press scale, gradient pull‑to‑refresh)
- Milestone 3: Create flows, Discover segmented control + filter polish, Chats micro‑interactions
- Milestone 4: Accessibility/performance/QA pass

## Scripts

- Lint: `npm run lint`
- Type‑check: `npm run type-check`

## Dependencies

- expo-linear-gradient (installed)
- expo-blur (available)

## Development notes

- Follow Conventional Commits for milestone summaries
- Use tokens for all UI (avoid hard‑coded hexes)
- Keep animations performant (Reanimated on UI thread; memoize worklets; limit overdraw)
