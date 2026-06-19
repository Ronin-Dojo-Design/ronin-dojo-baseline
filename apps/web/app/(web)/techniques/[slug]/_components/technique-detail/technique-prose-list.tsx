import { H4 } from "~/components/common/heading"
import { Prose } from "~/components/common/prose"
import { Section } from "~/components/web/ui/section"

type TechniqueProseListProps = {
  title: string
  items: string[]
}

/**
 * A titled prose list section — the shared shape behind both Teaching Cues and Common
 * Errors (genuine reuse, not fragmentation: the two sections differ only by title +
 * array). Renders nothing when the list is empty.
 */
export function TechniqueProseList({ title, items }: TechniqueProseListProps) {
  if (items.length === 0) {
    return null
  }

  return (
    <Section>
      <H4>{title}</H4>
      <Prose>
        <ul>
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </Prose>
    </Section>
  )
}
