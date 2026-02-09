/**
 * Theme Configuration for ClawdWord
 * Base-specific palette (Base Blue, Cerulean, Base black)
 */

// ============================================================================
// COLOR PALETTE - Base blockchain theme
// ============================================================================

export const colors = {
  // Primary colors (Base brand: black #0a0b0d)
  background: "#0a0b0d",
  foreground: "#ffffff",

  // Base brand colors - Base Blue (#0000ff), Cerulean (#3c8aff)
  baseBlue: "#0000ff",
  baseBlueDark: "#0000cc",
  baseBlueLight: "#3c8aff",
  baseBlueGlow: "#3c8aff",
  // Aliases for components that reference these
  somniaPurple: "#0000ff",
  monadPurple: "#0000ff",
  hackerRed: "#0000ff",
  hackerRedDark: "#0000cc",
  hackerRedLight: "#3c8aff",
  hackerRedGlow: "#3c8aff",

  // UI colors - Dark with Base blue accents
  cardBg: "#0f1114",
  cardBorder: "#1a1d24",
  cardBorderGlow: "#0000ff",
  muted: "#5b616e",
  textSecondary: "#717886",

  // Accents (Base secondary palette)
  cyberBlue: "#3c8aff",
  cyberGreen: "#66c800",
} as const;

// ============================================================================
// RAINBOWKIT THEME CONFIGURATION
// ============================================================================

export const rainbowKitTheme = {
  accentColor: colors.baseBlue,
  accentColorForeground: "white",
  borderRadius: "large" as const,
  fontStack: "system" as const,
  overlayBlur: "small" as const,
} as const;

// ============================================================================
// CSS VARIABLES (for use in globals.css)
// ============================================================================

export const cssVariables = {
  "--background": colors.background,
  "--foreground": colors.foreground,
  "--base-blue": colors.baseBlue,
  "--base-blue-dark": colors.baseBlueDark,
  "--base-blue-light": colors.baseBlueLight,
  "--somnia-purple": colors.somniaPurple,
  "--monad-purple": colors.monadPurple,
  "--hacker-red": colors.hackerRed,
  "--hacker-red-dark": colors.hackerRedDark,
  "--hacker-red-light": colors.hackerRedLight,
  "--hacker-red-glow": colors.hackerRedGlow,
  "--card-bg": colors.cardBg,
  "--card-border": colors.cardBorder,
  "--card-border-glow": colors.cardBorderGlow,
  "--muted": colors.muted,
  "--text-secondary": colors.textSecondary,
  "--cyber-blue": colors.cyberBlue,
  "--cyber-green": colors.cyberGreen,
} as const;

// ============================================================================
// FONT CONFIGURATION
// ============================================================================

export const fonts = {
  mono: {
    family: "JetBrains Mono",
    fallback: "monospace",
    variable: "--font-mono",
  },
  inter: {
    family: "Inter",
    variable: "--font-inter",
  },
} as const;

// ============================================================================
// ANIMATION CONFIGURATION
// ============================================================================

export const animations = {
  fadeIn: {
    duration: "0.5s",
    easing: "ease-out",
  },
  slideIn: {
    duration: "0.3s",
    easing: "ease-out",
  },
} as const;

// ============================================================================
// LAYOUT CONFIGURATION
// ============================================================================

export const layout = {
  navbar: {
    height: "5rem", // pt-20 = 5rem
  },
  backgroundGlow: {
    height: "500px",
    blur: "120px",
    opacity: 0.06, // Base blue glow
  },
} as const;

// ============================================================================
// THEME EXPORT
// ============================================================================

export const theme = {
  colors,
  rainbowKitTheme,
  cssVariables,
  fonts,
  animations,
  layout,
} as const;

export default theme;
