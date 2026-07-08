import type { Prisma } from "~/.generated/prisma/client"
import {
  buildAdminListWhere,
  createdAtRangeExpression,
  getAdminListQueryParts,
  runAdminListTransaction,
} from "~/server/admin/list-query"
import { db } from "~/services/db"
import type { PeopleTableSchema } from "./schema"

/**
 * The `select` for one People row. Keyed on **Passport** — the identity source of truth
 * (ADR 0025) — so EVERY Person surfaces: accountless roster/import placeholders
 * (`userId == null`, no User row), admin add-person placeholders (`user.isPlaceholder`),
 * and real signups. `db.user.findMany` (which `findUsers` uses) can only ever see the
 * account-linked populations and additionally filters `isPlaceholder:false`, so it hides
 * the roster placeholders entirely — this query is what un-hides them.
 *
 * The member-column includes below mirror the exact shapes the canonical resolvers in
 * `lib/lineage/canvas-model.ts` read off `node.passport`: `rankAwardsEarned` pre-ordered
 * by `rank.sortOrder desc` (belt), `affiliations[0].organization` (school). See the
 * Passport-native mirrors in `../people/columns` (people-table-columns) that cite them.
 */
export const peopleRowSelect = {
  id: true,
  displayName: true,
  legalFirstName: true,
  legalLastName: true,
  createdAt: true,
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      banned: true,
      isPlaceholder: true,
    },
  },
  // Belt/rank — highest awarded belt is `[0]` (canvas-model `memberTopRankAward`), so
  // pre-order by Rank.sortOrder desc here to keep that invariant.
  rankAwardsEarned: {
    orderBy: { rank: { sortOrder: "desc" } },
    select: {
      id: true,
      rank: {
        select: {
          id: true,
          name: true,
          colorHex: true,
          sortOrder: true,
          rankSystem: {
            select: {
              discipline: { select: { id: true, name: true } },
            },
          },
        },
      },
    },
  },
  // School — `memberSchool`/`memberSchoolLabel` read `affiliations[0]` (org name, else
  // free-text `schoolName`). `isCurrent desc, createdAt desc` puts the current/newest first.
  // Admin-surface divergence (intentional, Doug-affirmed SESSION_0510): canonical filters
  // `where:{isCurrent:true}` and adds a D-023 Membership fallback; the admin list shows the
  // person's newest affiliation even if none is current and drops the Membership fallback —
  // zero-impact today (0/466 passports have only non-current affiliations).
  affiliations: {
    orderBy: [{ isCurrent: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      schoolName: true,
      organization: { select: { id: true, name: true } },
    },
  },
  // Verification is a NODE-level axis (`node.isVerified`); a passport with no lineageNode
  // renders `—`. `relationshipsTo` (INSTRUCTOR_STUDENT edges pointing INTO this node) is
  // the "Listed under" parent instructor — admin sees all, so no visibility filter here.
  lineageNode: {
    select: {
      id: true,
      isVerified: true,
      relationshipsTo: {
        where: { type: "INSTRUCTOR_STUDENT" as const },
        take: 1,
        select: {
          id: true,
          fromNode: {
            select: {
              id: true,
              slug: true,
              passport: {
                select: { displayName: true, user: { select: { name: true } } },
              },
            },
          },
        },
      },
    },
  },
} satisfies Prisma.PassportSelect

export type PersonRow = Prisma.PassportGetPayload<{ select: typeof peopleRowSelect }>

/**
 * The Passport-keyed People list for `/app/users`. Same admin-list helpers as `findUsers`
 * (`buildAdminListWhere`/`getAdminListQueryParts`/`runAdminListTransaction`) — only the
 * root model changes (`db.passport` not `db.user`), which is the whole point: it surfaces
 * accountless placeholders that the account-keyed query structurally cannot.
 */
export const findPeople = async (search: PeopleTableSchema) => {
  const { displayName, perPage, operator } = search
  const { offset, orderBy, fromDate, toDate } =
    getAdminListQueryParts<Prisma.PassportOrderByWithRelationInput>(search)

  const expressions: (Prisma.PassportWhereInput | undefined)[] = [
    // Search — one term fanned over the Passport identity fields AND the linked account.
    displayName
      ? {
          OR: [
            { displayName: { contains: displayName, mode: "insensitive" } },
            { legalFirstName: { contains: displayName, mode: "insensitive" } },
            { legalLastName: { contains: displayName, mode: "insensitive" } },
            { user: { name: { contains: displayName, mode: "insensitive" } } },
            { user: { email: { contains: displayName, mode: "insensitive" } } },
          ],
        }
      : undefined,

    // Filter by createdAt
    createdAtRangeExpression<Prisma.PassportWhereInput>(fromDate, toDate),
  ]

  const where = buildAdminListWhere<Prisma.PassportWhereInput>({
    expressions,
    operator,
    omitEmptyOperator: true,
  })

  const {
    rows: people,
    total: peopleTotal,
    pageCount,
  } = await runAdminListTransaction({
    perPage,
    findMany: () =>
      db.passport.findMany({
        where,
        select: peopleRowSelect,
        orderBy,
        take: perPage,
        skip: offset,
      }),
    count: () => db.passport.count({ where }),
  })

  return { people, peopleTotal, pageCount }
}
