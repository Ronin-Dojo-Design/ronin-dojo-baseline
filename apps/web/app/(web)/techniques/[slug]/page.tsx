import { notFound } from "next/navigation"
import { Badge } from "~/components/common/badge"
import { H4 } from "~/components/common/heading"
import { Prose } from "~/components/common/prose"
import { Stack } from "~/components/common/stack"
import { Intro, IntroTitle, IntroDescription } from "~/components/web/ui/intro"
import { Section } from "~/components/web/ui/section"
import { getRequestBrand } from "~/lib/brand-context"
import { findTechniqueBySlug } from "~/server/web/techniques/queries"

type PageProps = {
  params: Promise<{ slug: string }>
}

export default async function TechniqueDetailPage({ params }: PageProps) {
  const { slug } = await params
  const brand = await getRequestBrand()
  const technique = await findTechniqueBySlug(slug, brand)

  if (!technique) {
    notFound()
  }

  return (
    <>
      <Intro>
        <IntroTitle>{technique.name}</IntroTitle>
        {technique.description && (
          <IntroDescription>{technique.description}</IntroDescription>
        )}
      </Intro>

      <Section>
        <Stack size="sm" className="flex-wrap">
          {technique.category && (
            <Badge variant="outline">{technique.category.replace(/_/g, " ")}</Badge>
          )}
          {technique.position && (
            <Badge variant="outline">{technique.position.replace(/_/g, " ")}</Badge>
          )}
          {technique.difficultyLevel && (
            <Badge variant="soft">{technique.difficultyLevel.replace(/_/g, " ")}</Badge>
          )}
          {technique.discipline && (
            <Badge variant="soft">{technique.discipline.name}</Badge>
          )}
          {technique.isFoundational && <Badge variant="success">Foundational</Badge>}
          {technique.isGi !== null && (
            <Badge variant="outline">{technique.isGi ? "Gi" : "No-Gi"}</Badge>
          )}
          {technique.requiresPartner && <Badge variant="outline">Partner required</Badge>}
          {technique.requiresEquipment && <Badge variant="outline">Equipment required</Badge>}
        </Stack>
      </Section>

      {/* Media attachments */}
      {technique.mediaAttachments.length > 0 && (
        <Section>
          <H4>Media</H4>
          <div className="grid gap-4 sm:grid-cols-2">
            {technique.mediaAttachments.map(({ id, media }) => (
              <div key={id} className="overflow-hidden rounded-lg">
                {media.mimeType?.startsWith("video/") ? (
                  <video
                    src={media.url}
                    controls
                    className="w-full aspect-video object-cover"
                    poster={media.thumbnailUrl ?? undefined}
                  />
                ) : (
                  <img
                    src={media.url}
                    alt={media.altText ?? technique.name}
                    className="w-full aspect-video object-cover"
                  />
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Teaching cues */}
      {technique.teachingCues.length > 0 && (
        <Section>
          <H4>Teaching Cues</H4>
          <Prose>
            <ul>
              {technique.teachingCues.map((cue, i) => (
                <li key={i}>{cue}</li>
              ))}
            </ul>
          </Prose>
        </Section>
      )}

      {/* Common errors */}
      {technique.commonErrors.length > 0 && (
        <Section>
          <H4>Common Errors</H4>
          <Prose>
            <ul>
              {technique.commonErrors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </Prose>
        </Section>
      )}

      {/* Safety notes */}
      {technique.safetyNotes && (
        <Section>
          <H4>Safety Notes</H4>
          <Prose>
            <p>{technique.safetyNotes}</p>
          </Prose>
        </Section>
      )}
    </>
  )
}
