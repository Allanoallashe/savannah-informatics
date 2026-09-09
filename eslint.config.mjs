import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Enforce strict equality operators (=== and !==) to eliminate unexpected JavaScript type coercion
      eqeqeq: ["error", "always"],

      // Enforce immutability where variables are never reassigned
      "prefer-const": "error",

      // Catch unused variables while intentionally permitting underscore-prefixed parameters (e.g. _req)
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      // Disabled because data fetching hooks (useStockQuery, useItemDetail) initiate asynchronous state transitions on mount
      "react-hooks/set-state-in-effect": "off",

      // Disabled because product photos are served from external public CDNs with dynamic URLs and client-side error fallback handlers
      "@next/next/no-img-element": "off",

      // Disabled to allow extensible component and context interface declarations
      "@typescript-eslint/no-empty-object-type": "off",
    },
  },
  // Global ignore patterns across the project
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "node_modules/**",
    "coverage/**",
  ]),
]);

export default eslintConfig;
