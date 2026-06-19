import Image from "next/image"
import { Card } from "~/components/common/card"
import { celebrationContent } from "../bbl-landing-content"
import { MediaBrandmark, RegisterButtons } from "./landing-chrome"

export const BblCelebration = ({
  logoUrl,
  brandName,
}: {
  logoUrl: string | null
  brandName: string
}) => (
  <section className="w-full">
    <Card hover={false} className="relative p-0! overflow-hidden">
      <Image src={celebrationContent.image} alt="" fill sizes="100vw" className="object-cover" />
      <div
        className="absolute inset-0 bg-gradient-to-b from-media-scrim/70 via-media-scrim/60 to-media-scrim/80"
        aria-hidden="true"
      />
      <div className="relative z-10 w-full px-6 py-14 md:py-20 text-center space-y-6 text-on-media">
        <MediaBrandmark logoUrl={logoUrl} brandName={brandName} />
        <p className="italic text-on-media/90">{celebrationContent.opener}</p>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold leading-tight text-balance">
          {celebrationContent.titleLead}{" "}
          <span className="text-primary">{celebrationContent.titleAccent}</span>{" "}
          {celebrationContent.titleTail}
        </h2>
        <p className="text-on-media/90 max-w-3xl mx-auto leading-relaxed">
          as he joins the Dirty Dozen's <span className="font-semibold">Bob Bass</span> and{" "}
          <span className="font-semibold">John Will</span> in promotion by{" "}
          <span className="text-primary font-semibold">Professor Rigan Machado</span> to the rank of{" "}
          <span className="text-primary font-bold">7th Degree Coral Belt</span>
        </p>
        <RegisterButtons />
      </div>
    </Card>
  </section>
)
