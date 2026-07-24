export type PromotionCardInput = {
  name: string;
  beltName: string;
  beltColorHex: string;
  date: string;
  academyName?: string;
};

export type ClaimVerifiedCardInput = {
  name: string;
  lineageLine: string;
  date: string;
};

export type MilestoneCardInput = {
  statLine: string;
  contextLine: string;
};

// Prototype literals only. The live app's brand tokens are the eventual source.
const PALETTE = {
  background: "#090A0C",
  surface: "#13151A",
  surfaceRaised: "#1B1E24",
  text: "#F7F4EF",
  textMuted: "#A9ADB7",
  line: "#30343D",
  accent: "hsl(1 79% 51%)",
  white: "#FFFFFF",
} as const;

const SYSTEM_FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Helvetica, Arial, sans-serif";

export function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function safeBeltColor(value: string): string {
  return /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(
    value,
  )
    ? value
    : PALETTE.accent;
}

function svgShell({
  accessibleLabel,
  content,
}: {
  accessibleLabel: string;
  content: string;
}): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-label="${escapeXml(accessibleLabel)}">
  <rect width="1200" height="630" fill="${PALETTE.background}"/>
  <path d="M0 0H1200V10H0Z" fill="${PALETTE.accent}"/>
  <circle cx="1090" cy="108" r="190" fill="${PALETTE.surface}" opacity="0.72"/>
  <circle cx="1125" cy="76" r="112" fill="${PALETTE.surfaceRaised}" opacity="0.55"/>
  ${content}
  <g transform="translate(72 570)">
    <rect width="30" height="4" rx="2" fill="${PALETTE.accent}"/>
    <text x="44" y="8" fill="${PALETTE.text}" font-family="${SYSTEM_FONT}" font-size="20" font-weight="800" letter-spacing="3">BBL</text>
    <text x="112" y="8" fill="${PALETTE.textMuted}" font-family="${SYSTEM_FONT}" font-size="15" font-weight="600" letter-spacing="2">BLACK BELT LEGACY</text>
  </g>
</svg>`;
}

export function renderPromotionCard(input: PromotionCardInput): string {
  const name = escapeXml(input.name);
  const beltName = escapeXml(input.beltName);
  const date = escapeXml(input.date);
  const academy = input.academyName ? escapeXml(input.academyName) : "";
  const beltColor = safeBeltColor(input.beltColorHex);

  return svgShell({
    accessibleLabel: `${input.name} promoted to ${input.beltName}`,
    content: `<g transform="translate(72 76)">
    <text x="0" y="0" fill="${PALETTE.textMuted}" font-family="${SYSTEM_FONT}" font-size="18" font-weight="700" letter-spacing="4">PROMOTION</text>
    <rect x="0" y="38" width="1056" height="82" rx="18" fill="${PALETTE.surfaceRaised}"/>
    <rect x="0" y="38" width="20" height="82" rx="10" fill="${beltColor}"/>
    <text x="52" y="91" fill="${PALETTE.text}" font-family="${SYSTEM_FONT}" font-size="28" font-weight="750">Promoted to ${beltName}</text>
    <text x="0" y="244" fill="${PALETTE.text}" font-family="${SYSTEM_FONT}" font-size="78" font-weight="850" letter-spacing="-3">${name}</text>
    <line x1="0" y1="282" x2="1056" y2="282" stroke="${PALETTE.line}" stroke-width="2"/>
    <text x="0" y="332" fill="${PALETTE.textMuted}" font-family="${SYSTEM_FONT}" font-size="24" font-weight="600">${date}</text>
    ${academy ? `<text x="1056" y="332" text-anchor="end" fill="${PALETTE.textMuted}" font-family="${SYSTEM_FONT}" font-size="24" font-weight="600">${academy}</text>` : ""}
  </g>`,
  });
}

export function renderClaimVerifiedCard(input: ClaimVerifiedCardInput): string {
  const name = escapeXml(input.name);
  const lineageLine = escapeXml(input.lineageLine);
  const date = escapeXml(input.date);

  return svgShell({
    accessibleLabel: `${input.name} lineage verified`,
    content: `<g transform="translate(72 76)">
    <g transform="translate(0 24)">
      <circle cx="34" cy="34" r="34" fill="${PALETTE.accent}"/>
      <path d="M18 34L29 45L51 22" fill="none" stroke="${PALETTE.white}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="92" y="43" fill="${PALETTE.text}" font-family="${SYSTEM_FONT}" font-size="31" font-weight="800" letter-spacing="1">LINEAGE VERIFIED</text>
    </g>
    <text x="0" y="212" fill="${PALETTE.text}" font-family="${SYSTEM_FONT}" font-size="72" font-weight="850" letter-spacing="-2.5">${name}</text>
    <rect x="0" y="258" width="1056" height="112" rx="18" fill="${PALETTE.surfaceRaised}" stroke="${PALETTE.line}" stroke-width="2"/>
    <text x="32" y="305" fill="${PALETTE.textMuted}" font-family="${SYSTEM_FONT}" font-size="16" font-weight="700" letter-spacing="3">VERIFIED LINE</text>
    <text x="32" y="346" fill="${PALETTE.text}" font-family="${SYSTEM_FONT}" font-size="25" font-weight="650">${lineageLine}</text>
    <text x="1056" y="424" text-anchor="end" fill="${PALETTE.textMuted}" font-family="${SYSTEM_FONT}" font-size="22" font-weight="600">${date}</text>
  </g>`,
  });
}

export function renderMilestoneCard(input: MilestoneCardInput): string {
  const statLine = escapeXml(input.statLine);
  const contextLine = escapeXml(input.contextLine);

  return svgShell({
    accessibleLabel: `${input.statLine} ${input.contextLine}`,
    content: `<g transform="translate(72 76)">
    <text x="0" y="0" fill="${PALETTE.textMuted}" font-family="${SYSTEM_FONT}" font-size="18" font-weight="700" letter-spacing="4">LEGACY MILESTONE</text>
    <text x="-6" y="224" fill="${PALETTE.text}" font-family="${SYSTEM_FONT}" font-size="188" font-weight="900" letter-spacing="-10">${statLine}</text>
    <rect x="0" y="264" width="94" height="8" rx="4" fill="${PALETTE.accent}"/>
    <text x="0" y="337" fill="${PALETTE.text}" font-family="${SYSTEM_FONT}" font-size="38" font-weight="700">${contextLine}</text>
    <text x="0" y="389" fill="${PALETTE.textMuted}" font-family="${SYSTEM_FONT}" font-size="22" font-weight="550">Every connection preserves the story.</text>
  </g>`,
  });
}
