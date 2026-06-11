---
name: domain-identifier
description: >
  Perform Step 1 of Domain Testing: identify all Input Variables and Output
  Variables of a feature. Output is the mandatory foundation for
  equivalence-partitioning. Only run after requirement-analyzer is complete
  and approved.
trigger:
  - "identify variables"
  - "step 1 domain testing"
  - "identify inputs outputs"
  - "domain identifier"
output: Opening section of qa-artifacts/domain-analysis/FR{nn}-domain-analysis.md
---

# Skill: domain-identifier

## 1. Purpose

Perform **Step 1** of the 4-step Domain Testing framework: identify all input variables and output variables of a feature. This is the step where AI misses the most — especially hidden inputs and implicit outputs.

## 2. Input Required

- FR ID to analyze
- Approved output of `requirement-analyzer`
- **Reference files:** `.agents/context/eshop-srs.md` and `.agents/context/eshop-api-spec.md`

## 3. Core Concept

> From `theory-domain-testing.md` Section 2, Step 1:
>
> - "Inputs also include API payloads, environment variables, **hidden system states**, database values fetched during execution, and even time or location data."
> - "Outputs are not just the final calculated value displayed on the screen. They include **error messages, database updates, triggered events, API responses, and changes in the user interface state**."

## 4. Step-by-Step Instructions

### Step A — Identify Direct Input Variables (Obvious)

List all inputs that the user directly provides:

- UI form fields (text, email, password, number, date, select, checkbox)
- API request body parameters
- URL parameters (`:id`, query strings `?search=`)
- File uploads if applicable

### Step B — Identify Indirect Input Variables (Hidden — AI commonly misses these)

These are hidden inputs that do not appear explicitly in the UI or API body:

| Hidden Input Type      | EShop Example                          |
| ---------------------- | -------------------------------------- |
| **Auth token**         | JWT in `Authorization: Bearer` header  |
| **User role**          | `role` field inside JWT payload        |
| **System state**       | Email already exists in DB or not      |
| **Session state**      | User is logged in or not               |
| **DB referenced data** | `category_id` must exist in DB         |
| **Time-dependent**     | OTP expiry, coupon expiry date         |
| **Counter-dependent**  | Coupon usage count, failed login count |

### Step C — Identify Direct Output Variables (Obvious)

- HTTP response status code
- HTTP response body (JSON fields)
- UI redirect / navigation
- UI toast notification
- UI badge count update
- UI error message displayed

### Step D — Identify Indirect Output Variables (Hidden — AI commonly misses these)

| Hidden Output Type     | EShop Example                                                                   |
| ---------------------- | ------------------------------------------------------------------------------- |
| **DB state change**    | New user record created in database after register                              |
| **DOM structure**      | `<h1>` count, `type` attribute, `alt` attribute (Web UI ONLY - Skip for Mobile) |
| **Auth state**         | JWT token stored in localStorage/cookie                                         |
| **Cart state**         | Number of items in cart increases/decreases                                     |
| **OTP state**          | OTP is invalidated after use (SEC-07)                                           |
| **Coupon usage count** | `uses_count` increments after apply                                             |

### Step E — Classify by Test Channel

After identifying all variables, assign each to the appropriate test channel:

| Variable                     | Channel to verify                          |
| ---------------------------- | ------------------------------------------ |
| Form field value             | UI                                         |
| HTTP status code             | API                                        |
| Response body JSON           | API                                        |
| `role` enforcement           | Role-Auth                                  |
| `<h1>` count, `type="email"` | DOM (Web UI ONLY - Do NOT apply to Mobile) |
| DB record created/updated    | State (API GET after action)               |

## 5. Output Format

> **CRITICAL RULE:** All generated content MUST be strictly in English.

Add this section to the beginning of `qa-artifacts/domain-analysis/FR{nn}-domain-analysis.md`:

```markdown
# Domain Analysis — FR-{nn}: {Feature Name}

## Step 1: Input & Output Variable Identification

### 1.1 Input Variables

#### Direct Inputs (UI Form / API Body)

| #   | Variable          | Source             | Type   | Description             |
| --- | ----------------- | ------------------ | ------ | ----------------------- |
| I1  | `email`           | UI form + API body | string | User registration email |
| I2  | `password`        | UI form + API body | string | User password           |
| I3  | `confirmPassword` | UI form only       | string | Password confirmation   |

#### Indirect Inputs (Hidden / System State)

| #   | Variable           | Source         | Type       | Description                        |
| --- | ------------------ | -------------- | ---------- | ---------------------------------- |
| I4  | `email_uniqueness` | DB state       | boolean    | Email already exists in DB         |
| I5  | `auth_token`       | Request header | JWT string | Authentication token (if required) |

### 1.2 Output Variables

#### Direct Outputs (Visible)

| #   | Variable         | Channel | Description                               |
| --- | ---------------- | ------- | ----------------------------------------- |
| O1  | HTTP status code | API     | 200 OK or 4xx Error                       |
| O2  | Response body    | API     | `{"message": "...", "id": N}`             |
| O3  | UI redirect      | UI      | Navigate to Login page after registration |
| O4  | Error message    | UI      | Validation error displayed on form        |

#### Indirect Outputs (Hidden / State Changes)

| #   | Variable          | Channel | Description                    |
| --- | ----------------- | ------- | ------------------------------ |
| O5  | DB user record    | State   | New user created in database   |
| O6  | DOM: `<h1>` count | DOM     | Page has exactly 1 h1 tag      |
| O7  | DOM: input types  | DOM     | Email field has `type="email"` |

### 1.3 Variable Summary for EP

- **Total inputs identified:** {n} ({n_direct} direct + {n_indirect} indirect)
- **Total outputs identified:** {n} ({n_direct} direct + {n_indirect} indirect)
- **Variables requiring EP:** {list of input variables}
- **Boundary candidates:** {list with numeric/range/length constraints}
```

## 6. Quality Checklist

- [ ] All generated content is completely in English
- [ ] Hidden inputs identified (auth token, DB state, session state, counters)
- [ ] Hidden outputs identified (DOM changes, DB state, auth state)
- [ ] DOM test channel is correctly omitted for Mobile UI
- [ ] Each variable has a test channel assigned
- [ ] "Boundary candidates" are sufficient for the BVA skill
- [ ] No variable from requirement-analysis is missing
- [ ] A preview has been shown to the human, and explicit `APPROVE` command was received before saving to disk

## 7. Common AI Blind Spots (Must verify manually)

| FR    | Hidden variables AI commonly misses                                             |
| ----- | ------------------------------------------------------------------------------- |
| FR-01 | `confirmPassword` field (UI-only, not in API body); `email_uniqueness` DB state |
| FR-07 | `duplicate_product_in_cart` state; `cart_item_count` badge as output            |
| FR-17 | `user_role` in JWT header; `code_uniqueness` DB state                           |
| FR-03 | `otp_bound_to_email` state; `otp_used_status` state (SEC-07)                    |
