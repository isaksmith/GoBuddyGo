export const Colors = {
  primary: "#F4633A",
  primaryLight: "#FF8A65",
  primaryDark: "#D94E28",
  secondary: "#F5C518",
  accent: "#3ECF8E",
  accentBlue: "#4FC3F7",
  danger: "#EF476F",

  background: "#0D2035",
  backgroundCard: "#112840",
  backgroundMid: "#0F2030",
  backgroundDeep: "#09192A",

  text: "#FFFFFF",
  textSecondary: "#B8D4EC",
  textMuted: "#5A7A96",

  border: "#1A3A5C",
  borderLight: "#255075",
  borderGlow: "#F4633A",

  success: "#3ECF8E",
  warning: "#F5C518",

  tabBarBg: "#09192A",
  tabBarActive: "#F4633A",
  tabBarInactive: "#4A7090",

  glowOrange: "#F4633A",
  glowGold: "#F5C518",
  glowTeal: "#3ECF8E",
  glowBlue: "#4FC3F7",
};

export type GlowShadow = {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
};

export const GlowShadows: Record<string, GlowShadow> = {
  orange: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 14,
    elevation: 10,
  },
  gold: {
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 14,
    elevation: 10,
  },
  teal: {
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.65,
    shadowRadius: 12,
    elevation: 8,
  },
  blue: {
    shadowColor: Colors.accentBlue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  strong: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.65,
    shadowRadius: 18,
    elevation: 14,
  },
};

export default Colors;
