import { describe, expect, test } from "bun:test"
import { resolveConsoleAccess } from "./access"

const user = {
  id: "1",
  name: "Admin",
  email: "admin@example.com",
  role: "admin",
}

describe("resolveConsoleAccess", () => {
  test("requires login without a session", () =>
    expect(resolveConsoleAccess(null).state).toBe("unauthenticated"))
  test("denies a non-admin session", () =>
    expect(
      resolveConsoleAccess({ user: { ...user, role: "student" } }).state
    ).toBe("denied"))
  test("grants an admin session", () =>
    expect(resolveConsoleAccess({ user }).state).toBe("granted"))
})
