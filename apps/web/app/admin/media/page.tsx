import { ImageIcon } from "lucide-react"
import { withAdminPage } from "~/components/admin/auth-hoc"
import { Badge } from "~/components/common/badge"
import { H2 } from "~/components/common/heading"
import { Wrapper } from "~/components/common/wrapper"
import { getRequestBrand } from "~/lib/brand-context"
import { findMedia } from "~/server/admin/media/queries"
import { DeleteMediaButton } from "./_components/delete-media-button"
import { MediaUploader } from "./_components/media-uploader"

export default withAdminPage(async ({ searchParams }) => {
  const sp = await searchParams
  const brand = await getRequestBrand()
  const {
    media,
    total,
    page: _page,
    perPage: _perPage,
  } = await findMedia({
    brand,
    q: sp?.q as string | undefined,
    page: Number(sp?.page) || 1,
  })

  return (
    <Wrapper size="lg" gap="sm">
      <div className="flex items-center justify-between">
        <div>
          <H2>Media Gallery</H2>
          <p className="text-sm text-muted-foreground">
            {total} file{total !== 1 ? "s" : ""}
          </p>
        </div>

        <MediaUploader />
      </div>

      {media.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
          <ImageIcon className="size-12" />
          <p>No media uploaded yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {media.map(item => (
            <div key={item.id} className="group relative overflow-hidden rounded-lg border">
              <div className="absolute right-2 top-2 z-10 opacity-0 transition group-hover:opacity-100">
                <DeleteMediaButton id={item.id} />
              </div>

              {item.type === "IMAGE" ? (
                <img
                  src={item.url}
                  alt={item.altText ?? item.title ?? "Media"}
                  className="aspect-square w-full object-cover"
                />
              ) : item.type === "VIDEO" ? (
                // oxlint-disable-next-line jsx-a11y/media-has-caption -- admin preview of user-uploaded media; no caption track available
                <video
                  src={item.url}
                  className="aspect-square w-full object-cover"
                  poster={item.thumbnailUrl ?? undefined}
                />
              ) : (
                <div className="flex aspect-square items-center justify-center bg-muted">
                  <ImageIcon className="size-8 text-muted-foreground" />
                </div>
              )}

              <div className="p-2 space-y-1">
                <p className="text-sm font-medium truncate">{item.title ?? "Untitled"}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">
                    {item.type}
                  </Badge>
                  {item.mimeType && (
                    <span className="text-[10px] text-muted-foreground">{item.mimeType}</span>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {item.uploadedBy.name ?? "Unknown"} · {item._count.attachments} attachment
                  {item._count.attachments !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Wrapper>
  )
})
