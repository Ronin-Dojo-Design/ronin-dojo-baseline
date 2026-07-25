import type { PromotionCardParams } from "~/components/web/og/promotion-card-params"

/**
 * Belt-color rank-promotion celebration card (1200×630) — the SESSION_0705 graduation of the
 * #288/#292 `scripts/prototypes/bbl-og-cards/` `renderPromotionCard` design into the real
 * `/api/og` render path (satori JSX for `ImageResponse`, not the prototype's raw-SVG strings;
 * app code must not import the prototype). Layout kept: dark shell, accent top bar, PROMOTION
 * kicker, belt-colored chip, big name, divider, date row — with the payload's `lineageLine`
 * in the prototype's `academyName` slot (the SESSION_0688 payload contract).
 *
 * Props arrive PRE-NORMALIZED via `parsePromotionCardParams` (validated belt color, clamped
 * text, nullable date/lineage) — this component only lays out; it never re-validates.
 */

const PALETTE = {
  background: "#090A0C",
  surfaceRaised: "#1B1E24",
  text: "#F7F4EF",
  textMuted: "#A9ADB7",
  line: "#30343D",
  accent: "hsl(1 79% 51%)",
} as const

type OgPromotionCardProps = PromotionCardParams & {
  siteName: string
}

export const OgPromotionCard = ({
  name,
  beltName,
  beltColor,
  date,
  lineageLine,
  siteName,
}: OgPromotionCardProps) => {
  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: PALETTE.background,
        color: PALETTE.text,
        fontFamily: "Geist",
      }}
    >
      <div style={{ height: 10, width: "100%", backgroundColor: PALETTE.accent }} />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          padding: "56px 72px 0",
        }}
      >
        <span
          style={{
            fontSize: 18,
            fontFamily: "GeistBold",
            letterSpacing: "0.25em",
            color: PALETTE.textMuted,
          }}
        >
          PROMOTION
        </span>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginTop: 36,
            backgroundColor: PALETTE.surfaceRaised,
            borderRadius: 18,
            overflow: "hidden",
          }}
        >
          <div style={{ width: 20, height: 82, backgroundColor: beltColor }} />
          <span style={{ fontSize: 30, fontFamily: "GeistBold", padding: "0 32px" }}>
            Promoted to {beltName}
          </span>
        </div>

        <p
          style={{
            marginTop: "auto",
            marginBottom: 0,
            fontSize: 76,
            fontFamily: "GeistBold",
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            textWrap: "balance",
          }}
        >
          {name}
        </p>

        <div
          style={{
            height: 2,
            width: "100%",
            backgroundColor: PALETTE.line,
            marginTop: 28,
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 48,
            marginTop: 24,
            fontSize: 24,
            color: PALETTE.textMuted,
          }}
        >
          <span>{date ?? ""}</span>
          {lineageLine && <span style={{ maxWidth: 700, textAlign: "right" }}>{lineageLine}</span>}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "36px 72px 44px",
        }}
      >
        <div style={{ width: 30, height: 4, borderRadius: 2, backgroundColor: PALETTE.accent }} />
        <span
          style={{
            fontSize: 20,
            fontFamily: "GeistBold",
            letterSpacing: "0.15em",
            color: PALETTE.text,
          }}
        >
          {siteName.toUpperCase()}
        </span>
      </div>
    </div>
  )
}
