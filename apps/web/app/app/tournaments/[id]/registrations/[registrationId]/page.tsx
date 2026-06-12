import { formatDate } from "@dirstack/utils"
import { ArrowLeftIcon } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { WeighInPanel } from "~/app/admin/tournaments/_components/weigh-in-panel"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { Card, CardHeader } from "~/components/common/card"
import { H3, H4 } from "~/components/common/heading"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/common/table"
import { Wrapper } from "~/components/common/wrapper"
import { findRegistrationById, findWeighInRecords } from "~/server/admin/tournaments/queries"

const STATUS_VARIANT: Record<string, "success" | "warning" | "danger" | "soft"> = {
  STARTED: "soft",
  SUBMITTED: "soft",
  APPROVED: "success",
  WAITLISTED: "warning",
  CANCELLED: "danger",
}

const PAYMENT_VARIANT: Record<string, "success" | "warning" | "danger" | "soft"> = {
  PAID: "success",
  PENDING: "warning",
  REFUNDED: "danger",
  WAIVED: "soft",
}

export default async ({
  params,
}: PageProps<"/app/tournaments/[id]/registrations/[registrationId]">) => {
  const { id, registrationId } = await params
  const registration = await findRegistrationById(registrationId)

  if (!registration || registration.tournament.id !== id) {
    return notFound()
  }

  const weighInsPromise = findWeighInRecords(registrationId)

  return (
    <Wrapper size="md" gap="sm">
      {/* Back link */}
      <Button
        variant="ghost"
        size="sm"
        render={<Link href={`/app/tournaments/${id}/registrations`} />}
      >
        <ArrowLeftIcon className="mr-1 size-4" />
        Back to Registrations
      </Button>

      {/* Header */}
      <Stack direction="row" className="items-center justify-between">
        <H3>Registration Detail</H3>
        <Stack direction="row" className="gap-2">
          <Badge variant={STATUS_VARIANT[registration.status] ?? "soft"}>
            {registration.status}
          </Badge>
          <Badge variant={PAYMENT_VARIANT[registration.paymentStatus] ?? "soft"}>
            {registration.paymentStatus}
          </Badge>
        </Stack>
      </Stack>

      {/* Overview card */}
      <Card>
        <CardHeader>
          <H4>Overview</H4>
        </CardHeader>
        <div className="p-4 pt-0">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div>
              <Note className="text-xs font-medium uppercase tracking-wider">Competitor</Note>
              <p className="mt-1 font-medium">
                {registration.user?.name ?? registration.guestName ?? "—"}
              </p>
              <Note className="text-sm">
                {registration.user?.email ?? registration.guestEmail ?? "—"}
                {registration.userId === null && " (guest)"}
              </Note>
            </div>
            <div>
              <Note className="text-xs font-medium uppercase tracking-wider">Tournament</Note>
              <p className="mt-1">
                <Link href={`/app/tournaments/${id}`} className="text-primary hover:underline">
                  {registration.tournament.name}
                </Link>
              </p>
            </div>
            <div>
              <Note className="text-xs font-medium uppercase tracking-wider">Total Fee</Note>
              <p className="mt-1 tabular-nums">
                {registration.totalFeeCents > 0
                  ? `$${(registration.totalFeeCents / 100).toFixed(2)} ${registration.currency}`
                  : "Free"}
              </p>
            </div>
            <div>
              <Note className="text-xs font-medium uppercase tracking-wider">Submitted</Note>
              <p className="mt-1">
                {registration.submittedAt ? formatDate(registration.submittedAt) : "—"}
              </p>
            </div>
            <div>
              <Note className="text-xs font-medium uppercase tracking-wider">Created</Note>
              <p className="mt-1">{formatDate(registration.createdAt)}</p>
            </div>
            {registration.stripePaymentIntentId && (
              <div>
                <Note className="text-xs font-medium uppercase tracking-wider">Stripe PI</Note>
                <Note className="mt-1 text-sm font-mono break-all">
                  {registration.stripePaymentIntentId}
                </Note>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Division entries */}
      <Card>
        <CardHeader>
          <H4>Division Entries ({registration.entries.length})</H4>
        </CardHeader>
        <div className="p-4 pt-0">
          {registration.entries.length === 0 ? (
            <Note>No division entries.</Note>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Division</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Rank (snapshot)</TableHead>
                  <TableHead>Org (snapshot)</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registration.entries.map(entry => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">{entry.division.name}</TableCell>
                    <TableCell>{entry.tournamentRole.name}</TableCell>
                    <TableCell>{entry.snapshotRankName ?? "—"}</TableCell>
                    <TableCell>{entry.snapshotOrgName ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant={entry.status === "ACTIVE" ? "success" : "danger"} size="sm">
                        {entry.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>

      {/* Weigh-in panel — only available when the registration is linked to a
          real User. Guest registrations have no userId and therefore no
          WeighInRecord rows until they're linked to a User. */}
      {registration.user ? (
        <WeighInPanel
          registrationId={registrationId}
          userId={registration.user.id}
          weighInsPromise={weighInsPromise}
        />
      ) : (
        <Note>Weigh-in unavailable for guest registrations.</Note>
      )}
    </Wrapper>
  )
}
