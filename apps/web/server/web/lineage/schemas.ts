import { z } from "zod"
import { Brand } from "~/.generated/prisma/client"

/**
 * Zod schemas for lineage query arguments.
 *
 * Kept minimal — these are read-side query args, not write actions. Each
 * matches the call signature of the matching function in `./queries.ts`.
 *
 * Author: Cody / SESSION_0175 TASK_02; SESSION_0179 TASK_01.
 */

export const lineageUserIdSchema = z.object({
  userId: z.string().min(1, "userId is required"),
})

export const lineageNodeIdSchema = z.object({
  nodeId: z.string().min(1, "nodeId is required"),
})

export const lineageTreeForUserSchema = z.object({
  userId: z.string().min(1, "userId is required"),
  // Depth-bucket walk hard-capped at 5 to prevent runaway BFS. MVP default
  // matches the port spec's "depth ≥ 2" minimum.
  depth: z.number().int().min(0).max(5).default(2),
})

export const lineageTreeBySlugSchema = z.object({
  brand: z.nativeEnum(Brand),
  slug: z.string().min(1),
})

export type LineageUserIdInput = z.infer<typeof lineageUserIdSchema>
export type LineageNodeIdInput = z.infer<typeof lineageNodeIdSchema>
export type LineageTreeForUserInput = z.infer<typeof lineageTreeForUserSchema>
export type LineageTreeBySlugInput = z.infer<typeof lineageTreeBySlugSchema>
