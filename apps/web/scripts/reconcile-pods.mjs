#!/usr/bin/env node
/**
 * reconcile-pods.mjs (READ-ONLY → writes /tmp JSON) — Phase 0 of the BBL Pods
 * full-fidelity re-import. Parses one or more rich Pods CSV exports, extracts the
 * per-belt promotion ladder + profile fields, resolves promoter/school *picks*
 * (post-IDs) to names using the union of all rows, and emits reconciled-pods.json.
 *
 * Convention-aware per belt:
 *   date:  <belt>_promotion_date  (also white_belt_start_date_brazilian_jiu_jitsu)
 *   who:   who_promoted_you_to_<belt>   OR  name_of_coaches_that_gave_you_your_<belt>
 *   where: where_you_were_promoted_to_<belt>
 *
 *   node reconcile-pods.mjs <export1.csv> [export2.csv ...]
 */
import { readFileSync, writeFileSync } from "node:fs"

function parseCSV(s) {
  const rows = []
  let row = [],
    field = "",
    inQ = false
  for (let i = 0; i < s.length; i++) {
    const c = s[i]
    if (inQ) {
      if (c === '"') {
        if (s[i + 1] === '"') {
          field += '"'
          i++
        } else inQ = false
      } else field += c
    } else if (c === '"') inQ = true
    else if (c === ",") {
      row.push(field)
      field = ""
    } else if (c === "\r") {
    } else if (c === "\n") {
      row.push(field)
      rows.push(row)
      row = []
      field = ""
    } else field += c
  }
  if (field.length || row.length) {
    row.push(field)
    rows.push(row)
  }
  return rows
}

// belt key → RankAward shortName (mirrors prisma BJJ ranks).
const BELTS = [
  ["white_belt", "W0"],
  ["blue_belt", "BL0"],
  ["purple_belt", "P0"],
  ["brown_belt", "BR0"],
  ["black_belt", "BK0"],
  ["1st_degree_black_belt", "BK1"],
  ["2nd_degree_black_belt", "BK2"],
  ["3rd_degree_black_belt", "BK3"],
  ["4th_degree_black_belt", "BK4"],
  ["5th_degree_black_belt", "BK5"],
  ["6th_degree_black_belt", "BK6"],
  ["7th_degree_black_belt", "CB7"],
  ["8th_degree_coral_belt", "CB8"],
  ["9th_degree_coral_belt", "R9"],
  ["10th_degree_coral_belt", "R10"],
]

const real = v => {
  const t = (v ?? "").trim()
  return t && t !== "0000-00-00" && t !== "0" && t.toLowerCase() !== "null"
}

// Parse "July 8th, 2009" | "2009-07-08" | "June 1st, 2004" → ISO yyyy-mm-dd (or null).
const MONTHS = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
}
function parseDate(v) {
  const t = (v ?? "").trim()
  if (!real(t)) return null
  let m = t.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (m) return `${m[1]}-${m[2]}-${m[3]}`
  m = t.match(/([A-Za-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})/)
  if (m) {
    const mon = MONTHS[m[1].toLowerCase()]
    if (mon) return `${m[3]}-${String(mon).padStart(2, "0")}-${String(+m[2]).padStart(2, "0")}`
  }
  m = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (m) return `${m[3]}-${String(+m[1]).padStart(2, "0")}-${String(+m[2]).padStart(2, "0")}`
  return null // unparseable — flag, don't guess
}

const SPAM = /cialis|viagra|tadalafil|http|<a\s|nirmatrelvir|\bbuy\b.*\bonline\b/i

// ── load all files; build a shared id→name map first. ────────────────────────
const files = process.argv.slice(2)
const parsed = files.map(f => {
  const rows = parseCSV(readFileSync(f, "utf8"))
  const header = rows[0].map(h => h.replace(/^﻿/, "").trim())
  const data = rows.slice(1).filter(r => r.length > 1)
  return { f, header, data }
})

