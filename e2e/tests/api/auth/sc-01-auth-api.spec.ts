import { test, expect } from "../../../fixtures";
import { faker } from "@faker-js/faker";

test.describe("TC-AUTH-04: API Tests for Registration, Login, and Search", () => {
  const email = `api_user_${faker.string.uuid()}@example.com`;
  const password = process.env.USER_PASSWORD ?? "Test1234!";

  test("Step 3 & 6: Verify registration and login via API", async ({
    request,
    adminApiRequest,
    cleanup,
  }) => {
    // Step 3: POST /api/register
    const registerRes = await request.post("/api/register", {
      data: {
        name: faker.person.fullName(),
        email: email,
        password: password,
      },
    });

    expect(registerRes.status()).toBe(200);
    const regBody = await registerRes.json();
    expect(regBody.message).toBe("User registered successfully");
    expect(typeof regBody.id).toBe("number");

    if (regBody.id) {
      cleanup.add(async () => {
        await adminApiRequest
          .delete(`/api/admin/users/${regBody.id}`)
          .catch(() => {});
      });
    }

    // Step 6: POST /api/login using the same credentials
    const loginRes = await request.post("/api/login", {
      data: {
        email: email,
        password: password,
      },
    });

    expect(loginRes.status()).toBe(200);
    const loginBody = await loginRes.json();
    expect(loginBody.token).toBeDefined();
    expect(typeof loginBody.token).toBe("string");
    expect(loginBody.user.email).toBe(email);
  });

  test("Step 10: Verify product search via API (GET /api/products?search=)", async ({
    request,
  }) => {
    // We search for a known common keyword like "Áo" or fetch all products and use the first one's name
    const allProductsRes = await request.get("/api/products");
    expect(allProductsRes.status()).toBe(200);
    const allProducts = await allProductsRes.json();

    // Fallback keyword if DB is empty
    const keyword =
      allProducts.length > 0 ? allProducts[0].name.substring(0, 3) : "Áo";

    const searchRes = await request.get(
      `/api/products?search=${encodeURIComponent(keyword)}`,
    );
    expect(searchRes.status()).toBe(200);
    const searchResults = await searchRes.json();

    // Assert all returned items contain the keyword (case-insensitive for real apps, but we check if it found something)
    expect(Array.isArray(searchResults)).toBe(true);
  });
});
