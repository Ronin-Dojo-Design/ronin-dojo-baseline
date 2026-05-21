"use client"

import { Accordion as AccordionBase } from "@base-ui/react/accordion"
import { ChevronDownIcon } from "lucide-react"
import type { ComponentProps } from "react"
import { Card } from "~/components/common/card"
import { cx } from "~/lib/utils"

type AccordionProps = ComponentProps<typeof AccordionBase.Root> & {
  type?: "single" | "multiple"
}

function Accordion({ type, multiple, ...props }: AccordionProps) {
  return (
    <AccordionBase.Root
      data-slot="accordion"
      multiple={multiple ?? type === "multiple"}
      {...props}
    />
  )
}

function AccordionItem({ className, ...props }: AccordionBase.Item.Props) {
  return (
    <Card
      hover={false}
      render={
        <AccordionBase.Item
          data-slot="accordion-item"
          className={cx("p-0! gap-0!", className)}
          {...props}
        />
      }
    />
  )
}

function AccordionTrigger({ className, children, ...props }: AccordionBase.Trigger.Props) {
  return (
    <AccordionBase.Header className="flex w-full">
      <AccordionBase.Trigger
        data-slot="accordion-trigger"
        className={cx(
          "flex flex-1 items-start justify-between gap-4 rounded-md p-5 text-left text-sm font-medium transition-all hover:bg-muted [&[data-open]>svg]:rotate-180 sm:text-base",
          "outline-none focus-visible:ring-[3px] focus-visible:border-ring focus-visible:ring-ring/50",
          "disabled:pointer-events-none disabled:opacity-50",
          className,
        )}
        {...props}
      >
        {children}
        <ChevronDownIcon className="text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200 sm:size-5" />
      </AccordionBase.Trigger>
    </AccordionBase.Header>
  )
}

function AccordionContent({ className, children, ...props }: AccordionBase.Panel.Props) {
  return (
    <AccordionBase.Panel
      data-slot="accordion-content"
      className="data-closed:animate-accordion-up data-open:animate-accordion-down overflow-hidden w-full border-t text-sm text-pretty"
      {...props}
    >
      <div className={cx("p-5", className)}>{children}</div>
    </AccordionBase.Panel>
  )
}

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger }
