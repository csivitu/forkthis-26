import type { SessionUser } from "./api"

export type ConsoleAccess =
  | { state: "unauthenticated" }
  | { state: "denied"; user: SessionUser }
  | { state: "granted"; user: SessionUser }

export function resolveConsoleAccess(
  session: { user: SessionUser } | null
): ConsoleAccess {
  if (!session) return { state: "unauthenticated" }
  if (session.user.role !== "admin")
    return { state: "denied", user: session.user }
  return { state: "granted", user: session.user }
}
