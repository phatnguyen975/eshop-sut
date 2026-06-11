---
name: test-execution-assistant
description: >
  Guide the execution of each test case on the correct Test Channel, providing
  ready-to-use commands (cURL, DevTools, UI steps), instructions for recording
  Observed Results, and Pass/Fail evaluation against 3 Oracle sources.
  Only run after test-case-reviewer has returned APPROVED.
trigger:
  - "execute test cases"
  - "help me test"
  - "run TC"
  - "execute FR"
  - "start execution"
output: qa-artifacts/execution-results/FR{nn}-execution-results.md
---

# Skill: test-execution-assistant

## 1. Purpose

Guide the human through executing each TC on the correct channel with ready-to-use commands, and record Observed Results and Pass/Fail verdicts.

## 2. Input Required

- File `qa-artifacts/test-cases/FR{nn}-test-cases.md` — APPROVED status
- SUT running: backend `:3000`, frontend `:5173`, admin `:5174`, mobile (Expo)
- Postman configured with environment variables: `base_url`, `user_token`, `admin_token`

## 3. Pre-Execution Setup

Verify the SUT is running and tokens are available before any TC:

```bash
# 1. Verify backend is running
curl -s http://localhost:3000/api/products | head -c 100

# 2. Get and store User token
USER_TOKEN=$(curl -s -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@eshop.com","password":"Test1234!"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")
echo "User token acquired: ${USER_TOKEN:0:30}..."

# 3. Get and store Admin token
ADMIN_TOKEN=$(curl -s -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@eshop.com","password":"Admin123!"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")
echo "Admin token acquired: ${ADMIN_TOKEN:0:30}..."
```

## 4. Execution Guide by Test Channel

### Channel 1: UI Testing

**Setup:** Apply branching logic based on the feature platform.

- **For Web UI (FR-01, FR-07, FR-17):** Open browser, navigate to the target URL (e.g., `http://localhost:5173`).
- **For Mobile UI (FR-03):** Open Expo Go App on Android/iOS emulator or physical device.

**Step format (Web UI):**

1. Navigate to: http://localhost:{port}/{path}
2. Fill in field "{label}" with: "{value}"
3. Click: "{button label}"
4. Observe: {what to look at}

**Step format (Mobile UI):**

1. Open EShop App in Expo Go.
2. Navigate to Screen: "{Screen Name}"
3. Tap input "{label}" and enter: "{value}"
4. Tap button: "{button label}"
5. Observe: {what to look at}

**Evidence to capture:**

- Screenshot BEFORE submit (form filled in)
- Screenshot AFTER submit (result or error message)
- Save to: `evidence/screenshots/FR{nn}/TC-{id}-before.png` and `-after.png`

**Validation points:**

- Does UI behavior match expected? (redirect, message, badge, dialog)
- Is the error message position correct? (must be ABOVE submit button, per FR-22)
- Does the toast/notification appear as expected?

### Channel 2: API Testing

**Setup:** Postman or cURL. Use shell variables from pre-execution setup.

**cURL templates:**

```bash
# POST with JSON body
curl -s -X POST http://localhost:3000/api/{endpoint} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d '{"field1": "value1", "field2": "value2"}' \
  | python3 -m json.tool

# GET request
curl -s -X GET http://localhost:3000/api/{endpoint} \
  -H "Authorization: Bearer $USER_TOKEN" \
  | python3 -m json.tool

# DELETE request
curl -s -X DELETE http://localhost:3000/api/{endpoint}/{id} \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  | python3 -m json.tool
```

**Evidence to capture:**

- HTTP response status code
- Full response body (JSON)
- Save to: `evidence/api-responses/FR{nn}/TC-{id}-response.json`

**Validation points:**

- Does HTTP status code match expected?
- Do response body fields match the API spec schema?
- Does response content match SRS business logic?

### Channel 3: Role-Auth Testing

**Purpose:** Verify authorization enforcement across 3 token states.

**Template — run all 3 states for every admin endpoint under test:**

