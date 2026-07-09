# Example: Online Purchase Use Case

## Use Case Specification

| Field                                             | Details                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Use Case ID & Name**                            | UC-03 — Online Purchase                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **Description**                                   | Allow a registered customer to purchase one or more items from their shopping cart and receive order confirmation.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| **Primary Actor**                                 | Registered Customer                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **Secondary Actors**                              | Payment Gateway (external system), Email Service (external system)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| **Preconditions**                                 | - Customer is authenticated (holds a valid session).<br>- Customer's cart contains at least 1 item.<br>- All items in the cart are in stock (quantity available ≥ quantity in cart).<br>- Payment service and email service are operational.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| **Main Flow**                                     | **Step 1:** Customer reviews cart and clicks "Proceed to Checkout."<br>**Step 2:** Customer selects or confirms a shipping address.<br>**Step 3:** Customer selects a payment method (saved card or new card).<br>**Step 4:** Customer clicks "Place Order."<br>**Step 5:** System sends the payment request to the Payment Gateway.<br>**Step 6:** Payment Gateway returns a success response.<br>**Step 7:** System creates the order record (status = CONFIRMED).<br>**Step 8:** System decrements inventory for each item.<br>**Step 9:** System sends an order confirmation email.<br>**Step 10:** System displays the order confirmation page with order ID.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| **Alternate Flows**                               | **AF-1** (branches from Step 2): Customer selects "Add New Address." System displays address form. Customer submits new address. System validates and saves address. **Rejoins MF Step 3.**<br><br>**AF-2** (branches from Step 3): Customer selects "New Card." System displays card entry form. Customer enters card details. **Rejoins MF Step 4.**<br><br>**AF-3** (branches from Step 6): Payment Gateway returns a failure response (declined). System displays "Payment declined" error with retry option. Customer may retry (return to Step 4) or cancel. If cancelled: **Terminate.** If retried 3 times without success: System cancels the order attempt and **Terminates.**<br><br>**AF-4** (branches from Step 6): Payment Gateway does not respond within 30 seconds (timeout). System displays "Payment service unavailable" message. Order is not created. **Terminates.**<br><br>**AF-5** (branches from Step 8): Between Step 6 and Step 8, inventory for one or more items drops to 0 (sold by another customer concurrently). System cancels the order, refunds the payment, and notifies the customer. **Terminates.**<br><br>**AF-6** (branches from Step 1): Cart is empty when customer initiates checkout. System displays "Your cart is empty" message and redirects to the product catalog. **Terminates.** |
| **Business Rules**                                | - BR-001: A customer's cart must contain at least 1 item to proceed to checkout.<br>- BR-002: Shipping address must include: street, city, postal code, country.<br>- BR-003: Payment is processed by the external Payment Gateway; the system never stores raw card numbers.<br>- BR-004: Maximum 3 payment retries per order attempt before the attempt is abandoned.<br>- BR-005: Inventory must be reserved/decremented only after payment confirmation, not before.<br>- BR-006: Order confirmation email must be sent within 60 seconds of order creation.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| **Postconditions (Success)**                      | - Order record created in orders table with status = CONFIRMED.<br>- Inventory decremented for each ordered item in inventory table.<br>- Order confirmation email sent to customer's registered email address.<br>- Customer session remains active.<br>- Customer redirected to order confirmation page with order ID.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| **Postconditions (Failure — AF-3 cancel / AF-4)** | - No order record created in orders table.<br>- No inventory change.<br>- No confirmation email sent.<br>- Payment not charged (or refunded if AF-3 decline occurred after charge).<br>- Customer on payment error page or redirected to cart.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| **Postconditions (Failure — AF-5)**               | - Order record not persisted (or created then immediately cancelled).<br>- Payment refunded.<br>- Customer notified of out-of-stock condition.<br>- Inventory not decremented for the failed item.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |

## Step 1 — Spec Validation

**Issues found and resolved before proceeding:**

| Issue                                                                              | Resolution                                                                                                                                                |
| ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AF-3: "declined" — does a single decline trigger retry option, or is it immediate? | Confirmed: each decline shows retry option; after 3rd decline, order is abandoned                                                                         |
| AF-5: Is the order created before the inventory check fails?                       | Confirmed: system attempts to create order and decrement inventory in one transaction; if inventory fails, transaction rolls back and payment is refunded |
| Postcondition "within 60 seconds" for email — how is this verified in testing?     | Confirmed: test environment has a mock email service with timestamps; test checks timestamp within 60s                                                    |
| BR-002: Is postal code format validated? Country-specific?                         | Confirmed: only format checked (non-empty alphanumeric); no country-specific validation in v1                                                             |

**Hidden alternate flows discovered:**

