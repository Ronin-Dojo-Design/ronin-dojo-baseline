import { slugify } from "@dirstack/utils"
import { Children, type ComponentProps, type ReactNode } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Prose } from "~/components/common/prose"
import { MDXComponents } from "~/components/web/mdx-components"

type Heading = {
  id: string
  text: string
  level: number
}

/**
 * Derive an anchored table-of-contents from raw markdown. Heading ids are
 * `slugify(text)-<index>` where the index counts every heading (h1–h6) so it
 * stays in lockstep with the ids injected onto the rendered heading elements
 * below — that alignment is what makes the TOC anchors land.
 */
export const extractHeadingsFromMarkdown = (md: string): Heading[] => {
  const headings: Heading[] = []
  const regex = /^(#{1,6})\s+(.+)$/gm
  let headingIndex = 0
  let match

  while ((match = regex.exec(md)) !== null) {
    const level = match[1].length
    const text = match[2].trim()
    const stripped = text
      .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1") // images: ![alt](url) → alt
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // links: [text](url) → text
      .replace(/\*\*([^*]*)\*\*/g, "$1") // bold: **text** → text
      .replace(/\*([^*]*)\*/g, "$1") // italic: *text* → text
      .replace(/_([^_]*)_/g, "$1") // italic: _text_ → text
      .replace(/`([^`]*)`/g, "$1") // code: `text` → text
      .trim()
    const id = `${slugify(stripped)}-${headingIndex++}`

    // Only include h1–h3 in the TOC
    if (level <= 3) {
      headings.push({ id, text, level })
    }
  }

  return headings
}

const extractTextFromChildren = (children: ReactNode): string => {
  return Children.toArray(children)
    .map(child => {
      if (typeof child === "string") return child
      if (typeof child === "number") return String(child)
      if (typeof child === "object" && child !== null && "props" in child) {
        return extractTextFromChildren(
          (child as { props: { children?: ReactNode } }).props.children,
        )
      }
      return ""
    })
    .join("")
}

const createHeadingComponent = (
  Tag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6",
  nextIndex: () => number,
) => {
  return ({ children }: ComponentProps<"h1">) => {
    const text = extractTextFromChildren(children)
    const id = `${slugify(text)}-${nextIndex()}`
    return <Tag id={id}>{children}</Tag>
  }
}

// Compose BBL's shared MDX element map (styled `a` / `img` / `table`) with
// slug-anchored heading ids so the sidebar TOC can deep-link into the article.
const createComponents = () => {
  let headingIndex = 0
  const nextIndex = () => headingIndex++

  return {
    ...MDXComponents,
    h1: createHeadingComponent("h1", nextIndex),
    h2: createHeadingComponent("h2", nextIndex),
    h3: createHeadingComponent("h3", nextIndex),
    h4: createHeadingComponent("h4", nextIndex),
    h5: createHeadingComponent("h5", nextIndex),
    h6: createHeadingComponent("h6", nextIndex),
  }
}

type MarkdownProps = ComponentProps<typeof Prose> & {
  code: string
}

export const Markdown = ({ code, ...props }: MarkdownProps) => {
  const components = createComponents()

  return (
    <Prose {...props}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {code}
      </ReactMarkdown>
    </Prose>
  )
}
