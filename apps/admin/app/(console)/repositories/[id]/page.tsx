import { notFound } from "next/navigation"
import type {
  IssueDto,
  PullRequestDto,
  RepositoryDto,
  SyncLogDto,
} from "@repo/admin-contracts"
import { IssuePointsDialog } from "@/components/issue-points-dialog"
import { PageHeader } from "@/components/page-header"
import { Pager } from "@/components/pager"
import {
  DeleteRepositoryDialog,
  RepositoryActivityButton,
  RepositoryDialog,
} from "@/components/repository-dialogs"
import { DebouncedSearch, FilterBar } from "@/components/search-filter"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { apiGet } from "@/lib/api"

interface RepositorySearch {
  search?: string
  difficulty?: string
  status?: string
  page?: string
}

export default async function RepositoryDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<RepositorySearch>
}) {
  const { id } = await params
  const query = await searchParams
  const issueParams = new URLSearchParams({
    repositoryId: id,
    limit: "25",
    page: query.page ?? "1",
  })
  if (query.search) issueParams.set("search", query.search)
  if (query.difficulty && query.difficulty !== "all")
    issueParams.set("difficulty", query.difficulty)
  if (query.status && query.status !== "all")
    issueParams.set("status", query.status)
  const repositoriesPromise = apiGet<RepositoryDto[]>("/api/admin/repos")
  const [repositoriesResponse, issuesResponse, prsResponse, logsResponse] =
    await Promise.all([
      repositoriesPromise,
      apiGet<IssueDto[]>(`/api/admin/issues?${issueParams}`),
      apiGet<PullRequestDto[]>(
        `/api/admin/pull-requests?repositoryId=${id}&limit=100&page=1`
      ),
      apiGet<SyncLogDto[]>(
        `/api/admin/sync-logs?repositoryId=${id}&limit=100&page=1`
      ),
    ])
  const repository = repositoriesResponse.data.find((entry) => entry.id === id)
  if (!repository) notFound()
  const issueMeta = issuesResponse.meta ?? {
    page: 1,
    limit: 25,
    total: issuesResponse.data.length,
  }
  return (
    <>
      <PageHeader
        title={`${repository.owner}/${repository.name}`}
        description={`GitHub repository ID ${repository.githubRepoId}`}
        action={
          <div className="flex gap-2">
            <Badge variant={repository.isActive ? "default" : "secondary"}>
              {repository.isActive ? "Active" : "Inactive"}
            </Badge>
            <RepositoryActivityButton repository={repository} />
            <RepositoryDialog repository={repository} />
          </div>
        }
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Last poll</CardDescription>
            <CardTitle className="text-base">
              {repository.lastPolledAt
                ? new Date(repository.lastPolledAt).toLocaleString()
                : "Never"}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Issues</CardDescription>
            <CardTitle>{repository.issueCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Tech stack</CardDescription>
            <CardTitle className="text-base">
              {repository.techStack ?? "Not specified"}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
      <Tabs defaultValue="issues">
        <TabsList>
          <TabsTrigger value="issues">Issues</TabsTrigger>
          <TabsTrigger value="prs">Pull requests</TabsTrigger>
          <TabsTrigger value="sync">Sync history</TabsTrigger>
        </TabsList>
        <TabsContent value="issues">
          <Card>
            <CardHeader>
              <CardTitle>Issues</CardTitle>
              <CardDescription>
                GitHub-owned metadata with administrator-managed base points.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <DebouncedSearch
                placeholder="Search issue titles"
                defaultValue={query.search}
              />
              <FilterBar>
                <input type="hidden" name="search" value={query.search ?? ""} />
                <Field>
                  <FieldLabel htmlFor="difficulty" className="sr-only">
                    Difficulty
                  </FieldLabel>
                  <Select
                    name="difficulty"
                    defaultValue={query.difficulty ?? "all"}
                  >
                    <SelectTrigger id="difficulty">
                      <SelectValue placeholder="All difficulties" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="all">All difficulties</SelectItem>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="status" className="sr-only">
                    Status
                  </FieldLabel>
                  <Select name="status" defaultValue={query.status ?? "all"}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="all">All statuses</SelectItem>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="solved">Solved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              </FilterBar>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Issue</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {issuesResponse.data.map((issue) => (
                    <TableRow key={issue.id}>
                      <TableCell>
                        #{issue.githubIssueNumber} · {issue.title}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{issue.difficulty}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{issue.status}</Badge>
                      </TableCell>
                      <TableCell>{issue.points}</TableCell>
                      <TableCell className="text-right">
                        <IssuePointsDialog issue={issue} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Pager
                meta={issueMeta}
                path={`/repositories/${id}`}
                query={{
                  search: query.search,
                  difficulty: query.difficulty,
                  status: query.status,
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="prs">
          <Card>
            <CardHeader>
              <CardTitle>Pull requests</CardTitle>
              <CardDescription>
                Linked issues, participants, mergeability, and timestamps.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PR</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Issue</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Mergeable</TableHead>
                    <TableHead>Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prsResponse.data.map((pr) => (
                    <TableRow key={pr.id}>
                      <TableCell>#{pr.githubPrNumber}</TableCell>
                      <TableCell>
                        {pr.participantName ?? pr.githubAuthorUsername}
                      </TableCell>
                      <TableCell>
                        {pr.issueNumber ? `#${pr.issueNumber}` : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{pr.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {pr.isMergeable === null
                          ? "Unknown"
                          : pr.isMergeable
                            ? "Yes"
                            : "No"}
                      </TableCell>
                      <TableCell>
                        {new Date(pr.updatedAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="sync">
          <Card>
            <CardHeader>
              <CardTitle>Sync history</CardTitle>
              <CardDescription>
                Scheduled synchronization is the only trigger.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Started</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Issues</TableHead>
                    <TableHead>PRs</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Failure</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logsResponse.data.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        {new Date(log.startedAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            log.status === "failed"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {log.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{log.issuesFetched}</TableCell>
                      <TableCell>{log.prsFetched}</TableCell>
                      <TableCell>
                        {log.durationMs === null
                          ? "Running"
                          : `${log.durationMs} ms`}
                      </TableCell>
                      <TableCell>{log.errorMessage ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <Card>
        <CardHeader>
          <CardTitle>Danger zone</CardTitle>
          <CardDescription>
            Permanent deletion cascades repository data and cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DeleteRepositoryDialog repository={repository} />
        </CardContent>
      </Card>
    </>
  )
}
