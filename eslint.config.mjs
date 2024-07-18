// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import codegenPlugin from "eslint-plugin-codegen";

export default tseslint.config(
  {
    ignores: [
      "node_modules",
      "dist",
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      "codegen": codegenPlugin,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: true
      },
    }
  },
  {
    files: ["src/**/*.ts"],
    rules: {
      "quotes": ["error", "double", { "allowTemplateLiterals": true }],
      "semi": "error",
      "indent": ["error", 2],

      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "warn",

      "codegen/codegen": "error"
    }
  }
);
