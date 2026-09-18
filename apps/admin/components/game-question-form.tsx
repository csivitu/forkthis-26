"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  GAME_OPTION_COUNT,
  MAX_QUESTION_SECONDS,
  MIN_QUESTION_SECONDS,
  type GameQuestionDto,
} from "@repo/game-contracts"
import { SaveIcon } from "lucide-react"
import { toast } from "sonner"
import {
  createGameQuestionAction,
  updateGameQuestionAction,
} from "@/app/actions"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const OPTION_LABELS = ["A", "B", "C", "D"] as const

const emptyOptions = Array.from({ length: GAME_OPTION_COUNT }, () => "")

export function GameQuestionForm({
  question,
}: {
  question: GameQuestionDto | null
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [options, setOptions] = useState<string[]>(
    question?.options ?? emptyOptions
  )
  const [correctIndex, setCorrectIndex] = useState(question?.correctIndex ?? 0)

  const setOption = (index: number, next: string): void =>
    setOptions((current) =>
      current.map((option, position) => (position === index ? next : option))
    )

  const submit = (formData: FormData): void => {
    // The radio group and the option inputs are controlled, so their values
    // are appended here rather than relying on the DOM.
    options.forEach((option, index) =>
      formData.set(`option-${index}`, option)
    )
    formData.set("correctIndex", String(correctIndex))

    startTransition(async () => {
      const result = question
        ? await updateGameQuestionAction(question.id, formData)
        : await createGameQuestionAction(formData)

      if (!result.success) {
        toast.error(result.message)
        return
      }
      toast.success(result.message)
      router.push("/game")
      router.refresh()
    })
  }

  return (
    <form action={submit} className="max-w-3xl">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="prompt">Question</FieldLabel>
          <Textarea
            id="prompt"
            name="prompt"
            rows={3}
            required
            maxLength={500}
            defaultValue={question?.prompt ?? ""}
            placeholder="Which command stages a file for the next commit?"
          />
          <FieldDescription>
            Shown full-screen to every signed-in participant the moment you push
            it.
          </FieldDescription>
        </Field>

        <Field>
          <FieldLabel>Options</FieldLabel>
          <FieldDescription>
            Exactly {GAME_OPTION_COUNT} options, all different. Select the radio
            beside the correct one.
          </FieldDescription>
          <div className="grid gap-2">
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-3">
                <input
                  type="radio"
                  name="correct-option"
                  aria-label={`Option ${OPTION_LABELS[index]} is correct`}
                  checked={correctIndex === index}
                  onChange={() => setCorrectIndex(index)}
                  className="size-4 accent-primary"
                />
                <span className="grid size-7 flex-none place-items-center rounded border font-mono text-xs">
                  {OPTION_LABELS[index]}
                </span>
                <Input
                  value={option}
                  required
                  maxLength={200}
                  onChange={(event) => setOption(index, event.target.value)}
                  placeholder={`Option ${OPTION_LABELS[index]}`}
                />
              </div>
            ))}
          </div>
        </Field>

        <Field>
          <FieldLabel htmlFor="durationSeconds">Timer (seconds)</FieldLabel>
          <Input
            id="durationSeconds"
            name="durationSeconds"
            type="number"
            required
            min={MIN_QUESTION_SECONDS}
            max={MAX_QUESTION_SECONDS}
            defaultValue={question?.durationSeconds ?? 20}
            className="max-w-40"
          />
          <FieldDescription>
            Between {MIN_QUESTION_SECONDS} and {MAX_QUESTION_SECONDS} seconds.
            The countdown starts on the server the instant you push, so every
            participant gets the same window regardless of their clock.
          </FieldDescription>
        </Field>

        <div className="flex gap-2">
          <Button type="submit" disabled={pending}>
            <SaveIcon data-icon="inline-start" />
            {question ? "Save question" : "Create question"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => router.push("/game")}
          >
            Cancel
          </Button>
        </div>
      </FieldGroup>
    </form>
  )
}