| Hidden Flow                                                | Discovery Method                | Confirmed With                                                                                                              |
| ---------------------------------------------------------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| AF-6: Empty cart                                           | BR-001 reverse analysis         | PO confirmed — already in spec                                                                                              |
| HF-1: New address validation failure (invalid postal code) | "What if?" at AF-1 address form | PO confirmed — AF-1 should include address validation failure sub-flow                                                      |
| HF-2: Email service unavailable at Step 9                  | "What if?" at Step 9            | PO confirmed: order is still CONFIRMED; email failure is logged; retry mechanism handles it — does not affect customer flow |
| HF-3: Session expires during Step 5 (payment processing)   | "What if?" at Step 5            | PO confirmed: order attempt abandoned; customer redirected to login                                                         |

**Updated AF-1 after discovery of HF-1:**
AF-1 now includes: "If customer submits invalid address (missing required fields), system displays validation error and prompts customer to correct. Stays in AF-1 sub-flow until valid address submitted, then rejoins MF Step 3."

## Step 2 — Flow Inventory

| Flow ID | Type      | Short Description                                         | Branches From | Endpoint                                      | Classification |
| ------- | --------- | --------------------------------------------------------- | ------------- | --------------------------------------------- | -------------- |
| MF      | Main      | Cart review → Checkout → Address → Payment → Confirmation | —             | Order confirmation page                       | —              |
| AF-1    | Alternate | Customer adds a new shipping address                      | MF Step 2     | Rejoin MF Step 3                              | Optional       |
| AF-1a   | Alternate | New address fails validation                              | Within AF-1   | Rejoin AF-1 (loop until valid)                | Exception      |
| AF-2    | Alternate | Customer enters a new payment card                        | MF Step 3     | Rejoin MF Step 4                              | Optional       |
| AF-3    | Alternate | Payment declined by gateway                               | MF Step 6     | Retry → MF Step 4 (max 3 times), or Terminate | Exception      |
| AF-4    | Alternate | Payment gateway timeout                                   | MF Step 6     | Terminate                                     | Exception      |
| AF-5    | Alternate | Inventory depleted concurrently after payment             | MF Step 8     | Terminate + refund                            | Exception      |
| AF-6    | Alternate | Cart is empty at checkout initiation                      | MF Step 1     | Terminate                                     | Exception      |
| HF-3    | Alternate | Session expires during payment processing                 | MF Step 5     | Terminate                                     | Exception      |

## Step 3 — Scenario Matrix

**Impossibility analysis:**

- AF-3 + AF-4: Both branch from Step 6 (payment gateway response) — mutually exclusive; cannot both occur in same execution.
- AF-5 + AF-4: AF-4 terminates before Step 8 (where AF-5 branches) — impossible to combine.
- AF-6 terminates at Step 1 — cannot combine with any other flow (all others branch at Step 2+).
- HF-3 terminates at Step 5 — cannot combine with AF-3, AF-4, or AF-5 (which branch at Step 6 or 8).

| Scenario | Path Composition                                               | Priority | Endpoint            | Status                                         |
| -------- | -------------------------------------------------------------- | -------- | ------------------- | ---------------------------------------------- |
| S1       | Main Flow (happy path with saved address and saved card)       | Critical | Confirmation page   | Test                                           |
| S2       | MF + AF-1 (add new address, valid)                             | High     | Confirmation page   | Test                                           |
| S3       | MF + AF-1 + AF-1a (add new address, invalid first, then valid) | High     | Confirmation page   | Test                                           |
| S4       | MF + AF-2 (pay with new card)                                  | High     | Confirmation page   | Test                                           |
| S5       | MF + AF-1 + AF-2 (add new address + new card)                  | Medium   | Confirmation page   | Test                                           |
| S6       | MF + AF-3 (1 decline, then retry succeeds)                     | High     | Confirmation page   | Test                                           |
| S7       | MF + AF-3 × 3 (3 declines, order abandoned)                    | High     | Error page / Cart   | Test                                           |
| S8       | MF + AF-4 (payment gateway timeout)                            | High     | Error page          | Test                                           |
| S9       | MF + AF-5 (concurrent inventory depletion)                     | Medium   | Error page + refund | Test                                           |
| S10      | MF + AF-6 (empty cart)                                         | High     | Product catalog     | Test                                           |
| S11      | MF + HF-3 (session expires during payment)                     | Medium   | Login page          | Test                                           |
| —        | AF-3 + AF-4                                                    | —        | —                   | IMPOSSIBLE: mutually exclusive at Step 6       |
| —        | AF-5 + AF-4                                                    | —        | —                   | IMPOSSIBLE: AF-4 terminates before AF-5 branch |
| S12      | MF + AF-2 + AF-3 (new card + declined)                         | Low      | Error/retry         | Acknowledged; not tested this cycle            |

## Step 4 — Test Data Selection (EP/BVA Applied)

