import { ArrowRightIcon } from "lucide-react"
import { type ComponentProps, isValidElement, type ReactNode } from "react"
import { Button } from "~/components/common/button"
import { H4 } from "~/components/common/heading"
import { Stack } from "~/components/common/stack"
import { cx } from "~/lib/utils"

type ListingProps = ComponentProps<typeof Stack> & {
  title?: string
  button?: ReactNode
  separated?: boolean
  showDivider?: boolean
}

export const Listing = ({
  children,
  className,
  title,
  button,
  separated,
  showDivider = true,
  ...props
}: ListingProps) => {
  return (
    <>
      {separated && <hr />}

      <Stack
        size="lg"
        direction="column"
        className={cx("items-stretch gap-4", className)}
        {...props}
      >
        <Stack className="w-full justify-between">
          {title && <H4 render={props => <h3 {...props}>{props.children}</h3>}>{title}</H4>}

          {showDivider && <span className="flex-1 ml-1 mr-auto h-0.5 max-w-20 bg-border" />}

          {button && (
            <Button
              size="md"
              variant="secondary"
              suffix={<ArrowRightIcon />}
              className="-my-1"
              render={isValidElement(button) ? button : undefined}
            >
              {!isValidElement(button) ? button : undefined}
            </Button>
          )}
        </Stack>

        {children}
      </Stack>
    </>
  )
}
