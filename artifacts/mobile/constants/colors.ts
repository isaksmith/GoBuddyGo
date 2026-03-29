export const Colors = {
  primary: "#F4633A",
  primaryLight: "#FF8A65",
  primaryDark: "#D94E28",
  secondary: "#F5C518",
  accent: "#3ECF8E",
  accentBlue: "#4FC3F7",
  danger: "#EF476F",

  background: "#1A1A1A",
  backgroundCard: "#2A2A2A",
  backgroundMid: "#1C1C1C",
  backgroundDeep: "#141414",

  text: "#FFFFFF",
  textSecondary: "#CCCCCC",
  textMuted: "#777777",

  border: "#3A3A3A",
  borderLight: "#4A4A4A",
  borderGlow: "#F4633A",

  success: "#3ECF8E",
  warning: "#F5C518",

  tabBarBg: "#141414",
  tabBarActive: "#F4633A",
  tabBarInactive: "#666666",

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
