import { Badge } from "~/components/common/badge"

type Division = {
  id: string
  name: string
  format: string
  gender: string
  ageMin?: number | null
  ageMax?: number | null
  weightMinKg?: any
  weightMaxKg?: any
  feeCents: number
  capacity?: number | null
  roleRequired: { name: string }
  rankMin?: { name: string } | null
  rankMax?: { name: string } | null
  _count?: { entries: number }
}

type DivisionTableProps = {
  divisions: Division[]
}

export function DivisionTable({ divisions }: DivisionTableProps) {
  if (divisions.length === 0) {
    return <p className="text-sm text-muted-foreground">No divisions configured yet.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="pb-2 font-medium">Division</th>
            <th className="pb-2 font-medium">Format</th>
            <th className="pb-2 font-medium">Gender</th>
            <th className="pb-2 font-medium">Age</th>
            <th className="pb-2 font-medium">Weight</th>
            <th className="pb-2 font-medium">Fee</th>
            <th className="pb-2 font-medium">Spots</th>
          </tr>
        </thead>
        <tbody>
          {divisions.map(div => {
            const spotsUsed = div._count?.entries ?? 0
            const spotsText = div.capacity ? `${spotsUsed}/${div.capacity}` : `${spotsUsed}`

            return (
              <tr key={div.id} className="border-b last:border-0">
                <td className="py-2 font-medium">{div.name}</td>
                <td className="py-2">
                  <Badge variant="soft">{div.format.replace(/_/g, " ")}</Badge>
                </td>
                <td className="py-2">{div.gender}</td>
                <td className="py-2">
                  {div.ageMin != null || div.ageMax != null
                    ? `${div.ageMin ?? "—"}–${div.ageMax ?? "—"}`
                    : "Open"}
                </td>
                <td className="py-2">
                  {div.weightMinKg != null || div.weightMaxKg != null
                    ? `${div.weightMinKg ?? "—"}–${div.weightMaxKg ?? "—"} kg`
                    : "Open"}
                </td>
                <td className="py-2">
                  {div.feeCents > 0 ? `$${(div.feeCents / 100).toFixed(2)}` : "Free"}
                </td>
                <td className="py-2">{spotsText}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
