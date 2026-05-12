"use client"

import { useAction } from "next-safe-action/hooks"
import { XIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { AnimatedContainer } from "~/components/common/animated-container"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { Card } from "~/components/common/card"
import { H3 } from "~/components/common/heading"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import { ComboboxSelector } from "~/components/admin/combobox-selector"
import { addProgramWaiver, removeProgramWaivers } from "~/server/admin/programs/actions"

type LinkedWaiver = { id: string; title: string; type: string; required: boolean }

type ProgramWaiversEditorProps = {
  programId: string
  linkedWaivers: LinkedWaiver[]
  availableWaivers: { id: string; title: string; type: string }[]
}

export function ProgramWaiversEditor({
  programId,
  linkedWaivers,
  availableWaivers,
}: ProgramWaiversEditorProps) {
  const router = useRouter()

  const addAction = useAction(addProgramWaiver, {
    onSuccess: () => {
      toast.success("Waiver added")
      router.refresh()
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Failed to add waiver")
    },
  })

  const removeAction = useAction(removeProgramWaivers, {
    onSuccess: () => {
      toast.success("Waiver removed")
      router.refresh()
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Failed to remove waiver")
    },
  })

  const handleAdd = (waiverId: string) => {
    if (!waiverId) return
    addAction.execute({ programId, waiverId, required: true })
  }

  const handleRemove = (waiverId: string) => {
    removeAction.execute({ programId, waiverIds: [waiverId] })
  }

  const comboboxOptions = availableWaivers.map(w => ({ id: w.id, name: `${w.title} (${w.type})` }))

  return (
    <Stack direction="column" size="md">
      <H3>Waivers</H3>

      <ComboboxSelector
        options={comboboxOptions}
        value=""
        onValueChange={handleAdd}
        placeholder="Add a waiver..."
        searchPlaceholder="Search waivers..."
        emptyMessage="No available waivers."
      />

      <AnimatedContainer height>
        <div>
          {linkedWaivers.length === 0 ? (
            <Note>No waivers linked to this program yet.</Note>
          ) : (
            <Stack direction="column" size="sm">
              {linkedWaivers.map(waiver => (
                <Card key={waiver.id}>
                  <Stack direction="row" size="sm" className="items-center justify-between p-3">
                    <Stack direction="row" size="sm" className="items-center">
                      <Badge variant="soft" size="sm">{waiver.type}</Badge>
                      <span className="text-sm font-medium">{waiver.title}</span>
                      {waiver.required && (
                        <Badge variant="outline" size="sm">Required</Badge>
                      )}
                    </Stack>

                    <Button
                      variant="ghost"
                      size="sm"
                      prefix={<XIcon />}
                      onClick={() => handleRemove(waiver.id)}
                      isPending={removeAction.isPending}
                    />
                  </Stack>
                </Card>
              ))}
            </Stack>
          )}
        </div>
      </AnimatedContainer>
    </Stack>
  )
}
