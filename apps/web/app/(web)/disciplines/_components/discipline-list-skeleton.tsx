import { Card, CardHeader } from "~/components/common/card"
import { Skeleton } from "~/components/common/skeleton"

export function DisciplineListSkeleton() {
  return (
    <div className="grid gap-4 @md:grid-cols-2 @lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <div className="space-y-3">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-24" />
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}
