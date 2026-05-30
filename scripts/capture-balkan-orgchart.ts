/**
 * PWCC Capture Script — Balkan OrgChart JS
 *
 * Captures DOM structure, visual patterns, responsive behavior, and interactions
 * from the Balkan OrgChart JS demo page for the "Org Chart Board" lineage template.
 *
 * Usage:
 *   npx playwright test scripts/capture-balkan-orgchart.ts
 *   # or directly:
 *   npx tsx scripts/capture-balkan-orgchart.ts
 *
 * Output: test-results/balkan-orgchart/
 */

import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const TARGET_URL = "https://balkan.app/OrgChartJS";
const OUT_DIR = join(process.cwd(), "test-results", "balkan-orgchart");

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });

  // Desktop viewport
  const desktopCtx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const desktop = await desktopCtx.newPage();
  await desktop.goto(TARGET_URL, { waitUntil: "networkidle" });
  await desktop.waitForTimeout(2000);

  // 1. Full-page screenshot — desktop
  await desktop.screenshot({
    path: join(OUT_DIR, "01-desktop-full.png"),
    fullPage: true,
  });
  console.log("✓ Desktop full-page screenshot");

  // 2. Capture the org chart container DOM structure
  const domSnapshot = await desktop.evaluate(() => {
    const chart = document.querySelector("[id*=chart], [id*=org], .boc-light, svg, canvas");
    if (!chart) return "No chart container found";

    function serialize(el: Element, depth = 0): string {
      const indent = "  ".repeat(depth);
      const tag = el.tagName.toLowerCase();
      const id = el.id ? `#${el.id}` : "";
      const cls = el.className && typeof el.className === "string"
        ? `.${el.className.split(" ").filter(Boolean).slice(0, 3).join(".")}`
        : "";
      const kids = Array.from(el.children)
        .map((c) => serialize(c, depth + 1))
        .join("\n");
      const text = el.children.length === 0 ? ` "${el.textContent?.trim().slice(0, 60)}"` : "";
      return `${indent}<${tag}${id}${cls}>${text}\n${kids}`;
    }

    return serialize(chart);
  });

  writeFileSync(join(OUT_DIR, "02-dom-structure.txt"), domSnapshot);
  console.log("✓ DOM structure captured");

  // 3. Capture computed styles of key elements (cards, connectors, panels)
  const styles = await desktop.evaluate(() => {
    const targets = [
      "[class*=node], [class*=card], [class*=person]",
      "[class*=connector], [class*=link], line, path",
      "[class*=panel], [class*=sidebar], [class*=detail]",
    ];
    const results: Record<string, Record<string, string>> = {};
    for (const sel of targets) {
      const el = document.querySelector(sel);
      if (!el) continue;
      const cs = getComputedStyle(el);
      results[sel] = {
        width: cs.width,
        height: cs.height,
        background: cs.background,
        border: cs.border,
        borderRadius: cs.borderRadius,
        padding: cs.padding,
        fontFamily: cs.fontFamily,
        fontSize: cs.fontSize,
        color: cs.color,
        boxShadow: cs.boxShadow,
        display: cs.display,
        position: cs.position,
      };
    }
    return results;
  });

  writeFileSync(join(OUT_DIR, "03-computed-styles.json"), JSON.stringify(styles, null, 2));
  console.log("✓ Computed styles captured");

  // 4. Try clicking a node to capture side panel / expanded state
  const nodeClicked = await desktop.evaluate(() => {
    const node = document.querySelector(
      "[class*=node], [class*=card], [class*=person], [data-n-id]"
    );
    if (node instanceof HTMLElement) {
      node.click();
      return true;
    }
    return false;
  });

  if (nodeClicked) {
    await desktop.waitForTimeout(1500);
    await desktop.screenshot({
      path: join(OUT_DIR, "04-node-clicked.png"),
      fullPage: true,
    });
    console.log("✓ Node-clicked screenshot");
  }

  // 5. Try expanding a child group
  const expandClicked = await desktop.evaluate(() => {
    const expander = document.querySelector(
      "[class*=expand], [class*=toggle], [class*=collapse], [class*=plus]"
    );
    if (expander instanceof HTMLElement) {
      expander.click();
      return true;
    }
    return false;
  });

  if (expandClicked) {
    await desktop.waitForTimeout(1000);
    await desktop.screenshot({
      path: join(OUT_DIR, "05-expanded.png"),
      fullPage: true,
    });
    console.log("✓ Expanded-group screenshot");
  }

  // 6. Mobile viewport
  const mobileCtx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const mobile = await mobileCtx.newPage();
  await mobile.goto(TARGET_URL, { waitUntil: "networkidle" });
  await mobile.waitForTimeout(2000);

  await mobile.screenshot({
    path: join(OUT_DIR, "06-mobile-full.png"),
    fullPage: true,
  });
  console.log("✓ Mobile full-page screenshot");

  // 7. Capture any animation/transition CSS
  const animations = await desktop.evaluate(() => {
    const sheets = Array.from(document.styleSheets);
    const results: string[] = [];
    for (const sheet of sheets) {
      try {
        for (const rule of Array.from(sheet.cssRules)) {
          const text = rule.cssText;
          if (
            text.includes("transition") ||
            text.includes("animation") ||
            text.includes("@keyframes") ||
            text.includes("cubic-bezier")
          ) {
            results.push(text.slice(0, 500));
          }
        }
      } catch {
        // cross-origin stylesheet, skip
      }
    }
    return results;
  });

  writeFileSync(join(OUT_DIR, "07-animations.json"), JSON.stringify(animations, null, 2));
  console.log("✓ Animation/transition CSS captured");

  await browser.close();
  console.log(`\n✅ All captures saved to ${OUT_DIR}`);
}

main().catch((err) => {
  console.error("Capture failed:", err);
  process.exit(1);
});
