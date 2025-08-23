# Error Handling Architecture

This document summarizes the improved and generalized frontend error handling.

## Goals

- Avoid JSON parse errors when responses are empty or not JSON.
- Provide a unified `ApiError` object for all API failures (HTTP, network, parse, abort).
- Enable UI components (ErrorPage, snackbars) to tailor messages per category/status code.
- Preserve raw response body for diagnostics in development.

## Core Pieces

### 1. Mutators (`executeFetch`, `executeFetchPaginated`)

- Safely detect `content-type`; only call `response.json()` if it includes `application/json`.
- Fallback: read `text()` (optional) for non‑JSON bodies.
- Skip parsing for HTTP 204 (No Content).
- Wrap network failures (e.g. offline) into `ApiError` with `type: network` (classification done later if desired).
- On non-OK status: build an `ApiError` via `buildApiError` capturing status, parsed body fields, raw body.

### 2. Error Model (`ApiError`)

Located at `src/api/errors/types.ts`.
Fields: `status`, `code`, `message`, `details`, `rawBody`, `cause`, `type`.

### 3. Classification (`buildApiError`, `classifyStatus`)

`classifyStatus` maps HTTP status codes to semantic categories (`unauthorized`, `forbidden`, `not-found`, `conflict`, `validation`, `server`, etc.).
`buildApiError` extracts a message from common body fields (`message`, `title`, `error`, `detail`) or derives a default based on status.

### 4. UI Integration

- `ErrorPage` now derives message keys based on `ApiError.type` and shows a retry button and a home navigation button.
- A development-only caption reveals the underlying error message.

### 5. Legacy Utilities

`utils/error-handler.ts` updated to leverage `ApiError` classification when showing snackbars (still supports conflict / not found / unknown patterns).

## Usage Guidelines

- Prefer throwing / propagating `ApiError`. Mutators already do this for HTTP + network errors.
- In React Query `onError` handlers, you can `instanceof ApiError` to branch logic.
- For deletion or mutation flows, use `createErrorHandler` which now understands the new model.

## Extensibility

- Add new categories by extending `ErrorClassification` union and updating `classifyStatus`.
- Provide localized translations for any new `error.*` keys referenced in `ErrorPage`.

## i18n Keys Referenced

```
error.oops
error.unexpected
error.unauthorized
error.forbidden
error.notFound
error.server
error.network
```

Ensure these exist in translation resources (fallbacks will show raw keys if missing).

## Migration Notes

- Existing code receiving raw server error objects will now receive `ApiError`. Adjust any direct property access (`error.status` still works) if deeper body fields were previously used.
- If specific server validation error shapes are needed, inspect `error.details`.

## Troubleshooting

- If you see a generic message but expect server detail: ensure server returns JSON with one of the recognized fields, or explicitly surface it by customizing `buildApiError`.
- For binary or file responses: extend mutator to branch on other `content-type` values before reading body.
