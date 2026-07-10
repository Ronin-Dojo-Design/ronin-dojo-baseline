import { PencilIcon } from "lucide-react"
import { H4 } from "~/components/common/heading"
import { Prose } from "~/components/common/prose"
import { EditProfileButton } from "~/components/web/passport/profile-edit-drawer"
import { bblHeadingFontClass } from "~/components/web/ui/brand-typography"
import { Section } from "~/components/web/ui/section"
import { MeSectionEmpty } from "./me-section-empty"

/** "About" panel — the member's bio, with an inviting editor prompt when empty. */
export function AboutSection({ bio }: { bio: string | null }) {
  if (!bio) {
    return (
      <div className="flex w-full flex-col gap-4">
        <H4 className={bblHeadingFontClass}>About</H4>
        <MeSectionEmpty
          icon={<PencilIcon />}
          title="Add a short bio"
          description="Introduce yourself — your background, the disciplines you train, and what the art means to you. Your bio shows here and on your public profile."
          action={
            <EditProfileButton variant="primary" size="md" prefix={<PencilIcon />}>
              Write your bio
            </EditProfileButton>
          }
        />
      </div>
    )
  }

  return (
    <Section>
      <H4 className={bblHeadingFontClass}>About</H4>
      <Prose>
        <p>{bio}</p>
      </Prose>
    </Section>
  )
}
