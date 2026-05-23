"use client"

import { PlusIcon, Trash2Icon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { Card } from "~/components/common/card"
import { H4 } from "~/components/common/heading"
import { Stack } from "~/components/common/stack"
import { deleteContentVariant } from "~/server/admin/content/actions"
import type { findContentAtomById } from "~/server/admin/content/queries"
import { ContentVariantForm } from "./content-variant-form"

type Atom = NonNullable<Awaited<ReturnType<typeof findContentAtomById>>>

type ContentVariantsPanelProps = {
  atom: Atom
}

export function ContentVariantsPanel({ atom }: ContentVariantsPanelProps) {
  const router = useRouter()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const handleDelete = async (variantId: string) => {
    if (!confirm("Delete this variant?")) return
    const result = await deleteContentVariant({ ids: [variantId] })
    if (result?.data) {
      toast.success("Variant deleted")
      router.refresh()
    }
  }

  return (
    <div className="grid gap-4">
      <Stack className="justify-between">
        <H4>Variants ({atom.variants.length})</H4>
        <Button
          size="sm"
          variant="secondary"
          prefix={<PlusIcon />}
          onClick={() => {
            setIsCreating(true)
            setEditingId(null)
          }}
        >
          Add variant
        </Button>
      </Stack>

      {isCreating && <ContentVariantForm atomId={atom.id} onDone={() => setIsCreating(false)} />}

      {atom.variants.map(variant =>
        editingId === variant.id ? (
          <ContentVariantForm
            key={variant.id}
            atomId={atom.id}
            variant={variant}
            onDone={() => setEditingId(null)}
          />
        ) : (
          <Card key={variant.id} className="p-4">
            <Stack className="flex items-center justify-between">
              <Stack size="sm" className="flex-wrap">
                <Badge variant="outline">{variant.channel}</Badge>
                <Badge variant={variant.status === "PUBLISHED" ? "success" : "soft"}>
                  {variant.status}
                </Badge>
                <span className="text-sm font-medium">{variant.publicTitle || variant.brand}</span>
                {variant.publishDate && (
                  <span className="text-xs text-muted">
                    {new Date(variant.publishDate).toLocaleDateString()}
                  </span>
                )}
              </Stack>
              <Stack size="xs">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setEditingId(variant.id)
                    setIsCreating(false)
                  }}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  prefix={<Trash2Icon />}
                  onClick={() => handleDelete(variant.id)}
                />
              </Stack>
            </Stack>
          </Card>
        ),
      )}

      {!atom.variants.length && !isCreating && (
        <p className="text-sm text-muted">No variants yet. Add one to start publishing.</p>
      )}
    </div>
  )
}
