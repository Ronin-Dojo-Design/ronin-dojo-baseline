import type { Graph } from "schema-dts"

export const StructuredData = ({ data }: { data: Graph }) => {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  )
}
