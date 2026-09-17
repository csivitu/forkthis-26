"use server"

import { revalidatePath } from "next/cache"
import {
  addAdminSchema,
  adjustPointsSchema,
  createParticipantSchema,
  createRepositorySchema,
  updateIssueSchema,
  updateRepositorySchema,
} from "@repo/admin-contracts"
import {
  createResourceSectionSchema,
  reorderResourceSectionsSchema,
  resourceSectionIdParamsSchema,
  updateResourceSectionSchema,
  type ResourceSectionAdminDto,
} from "@repo/resource-contracts"
import { apiRequest } from "@/lib/api"

export interface ActionResult {
  success: boolean
  message: string
  resourceId?: string
}

const failure = (error: Error): ActionResult => ({
  success: false,
  message: error.message,
})

export async function syncRepositoriesAction(): Promise<ActionResult> {
  try {
    const response = await apiRequest<{ message: string }>("/api/admin/sync", { method: "POST" })
    return { success: true, message: response.data.message }
  } catch (error) {
    return failure(error instanceof Error ? error : new Error("Repository sync request failed"))
  }
}
const value = (formData: FormData, key: string): string =>
  String(formData.get(key) ?? "").trim()
const nullableValue = (formData: FormData, key: string): string | null =>
  value(formData, key) || null

export async function createRepositoryAction(
  formData: FormData
): Promise<ActionResult> {
  const parsed = createRepositorySchema.safeParse({
    repositoryUrl: value(formData, "repositoryUrl"),
    techStack: nullableValue(formData, "techStack"),
  })
  if (!parsed.success)
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid repository",
    }
  try {
    await apiRequest("/api/admin/repos", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(parsed.data),
    })
    revalidatePath("/repositories")
    return { success: true, message: "Repository created" }
  } catch (error) {
    return failure(
      error instanceof Error ? error : new Error("Repository creation failed")
    )
  }
}

export async function updateRepositoryAction(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const parsed = updateRepositorySchema.safeParse({
    repositoryUrl: value(formData, "repositoryUrl"),
    techStack: nullableValue(formData, "techStack"),
  })
  if (!parsed.success)
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid repository",
    }
  try {
    await apiRequest(`/api/admin/repos/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(parsed.data),
    })
    revalidatePath("/repositories")
    revalidatePath(`/repositories/${id}`)
    return { success: true, message: "Repository updated" }
  } catch (error) {
    return failure(
      error instanceof Error ? error : new Error("Repository update failed")
    )
  }
}

export async function setRepositoryActivityAction(
  id: string,
  isActive: boolean
): Promise<ActionResult> {
  const parsed = updateRepositorySchema.safeParse({ isActive })
  if (!parsed.success)
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid repository status",
    }
  try {
    await apiRequest(`/api/admin/repos/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(parsed.data),
    })
    revalidatePath("/repositories")
    revalidatePath(`/repositories/${id}`)
    return {
      success: true,
      message: isActive ? "Repository activated" : "Repository deactivated",
    }
  } catch (error) {
    return failure(
      error instanceof Error
        ? error
        : new Error("Repository status update failed")
    )
  }
}

export async function deleteRepositoryAction(
  id: string
): Promise<ActionResult> {
  try {
    await apiRequest(`/api/admin/repos/${id}`, { method: "DELETE" })
    revalidatePath("/repositories")
    return { success: true, message: "Repository permanently deleted" }
  } catch (error) {
    return failure(
      error instanceof Error ? error : new Error("Repository deletion failed")
    )
  }
}

