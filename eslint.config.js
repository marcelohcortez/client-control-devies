import js from "@eslint/js";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import globals from "globals";

/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
  // Base JS recommended rules
  js.configs.recommended,

  // All TypeScript files across the monorepo
  {
    files: ["apps/**/*.{ts,tsx}", "packages/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      ...tsPlugin.configs["recommended-type-checked"].rules,
      // No any — ever
      "@typescript-eslint/no-explicit-any": "error",
      // No type assertions without justification — warn so it can be documented
      "@typescript-eslint/no-unsafe-assignment": "error",
      "@typescript-eslint/no-unsafe-member-access": "error",
      "@typescript-eslint/no-unsafe-call": "error",
      "@typescript-eslint/no-unsafe-return": "error",
      // Require exhaustive handling of unions
      "@typescript-eslint/switch-exhaustiveness-check": "error",
      // Consistent type imports
      "@typescript-eslint/consistent-type-imports": ["error", { "prefer": "type-imports" }],
      // No unused vars
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
      // No floating promises
      "@typescript-eslint/no-floating-promises": "error",
      // Require await in async functions
      "@typescript-eslint/require-await": "error",
    },
  },

  // Ignore patterns
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/*.js",
      "eslint.config.js",
    ],
  },
];
