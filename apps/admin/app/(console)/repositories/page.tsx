import Link from "next/link"
import type { RepositoryDto } from "@repo/admin-contracts"
import { FolderGit2Icon } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { RepositoryDialog } from "@/components/repository-dialogs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { formatDateTime } from "@/lib/utils"

export default async function RepositoriesPage() {
  const { data } = await apiGet<RepositoryDto[]>("/api/admin/repos")
  return (
    <>
      <PageHeader
        title="Repositories"
        description="Manage synchronized GitHub repositories and inspect their operational history."
        action={<RepositoryDialog repository={null} />}
      />
      {data.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FolderGit2Icon />
            </EmptyMedia>
            <EmptyTitle>No repositories</EmptyTitle>
            <EmptyDescription>
              Add the first repository to include it in scheduled
              synchronization.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-card">
          <Table>
            <TableHeader className="sticky top-0 bg-card">
              <TableRow>
                <TableHead>Repository</TableHead>
                <TableHead>GitHub ID</TableHead>
                <TableHead>Stack</TableHead>
                <TableHead>Issues</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((repository) => (
                <TableRow key={repository.id}>
                  <TableCell>
                    <p className="font-medium">
                      {repository.owner}/{repository.name}
                    </p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {repository.lastPolledAt
                        ? `Polled ${formatDateTime(repository.lastPolledAt)}`
                        : "Never polled"}
                    </p>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {repository.githubRepoId}
                  </TableCell>
                  <TableCell>{repository.techStack ?? "—"}</TableCell>
                  <TableCell>{repository.issueCount}</TableCell>
                  <TableCell>
                    <Badge
                      variant={repository.isActive ? "default" : "secondary"}
                    >
                      {repository.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/repositories/${repository.id}`}>
                        Inspect
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  )
}
