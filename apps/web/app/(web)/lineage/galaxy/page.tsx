import { notFound } from "next/navigation";
import { GalaxyRoute } from "~/components/web/lineage/galaxy/galaxy-route";
import { galaxyConfig } from "~/config/galaxy";
import { getBblGalaxyData } from "~/server/web/lineage/galaxy-data";

/**
 * Black Belt Legacy Galaxy — the cinematic public lineage viewer (galaxy epic, slice 2).
 *
 * Flag-gated: 404s unless `NEXT_PUBLIC_GALAXY_ENABLED=1`. Fetches a public-safe galaxy DTO
 * + drawer profiles server-side (no private data) and hands them to the client viewer; when
 * no published tree exists yet, `data` is null and the viewer falls back to the mock graph.
 * See docs/product/black-belt-legacy/BBL-Galaxy-spec.md.
 */
export default async function BblLineageGalaxyPage() {
  if (!galaxyConfig.enabled) {
    notFound();
  }

  const data = await getBblGalaxyData();

  return <GalaxyRoute data={data} />;
}
