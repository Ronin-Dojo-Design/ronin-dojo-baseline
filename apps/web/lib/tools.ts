import { differenceInDays } from "date-fns"
import type { Tool, ToolTier } from "~/.generated/prisma/client"
import { submissionsConfig } from "~/config/submissions"
import { tiersConfig } from "~/config/tiers"

type TierCapability = keyof (typeof tiersConfig)[ToolTier]["capabilities"]

/**
 * Check if a tool's tier has a given capability.
 */
export const hasToolTierCap = (tool: Pick<Tool, "tier">, capability: TierCapability): boolean => {
  return tiersConfig[tool.tier].capabilities[capability]
}

/**
 * Get the priority rank of a tool's tier.
 */
export const getToolTierRank = (tool: Pick<Tool, "tier">): number => {
  return tiersConfig[tool.tier].priority
}

const maxTierPriority = Math.max(...Object.values(tiersConfig).map(c => c.priority))

/**
 * Check if a tool has the highest tier.
 */
export const isToolTopTier = (tool: Pick<Tool, "tier">): boolean => {
  return tiersConfig[tool.tier].priority === maxTierPriority
}

/**
 * Get all tiers that have a given capability.
 */
export const getToolTiersWith = (capability: TierCapability): ToolTier[] => {
  return Object.entries(tiersConfig)
    .filter(([, config]) => config.capabilities[capability])
    .map(([tier]) => tier as ToolTier)
}

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
 * Check if a tool was rejected during review.
 *
 * @param tool - The tool to check.
 * @returns Whether the tool is rejected.
 */
export const isToolRejected = (tool: Pick<Tool, "status">) => {
  return ["Rejected"].includes(tool.status)
}

/**
 * Check if a tool has been soft-deleted.
 *
 * @param tool - The tool to check.
 * @returns Whether the tool is deleted.
 */
export const isToolDeleted = (tool: Pick<Tool, "status">) => {
  return ["Deleted"].includes(tool.status)
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
 * Whether the tool's listing can be upgraded.
 */
export const isToolUpgradable = (tool: Pick<Tool, "status">) => {
  return !isToolRejected(tool) && !isToolDeleted(tool)
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
