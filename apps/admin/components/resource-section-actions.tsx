"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import type { ResourceSectionSummaryDto } from "@repo/resource-contracts"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  SendIcon,
  Trash2Icon,
  Undo2Icon,
} from "lucide-react"
import { toast } from "sonner"
import {
  deleteResourceSectionAction,
  publishResourceSectionAction,
  reorderResourceSectionsAction,
  unpublishResourceSectionAction,
} from "@/app/actions"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

export function ResourceReorderControls({
  section,
  orderedIds,
}: {
  section: ResourceSectionSummaryDto
  orderedIds: string[]
}) {
  const [pending, startTransition] = useTransition()
  const index = orderedIds.indexOf(section.id)

  const move = (offset: -1 | 1): void =>
    startTransition(async () => {
      const target = index + offset
      const reordered = [...orderedIds]
      const currentId = reordered[index]
      const targetId = reordered[target]
      if (!currentId || !targetId) {
        toast.error("Section cannot move beyond the current list")
        return
      }
      reordered[index] = targetId
      reordered[target] = currentId
      const result = await reorderResourceSectionsAction(reordered)
      result.success
        ? toast.success(result.message)
        : toast.error(result.message)
    })

  return (
    <div className="flex gap-1">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={`Move ${section.title} up`}
        disabled={pending || index <= 0}
        onClick={() => move(-1)}
      >
        <ArrowUpIcon />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={`Move ${section.title} down`}
        disabled={pending || index === -1 || index >= orderedIds.length - 1}
        onClick={() => move(1)}
      >
        <ArrowDownIcon />
      </Button>
    </div>
  )
}

export function ResourceLifecycleActions({
  section,
}: {
  section: ResourceSectionSummaryDto
}) {
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  const publish = (): void =>
    startTransition(async () => {
      const result = await publishResourceSectionAction(section.id)
      result.success
        ? toast.success(result.message)
        : toast.error(result.message)
    })

  const unpublish = (): void =>
    startTransition(async () => {
      const result = await unpublishResourceSectionAction(section.id)
      result.success
        ? toast.success(result.message)
        : toast.error(result.message)
    })

  const remove = (): void =>
    startTransition(async () => {
      const result = await deleteResourceSectionAction(section.id)
      if (!result.success) {
        toast.error(result.message)
        return
      }
      toast.success(result.message)
      router.replace("/resources")
    })

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <Button type="button" size="sm" disabled={pending} onClick={publish}>
        <SendIcon data-icon="inline-start" />
        {section.publicationStatus === "draft" ? "Publish" : "Republish"}
      </Button>
      {section.publicationStatus !== "draft" ? (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={pending}
            >
              <Undo2Icon data-icon="inline-start" />
              Unpublish
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Unpublish {section.title}?</AlertDialogTitle>
              <AlertDialogDescription>
                Participants will lose access immediately. The editable draft
                stays in the admin console.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
              <AlertDialogAction
                type="button"
                disabled={pending}
                onClick={unpublish}
              >
                Unpublish section
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : null}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={pending}
          >
            <Trash2Icon data-icon="inline-start" />
            Delete
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {section.title} permanently?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This removes the draft and any published snapshot. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
            <AlertDialogAction
              type="button"
              variant="destructive"
              disabled={pending}
              onClick={remove}
            >
              Delete permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
