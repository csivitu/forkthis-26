import type { MemberDto } from "@repo/admin-contracts"
import { ShieldCheckIcon } from "lucide-react"
import { AddAdminDialog } from "@/components/add-admin-dialog"
import { Pager } from "@/components/pager"
import { PageHeader } from "@/components/page-header"
import { DebouncedSearch } from "@/components/search-filter"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { apiGet } from "@/lib/api"

export default async function AdminsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>
}) {
  const query = await searchParams
  const params = new URLSearchParams({
    page: query.page ?? "1",
    limit: "25",
    role: "admin",
  })
  if (query.search) params.set("search", query.search)
  const response = await apiGet<MemberDto[]>(`/api/admin/members?${params}`)
  const meta = response.meta ?? {
    page: 1,
    limit: 25,
    total: response.data.length,
  }

  return (
    <>
      <PageHeader
        title="Admins"
        description="Administrators with full access to this console."
        action={<AddAdminDialog />}
      />
      <DebouncedSearch
        placeholder="Name, email, or GitHub username"
        defaultValue={query.search}
      />
      {response.data.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ShieldCheckIcon />
            </EmptyMedia>
            <EmptyTitle>No administrators found</EmptyTitle>
            <EmptyDescription>Try a broader search term.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-card">
          <Table>
            <TableHeader className="sticky top-0 bg-card">
              <TableRow>
                <TableHead>Administrator</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>GitHub</TableHead>
                <TableHead className="text-right">Total points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {response.data.map((admin) => {
                const label = admin.name ?? admin.email
                return (
                  <TableRow key={admin.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage
                            src={admin.avatarUrl ?? undefined}
                            alt=""
                          />
                          <AvatarFallback>
                            {label.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span>{admin.name ?? "Unnamed administrator"}</span>
                      </div>
                    </TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {admin.githubUsername ?? "Not linked"}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {admin.totalPoints}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
      <Pager meta={meta} path="/admins" query={{ search: query.search }} />
    </>
  )
}