For each scenario requiring data input, EP/BVA is applied:

**Shipping address (AF-1, AF-1a):**

- **Valid address:** `street="123 Main St"`, `city="Hanoi"`, `postal_code="100000"`, `country="VN"` (nominal valid)
- **Invalid address (AF-1a trigger):** `postal_code=""` (empty — missing required field) → triggers validation failure

**Payment (S6, S7 trigger):**

- **Declined card:** Use payment gateway's test card number for "always decline" — `card_number="4000000000000002"` (Stripe test convention; adapt to actual gateway)
- **Timeout simulation:** Use gateway test mode `simulate_timeout=true` parameter

**Cart state:**

- **S1 valid cart:** 2 items, both in stock, total $75.00 (nominal)
- **S10 empty cart:** cart.item_count = 0 (EC: empty, triggers AF-6)

## Step 5 — Test Case Suite

### TC-UCT-01: S1 — Main Flow Happy Path

| Field                      | Content                                                                                                                                                                                                                                                 |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **TC ID**                  | TC-UCT-01                                                                                                                                                                                                                                               |
| **Use Case**               | UC-03 — Online Purchase                                                                                                                                                                                                                                 |
| **Scenario**               | S1 — Main Flow (saved address, saved card)                                                                                                                                                                                                              |
| **Description**            | Complete purchase using existing saved address and saved payment card                                                                                                                                                                                   |
| **Preconditions**          | Customer `customer@test.com` is authenticated (valid session token).<br>Cart contains: Item A (qty=1, price=$50.00) + Item B (qty=1, price=$25.00). Both items have stock ≥ 1.<br>Customer has saved address ID=ADDR-001 and saved card (last 4: 4242). |
| **Test Data**              | No additional data entry required (using saved address and saved card).                                                                                                                                                                                 |
| **Alternate Flow Trigger** | N/A — happy path                                                                                                                                                                                                                                        |

| Step | Actor Action                                | Input | Expected System Response                                              | Post-Step State               |
| ---- | ------------------------------------------- | ----- | --------------------------------------------------------------------- | ----------------------------- |
| 1    | Customer clicks "Proceed to Checkout"       | —     | Order summary displayed; saved address ADDR-001 shown; total = $75.00 | Checkout page loaded          |
| 2    | Customer confirms shipping address ADDR-001 | —     | Address confirmed; payment method selection displayed                 | Address confirmed             |
| 3    | Customer selects saved card (last 4: 4242)  | —     | Payment method confirmed; "Place Order" button enabled                | Payment method selected       |
| 4    | Customer clicks "Place Order"               | —     | System displays "Processing payment..." indicator                     | Payment in progress           |
| 5    | [System] Payment sent to gateway            | —     | (Internal: gateway receives $75.00 charge)                            | Awaiting gateway response     |
| 6    | [System] Gateway returns SUCCESS            | —     | System creates order record                                           | Order PENDING → CONFIRMED     |
| 7    | [System] Inventory decremented              | —     | Item A stock −1; Item B stock −1                                      | Inventory updated             |
| 8    | [System] Confirmation email queued          | —     | Email dispatched within 60s                                           | Email sent                    |
| 9    | System displays confirmation page           | —     | Page shows Order ID, items, total, delivery estimate                  | Customer on confirmation page |

| Field              | Content                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Postconditions** | 1. DB: `orders` table — new record with status=CONFIRMED, customer_id=customer@test.com, total=75.00<br>2. DB: `inventory` table — item_A.quantity decremented by 1; item_B.quantity decremented by 1<br>3. Email: Confirmation email received at customer@test.com within 60 seconds; contains Order ID<br>4. DB: `order_items` table — 2 records linked to the new order |
| **Priority**       | Critical                                                                                                                                                                                                                                                                                                                                                                   |
| **Source**         | UC-03, BR-001, BR-003, BR-005, BR-006                                                                                                                                                                                                                                                                                                                                      |

### TC-UCT-02: S2 — Add New Shipping Address (Valid)

| Field                      | Content                                                                                                                     |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **TC ID**                  | TC-UCT-02                                                                                                                   |
| **Scenario**               | S2 — MF + AF-1 (valid new address)                                                                                          |
| **Description**            | Customer adds a new shipping address during checkout; purchase completes successfully                                       |
| **Preconditions**          | Customer authenticated. Cart contains 1 item in stock. Customer has no saved address (or selects "Add New Address" option). |
| **Alternate Flow Trigger** | Customer selects "Add New Address" at Step 2 of Main Flow                                                                   |

