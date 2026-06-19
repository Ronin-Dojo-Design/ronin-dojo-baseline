import { H4 } from "~/components/common/heading"
import { Prose } from "~/components/common/prose"
import { Section } from "~/components/web/ui/section"

type TechniqueSafetyProps = {
  notes: string | null
}

/** Safety-notes paragraph section. Renders nothing when there are no notes. */
export function TechniqueSafety({ notes }: TechniqueSafetyProps) {
  if (!notes) {
    return null
  }

  return (
    <Section>
      <H4>Safety Notes</H4>
      <Prose>
        <p>{notes}</p>
      </Prose>
    </Section>
  )
}
