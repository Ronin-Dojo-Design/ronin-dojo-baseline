import dynamic from "next/dynamic"

const BblLineageGalaxyDemo = dynamic(
  () =>
    import("~/components/web/lineage/galaxy/BblLineageGalaxyDemo").then(
      (mod) => mod.BblLineageGalaxyDemo,
    ),
  {
    ssr: false,
  },
)

export default function BblLineageGalaxyPage() {
  return <BblLineageGalaxyDemo />
}
