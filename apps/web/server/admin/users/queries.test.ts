/**
 * SESSION_0186 — admin user query archival filters.
 *
 * Run: cd apps/web && bun test server/admin/users/queries.test.ts
 */

// @ts-expect-error — bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { afterAll, describe, expect, it } from "bun:test"
import { findUserList, findUsers } from "~/server/admin/users/queries"
import type { UsersTableSchema } from "~/server/admin/users/schema"
import { db } from "~/services/db"

const TS = Date.now()
const PREFIX = `session-0186-users-${TS}`
const tag = (name: string) => `${PREFIX}-${name}`

const createUser = async ({
  name,
  isPlaceholder = false,
  archivedAt = null,
}: {
  name: string
  isPlaceholder?: boolean
  archivedAt?: Date | null
}) => {
  return db.user.create({
    data: {
      id: tag(name),
      name: tag(name),
      email: `${tag(name)}@test.local`,
      role: "user",
      isPlaceholder,
      archivedAt,
    },
  })
}

const searchParams: UsersTableSchema = {
  name: PREFIX,
  page: 1,
  perPage: 50,
  sort: [{ id: "createdAt", desc: true }],
  from: "",
  to: "",
  operator: "and",
}

afterAll(async () => {
  await db.user.deleteMany({ where: { id: { startsWith: PREFIX } } })
})

describe("admin user queries", () => {
  it("excludes placeholder and archived users from the admin users table query", async () => {
    const [active, placeholder, archived, archivedPlaceholder] = await Promise.all([
      createUser({ name: "active" }),
      createUser({ name: "placeholder", isPlaceholder: true }),
      createUser({ name: "archived", archivedAt: new Date() }),
      createUser({ name: "archived-placeholder", isPlaceholder: true, archivedAt: new Date() }),
    ])

    const result = await findUsers(searchParams)
    const ids = result.users.map(user => user.id)

    expect(ids).toContain(active.id)
    expect(ids).not.toContain(placeholder.id)
    expect(ids).not.toContain(archived.id)
    expect(ids).not.toContain(archivedPlaceholder.id)
  })

  it("excludes placeholder and archived users from generic admin user pickers", async () => {
    const [active, placeholder, archived] = await Promise.all([
      createUser({ name: "picker-active" }),
      createUser({ name: "picker-placeholder", isPlaceholder: true }),
      createUser({ name: "picker-archived", archivedAt: new Date() }),
    ])

    const users = await findUserList()
    const ids = users.map(user => user.id)

    expect(ids).toContain(active.id)
    expect(ids).not.toContain(placeholder.id)
    expect(ids).not.toContain(archived.id)
  })
})
