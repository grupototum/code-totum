import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      /* ============================================================
         FONTS - Design System Exact
         Manrope for headings, Inter for body, Space Mono for labels
         ============================================================ */
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        manrope: ["Manrope", "Inter", "-apple-system", "sans-serif"],
        mono: ["Space Mono", "SF Mono", "Monaco", "Inconsolata", "Fira Code", "monospace"],
      },
      
      /* ============================================================
         COLORS - Design System Exact
         ============================================================ */
      colors: {
        // Brand colors
        brand: {
          red: "#ef233c",
          "red-dark": "#dc2626",
          "red-light": "#f87171",
        },
        
        // Zinc scale exact
        zinc: {
          50: "#fafafa",
          100: "#f4f4f5",
          200: "#e4e4e7",
          300: "#d4d4d8",
          400: "#a1a1aa",
          500: "#71717a",
          600: "#52525b",
          700: "#3f3f46",
          800: "#27272a",
          900: "#18181b",
          950: "#09090b",
        },
        
        // Shadcn UI semantic colors (mapped to DS)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        surface: {
          DEFAULT: "hsl(var(--surface))",
          container: "hsl(var(--surface-container))",
          high: "hsl(var(--surface-container-high))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      
      /* ============================================================
         FONT SIZES - Design System Exact
         ============================================================ */
      fontSize: {
        // Headings
        'h1': ['96px', { lineHeight: '1.1', letterSpacing: '-0.05em' }],
        'h2': ['60px', { lineHeight: '1.1', letterSpacing: '-0.05em' }],
        'h3': ['24px', { lineHeight: '1.25', letterSpacing: '-0.025em' }],
        'h4': ['18px', { lineHeight: '1.25', letterSpacing: '-0.025em' }],
        // Body
        'body-lg': ['18px', { lineHeight: '1.625' }],
        'body': ['14px', { lineHeight: '1.625' }],
        'body-sm': ['12px', { lineHeight: '1.5' }],
        // Labels
        'label-lg': ['15px', { lineHeight: '1.5', letterSpacing: '0.025em' }],
        'label-md': ['12px', { lineHeight: '1.5', letterSpacing: '0.025em' }],
        'label-sm': ['11px', { lineHeight: '1.5', letterSpacing: '0.1em' }],
        'mono': ['10px', { lineHeight: '1.5', letterSpacing: '0.1em' }],
      },
      
      /* ============================================================
         LETTER SPACING - Design System Exact
         ============================================================ */
      letterSpacing: {
        tighter: "-0.05em",
        tight: "-0.025em",
        normal: "0",
        wide: "0.025em",
        wider: "0.05em",
        widest: "0.1em",
      },
      
      /* ============================================================
         BORDER RADIUS - Design System Exact (mostly 0)
         ============================================================ */
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      
      /* ============================================================
         ANIMATIONS - Design System Exact
         ============================================================ */
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        
        // fadeSlideIn - Main entrance animation
        "fade-slide-in": {
          "0%": { 
            opacity: "0", 
            transform: "translateY(30px)",
            filter: "blur(8px)"
          },
          "100%": { 
            opacity: "1", 
            transform: "translateY(0)",
            filter: "blur(0px)"
          },
        },
        
        // Column reveal
        "column-reveal": {
          "0%": {
            clipPath: "inset(0 0 100% 0)",
            opacity: "0",
          },
          "100%": {
            clipPath: "inset(0 0 0% 0)",
            opacity: "1",
          },
        },
        
        // Navigation load
        "nav-load": {
          from: { 
            opacity: "0", 
            transform: "translateY(-10px)" 
          },
          to: { 
            opacity: "1", 
            transform: "translateY(0)" 
          },
        },
        
        // Spin for borders
        spin: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        
        // Pulse
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
      
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        
        // fadeSlideIn with delays
        "fade-slide-in": "fade-slide-in 1s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-slide-in-800": "fade-slide-in 1s cubic-bezier(0.16, 1, 0.3, 1) 0.8s forwards",
        "fade-slide-in-1000": "fade-slide-in 1s cubic-bezier(0.16, 1, 0.3, 1) 1s forwards",
        "fade-slide-in-1200": "fade-slide-in 1s cubic-bezier(0.16, 1, 0.3, 1) 1.2s forwards",
        "fade-slide-in-1400": "fade-slide-in 1s cubic-bezier(0.16, 1, 0.3, 1) 1.4s forwards",
        
        // Column reveal
        "column-reveal": "column-reveal 1.4s cubic-bezier(0.16, 1, 0.3, 1) backwards",
        
        // Nav load
        "nav-load": "nav-load 0.8s ease-out forwards",
        
        // Spin
        "spin": "spin 4s linear infinite",
        "spin-slow": "spin 3s linear infinite",
        
        // Pulse
        "pulse": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      
      /* ============================================================
         TRANSITION TIMING FUNCTIONS
         ============================================================ */
      transitionTimingFunction: {
        "ds-reveal": "cubic-bezier(0.16, 1, 0.3, 1)",
        "ds-smooth": "cubic-bezier(0.25, 1, 0.5, 1)",
      },
      
      /* ============================================================
         MAX WIDTH
         ============================================================ */
      maxWidth: {
        "container": "1400px",
      },
      
      /* ============================================================
         BACKDROP BLUR
         ============================================================ */
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