| Step | Actor Action                          | Input                                                                              | Expected System Response                                                 | Post-Step State   |
| ---- | ------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ----------------- |
| 1    | Customer clicks "Proceed to Checkout" | —                                                                                  | Checkout page with "Add New Address" option                              | Checkout loaded   |
| 2    | Customer selects "Add New Address"    | —                                                                                  | Address form displayed                                                   | AF-1 entered      |
| 3    | Customer submits new address          | `street="456 Le Loi"`<br>`city="HCMC"`<br>`postal_code="700000"`<br>`country="VN"` | Address validated; saved as ADDR-002; shown as selected shipping address | Rejoins MF Step 3 |
| 4–9  | [Continue as TC-UCT-01 Steps 3–9]     | —                                                                                  | [Same as S1 from this point]                                             | Confirmation page |

| Field              | Content                                                                                                                                                                                |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Postconditions** | 1. DB: New address ADDR-002 saved in `addresses` table linked to customer<br>2. DB: Order created with shipping_address_id = ADDR-002<br>3. All other postconditions same as TC-UCT-01 |
| **Priority**       | High                                                                                                                                                                                   |
| **Source**         | UC-03, BR-002                                                                                                                                                                          |

### TC-UCT-03: S3 — New Address with Initial Validation Failure

| Field                      | Content                                                                                                    |
| -------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **TC ID**                  | TC-UCT-03                                                                                                  |
| **Scenario**               | S3 — MF + AF-1 + AF-1a (address validation fails, then succeeds)                                           |
| **Description**            | Customer submits an invalid address (missing postal code), sees error, corrects it, and completes purchase |
| **Preconditions**          | Same as TC-UCT-02                                                                                          |
| **Alternate Flow Trigger** | Customer submits address with empty postal_code field                                                      |

| Step | Actor Action                      | Input                                                                        | Expected System Response                                                    | Post-Step State               |
| ---- | --------------------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ----------------------------- |
| 1–2  | [Same as TC-UCT-02 Steps 1–2]     | —                                                                            | Address form displayed                                                      | AF-1 entered                  |
| 3    | Customer submits invalid address  | `street="456 Le Loi"`<br>`city="HCMC"`<br>`postal_code=""`<br>`country="VN"` | Validation error: "Postal code is required"; form remains; no address saved | AF-1a — still in address form |
| 4    | Customer corrects and resubmits   | `postal_code="700000"` (corrected)                                           | Address validated and saved; checkout continues                             | Rejoin MF Step 3              |
| 5–9  | [Continue as TC-UCT-01 Steps 3–9] | —                                                                            | Same as S1                                                                  | Confirmation page             |

| Field              | Content                                                                                                                                                                                    |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Postconditions** | 1. Only 1 address record created (not 2 — the invalid submission must not create a partial record)<br>2. Order created with valid address<br>3. All other postconditions same as TC-UCT-01 |
| **Priority**       | High                                                                                                                                                                                       |
| **Source**         | UC-03, BR-002                                                                                                                                                                              |

### TC-UCT-04: S6 — Payment Declined Once, Retry Succeeds

| Field                      | Content                                                                                                                              |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **TC ID**                  | TC-UCT-04                                                                                                                            |
| **Scenario**               | S6 — MF + AF-3 (1 decline, then retry succeeds)                                                                                      |
| **Description**            | Payment declined on first attempt; customer retries with different card; purchase completes                                          |
| **Preconditions**          | Customer authenticated. Cart contains 1 in-stock item. Saved card (last 4: 0002) configured to decline in payment gateway test mode. |
| **Alternate Flow Trigger** | Payment gateway returns DECLINED for the first card                                                                                  |

| Step | Actor Action                          | Input                                                         | Expected System Response                                                                           | Post-Step State     |
| ---- | ------------------------------------- | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------- |
| 1–4  | [MF Steps 1–4 with declining card]    | —                                                             | "Place Order" clicked with card 0002                                                               | Payment in progress |
| 5    | [System] Gateway returns DECLINED     | —                                                             | Error: "Payment declined. Please check your card details or try another card."; retry option shown | No order created    |
| 6    | Customer selects new card and retries | `card_number="4242424242424242"` (test card: always succeeds) | Payment accepted; AF-3 exits; MF resumes at Step 7                                                 | Payment succeeded   |
| 7–9  | [MF Steps 7–9]                        | —                                                             | Order confirmed; email sent                                                                        | Confirmation page   |

| Field              | Content                                                                                                                                                                                                                |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Postconditions** | 1. DB: Only 1 order record created (not 2 — declined attempt must not persist a record)<br>2. DB: No charge on declined card<br>3. Charge applied to second card only<br>4. All other postconditions same as TC-UCT-01 |
| **Priority**       | High                                                                                                                                                                                                                   |
| **Source**         | UC-03, BR-003, BR-004                                                                                                                                                                                                  |

### TC-UCT-05: S7 — Payment Declined 3 Times (Order Abandoned)

