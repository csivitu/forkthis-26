"use client"

import { useEffect, useState, useTransition } from "react"
import { usePathname, useRouter } from "next/navigation"
import { LoaderCircleIcon, SearchIcon } from "lucide-react"
import type { MemberDto, RepositoryDto } from "@repo/admin-contracts"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Props {
  members: MemberDto[]
  repositories: RepositoryDto[]
  defaults: {
    memberSearch?: string
    repositoryId?: string
    sort?: string
  }
}

export function PointsFilterBar({ members, repositories, defaults }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [memberSearch, setMemberSearch] = useState(defaults.memberSearch ?? "")
  const [repositoryId, setRepositoryId] = useState(defaults.repositoryId ?? "all")
  const [sort, setSort] = useState(defaults.sort ?? "newest")
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    setMemberSearch(defaults.memberSearch ?? "")
  }, [defaults.memberSearch])

  useEffect(() => {
    setRepositoryId(defaults.repositoryId ?? "all")
  }, [defaults.repositoryId])

  useEffect(() => {
    setSort(defaults.sort ?? "newest")
  }, [defaults.sort])

  // navigate helper — merges a single key change into current URL params
  function navigate(key: string, value: string | undefined) {
    const params = new URLSearchParams(window.location.search)
    if (value && value !== "all" && !(key === "sort" && value === "newest")) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete("page")
    startTransition(() =>
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    )
  }

  // Debounce the member search → navigates after 300 ms of no typing
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search)
      const current = params.get("memberSearch") ?? ""
      const next = memberSearch.trim()
      if (current === next) return
      next ? params.set("memberSearch", next) : params.delete("memberSearch")
      params.delete("page")
      startTransition(() =>
        router.replace(`${pathname}?${params.toString()}`, { scroll: false })
      )
    }, 300)
    return () => window.clearTimeout(timeout)
  }, [memberSearch, pathname, router])

  return (
    <div className="flex flex-col items-stretch gap-3 rounded-lg border bg-card p-3 sm:flex-row sm:items-center">
      {/* Member search with debounce - expanded width */}
      <Field className="w-full sm:flex-1 sm:min-w-[280px]">
        <FieldLabel htmlFor="memberSearch" className="sr-only">
          Search Member
        </FieldLabel>
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            id="memberSearch"
            className="pl-9 pr-9"
            placeholder="Search members"
            value={memberSearch}
            onChange={(e) => setMemberSearch(e.target.value)}
          />
          {pending ? (
            <LoaderCircleIcon className="absolute top-1/2 right-2.5 -translate-y-1/2 size-4 animate-spin text-muted-foreground" />
          ) : null}
        </div>
      </Field>

      {/* Repository filter */}
      <Field className="w-full sm:w-auto sm:shrink-0">
        <FieldLabel htmlFor="repositoryId" className="sr-only">
          Repository
        </FieldLabel>
        <Select
          name="repositoryId"
          value={repositoryId}
          onValueChange={(v) => {
            setRepositoryId(v)
            navigate("repositoryId", v)
          }}
        >
          <SelectTrigger id="repositoryId" className="w-full sm:w-56">
            <SelectValue placeholder="All repositories" />
          </SelectTrigger>
          <SelectContent position="popper" align="start">
            <SelectGroup>
              <SelectItem value="all">All repositories</SelectItem>
              {repositories.map((repo) => (
                <SelectItem key={repo.id} value={repo.id}>
                  {repo.owner}/{repo.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>

      {/* Sort */}
      <Field className="w-full sm:w-auto sm:shrink-0">
        <FieldLabel htmlFor="sort" className="sr-only">
          Sort by
        </FieldLabel>
        <Select
          name="sort"
          value={sort}
          onValueChange={(v) => {
            setSort(v)
            navigate("sort", v)
          }}
        >
          <SelectTrigger id="sort" className="w-full sm:w-auto">
            <span className="text-muted-foreground text-xs">Sort by:</span>
            <SelectValue placeholder="Newest first" />
          </SelectTrigger>
          <SelectContent position="popper" align="end">
            <SelectGroup>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>
    </div>
  )
}
