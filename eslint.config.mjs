export default [
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/dist/**",
      "**/.turbo/**",
      "**/.source/**",
      "**/coverage/**",
      "pnpm-lock.yaml",
      "**/*.d.ts",
    ],
  },
  {
    files: ["**/*.{js,mjs,cjs}"],
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "off",
      "no-console": "off",
    },
  },
];
