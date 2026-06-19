import Image from "next/image"

/**
 * A pure-CSS iPhone frame (no external frame image): rounded body, dark bezel, a
 * notch, and a single full-bleed hero photo on the "screen" with the BBL mark
 * subtly overlaid in the lower-left corner. Crazy-simple by design.
 */
export function PhoneMockup({
  src,
  priority = false,
  logoUrl,
  brandName,
}: {
  src: string
  priority?: boolean
  logoUrl: string | null
  brandName: string
}) {
  return (
    <div className="w-full select-none rounded-[2.5rem] border border-border bg-card p-2 shadow-2xl ring-1 ring-border/60">
      {/* Bezel */}
      <div className="relative aspect-9/19 overflow-hidden rounded-[2rem] bg-background">
        {/* Notch */}
        <div className="absolute left-1/2 top-2 z-20 h-5 w-1/3 -translate-x-1/2 rounded-full bg-background/90" />

        {/* Screen photo */}
        <Image
          src={src}
          alt=""
          aria-hidden
          fill
          priority={priority}
          sizes="(min-width: 1024px) 170px, (min-width: 640px) 33vw, 30vw"
          className="object-cover"
        />

        {/* Cinematic gradient so the logo reads on any photo */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-background/20"
        />

        {logoUrl ? (
          <div
            aria-hidden
            className="absolute bottom-3 left-3 z-10 h-5 w-12 bg-contain bg-left bg-no-repeat opacity-80 drop-shadow-sm"
            style={{ backgroundImage: `url(${logoUrl})` }}
          />
        ) : (
          <span className="absolute bottom-3 left-3 z-10 max-w-20 text-[0.55rem] font-extrabold uppercase italic leading-none tracking-wide text-foreground drop-shadow-sm">
            {brandName}
          </span>
        )}
      </div>
    </div>
  )
}
