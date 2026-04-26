import { differenceInDays } from "date-fns"
import type { Tool } from "~/.generated/prisma/client"
import { submissionsConfig } from "~/config/submissions"

/**
 * Check if a tool is published.
 *
 * @param tool - The tool to check.
 * @returns Whether the tool is published.
 */
export const isToolPublished = (tool: Pick<Tool, "status">) => {
  return ["Published"].includes(tool.status)
}

/**
 * Check if a tool is scheduled.
 *
 * @param tool - The tool to check.
 * @returns Whether the tool is scheduled.
 */
export const isToolScheduled = (tool: Pick<Tool, "status">) => {
  return ["Scheduled"].includes(tool.status)
}

/**
 * Check if a tool is approved (scheduled or published)
 *
 * @param tool - The tool to check.
 * @returns Whether the tool is published.
 */
export const isToolApproved = (tool: Pick<Tool, "status">) => {
  return ["Scheduled", "Published"].includes(tool.status)
}

/**
 * Check if a tool is within the expedite threshold.
 *
 * @param tool - The tool to check.
 * @returns Whether the tool is within the expedite threshold.
 */
export const isToolWithinExpediteThreshold = (tool: Pick<Tool, "publishedAt">) => {
  const threshold = submissionsConfig.expediteThreshold

  return tool.publishedAt && differenceInDays(tool.publishedAt, new Date()) < threshold
}
