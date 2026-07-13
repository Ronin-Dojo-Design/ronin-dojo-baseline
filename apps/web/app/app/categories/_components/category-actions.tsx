"use client"

import { CopyIcon } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import type { ComponentProps } from "react"
import { toast } from "sonner"
import type { Category } from "~/.generated/prisma/browser"
import { CategoriesDeleteDialog } from "~/app/app/categories/_components/categories-delete-dialog"
import { RowActionsMenu } from "~/components/admin/row-actions-menu"
import { RowDeleteButton } from "~/components/admin/row-delete-button"
import type { Button } from "~/components/common/button"
import { DropdownMenuItem, DropdownMenuSeparator } from "~/components/common/dropdown-menu"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { duplicateCategory } from "~/server/admin/categories/actions"

type CategoryActionsProps = ComponentProps<typeof Button> & {
  category: Category
}

export const CategoryActions = ({ category, className, ...props }: CategoryActionsProps) => {
  const pathname = usePathname()
  const router = useRouter()

  const categoryPath = `/app/categories/${category.slug}`
  const isCategoryPage = pathname === categoryPath

  const { executeAsync } = useAction(duplicateCategory, {
    onSuccess: ({ data }) => {
      if (isCategoryPage) {
        router.push(`/app/categories/${data.slug}`)
      }
    },
  })

  const handleDuplicate = () => {
    toast.promise(
      async () => {
        const { serverError } = await executeAsync({ id: category.id })

        if (serverError) {
          throw new Error(serverError)
        }
      },
      {
        loading: "Duplicating category...",
        success: "Category duplicated successfully",
        error: err => `Failed to duplicate category: ${err.message}`,
      },
    )
  }

  return (
    <Stack size="sm" wrap={false}>
      <RowActionsMenu className={className} {...props}>
        {!isCategoryPage && (
          <DropdownMenuItem render={<Link href={categoryPath} />}>Edit</DropdownMenuItem>
        )}

        <DropdownMenuItem render={<Link href={`/categories/${category.slug}`} target="_blank" />}>
          View
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleDuplicate}>
          <CopyIcon />
          Duplicate
        </DropdownMenuItem>
      </RowActionsMenu>

      <CategoriesDeleteDialog
        categories={[category]}
        onExecute={() => router.push("/app/categories")}
      >
        <RowDeleteButton {...props} />
      </CategoriesDeleteDialog>
    </Stack>
  )
}
