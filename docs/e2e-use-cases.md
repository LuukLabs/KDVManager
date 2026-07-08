# KDVManager — Use Cases & E2E Test Coverage

A catalog of all user-facing use cases in the application, derived from the
frontend routes/pages and the CRM + Scheduling APIs, and how the Playwright
e2e suite (`tests/e2e/`) covers them.

## 1. Authentication

| # | Use case | Covered by |
|---|----------|-----------|
| 1.1 | Unauthenticated visitor is sent through the login flow and lands in the app (root redirects to `/schedule`) | `auth.spec.ts` |
| 1.2 | Deep links are preserved through the login bounce (`returnTo`) | `auth.spec.ts` |
| 1.3 | Authenticated user can log out via the account menu | `auth.spec.ts` |

## 2. Daily schedule overview (`/schedule`)

| # | Use case | Covered by |
|---|----------|-----------|
| 2.1 | View the daily schedule: groups as columns, scheduled children listed per group | `schedule-overview.spec.ts` |
| 2.2 | Navigate dates: previous/next day, "Vandaag" (today), date in URL (`?date=`) | `schedule-overview.spec.ts` |
| 2.3 | Closed days show the closure reason and no child schedules | `schedule-overview.spec.ts` |
| 2.4 | Absent children are indicated in the group's daily summary | `schedule-overview.spec.ts` |

## 3. Child management (`/children`)

| # | Use case | Covered by |
|---|----------|-----------|
| 3.1 | List children (server-paginated DataGrid) | `children.spec.ts` |
| 3.2 | Search children by name (debounced, `?q=` URL param) | `children.spec.ts` |
| 3.3 | Create a child (given name, family name, date of birth) → redirected to detail page | `children.spec.ts` |
| 3.4 | Edit child details (edit-in-place on the Basisinformatie card) | `children.spec.ts` |
| 3.5 | Delete a child from the list (with confirmation dialog) | `children.spec.ts` |

## 4. Child planning (`/children/:id/planning`)

| # | Use case | Covered by |
|---|----------|-----------|
| 4.1 | View a child's schedules and end marks on the planning tab | `child-planning.spec.ts` |
| 4.2 | Add a schedule via the dialog (start date + rules: weekday, time slot, group) | `child-planning.spec.ts` |
| 4.3 | Add an end mark for a child | `child-planning.spec.ts` |
| 4.4 | Delete a schedule from the planning tab | `child-planning.spec.ts` |
| 4.5 | Automatic system end marks are created when a child is registered (EndMark automation) | implicitly exercised by `child-planning.spec.ts` (asserts around the auto-generated end mark) |
| 4.6 | Edit a schedule via the card action (change start date; delete+recreate path) | `child-planning-extras.spec.ts` |
| 4.7 | Add an absence via the dialog | `child-planning-extras.spec.ts` |
| 4.8 | Delete an absence via the row action (with confirmation) | `child-planning-extras.spec.ts` |

## 5. Guardian management (`/guardians`)

| # | Use case | Covered by |
|---|----------|-----------|
| 5.1 | List guardians (server-paginated DataGrid) + search by name | `guardians.spec.ts` |
| 5.2 | Create a guardian (name, email, …) | `guardians.spec.ts` |
| 5.2b | Create a guardian with a phone number (repeatable phone list) | `guardians.spec.ts` |
| 5.3 | Edit guardian details (edit-in-place) | `guardians.spec.ts` |
| 5.4 | Link a child to a guardian with a relationship type (via child detail page) | `guardians.spec.ts` |
| 5.5 | Unlink a child from a guardian (with confirmation) | `guardians.spec.ts` |
| 5.6 | Delete a guardian (with confirmation) | `guardians.spec.ts` |

## 6. Reporting

| # | Use case | Covered by |
|---|----------|-----------|
| 6.1 | Newsletter recipients: active children's guardians with emails, filtered by month/year | `reports.spec.ts` |
| 6.2 | Print attendance schedules per group for a month (in-page A4 preview + print) | `reports.spec.ts` |
| 6.3 | Phone list of guardians per child (preview + PDF export) | `reports.spec.ts` |

## 7. Settings

| # | Use case | Covered by |
|---|----------|-----------|
| 7.1 | Settings hub shows cards and navigates to sub-pages | `settings.spec.ts` |
| 7.2 | Groups: add via dialog, list, delete with confirmation | `settings-groups.spec.ts` |
| 7.3 | Time slots: add via dialog (name, start/end time), edit, delete | `settings-timeslots.spec.ts` |
| 7.4 | Closure periods: add via dialog (start/end date, reason), list, delete | `settings-closure-periods.spec.ts` |
| 7.5 | End-mark automation settings: view and update (years after birth) | `settings.spec.ts` |

## 8. Error handling

| # | Use case | Covered by |
|---|----------|-----------|
| 8.1 | A route loader failure (e.g. a non-existent child) renders the app error page (ErrorPage) with a recovery action | `children.spec.ts` |

## 9. Accessibility (WCAG 2.1 A/AA)

| # | Use case | Covered by |
|---|----------|-----------|
| 9.1 | Every top-level route passes an axe WCAG 2.1 A/AA scan with no serious/critical violations | `a11y.spec.ts` |
| 9.2 | Rich forms (new child, new guardian) pass the scan (labels, structure) | `a11y.spec.ts` |
| 9.3 | An open modal dialog passes the scan (dialog role, labelling) | `a11y.spec.ts` |

Automated scans cover only part of WCAG. Still requires manual review: logical
focus order, keyboard operability, meaningful sequence, contrast in both light
and dark themes, zoom/reflow, and screen-reader announcements (`aria-live`).

## Cross-cutting behaviors exercised throughout

- **Auth0 JWT chain**: every test runs through the real Envoy JWT filter and
  .NET JWT validation (against the local mock issuer) — see
  `tests/e2e/mock-auth/server.mjs`.
- **Multi-tenancy**: all data is created under the fixed e2e tenant claim
  (`https://kdvmanager.nl/tenant`).
- **CRM → Scheduling replication**: children created in CRM reach the
  Scheduling service asynchronously over RabbitMQ; schedule-related tests wait
  for this (e.g. `Api.createSchedule` retries).
- **Dutch i18n**: assertions use the real `nl` translations from
  `src/web/src/locales/nl/`.

## Known gaps (not covered)

- Real Auth0 Universal Login UI (replaced by the mock; the SPA-side flow —
  redirect, callback, silent auth, refresh tokens, logout — *is* covered).
- PDF binary content of print/phone-list exports (generation is triggered and
  the in-page data is asserted, but the PDFs are not parsed).
- Mobile/responsive variants of pages (tests run desktop Chromium only).
- DataGrid pagination interaction beyond control presence (would require
  seeding >10 rows per list).
- Form validation / negative input paths (invalid email, non-E.164 phone,
  required-field errors) — only the happy path of each form is asserted.
- Guardian contact-info card editing and the "create new guardian inline" path
  of the child↔guardian link dialog.
- Manual accessibility review beyond automated axe scans: keyboard operability,
  focus order/trap, contrast in dark theme, zoom/reflow, screen-reader
  announcements. (Automated WCAG 2.1 A/AA scans are covered by `a11y.spec.ts`;
  the gate currently blocks only serious/critical violations.)
