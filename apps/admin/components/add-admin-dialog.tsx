"use client"

import { useState, useTransition } from "react"
import { UserPlusIcon } from "lucide-react"
import { toast } from "sonner"
import { addAdminAction } from "@/app/actions"
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

export function AddAdminDialog() {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  const submit = (formData: FormData): void =>
    startTransition(async () => {
      const result = await addAdminAction(formData)
      if (!result.success) {
        toast.error(result.message)
        return
      }
      toast.success(result.message)
      setOpen(false)
    })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlusIcon data-icon="inline-start" />
          Add admin
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add administrator</DialogTitle>
          <DialogDescription>
            The email must belong to an existing account. This console does not
            support demotion.
          </DialogDescription>
        </DialogHeader>
        <form action={submit} className="flex flex-col gap-5">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="admin-email">Email</FieldLabel>
              <Input
                id="admin-email"
                name="email"
                type="email"
                autoComplete="email"
                required
              />
            </Field>
          </FieldGroup>
          <Button type="submit" disabled={pending}>
            {pending ? "Adding…" : "Add admin"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
