// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep.
import { describe, expect, it } from "bun:test"
import { createLocalStorageBoardStore, createMemoryBoardStore } from "./board-store"
import type { BoardState } from "./types"

const state: BoardState = {
  configId: "mammoth-pipeline",
  cards: [
    {
      id: "c1",
      stage: "new",
      title: "Flores job",
      createdAt: "2026-06-21T00:00:00Z",
      updatedAt: "2026-06-21T00:00:00Z",
    },
  ],
}

describe("BoardStore port — memory adapter", () => {
  it("round-trips state by config id", async () => {
    const store = createMemoryBoardStore()
    expect(await store.load("mammoth-pipeline")).toBeNull()
    await store.save(state)
    const loaded = await store.load("mammoth-pipeline")
    expect(loaded?.cards[0]?.title).toBe("Flores job")
  })

  it("seeds from constructor", async () => {
    const store = createMemoryBoardStore([state])
    expect((await store.load("mammoth-pipeline"))?.cards.length).toBe(1)
  })
})

describe("BoardStore port — localStorage adapter", () => {
  it("degrades to an in-memory fallback when window is absent (SSR/test)", async () => {
    // No window in the bun test runtime → adapter falls back gracefully (D2: the
    // reusable core never assumes a brand endpoint OR a browser).
    const store = createLocalStorageBoardStore()
    await store.save(state)
    const loaded = await store.load("mammoth-pipeline")
    expect(loaded?.configId).toBe("mammoth-pipeline")
  })
})
