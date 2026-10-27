import { Appearance, StyleSheet } from "react-native";

// VigilTech palettes (see brand/vigiltech/tokens.json). Every text/background
// pair below is checked by scripts/check-contrast.mjs (>= 4.5:1, or 3:1 for
// non-text UI such as switch tracks and large text).
export type Scheme = "light" | "dark";
export const palettes = {
  light: {
    red: "#a8003a", // accent for text, icons, links (Pink 700)
    primary: "#d6004a", // button and FAB fill (Pink 600)
    primaryPressed: "#a8003a",
    onPrimary: "#ffffff",
    black: "#f6f1f4", // screen background (Bone)
    card: "#fffbfd", // raised surface (Paper)
    border: "#cdbfc8",
    white: "#17101a", // primary text (Ink)
    muted: "#6b5d68", // secondary text (Graphite)
    error: "#b4002f",
    hero: "#fff0f5",
    mine: "#ffd6e4", // own chat bubble
    theirs: "#fffbfd",
    onMine: "#17101a",
    disabledBg: "#e6dce2",
    disabledText: "#5f525c",
    barBg: "#fffbfd",
  },
  dark: {
    red: "#ff4d86", // Pink 400
    primary: "#d6004a",
    primaryPressed: "#a8003a",
    onPrimary: "#ffffff",
    black: "#120a14", // Night
    card: "#1e1422", // Night Raised
    border: "#4a3a52",
    white: "#f6f1f4", // Bone
    muted: "#b9aab5",
    error: "#ff8aa8",
    hero: "#2a1330",
    mine: "#5a1233",
    theirs: "#1e1422",
    onMine: "#fff0f5",
    disabledBg: "#2b2030",
    disabledText: "#a698a3",
    barBg: "#1a1020",
  },
} as const;
export type Palette = { [K in keyof (typeof palettes)["light"]]: string };

// `colors` and `styles` keep their identity; applyScheme() rewrites them in
// place so every existing import follows the system light/dark setting.
export const colors: Palette = { ...palettes.light };
export const styles: Record<string, any> = {};
let current: Scheme | null = null;

const build = (c: Palette) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.black },
  content: { padding: 20, gap: 16 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  spread: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { color: c.white, fontSize: 28, fontWeight: "800" },
  text: { color: c.white, fontSize: 16, lineHeight: 24 },
  muted: { color: c.muted, fontSize: 14, lineHeight: 21 },
  label: { color: c.white, fontSize: 15, fontWeight: "700" },
  input: {
    backgroundColor: c.card,
    color: c.white,
    borderColor: c.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
  },
  button: {
    borderRadius: 12,
    backgroundColor: c.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  secondary: {
    backgroundColor: c.card,
    borderColor: c.border,
    borderWidth: 1,
  },
  buttonDisabled: { backgroundColor: c.disabledBg, borderColor: c.border, borderWidth: 1 },
  buttonTextDisabled: { color: c.disabledText },
  buttonText: { color: c.onPrimary, fontWeight: "700", fontSize: 15 },
  card: {
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
    gap: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: c.card,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
    backgroundColor: c.barBg,
  },
  badge: { color: c.red, fontWeight: "700" },
  error: { color: c.error, fontSize: 14, lineHeight: 21 },
  empty: { padding: 32, alignItems: "center", gap: 12 },
  hero: { backgroundColor: c.hero, padding: 24, gap: 12 },
  logo: {
    width: 44,
    height: 44,
    backgroundColor: c.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: 12,
    gap: 8,
    paddingVertical: 10,
  },
  bar: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: c.border,
    backgroundColor: c.barBg,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 88,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: c.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});

export function applyScheme(scheme?: string | null) {
  const next: Scheme = scheme === "dark" ? "dark" : "light";
  if (next === current) return next;
  current = next;
  Object.assign(colors, palettes[next]);
  Object.assign(styles, build(colors));
  return next;
}
export const currentScheme = (): Scheme => current ?? "light";
applyScheme(Appearance.getColorScheme());
