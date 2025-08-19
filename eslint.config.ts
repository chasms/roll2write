import js from "@eslint/js";
import panda from "@pandacss/eslint-plugin";
import importPlugin from "eslint-plugin-import";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import pluginReact from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import { globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

const pandaPluginRecommended = {
  ignores: ["**/*.d.ts", "styled-system"],
  plugins: {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    "@pandacss": panda,
  },
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  rules: {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    ...panda.configs.recommended.rules,
  },
};

export default tseslint.config([
  globalIgnores(["dist", "styled-system/**/*", "node_modules/**/*"]),
  {
    files: ["**/*.{js,jsx,mjs,cjs,mts,cts,ts,tsx}"],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      importPlugin.flatConfigs.recommended,
      importPlugin.flatConfigs.typescript,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      reactHooks.configs["recommended-latest"],
      reactRefresh.configs.vite,
      pluginReact.configs.flat.recommended,
      pandaPluginRecommended,
      eslintPluginPrettierRecommended,
    ],
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      "import/consistent-type-specifier-style": "off",
      "react/react-in-jsx-scope": "off",
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      react: {
        version: "detect", // React version. "detect" automatically picks the version you have installed.
        // You can also use `16.0`, `16.3`, etc, if you want to override the detected value.
        // Defaults to the "defaultVersion" setting and warns if missing, and to "detect" in the future
        defaultVersion: "", // Default React version to use when the version you have installed cannot be detected.
        // If not provided, defaults to the latest React version.
      },
      "import/resolver": {
        alias: {
          // enables resolution with assets from public as well as relative path, and requires eslint-import-resolver-alias
          map: [["", "./public"]],
          extensions: [".js", ".jsx"],
        },
      },
    },
  },
]);
