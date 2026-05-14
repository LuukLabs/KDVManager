// Loaded once per worker. `vitest-browser-react` handles render cleanup
// automatically between tests, so we only register matchers here.
import "@testing-library/jest-dom/vitest";
