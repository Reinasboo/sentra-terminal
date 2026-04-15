/**
 * SENTRA TERMINAL - Design System
 * Premium dark theme trading analytics platform
 */

// COLOR PALETTE
export const colors = {
  // Background
  background: {
    primary: "#0B0F1A",
    secondary: "#0F1219",
    surface: "#111827",
    elevated: "#1F2937",
  },

  // Text
  text: {
    primary: "#E5E7EB",
    secondary: "#9CA3AF",
    tertiary: "#6B7280",
    inverse: "#0B0F1A",
  },

  // Accents
  accent: {
    blue: "#3B82F6",
    purple: "#8B5CF6",
    cyan: "#06B6D4",
    green: "#22C55E",
    red: "#EF4444",
    amber: "#F59E0B",
    pink: "#EC4899",
  },

  // Status
  status: {
    success: "#22C55E",
    danger: "#EF4444",
    warning: "#F59E0B",
    info: "#06B6D4",
  },

  // Borders
  border: {
    light: "#2D3748",
    medium: "#374151",
    dark: "#1F2937",
  },

  // Gradients
  gradients: {
    blueGlow:
      "linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0))",
    purpleGlow:
      "linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0))",
    successGlow:
      "linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0))",
    dangerGlow:
      "linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0))",
  },
} as const;

// TYPOGRAPHY
export const typography = {
  fontStacks: {
    sans: 'var(--font-inter)',
    mono: 'var(--font-ibm-plex)',
  },
  sizes: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
  },
  weights: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
} as const;

// SPACING (8px grid system)
export const spacing = {
  xs: "0.5rem",   // 8px
  sm: "0.75rem",  // 12px
  md: "1rem",     // 16px
  lg: "1.5rem",   // 24px
  xl: "2rem",     // 32px
  "2xl": "3rem",  // 48px
  "3xl": "4rem",  // 64px
} as const;

// BORDER RADIUS
export const borderRadius = {
  sm: "4px",
  md: "8px",
  lg: "12px",
  xl: "16px",
  full: "9999px",
} as const;

// SHADOWS & ELEVATIONS
export const shadows = {
  none: "none",
  elevation1: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  elevation2: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  elevation3: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
  elevation4: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
  glowBlue: "0 0 20px rgba(59, 130, 246, 0.4)",
  glowGreen: "0 0 20px rgba(34, 197, 94, 0.4)",
  glowRed: "0 0 20px rgba(239, 68, 68, 0.4)",
} as const;

// Z-INDEX SCALE
export const zIndex = {
  hide: -1,
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  backdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const;

// BREAKPOINTS
export const breakpoints = {
  xs: "0px",
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

// ANIMATION DURATIONS
export const durations = {
  fast: "150ms",
  base: "250ms",
  slow: "350ms",
  slower: "500ms",
  slowest: "750ms",
} as const;

// ANIMATION EASING
export const easing = {
  in: "cubic-bezier(0.4, 0, 1, 1)",
  out: "cubic-bezier(0, 0, 0.2, 1)",
  inOut: "cubic-bezier(0.4, 0, 0.2, 1)",
  sharp: "cubic-bezier(0.4, 0, 0.6, 1)",
} as const;

// COMPONENT SIZES
export const componentSizes = {
  sidebarWidth: "280px",
  sidebarWidthCollapsed: "80px",
  headerHeight: "64px",
  gridGap: "16px",
} as const;

// LAYOUT
export const layout = {
  maxWidth: "1920px",
  contentPadding: "24px",
  cornerRadius: "12px",
} as const;

// SHARED STYLES
export const styles = {
  // Glass effect
  glass: {
    backgroundColor: "rgba(17, 24, 39, 0.4)",
    backdropFilter: "blur(8px)",
    border: "1px solid rgba(45, 55, 72, 0.5)",
  },

  // Smooth transition
  transition: "all 250ms cubic-bezier(0.4, 0, 0.2, 1)",

  // Focus visible
  focusRing: "outline-none ring-2 ring-offset-2 ring-offset-dark-bg ring-accent-blue",

  // Disable scrollbar
  hideScrollbar: `
    -ms-overflow-style: none;
    scrollbar-width: none;
    &::-webkit-scrollbar {
      display: none;
    }
  `,
} as const;

// FINANCIAL FORMATTING
export const financial = {
  // Tabular numbers for alignment
  tabularNums: {
    fontVariantNumeric: "tabular-nums",
    fontFamily: 'var(--font-ibm-plex)',
  },
  
  // Number formatting utilities
  formatPrice: (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  },

  formatPercent: (value: number) => {
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(2)}%`;
  },

  formatNumber: (value: number, decimals = 2) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  },
} as const;

// RESPONSIVE UTILITIES
export const responsive = {
  // Mobile first approach
  container: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
  grid: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
  flex: "flex flex-col md:flex-row gap-4",
} as const;

export type ColorKey = keyof typeof colors;
export type TypographyKey = keyof typeof typography;
export type SpacingKey = keyof typeof spacing;