const idToName = new Map()
for (const { header, data } of parsed) {
  const idI = header.indexOf("ID")
  const titleI = header.indexOf("Title")
  for (const r of data) {
    const id = (r[idI] ?? "").trim()
    const name = (r[titleI] ?? "").trim()
    if (id && name) idToName.set(id, name)
  }
}
// Pods pick fields export as either a bare post-id, a plain name, or a full
// PHP-serialized post/term object. Unwrap to the human name.
const pickName = v => {
  const t = (v ?? "").trim()
  if (!real(t)) return null
  if (t.startsWith("a:") && t.includes("{")) {
    let m = t.match(/post_title";s:\d+:"([^"]*)"/) // related post (member/school)
    if (m) return m[1]
    m = t.match(/"name";s:\d+:"([^"]*)"/) // related term (rank)
    if (m) return m[1]
    return null
  }
  if (/^\d+$/.test(t)) return idToName.get(t) ?? `#${t}` // unresolved post-id
  return t
}

// ── reconcile per person across all files. ───────────────────────────────────
const byKey = new Map()
const norm = s =>
  (s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
let skippedSpam = 0,
  skippedDraft = 0

for (const { header, data } of parsed) {
  const col = name => header.indexOf(name)
  const get = (r, name) => {
    const i = col(name)
    return i >= 0 ? (r[i] ?? "").trim() : ""
  }
  for (const r of data) {
    const title = get(r, "Title") || get(r, "full_name")
    const status = get(r, "Status")
    const content = get(r, "Content") || get(r, "bio") || get(r, "biography")
    if (!title) continue
    if (SPAM.test(title) || SPAM.test(content)) {
      skippedSpam++
      continue
    }
    if (status && status !== "publish") {
      skippedDraft++
      continue
    }
    const key = norm(title)
    let p = byKey.get(key)
    if (!p) {
      p = { name: title, slug: get(r, "Slug"), ladder: [], sources: [] }
      byKey.set(key, p)
    }
    p.sources.push(get(r, "Post Type") || "?")
    // profile fields (first non-empty wins)
    const setIf = (field, v) => {
      if (real(v) && !p[field]) p[field] = v.trim()
    }
    setIf("bio", content)
    setIf("dob", get(r, "date_of_birth"))
    setIf("placeOfBirth", get(r, "place_of_birth"))
    setIf("residence", get(r, "current_place_of_residence"))
    setIf("currentRank", pickName(get(r, "current_rank_in_bjj")) || "")
    setIf("homeGym", get(r, "home_gym"))
    setIf("currentSchool", get(r, "current_school"))
    setIf("status_role", get(r, "student_instructor_owner_status"))
    setIf("youtube", get(r, "youtube_channel"))
    setIf("facebook", get(r, "facebook_page_member"))
    setIf("instagram", get(r, "instagram_page_member"))
    setIf("wpUserId", get(r, "wp_user_id"))
    // belt ladder
    for (const [belt, shortName] of BELTS) {
      const dateRaw =
        get(r, `${belt}_promotion_date`) ||
        (belt === "white_belt" ? get(r, "white_belt_start_date_brazilian_jiu_jitsu") : "")
      const whoRaw =
        get(r, `who_promoted_you_to_${belt}`) ||
        get(r, `name_of_coaches_that_gave_you_your_${belt}`)
      const whereRaw = get(r, `where_you_were_promoted_to_${belt}`)
      const date = parseDate(dateRaw)
      const promotedBy = pickName(whoRaw)
      const promotedAt = pickName(whereRaw)
      if (date || promotedBy) {
        // merge into existing ladder entry for this belt if present
        let e = p.ladder.find(x => x.shortName === shortName)
        if (!e) {
          e = { belt, shortName }
          p.ladder.push(e)
        }
        if (date && !e.date) e.date = date
        if (dateRaw && !date && !e.dateRaw) e.dateRaw = dateRaw // unparseable, keep raw
        if (promotedBy && !e.promotedBy) e.promotedBy = promotedBy
        if (promotedAt && !e.promotedAt) e.promotedAt = promotedAt
      }
    }
  }
}

const people = [...byKey.values()]
const withLadder = people.filter(p => p.ladder.length)
const withDate = people.filter(p => p.ladder.some(e => e.date))
writeFileSync(
  "/tmp/bbl-export/reconciled-pods.json",
  JSON.stringify({ people, generatedFrom: files }, null, 2),
)

console.log(
  `Parsed ${files.length} file(s); skipped ${skippedSpam} spam, ${skippedDraft} non-publish.`,
)
console.log(`People: ${people.length}`)
console.log(`  with any belt ladder entry: ${withLadder.length}`)
console.log(`  with ≥1 parsed promotion DATE: ${withDate.length}`)
console.log(`\n=== sample dated timelines ===`)
for (const p of withDate.slice(0, 8)) {
  console.log(`\n● ${p.name}  (rank: ${p.currentRank || "?"})`)
  for (const e of p.ladder.filter(x => x.date || x.promotedBy)) {
    console.log(
      `   ${e.shortName.padEnd(4)} ${(e.date || e.dateRaw || "—").padEnd(12)} by ${e.promotedBy || "—"}${e.promotedAt ? " · at " + e.promotedAt : ""}`,
    )
  }
}
console.log(`\n→ /tmp/bbl-export/reconciled-pods.json`)
