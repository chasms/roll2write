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
      },
    },
  },

  // The output directory for your css system
  outdir: "styled-system",

  jsxFramework: "react", // optional
});
