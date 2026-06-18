import { ImageIcon } from "lucide-react"
import { Badge } from "~/components/common/badge"
import { Card, CardDescription, CardHeader } from "~/components/common/card"
import { H4 } from "~/components/common/heading"
import { bblHeadingFontClass } from "~/components/web/ui/brand-typography"

/**
 * The ceremony-page sidebar: explains that gallery media is attached to the event
 * (shared) rather than duplicated per award, with the public photo count.
 */
export function GalleryAside({ photoCount }: { photoCount: number }) {
  return (
    <Card hover={false}>
      <CardHeader>
        <H4 className={bblHeadingFontClass}>Gallery</H4>
      </CardHeader>
      <CardDescription className="line-clamp-none">
        Shared ceremony media is attached to the event, not duplicated on every award.
      </CardDescription>
      <Badge variant="info" size="sm" prefix={<ImageIcon />}>
        {photoCount} photo{photoCount === 1 ? "" : "s"}
      </Badge>
    </Card>
  )
}
