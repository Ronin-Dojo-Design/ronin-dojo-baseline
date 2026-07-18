/**
 * SESSION_0556 headless verification — B1 graph tooltips + C2 filter pill.
 * Runs against the worktree dev server on :3056 (Browser-pane preview can't serve worktrees).
 * Usage: node verify-0556.mjs
 */
import { chromium } from "playwright"

const BASE = "http://localhost:3056"
const SHOTS = process.env.SHOTS_DIR ?? "/tmp/0556-shots"
const results = []
const check = (name, ok, detail = "") => {
  results.push({ name, ok, detail })
  console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`)
}

import { mkdirSync } from "node:fs"
mkdirSync(SHOTS, { recursive: true })

const browser = await chromium.launch()

const loadGraph = async context => {
  const page = await context.newPage()
  const errors = []
  page.on("console", m => m.type() === "error" && errors.push(m.text()))
  page.on("pageerror", e => errors.push(String(e)))
  await page.goto(`${BASE}/techniques/graph`, { waitUntil: "domcontentloaded", timeout: 120000 })
  await page.waitForSelector("[data-graph-node-type]", { timeout: 90000 })
  return { page, errors }
}

// ---------- Desktop pass ----------
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
const { page, errors } = await loadGraph(ctx)

const nodeCount = await page.locator("[data-graph-node-type]").count()
check("graph renders nodes", nodeCount > 10, `${nodeCount} nodes`)

// B1: hover tooltip with ~250ms delay
const firstNode = page.locator("[data-graph-node-type]").first()
await firstNode.hover()
const hoverStart = Date.now()
await page.waitForSelector('[data-slot="tooltip-content"]', { timeout: 5000 })
const openMs = Date.now() - hoverStart
check("tooltip opens on hover", true, `${openMs}ms after hover (delay 250ms)`)

const tooltip = page.locator('[data-slot="tooltip-content"]').first()
const tooltipText = await tooltip.innerText()
const tooltipHtml = await tooltip.evaluate(el => el.outerHTML)
check("tooltip has meta text", tooltipText.trim().length > 0, JSON.stringify(tooltipText.slice(0, 90)))

// No-leak: tooltip DOM must carry no media element or URL-bearing attribute
const leakTokens = ["<img", "<video", "<source", "poster=", 'src="', "blob:", "r2.dev", "https://"]
const leaks = leakTokens.filter(t => tooltipHtml.toLowerCase().includes(t))
check("tooltip DOM media/no-leak clean", leaks.length === 0, leaks.join(",") || "no media tokens")

await page.screenshot({ path: `${SHOTS}/0556-b1-tooltip-hover-desktop.png` })

// Tooltip closes when pointer leaves
await page.mouse.move(20, 700)
await page.waitForSelector('[data-slot="tooltip-content"]', { state: "detached", timeout: 5000 })
check("tooltip closes on leave", true)

// B1 keyboard: real Tab presses until a graph node is focused
let focusedNode = false
for (let i = 0; i < 80; i++) {
  await page.keyboard.press("Tab")
  focusedNode = await page.evaluate(() => document.activeElement?.hasAttribute("data-graph-node-type") ?? false)
  if (focusedNode) break
}
check("keyboard reaches graph node", focusedNode)
if (focusedNode) {
  await page.waitForSelector('[data-slot="tooltip-content"]', { timeout: 3000 }).catch(() => {})
  const kbTooltip = await page.locator('[data-slot="tooltip-content"]').count()
  check("tooltip opens on keyboard focus", kbTooltip > 0)
  await page.screenshot({ path: `${SHOTS}/0556-b1-tooltip-keyboard.png` })
}
await page.keyboard.press("Escape")

// C2: filter pill
const group = page.locator('[role="group"][aria-label="Filter techniques by type"]')
check("filter group present", (await group.count()) === 1)
const chip = name => group.getByRole("button", { name })

const allActive = await chip("All").getAttribute("aria-pressed")
check("All chip active initially", allActive === "true")
const pillInActive = await group.locator('button[aria-pressed="true"] > span.absolute').count()
check("pill rendered in active chip", pillInActive === 1)

await chip("Submissions").click()
await page.waitForTimeout(400) // let the pill tween (125ms) settle
const subActive = await chip("Submissions").getAttribute("aria-pressed")
const pillMoved = await group.locator('button[aria-pressed="true"] > span.absolute').count()
const visibleTypes = await page.$$eval("[data-graph-node-type]", els => [...new Set(els.map(e => e.dataset.graphNodeType))])
check("Submissions chip activates", subActive === "true")
check("pill follows active chip", pillMoved === 1)
check("filter narrows nodes", visibleTypes.length === 1 && visibleTypes[0] === "submission", visibleTypes.join(","))
await page.screenshot({ path: `${SHOTS}/0556-c2-pill-submissions.png` })

await chip("All").click()
await page.waitForTimeout(300)
const restored = await page.locator("[data-graph-node-type]").count()
check("All restores nodes", restored === nodeCount, `${restored}/${nodeCount}`)

// Node click still opens the dialog (tooltip wrap must not swallow clicks)
await firstNode.click()
const dialogVisible = await page.waitForSelector('[role="dialog"]', { timeout: 5000 }).then(() => true).catch(() => false)
check("node click opens dialog", dialogVisible)
if (dialogVisible) await page.keyboard.press("Escape")

check("desktop console clean", errors.length === 0, errors.slice(0, 3).join(" | ") || "0 errors")
await ctx.close()

// ---------- Reduced-motion pass ----------
const rctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: "reduce" })
const { page: rpage, errors: rerrors } = await loadGraph(rctx)
const rgroup = rpage.locator('[role="group"][aria-label="Filter techniques by type"]')
await rgroup.getByRole("button", { name: "Counters" }).click()
await rpage.waitForTimeout(200)
const rPill = await rgroup.locator('button[aria-pressed="true"] > span.absolute').count()
const rTypes = await rpage.$$eval("[data-graph-node-type]", els => [...new Set(els.map(e => e.dataset.graphNodeType))])
check("reduced-motion: pill swaps instantly", rPill === 1)
check("reduced-motion: filter works", rTypes.length === 1 && rTypes[0] === "counter", rTypes.join(","))
await rpage.locator("[data-graph-node-type]").first().hover()
const rTooltip = await rpage.waitForSelector('[data-slot="tooltip-content"]', { timeout: 5000 }).then(() => true).catch(() => false)
check("reduced-motion: tooltip still opens", rTooltip)
await rpage.screenshot({ path: `${SHOTS}/0556-reduced-motion.png` })
check("reduced-motion console clean", rerrors.length === 0, rerrors.slice(0, 3).join(" | ") || "0 errors")
await rctx.close()

// ---------- Mobile layout pass ----------
const mctx = await browser.newContext({ viewport: { width: 375, height: 812 } })
const { page: mpage, errors: merrors } = await loadGraph(mctx)
const mGroupVisible = await mpage.locator('[role="group"][aria-label="Filter techniques by type"]').isVisible()
check("mobile: filter group visible", mGroupVisible)
await mpage.locator('[role="group"] button', { hasText: "Positions" }).first().click()
await mpage.waitForTimeout(300)
const mTypes = await mpage.$$eval("[data-graph-node-type]", els => [...new Set(els.map(e => e.dataset.graphNodeType))])
check("mobile: filter works", mTypes.length === 1 && mTypes[0] === "position", mTypes.join(","))
await mpage.screenshot({ path: `${SHOTS}/0556-mobile.png` })
check("mobile console clean", merrors.length === 0, merrors.slice(0, 3).join(" | ") || "0 errors")
await mctx.close()

await browser.close()

const failed = results.filter(r => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
process.exit(failed.length ? 1 : 0)
