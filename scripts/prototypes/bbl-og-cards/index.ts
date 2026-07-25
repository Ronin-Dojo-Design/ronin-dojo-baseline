import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  renderClaimVerifiedCard,
  renderMilestoneCard,
  renderPromotionCard,
} from "./cards";

type CardType = "promotion" | "claim-verified" | "milestone";

const DEMO_RENDERERS: Record<CardType, () => string> = {
  promotion: () =>
    renderPromotionCard({
      name: "Jane Doe",
      beltName: "Black Belt",
      beltColorHex: "#111111",
      date: "July 24, 2026",
      academyName: "Example Martial Arts",
    }),
  "claim-verified": () =>
    renderClaimVerifiedCard({
      name: "Jane Doe",
      lineageLine: "Jane Doe → Taylor Example → Jordan Sample",
      date: "Verified July 24, 2026",
    }),
  milestone: () =>
    renderMilestoneCard({
      statLine: "1,000",
      contextLine: "verified lineage connections",
    }),
};

function usage(): string {
  return [
    "Usage:",
    "  bun scripts/prototypes/bbl-og-cards/index.ts <promotion|claim-verified|milestone> [--out file.svg]",
  ].join("\n");
}

export function parseArgs(args: string[]): {
  type: CardType;
  outputPath?: string;
} {
  const [candidateType, ...rest] = args;

  if (!(candidateType && Object.hasOwn(DEMO_RENDERERS, candidateType))) {
    throw new Error(`Unknown or missing card type.\n${usage()}`);
  }

  if (rest.length === 0) {
    return { type: candidateType as CardType };
  }

  if (rest.length !== 2 || rest[0] !== "--out" || !rest[1]) {
    throw new Error(`Invalid output arguments.\n${usage()}`);
  }

  return { type: candidateType as CardType, outputPath: rest[1] };
}

async function main(): Promise<void> {
  const { type, outputPath } = parseArgs(process.argv.slice(2));
  const prototypeDirectory = dirname(fileURLToPath(import.meta.url));
  const destination = outputPath
    ? resolve(outputPath)
    : resolve(prototypeDirectory, "out", `${type}.svg`);

  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, DEMO_RENDERERS[type](), "utf8");
  console.log(destination);
}

if (import.meta.main) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
