import { AxeBuilder } from "@axe-core/playwright";
import { expect, type Page, type TestInfo } from "@playwright/test";
import type { Result } from "axe-core";

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
