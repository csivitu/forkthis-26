import type { GameQuestionDto } from "@repo/game-contracts"
import { GameQuestionForm } from "@/components/game-question-form"
import { PageHeader } from "@/components/page-header"
import { apiGet } from "@/lib/api"

export default async function EditGameQuestionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { data } = await apiGet<GameQuestionDto>(
    `/api/admin/game/questions/${id}`
  )

  return (
    <>
      <PageHeader
        title="Edit question"
        description={
          data.timesPushed > 0
            ? `Pushed ${data.timesPushed} time${data.timesPushed === 1 ? "" : "s"}. Editing does not change rounds already played.`
            : "Not pushed yet."
        }
      />
      <GameQuestionForm question={data} />
    </>
  )
}
