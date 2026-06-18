import { H4 } from "~/components/common/heading"
import { bblHeadingFontClass } from "~/components/web/ui/brand-typography"
import { Section } from "~/components/web/ui/section"
import type { MeGalleryImage } from "./me-profile-types"

/**
 * "Gallery" panel — the member's public IMAGE attachments. Pure server markup (native
 * lazy `<img>`, no client JS), so it stays eager: there is no client chunk to defer
 * (recipe gotcha — only split what actually pays off). Rendered only when non-empty.
 */
export function GallerySection({ images }: { images: MeGalleryImage[] }) {
  return (
    <Section>
      <H4 className={bblHeadingFontClass}>Gallery</H4>
      <ul className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map(image => (
          <li key={image.attachmentId} className="overflow-hidden rounded-lg border bg-card">
            {/* eslint-disable-next-line @next/next/no-img-element -- public media URL (R2/S3), no Next loader */}
            <img
              src={image.url}
              alt={image.altText ?? image.title ?? "Profile photo"}
              className="aspect-square size-full object-cover"
              loading="lazy"
            />
          </li>
        ))}
      </ul>
    </Section>
  )
}
