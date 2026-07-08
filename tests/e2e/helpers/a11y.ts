import { AxeBuilder } from "@axe-core/playwright";
import { expect, type Page, type TestInfo } from "@playwright/test";
import type { AxeResults, Result } from "axe-core";
import { createHtmlReport } from "axe-html-reporter";

/** Per-view axe results collected during a run, keyed by label (retries overwrite). */
const collectedResults = new Map<string, AxeResults>();

/** Where the consolidated HTML report is written (relative to tests/e2e). */
export const A11Y_REPORT_DIR = "a11y-report";

/**
 * WCAG conformance the scans target. axe maps roughly half of WCAG's success
 * criteria to automated rules; the rest still need manual review (keyboard,
 * focus order, meaningful sequence, contrast in both themes, screen readers).
 */
export const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] as const;

/**
 * Impact levels that fail the build. We gate on serious + critical (the
 * industry-standard phased rollout for adding a11y to an existing app) and
 * surface moderate/minor findings as an attached report for triage rather than
 * blocking on them. Tighten this to include "moderate"/"minor" as the backlog
 * is burned down.
 */
const BLOCKING_IMPACTS: ReadonlyArray<Result["impact"]> = ["critical", "serious"];

/** One-line, human-readable summary of a violation and where it occurs. */
function formatViolation(v: Result): string {
  const targets = v.nodes
    .slice(0, 5)
    .map((n) => n.target.join(" "))
    .join(", ");
  const more = v.nodes.length > 5 ? ` (+${v.nodes.length - 5} more)` : "";
  return `[${v.impact}] ${v.id}: ${v.help} — ${targets}${more}\n    ${v.helpUrl}`;
}

/**
 * Run an axe WCAG 2.1 A/AA scan on the current page and assert there are no
 * blocking (serious/critical) violations. The full violation set (all impact
 * levels) is attached to the test report as JSON and a readable summary so
 * non-blocking findings stay visible.
 *
 * @param page     the page to scan (navigate + settle it first)
 * @param testInfo Playwright TestInfo (destructure it from the test callback)
 * @param label    short label for the scanned view, used in attachment names
 * @param options  optional axe include/exclude/disableRules tweaks
 */
export async function expectNoWcagViolations(
  page: Page,
  testInfo: TestInfo,
  label: string,
  options: { exclude?: string[]; disableRules?: string[] } = {},
): Promise<void> {
  let builder = new AxeBuilder({ page }).withTags([...WCAG_TAGS]);
  for (const selector of options.exclude ?? []) builder = builder.exclude(selector);
  if (options.disableRules?.length) builder = builder.disableRules(options.disableRules);

  const results = await builder.analyze();
  const violations = results.violations;

  // Collect for the consolidated HTML report (written in writeA11yReport()).
  collectedResults.set(label, results);

  // Always attach the full report so moderate/minor findings are reviewable.
  if (violations.length > 0) {
    await testInfo.attach(`axe-${label}.json`, {
      body: JSON.stringify(violations, null, 2),
      contentType: "application/json",
    });
    await testInfo.attach(`axe-${label}.txt`, {
      body: violations.map(formatViolation).join("\n\n"),
      contentType: "text/plain",
    });
  }

  const blocking = violations.filter((v) => BLOCKING_IMPACTS.includes(v.impact));
  expect(
    blocking,
    blocking.length
      ? `WCAG 2.1 A/AA serious/critical violations on "${label}":\n\n` +
          blocking.map(formatViolation).join("\n\n")
      : undefined,
  ).toEqual([]);
}

/** Tag each finding's help text with the view it came from, for the merged report. */
function tagByView(label: string, findings: Result[] = []): Result[] {
  return findings.map((f) => ({ ...f, help: `[${label}] ${f.help}` }));
}

/**
 * Write one consolidated axe HTML report (via axe-html-reporter) covering every
 * view scanned this run, into A11Y_REPORT_DIR. Call it from an afterAll hook so
 * it runs even when some scans fail. Merges violations and "incomplete" (needs
 * manual review — e.g. contrast axe could not decide) across views, and lists a
 * per-view count in the summary. Returns the report path, or undefined if no
 * scan ran.
 */
export function writeA11yReport(): string | undefined {
  if (collectedResults.size === 0) return undefined;

  const views = [...collectedResults.entries()];
  const violations = views.flatMap(([label, r]) => tagByView(label, r.violations));
  const incomplete = views.flatMap(([label, r]) => tagByView(label, r.incomplete));

  const perView = views
    .map(
      ([label, r]) =>
        `${label}: ${r.violations.length} violations, ${(r.incomplete ?? []).length} needs review`,
    )
    .join("<br/>");

  createHtmlReport({
    results: { violations, incomplete },
    options: {
      projectKey: "KDVManager",
      reportFileName: "index.html",
      outputDir: A11Y_REPORT_DIR,
      customSummary:
        `WCAG 2.1 A/AA scan · ${views.length} views · gate blocks serious/critical.<br/>` +
        `"needs review" items (incl. some contrast checks) are not gated — review manually.<br/><br/>` +
        perView,
    },
  });
  return `${A11Y_REPORT_DIR}/index.html`;
}
