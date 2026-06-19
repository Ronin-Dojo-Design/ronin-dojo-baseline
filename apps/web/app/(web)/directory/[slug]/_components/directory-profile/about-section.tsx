import { Note } from "~/components/common/note"
import { Prose } from "~/components/common/prose"
import { Stack } from "~/components/common/stack"
import { Section } from "~/components/web/ui/section"
import type { DirectoryProfile } from "./directory-profile-data"

/**
 * "About" body — the public bio (or, for a listing-preview profile, the upgrade note)
 * plus the optional public email. Email visibility is already gated in the projection.
 */
export function AboutSection({ profile }: { profile: DirectoryProfile }) {
  const { user } = profile

  return (
    <Section>
      <Stack size="sm">
        {user.bio ? (
          <Prose>
            <p>{user.bio}</p>
          </Prose>
        ) : (
          !profile.canRenderFullProfile && (
            <Note>
              This profile is currently published as a free listing. Full bio, links, school
              details, and rank history unlock when the listing upgrades.
            </Note>
          )
        )}
        {user.email && <p className="text-sm text-muted-foreground">{user.email}</p>}
      </Stack>
    </Section>
  )
}
