import { Card } from "~/components/common/card"
import { BBL_IMAGES, testimonials, testimonialsSection } from "../bbl-landing-content"
import { SectionHeading } from "./landing-chrome"

export const BblTestimonials = () => (
  <section className="w-full space-y-8">
    <SectionHeading
      eyebrow={testimonialsSection.eyebrow}
      title={testimonialsSection.title}
      description={testimonialsSection.description}
    />
    <div className="grid gap-5 md:grid-cols-2">
      {testimonials.map(item => (
        <Card key={item.name} hover={false} className="space-y-4">
          <p className="italic text-pretty">“{item.quote}”</p>
          <div className="flex items-center gap-3">
            <img
              src={item.image}
              alt={item.name}
              className="size-12 rounded-full object-cover object-top border"
              loading="lazy"
            />
            <div>
              <p className="text-sm font-semibold">{item.name}</p>
              <p className="text-xs text-muted-foreground">{item.role}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>

    <Card hover={false} className="p-0! overflow-hidden">
      <div className="w-full aspect-[3/1] overflow-hidden max-md:aspect-[21/9]">
        <img
          src={BBL_IMAGES.communityGroup}
          alt="Black Belt Legacy community group photo"
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="w-full p-6 text-center space-y-1">
        <p className="font-semibold">{testimonialsSection.groupPhotoTitle}</p>
        <p className="text-sm text-muted-foreground">{testimonialsSection.groupPhotoCopy}</p>
      </div>
    </Card>
  </section>
)
