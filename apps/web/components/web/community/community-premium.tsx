import { LockKeyholeIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import type { ComponentProps } from "react"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { Link } from "~/components/common/link"

/**
 * The community premium/lock contract in ONE place (SESSION_0557 Desi P2 — the
 * `CommunityPostFlair` precedent: card, row, detail, and composer each hand-copied the lock badge,
 * the unlock CTA, and the upgrade funnel href). Directive-free on purpose: the client card/row/dialog
 * and the server post-detail page both consume it.
 */

/** The paid-tier upgrade funnel — the same route the composer/technique upgrade CTAs link to. */
export const UPGRADE_HREF = "/lineage/join"

/** The one "Premium" lock badge (card header, row chip line). */
export const CommunityPremiumBadge = (
  props: Omit<ComponentProps<typeof Badge>, "variant" | "prefix">,
) => {
  const t = useTranslations("community")

  return (
    <Badge variant="warning" size="sm" prefix={<LockKeyholeIcon />} {...props}>
      {t("premium_badge")}
    </Badge>
  )
}

/**
 * The one "Unlock with Premium" CTA on locked teasers. Cards/rows keep the default `secondary`
 * weight (the detail's `UpgradePanel` renders `primary`) — a deliberate funnel-weight hierarchy:
 * the detail is the conversion surface, cards/rows are the browse surface.
 */
export const CommunityUnlockButton = ({
  variant = "secondary",
  size = "sm",
  ...props
}: Omit<ComponentProps<typeof Button>, "prefix" | "render">) => {
  const t = useTranslations("community")

  return (
    <Button
      variant={variant}
      size={size}
      prefix={<LockKeyholeIcon />}
      render={<Link href={UPGRADE_HREF} />}
      {...props}
    >
      {t("unlock_cta")}
    </Button>
  )
}
