"use client"

import { type ComponentProps, useState } from "react"
import { cx } from "~/lib/utils"

/**
 * Avatar — one SSR-image primitive (SESSION_0475).
 *
 * The `<img>` is rendered **server-side** (it's in the initial HTML), layered over an
 * initials fallback that shows through only when there is no `src` or the image errors.
 * This is the Apple / Facebook / YouTube pattern: the browser starts fetching the avatar
 * on first paint, so there is no initials-then-image "pop" on hydration.
 *
 * (The prior Base UI `Avatar.Image` deferred the image to a *client* load — it rendered no
 * `<img>` in the SSR HTML, producing that pop on the cards / board / mobile list. The
 * cinematic timeline's belt-ringed `CardAvatar` already SSR'd its image; this brings every
 * other surface into parity through the one shared primitive.)
 *
 * Compound API is unchanged, so all ~26 call sites keep working:
 *   <Avatar className="size-12">
 *     {src && <AvatarImage src={src} alt={name} />}
 *     <AvatarFallback>{initials}</AvatarFallback>
 *   </Avatar>
 */
function Avatar({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      data-slot="avatar"
      className={cx("relative flex size-10 shrink-0 overflow-clip rounded-md bg-accent", className)}
      {...props}
    />
  )
}

function AvatarImage({ className, src, alt = "", ...props }: ComponentProps<"img">) {
  // We track the *src that failed*, not a boolean, so a later `src` change (client re-render)
  // shows the new image instead of staying blank. On the server and on the happy path the
  // `<img>` renders, so it is present in the SSR HTML (no initials-then-pop). When absent (no
  // src) or errored, the layered `AvatarFallback` shows through.
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  if (!src || failedSrc === src) return null

  return (
    // eslint-disable-next-line @next/next/no-img-element -- public avatar URLs, no Next loader here
    <img
      data-slot="avatar-image"
      src={src}
      alt={alt}
      onError={() => setFailedSrc(typeof src === "string" ? src : null)}
      className={cx("absolute inset-0 size-full object-cover", className)}
      {...props}
    />
  )
}

function AvatarFallback({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      data-slot="avatar-fallback"
      className={cx("flex size-full items-center justify-center text-xs", className)}
      {...props}
    />
  )
}

export { Avatar, AvatarFallback, AvatarImage }
