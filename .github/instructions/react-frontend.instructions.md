---
description: "Use when writing or modifying React components, pages, hooks, or features in the web frontend. Covers MUI, i18n, routing, and component patterns."
applyTo: "src/web/src/**/*.{ts,tsx}"
---
# React + TypeScript Conventions

## Components
- Functional components with hooks only
- Export pages as `export const Component = PageName` for React Router lazy loading
- MUI 7 imports from top-level: `import Button from "@mui/material/Button"`
- Styling via MUI `styled()` API with Emotion

## i18n
- Wrap ALL user-visible strings in `t()` from `react-i18next`
- Supported locales: `en`, `nl`
- Never use hardcoded user-facing strings

## Forms
- Use `react-hook-form` with `react-hook-form-mui` bindings (`TextFieldElement`, `DatePickerElement`, etc.)
- Type form data with the Orval-generated command types (e.g., `useForm<AddChildCommand>()`)
- Handle server validation errors by mapping to `setError()`

## Data Fetching
- Use Orval-generated React Query hooks (`useListChildren`, `useAddChild`, etc.)
- After mutations, invalidate queries: `queryClient.invalidateQueries({ queryKey: getListChildrenQueryKey({}) })`
- Never call fetch/axios directly — always go through Orval hooks

## Path Aliases
`@api/*`, `@hooks/*`, `@lib/*`, `@providers/*`, `@pages/*`, `@components/*`, `@features/*`, `@utils/*`
