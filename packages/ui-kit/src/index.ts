/**
 * @ronin-dojo/ui-kit — the Ronin/BBL shared component kernel (ADR 0033 D1).
 *
 * A DDD shared kernel consumed by the BBL app and (future) Mammoth: ONE design-token surface +
 * the `m-card` presentation card. Components are token-driven (no hardcoded hex, no brand
 * identifier) and depend only on React. Import the CSS once on an ancestor:
 *
 *   import "@ronin-dojo/ui-kit/tokens.css"
 *   import "@ronin-dojo/ui-kit/m-card.css"
 *
 * @see docs/architecture/decisions/0033-component-library-shared-kernel-and-strategic-harness.md
 * @see docs/knowledge/wiki/files/m-card-pattern.md
 */

export { MCard } from "./m-card/m-card";
export type {
  MCardBadge,
  MCardBaseData,
  MCardConnectorRow,
  MCardDataByKind,
  MCardDealData,
  MCardDensity,
  MCardFocal,
  MCardKind,
  MCardProps,
  MCardRecordData,
  MCardTaskData,
  MCardTone,
} from "./m-card/m-card.types";

export { BBL_DARK, BBL_LIGHT, brandTokenCss, FONTS, type BrandTokenBlock } from "./tokens/tokens";
