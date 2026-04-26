import { setQueryParams } from "@primoui/utils"
import { Button, type ButtonProps } from "@react-email/components"
import { siteConfig } from "~/config/site"

export const EmailButton = ({ className, href, ...props }: ButtonProps) => {
  return (
    <Button
      className={`my-4 rounded-md bg-neutral-950 px-5 py-2.5 text-center text-sm font-medium text-white no-underline ${className ?? ""}`}
      href={setQueryParams(href!, { ref: siteConfig.domain })}
      {...props}
    />
  )
}
