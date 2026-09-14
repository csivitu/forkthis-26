"use client"

import { useEffect, useState, useTransition } from "react"
import { usePathname, useRouter } from "next/navigation"
import { LoaderCircleIcon, SearchIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function DebouncedSearch({
  placeholder,
  defaultValue,
}: {
  placeholder: string
  defaultValue?: string
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [search, setSearch] = useState(defaultValue ?? "")
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const normalized = search.trim()
      const params = new URLSearchParams(window.location.search)
      if ((params.get("search") ?? "") === normalized) return
      normalized ? params.set("search", normalized) : params.delete("search")
      params.delete("page")
      startTransition(() =>
        router.replace(`${pathname}?${params}`, { scroll: false })
      )
    }, 300)
    return () => window.clearTimeout(timeout)
  }, [pathname, router, search])

  return (
    <Field className="rounded-lg border bg-card p-3">
      <FieldLabel htmlFor="search" className="sr-only">
        Search
      </FieldLabel>
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="search"
          name="search"
          className="pr-9 pl-9"
          placeholder={placeholder}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        {pending ? (
          <LoaderCircleIcon className="absolute top-1/2 right-2.5 -translate-y-1/2 animate-spin text-muted-foreground" />
        ) : null}
      </div>
    </Field>
  )
}

export function FilterBar({ children }: { children: React.ReactNode }) {
  return (
    <form className="flex flex-col items-end gap-3 rounded-lg border bg-card p-3 sm:flex-row">
      {children}
      <Button type="submit" variant="secondary">
        Apply filters
      </Button>
    </form>
  )
}
