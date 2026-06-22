import { redirect } from "next/navigation"
import { BillingPortalButton } from "~/app/(web)/dashboard/billing-portal-button"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { Card, CardDescription, CardHeader } from "~/components/common/card"
import { H4 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { Section } from "~/components/web/ui/section"
import { Brand } from "~/.generated/prisma/client"
import { getServerSession } from "~/lib/auth"
import {
  findUserEnrollments,
  findUserEntitlements,
  findUserRegistrations,
  findUserStripeCustomer,
} from "~/server/web/dashboard/queries"
import { getPassportByUserId } from "~/server/web/passport/queries"

export const DashboardMembership = async () => {
  const session = await getServerSession()

  if (!session?.user) {
    throw redirect("/auth/login?next=/app/profile")
  }

  const [enrollments, entitlements, registrations, passport, stripeCustomer] = await Promise.all([
    findUserEnrollments(session.user.id, Brand.BBL),
    findUserEntitlements(session.user.id, Brand.BBL),
    findUserRegistrations(session.user.id, Brand.BBL),
    getPassportByUserId(session.user.id),
    findUserStripeCustomer(session.user.id, Brand.BBL),
  ])

  const hasData =
    enrollments.length > 0 ||
    entitlements.length > 0 ||
    registrations.length > 0 ||
    Boolean(stripeCustomer)

  if (!hasData && !passport) {
    return null
  }

  return (
    <Section>
      <Section.Content>
        {/* Passport */}
        {passport && (
          <div className="mb-6 flex items-center gap-4">
            {passport.avatarUrl && (
              <img
                src={passport.avatarUrl}
                alt={passport.displayName || "Avatar"}
                className="size-14 rounded-full object-cover"
              />
            )}
            <div>
              {passport.displayName && (
                <p className="text-lg font-semibold">{passport.displayName}</p>
              )}
              {passport.bio && (
                <p className="text-sm text-muted-foreground line-clamp-2">{passport.bio}</p>
              )}
            </div>
          </div>
        )}

        <div className="grid gap-6 @lg:grid-cols-3">
          {/* Enrollments */}
          {enrollments.length > 0 && (
            <div className="space-y-3">
              <H4>My Enrollments</H4>
              <div className="grid gap-2">
                {enrollments.map(enrollment => (
                  <Card key={enrollment.id} hover={false}>
                    <CardHeader>
                      <Stack size="sm" className="justify-between">
                        <div>
                          <span className="text-sm font-medium">{enrollment.program.name}</span>
                          <p className="text-xs text-muted-foreground">
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
              </div>
            </div>
          )}

          {/* Entitlements */}
          {entitlements.length > 0 && (
            <div className="space-y-3">
              <H4>Active Entitlements</H4>
              <div className="grid gap-2">
                {entitlements.map(ue => (
                  <Card key={ue.id} hover={false}>
                    <CardHeader>
                      <Stack size="sm" className="justify-between">
                        <div>
                          <span className="text-sm font-medium">{ue.entitlement.name}</span>
                          <p className="text-xs text-muted-foreground font-mono">
                            {ue.entitlement.key}
                          </p>
                        </div>
                        <Badge variant="success" size="sm">
                          {ue.sourceType}
                        </Badge>
                      </Stack>
                    </CardHeader>
                    {ue.endsAt && (
                      <CardDescription>Expires {ue.endsAt.toLocaleDateString()}</CardDescription>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Registrations */}
          {registrations.length > 0 && (
            <div className="space-y-3">
              <H4>Tournament Registrations</H4>
              <div className="grid gap-2">
                {registrations.map(reg => (
                  <Card key={reg.id} hover={false}>
                    <CardHeader>
                      <Stack size="sm" className="justify-between">
                        <div>
                          <span className="text-sm font-medium">{reg.tournament.name}</span>
                          {reg.tournament.startDate && (
                            <p className="text-xs text-muted-foreground">
                              {reg.tournament.startDate.toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <Badge
                          variant={reg.status === "APPROVED" ? "success" : "outline"}
                          size="sm"
                        >
                          {reg.status}
                        </Badge>
                      </Stack>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="flex gap-3 pt-4">
          <Button variant="secondary" size="sm" render={<Link href="/programs" />}>
            Browse Programs
          </Button>
          <Button variant="secondary" size="sm" render={<Link href="/tournaments" />}>
            Browse Tournaments
          </Button>
          {stripeCustomer && <BillingPortalButton />}
        </div>
      </Section.Content>
    </Section>
  )
}
