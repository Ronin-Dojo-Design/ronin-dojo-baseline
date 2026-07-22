/**
 * WL-P3-33 — Passport-keyed People query population coverage.
 *
 * Locks in the SESSION_0510 behavior Doug proved manually: `findPeople`
 * returns real account passports, userless roster placeholders, and
 * add-person placeholder users, with enough account/null state for the UI
 * action gates to distinguish them.
 *
 * Run: cd apps/web && bun test server/admin/people/queries.test.ts
 */

// @ts-expect-error — bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { afterAll, describe, expect, it } from "bun:test"
import { findPeople } from "~/server/admin/people/queries"
import type { PeopleTableSchema } from "~/server/admin/people/schema"
import { db } from "~/services/db"

const TS = Date.now()
const PREFIX = `wl-p3-33-people-${TS}`
const tag = (name: string) => `${PREFIX}-${name}`
const populationTag = (name: string) => tag(`population-${name}`)

const searchParams: PeopleTableSchema = {
  displayName: tag("population"),
  page: 1,
  perPage: 50,
  sort: [{ id: "createdAt", desc: false }],
  from: "",
  to: "",
  operator: "and",
}

afterAll(async () => {
  await db.passport.deleteMany({
    where: {
      OR: [
        { displayName: { startsWith: PREFIX } },
        { legalFirstName: { startsWith: PREFIX } },
        { legalLastName: { startsWith: PREFIX } },
        { user: { name: { startsWith: PREFIX } } },
        { user: { email: { startsWith: PREFIX } } },
      ],
    },
  })
  await db.user.deleteMany({ where: { email: { startsWith: PREFIX } } })
})

describe("findPeople", () => {
  it("returns accountful, accountless-placeholder, and placeholder-account people", async () => {
    const accountfulUser = await db.user.create({
      data: {
        name: populationTag("accountful-user"),
        email: `${populationTag("accountful-user")}@test.local`,
        role: "user",
      },
    })
    const placeholderUser = await db.user.create({
      data: {
        name: populationTag("placeholder-user"),
        email: `${populationTag("placeholder-user")}@test.local`,
        role: "user",
        isPlaceholder: true,
      },
    })

    const [accountful, accountlessPlaceholder, placeholderAccount] = await Promise.all([
      db.passport.create({
        data: {
          userId: accountfulUser.id,
          displayName: populationTag("accountful-passport"),
          legalFirstName: populationTag("accountful-legal-first"),
        },
        select: { id: true },
      }),
      db.passport.create({
        data: {
          displayName: populationTag("accountless-placeholder"),
          legalLastName: populationTag("accountless-legal-last"),
        },
        select: { id: true },
      }),
      db.passport.create({
        data: {
          userId: placeholderUser.id,
          displayName: populationTag("placeholder-account"),
        },
        select: { id: true },
      }),
    ])

    const result = await findPeople(searchParams)
    const peopleById = new Map(result.people.map(person => [person.id, person]))

    expect(result.peopleTotal).toBe(3)
    expect(result.pageCount).toBe(1)
    expect(peopleById.get(accountful.id)?.user?.id).toBe(accountfulUser.id)
    expect(peopleById.get(accountful.id)?.user?.isPlaceholder).toBe(false)
    expect(peopleById.get(accountlessPlaceholder.id)?.user).toBeNull()
    expect(peopleById.get(placeholderAccount.id)?.user?.id).toBe(placeholderUser.id)
    expect(peopleById.get(placeholderAccount.id)?.user?.isPlaceholder).toBe(true)
  })

  it("keeps placeholder accounts searchable through linked user fields", async () => {
    const placeholderUser = await db.user.create({
      data: {
        name: tag("linked-search-placeholder"),
        email: `${tag("linked-search-placeholder")}@test.local`,
        role: "user",
        isPlaceholder: true,
      },
    })
    const placeholderPassport = await db.passport.create({
      data: {
        userId: placeholderUser.id,
        displayName: "placeholder-account-without-prefix",
      },
      select: { id: true },
    })

    const result = await findPeople({
      ...searchParams,
      displayName: tag("linked-search-placeholder"),
    })

    expect(result.people.map(person => person.id)).toContain(placeholderPassport.id)
    expect(
      result.people.find(person => person.id === placeholderPassport.id)?.user?.isPlaceholder,
    ).toBe(true)
  })
})
