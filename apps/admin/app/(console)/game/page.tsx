import Link from "next/link"
import type { GameQuestionDto } from "@repo/game-contracts"
import { PlusIcon, ZapIcon } from "lucide-react"
import {
  GameDeleteButton,
  GameLiveBanner,
  GamePushButton,
  GameReorderControls,
  type GameStatus,
} from "@/components/game-question-actions"
import { PageHeader } from "@/components/page-header"
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
import { formatIstDateTime } from "@/lib/date-time"

const OPTION_LABELS = ["A", "B", "C", "D"] as const

export default async function GamePage() {
  const [{ data: questions }, { data: status }] = await Promise.all([
    apiGet<GameQuestionDto[]>("/api/admin/game/questions"),
    apiGet<GameStatus>("/api/admin/game/status"),
  ])
  const orderedIds = questions.map((question) => question.id)
  const roundLive = status.liveRound !== null

  return (
    <>
      <PageHeader
        title="Fastest Fingers First"
        description="Author questions ahead of time, then push one live to everyone on the site."
        action={
          <Button asChild>
            <Link href="/game/new">
              <PlusIcon data-icon="inline-start" />
              New question
            </Link>
          </Button>
        }
      />

      <GameLiveBanner initial={status} />

      {questions.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ZapIcon />
            </EmptyMedia>
            <EmptyTitle>No questions yet</EmptyTitle>
            <EmptyDescription>
              Write a question with four options and a timer, then push it when
              the room is ready.
            </EmptyDescription>
          </EmptyHeader>
          <Button asChild>
            <Link href="/game/new">Create first question</Link>
          </Button>
        </Empty>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Order</TableHead>
                <TableHead>Question</TableHead>
                <TableHead>Answer</TableHead>
                <TableHead>Timer</TableHead>
                <TableHead>Pushed</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {questions.map((question, index) => (
                <TableRow key={question.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="w-5 text-center font-mono text-xs text-muted-foreground">
                        {index + 1}
                      </span>
                      <GameReorderControls
                        question={question}
                        orderedIds={orderedIds}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="max-w-md">
                    <Link
                      href={`/game/${question.id}`}
                      className="font-medium hover:underline"
                    >
                      {question.prompt}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {OPTION_LABELS[question.correctIndex]}
                      {" · "}
                      {question.options[question.correctIndex]}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs whitespace-nowrap">
                    {question.durationSeconds}s
                  </TableCell>
                  <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                    {question.lastPushedAt
                      ? `${formatIstDateTime(question.lastPushedAt)} (${question.timesPushed}×)`
                      : "Never"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/game/${question.id}`}>Edit</Link>
                      </Button>
                      <GamePushButton
                        question={question}
                        disabled={roundLive}
                      />
                      <GameDeleteButton question={question} />
                    </div>
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
