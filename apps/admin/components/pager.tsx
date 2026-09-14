import type { PaginationMeta } from "@repo/admin-contracts"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export function Pager({
  meta,
  path,
  query,
}: {
  meta: PaginationMeta
  path: string
  query: Record<string, string | undefined>
}) {
  const pages = Math.max(1, Math.ceil(meta.total / meta.limit))
  const href = (page: number): string =>
    `${path}?${new URLSearchParams(Object.entries({ ...query, page: String(page) }).filter((entry): entry is [string, string] => entry[1] !== undefined)).toString()}`
  return (
    <div className="flex items-center justify-between gap-3">
      <p className="font-mono text-xs text-muted-foreground">
        {meta.total} records · page {meta.page}/{pages}
      </p>
      <Pagination className="mx-0 w-auto">
        <PaginationContent>
          <PaginationItem>
            {meta.page > 1 ? (
              <PaginationPrevious href={href(meta.page - 1)} />
            ) : null}
          </PaginationItem>
          <PaginationItem>
            {meta.page < pages ? (
              <PaginationNext href={href(meta.page + 1)} />
            ) : null}
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
