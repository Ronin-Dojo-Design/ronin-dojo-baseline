"use client"

import { useAction } from "next-safe-action/hooks"
import { useState } from "react"
import { toast } from "sonner"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { Card } from "~/components/common/card"
import { Checkbox } from "~/components/common/checkbox"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/common/dialog"
import { H3 } from "~/components/common/heading"
import { Label } from "~/components/common/label"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import { cancelRegistration, createRegistrationCheckout } from "~/server/web/tournaments/register"
import { isCancelledRegistration, isRefundedRegistration } from "./registration-notice"

interface Division {
  id: string
  name: string
  feeCents: number
  capacity: number | null
  _count?: { entries: number }
}

interface ExistingRegistration {
  id: string
  status: string
  paymentStatus: string
  entries: { division: { name: string } }[]
}

interface RegisterButtonProps {
  tournamentId: string
  divisions: Division[]
  roleCode?: string
  existingRegistration?: ExistingRegistration | null
}

export function RegisterButton({
  tournamentId,
  divisions,
  roleCode = "COMPETITOR",
  existingRegistration,
}: RegisterButtonProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [cancelled, setCancelled] = useState(false)

  const cancelAction = useAction(cancelRegistration, {
    onSuccess: () => {
      toast.success("Registration cancelled")
      setCancelled(true)
    },
    onError: ({ error }) => toast.error(error.serverError ?? "Cancellation failed"),
  })

  const registerAction = useAction(createRegistrationCheckout, {
    onSuccess: ({ data }) => {
      if (data?.type === "checkout" && data.url) {
        window.location.href = data.url
      } else if (data?.type === "free") {
        const url = new URL(window.location.href)
        url.searchParams.set("registered", "true")
        window.location.href = url.toString()
      }
    },
    onError: ({ error }) => toast.error(error.serverError ?? "Registration failed"),
  })

  const isPending = cancelAction.isPending || registerAction.isPending

  // If user already has a non-cancelled registration, show status + cancel
  if (existingRegistration && !isCancelledRegistration(existingRegistration) && !cancelled) {
    return (
      <Card className="p-4">
        <Stack direction="column" size="sm">
          <Badge variant="success" size="lg">
            Registered
          </Badge>
          <Note>
            Divisions: {existingRegistration.entries.map(e => e.division.name).join(", ")}
          </Note>
          <Note className="text-xs">
            Status: {existingRegistration.status} · Payment: {existingRegistration.paymentStatus}
          </Note>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive" size="md">
                Cancel Registration
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cancel Registration</DialogTitle>
                <DialogDescription>
                  Are you sure you want to cancel your registration? This cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="secondary">Keep Registration</Button>
                </DialogClose>
                <Button
                  variant="destructive"
                  onClick={() => cancelAction.execute({ registrationId: existingRegistration.id })}
                  isPending={cancelAction.isPending}
                >
                  Yes, Cancel
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Stack>
      </Card>
    )
  }

  if (existingRegistration && isCancelledRegistration(existingRegistration)) {
    const refunded = isRefundedRegistration(existingRegistration)
    const cancellationNote = refunded
      ? "This registration was cancelled and the payment was refunded. No tournament slot was taken."
      : "This registration has been cancelled. Contact the tournament host if you need help."

    return (
      <Card className="p-4">
        <Stack direction="column" size="sm">
          <Badge variant={refunded ? "warning" : "danger"} size="lg">
            {refunded ? "Refunded" : "Cancelled"}
          </Badge>
          <Note>{cancellationNote}</Note>
          <Note className="text-xs">
            Status: {existingRegistration.status} · Payment: {existingRegistration.paymentStatus}
          </Note>
        </Stack>
      </Card>
    )
  }

  if (cancelled) {
    return (
      <Card className="p-4">
        <Note>Your registration has been cancelled.</Note>
      </Card>
    )
  }

  const toggle = (id: string) => {
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]))
  }

  const totalCents = divisions
    .filter(d => selectedIds.includes(d.id))
    .reduce((sum, d) => sum + d.feeCents, 0)

  const handleRegister = () => {
    if (selectedIds.length === 0) return
    registerAction.execute({
      tournamentId,
      divisionIds: selectedIds,
      roleCode,
    })
  }

  return (
    <Stack direction="column" size="md">
      <H3>Select Divisions</H3>

      <Stack direction="column" size="sm">
        {divisions.map(div => {
          const atCapacity = div.capacity != null && (div._count?.entries ?? 0) >= div.capacity
          const isSelected = selectedIds.includes(div.id)
          return (
            <Card
              key={div.id}
              className={`p-3 transition-colors ${
                atCapacity
                  ? "cursor-not-allowed opacity-50"
                  : isSelected
                    ? "border-primary bg-primary/5"
                    : "hover:border-muted-foreground/50"
              }`}
            >
              <Label className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={isSelected}
                  disabled={atCapacity}
                  onCheckedChange={() => toggle(div.id)}
                />
                <span className="flex-1">
                  {div.name}
                  {atCapacity && (
                    <Badge variant="danger" size="sm" className="ml-2">
                      Full
                    </Badge>
                  )}
                </span>
                <span className="text-sm text-muted-foreground">
                  {div.feeCents > 0 ? `$${(div.feeCents / 100).toFixed(2)}` : "Free"}
                </span>
              </Label>
            </Card>
          )
        })}
      </Stack>

      {selectedIds.length > 0 && (
        <Note className="font-medium">
          Total: {totalCents > 0 ? `$${(totalCents / 100).toFixed(2)}` : "Free"}
        </Note>
      )}

      <Button
        variant="primary"
        size="lg"
        onClick={handleRegister}
        disabled={selectedIds.length === 0 || isPending}
        isPending={registerAction.isPending}
      >
        {selectedIds.length === 0 ? "Select a division" : "Register"}
      </Button>
    </Stack>
  )
}
