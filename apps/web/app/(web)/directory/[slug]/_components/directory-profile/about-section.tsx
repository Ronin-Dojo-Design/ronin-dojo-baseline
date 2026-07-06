import { Note } from "~/components/common/note"
import { Prose } from "~/components/common/prose"
import { Stack } from "~/components/common/stack"
import { Section } from "~/components/web/ui/section"
import type { DirectoryProfile } from "./directory-profile-data"

/**
 * "About" body — the public bio (always shown for a claimed profile, free tier included),
 * or, when the member has no bio yet AND rich media is gated, a note pointing at the media
 * that a paid listing unlocks. Plus the optional public email (gated in the projection).
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
              This profile has no bio yet. A cover photo, video intro, social links, and location
              unlock with a Premium or Elite listing.
            </Note>
          )
        )}
        {user.email && <p className="text-sm text-muted-foreground">{user.email}</p>}
      </Stack>
    </Section>
  )
}
