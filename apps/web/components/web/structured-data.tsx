import type { Graph } from "schema-dts"

/**
 * JSON-LD structured-data block.
 *
 * Intentionally NOT nonced (SESSION_0536): `<script type="application/ld+json">` is a
 * non-executable data block, so `script-src` never governs it — it renders fine under
 * the strict nonce CSP with no nonce. Adding a nonce here caused a hydration mismatch
 * (React blanks the `nonce` attribute client-side → server `nonce="…"` vs client
 * `nonce=""`), so this component stays a plain sync server component.
 */
export const StructuredData = ({ data }: { data: Graph }) => (
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
)
