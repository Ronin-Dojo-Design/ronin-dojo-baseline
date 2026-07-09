import type { Metadata } from "next"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Lineage Membership Confirmed",
  description: "Your Black Belt Legacy lineage membership checkout is complete.",
}

export default function LineageMembershipSuccessPage() {
  redirect("/app/profile?complete=1&checkout=lineage-membership")
}
