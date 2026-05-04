import { notFound } from "next/navigation"
import { withAdminPage } from "~/components/admin/auth-hoc"
import { H4 } from "~/components/common/heading"
import { Wrapper } from "~/components/common/wrapper"
import { findTournamentById } from "~/server/admin/tournaments/queries"
import { findRegistrationsByTournamentId } from "~/server/admin/tournaments/registrations-queries"

export default withAdminPage(async ({ params }) => {
  const { id } = await params
  const tournament = await findTournamentById(id)

  if (!tournament) {
    return notFound()
  }

  const registrations = await findRegistrationsByTournamentId(id)

  return (
    <Wrapper size="md" gap="sm">
      <H4>Registrations — {tournament.name}</H4>

      {registrations.length === 0 ? (
        <p className="text-muted-foreground text-sm">No registrations yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-2 pr-4 font-medium">Name</th>
                <th className="pb-2 pr-4 font-medium">Email</th>
                <th className="pb-2 pr-4 font-medium">Divisions</th>
                <th className="pb-2 pr-4 font-medium">Status</th>
                <th className="pb-2 pr-4 font-medium">Payment</th>
                <th className="pb-2 pr-4 font-medium">Total</th>
                <th className="pb-2 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((reg) => (
                <tr key={reg.id} className="border-b">
                  <td className="py-2 pr-4">{reg.user.name ?? "—"}</td>
                  <td className="py-2 pr-4">{reg.user.email}</td>
                  <td className="py-2 pr-4">
                    {reg.entries.map((e) => e.division.name).join(", ")}
                  </td>
                  <td className="py-2 pr-4">{reg.status}</td>
                  <td className="py-2 pr-4">{reg.paymentStatus}</td>
                  <td className="py-2 pr-4">
                    {reg.totalFeeCents > 0
                      ? `$${(reg.totalFeeCents / 100).toFixed(2)}`
                      : "Free"}
                  </td>
                  <td className="py-2">
                    {new Date(reg.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Wrapper>
  )
})
