import { headers } from "next/headers"
import type { Graph } from "schema-dts"

/**
 * JSON-LD structured-data block. Rendered only from server components, so it reads
 * the per-request CSP nonce off the `x-nonce` header (minted by proxy.ts,
 * SESSION_0536) and applies it to the `<script>` defensively.
 *
 * Note: `<script type="application/ld+json">` is a non-executable data block, so
 * most browsers do NOT enforce `script-src` against it — the nonce here is
 * belt-and-suspenders for cross-browser safety once the CSP enforces, not a
 * correctness requirement.
 */
export const StructuredData = async ({ data }: { data: Graph }) => {
  const nonce = (await headers()).get("x-nonce") ?? undefined
  return (
    <script
      type="application/ld+json"
      nonce={nonce}
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
