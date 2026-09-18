"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import type { GameQuestionDto } from "@repo/game-contracts"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  RadioIcon,
  SquareIcon,
  Trash2Icon,
} from "lucide-react"
import { toast } from "sonner"
import {
  deleteGameQuestionAction,
  endGameRoundAction,
  pushGameQuestionAction,
  reorderGameQuestionsAction,
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

export interface GameStatus {
  connectedClients: number
  liveRound: { roundId: string; prompt: string; endsAt: string } | null
}

export function GameReorderControls({
  question,
  orderedIds,
}: {
  question: GameQuestionDto
  orderedIds: string[]
}) {
  const [pending, startTransition] = useTransition()
  const index = orderedIds.indexOf(question.id)

  const move = (offset: -1 | 1): void =>
    startTransition(async () => {
      const target = index + offset
      const reordered = [...orderedIds]
      const currentId = reordered[index]
      const targetId = reordered[target]
      if (!currentId || !targetId) {
        toast.error("Question cannot move beyond the current list")
        return
      }
      reordered[index] = targetId
      reordered[target] = currentId
      const result = await reorderGameQuestionsAction(reordered)
      result.success
        ? toast.success(result.message)
        : toast.error(result.message)
    })

  return (
    <div className="flex gap-1">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Move question up"
        disabled={pending || index <= 0}
        onClick={() => move(-1)}
      >
        <ArrowUpIcon />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Move question down"
        disabled={pending || index < 0 || index >= orderedIds.length - 1}
        onClick={() => move(1)}
      >
        <ArrowDownIcon />
      </Button>
    </div>
  )
}

/**
 * Pushing is the one irreversible action here — it interrupts every
 * participant on the site at once — so it always asks first.
 */
export function GamePushButton({
  question,
  disabled,
}: {
  question: GameQuestionDto
  disabled: boolean
}) {
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  const push = (): void =>
    startTransition(async () => {
      const result = await pushGameQuestionAction(question.id)
      result.success
        ? toast.success(result.message)
        : toast.error(result.message)
      router.refresh()
    })

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" disabled={pending || disabled}>
          <RadioIcon data-icon="inline-start" />
          Push
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Push this question live?</AlertDialogTitle>
          <AlertDialogDescription>
            Every signed-in participant currently on the site gets this question
            as a full-screen popup immediately, with {question.durationSeconds}{" "}
            seconds on the clock. This cannot be recalled.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={push}>Push it</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function GameDeleteButton({ question }: { question: GameQuestionDto }) {
  const [pending, startTransition] = useTransition()

  const remove = (): void =>
    startTransition(async () => {
      const result = await deleteGameQuestionAction(question.id)
      result.success
        ? toast.success(result.message)
        : toast.error(result.message)
    })

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Delete question"
          disabled={pending}
        >
          <Trash2Icon />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this question?</AlertDialogTitle>
          <AlertDialogDescription>
            Rounds already played keep their own copy of the question and the
            answers given, so past results and standings are unaffected.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={remove}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

/**
 * Live banner. Polls the status endpoint every two seconds — this is the admin
 * console with one or two operators on it, not the participant path, so
 * polling here costs nothing and avoids a second SSE consumer.
 */
export function GameLiveBanner({ initial }: { initial: GameStatus }) {
  const router = useRouter()
  const [status, setStatus] = useState(initial)
  const [remaining, setRemaining] = useState(0)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "")
    if (!apiUrl) return
    const poll = setInterval(async () => {
      try {
        const response = await fetch(`${apiUrl}/api/admin/game/status`, {
          credentials: "include",
          cache: "no-store",
        })
        if (!response.ok) return
        const payload = (await response.json()) as { data: GameStatus }
        setStatus(payload.data)
      } catch {
        // A dropped poll is not worth surfacing; the next one will land.
      }
    }, 2_000)
    return () => clearInterval(poll)
  }, [])

  useEffect(() => {
    if (!status.liveRound) {
      setRemaining(0)
      return
    }
    const endsAt = Date.parse(status.liveRound.endsAt)
    const tick = setInterval(
      () => setRemaining(Math.max(endsAt - Date.now(), 0)),
      100
    )
    return () => clearInterval(tick)
  }, [status.liveRound])

  const endRound = (): void =>
    startTransition(async () => {
      const result = await endGameRoundAction()
      result.success
        ? toast.success(result.message)
        : toast.error(result.message)
      router.refresh()
    })

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-4">
      <div className="flex items-center gap-3">
        <span
          className={`size-2.5 rounded-full ${
            status.liveRound ? "animate-pulse bg-primary" : "bg-muted-foreground"
          }`}
        />
        <div>
          <p className="text-sm font-medium">
            {status.liveRound ? "Question live" : "No question live"}
          </p>
          <p className="font-mono text-xs text-muted-foreground">
            {status.connectedClients} participant
            {status.connectedClients === 1 ? "" : "s"} connected
            {status.liveRound
              ? ` · ${(remaining / 1000).toFixed(1)}s remaining`
              : ""}
          </p>
        </div>
      </div>
      {status.liveRound ? (
        <Button
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={endRound}
        >
          <SquareIcon data-icon="inline-start" />
          End now &amp; reveal
        </Button>
      ) : null}
    </div>
  )
}
