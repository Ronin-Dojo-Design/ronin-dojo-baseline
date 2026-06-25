import { tryCatch } from "@dirstack/utils"
import { eachDayOfInterval, format, startOfDay, subDays } from "date-fns"
import { siteConfig } from "~/config/site"
import { getPlausibleApi } from "~/services/plausible"

type VisitorsTotalResponse = {
  results: { metrics: [number]; dimensions: [string] }[]
}

/**
 * Get the total visitors for a given period
 * @param period - The period to get the visitors for
 * @returns The total visitors
 */
export const getTotalVisitors = async (period = "30d") => {
  const query = {
    site_id: siteConfig.domain,
    metrics: ["visitors"],
    date_range: period,
    dimensions: ["time:day"],
  }

  const { data, error } = await tryCatch(
    getPlausibleApi().post(query).json<VisitorsTotalResponse>(),
  )

  if (error) {
    console.error("Analytics error:", error)
    return { results: [], totalVisitors: 0, averageVisitors: 0 }
  }

  // Group visitors by date
  const visitorsByDate = data.results.reduce<Record<string, number>>((acc, curr) => {
    acc[curr.dimensions[0]] = curr.metrics[0]
    return acc
  }, {})

  // Fill in missing dates with 0
  const results = eachDayOfInterval({
    start: startOfDay(subDays(new Date(), 30)),
    end: new Date(),
  }).map(day => ({
    date: format(day, "yyyy-MM-dd"),
    value: visitorsByDate[format(day, "yyyy-MM-dd")] || 0,
  }))

  const totalVisitors = results.reduce((acc, curr) => acc + curr.value, 0)
  const averageVisitors = totalVisitors / results.length

  return { results, totalVisitors, averageVisitors }
}
