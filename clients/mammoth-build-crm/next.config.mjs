import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The shared kernel (PWCC-007 AdminKanban, @ronin-dojo/ui-kit) ships as TS source from
  // packages/ui-kit and is consumed via a `file:` dependency (ADR 0033 — in-repo kernel).
  // Next must transpile it like first-party code.
  transpilePackages: ["@ronin-dojo/ui-kit"],
  turbopack: {
    // Pin the root to the monorepo top: the kernel is a `file:` dep symlinked into
    // node_modules pointing at ../../packages/ui-kit, so the resolution root must contain
    // packages/ for Turbopack to follow the symlink. This also silences the
    // multi-lockfile root-inference warning.
    root: path.resolve(__dirname, "../.."),
  },
};

export default nextConfig;
