import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  splitting: false,
  sourcemap: false,
  clean: true,
  dts: false,
  external: ["simple-git", "node:sqlite", "node:crypto", "node:fs", "node:path", "node:os"]
});
