import { chromium } from "playwright"

const URL = "http://localhost:3000/disciplines/bjj"
const OUT = "/tmp/session-0175-task-03"

const browser = await chromium.launch()
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
})
const page = await ctx.newPage()

console.log("Navigating to", URL)
await page.goto(URL, { waitUntil: "networkidle", timeout: 60000 })
await page.waitForTimeout(1500)

// Scroll to lineage section
const lineageHeading = page.getByRole("heading", { name: "Lineage", level: 3 })
await lineageHeading.scrollIntoViewIfNeeded()
await page.waitForTimeout(800)

// Tree screenshot — capture full viewport area around the section
await page.screenshot({ path: `${OUT}/render-proof-tree.png`, fullPage: false })
console.log("Saved tree screenshot")

// Click first node card
const firstCard = page.locator('button[aria-label^="Open lineage profile"]').first()
await firstCard.click()
await page.waitForTimeout(1200)

// Drawer screenshot
await page.screenshot({ path: `${OUT}/render-proof-drawer.png`, fullPage: false })
console.log("Saved drawer screenshot")

await browser.close()
