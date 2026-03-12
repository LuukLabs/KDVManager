---
description: "Create a new React page with MUI 7, routing, i18n, and data fetching following project conventions"
agent: "agent"
argument-hint: "Page type and purpose (e.g., 'list page for Absences')"
---
Create a new React page following project conventions:

1. Create the page component in `src/web/src/pages/{entity}/`
2. Use MUI 7 components (import from top-level paths)
3. Use `styled()` API for custom styling
4. Wrap all user-facing strings in `t()` from `react-i18next`
5. For list pages: use Orval-generated query hooks + pagination
6. For form pages: use `react-hook-form` with `react-hook-form-mui` bindings
7. Export as `export const Component = PageName` for lazy loading
8. Add route to `src/web/src/providers/RouterProvider.tsx` with:
   - `lazy: () => import("@pages/{entity}/{PageName}")`
   - `loader: requireAuth`
   - `handle: { crumb: () => t("...") }`
9. Add translation keys to en and nl locale files

Reference existing pages in the same domain area for patterns.
