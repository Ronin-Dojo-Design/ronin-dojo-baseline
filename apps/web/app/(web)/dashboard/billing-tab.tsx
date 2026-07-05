import { redirect } from "next/navigation"
import { BillingPortalButton } from "~/app/(web)/dashboard/billing-portal-button"
import { Badge } from "~/components/common/badge"
import { Card, CardDescription, CardHeader } from "~/components/common/card"
import { H4, H6 } from "~/components/common/heading"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import { Brand } from "~/.generated/prisma/client"
import { getServerSession } from "~/lib/auth"
import {
  findUserEnrollments,
  findUserEntitlements,
  findUserStripeCustomer,
} from "~/server/web/dashboard/queries"

/**
 * The dedicated "Billing" tab (G-004 N2). Surfaces the member's paid state in one place —
 * active entitlements (the BBL membership tiers + program grants), program enrollments, and
 * the Stripe Customer Portal link — reusing the SAME `server/web/dashboard/queries` read
 * models the overview header uses (no new payment plumbing; `BillingPortalButton` drives
 * `createBillingPortalSession`). Billing lived scattered inside `DashboardMembership`; this
 * gives it a canonical home so a member can manage their subscription from a labelled tab.
 */
export async function DashboardBillingTab() {
  const session = await getServerSession()

  if (!session?.user) {
    throw redirect("/auth/login?next=/app/profile")
  }

  const [entitlements, enrollments, stripeCustomer] = await Promise.all([
    findUserEntitlements(session.user.id, Brand.BBL),
    findUserEnrollments(session.user.id, Brand.BBL),
    findUserStripeCustomer(session.user.id, Brand.BBL),
  ])

  const hasBilling = entitlements.length > 0 || enrollments.length > 0 || Boolean(stripeCustomer)

  if (!hasBilling) {
    return (
      <Card hover={false}>
        <CardHeader direction="column" size="xs">
          <H6 render={props => <h2 {...props}>{props.children}</h2>}>No billing yet</H6>
          <CardDescription>
            When you buy a membership or enroll in a program, your subscription and billing details
            will show up here.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Stack direction="column" size="lg" className="w-full">
      {/* Active entitlements — the membership tiers + program grants (source of the paid state). */}
      {entitlements.length > 0 && (
        <Stack direction="column" size="sm" className="w-full">
          <H4>Active memberships</H4>
          <Stack direction="column" size="sm" className="w-full">
            {entitlements.map(ue => (
              <Card key={ue.id} hover={false}>
                <CardHeader>
                  <Stack size="sm" className="w-full justify-between">
                    <div>
                      <span className="text-sm font-medium">{ue.entitlement.name}</span>
                      <p className="text-muted-foreground font-mono text-xs">
                        {ue.entitlement.key}
                      </p>
                    </div>
                    <Badge variant="success" size="sm">
                      {ue.sourceType}
                    </Badge>
                  </Stack>
                </CardHeader>
                {ue.endsAt && (
                  <CardDescription>
                    Renews / expires {ue.endsAt.toLocaleDateString()}
                  </CardDescription>
                )}
              </Card>
            ))}
          </Stack>
        </Stack>
      )}

      {/* Program enrollments — the paid program subscriptions/one-offs. */}
      {enrollments.length > 0 && (
        <Stack direction="column" size="sm" className="w-full">
          <H4>Program enrollments</H4>
          <Stack direction="column" size="sm" className="w-full">
            {enrollments.map(enrollment => (
              <Card key={enrollment.id} hover={false}>
                <CardHeader>
                  <Stack size="sm" className="w-full justify-between">
                    <div>
                      <span className="text-sm font-medium">{enrollment.program.name}</span>
                      <p className="text-muted-foreground text-xs">
                        {enrollment.program.organization.name}
                      </p>
                    </div>
                    <Badge
                      variant={enrollment.status === "ACTIVE" ? "success" : "outline"}
                      size="sm"
                    >
                      {enrollment.status}
                    </Badge>
                  </Stack>
                </CardHeader>
              </Card>
            ))}
          </Stack>
        </Stack>
      )}

      {/* Manage billing — Stripe Customer Portal (invoices, payment method, cancel). */}
      <Stack direction="column" size="sm" className="w-full">
        <H4>Payment & invoices</H4>
        {stripeCustomer ? (
          <Stack direction="column" size="xs" className="items-start">
            <Note className="text-sm">
              Update your payment method, download invoices, or cancel from the Stripe portal.
            </Note>
            <BillingPortalButton />
          </Stack>
        ) : (
          <Note className="text-sm">
            No payment account on file yet. It's created automatically the first time you check out.
          </Note>
        )}
      </Stack>
    </Stack>
  )
}
