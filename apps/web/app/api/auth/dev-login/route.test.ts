/**
 * SESSION_0135 TASK_01 — Dev-login route environment guard test.
 *
 * Proves that the dev-login route returns 404 when `isDev` is false
 * (simulating production), closing finding 0133-01.
 *
 * Run: cd apps/web && bun test app/api/auth/dev-login/route.test.ts
 */

// @ts-expect-error — bun:test is a Bun runtime module
import { describe, expect, it, mock, beforeEach } from "bun:test"

// ---------------------------------------------------------------------------
// Test: production guard (isDev = false)
// ---------------------------------------------------------------------------

describe("GET /api/auth/dev-login", () => {
  describe("when isDev is false (production)", () => {
    beforeEach(() => {
      // Mock env module to simulate production
      mock.module("~/env", () => ({
        env: { DEV_LOGIN_USER_ID: "some-user-id", BETTER_AUTH_URL: "https://example.com" },
        isDev: false,
        isProd: true,
      }))
    })

    it("returns 404 with 'Not available' error", async () => {
      // Re-import after mock is installed
      const { GET } = await import("./route")
      const request = new Request("http://localhost:8000/api/auth/dev-login")
      const response = await GET(request) as Response

      expect(response.status).toBe(404)
      const body = await response.json()
      expect(body).toEqual({ error: "Not available" })
    })
  })

  describe("when isDev is true but DEV_LOGIN_USER_ID is missing", () => {
    beforeEach(() => {
      mock.module("~/env", () => ({
        env: { DEV_LOGIN_USER_ID: undefined, BETTER_AUTH_URL: "https://example.com" },
        isDev: true,
        isProd: false,
      }))
    })

    it("returns 404 with 'Not available' error", async () => {
      const { GET } = await import("./route")
      const request = new Request("http://localhost:8000/api/auth/dev-login")
      const response = await GET(request) as Response

      expect(response.status).toBe(404)
      const body = await response.json()
      expect(body).toEqual({ error: "Not available" })
    })
  })

  describe("when isDev is true but user not found in DB", () => {
    beforeEach(() => {
      mock.module("~/env", () => ({
        env: { DEV_LOGIN_USER_ID: "nonexistent-user", BETTER_AUTH_URL: "https://example.com" },
        isDev: true,
        isProd: false,
      }))
      mock.module("~/services/db", () => ({
        db: {
          user: { findUnique: async () => null },
        },
      }))
    })

    it("returns 404 with user-not-found error", async () => {
      const { GET } = await import("./route")
      const request = new Request("http://localhost:8000/api/auth/dev-login")
      const response = await GET(request) as Response

      expect(response.status).toBe(404)
      const body = await response.json()
      expect(body.error).toContain("not found")
    })
  })
})
