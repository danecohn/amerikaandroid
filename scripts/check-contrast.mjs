// Contrast audit for src/theme.ts palettes (WCAG 2.x). Run: node scripts/check-contrast.mjs
import { readFileSync } from "node:fs";
const src = readFileSync(new URL("../src/theme.ts", import.meta.url), "utf8");
const pal = {};
for (const m of src.matchAll(/^  (light|dark): \{([\s\S]*?)^  \},/gm)) {
  pal[m[1]] = Object.fromEntries([...m[2].matchAll(/(\w+): "(#[0-9a-fA-F]{6})"/g)].map((x) => [x[1], x[2]]));
}
const lum = (h) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
// [foreground, background, minimum, label]
const pairs = [
  ["white", "black", 4.5, "body text on screen"], ["white", "card", 4.5, "text on card/input"],
  ["muted", "black", 4.5, "secondary text on screen"], ["muted", "card", 4.5, "secondary text on card/input/placeholder"],
  ["muted", "barBg", 4.5, "tab label / header secondary"], ["white", "barBg", 4.5, "active tab / header title"],
  ["white", "hero", 4.5, "hero text"], ["muted", "hero", 4.5, "hero secondary"],
  ["red", "black", 4.5, "accent text/icons on screen"], ["red", "card", 4.5, "accent on card"], ["red", "barBg", 4.5, "accent on bar"],
  ["red", "hero", 4.5, "accent on hero"],
  ["onPrimary", "primary", 4.5, "button label"], ["onPrimary", "primaryPressed", 4.5, "button label pressed"],
  ["white", "border", 4.5, "secondary button label pressed"],
  ["disabledText", "disabledBg", 4.5, "disabled button label"],
  ["error", "black", 4.5, "error on screen"], ["error", "card", 4.5, "error on card"], ["error", "hero", 4.5, "error on hero"],
  ["white", "mine", 4.5, "own bubble (default text)"], ["onMine", "mine", 4.5, "own bubble text"],
  ["white", "theirs", 4.5, "other bubble text"],
  ["primary", "black", 3, "FAB/switch track vs screen (non-text)"], ["border", "black", 1.2, "hairline vs screen (decorative)"],
  ["primary", "barBg", 3, "FAB vs bar (non-text)"],
];
let bad = 0;
for (const t of ["light", "dark"]) {
  console.log(`\n${t}`);
  for (const [f, b, min, label] of pairs) {
    const r = ratio(pal[t][f], pal[t][b]); const ok = r >= min; if (!ok) bad++;
    console.log(`${ok ? "PASS" : "FAIL"} ${r.toFixed(2).padStart(5)} (>=${min}) ${label}  ${pal[t][f]} on ${pal[t][b]}`);
  }
}
console.log(bad ? `\n${bad} FAILED` : "\nall pairs pass");
process.exit(bad ? 1 : 0);
