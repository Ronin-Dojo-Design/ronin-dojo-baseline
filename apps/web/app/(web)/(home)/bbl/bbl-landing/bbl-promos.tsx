import Image from "next/image"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { Card } from "~/components/common/card"
import { H2 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { promos } from "../bbl-landing-content"

export const BblPromos = ({ hideAction = false }: { hideAction?: boolean }) => (
  <>
    {promos.map(promo => (
      <section key={promo.title} className="w-full">
        <Card hover={false} className="relative p-0! overflow-hidden">
          <Image
            src={promo.image}
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-10 dark:opacity-15"
            aria-hidden="true"
          />
          <div className="relative w-full grid gap-8 lg:grid-cols-2 lg:items-center p-6 md:p-10">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <p className="text-sm uppercase tracking-[0.15em] text-muted-foreground font-semibold">
                  {promo.eyebrow}
                </p>
                {promo.comingSoon && <Badge variant="outline">Coming Soon</Badge>}
              </div>
              <H2>{promo.title}</H2>
              <p className="text-muted-foreground max-w-xl">{promo.description}</p>
              {!hideAction && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    size="lg"
                    variant="primary"
                    render={<Link href={promo.primaryCta.href} />}
                  >
                    {promo.primaryCta.label}
                  </Button>
                  <Button
                    size="lg"
                    variant="secondary"
                    render={<Link href={promo.secondaryCta.href} />}
                  >
                    {promo.secondaryCta.label}
                  </Button>
                </div>
              )}
            </div>
            <Card hover={false} className="bg-card/90">
              <p className="text-sm uppercase tracking-[0.15em] text-muted-foreground font-semibold">
                {promo.benefitsHeading}
              </p>
              <ul className="mt-3 space-y-2.5">
                {promo.benefits.map(benefit => (
                  <li key={benefit} className="flex items-start gap-2 text-sm">
                    <span className="text-primary" aria-hidden="true">
                      •
                    </span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </Card>
      </section>
    ))}
  </>
)
