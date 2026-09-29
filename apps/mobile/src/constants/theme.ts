export const colors = {
  // LEURET — Beacon Dusk
  primary: "#1E2A3A",
  primaryDark: "#151E2B",
  primaryPressed: "#2A394D",
  primarySoft: "#DCE3E9",
  primaryWash: "#EEF1F3",

  // Signature accent
  accent: "#E23D3D",
  accentPressed: "#C83232",
  accentSoft: "#F9E5E3",

  // Secondary brand colors
  steel: "#8FA3B8",
  steelSoft: "#E6EBF0",

  sand: "#C9B08D",
  sandSoft: "#F2EADF",

  cream: "#F6F1E7",

  // Foundations
  background: "#F6F1E7",
  surface: "#FFFDF9",
  surfaceAlt: "#EFE9DE",
  surfaceRaised: "#FFFFFF",

  // Dark surfaces
  surfaceDark: "#1E2A3A",
  surfaceDarkRaised: "#29384B",

  // Typography
  text: "#1E2A3A",
  textSecondary: "#5E6D7D",
  textMuted: "#8FA3B8",

  textLight: "#F6F1E7",
  textLightMuted: "#C7D0D8",
  textInverse: "#FFFFFF",

  // Structure
  border: "#DDD8CF",
  borderStrong: "#CBC4B8",
  divider: "#E7E1D7",

  // Semantic
  success: "#6E9C86",
  successSoft: "#E5EFE9",

  danger: "#E23D3D",
  dangerSoft: "#F9E5E3",

  warning: "#C9B08D",
  warningSoft: "#F4EDE3",

  info: "#8FA3B8",
  infoSoft: "#E6EBF0",

  violet: "#9991A7",
  violetSoft: "#EEEBF1",

  // Exact brand palette references
  beaconRed: "#E23D3D",
  beaconCream: "#F6F1E7",
  beaconNavy: "#1E2A3A",
  beaconSteel: "#8FA3B8",
  beaconSand: "#C9B08D",

  // Effects
  glowAccent: "rgba(226, 61, 61, 0.16)",
  glowBlue: "rgba(30, 42, 58, 0.14)",
  glowSoft: "rgba(143, 163, 184, 0.20)",

  // Temporary compatibility alias
  glowCyan: "rgba(143, 163, 184, 0.20)",

  overlay: "rgba(30, 42, 58, 0.38)",
};

export const gradients = {
  brand: ["#1E2A3A", "#8FA3B8"] as const,
  accent: ["#E23D3D", "#C9B08D"] as const,
  brandSoft: ["#8FA3B8", "#C9B08D"] as const,
  surface: ["#FFFDF9", "#F6F1E7"] as const,
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
    shadowColor: "#1E2A3A",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.06,
    shadowRadius: 15,
    elevation: 3,
  },

  raised: {
    shadowColor: "#1E2A3A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.10,
    shadowRadius: 24,
    elevation: 6,
  },

  glow: {
    shadowColor: "#E23D3D",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 5,
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