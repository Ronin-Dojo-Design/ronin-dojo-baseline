import * as d3 from "d3"
import type { TreeDatum } from "../types/treeData"

export interface SecondaryLinkDatum {
  fromMemberId: string
  toMemberId: string
  rankLabel: string | null
  colorHex: string | null
}

/**
 * Render secondary-promoter links as dashed belt-colored SVG paths inside the
 * existing `.view` group so they participate in the D3 zoom/pan transform.
 *
 * Only links where BOTH endpoints are present in the current `treeData` focal
 * view are drawn; out-of-view secondaries are omitted (deferred to 0379-6).
 *
 * The `.secondary_links_view` group is inserted before `.cards_view` so it
 * renders above primary links but below HTML cards (z-index is implicit from
 * DOM order; `#htmlSvg` carries an explicit `z-index: 2`).
 */
export function updateSecondaryLinks(
  svg: SVGElement,
  treeData: TreeDatum[],
  secondaryLinks: SecondaryLinkDatum[],
  transitionTime: number = 0,
): void {
  // Build member-id → center position from current focal tree
  const posMap = new Map<string, { x: number; y: number }>()
  for (const d of treeData) {
    posMap.set(d.data.id, { x: d.x, y: d.y })
  }

  // Only draw links where both endpoints are in-view
  const visibleLinks = secondaryLinks.filter(
    link => posMap.has(link.fromMemberId) && posMap.has(link.toMemberId),
  )

  // Create or select the overlay group inside .view, before .cards_view
  const view = d3.select(svg).select<SVGGElement>(".view")
  let group = view.select<SVGGElement>(".secondary_links_view")
  if (group.empty()) {
    group = view.insert<SVGGElement>("g", ".cards_view").attr("class", "secondary_links_view")
  }

  // D3 join — key by stable from--to pair
  const sel = group
    .selectAll<SVGGElement, SecondaryLinkDatum>("g.slink")
    .data(visibleLinks, d => `${d.fromMemberId}--${d.toMemberId}`)

  // Exit: fade out and remove
  sel.exit().transition().duration(transitionTime || 400).style("opacity", 0).remove()

  // Enter: create the group + path + invisible hit-area + text elements
  const enter = sel
    .enter()
    .append("g")
    .attr("class", "slink")
    .style("opacity", 0)

  enter.append("path").attr("class", "slink-path")
  // Fat transparent hit-area for reliable hover/touch on thin stroke
  enter.append("path").attr("class", "slink-hit")
  // Label background rect for readability over cards/links
  enter.append("rect").attr("class", "slink-label-bg")
  enter.append("text").attr("class", "slink-label")

  const merged = enter.merge(sel)

  // Update all visible links
  merged.each(function (link) {
    const from = posMap.get(link.fromMemberId)!
    const to = posMap.get(link.toMemberId)!
    const color = link.colorHex ?? "#94a3b8"

    // CatmullRom naturally curves between the two points without a fixed offset
    const pts: [number, number][] = [
      [from.x, from.y],
      [from.x, to.y],
      [to.x, from.y],
      [to.x, to.y],
    ]
    const lineFn = d3.line<[number, number]>().curve(d3.curveCatmullRom.alpha(0.5))
    const pathD = lineFn(pts) ?? ""

    const g = d3.select<SVGGElement, SecondaryLinkDatum>(this)

    g.select(".slink-path")
      .attr("fill", "none")
      .attr("stroke", color)
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", "6,4")
      .attr("stroke-opacity", 0.7)
      .attr("d", pathD)

    // Invisible wide path for pointer events
    g.select(".slink-hit")
      .attr("fill", "none")
      .attr("stroke", "transparent")
      .attr("stroke-width", 8)
      .attr("pointer-events", "stroke")
      .attr("d", pathD)

    // Label at midpoint — abbreviated rank name only (before " · ")
    const rawLabel = link.rankLabel
    if (rawLabel) {
      const shortLabel = rawLabel.split(" · ")[0] ?? rawLabel
      const midX = (from.x + to.x) / 2
      const midY = (from.y + to.y) / 2

      const charW = 5.5
      const padX = 4
      const padY = 2
      const textW = shortLabel.length * charW + padX * 2
      const textH = 11 + padY * 2

      g.select(".slink-label-bg")
        .attr("x", midX - textW / 2)
        .attr("y", midY - textH / 2 - 8)
        .attr("width", textW)
        .attr("height", textH)
        .attr("rx", 3)
        .attr("fill", "rgba(248,250,252,0.85)")

      g.select(".slink-label")
        .attr("x", midX)
        .attr("y", midY - 2)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", color)
        .attr("font-size", "9")
        .attr("font-weight", "500")
        .attr("font-family", "inherit")
        .text(shortLabel)
    } else {
      g.select(".slink-label-bg").attr("width", 0).attr("height", 0)
      g.select(".slink-label").text("")
    }
  })

  // Animate in with the same timing as primary links
  merged.transition().duration(transitionTime || 800).style("opacity", 1)
}

/**
 * Remove all secondary links from the overlay group (used when toggle is off).
 */
export function clearSecondaryLinks(svg: SVGElement): void {
  d3.select(svg).select(".secondary_links_view").selectAll("g.slink").remove()
}
