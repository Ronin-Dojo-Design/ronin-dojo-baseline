import { Card } from "~/components/common/card"
import { H3 } from "~/components/common/heading"
import {
  featureHighlights,
  featuresSection,
  newMemberFeatures,
  schoolOwnerFeatures,
} from "../bbl-landing-content"
import { CheckRow, SectionHeading } from "./landing-chrome"

export const BblFeatures = () => (
  <section className="w-full">
    <Card hover={false} className="space-y-10 p-6 md:p-8">
      <SectionHeading
        eyebrow={featuresSection.eyebrow}
        title={featuresSection.title}
        description={featuresSection.description}
      />

      <div className="grid gap-5 lg:grid-cols-3">
        {featureHighlights.map(feature => (
          <div key={feature.title} className="rounded-xl border overflow-hidden bg-card">
            <div className="relative h-36">
              <img
                src={feature.image}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="p-4 space-y-1.5">
              <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">
                {feature.kicker}
              </p>
              <p className="font-semibold">{feature.title}</p>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
        <div className="space-y-3">
          <H3 className="text-lg">{featuresSection.membersHeading}</H3>
          <div className="space-y-2.5">
            {newMemberFeatures.map(feature => (
              <CheckRow key={feature.title} title={feature.title}>
                {feature.description}
              </CheckRow>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <H3 className="text-lg">{featuresSection.ownersHeading}</H3>
          <div className="space-y-2.5">
            {schoolOwnerFeatures.map(item => (
              <CheckRow key={item}>{item}</CheckRow>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">{featuresSection.ownersFootnote}</p>
        </div>
      </div>
    </Card>
  </section>
)
