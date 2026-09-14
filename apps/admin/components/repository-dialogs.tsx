"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import type { RepositoryDto } from "@repo/admin-contracts"
import { PlusIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"
import {
  createRepositoryAction,
  deleteRepositoryAction,
  setRepositoryActivityAction,
  updateRepositoryAction,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

function RepositoryFields({
  repository,
}: {
  repository: RepositoryDto | null
}) {
  return (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor="repositoryUrl">Repository URL</FieldLabel>
        <Input
          id="repositoryUrl"
          name="repositoryUrl"
          type="url"
          placeholder="https://github.com/owner/repository"
          required
          defaultValue={
            repository
              ? `https://github.com/${repository.owner}/${repository.name}`
              : ""
          }
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="techStack">Tech stack</FieldLabel>
        <Input
          id="techStack"
          name="techStack"
          defaultValue={repository?.techStack ?? ""}
        />
      </Field>
    </FieldGroup>
  )
}

export function RepositoryDialog({
  repository,
}: {
  repository: RepositoryDto | null
}) {
  const [pending, startTransition] = useTransition()
  const submit = (formData: FormData): void =>
    startTransition(async () => {
      const result = repository
        ? await updateRepositoryAction(repository.id, formData)
        : await createRepositoryAction(formData)
      result.success
        ? toast.success(result.message)
        : toast.error(result.message)
    })
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={repository ? "outline" : "default"}>
          {repository ? (
            "Edit"
          ) : (
            <>
              <PlusIcon data-icon="inline-start" />
              Add repository
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {repository ? "Edit repository" : "Add repository"}
          </DialogTitle>
          <DialogDescription>
            {repository
              ? "The repository is validated with GitHub before it is updated."
              : "The repository is validated with GitHub before it is added."}
          </DialogDescription>
        </DialogHeader>
        <form action={submit} className="flex flex-col gap-5">
          <RepositoryFields repository={repository} />
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save repository"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function RepositoryActivityButton({
  repository,
}: {
  repository: RepositoryDto
}) {
  const [pending, startTransition] = useTransition()
  const update = (): void =>
    startTransition(async () => {
      const result = await setRepositoryActivityAction(
        repository.id,
        !repository.isActive
      )
      result.success
        ? toast.success(result.message)
        : toast.error(result.message)
    })
  return (
    <Button variant="outline" disabled={pending} onClick={update}>
      {pending ? "Updating…" : repository.isActive ? "Deactivate" : "Activate"}
    </Button>
  )
}

export function DeleteRepositoryDialog({
  repository,
}: {
  repository: RepositoryDto
}) {
  const [confirmation, setConfirmation] = useState("")
  const [pending, startTransition] = useTransition()
  const router = useRouter()
  const expected = `${repository.owner}/${repository.name}`
  const remove = (): void =>
    startTransition(async () => {
      const result = await deleteRepositoryAction(repository.id)
      if (!result.success) {
        toast.error(result.message)
        return
      }
      toast.success(result.message)
      router.replace("/repositories")
    })
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          <Trash2Icon data-icon="inline-start" />
          Delete permanently
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {expected}?</AlertDialogTitle>
          <AlertDialogDescription>
            This cascades synchronized repository records and detaches affected
            point log references. Type <strong>{expected}</strong> to continue.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Field>
          <FieldLabel htmlFor="repository-confirmation">Repository</FieldLabel>
          <Input
            id="repository-confirmation"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
          />
        </Field>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={confirmation !== expected || pending}
            onClick={remove}
          >
            {pending ? "Deleting…" : "Delete permanently"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
