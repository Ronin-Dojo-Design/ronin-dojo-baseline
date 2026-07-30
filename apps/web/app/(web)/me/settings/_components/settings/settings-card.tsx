import type { ComponentType, ReactNode } from "react"
import { Card, CardDescription, CardHeader } from "~/components/common/card"
import { H4 } from "~/components/common/heading"
import { Stack } from "~/components/common/stack"

type SettingsCardProps = {
  /** Section eyebrow icon — tinted with the brand `primary` (BBL red) rather than a hardcoded hue. */
  icon: ComponentType<{ className?: string }>
  title: string
  description: string
  children: ReactNode
}

/**
 * Presentational chrome for one settings section — the icon + title + description header over a
 * body slot. Built from the repo's `Card` primitive + brand tokens (no BBLApp hardcoded classes).
 *
 * The heading font is NOT opted-in here: the page wraps the whole grid in a server-side
 * `bblHeadingScopeClass` container (see the orchestrator), so descendant headings resolve the BBL
 * type token without any client component importing the brand-typography module.
 */
export function SettingsCard({ icon: Icon, title, description, children }: SettingsCardProps) {
  return (
    <Card hover={false} className="h-full">
      <CardHeader direction="row" size="md" wrap={false}>
        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          <Icon className="size-5" />
        </div>
        <Stack direction="column" size="xs">
          <H4>{title}</H4>
          <CardDescription>{description}</CardDescription>
        </Stack>
      </CardHeader>
      {children}
    </Card>
  )
}
