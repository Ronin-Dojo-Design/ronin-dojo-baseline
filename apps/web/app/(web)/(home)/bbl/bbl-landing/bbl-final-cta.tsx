import { Card } from "~/components/common/card"
import { H2 } from "~/components/common/heading"
import { finalCta } from "../bbl-landing-content"
import { RegisterButtons } from "./landing-chrome"

export const BblFinalCta = () => (
  <section className="w-full">
    <Card
      hover={false}
      className="items-center p-8 md:p-12 text-center space-y-5 bg-gradient-to-br from-card to-muted"
    >
      <H2>{finalCta.title}</H2>
      <p className="text-muted-foreground max-w-2xl mx-auto">{finalCta.description}</p>
      <RegisterButtons />
    </Card>
  </section>
)
