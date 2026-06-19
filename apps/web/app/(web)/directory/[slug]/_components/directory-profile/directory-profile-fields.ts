/** First initial for the hero avatar fallback. */
export function profileInitial(name: string | null | undefined): string {
  return (name ?? "M").charAt(0).toUpperCase()
}

/** Display label for the paid profile-tier badge. */
export function profileTierLabel(tier: string): string {
  if (tier === "legend") {
    return "Legend"
  }
  if (tier === "elite") {
    return "Elite"
  }
  if (tier === "premium") {
    return "Premium"
  }
  return "Free"
}