| Field                      | Content                                                                                   |
| -------------------------- | ----------------------------------------------------------------------------------------- |
| **TC ID**                  | TC-UCT-05                                                                                 |
| **Scenario**               | S7 — MF + AF-3 × 3 (3 consecutive declines)                                               |
| **Description**            | Payment declined on all 3 attempts; order attempt is abandoned after reaching max retries |
| **Preconditions**          | Same as TC-UCT-04.                                                                        |
| **Alternate Flow Trigger** | 3 consecutive DECLINED responses from payment gateway                                     |

| Step | Actor Action            | Input          | Expected System Response                                                            | Post-Step State   |
| ---- | ----------------------- | -------------- | ----------------------------------------------------------------------------------- | ----------------- |
| 1–4  | [MF Steps 1–4]          | Declining card | —                                                                                   | Payment attempt 1 |
| 5    | Gateway: DECLINED (1st) | —              | Error + retry option                                                                | Attempt 1 failed  |
| 6    | Customer retries        | Declining card | Payment sent                                                                        | Attempt 2         |
| 7    | Gateway: DECLINED (2nd) | —              | Error + retry option                                                                | Attempt 2 failed  |
| 8    | Customer retries        | Declining card | Payment sent                                                                        | Attempt 3         |
| 9    | Gateway: DECLINED (3rd) | —              | "Maximum payment attempts reached. Your order has been cancelled." No retry option. | Order abandoned   |

| Field              | Content                                                                                                                                                   |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Postconditions** | 1. DB: No order record created<br>2. DB: No charges applied<br>3. DB: Inventory unchanged<br>4. Customer on error/abandoned page; cart contents preserved |
| **Priority**       | High                                                                                                                                                      |
| **Source**         | UC-03, BR-004                                                                                                                                             |

### TC-UCT-06: S8 — Payment Gateway Timeout

| Field                      | Content                                            |
| -------------------------- | -------------------------------------------------- |
| **TC ID**                  | TC-UCT-06                                          |
| **Scenario**               | S8 — MF + AF-4                                     |
| **Alternate Flow Trigger** | Payment gateway does not respond within 30 seconds |

| Step | Actor Action                | Input                        | Expected System Response                                                              | Post-Step State      |
| ---- | --------------------------- | ---------------------------- | ------------------------------------------------------------------------------------- | -------------------- |
| 1–4  | [MF Steps 1–4]              | Timeout-simulating test card | "Processing..." indicator displayed                                                   | Payment request sent |
| 5    | [30-second timeout elapses] | —                            | "Payment service is currently unavailable. Please try again later." No order created. | AF-4 terminated      |

| Field              | Content                                                                                                       |
| ------------------ | ------------------------------------------------------------------------------------------------------------- |
| **Postconditions** | 1. DB: No order record<br>2. DB: No charge<br>3. DB: Inventory unchanged<br>4. Customer on timeout error page |
| **Priority**       | High                                                                                                          |
| **Source**         | UC-03, BR-003                                                                                                 |

### TC-UCT-07: S9 — Concurrent Inventory Depletion

| Field                      | Content                                                                                                                                                                                               |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **TC ID**                  | TC-UCT-07                                                                                                                                                                                             |
| **Scenario**               | S9 — MF + AF-5                                                                                                                                                                                        |
| **Preconditions**          | Item A has stock = 1. Two customers (C1, C2) both have Item A in their cart. C1 completes purchase and decrements stock to 0 AFTER C2's payment is approved but BEFORE C2's inventory decrement step. |
| **Alternate Flow Trigger** | Item A stock = 0 at the time C2's order attempts inventory decrement                                                                                                                                  |
| **Setup:**                 | Use test harness to simulate concurrent purchase; manually set Item A stock to 0 between C2's payment approval and inventory step                                                                     |

| Step | Actor Action                            | Input | Expected System Response                                                | Post-Step State  |
| ---- | --------------------------------------- | ----- | ----------------------------------------------------------------------- | ---------------- |
| 1–6  | C2: MF Steps 1–6 (payment succeeds)     | —     | Payment approved                                                        | Order PENDING    |
| 7    | [Inventory decrement fails — stock = 0] | —     | System cancels order; initiates refund; sends out-of-stock notification | Order cancelled  |
| 8    | [System] Refund issued                  | —     | Refund processed to C2's card                                           | Payment reversed |

| Field              | Content                                                                                                                                                                                        |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Postconditions** | 1. DB: Order record not created OR created with status=CANCELLED<br>2. DB: Inventory NOT decremented below 0<br>3. DB: Refund record created<br>4. Email: Out-of-stock notification sent to C2 |
| **Priority**       | Medium                                                                                                                                                                                         |
| **Source**         | UC-03, BR-005                                                                                                                                                                                  |

### TC-UCT-08: S10 — Empty Cart Checkout Attempt

