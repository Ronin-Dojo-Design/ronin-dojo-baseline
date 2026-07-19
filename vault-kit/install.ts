import { createHash } from "node:crypto";
import { lstat, mkdir, readFile, realpath, stat, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve, sep } from "node:path";

const KIT_ROOT = resolve(import.meta.dir);
const MANIFEST_PATH = ".ronin-vault-kit/manifest.json";
const KIT_VERSION = 1;

type Preset = { id: string; variables: Record<string, string> };
type ManifestEntry = { installedHash: string | null; source: string; sourceHash: string };
type Manifest = {
  files: Record<string, ManifestEntry>;
  kitVersion: number;
  preset: string;
};

export type InstallAction = "created" | "updated" | "unchanged" | "preserved";
export type InstallResult = {
  actions: Record<InstallAction, string[]>;
  manifestPath: string;
};

const sourceFiles = [
  ["90_Templates/Client Ops/TEMPLATE - Opening Card.md", "templates/client-ops/Opening Card.md"],
  ["90_Templates/Client Ops/TEMPLATE - Live Work.md", "templates/client-ops/Live Work.md"],
  ["90_Templates/Client Ops/TEMPLATE - Closing Card.md", "templates/client-ops/Closing Card.md"],
] as const;

function hash(content: string): string {
  return createHash("sha256").update(content).digest("hex");
}

async function readIfFile(path: string): Promise<string | null> {
  try {
    if (!(await stat(path)).isFile()) return null;
    return await readFile(path, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

function render(template: string, variables: Record<string, string>): string {
  const rendered = template.replace(/\{\{([A-Z0-9_]+)\}\}/g, (_, key: string) => {
    const value = variables[key];
    if (value === undefined) throw new Error(`Preset is missing variable ${key}`);
    return value;
  });
  const unresolved = rendered.match(/\{\{[A-Z0-9_]+\}\}/);
  if (unresolved) throw new Error(`Unresolved template variable ${unresolved[0]}`);
  return rendered.endsWith("\n") ? rendered : `${rendered}\n`;
}

async function rejectSymlinks(root: string, path: string): Promise<void> {
  const offset = relative(root, path);
  if (offset === ".." || offset.startsWith(`..${sep}`)) {
    throw new Error(`Vault-kit destination escapes the vault: ${path}`);
  }
  const parts = offset.split(sep);
  let current = root;
  for (const part of parts) {
    if (!part) continue;
    current = join(current, part);
    try {
      if ((await lstat(current)).isSymbolicLink()) {
        throw new Error(`Vault-kit refuses symlinked path: ${current}`);
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return;
      throw error;
    }
  }
}

function pathInside(root: string, target: string): boolean {
  const offset = relative(root, target);
  return offset === "" || (!offset.startsWith(`..${sep}`) && offset !== "..");
}

async function loadPreset(id: string): Promise<Preset> {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
    throw new Error(`Vault-kit preset id must be a plain slug: ${id}`);
  }
  const raw = await readIfFile(join(KIT_ROOT, "presets", `${id}.json`));
  if (!raw) throw new Error(`Unknown vault-kit preset: ${id}`);
  const preset = JSON.parse(raw) as Preset;
  if (preset.id !== id || !preset.variables || typeof preset.variables !== "object") {
    throw new Error(`Invalid vault-kit preset: ${id}`);
  }
  for (const [key, value] of Object.entries(preset.variables)) {
    if (typeof value !== "string") throw new Error(`Preset variable ${key} must be a string`);
  }
  return preset;
}

async function loadManifest(vaultPath: string): Promise<Manifest | null> {
  const raw = await readIfFile(join(vaultPath, MANIFEST_PATH));
  if (!raw) return null;
  const parsed = JSON.parse(raw) as Manifest;
  if (parsed.kitVersion !== KIT_VERSION || !parsed.files) {
    throw new Error(`Unsupported vault-kit manifest at ${join(vaultPath, MANIFEST_PATH)}`);
  }
  return parsed;
}

export async function installVaultKit(
  vaultPathInput: string,
  presetId = "mammoth",
): Promise<InstallResult> {
  const requestedVaultPath = resolve(vaultPathInput);
  await mkdir(requestedVaultPath, { recursive: true });
  if ((await lstat(requestedVaultPath)).isSymbolicLink()) {
    throw new Error(`Vault-kit refuses symlinked path: ${requestedVaultPath}`);
  }
  const vaultPath = await realpath(requestedVaultPath);
  const preset = await loadPreset(presetId);
  await rejectSymlinks(vaultPath, join(vaultPath, MANIFEST_PATH));
  const previousManifest = await loadManifest(vaultPath);
  if (previousManifest && previousManifest.preset !== presetId) {
    throw new Error(
      `Vault already uses preset ${previousManifest.preset}; refusing to replace it with ${presetId}`,
    );
  }

  const dashboardFilename = preset.variables.DASHBOARD_FILENAME;
  if (!dashboardFilename || dashboardFilename.includes("/") || dashboardFilename.includes("\\")) {
    throw new Error("DASHBOARD_FILENAME must be a plain filename");
  }

  const files = [
    ...sourceFiles.map(([destination, source]) => ({ destination, source })),
    { destination: `02_Dashboards/${dashboardFilename}`, source: "dashboard/Command Center.md" },
  ].sort((a, b) => a.destination.localeCompare(b.destination));
  const plannedFiles = await Promise.all(
    files.map(async (file) => {
      const sourceContent = await readFile(join(KIT_ROOT, file.source), "utf8");
      const expected = render(sourceContent, preset.variables);
      return { ...file, expected, expectedHash: hash(expected) };
    }),
  );
  const actions: InstallResult["actions"] = {
    created: [],
    preserved: [],
    unchanged: [],
    updated: [],
  };
  const manifest: Manifest = { files: {}, kitVersion: KIT_VERSION, preset: presetId };

  for (const file of plannedFiles) {
    const { expected, expectedHash } = file;
    const destinationPath = join(vaultPath, file.destination);
    if (!pathInside(vaultPath, destinationPath)) {
      throw new Error(`Vault-kit destination escapes the vault: ${file.destination}`);
    }
    await rejectSymlinks(vaultPath, destinationPath);
    const current = await readIfFile(destinationPath);
    const currentHash = current === null ? null : hash(current);
    const previous = previousManifest?.files[file.destination];
    let installedHash: string | null = previous?.installedHash ?? null;

    if (current === null) {
      await mkdir(dirname(destinationPath), { recursive: true });
      await writeFile(destinationPath, expected, "utf8");
      installedHash = expectedHash;
      actions.created.push(file.destination);
    } else if (currentHash === expectedHash) {
      installedHash = expectedHash;
      actions.unchanged.push(file.destination);
    } else if (previous?.installedHash && currentHash === previous.installedHash) {
      await writeFile(destinationPath, expected, "utf8");
      installedHash = expectedHash;
      actions.updated.push(file.destination);
    } else {
      actions.preserved.push(file.destination);
    }

    manifest.files[file.destination] = {
      installedHash,
      source: file.source,
      sourceHash: expectedHash,
    };
  }

  const manifestFile = join(vaultPath, MANIFEST_PATH);
  await rejectSymlinks(vaultPath, manifestFile);
  await mkdir(dirname(manifestFile), { recursive: true });
  await writeFile(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  return { actions, manifestPath: manifestFile };
}
