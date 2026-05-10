export type TuffBuffsGearCategory = "training" | "accessories" | "recovery"
export type TuffBuffsProgramGearKey = "bjj" | "muay-thai" | "boxing" | "eskrima" | "self-defense"

export type TuffBuffsAffiliateGearProduct = {
  id: string
  name: string
  description: string
  amountCents: number
  category: TuffBuffsGearCategory
  affiliateUrl: string
  imagePath?: string
  recommendedFor: readonly TuffBuffsProgramGearKey[]
}

export type TuffBuffsAffiliateGearCollection = {
  id: TuffBuffsProgramGearKey
  name: string
  requiredProductIds: readonly string[]
  recommendedProductIds: readonly string[]
}
