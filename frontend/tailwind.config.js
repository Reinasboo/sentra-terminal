/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Premium dark palette - optimized for 24/7 traders
        bg: {
          primary: "#0A0E27",     // Navy-black main background
          secondary: "#1A1F3A",   // Card/panel backgrounds
          tertiary: "#0F1319",    // Subtle variation
          elevated: "#232D47",    // Elevated surface
        },
        text: {
          primary: "#F5F7FA",     // High contrast primary text
          secondary: "#A0AEC0",   // Supporting text
          tertiary: "#6B7280",    // Tertiary text
          muted: "#4B5563",       // Muted text
        },
        // Premium brand colors
        brand: {
          blue: "#0066FF",        // Deep cyber blue - trust, data, precision
          purple: "#7C3AED",      // Electric purple - intelligence, power
          green: "#00FF88",       // Neon green - positive, gains, buy signals
          orange: "#FF6B35",      // Hot orange - liquidations, risks
          red: "#FF1744",         // Neon red - losses, sell signals
        },
        // Legacy accent colors (maintained for compatibility)
        accent: {
          primary: "#0066FF",     // Primary blue
          secondary: "#7C3AED",   // Purple
          success: "#00FF88",     // Neon green
          danger: "#FF1744",      // Neon red
          warning: "#FF6B35",     // Hot orange
          info: "#06B6D4",        // Cyan
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)"],
        mono: ["var(--font-ibm-plex)"],
      },
      fontSize: {
        // Typography scale
        xs: ["0.75rem", { lineHeight: "1rem", fontWeight: "400" }],
        sm: ["0.875rem", { lineHeight: "1.25rem", fontWeight: "400" }],
        base: ["1rem", { lineHeight: "1.5rem", fontWeight: "400" }],
        lg: ["1.125rem", { lineHeight: "1.75rem", fontWeight: "400" }],
        xl: ["1.25rem", { lineHeight: "1.75rem", fontWeight: "600" }],
        "2xl": ["1.5rem", { lineHeight: "2rem", fontWeight: "600" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem", fontWeight: "700" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem", fontWeight: "700" }],
      },
      spacing: {
        // 8px grid system
        1: "0.25rem",    // 4px
        2: "0.5rem",     // 8px
        3: "0.75rem",    // 12px
        4: "1rem",       // 16px
        5: "1.25rem",    // 20px
        6: "1.5rem",     // 24px
        8: "2rem",       // 32px
        10: "2.5rem",    // 40px
        12: "3rem",      // 48px
        16: "4rem",      // 64px
        20: "5rem",      // 80px
        24: "6rem",      // 96px
      },
      borderRadius: {
        none: "0",
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "20px",
        full: "9999px",
      },
      borderColor: {
        DEFAULT: "rgba(255, 255, 255, 0.1)",
        light: "rgba(255, 255, 255, 0.2)",
      },
      backdropBlur: {
        xs: "2px",
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
      },
      boxShadow: {
        // Glassmorphism shadows
        "glass-sm": "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
        "glass-md": "0 8px 32px 0 rgba(31, 38, 135, 0.47)",
        "glass-lg": "0 8px 32px 0 rgba(31, 38, 135, 0.57)",
        
        // Elevation shadows
        "elevation-1": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        "elevation-2": "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        "elevation-3": "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
        "elevation-4": "0 20px 25px -5px rgba(0, 0, 0, 0.25)",
        
        // Glow shadows
        "glow-blue": "0 0 20px rgba(0, 102, 255, 0.4), 0 0 40px rgba(0, 102, 255, 0.2)",
        "glow-blue-lg": "0 0 30px rgba(0, 102, 255, 0.5), 0 0 60px rgba(0, 102, 255, 0.3)",
        "glow-purple": "0 0 20px rgba(124, 58, 237, 0.4), 0 0 40px rgba(124, 58, 237, 0.2)",
        "glow-green": "0 0 20px rgba(0, 255, 136, 0.4), 0 0 40px rgba(0, 255, 136, 0.2)",
        "glow-green-lg": "0 0 30px rgba(0, 255, 136, 0.6), 0 0 60px rgba(0, 255, 136, 0.3)",
        "glow-orange": "0 0 20px rgba(255, 107, 53, 0.4), 0 0 40px rgba(255, 107, 53, 0.2)",
        "glow-red": "0 0 20px rgba(255, 23, 68, 0.4), 0 0 40px rgba(255, 23, 68, 0.2)",
        "glow-red-lg": "0 0 30px rgba(255, 23, 68, 0.6), 0 0 60px rgba(255, 23, 68, 0.3)",
      },
      animation: {
        // Glow effects
        "pulse-glow": "pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow-pulse-blue": "glow-pulse-blue 2s ease-in-out infinite",
        "glow-pulse-green": "glow-pulse-green 2s ease-in-out infinite",
        "glow-pulse-red": "glow-pulse-red 2s ease-in-out infinite",
        
        // Number animations
        "count-up": "count-up 0.5s ease-out",
        "count-down": "count-down 0.5s ease-out",
        "flip-number": "flip-number 0.6s ease-out",
        
        // Entrance animations
        "slide-in-left": "slide-in-left 0.3s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "slide-in-up": "slide-in-up 0.3s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "scale-in": "scale-in 0.3s ease-out",
        "slide-in-stagger": "slide-in-left 0.4s ease-out",
        
        // Attention animations
        "bounce-subtle": "bounce-subtle 1s ease-in-out infinite",
        "shake-warning": "shake-warning 0.4s ease-in-out",
        "wobble": "wobble 0.5s ease-in-out",
        "pulse-badge": "pulse-badge 1.5s ease-in-out infinite",
        
        // Interactive effects
        "hover-lift": "hover-lift 0.2s ease-out forwards",
        "button-pulse": "button-pulse 0.6s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        // Glow animations
        "glow-pulse-blue": {
          "0%, 100%": { 
            boxShadow: "0 0 20px rgba(0, 102, 255, 0.3), 0 0 40px rgba(0, 102, 255, 0.1)" 
          },
          "50%": { 
            boxShadow: "0 0 30px rgba(0, 102, 255, 0.5), 0 0 60px rgba(0, 102, 255, 0.2)" 
          },
        },
        "glow-pulse-green": {
          "0%, 100%": { 
            boxShadow: "0 0 20px rgba(0, 255, 136, 0.3), 0 0 40px rgba(0, 255, 136, 0.1)" 
          },
          "50%": { 
            boxShadow: "0 0 30px rgba(0, 255, 136, 0.5), 0 0 60px rgba(0, 255, 136, 0.2)" 
          },
        },
        "glow-pulse-red": {
          "0%, 100%": { 
            boxShadow: "0 0 20px rgba(255, 23, 68, 0.3), 0 0 40px rgba(255, 23, 68, 0.1)" 
          },
          "50%": { 
            boxShadow: "0 0 30px rgba(255, 23, 68, 0.5), 0 0 60px rgba(255, 23, 68, 0.2)" 
          },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        
        // Number animations
        "count-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "count-down": {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "flip-number": {
          "0%": { opacity: "0", transform: "rotateX(90deg)" },
          "100%": { opacity: "1", transform: "rotateX(0deg)" },
        },
        
        // Entrance animations
        "slide-in-left": {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        
        // Attention animations
        "bounce-subtle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
        "shake-warning": {
          "0%, 100%": { transform: "translateX(0)" },
          "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-2px)" },
          "20%, 40%, 60%, 80%": { transform: "translateX(2px)" },
        },
        "wobble": {
          "0%, 100%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(-1deg)" },
          "75%": { transform: "rotate(1deg)" },
        },
        "pulse-badge": {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.05)", opacity: "0.8" },
        },
        
        // Interactive
        "hover-lift": {
          "0%": { transform: "translateY(0), shadow", opacity: "1" },
          "100%": { transform: "translateY(-8px)", opacity: "1" },
        },
        "button-pulse": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(0, 102, 255, 0.7)" },
          "50%": { boxShadow: "0 0 0 10px rgba(0, 102, 255, 0)" },
        },
      },

      transitionDuration: {
        "250": "250ms",
        "350": "350ms",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
