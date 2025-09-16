import react from "@vitejs/plugin-react-swc";
import autoprefixer from "autoprefixer";
import { defineConfig } from "vite";
import devtoolsJson from "vite-plugin-devtools-json";
import sassDts from "vite-plugin-sass-dts";

// https://vite.dev/config/
export default defineConfig({
  css: { postcss: { plugins: [autoprefixer] } },
  plugins: [react(), devtoolsJson(), sassDts()],
});
