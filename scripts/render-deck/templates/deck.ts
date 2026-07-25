// scripts/render-deck/templates/deck.ts
//
// Renders a parsed Outline into ONE self-contained HTML file: inline CSS, no external
// assets, 16:9 slides, arrow-key + click nav, slide counter, print-friendly
// one-slide-per-page CSS.

import { getBrandTokens } from "../tokens";
import type { Outline, Slide, SlideBlock } from "../core/parse";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Minimal inline markdown — **bold**, *italic*, `code` — over already-escaped text (XSS-safe). */
export function renderInline(text: string): string {
  let out = escapeHtml(text);
  out = out.replace(/`([^`]+)`/g, "<code>$1</code>");
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  return out;
}

function renderBlock(block: SlideBlock): string {
  switch (block.type) {
    case "bullets":
      return `<ul class="list">${block.items.map((item) => `<li>${renderInline(item)}</li>`).join("")}</ul>`;
    case "paragraph":
      return `<p class="lede">${renderInline(block.text)}</p>`;
    case "quote":
      return `<blockquote>${renderInline(block.text)}</blockquote>`;
    default: {
      const exhaustive: never = block;
      throw new Error(`render-deck: unknown block type ${JSON.stringify(exhaustive)}`);
    }
  }
}

function renderNotes(notes: string | undefined): string {
  if (!notes) return "";
  return `\n  <aside class="notes" hidden aria-hidden="true">${renderInline(notes)}</aside>`;
}

function renderSlide(slide: Slide, index: number): string {
  const dataTitle = escapeHtml(slide.title);

  if (slide.layout === "statement") {
    const quote = slide.blocks[0];
    const text = quote && quote.type === "quote" ? quote.text : "";
    return `<section class="slide statement" data-index="${index}" data-title="${dataTitle}">
  <div class="inner">
    <p class="statement-text">${renderInline(text)}</p>
  </div>${renderNotes(slide.notes)}
</section>`;
  }

  const body = slide.blocks.map(renderBlock).join("\n    ");

  return `<section class="slide" data-index="${index}" data-title="${dataTitle}">
  <div class="inner">
    <h2 class="title">${renderInline(slide.title)}</h2>
    ${body}
  </div>${renderNotes(slide.notes)}
</section>`;
}

function renderTitleSlide(outline: Outline, brandName: string): string {
  const { frontmatter } = outline;
  const subtitle = frontmatter.subtitle
    ? `\n    <p class="lede">${renderInline(frontmatter.subtitle)}</p>`
    : "";
  const meta = [frontmatter.author, frontmatter.date].filter(Boolean).join(" · ");
  const metaHtml = meta ? `\n    <p class="fine">${renderInline(meta)}</p>` : "";

  return `<section class="slide is-active" data-index="0" data-title="Title">
  <div class="inner">
    <p class="eyebrow">${escapeHtml(brandName)}</p>
    <h1 class="title">${renderInline(frontmatter.title)}</h1>${subtitle}${metaHtml}
  </div>
