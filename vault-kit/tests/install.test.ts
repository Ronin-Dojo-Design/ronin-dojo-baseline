import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { afterEach, describe, expect, test } from "bun:test";
import { installVaultKit } from "../install";

const scratchVaults: string[] = [];

async function scratchVault(): Promise<string> {
  const path = await mkdtemp(join(tmpdir(), "ronin-vault-kit-scratch-vault-"));
  scratchVaults.push(path);
  return path;
}

async function treeDigest(root: string): Promise<string> {
  const files: string[] = [];
  async function visit(directory: string): Promise<void> {
    const entries = await readdir(directory, { withFileTypes: true });
    for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) await visit(path);
      else files.push(path);
    }
  }
  await visit(root);
  const digest = createHash("sha256");
  for (const file of files) {
    digest.update(relative(root, file));
    digest.update("\0");
    digest.update(await readFile(file));
    digest.update("\0");
  }
  return digest.digest("hex");
}

afterEach(async () => {
  await Promise.all(scratchVaults.splice(0).map((path) => rm(path, { recursive: true })));
});

describe("vault-kit installer", () => {
  test("rejects preset path traversal before reading outside the kit", async () => {
    const vault = await scratchVault();
    await expect(installVaultKit(vault, "../mammoth")).rejects.toThrow("plain slug");
  });

  test("installs the Mammoth projection and is byte-stable on the second run", async () => {
    const vault = await scratchVault();
    const first = await installVaultKit(vault, "mammoth");
    const firstDigest = await treeDigest(vault);
    const second = await installVaultKit(vault, "mammoth");

    expect(first.actions.created).toHaveLength(4);
    expect(second.actions.unchanged).toHaveLength(4);
    expect(second.actions.created).toHaveLength(0);
    expect(second.actions.updated).toHaveLength(0);
    expect(second.actions.preserved).toHaveLength(0);
    expect(await treeDigest(vault)).toBe(firstDigest);

    const dashboard = await readFile(
      join(vault, "02_Dashboards/Command Center — Mammoth.md"),
      "utf8",
    );
    expect(dashboard).toContain("This is a private operational projection");
    expect(dashboard).toContain("Keychain-only");
    expect(dashboard).not.toContain("{{");
  });

  test("preserves a user-edited managed file across later installs", async () => {
    const vault = await scratchVault();
    await installVaultKit(vault, "mammoth");
    const openingCard = join(vault, "90_Templates/Client Ops/TEMPLATE - Opening Card.md");
    const edited = `${await readFile(openingCard, "utf8")}\nOperator-owned edit.\n`;
    await writeFile(openingCard, edited, "utf8");

    const second = await installVaultKit(vault, "mammoth");
    const secondDigest = await treeDigest(vault);
    const third = await installVaultKit(vault, "mammoth");

    expect(second.actions.preserved).toEqual([
      "90_Templates/Client Ops/TEMPLATE - Opening Card.md",
    ]);
    expect(third.actions.preserved).toEqual(second.actions.preserved);
    expect(await readFile(openingCard, "utf8")).toBe(edited);
    expect(await treeDigest(vault)).toBe(secondDigest);
  });

  test("rejects a symlinked managed parent before writing outside the vault", async () => {
    const vault = await scratchVault();
    const outside = await scratchVault();
    await symlink(outside, join(vault, "90_Templates"));

    await expect(installVaultKit(vault, "mammoth")).rejects.toThrow("refuses symlinked path");
    expect(await readdir(outside)).toEqual([]);
  });

  test("rejects a symlinked manifest before trusting its managed hashes", async () => {
    const vault = await scratchVault();
    const outside = await scratchVault();
    await mkdir(join(vault, ".ronin-vault-kit"), { recursive: true });
    const outsideManifest = join(outside, "manifest.json");
    await writeFile(outsideManifest, '{"kitVersion":1,"preset":"mammoth","files":{}}\n');
    await symlink(outsideManifest, join(vault, ".ronin-vault-kit/manifest.json"));

    await expect(installVaultKit(vault, "mammoth")).rejects.toThrow("refuses symlinked path");
  });
});
