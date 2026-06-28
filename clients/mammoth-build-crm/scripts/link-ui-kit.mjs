// Make the in-repo @ronin-dojo/ui-kit dependency a single whole-directory
// symlink (like a `workspace:*` link) instead of bun's per-file `file:`
// materialization.
//
// Why (SESSION_0460): a standalone `bun install` of a `file:` dep whose
// package.json declares `files: ["src"]` materializes node_modules/@ronin-dojo/
// ui-kit as a REAL directory with the package.json as an *absolute* per-file
// symlink. Next/Turbopack reads a package through its directory realpath and
// treats that per-file symlink as a "redirect", failing with
// `package.json is not parseable: invalid JSON: a redirect can't be parsed as
// json`. `apps/web` never hits this because `workspace:*` gives it a single
// whole-directory symlink, which Turbopack realpaths cleanly. We reshape the
// `file:` link to the same whole-dir form.
//
// Idempotent; runs as `postinstall` so it survives every `bun install`.
import { lstatSync, rmSync, symlinkSync } from "node:fs";

const link = "node_modules/@ronin-dojo/ui-kit";
// Resolved relative to the symlink's parent dir (node_modules/@ronin-dojo/):
// .. -> node_modules, ../.. -> mammoth-build-crm, ../../.. -> clients,
// ../../../.. -> repo root, then packages/ui-kit.
const target = "../../../../packages/ui-kit";

try {
  if (lstatSync(link).isSymbolicLink()) {
    // Already a whole-dir symlink — nothing to do.
    process.exit(0);
  }
  // bun materialized a real dir (+ per-file symlinks) — replace it.
  rmSync(link, { recursive: true, force: true });
} catch {
  // Link absent entirely (e.g. before first install) — fall through to create.
}

symlinkSync(target, link);
console.log("linked @ronin-dojo/ui-kit -> packages/ui-kit (whole-dir symlink)");
