import { getContrastRatio } from "@mui/material/styles";
import { describe, expect, it } from "vitest";

import { theme } from "@lib/theme";
import { getCategoricalColor } from "./categoricalColor";

/** WCAG 2.x relative luminance for an #rrggbb string. */
const relativeLuminance = (hex: string): number => {
  const channel = (value: number) => {
    const c = value / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};

/** WCAG 2.x contrast ratio between two #rrggbb strings. */
const wcagContrastRatio = (a: string, b: string): number => {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
};

const WHITE = "#FFFFFF";

// Measured with the helpers above against #FFFFFF (2026-07, palette in lib/theme.ts):
//   #1976D2 blue        4.60  PASS 4.5:1
//   #388E3C green       4.12  FAILS 4.5:1 (clears 4:1 only)
//   #F57C00 orange      2.70  FAILS 4.5:1 (clears 2.7:1 only)  <-- the floor
//   #7B1FA2 purple      8.20  PASS
//   #C2185B pink        5.87  PASS
//   #00796B teal        5.32  PASS
//   #5D4037 brown       9.32  PASS
//   #455A64 blue grey   7.24  PASS
//
// Two hues do NOT clear 4.5:1 against white, and per the brief the palette is
// NOT changed to fix that. The assertion below therefore locks in the real
// threshold the palette meets (2.7:1) so a future palette edit that makes any
// hue *worse* still fails loudly. The accessible guarantee the UI relies on
// instead is the second test: `theme.palette.getContrastText(color)` flips to
// dark text for the light hues, and THAT pairing clears 4.5:1 for all eight.
// Consequence for consumers: never hard-code white text on a categorical fill.
const WHITE_TEXT_FLOOR = 2.7;

describe("getCategoricalColor", () => {
  const { categorical, unassigned } = theme.customColors;

  it("has the eight categorical hues the tests below assume", () => {
    expect(categorical).toHaveLength(8);
  });

  it.each(categorical)("hue %s clears the real measured floor against white text", (color) => {
    expect(wcagContrastRatio(color, WHITE)).toBeGreaterThanOrEqual(WHITE_TEXT_FLOOR);
  });

  it.each(categorical)("hue %s clears 4.5:1 against its MUI contrast text", (color) => {
    // This is the pairing the app must use when text sits on a categorical
    // fill; MUI picks white or rgba(0,0,0,0.87) via contrastThreshold 4.5.
    expect(getContrastRatio(color, theme.palette.getContrastText(color))).toBeGreaterThanOrEqual(
      4.5,
    );
  });

  it("is stable: the same seed always maps to the same color", () => {
    const first = getCategoricalColor("Sterretjes", theme);
    for (let i = 0; i < 20; i++) {
      expect(getCategoricalColor("Sterretjes", theme)).toBe(first);
    }
  });

  it("returns a color from the categorical palette", () => {
    for (const seed of ["Sterretjes", "Zonnetjes", "Kikkers", "a", "", "@", "A"]) {
      const color = getCategoricalColor(seed, theme);
      expect(seed ? categorical : [unassigned]).toContain(color);
    }
  });

  it("returns the unassigned color for a falsy seed", () => {
    expect(getCategoricalColor("", theme)).toBe(unassigned);
    expect(getCategoricalColor(null, theme)).toBe(unassigned);
    expect(getCategoricalColor(undefined, theme)).toBe(unassigned);
  });

  it("reproduces the hash the two former call sites used (no color shift)", () => {
    // Single-character seeds hash to their char code, so these pin indexes 0..7
    // exactly as ChildCard.test.tsx does. If the hash is ever "cleaned up",
    // this fails and every existing avatar/group color would have moved.
    const singleChars = ["@", "A", "B", "C", "D", "E", "F", "G"];
    expect(singleChars.map((c) => getCategoricalColor(c, theme))).toEqual([
      categorical[0],
      categorical[1],
      categorical[2],
      categorical[3],
      categorical[4],
      categorical[5],
      categorical[6],
      categorical[7],
    ]);
  });

  it("spreads distinct seeds over more than one hue", () => {
    const seeds = ["Sterretjes", "Zonnetjes", "Kikkers", "Beertjes", "Vlinders", "Konijntjes"];
    expect(new Set(seeds.map((s) => getCategoricalColor(s, theme))).size).toBeGreaterThan(1);
  });
});
