import { IdCardIcon, PencilIcon } from "lucide-react"
import { Wrapper } from "~/components/common/wrapper"
import { EditProfileButton } from "~/components/web/passport/profile-edit-drawer"
import { MeSectionEmpty } from "./me-section-empty"

/**
 * Graceful fallback when the authenticated member has no provisioned profile yet
 * (post-S2 sign-up always creates one, but degrade without a redirect loop). Reuses
 * the shared `MeSectionEmpty` prompt so the whole-page "get started" state reads with
 * the same on-brand voice as the per-section empties; the headline opts into the BBL
 * heading token inside `MeSectionEmpty`. Centered in a medium wrapper so the prompt
 * reads as a polished onboarding screen rather than a stray card.
 */
export function MeProfileEmpty() {
  return (
    <Wrapper size="md" alignment="center" className="py-fluid-md">
      <MeSectionEmpty
        icon={<IdCardIcon />}
        title="Set up your Passport"
        description="Your member profile isn't set up yet. Add your identity details — name, belt, school, and bio — to publish your Passport and join the directory."
        action={
          <EditProfileButton variant="primary" prefix={<PencilIcon />}>
            Complete your profile
          </EditProfileButton>
        }
        className="py-fluid-lg"
      />
    </Wrapper>
  )
}
