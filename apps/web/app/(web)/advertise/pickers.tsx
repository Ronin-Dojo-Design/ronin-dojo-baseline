import { createLoader, parseAsStringEnum, type SearchParams } from "nuqs/server"
import { AdType } from "~/.generated/prisma/client"
import { AdsPicker } from "~/components/web/ads/ads-picker"
import { findAds } from "~/server/web/ads/queries"

type AdvertisePickersProps = {
  searchParams: Promise<SearchParams>
}

export const AdvertisePickers = async ({ searchParams }: AdvertisePickersProps) => {
  const searchParamsLoader = createLoader({ type: parseAsStringEnum(Object.values(AdType)) })
  const { type } = searchParamsLoader(await searchParams)
  const ads = await findAds({})

  return <AdsPicker ads={ads} type={type} className="mx-auto" />
}
