import { H4 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Note } from "~/components/common/note"
import { Prose } from "~/components/common/prose"
import { bblHeadingFontClass } from "~/components/web/ui/brand-typography"
import { Section } from "~/components/web/ui/section"

/** "About" panel — the member's bio, with an editor nudge when empty. */
export function AboutSection({ bio }: { bio: string | null }) {
  return (
    <Section>
      <H4 className={bblHeadingFontClass}>About</H4>
      {bio ? (
        <Prose>
          <p>{bio}</p>
        </Prose>
      ) : (
        <Note>
          No bio yet. Add a short introduction from{" "}
          <Link href="/app/profile">your profile editor</Link>.
        </Note>
      )}
    </Section>
  )
}
