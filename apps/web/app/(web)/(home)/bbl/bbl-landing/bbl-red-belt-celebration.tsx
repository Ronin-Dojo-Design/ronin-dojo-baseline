import Image from "next/image"
import { Card } from "~/components/common/card"
import { redBeltCelebration } from "../bbl-landing-content"
import { MediaBrandmark, RegisterButtons } from "./landing-chrome"

export const BblRedBeltCelebration = ({
  logoUrl,
  brandName,
}: {
  logoUrl: string | null
  brandName: string
}) => (
  <section className="w-full">
    <Card hover={false} className="relative p-0! overflow-hidden">
      <Image src={redBeltCelebration.image} alt="" fill sizes="100vw" className="object-cover" />
      <div
        className="absolute inset-0 bg-gradient-to-b from-media-scrim/75 via-primary/30 to-media-scrim/85"
        aria-hidden="true"
      />
      <div className="relative z-10 w-full space-y-7 px-6 py-16 text-center text-on-media md:py-24">
        <MediaBrandmark logoUrl={logoUrl} brandName={brandName} />
        <p className="italic text-on-media/90">{redBeltCelebration.opener}</p>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold leading-tight text-balance">
          {redBeltCelebration.titleLead}{" "}
          <span className="text-primary">{redBeltCelebration.titleAccent}</span>{" "}
          {redBeltCelebration.titleTail}
        </h2>
        <p className="text-on-media/90 max-w-3xl mx-auto leading-relaxed">
          {redBeltCelebration.bodyLead}{" "}
          <span className="text-primary font-bold">{redBeltCelebration.bodyRank}</span>{" "}
          {redBeltCelebration.bodyMid}{" "}
          <span className="font-semibold">{redBeltCelebration.bodyBy}</span>{" "}
          {redBeltCelebration.bodyTail}
        </p>
        <RegisterButtons />
      </div>
    </Card>
  </section>
)