</section>`;
}

export function renderDeck(outline: Outline): string {
  const tokens = getBrandTokens(outline.frontmatter.brand);
  const titleSlide = renderTitleSlide(outline, tokens.name);
  const slidesHtml = outline.slides.map((slide, i) => renderSlide(slide, i + 1)).join("\n");
  const total = outline.slides.length + 1;
  const pageTitle = escapeHtml(outline.frontmatter.title);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${pageTitle}</title>
<style>
:root{
  --bg:${tokens.bg};
  --surface:${tokens.surface};
  --surface-elevated:${tokens.surfaceElevated};
  --border:${tokens.border};
  --primary:${tokens.primary};
  --primary-hover:${tokens.primaryHover};
  --primary-deep:${tokens.primaryDeep};
  --ink:${tokens.ink};
  --muted:${tokens.muted};
  --muted-deep:${tokens.mutedDeep};
  --font-display:${tokens.fontDisplay};
  --font-sans:${tokens.fontSans};
}
*{box-sizing:border-box;}
html,body{margin:0;padding:0;height:100%;background:var(--bg);}
body{font-family:var(--font-sans);color:var(--ink);-webkit-font-smoothing:antialiased;overflow:hidden;}
.deck{position:relative;width:100vw;height:100vh;}
.slide{position:fixed;inset:0;display:none;flex-direction:column;justify-content:center;padding:6.5vh 8.5vw 11vh;overflow-y:auto;aspect-ratio:16/9;}
.slide.is-active{display:flex;}
.inner{max-width:74rem;width:100%;margin:0 auto;}
.eyebrow{font-family:var(--font-display);font-weight:700;letter-spacing:.18em;text-transform:uppercase;font-size:.74rem;color:var(--primary);margin:0 0 .85rem;}
h1.title,h2.title{font-family:var(--font-display);font-weight:800;line-height:1.05;margin:0 0 1.15rem;color:var(--ink);}
h1.title{font-size:clamp(2.3rem,5.6vw,4.3rem);}
h2.title{font-size:clamp(1.7rem,3.6vw,2.65rem);}
.lede{font-size:clamp(1rem,1.25vw,1.18rem);color:var(--muted);max-width:46rem;line-height:1.62;margin:0 0 1rem;}
.fine{font-size:.85rem;color:var(--muted-deep);line-height:1.55;}
ul.list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:.75rem;}
ul.list li{position:relative;padding-left:1.6rem;font-size:1rem;line-height:1.55;color:var(--ink);}
ul.list li::before{content:"\\2022";position:absolute;left:0;top:0;color:var(--primary);font-weight:700;}
blockquote{margin:0 0 1rem;padding:0 0 0 1.2rem;border-left:3px solid var(--primary);color:var(--muted);font-size:1.05rem;line-height:1.6;}
code{background:var(--surface-elevated);border:1px solid var(--border);border-radius:4px;padding:.1rem .35rem;font-size:.9em;}
.slide.statement .inner{text-align:center;}
.statement-text{font-family:var(--font-display);font-weight:800;font-size:clamp(1.8rem,4.4vw,3.4rem);line-height:1.2;color:var(--ink);}
.notes{display:none;}
.chrome-footer{position:fixed;left:0;right:0;bottom:0;height:56px;display:flex;align-items:center;justify-content:space-between;padding:0 1.6rem;background:linear-gradient(to top, ${tokens.bg}, transparent);z-index:50;}
.nav-cluster{display:flex;align-items:center;gap:.7rem;}
.nav-btn{width:34px;height:34px;border-radius:50%;border:1px solid var(--border);background:var(--surface);color:var(--ink);cursor:pointer;font-size:1rem;line-height:1;}
.nav-btn:hover:not(:disabled){border-color:var(--primary);color:var(--primary);}
.nav-btn:disabled{opacity:.32;cursor:default;}
.counter{font-family:var(--font-display);font-size:.78rem;letter-spacing:.06em;color:var(--muted);min-width:4.5rem;text-align:center;}
.progress-track{position:fixed;top:0;left:0;right:0;height:3px;background:var(--border);z-index:60;}
.progress-fill{height:100%;background:var(--primary);width:0%;transition:width .2s ease;}
@media print{
  .chrome-footer,.progress-track{display:none;}
  .slide{position:static;display:flex !important;page-break-after:always;height:100vh;}
  body{overflow:visible;}
}
</style>
</head>
<body>
<div class="progress-track"><div class="progress-fill" id="progressFill"></div></div>
<div class="deck" id="deck">
${titleSlide}
${slidesHtml}
</div>
<div class="chrome-footer">
  <span class="fine">${pageTitle}</span>
  <div class="nav-cluster">
    <button class="nav-btn" id="prevBtn" aria-label="Previous slide">&lsaquo;</button>
    <span class="counter" id="counter">01 / ${String(total).padStart(2, "0")}</span>
    <button class="nav-btn" id="nextBtn" aria-label="Next slide">&rsaquo;</button>
  </div>
</div>
<script>
(function () {
  var slides = Array.prototype.slice.call(document.querySelectorAll(".slide"));
  var counterEl = document.getElementById("counter");
  var progressEl = document.getElementById("progressFill");
  var prevBtn = document.getElementById("prevBtn");
  var nextBtn = document.getElementById("nextBtn");
  var idx = 0;

  function pad(n) { return n < 10 ? "0" + n : String(n); }

  function render() {
    slides.forEach(function (slide, i) {
      slide.classList.toggle("is-active", i === idx);
    });
    counterEl.textContent = pad(idx + 1) + " / " + pad(slides.length);
    progressEl.style.width = ((idx + 1) / slides.length) * 100 + "%";
    prevBtn.disabled = idx === 0;
    nextBtn.disabled = idx === slides.length - 1;
  }

  function go(delta) {
    idx = Math.min(Math.max(idx + delta, 0), slides.length - 1);
    render();
  }

  prevBtn.addEventListener("click", function (e) { e.stopPropagation(); go(-1); });
  nextBtn.addEventListener("click", function (e) { e.stopPropagation(); go(1); });

  document.addEventListener("click", function (e) {
    if (e.target.closest(".nav-btn")) return;
    go(1);
  });

  window.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight" || e.key === " ") go(1);
    if (e.key === "ArrowLeft") go(-1);
  });

  render();
})();
</script>
</body>
</html>
`;
}