| Field                      | Content                                        |
| -------------------------- | ---------------------------------------------- |
| **TC ID**                  | TC-UCT-08                                      |
| **Scenario**               | S10 — MF + AF-6                                |
| **Preconditions**          | Customer authenticated. Cart contains 0 items. |
| **Alternate Flow Trigger** | Cart is empty when customer initiates checkout |

| Step | Actor Action                          | Input | Expected System Response                                                                    | Post-Step State |
| ---- | ------------------------------------- | ----- | ------------------------------------------------------------------------------------------- | --------------- |
| 1    | Customer clicks "Proceed to Checkout" | —     | Message: "Your cart is empty. Add items to continue shopping."; redirect to product catalog | AF-6 terminated |

| Field              | Content                                                             |
| ------------------ | ------------------------------------------------------------------- |
| **Postconditions** | 1. DB: No order record<br>2. Customer redirected to product catalog |
| **Priority**       | High                                                                |
| **Source**         | UC-03, BR-001                                                       |

### TC-UCT-09: S4 — Pay with New Card

| Field                      | Content                                                                                                                                                                                                                      |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **TC ID**                  | TC-UCT-09                                                                                                                                                                                                                    |
| **Use Case**               | UC-03 — Online Purchase                                                                                                                                                                                                      |
| **Scenario**               | S4 — MF + AF-2 (customer enters a new payment card)                                                                                                                                                                          |
| **Description**            | Customer uses a new (unsaved) card during checkout; purchase completes successfully                                                                                                                                          |
| **Preconditions**          | Customer `customer@test.com` is authenticated. Cart contains 1 item (Item A, qty=1, price=$50.00, stock ≥ 1). Customer has a saved shipping address ADDR-001. Customer has no saved payment card, or selects "Use New Card." |
| **Alternate Flow Trigger** | Customer selects "Use New Card" at Step 3 of Main Flow                                                                                                                                                                       |

| Step | Actor Action                          | Input                                                                                              | Expected System Response                         | Post-Step State     |
| ---- | ------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ------------------- |
| 1    | Customer clicks "Proceed to Checkout" | —                                                                                                  | Checkout page displayed; ADDR-001 shown          | Checkout loaded     |
| 2    | Customer confirms address ADDR-001    | —                                                                                                  | Payment method step displayed                    | MF Step 3           |
| 3    | Customer selects "Use New Card"       | —                                                                                                  | Card entry form displayed                        | AF-2 entered        |
| 4    | Customer enters new card details      | `card_number="4242424242424242"`<br>`expiry="12/26"`<br>`cvv="123"`<br>`cardholder="Nguyen Van A"` | Card validated; shown as selected payment method | Rejoin MF Step 4    |
| 5    | Customer clicks "Place Order"         | —                                                                                                  | "Processing payment…" indicator                  | Payment in progress |
| 6    | Gateway returns SUCCESS               | —                                                                                                  | Order creation initiated                         | MF Step 7           |
| 7    | Inventory decremented                 | —                                                                                                  | Item A stock −1                                  | MF Step 8           |
| 8    | Confirmation email sent               | —                                                                                                  | Email dispatched within 60s                      | MF Step 9           |
| 9    | Confirmation page displayed           | —                                                                                                  | Page shows Order ID, item, total=$50.00          | Confirmed           |

| Field              | Content                                                                                                                                                                                                                                                                                        |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Postconditions** | 1. DB: `orders` — new record status=CONFIRMED, total=50.00, payment_method=new card (last 4: 4242)<br>2. DB: `inventory` — Item A.quantity decremented by 1<br>3. DB: `order_items` — 1 record linked to order<br>4. Email: Confirmation email received at customer@test.com within 60 seconds |
| **Priority**       | High                                                                                                                                                                                                                                                                                           |
| **Source**         | UC-03, BR-003                                                                                                                                                                                                                                                                                  |

### TC-UCT-10: S5 — Add New Address and Pay with New Card

| Field                      | Content                                                                                                                                                         |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **TC ID**                  | TC-UCT-10                                                                                                                                                       |
| **Use Case**               | UC-03 — Online Purchase                                                                                                                                         |
| **Scenario**               | S5 — MF + AF-1 + AF-2 (new address and new card combined)                                                                                                       |
| **Description**            | Customer adds a new shipping address AND uses a new payment card; purchase completes                                                                            |
| **Preconditions**          | Customer `customer2@test.com` is authenticated. Cart contains 1 item (Item B, qty=1, price=$30.00, stock ≥ 1). Customer has no saved address and no saved card. |
| **Alternate Flow Trigger** | Customer selects "Add New Address" at Step 2, then "Use New Card" at Step 3                                                                                     |

