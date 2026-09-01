/**
 * Pavira Signature - Centralized Theme Color Constants
 * 
 * All color values from the new dark emerald/gold luxury theme
 * Reference: DESIGN_SYSTEM.md
 * 
 * Usage:
 * import { THEME_COLORS } from '@/lib/themeColors';
 * className={`bg-[${THEME_COLORS.PRIMARY_BG}]`}
 */

export const THEME_COLORS = {
  // Primary Backgrounds
  PRIMARY_BG: "#0B3B2E", // Deep Emerald - Main full-bleed sections
  SURFACE_BG: "#112F24", // Surface Emerald - Cards, panels, dropdowns
  DARK_SURFACE_BG: "#07271F", // Deep Background - Footer, deep elements

  // Text Colors
  TEXT_PRIMARY: "#F5F0E6", // Warm Beige - Headings, main text
  TEXT_SECONDARY: "rgba(245,240,230,0.7)", // Muted Beige - Helper text, subtitles
  TEXT_SECONDARY_ALT: "#F9F6F0", // Ivory - Alternative text (for compatibility)

  // Accent & Interactive
  ACCENT_GOLD: "#D4AF37", // Muted Gold - Buttons, icons, highlights, borders
  ACCENT_GOLD_LIGHT: "#D4AF37", // Same as above - Used for light variations

  // System Colors
  SUCCESS: "#2E8B57", // Soft Teal - Success messages, completed states
  WARNING: "#F5A623", // Orange - Warnings, alerts, pending states
  ERROR: "#D32F2F", // Red - Form errors, destructive actions

  // Legacy Support (for backward compatibility with existing code)
  FOREST_GREEN: "#0C3A2E", // Deep Forest Green - From old theme, similar to PRIMARY_BG
  IVORY_LIGHT: "#F9F6F0", // Warm Ivory - From old theme, similar to TEXT_PRIMARY
  ALMOST_BLACK: "#1A1A1A", // Almost Black - From old theme

  // Utility Colors
  BORDER_LIGHT: "rgba(212,175,55,0.15)", // Gold with low opacity - Subtle borders
  BORDER_MEDIUM: "rgba(212,175,55,0.3)", // Gold with medium opacity - Card borders
  BORDER_STRONG: "rgba(212,175,55,0.6)", // Gold with high opacity - Focus states

  // Glass/Backdrop Colors
  GLASS_BG_LIGHT: "rgba(17,47,36,0.65)", // Surface with 65% opacity - Light glassmorphism
  GLASS_BG_MEDIUM: "rgba(11,59,46,0.85)", // Primary with 85% opacity - Medium glassmorphism
  GLASS_BG_DARK: "rgba(11,59,46,0.95)", // Primary with 95% opacity - Dark glassmorphism

  // Shadow Colors
  SHADOW_GOLD_SUBTLE: "rgba(212,175,55,0.15)", // Subtle gold shadow
  SHADOW_GOLD_GLOW: "rgba(212,175,55,0.3)", // Luxury glow shadow
  SHADOW_GOLD_INTENSE: "rgba(212,175,55,0.5)", // Intense glow shadow
} as const;

/**
 * Tailwind Class Presets for Common Component Styles
 */
export const TAILWIND_PRESETS = {
  // Card Glassmorphism
  CARD_GLASS: "bg-[#112F24]/65 backdrop-blur-xl border border-[#D4AF37]/15",

  // Drawer/Modal Glassmorphism
  DRAWER_GLASS: "bg-[#0B3B2E]/95 backdrop-blur-2xl border border-[#D4AF37]/20",

  // Input Styling
  INPUT_BASE: "bg-[#112F24]/50 border border-[#D4AF37]/20 text-[#F5F0E6] rounded-full",
  INPUT_FOCUS: "focus:border-[#D4AF37]/60 focus:ring-1 focus:ring-[#D4AF37]/30",

  // Button Styling
  BUTTON_PRIMARY: "bg-[#D4AF37] text-[#0B3B2E] rounded-full font-semibold tracking-wide uppercase",
  BUTTON_PRIMARY_HOVER: "hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:-translate-y-0.5",

  BUTTON_SECONDARY: "border border-[#D4AF37]/50 text-[#D4AF37] rounded-full font-semibold tracking-wide",
  BUTTON_SECONDARY_HOVER: "hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]",

  // Text Styling
  HEADING_LARGE: "text-4xl font-serif font-bold text-[#F5F0E6] tracking-tight",
  HEADING_MEDIUM: "text-2xl font-serif font-bold text-[#F5F0E6]",
  HEADING_SMALL: "text-lg font-serif font-bold text-[#F5F0E6]",

  BODY_TEXT: "text-base text-[#F5F0E6]/90 font-sans",
  BODY_TEXT_MUTED: "text-sm text-[#F5F0E6]/70 font-sans",

  // Section Styling
  SECTION_HERO: "bg-[#0B3B2E] min-h-screen flex items-center justify-center",
  SECTION_DARK: "bg-[#07271F] py-20",
  SECTION_LIGHT: "bg-[#112F24] py-20",

  // Accent Elements
  ACCENT_TEXT: "text-[#D4AF37]",
  ACCENT_BORDER: "border-[#D4AF37]",
  ACCENT_HIGHLIGHT: "bg-[#D4AF37]/10",
} as const;

/**
 * Responsive Spacing Scale (multiples of 4px)
 */
export const SPACING = {
  xs: "4px", // space-1
  sm: "8px", // space-2
  md: "16px", // space-4
  lg: "24px", // space-6
  xl: "32px", // space-8
  xxl: "48px", // space-12
  xxxl: "80px", // space-20
  huge: "128px", // space-32
} as const;

/**
 * Border Radius Scale
 */
export const BORDER_RADIUS = {
  small: "8px", // rounded-lg
  medium: "16px", // rounded-2xl
  large: "24px", // rounded-3xl
  full: "9999px", // rounded-full
} as const;

/**
 * Animation Durations (ms)
 */
export const ANIMATION = {
  FAST: 150,
  BASE: 300,
  SLOW: 500,
  SLOWER: 700,
} as const;

/**
 * Z-Index Scale
 */
export const Z_INDEX = {
  BASE: 0,
  DROPDOWN: 40,
  STICKY: 50,
  FIXED: 50,
  MODAL_BACKDROP: 90,
  MODAL: 100,
  POPOVER: 110,
  TOOLTIP: 120,
  NOTIFICATION: 9999,
} as const;

/**
 * Shadow Definitions
 */
export const SHADOWS = {
  SM: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  BASE: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
  MD: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  LG: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  XL: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  GOLD_GLOW: "0 0 20px rgba(212,175,55,0.15)",
  GOLD_GLOW_INTENSE: "0 0 30px rgba(212,175,55,0.3)",
  GOLD_GLOW_MAX: "0 0 50px rgba(212,175,55,0.3)",
} as const;

export default THEME_COLORS;
