import { test, expect } from "../../../fixtures";
import { request } from "@playwright/test";

test.describe("SC-02 API: Checkout Security and Validation", () => {
  test("[S12.V1] Server recomputes total_amount and ignores client-supplied value", async ({
    userApiRequest,
  }) => {
    // Precondition: Cart has 1 item
    const productPrice = 100000;
    const addRes = await userApiRequest.post("/api/cart", {
      data: {
        id: 1,
        name: "API Test Product",
        price: productPrice,
        quantity: 1,
      },
    });
    expect(addRes.ok()).toBeTruthy();

    // Attack: send a manipulated total_amount
    const manipulatedTotal = 1;
    const checkoutRes = await userApiRequest.post("/api/checkout", {
      data: {
        total_amount: manipulatedTotal,
        shipping_address: "123 API Test St",
      },
    });

    // Expect the checkout to succeed (create order)
    expect(checkoutRes.ok()).toBeTruthy();

    // Verify the created order has the correct server-computed total, NOT the manipulated total
    const ordersRes = await userApiRequest.get("/api/orders/my-orders");
    expect(ordersRes.ok()).toBeTruthy();

    const orders = await ordersRes.json();
    // Assuming the latest order is first or we just check the most recently created one
    const latestOrder = orders[0];

    expect(latestOrder).toBeDefined();
    // The total_amount should NOT equal 1, it should equal the product price * quantity (or at least not 1)
    expect(latestOrder.total_amount).not.toBe(manipulatedTotal);
    // Ideally it should be exactly productPrice, but asserting not manipulated is the core security check
    expect(latestOrder.total_amount).toBe(productPrice);
  });

  test("[S12.V2] Checkout requires authentication", async () => {
    // Use an unauthenticated context
    const unauthContext = await request.newContext({
      baseURL: process.env.API_BASE_URL ?? "http://localhost:3000",
    });

    const checkoutRes = await unauthContext.post("/api/checkout", {
      data: {
        total_amount: 100000,
        shipping_address: "123 Unauth St",
      },
    });

    // Should return 401 Unauthorized or 403 Forbidden
    expect(checkoutRes.status()).toBe(401);

    await unauthContext.dispose();
  });
});