| Step | Actor Action                          | Input                                                                                            | Expected System Response                                            | Post-Step State     |
| ---- | ------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- | ------------------- |
| 1    | Customer clicks "Proceed to Checkout" | —                                                                                                | Checkout page with "Add New Address" option; no saved address shown | Checkout loaded     |
| 2    | Customer selects "Add New Address"    | —                                                                                                | Address form displayed                                              | AF-1 entered        |
| 3    | Customer submits new address          | `street="789 Tran Hung Dao"`<br>`city="Da Nang"`<br>`postal_code="550000"`<br>`country="VN"`     | Address validated; saved as ADDR-003; shown as selected             | Rejoin MF Step 3    |
| 4    | Customer selects "Use New Card"       | —                                                                                                | Card entry form displayed                                           | AF-2 entered        |
| 5    | Customer enters new card details      | `card_number="4242424242424242"`<br>`expiry="09/27"`<br>`cvv="456"`<br>`cardholder="Tran Thi B"` | Card validated; shown as selected payment method                    | Rejoin MF Step 4    |
| 6    | Customer clicks "Place Order"         | —                                                                                                | "Processing payment…" indicator                                     | Payment in progress |
| 7    | Gateway returns SUCCESS               | —                                                                                                | Order creation initiated                                            | MF Step 7           |
| 8    | Inventory decremented                 | —                                                                                                | Item B stock −1                                                     | MF Step 8           |
| 9    | Confirmation email sent               | —                                                                                                | Email dispatched within 60s                                         | MF Step 9           |
| 10   | Confirmation page displayed           | —                                                                                                | Page shows Order ID, item, total=$30.00, address=ADDR-003           | Confirmed           |

| Field              | Content                                                                                                                                                                                                                                                                                                    |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Postconditions** | 1. DB: `addresses` — ADDR-003 saved and linked to customer2@test.com<br>2. DB: `orders` — new record status=CONFIRMED, shipping_address_id=ADDR-003, total=30.00<br>3. DB: `inventory` — Item B.quantity decremented by 1<br>4. Email: Confirmation email received at customer2@test.com within 60 seconds |
| **Priority**       | Medium                                                                                                                                                                                                                                                                                                     |
| **Source**         | UC-03, BR-002, BR-003                                                                                                                                                                                                                                                                                      |

### TC-UCT-11: S11 — Session Expires During Payment Processing

| Field                      | Content                                                                                                                                                                                                                                                                                |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **TC ID**                  | TC-UCT-11                                                                                                                                                                                                                                                                              |
| **Use Case**               | UC-03 — Online Purchase                                                                                                                                                                                                                                                                |
| **Scenario**               | S11 — MF + HF-3 (session expires while payment gateway is processing)                                                                                                                                                                                                                  |
| **Description**            | Customer's session expires between Step 4 (Place Order) and Step 6 (gateway response); order attempt is abandoned and customer redirected to login                                                                                                                                     |
| **Preconditions**          | Customer `customer3@test.com` is authenticated with a session configured to expire in 5 seconds (test environment session override). Cart contains 1 in-stock item. Saved address and saved card available. Payment gateway configured with a 10-second artificial delay in test mode. |
| **Alternate Flow Trigger** | Session token expires while the payment request is in-flight (between Step 5 and Step 6)                                                                                                                                                                                               |

| Step | Actor Action                                                      | Input | Expected System Response                                                                     | Post-Step State                            |
| ---- | ----------------------------------------------------------------- | ----- | -------------------------------------------------------------------------------------------- | ------------------------------------------ |
| 1–3  | Customer completes Steps 1–3 (address + payment method confirmed) | —     | Same as TC-UCT-01 Steps 1–3                                                                  | Payment method selected                    |
| 4    | Customer clicks "Place Order"                                     | —     | "Processing payment…" indicator; payment request sent to gateway                             | Payment in progress; session timer running |
| 5    | [Session expires during gateway delay]                            | —     | System detects expired session; cancels the order attempt                                    | Session invalidated                        |
| 6    | System responds to customer                                       | —     | Message: "Your session has expired. Please log in again." Customer redirected to login page. | HF-3 terminated                            |

| Field              | Content                                                                                                                                                                                                                                                              |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Postconditions** | 1. DB: No `orders` record created<br>2. DB: No inventory change<br>3. DB: No charge recorded (payment gateway request either cancelled or, if already charged, refund initiated)<br>4. Customer session invalidated in `sessions` table<br>5. Customer on login page |
| **Priority**       | Medium                                                                                                                                                                                                                                                               |
| **Source**         | UC-03 (implied system behavior); BR-003                                                                                                                                                                                                                              |

**Test environment note:** This test requires the ability to artificially shorten session duration and delay payment gateway response. Confirm with the dev team that the test environment supports these overrides before scheduling.

## Step 7 — Final Coverage Summary and RTM

### Scenario Coverage (Complete)

