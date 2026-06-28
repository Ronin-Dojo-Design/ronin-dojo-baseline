import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The shared kernel (@ronin-dojo/ui-kit — m-card, tokens, AdminKanban; ADR 0033)
  // ships as TS source from packages/ui-kit. Baseline is a ROOT WORKSPACE member
  // (it matches the root package.json `apps/*` glob, like apps/web), so it consumes
  // the kernel via `workspace:*` — bun gives it a clean whole-directory symlink in
  // the shared node_modules, no `file:` link hack needed. Next must transpile the
  // kernel like first-party code.
  transpilePackages: ["@ronin-dojo/ui-kit"],
  turbopack: {
    // Pin the resolution root to the monorepo top so Turbopack follows the
    // workspace symlink into packages/ and silences root-inference warnings.
    root: path.resolve(__dirname, "../.."),
  },
};

export default nextConfig;
