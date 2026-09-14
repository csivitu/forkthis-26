import { describe, expect, test } from "bun:test";
import { buildCorsOptions } from "./cors.config";

describe("admin CORS", () => {
  test("trusts both web applications and accepts PATCH preflights", () => {
    const options = buildCorsOptions(
      "http://localhost:3000",
      "http://localhost:3001",
    );
    expect(options.origin).toEqual([
      "http://localhost:3000",
      "http://localhost:3001",
    ]);
    expect(options.methods).toContain("PATCH");
    expect(options.credentials).toBe(true);
  });
});
