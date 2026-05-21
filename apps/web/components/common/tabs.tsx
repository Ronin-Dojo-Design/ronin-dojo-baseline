"use client"

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"
import type { ComponentProps } from "react"
import { cx } from "~/lib/utils"

/**
 * Tabs primitive built on Base UI Tabs.
 *
 * Created: SESSION_0176 TASK_02. Migrated to Base UI: SESSION_0218.
 */

const Tabs = TabsPrimitive.Root

const TabsList = ({ className, ...props }: ComponentProps<typeof TabsPrimitive.List>) => (
  <TabsPrimitive.List
    className={cx("inline-flex items-center gap-1 rounded-md bg-muted p-1", className)}
    {...props}
  />
)

const TabsTrigger = ({ className, ...props }: ComponentProps<typeof TabsPrimitive.Tab>) => (
  <TabsPrimitive.Tab
    className={cx(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all",
      "focus-visible:outline-ring",
      "disabled:pointer-events-none disabled:opacity-50",
      "data-selected:bg-background data-selected:text-foreground data-selected:shadow-sm",
      className,
    )}
    {...props}
  />
)

const TabsContent = ({ className, ...props }: ComponentProps<typeof TabsPrimitive.Panel>) => (
  <TabsPrimitive.Panel
    className={cx("mt-2 ring-offset-background focus-visible:outline-ring", className)}
    {...props}
  />
)

export { Tabs, TabsContent, TabsList, TabsTrigger }
