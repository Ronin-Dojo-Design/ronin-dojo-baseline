"use client"

import { type ReactNode, useState } from "react"
import { Button } from "~/components/common/button"
import { Stack } from "~/components/common/stack"

type Tab = {
  id: string
  label: string
  content: ReactNode
}

type DashboardTabsProps = {
  tabs: Tab[]
  defaultTab?: string
}

export function DashboardTabs({ tabs, defaultTab }: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab ?? tabs[0]?.id ?? "")

  const activeContent = tabs.find(t => t.id === activeTab)?.content

  return (
    <Stack size="lg" direction="column">
      <Stack size="sm" direction="row" wrap>
        {tabs.map(tab => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "primary" : "secondary"}
            size="sm"
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </Button>
        ))}
      </Stack>

      <div>{activeContent}</div>
    </Stack>
  )
}
