#!/usr/bin/env bun

/**
 * HOST-ONLY HELPER — NOT RUNNABLE IN THIS SANDBOX.
 *
 * Run this on macOS, where qlmanage is the proven SVG-to-PNG path. The overnight
 * lane only syntax-checks this file and must never execute it in the sandbox.
 */

import { spawn } from "node:child_process";
import { mkdir, readdir } from "node:fs/promises";
import { dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const prototypeDirectory = dirname(fileURLToPath(import.meta.url));

function usage() {
  return [
    "Usage:",
    "  bun scripts/prototypes/bbl-og-cards/rasterize.ts [samples|out] [--out output-directory]",
  ].join("\n");
}

function parseArgs(args) {
  const sourceName =
    args[0] && args[0] !== "--out" ? args.shift() : "samples";

  if (sourceName !== "samples" && sourceName !== "out") {
    throw new Error(`Source must be "samples" or "out".\n${usage()}`);
  }

  if (
    args.length !== 0 &&
    (args.length !== 2 || args[0] !== "--out" || !args[1])
  ) {
    throw new Error(`Invalid output arguments.\n${usage()}`);
  }

  return {
    sourceDirectory: resolve(prototypeDirectory, sourceName),
    outputDirectory: args[1]
      ? resolve(args[1])
      : resolve(prototypeDirectory, "out", "png"),
  };
}

function isEnoent(error) {
  return (
    error &&
    typeof error === "object" &&
    "code" in error &&
    error.code === "ENOENT"
  );
}

async function findSvgs(directory) {
  let entries;

  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (isEnoent(error)) {
      throw new Error(`Source directory does not exist: ${directory}`);
    }
    throw error;
  }

  return entries
    .filter((entry) => entry.isFile() && extname(entry.name).toLowerCase() === ".svg")
    .map((entry) => resolve(directory, entry.name))
    .sort();
}

function runQlmanage(outputDirectory, svgPaths) {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(
      "qlmanage",
      ["-t", "-s", "1200", "-o", outputDirectory, ...svgPaths],
      { stdio: "inherit" },
    );

    child.once("error", (error) => {
      if (isEnoent(error)) {
        rejectPromise(
          new Error(
            "qlmanage is unavailable. Run this helper on a macOS host with Quick Look installed.",
          ),
        );
        return;
      }
      rejectPromise(error);
    });
    child.once("close", (code) => {
      if (code === 0) {
        resolvePromise();
        return;
      }

      rejectPromise(new Error(`qlmanage exited with code ${String(code)}.`));
    });
  });
}

async function main() {
  const { sourceDirectory, outputDirectory } = parseArgs(
    process.argv.slice(2),
  );
  const svgPaths = await findSvgs(sourceDirectory);

  if (svgPaths.length === 0) {
    throw new Error(`No SVG files found in ${sourceDirectory}.`);
  }

  await mkdir(outputDirectory, { recursive: true });
  await runQlmanage(outputDirectory, svgPaths);
  console.log(`Rasterized ${svgPaths.length} SVG file(s) to ${outputDirectory}`);
}

if (import.meta.main) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
