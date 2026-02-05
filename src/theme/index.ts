/**
 * Essential Theme Configuration for Accuracy.Fun
 * 
 * This file contains all theme-related constants and configurations
 * used throughout the application.
 */

// ============================================================================
// COLOR PALETTE
// ============================================================================

export const colors = {
  // Primary colors
  background: "#000000",
  foreground: "#ffffff",
  
  // Brand colors - Red hacker theme
  somniaPurple: "#ff0040", // Bright red
  monadPurple: "#ff0040", // Alias for backward compatibility
  hackerRed: "#ff0040",
  hackerRedDark: "#cc0033",
  hackerRedLight: "#ff3366",
  hackerRedGlow: "#ff0040",
  
  // UI colors - Dark with red accents
  cardBg: "#0a0a0a",
  cardBorder: "#1a0000",
  cardBorderGlow: "#ff0040",
  muted: "#666666",
  textSecondary: "#999999",
  
  // Cyberpunk accents
  cyberBlue: "#00d4ff",
  cyberGreen: "#00ff41",
} as const;

// ============================================================================
// RAINBOWKIT THEME CONFIGURATION
// ============================================================================

export const rainbowKitTheme = {
  accentColor: colors.hackerRed,
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
    opacity: 0.05, // bg-monad-purple/5
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
