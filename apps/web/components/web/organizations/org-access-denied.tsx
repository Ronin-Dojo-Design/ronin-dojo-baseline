import { ArrowLeftIcon, SearchIcon, ShieldAlertIcon } from "lucide-react"
import { Button } from "~/components/common/button"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"

/**
 * Martial-arts-styled 403 page.
 * Used when an authenticated user lacks permission for an org-level action.
 */
export function OrgAccessDenied({ orgSlug }: { orgSlug: string }) {
  return (
    <Intro alignment="center">
      <ShieldAlertIcon className="mx-auto size-16 text-muted-foreground/50" strokeWidth={1.25} />

      <IntroTitle className="mt-4">You Can&apos;t Ninja Your Way In Here 🥷</IntroTitle>

      <IntroDescription className="max-w-lg">
        This area is reserved for dojo administrators. If you believe you should have access, ask
        your organization&apos;s owner to grant you the <strong>ORG_ADMIN</strong> role.
      </IntroDescription>

      <Stack direction="row" size="sm" wrap className="mt-6 justify-center">
        <Button
          variant="primary"
          prefix={<ArrowLeftIcon />}
          render={<Link href={`/organizations/${orgSlug}`} />}
        >
          Back to Dojo
        </Button>

        <Button variant="secondary" prefix={<SearchIcon />} render={<Link href="/organizations" />}>
          Browse Organizations
        </Button>
      </Stack>
    </Intro>
  )
}
