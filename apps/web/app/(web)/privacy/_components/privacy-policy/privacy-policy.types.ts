import type { Brand } from "~/.generated/prisma/client"

export type PrivacyPolicyProps = {
  /** Resolved request brand — drives which font tokens the typography scope exposes. */
  brand: Brand
  /** Brand display name interpolated into the legal copy. */
  siteName: string
  /** Page title (from page metadata). */
  title: string
  /** Page description (from page metadata). */
  description: string
}