export async function updateIssuePointsAction(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const parsed = updateIssueSchema.safeParse({
    points: Number(value(formData, "points")),
  })
  if (!parsed.success)
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid points",
    }
  try {
    await apiRequest(`/api/admin/issues/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(parsed.data),
    })
    revalidatePath("/repositories")
    return { success: true, message: "Base points updated" }
  } catch (error) {
    return failure(
      error instanceof Error ? error : new Error("Issue update failed")
    )
  }
}

export async function adjustPointsAction(
  formData: FormData
): Promise<ActionResult> {
  const parsed = adjustPointsSchema.safeParse({
    userId: value(formData, "userId"),
    issueId: value(formData, "issueId"),
    points: Number(value(formData, "points")),
    note: value(formData, "note"),
  })
  if (!parsed.success)
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid adjustment",
    }
  try {
    await apiRequest("/api/admin/points", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(parsed.data),
    })
    revalidatePath("/members")
    revalidatePath("/points")
    return { success: true, message: "Point adjustment recorded" }
  } catch (error) {
    return failure(
      error instanceof Error ? error : new Error("Point adjustment failed")
    )
  }
}

export async function addAdminAction(
  formData: FormData
): Promise<ActionResult> {
  const parsed = addAdminSchema.safeParse({ email: value(formData, "email") })
  if (!parsed.success)
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid email address",
    }
  try {
    await apiRequest("/api/admin/admins", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(parsed.data),
    })
    revalidatePath("/admins")
    revalidatePath("/members")
    return { success: true, message: "Member promoted to administrator" }
  } catch (error) {
    return failure(
      error instanceof Error ? error : new Error("Member promotion failed")
    )
  }
}

export async function createParticipantAction(
  formData: FormData
): Promise<ActionResult> {
  const parsed = createParticipantSchema.safeParse({
    email: value(formData, "email"),
  })
  if (!parsed.success)
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid email address",
    }
  try {
    await apiRequest("/api/admin/participants", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(parsed.data),
    })
    revalidatePath("/participants")
    return { success: true, message: "Participant added" }
  } catch (error) {
    return failure(
      error instanceof Error ? error : new Error("Participant creation failed")
    )
  }
}

export async function uploadParticipantsAction(
  formData: FormData
): Promise<ActionResult> {
  const file = formData.get("file")
  if (!(file instanceof File) || file.size === 0)
    return { success: false, message: "Select a CSV file" }
  if (file.size > 2 * 1024 * 1024)
    return { success: false, message: "CSV exceeds the 2 MB limit" }
  try {
    const response = await apiRequest<{
      added: number
      alreadyExisted: number
      invalid: Array<{ line: number }>
    }>("/api/admin/participants/upload-csv", { method: "POST", body: formData })
    revalidatePath("/participants")
    return {
      success: true,
      message: `Added ${response.data.added}; existing ${response.data.alreadyExisted}; invalid ${response.data.invalid.length}`,
    }
  } catch (error) {
    return failure(
      error instanceof Error ? error : new Error("CSV import failed")
    )
  }
}

const resourceInput = (formData: FormData) => ({
  title: value(formData, "title"),
  slug: value(formData, "slug"),
  markdown: String(formData.get("markdown") ?? ""),
})

const validResourceId = (id: string): ActionResult | null => {
  const parsed = resourceSectionIdParamsSchema.safeParse({ id })
  return parsed.success
    ? null
    : { success: false, message: "Invalid resource section ID" }
}

export async function createResourceSectionAction(
  formData: FormData
): Promise<ActionResult> {
  const parsed = createResourceSectionSchema.safeParse(resourceInput(formData))
  if (!parsed.success)
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid resource section",
    }
  try {
    const response = await apiRequest<ResourceSectionAdminDto>(
      "/api/admin/resource-sections",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(parsed.data),
      }
    )
    revalidatePath("/resources")
    return {
      success: true,
      message: "Resource section created",
      resourceId: response.data.id,
    }
  } catch (error) {
    return failure(
      error instanceof Error
        ? error
        : new Error("Resource section creation failed")
    )
  }
}

export async function updateResourceSectionAction(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const invalidId = validResourceId(id)
  if (invalidId) return invalidId
  const parsed = updateResourceSectionSchema.safeParse(resourceInput(formData))
  if (!parsed.success)
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid resource section",
    }
  try {
    await apiRequest(`/api/admin/resource-sections/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(parsed.data),
    })
    revalidatePath("/resources")
    revalidatePath(`/resources/${id}`)
    return { success: true, message: "Draft saved" }
  } catch (error) {
    return failure(
      error instanceof Error
        ? error
        : new Error("Resource section update failed")
    )
  }
}

export async function reorderResourceSectionsAction(
  orderedIds: string[]
): Promise<ActionResult> {
  const parsed = reorderResourceSectionsSchema.safeParse({ orderedIds })
  if (!parsed.success)
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid section order",
    }
  try {
    await apiRequest("/api/admin/resource-sections/order", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(parsed.data),
    })
    revalidatePath("/resources")
    return { success: true, message: "Section order updated" }
  } catch (error) {
    return failure(
      error instanceof Error ? error : new Error("Resource reorder failed")
    )
  }
}

export async function publishResourceSectionAction(
  id: string
): Promise<ActionResult> {
  const invalidId = validResourceId(id)
  if (invalidId) return invalidId
  try {
    await apiRequest(`/api/admin/resource-sections/${id}/publish`, {
      method: "POST",
    })
    revalidatePath("/resources")
    revalidatePath(`/resources/${id}`)
    return { success: true, message: "Resource section published" }
  } catch (error) {
    return failure(
      error instanceof Error ? error : new Error("Resource publication failed")
    )
  }
}

export async function unpublishResourceSectionAction(
  id: string
): Promise<ActionResult> {
  const invalidId = validResourceId(id)
  if (invalidId) return invalidId
  try {
    await apiRequest(`/api/admin/resource-sections/${id}/unpublish`, {
      method: "POST",
    })
    revalidatePath("/resources")
    revalidatePath(`/resources/${id}`)
    return { success: true, message: "Resource section unpublished" }
  } catch (error) {
    return failure(
      error instanceof Error ? error : new Error("Resource unpublish failed")
    )
  }
}

export async function deleteResourceSectionAction(
  id: string
): Promise<ActionResult> {
  const invalidId = validResourceId(id)
  if (invalidId) return invalidId
  try {
    await apiRequest(`/api/admin/resource-sections/${id}`, {
      method: "DELETE",
    })
    revalidatePath("/resources")
    return { success: true, message: "Resource section permanently deleted" }
  } catch (error) {
    return failure(
      error instanceof Error ? error : new Error("Resource deletion failed")
    )
  }
}
