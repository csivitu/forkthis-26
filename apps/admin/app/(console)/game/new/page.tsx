import { GameQuestionForm } from "@/components/game-question-form"
import { PageHeader } from "@/components/page-header"

export default function NewGameQuestionPage() {
  return (
    <>
      <PageHeader
        title="New question"
        description="Four options, one correct answer, and the time participants get to choose."
      />
      <GameQuestionForm question={null} />
    </>
  )
}