```bash
ENDPOINT="http://localhost:3000/api/admin/coupons"
PAYLOAD='{"code":"ROLETEST","type":"percent","discount_value":10,"min_order_amount":0,"expired_at":"2099-12-31","max_uses_per_user":1}'

echo "=== State 1: No token (expect HTTP 401) ==="
curl -s -o /tmp/r1.json -w "%{http_code}" -X POST $ENDPOINT \
  -H "Content-Type: application/json" -d $PAYLOAD
echo "" && cat /tmp/r1.json | python3 -m json.tool

echo "=== State 2: User token (expect HTTP 403) ==="
curl -s -o /tmp/r2.json -w "%{http_code}" -X POST $ENDPOINT \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" -d $PAYLOAD
echo "" && cat /tmp/r2.json | python3 -m json.tool

echo "=== State 3: Admin token (expect HTTP 200) ==="
curl -s -o /tmp/r3.json -w "%{http_code}" -X POST $ENDPOINT \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" -d $PAYLOAD
echo "" && cat /tmp/r3.json | python3 -m json.tool
```

**Expected responses:**

- No token: HTTP 401 Unauthorized
- User token: HTTP 403 Forbidden
- Admin token: HTTP 200 OK + success body

### Channel 4: DOM Testing (Web UI ONLY)

**Setup:** Open Browser DevTools (F12) → Console tab. Navigate to the target page.

**Standard DOM checks — copy and paste into Console:**

```javascript
// Check 1: Exactly 1 h1 tag on the page (per FR-21)
const h1Count = document.querySelectorAll("h1").length;
console.log(
  `H1 count: ${h1Count} | Expected: 1 | ${h1Count === 1 ? "PASS" : "FAIL"}`,
);

// Check 2: Email input has type="email" (per FR-22)
const emailInput = document.querySelector('input[type="email"]');
console.log(
  `Email input type="email": ${emailInput ? "PASS" : "FAIL - not found"}`,
);

// Check 3: Password input has type="password" (per FR-22)
const pwInput = document.querySelector('input[type="password"]');
console.log(
  `Password input type="password": ${pwInput ? "PASS" : "FAIL - not found"}`,
);

// Check 4: Required fields marked with * (per FR-22)
const labels = Array.from(document.querySelectorAll("label"));
const starLabels = labels.filter((l) => l.textContent.includes("*"));
console.log(
  `Labels with * (required indicator): ${starLabels.map((l) => l.textContent.trim())}`,
);

// Check 5: All images have non-empty alt text (per FR-24)
const imgs = document.querySelectorAll("img");
const missingAlt = Array.from(imgs).filter(
  (img) => !img.alt || img.alt.trim() === "",
);
console.log(
  `Images missing alt text: ${missingAlt.length} | Expected: 0 | ${missingAlt.length === 0 ? "PASS" : "FAIL"}`,
);

// Check 6: Navbar highlight active page (per FR-23)
const activeLinks = document.querySelectorAll(
  'nav a.active, nav a[aria-current="page"]',
);
console.log(`Active nav links: ${activeLinks.length} (expected: 1)`);

// Check 7: Cart badge visible in navbar (per FR-23)
const badge =
  document.querySelector('[class*="badge"]') ||
  document.querySelector('[class*="cart-count"]');
console.log(`Cart badge element: ${badge ? badge.textContent : "NOT FOUND"}`);
```

**Evidence:** Screenshot of the Console output panel.

### Channel 5: State Verification

**Purpose:** Confirm DB state actually changed after a UI or API action.

**Sequence:**

```
1. Record BEFORE state → API GET
2. Perform the action (UI click or API call)
3. Record AFTER state → API GET
4. Compare BEFORE vs AFTER
```

**Example for cart:**

```bash
# Before: check cart state
echo "=== BEFORE: Cart state ==="
curl -s -X GET http://localhost:3000/api/cart \
  -H "Authorization: Bearer $USER_TOKEN" | python3 -m json.tool

# Action: add item via UI
echo "(Perform action: add item to cart via UI or API)"
echo "Press Enter when done..." && read

# After: check cart state again
echo "=== AFTER: Cart state ==="
curl -s -X GET http://localhost:3000/api/cart \
  -H "Authorization: Bearer $USER_TOKEN" | python3 -m json.tool
```

**Validation points:**

