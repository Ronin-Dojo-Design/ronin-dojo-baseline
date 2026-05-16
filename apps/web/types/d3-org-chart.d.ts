declare module "d3-org-chart" {
  export class OrgChart<T = Record<string, unknown>> {
    container(selector: string | HTMLElement): this
    data(data: T[]): this
    nodeWidth(fn: (d: unknown) => number): this
    nodeHeight(fn: (d: unknown) => number): this
    compactMarginBetween(fn: (d: unknown) => number): this
    childrenMargin(fn: (d: unknown) => number): this
    siblingsMargin(fn: (d: unknown) => number): this
    nodeContent(fn: (d: unknown) => string): this
    onNodeClick(fn: (d: unknown) => void): this
    render(): this
    fit(): this
    expandAll(): this
    collapseAll(): this
    zoomIn(): this
    zoomOut(): this
  }
}