| Scenario | Path Composition                                         | Test Case | Priority | Status                                                                                         |
| -------- | -------------------------------------------------------- | --------- | -------- | ---------------------------------------------------------------------------------------------- |
| S1       | Main Flow                                                | TC-UCT-01 | Critical | ✓ Covered                                                                                      |
| S2       | MF + AF-1 (new valid address)                            | TC-UCT-02 | High     | ✓ Covered                                                                                      |
| S3       | MF + AF-1 + AF-1a (address validation fail then succeed) | TC-UCT-03 | High     | ✓ Covered                                                                                      |
| S4       | MF + AF-2 (new card)                                     | TC-UCT-09 | High     | ✓ Covered                                                                                      |
| S5       | MF + AF-1 + AF-2 (new address + new card)                | TC-UCT-10 | Medium   | ✓ Covered                                                                                      |
| S6       | MF + AF-3 (1 decline, retry success)                     | TC-UCT-04 | High     | ✓ Covered                                                                                      |
| S7       | MF + AF-3 × 3 (3 declines, abandoned)                    | TC-UCT-05 | High     | ✓ Covered                                                                                      |
| S8       | MF + AF-4 (payment gateway timeout)                      | TC-UCT-06 | High     | ✓ Covered                                                                                      |
| S9       | MF + AF-5 (concurrent inventory depletion)               | TC-UCT-07 | Medium   | ✓ Covered                                                                                      |
| S10      | MF + AF-6 (empty cart)                                   | TC-UCT-08 | High     | ✓ Covered                                                                                      |
| S11      | MF + HF-3 (session timeout during payment)               | TC-UCT-11 | Medium   | ✓ Covered                                                                                      |
| —        | MF + AF-1 + AF-2 + AF-3                                  | —         | —        | IMPOSSIBLE: AF-3 branches from Step 6; AF-3 can combine with AF-2 but 3-way combo is low value |
| S12      | MF + AF-2 + AF-3 (new card + declined)                   | —         | Low      | Acknowledged — not tested this cycle                                                           |

### Flow Coverage (Complete)

| Flow ID | Description                                   | Covered by Scenario(s) | Test Case(s)                    | Status |
| ------- | --------------------------------------------- | ---------------------- | ------------------------------- | ------ |
| MF      | Main Flow — happy path                        | S1 through S11         | TC-UCT-01                       | ✓      |
| AF-1    | Add new shipping address (valid)              | S2, S3, S5             | TC-UCT-02, TC-UCT-03, TC-UCT-10 | ✓      |
| AF-1a   | Address validation failure (sub-flow of AF-1) | S3                     | TC-UCT-03                       | ✓      |
| AF-2    | Enter new payment card                        | S4, S5                 | TC-UCT-09, TC-UCT-10            | ✓      |
| AF-3    | Payment declined — retry or abandon           | S6, S7                 | TC-UCT-04, TC-UCT-05            | ✓      |
| AF-4    | Payment gateway timeout                       | S8                     | TC-UCT-06                       | ✓      |
| AF-5    | Concurrent inventory depletion post-payment   | S9                     | TC-UCT-07                       | ✓      |
| AF-6    | Empty cart at checkout initiation             | S10                    | TC-UCT-08                       | ✓      |
| HF-3    | Session expires during payment                | S11                    | TC-UCT-11                       | ✓      |

**Coverage metrics:**

- **Scenarios designed:** 11 / 12 = **91.7%** (S12 acknowledged as Low priority)
- **Alternate flows covered:** 9 / 9 = **100%**
- **Test cases total:** 11

### Requirements Traceability Matrix (RTM)

| BR ID                            | Use Case | Scenario(s)            | Test Case(s)                                                     | Coverage Status |
| -------------------------------- | -------- | ---------------------- | ---------------------------------------------------------------- | --------------- |
| BR-001 (cart ≥ 1 item)           | UC-03    | S10                    | TC-UCT-08                                                        | ✓               |
| BR-002 (address fields)          | UC-03    | S2, S3, S5             | TC-UCT-02, TC-UCT-03, TC-UCT-10                                  | ✓               |
| BR-003 (payment via gateway)     | UC-03    | S1, S4, S5, S6, S7, S8 | TC-UCT-01, TC-UCT-04, TC-UCT-05, TC-UCT-06, TC-UCT-09, TC-UCT-10 | ✓               |
| BR-004 (max 3 retries)           | UC-03    | S6, S7                 | TC-UCT-04, TC-UCT-05                                             | ✓               |
| BR-005 (inventory after payment) | UC-03    | S1, S9                 | TC-UCT-01 (Step 7), TC-UCT-07                                    | ✓               |
| BR-006 (email within 60s)        | UC-03    | S1, S2, S4, S5         | TC-UCT-01, TC-UCT-02, TC-UCT-09, TC-UCT-10                       | ✓               |