- Did item count change correctly?
- For duplicate product: was quantity merged (not a new row)?
- Was the total amount recalculated correctly?

## 5. Pass/Fail Decision

### 3 Oracle Sources

| Oracle            | Source                   | Verification method                           |
| ----------------- | ------------------------ | --------------------------------------------- |
| **SRS Oracle**    | `eshop-srs.md` (FR spec) | Compare observed behavior with FR description |
| **API Oracle**    | `eshop-api-spec.md`      | Compare HTTP status + body with spec          |
| **UI/DOM Oracle** | FR-21 to FR-24 in SRS    | Visual check + DevTools console output        |

### Decision Rule

```
PASS    = ALL expected result points match observed result exactly
FAIL    = ANY single point does not match → create bug report immediately
BLOCKED = Cannot execute due to a dependency failure (document the blocker)
SKIPPED = Intentionally bypassed (document the reason)
```

## 6. Output Format

> **CRITICAL RULE:** All generated content MUST be strictly in English.

File: `qa-artifacts/execution-results/FR{nn}-execution-results.md`

```markdown
# Execution Results — FR-{nn}: {Feature Name}

**Executed by:** {Student ID}
**Date:** {YYYY-MM-DD}
**Environment:** {Browser & OS for Web / Device Model & OS for Mobile}, Expo Go {version if applicable}, SUT commit: {hash}

## Execution Log

### FR{nn}-EP-001 — {Objective}

**Channel:** UI + API
**Executed:** {YYYY-MM-DD HH:MM}

**Test Data Used:**

- email: "newuser@test.com"
- password: "Test@123"
- confirmPassword: "Test@123"

**Steps Executed:**

1. Navigated to http://localhost:5173/register
2. Filled all fields with valid values
3. Clicked "Register" button

**Observed Result:**

- HTTP: 200 OK
- Response: `{"message": "User registered successfully", "id": 42}`
- UI: Page redirected to /login

**Expected vs Observed:**

| Point         | Expected     | Observed     | Match? |
| ------------- | ------------ | ------------ | ------ |
| HTTP status   | 200 OK       | 200 OK       | Pass   |
| Response body | message + id | message + id | Pass   |
| UI redirect   | /login       | /login       | Pass   |

**Status:** PASS
**Evidence:** `evidence/screenshots/FR01/TC-EP-001-after.png`

### FR{nn}-EP-004 — {Objective}

**Status:** FAIL

**Mismatch Details:**

| Point         | Expected                            | Observed                                      |
| ------------- | ----------------------------------- | --------------------------------------------- |
| HTTP status   | 400 Bad Request (per FR-01)         | 200 OK                                        |
| Response body | Error message about duplicate email | `{"message": "User registered successfully"}` |

**Bug Created:** BUG-001
**Evidence:** `evidence/screenshots/FR01/TC-EP-004-fail.png`

## Execution Summary

| Metric     | Value |
| ---------- | ----- |
| Total TCs  | {n}   |
| Executed   | {n}   |
| Passed     | {n}   |
| Failed     | {n}   |
| Blocked    | {n}   |
| Skipped    | {n}   |
| Pass Rate  | {%}   |
| Bugs Found | {n}   |
```

## 7. Evidence Naming Convention

```
evidence/screenshots/FR{nn}/
  ├── TC-EP-001-before.png        <- Form filled, before submit
  ├── TC-EP-001-after.png         <- Result after submit
  ├── TC-EP-004-fail.png          <- Failure evidence
  └── TC-BVA-003-console.png      <- DevTools console output

evidence/api-responses/FR{nn}/
  ├── TC-EP-001-response.json
  └── TC-BVA-003-response.json
```

## 8. Quality Checklist

- [ ] All generated content is completely in English
- [ ] Pre-execution setup completed (SUT running, tokens available)
- [ ] Each TC executed on the correct assigned channel
- [ ] Observed Result is specific (not "looks correct")
- [ ] Evidence captured for every TC (screenshot or JSON)
- [ ] FAIL TCs linked to a Bug ID immediately
- [ ] BLOCKED TCs have the blocker documented
- [ ] Execution summary table fully populated
- [ ] A preview has been shown to the human, and explicit `APPROVE` command was received before saving to disk
