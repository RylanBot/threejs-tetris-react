import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import tsPlugin from "@typescript-eslint/eslint-plugin";
import * as tsParser from "@typescript-eslint/parser";
import importPlugin from "eslint-plugin-import";
import nPlugin from "eslint-plugin-n";
import prettierPlugin from "eslint-plugin-prettier";
import simpleImportSort from "eslint-plugin-simple-import-sort";

import type { Linter } from "eslint";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const eslintConfig: Linter.Config[] = [
  {
    ignores: [
      "node_modules",
      "dist",
      "build",
      "out",
      "**/out/**",
      "**/dist/**",
      "**/build/**",
      "**/*.d.ts",
    ],
  },
  {
    files: ["src/**/*.{js,ts,jsx,tsx}"],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "module",
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: __dirname,
      },
      globals: {
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
      },
    },
    plugins: {
      // @ts-expect-error plugin types mismatch
      "@typescript-eslint": tsPlugin,
      "simple-import-sort": simpleImportSort,
      n: nPlugin,
      import: importPlugin,
      prettier: prettierPlugin,
    },
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: true,
        },
        node: {
          extensions: [".js", ".jsx", ".ts", ".tsx"],
        },
      },
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          disallowTypeAnnotations: false,
          fixStyle: "separate-type-imports",
        },
      ],
      "import/consistent-type-specifier-style": ["error", "prefer-top-level"],
      "n/prefer-node-protocol": "error",
      "simple-import-sort/exports": "error",
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            // Node 内置模块
            ["^node:"],
            // 副作用导入
            ["^\\u0000"],
            // React
            ["^react"],
            // Three.js
            ["^three$", "^@react-three/", "^three-stdlib"],
            // 其他第三方包
            ["^\\w"],
            ["^@\\w"],
            // 内部路径别名
            ["^@/"],
            // 相对路径
            ["^\\."],
            // type imports
            [
              "^node:.*\\u0000$",
              "^@?\\w.*\\u0000$",
              "^@/.*\\u0000$",
              "^\\..*\\u0000$",
              "^.+\\u0000$",
            ],
          ],
        },
      ],
      "object-curly-newline": [
        "error",
        {
          ObjectExpression: { multiline: true, minProperties: 2, consistent: true },
          ObjectPattern: { multiline: true, consistent: true },
          ImportDeclaration: { multiline: true, consistent: true },
          ExportDeclaration: { multiline: true, consistent: true },
        },
      ],
      "object-property-newline": ["error", { allowAllPropertiesOnSameLine: false }],
      "prettier/prettier": [
        "error",
        {
          semi: true,
          singleQuote: true,
          trailingComma: "all",
          printWidth: 120,
          tabWidth: 2,
          useTabs: false,
          arrowParens: "always",
          bracketSpacing: true,
          singleAttributePerLine: true,
        },
      ],
    },
  },
];

export default eslintConfig;
