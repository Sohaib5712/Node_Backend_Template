import globals from "globals";
import pluginJs from "@eslint/js";
import prettierRecommended from "eslint-plugin-prettier/recommended";

export default [
  {
    ignores: ["node_modules/**", "dist/**", "coverage/**"],
  },
  {
    languageOptions: {
      globals: globals.node,
      ecmaVersion: "latest",
      sourceType: "module",
    },
  },
  pluginJs.configs.recommended,
  prettierRecommended,
  {
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "no-console": "off",
    },
  },
];
