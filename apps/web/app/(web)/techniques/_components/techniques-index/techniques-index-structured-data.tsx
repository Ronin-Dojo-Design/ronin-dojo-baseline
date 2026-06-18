import { StructuredData } from "~/components/web/structured-data"
import { createGraph, generateCollectionPage } from "~/lib/structured-data"

type TechniquesIndexStructuredDataProps = {
  url: string
  title: string
  description: string
}

/** JSON-LD CollectionPage for the technique library — rendered as a sibling after the body scope. */
export function TechniquesIndexStructuredData({
  url,
  title,
  description,
}: TechniquesIndexStructuredDataProps) {
  return <StructuredData data={createGraph([generateCollectionPage(url, title, description)])} />
}
