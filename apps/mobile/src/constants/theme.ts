export const colors = {
  // Brand
  primary: "#087BFF",
  primaryDark: "#055FCC",
  primaryPressed: "#0669D9",
  primarySoft: "#0D2440",
  primaryWash: "#071A2C",
  accent: "#00D9FF",
  accentSoft: "#082D36",

  // Foundations
  background: "#050A10",
  surface: "#091522",
  surfaceAlt: "#0D1B2A",
  surfaceRaised: "#102235",
  surfaceDark: "#03080E",
  surfaceDarkRaised: "#0A1724",

  // Typography
  text: "#F5F9FC",
  textSecondary: "#91A3B5",
  textMuted: "#66798C",
  textLight: "#F5F9FC",
  textLightMuted: "#A9B8C7",
  textInverse: "#050A10",

  // Structure
  border: "#172636",
  borderStrong: "#24405B",
  divider: "#132231",

  // Semantic
  success: "#20D795",
  successSoft: "#0A2D23",
  danger: "#FF5364",
  dangerSoft: "#35161C",
  warning: "#FFB547",
  warningSoft: "#352814",
  info: "#4DA3FF",
  infoSoft: "#102A45",
  violet: "#8B7CFF",
  violetSoft: "#211D45",

  // Effects
  glowBlue: "rgba(8, 123, 255, 0.30)",
  glowCyan: "rgba(0, 217, 255, 0.24)",
  overlay: "rgba(2, 8, 14, 0.72)",
};

export const gradients = {
  brand: ["#087BFF", "#00D9FF"] as const,
  brandDeep: ["#075EC7", "#00A9CF"] as const,
  surface: ["#102235", "#091522"] as const,
};

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  base: 12,
  md: 16,
  ml: 20,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 48,
};

export const radius = {
  sm: 8,
  md: 14,
  lg: 18,
  xl: 24,
  xxl: 28,
  full: 999,
};

export const typography = {
  display: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "800" as const,
    letterSpacing: -1.1,
  },
  title: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "800" as const,
    letterSpacing: -0.6,
  },
  heading: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "800" as const,
    letterSpacing: -0.35,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "500" as const,
  },
  label: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700" as const,
  },
  caption: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "600" as const,
  },
};

export const shadows = {
  soft: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 4,
  },
  raised: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.26,
    shadowRadius: 28,
    elevation: 9,
  },
  glow: {
    shadowColor: "#087BFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.32,
    shadowRadius: 18,
    elevation: 8,
  },
};

export const motion = {
  fast: 160,
  normal: 220,
  slow: 320,
  splash: 680,
  pressScale: 0.97,
};

export const layout = {
  screenPadding: 20,
  sectionGap: 28,
  cardGap: 12,
  tabBarHeight: 78,
  maxContentWidth: 720,
};