import type { ComponentProps } from "react"
import { Markdown } from "~/components/web/markdown"
import { Author, type AuthorProps } from "~/components/web/ui/author"
import { cx } from "~/lib/utils"

type TestimonialProps = ComponentProps<"blockquote"> & {
  quote: string
  author: AuthorProps
}

export const Testimonial = ({ quote, author, className, ...props }: TestimonialProps) => {
  return (
    <blockquote
      className={cx("flex flex-col items-center gap-4 max-w-2xl mx-auto", className)}
      {...props}
    >
      <Markdown className="text-center text-lg/relaxed" code={quote} />

      <Author {...author} />
    </blockquote>
  )
}
