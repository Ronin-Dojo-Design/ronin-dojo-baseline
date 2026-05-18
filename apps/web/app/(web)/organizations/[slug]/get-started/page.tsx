import { notFound } from "next/navigation"
import { H2 } from "~/components/common/heading"
import { Wrapper } from "~/components/common/wrapper"
import { LeadCaptureForm } from "~/components/web/lead-capture-form"
import { db } from "~/services/db"

export default async function GetStartedPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const organization = await db.organization.findFirst({
    where: { slug },
    select: { id: true, name: true, slug: true },
  })

  if (!organization) {
    return notFound()
  }

  return (
    <Wrapper size="sm" className="py-12">
      <div className="text-center mb-8">
        <H2>Get Started at {organization.name}</H2>
        <p className="text-muted-foreground mt-2">
          Fill out the form below and we'll reach out to schedule your first class.
        </p>
      </div>

      <LeadCaptureForm organizationId={organization.id} />
    </Wrapper>
  )
}
