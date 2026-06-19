import { BarChart3Icon, SwordsIcon, TrophyIcon } from "lucide-react"
import { Card } from "~/components/common/card"
import { H3 } from "~/components/common/heading"
import { valueProps, valuePropsSection } from "../bbl-landing-content"
import { SectionHeading } from "./landing-chrome"

const VALUE_PROP_ICONS = {
  trophy: TrophyIcon,
  chart: BarChart3Icon,
  swords: SwordsIcon,
} as const

export const BblValueProps = () => (
  <section className="w-full space-y-8">
    <SectionHeading
      eyebrow={valuePropsSection.eyebrow}
      title={valuePropsSection.title}
      description={valuePropsSection.description}
    />
    <div className="grid gap-5 md:grid-cols-3">
      {valueProps.map(item => {
        const Icon = VALUE_PROP_ICONS[item.icon]
        return (
          <Card key={item.title} hover={false} className="space-y-3">
            <div className="inline-flex size-11 items-center justify-center rounded-full border bg-muted text-primary">
              <Icon className="size-5" aria-hidden="true" />
            </div>
            <H3 className="text-lg">{item.title}</H3>
            <p className="text-sm text-muted-foreground">{item.description}</p>
          </Card>
        )
      })}
    </div>
  </section>
)
