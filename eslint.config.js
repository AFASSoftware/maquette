import eslint from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["build/**", "dist/**", "node_modules/**", "website/**", "examples/**", "*.js", "*.cjs", "*.mjs"]
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.es2020,
        ...globals.mocha
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      }
    },
    rules: {
      // Additional rules:
      "eqeqeq": "error",
      "no-console": "error",
      "no-return-await": "error",
      "prefer-template": "error",
      "@typescript-eslint/no-shadow": "error",
      "@typescript-eslint/no-unused-vars": ["warn", { args: "none" }],

      // Should be enabled by recommended...
      "no-unreachable": "error",

      // Additional config for rules:
      "quotes": ["warn", "double", { "avoidEscape": true }],
      "@typescript-eslint/explicit-module-boundary-types": ["error", { "allowArgumentsExplicitlyTypedAsAny": true }],

      // Disabled rules:
      "prefer-const": "off",
      "no-shadow": "off", // Replaced with '@typescript-eslint/no-shadow'.
      "no-unused-vars": "off", // Replaced with '@typescript-eslint/no-unused-vars'.
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/unbound-method": "off",
      "@typescript-eslint/no-empty-interface": "off",
      "@typescript-eslint/ban-ts-comment": "off",

      // Rules to be enabled:
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unsafe-call": "off",

      // Rules to be discussed:
      "prefer-spread": "off",
      "no-async-promise-executor": "off",
      "no-case-declarations": "off",
      "no-fallthrough": "off",
      "no-inner-declarations": "off",
      "@typescript-eslint/require-await": "off",
      "@typescript-eslint/prefer-regexp-exec": "off",
    }
  },
  {
    files: ["test/**/*.ts"],
    rules: {
      "@typescript-eslint/no-unused-expressions": "off",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-array-delete": "off",
    }
  }
);
