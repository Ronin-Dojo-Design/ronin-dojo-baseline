import { setQueryParams } from "@dirstack/utils"
import { Button, type ButtonProps } from "@react-email/components"
import { siteConfig } from "~/config/site"

export const EmailButton = ({ className, href, style, ...props }: ButtonProps) => {
  return (
    <Button
      className={`my-4 rounded-md bg-red-600 px-5 py-2.5 text-center text-sm font-bold text-white no-underline ${className ?? ""}`}
      // FI-011: brand-red enabled-looking CTA (was near-black `bg-neutral-950`, which iOS
      // Mail's dark-mode transform / class-stripping clients washed out to a grey
      // "disabled" look). Colors set inline so they can't be stripped.
      style={{ backgroundColor: "#dc2626", color: "#ffffff", ...style }}
      href={setQueryParams(href!, { ref: siteConfig.domain })}
      {...props}
    />
  )
}
