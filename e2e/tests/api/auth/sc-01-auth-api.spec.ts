import { test, expect } from "../../../fixtures";
import { request } from "@playwright/test";
import { faker } from "@faker-js/faker";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:3000";

test.describe("SC-01 API: Registration and Login Endpoints", () => {
  test.describe("POST /api/register", () => {
    let createdUserId: number | undefined;

    test.afterEach(async ({ adminApiRequest }) => {
      if (createdUserId) {
        await adminApiRequest
          .delete(`/api/admin/users/${createdUserId}`)
          .catch(() => {});
        createdUserId = undefined;
      }
    });

    test("TC-API-AUTH-01: S2b.V1 — Accepts valid registration payload and returns 200 with id", async () => {
      const ctx = await request.newContext({ baseURL: API_BASE_URL });

      const email = `user_${faker.string.uuid()}@example.com`;
      const res = await ctx.post("/api/register", {
        data: {
          name: "Nguyen Van A",
          email,
          password: "ValidPass123!",
        },
      });

      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.message).toBe("User registered successfully");
      expect(typeof body.id).toBe("number");
      createdUserId = body.id;

      await ctx.dispose();
    });

    test("TC-API-AUTH-02: S2b.V4 — Rejects duplicate email registration", async () => {
      const ctx = await request.newContext({ baseURL: API_BASE_URL });

      // test@eshop.com is a known pre-existing account (SRS)
      const res = await ctx.post("/api/register", {
        data: {
          name: "Duplicate User",
          email: "test@eshop.com",
          password: "ValidPass123!",
        },
      });

      // Must reject (4xx response); registration of existing email is not allowed
      expect(res.status()).toBeGreaterThanOrEqual(400);
      expect(res.status()).toBeLessThan(500);

      await ctx.dispose();
    });

    test("TC-API-AUTH-03: S2c.V2 — Rejects password missing uppercase letter", async () => {
      const ctx = await request.newContext({ baseURL: API_BASE_URL });

      const res = await ctx.post("/api/register", {
        data: {
          name: "Test User",
          email: `user_${faker.string.uuid()}@example.com`,
          password: "test1234!",
        },
      });

      expect(res.status()).toBeGreaterThanOrEqual(400);
      expect(res.status()).toBeLessThan(500);

      await ctx.dispose();
    });

    test("TC-API-AUTH-04: S2c.V6 — Accepts password at exactly 8 chars (on-point BVA)", async () => {
      const ctx = await request.newContext({ baseURL: API_BASE_URL });

      const res = await ctx.post("/api/register", {
        data: {
          name: "BVA User",
          email: `user_${faker.string.uuid()}@example.com`,
          password: "Test12!a", // exactly 8 chars, all rules met
        },
      });

      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(typeof body.id).toBe("number");
      createdUserId = body.id;

      await ctx.dispose();
    });

    test("TC-API-AUTH-05: S2c.V7 — Rejects password at 7 chars (off-point BVA, below minimum)", async () => {
      const ctx = await request.newContext({ baseURL: API_BASE_URL });

      const res = await ctx.post("/api/register", {
        data: {
          name: "BVA User",
          email: `user_${faker.string.uuid()}@example.com`,
          password: "Test12!", // 7 chars — below minimum
        },
      });

      expect(res.status()).toBeGreaterThanOrEqual(400);
      expect(res.status()).toBeLessThan(500);

      await ctx.dispose();
    });
  });

  test.describe("POST /api/login", () => {
    test("TC-API-AUTH-06: S5a.V1 — Accepts valid credentials and returns JWT token", async () => {
      const ctx = await request.newContext({ baseURL: API_BASE_URL });

      const res = await ctx.post("/api/login", {
        data: {
          email: process.env.USER_EMAIL ?? "test@eshop.com",
          password: process.env.USER_PASSWORD ?? "Test1234!",
        },
      });

      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(typeof body.token).toBe("string");
      expect(body.token.length).toBeGreaterThan(0);
      expect(body.user).toBeDefined();
      expect(body.user.email).toBe(process.env.USER_EMAIL ?? "test@eshop.com");

      await ctx.dispose();
    });

    test("TC-API-AUTH-07: S5a.V2 — Rejects wrong password (no token returned)", async () => {
      const ctx = await request.newContext({ baseURL: API_BASE_URL });

      const res = await ctx.post("/api/login", {
        data: {
          email: process.env.USER_EMAIL ?? "test@eshop.com",
          password: "Wrong123!",
        },
      });

      expect(res.status()).toBeGreaterThanOrEqual(400);
      expect(res.status()).toBeLessThan(500);
      const body = await res.json();
      // Must not include a token in the failure response
      expect(body.token).toBeUndefined();

      await ctx.dispose();
    });

    test("TC-API-AUTH-08: S5a.V3 — Rejects non-existent email (no token returned)", async () => {
      const ctx = await request.newContext({ baseURL: API_BASE_URL });

      const res = await ctx.post("/api/login", {
        data: {
          email: `nonexistent_${faker.string.uuid()}@example.com`,
          password: "Test1234!",
        },
      });

      expect(res.status()).toBeGreaterThanOrEqual(400);
      expect(res.status()).toBeLessThan(500);
      const body = await res.json();
      expect(body.token).toBeUndefined();

      await ctx.dispose();
    });

    test("TC-API-AUTH-09: S5b.V1 — Public endpoint: POST /api/login requires no prior auth", async () => {
      // Verify that the login endpoint is publicly accessible (no Authorization header required)
      const ctx = await request.newContext({
        baseURL: API_BASE_URL,
        // Explicitly no Authorization header — ensures endpoint is public
      });

      const res = await ctx.post("/api/login", {
        data: {
          email: process.env.USER_EMAIL ?? "test@eshop.com",
          password: process.env.USER_PASSWORD ?? "Test1234!",
        },
      });

      // Must succeed — this is a public endpoint
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(typeof body.token).toBe("string");

      await ctx.dispose();
    });
  });
});
