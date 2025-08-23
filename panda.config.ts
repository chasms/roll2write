import { defineConfig } from "@pandacss/dev";

export default defineConfig({
  // Whether to use css reset
  preflight: true,

  // Where to look for your css declarations
  include: ["./src/**/*.{js,jsx,ts,tsx}", "./pages/**/*.{js,jsx,ts,tsx}"],

  // Files to exclude
  exclude: [],

  // Useful for theme customization
  theme: {
    extend: {
      tokens: {
        colors: {
          parchment: { 50: { value: "#f5f2ea" }, 100: { value: "#ebe5d7" }, 200: { value: "#dfd2b5" } },
          ink: { 900: { value: "#120f19" }, 700: { value: "#241d33" } },
          arcane: { 400: { value: "#7b5df9" }, 500: { value: "#6243f3" }, 600: { value: "#4a2ed6" } },
          crystal: { 400: { value: "#8bd6ff" }, 500: { value: "#5cbfee" }, 600: { value: "#2ea6dc" } },
          obsidian: { 400: { value: "#4d5663" }, 500: { value: "#353c46" }, 600: { value: "#1f2329" } },
          ethereal: { 400: { value: "#d3a8ff" }, 500: { value: "#c184ff" }, 600: { value: "#aa50ff" } },
          rune: { 500: { value: "#ffc94d" }, 600: { value: "#f5b833" } },
          glass: { 500: { value: "rgba(255,255,255,0.08)" }, 600: { value: "rgba(255,255,255,0.12)" } },
        },
        fonts: {
          medieval: { value: '"MedievalSharp", "Almendra Display", Georgia, serif' },
          display: { value: '"Almendra Display", "MedievalSharp", Georgia, serif' },
          body: { value: '"MedievalSharp", Georgia, serif' },
          mono: { value: '"TechMono", Menlo, monospace' },
        },
        blurs: {
          glow: { value: "12px" },
          panel: { value: "18px" },
        },
        shadows: {
          glow: { value: "0 0 0 1px rgba(255,255,255,0.05), 0 0 12px 2px rgba(124,82,255,0.35)" },
          insetRune: { value: "inset 0 0 0 1px rgba(255,255,255,0.15), 0 0 0 1px rgba(0,0,0,0.4)" },
        },
      },
      keyframes: {
        spin: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
      },
      recipes: {
        buttonBase: {
          className: "r2wBtn",
          base: {
            px: 2,
            py: 1,
            rounded: "sm",
            cursor: "pointer",
            fontSize: "sm",
          },
          variants: {
            tone: {
              neutral: {
                bg: { base: "gray.100", _dark: "gray.700" },
                color: { base: "black", _dark: "white" },
              },
              primary: { bg: "blue.600", color: "white" },
              success: { bg: "green.600", color: "white" },
              danger: { bg: "red.600", color: "white" },
              accent: { bg: "purple.600", color: "white" },
              warn: { bg: "orange.600", color: "white" },
              teal: { bg: "teal.600", color: "white" },
              arcane: { bg: "arcane.600", color: "white", boxShadow: "glow" },
              crystal: { bg: "crystal.500", color: "ink.900" },
              obsidian: { bg: "obsidian.600", color: "parchment.100" },
              ethereal: { bg: "ethereal.600", color: "ink.900", boxShadow: "0 0 0 1px rgba(255,255,255,0.2)" },
            },
            active: {
              true: { outline: "2px solid", outlineColor: "blue.400" },
              false: {},
            },
            disabled: {
              true: { opacity: 0.5, cursor: "not-allowed" },
              false: {},
            },
          },
          defaultVariants: { tone: "neutral", active: false, disabled: false },
        },
        dieSelect: {
          className: "r2wDieSelect",
          base: { w: "full", textAlign: "left", mb: 1 },
          variants: {
            selected: {
              true: { bg: "green.600", color: "white" },
              false: {
                bg: { base: "gray.100", _dark: "gray.800" },
                color: { base: "black", _dark: "white" },
              },
            },
          },
          defaultVariants: { selected: false },
        },
        sidePreset: {
          className: "r2wSidePreset",
          base: { mr: 2, mb: 2 },
          variants: {
            selected: {
              true: { bg: "gray.700", color: "white" },
              false: { bg: "gray.200", color: "black" },
            },
          },
          defaultVariants: { selected: false },
        },
        spinner: {
          className: "r2wSpinner",
          base: {
            w: 12,
            h: 12,
            border: "3px solid",
            borderColor: "purple.400",
            borderTopColor: "transparent",
            rounded: "full",
            animation: "spin",
            mx: "auto",
          },
        },
        glassPanel: {
          className: "r2wGlassPanel",
          base: {
            bg: "glass.500",
            backdropFilter: "blur(18px)",
            border: "1px solid",
            borderColor: "rgba(255,255,255,0.15)",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.07), 0 4px 24px -4px rgba(0,0,0,0.6)",
            rounded: "md",
          },
        },
      },
    },
  },

  // The output directory for your css system
  outdir: "styled-system",

  jsxFramework: "react", // optional
});
