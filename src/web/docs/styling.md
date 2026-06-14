# Styling & Design System

The web app uses [MUI](https://mui.com/) (Material UI v9) with a single,
centralized theme that acts as the source of truth for the application's visual
language. The goal is twofold: **maintainability** (design decisions live in one
place) and **accessibility** (WCAG 2.1 AA out of the box).

## Where things live

| Concern                                               | Location                         |
| ----------------------------------------------------- | -------------------------------- |
| Colour palette, typography, radii, component defaults | `src/lib/theme.ts`               |
| Theme + `CssBaseline` wiring                          | `src/providers/AppProviders.tsx` |
| Global landmarks & skip link                          | `src/components/MainNavbar.tsx`  |
| Document language sync                                | `src/lib/i18n/i18n.ts`           |

## Using the theme

Prefer theme tokens over hardcoded values so contrast and spacing stay
consistent and adjustable from one place:

```tsx
// Good — reads from the theme
<Box sx={{ color: "primary.main", bgcolor: "background.paper", p: 2 }} />

// Avoid — hardcoded values bypass the design system & contrast guarantees
<Box sx={{ color: "#1565c0", bgcolor: "#fff", padding: "16px" }} />
```

To change a brand colour, spacing scale, default radius, or a component's
default look, edit `theme.ts` once and it propagates everywhere.

## Accessibility (WCAG 2.1 AA) guarantees baked in

These are provided globally so individual components don't have to remember them:

- **1.4.3 Contrast** — every palette `main` colour meets ≥ 4.5:1 with its
  `contrastText`; `contrastThreshold` keeps MUI's auto-picked text accessible.
- **2.4.7 Focus Visible** — a consistent 3px focus ring on every
  keyboard-focusable element (`*:focus-visible` in `MuiCssBaseline`).
- **2.4.1 Bypass Blocks** — a "skip to main content" link (visible on focus)
  jumps keyboard users past the navigation to the `<main id="main-content">`
  landmark.
- **1.3.1 Info & Relationships** — semantic landmarks: `<AppBar>` (banner),
  `<Box component="nav">` for navigation, `<Box component="main">` for content.
- **2.3.3 Animation from Interactions** — `prefers-reduced-motion` collapses
  transitions/animations.
- **3.1.1 Language of Page** — `document.documentElement.lang` is kept in sync
  with the active i18n language.
- **1.4.8 / 3.1.5 Readability** — buttons use sentence case instead of ALL CAPS;
  common button sizes have accessible minimum target heights.

## Adding new UI

1. Reach for MUI components and the `sx` prop with theme tokens first.
2. If you need a colour/spacing value that isn't a token yet, add it to
   `theme.ts` rather than hardcoding it inline.
3. Keep interactive targets ≥ 44px on touch, label icon-only buttons with
   `aria-label`, and rely on the global focus ring (don't remove outlines).
