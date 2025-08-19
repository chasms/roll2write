import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

import pandacss from "@pandacss/dev/postcss";
import autoprefixer from "autoprefixer";
import devtoolsJson from "vite-plugin-devtools-json";

// https://vite.dev/config/
export default defineConfig({
  css: {
    postcss: {
      plugins: [pandacss as typeof autoprefixer, autoprefixer],
    },
  },
  plugins: [react(), devtoolsJson()],
});
