import { Card } from "~/components/common/card"
import { videoContent } from "../bbl-landing-content"
import { SectionHeading } from "./landing-chrome"

export const BblVideo = () => (
  <section className="w-full max-w-4xl mx-auto space-y-6">
    <SectionHeading
      eyebrow={videoContent.eyebrow}
      title={videoContent.title}
      description={videoContent.description}
    />
    <Card hover={false} className="p-0! overflow-hidden">
      <div className="aspect-video w-full">
        <iframe
          title={videoContent.embedTitle}
          src={videoContent.embedUrl}
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </Card>
    <p className="text-center text-sm text-muted-foreground">{videoContent.caption}</p>
  </section>
)
