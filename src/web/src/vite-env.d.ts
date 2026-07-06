/// <reference types="vite/client" />

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- interface merging with vite/client
interface ImportMetaEnv {
  /** API gateway base URL, e.g. "https://api.kdvmanager.nl" or "//localhost:5200". */
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_APP_AUTH0_DOMAIN?: string;
  readonly VITE_APP_AUTH0_CLIENT_ID?: string;
  readonly VITE_APP_AUTH0_AUDIENCE?: string;
  /**
   * OTLP/HTTP base endpoint for browser telemetry (traces are posted to
   * `<endpoint>/v1/traces`). Leave unset to disable telemetry entirely.
   */
  readonly VITE_OTEL_EXPORTER_OTLP_ENDPOINT?: string;
  /** Build/release identifier reported as service.version. */
  readonly VITE_APP_VERSION?: string;
}
