import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

import autoprefixer from "autoprefixer";
import devtoolsJson from "vite-plugin-devtools-json";

// https://vite.dev/config/
export default defineConfig({
  css: { postcss: { plugins: [autoprefixer] } },
  plugins: [react(), devtoolsJson()],
});
