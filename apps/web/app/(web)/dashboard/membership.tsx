import { redirect } from "next/navigation"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { Card, CardDescription, CardHeader } from "~/components/common/card"
import { H4 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { Section } from "~/components/web/ui/section"
import { getServerSession } from "~/lib/auth"
import {
  findUserEnrollments,
  findUserEntitlements,
  findUserRegistrations,
} from "~/server/web/dashboard/queries"

export const DashboardMembership = async () => {
  const session = await getServerSession()

  if (!session?.user) {
    throw redirect("/auth/login?next=/dashboard")
  }

  const [enrollments, entitlements, registrations] = await Promise.all([
    findUserEnrollments(session.user.id),
    findUserEntitlements(session.user.id),
    findUserRegistrations(session.user.id),
  ])

  const hasData = enrollments.length > 0 || entitlements.length > 0 || registrations.length > 0

  if (!hasData) {
    return null
  }

  return (
    <Section>
      <Section.Content>
        <div className="grid gap-6 @lg:grid-cols-3">
          {/* Enrollments */}
          {enrollments.length > 0 && (
            <div className="space-y-3">
              <H4>My Enrollments</H4>
              <div className="grid gap-2">
                {enrollments.map((enrollment) => (
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
                {entitlements.map((ue) => (
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
                      <CardDescription>
                        Expires {ue.endsAt.toLocaleDateString()}
                      </CardDescription>
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
                {registrations.map((reg) => (
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
          <Button variant="secondary" size="sm" asChild>
            <Link href="/programs">Browse Programs</Link>
          </Button>
          <Button variant="secondary" size="sm" asChild>
            <Link href="/tournaments">Browse Tournaments</Link>
          </Button>
        </div>
      </Section.Content>
    </Section>
  )
}
