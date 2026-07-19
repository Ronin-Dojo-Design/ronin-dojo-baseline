import { installVaultKit } from "./install";

function usage(): never {
  console.error("Usage: bun vault-kit install <vault-path> [--preset mammoth]");
  process.exit(2);
}

const [command, vaultPath, ...options] = process.argv.slice(2);
if (command !== "install" || !vaultPath) usage();

let preset = "mammoth";
for (let index = 0; index < options.length; index += 1) {
  if (options[index] !== "--preset" || !options[index + 1]) usage();
  preset = options[index + 1];
  index += 1;
}

try {
  const result = await installVaultKit(vaultPath, preset);
  for (const action of ["created", "updated", "unchanged", "preserved"] as const) {
    for (const file of result.actions[action]) console.log(`${action}: ${file}`);
  }
  console.log(`manifest: ${result.manifestPath}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
