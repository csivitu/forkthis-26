"use client"

import { useEffect, useMemo, useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { MarkdownContent } from "@repo/markdown/content"
import type { ResourceSectionAdminDto } from "@repo/resource-contracts"
import { SaveIcon } from "lucide-react"
import { toast } from "sonner"
import {
  createResourceSectionAction,
  updateResourceSectionAction,
} from "@/app/actions"
import { ResourceLifecycleActions } from "@/components/resource-section-actions"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

interface DraftValue {
  title: string
  slug: string
  markdown: string
}

const slugify = (title: string): string =>
  title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)

const sameDraft = (left: DraftValue, right: DraftValue): boolean =>
  left.title === right.title &&
  left.slug === right.slug &&
  left.markdown === right.markdown

export function ResourceEditor({
  section,
}: {
  section: ResourceSectionAdminDto | null
}) {
  const initialValue = useMemo<DraftValue>(
    () => ({
      title: section?.title ?? "",
      slug: section?.slug ?? "",
      markdown: section?.markdown ?? "",
    }),
    [section]
  )
  const [draft, setDraft] = useState(initialValue)
  const [savedDraft, setSavedDraft] = useState(initialValue)
  const [pending, startTransition] = useTransition()
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(
    null
  )
  const slugEdited = useRef(Boolean(section))
  const router = useRouter()
  const dirty = !sameDraft(draft, savedDraft)

  useEffect(() => {
    if (!dirty) return

    const beforeUnload = (event: BeforeUnloadEvent): void => {
      event.preventDefault()
    }
    const confirmLink = (event: MouseEvent): void => {
      const target = event.target instanceof Element ? event.target : null
      const anchor = target?.closest<HTMLAnchorElement>("a[href]")
      if (!anchor || anchor.target === "_blank") return
      const destination = new URL(anchor.href, window.location.href)
      if (destination.origin !== window.location.origin) return
      event.preventDefault()
      event.stopPropagation()
      setPendingNavigation(
        `${destination.pathname}${destination.search}${destination.hash}`
      )
    }

    window.addEventListener("beforeunload", beforeUnload)
    document.addEventListener("click", confirmLink, true)
    return () => {
      window.removeEventListener("beforeunload", beforeUnload)
      document.removeEventListener("click", confirmLink, true)
    }
  }, [dirty])

  const discardAndNavigate = (): void => {
    if (!pendingNavigation) return
    const destination = pendingNavigation
    setPendingNavigation(null)
    router.push(destination)
  }

  const updateTitle = (title: string): void =>
    setDraft((current) => ({
      ...current,
      title,
      slug: slugEdited.current ? current.slug : slugify(title),
    }))

  const updateSlug = (slug: string): void => {
    slugEdited.current = true
    setDraft((current) => ({ ...current, slug }))
  }

  const submit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    startTransition(async () => {
      const result = section
        ? await updateResourceSectionAction(section.id, formData)
        : await createResourceSectionAction(formData)
      if (!result.success) {
        toast.error(result.message)
        return
      }
      toast.success(result.message)
      setSavedDraft(draft)
      if (!section && result.resourceId) {
        router.replace(`/resources/${result.resourceId}`)
        return
      }
      router.refresh()
    })
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={submit}>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2">
          <Badge
            variant={
              section?.publicationStatus === "published"
                ? "default"
                : "secondary"
            }
          >
            {section?.publicationStatus ?? "draft"}
          </Badge>
          {dirty ? (
            <span className="text-xs text-muted-foreground">
              Unsaved changes
            </span>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {section && !dirty ? (
            <ResourceLifecycleActions section={section} />
          ) : null}
          <Button type="submit" disabled={pending || !dirty}>
            <SaveIcon data-icon="inline-start" />
            {pending ? "Saving…" : section ? "Save draft" : "Create draft"}
          </Button>
        </div>
      </div>

      {section?.publicationStatus === "modified" ? (
        <Alert>
          <AlertTitle>Published content is unchanged</AlertTitle>
          <AlertDescription>
            Saving only updates this draft. Republish when the changes are ready
            for participants.
          </AlertDescription>
        </Alert>
      ) : null}

      {section && dirty ? (
        <p className="text-xs text-muted-foreground">
          Save the draft before publishing or changing its publication state.
        </p>
      ) : null}

      <FieldGroup className="grid gap-5 lg:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="title">Title</FieldLabel>
          <Input
            id="title"
            name="title"
            value={draft.title}
            maxLength={120}
            required
            onChange={(event) => updateTitle(event.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="slug">Slug</FieldLabel>
          <Input
            id="slug"
            name="slug"
            value={draft.slug}
            maxLength={80}
            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
            required
            onChange={(event) => updateSlug(event.target.value)}
          />
          <FieldDescription>
            Lowercase kebab-case. Existing public links change when this draft
            is republished.
          </FieldDescription>
        </Field>
      </FieldGroup>

      <Tabs defaultValue="edit">
        <TabsList>
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        <TabsContent value="edit" className="pt-3">
          <Field>
            <FieldLabel htmlFor="markdown">Markdown</FieldLabel>
            <Textarea
              id="markdown"
              name="markdown"
              value={draft.markdown}
              required
              className="min-h-[32rem] resize-y font-mono text-sm"
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  markdown: event.target.value,
                }))
              }
            />
            <FieldDescription>Maximum 65,536 UTF-8 bytes.</FieldDescription>
          </Field>
        </TabsContent>
        <TabsContent value="preview" className="pt-3">
          <div className="min-h-[32rem] rounded-lg border bg-card p-5 md:p-8">
            {draft.markdown.trim() ? (
              <MarkdownContent
                markdown={draft.markdown}
                className="admin-markdown"
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                Add Markdown to preview this section.
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {section ? (
        <div className="grid gap-2 rounded-lg border bg-card p-4 font-mono text-xs text-muted-foreground sm:grid-cols-2">
          <span>Updated {new Date(section.updatedAt).toLocaleString()}</span>
          <span>
            {section.publishedAt
              ? `Published ${new Date(section.publishedAt).toLocaleString()}`
              : "Never published"}
          </span>
        </div>
      ) : null}

      <AlertDialog
        open={pendingNavigation !== null}
        onOpenChange={(open) => {
          if (!open) setPendingNavigation(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>
              Your resource draft has unsaved edits. Leave this page and lose
              those changes?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel type="button">Keep editing</AlertDialogCancel>
            <AlertDialogAction
              type="button"
              variant="destructive"
              onClick={discardAndNavigate}
            >
              Leave page
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  )
}
