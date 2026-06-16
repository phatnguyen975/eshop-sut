# Requirement Analysis — FR-01: Account Registration

## 1. Feature Overview

| Attribute         | Value                                                   |
| ----------------- | ------------------------------------------------------- |
| Feature ID        | FR-01                                                   |
| Feature Name      | Account Registration                                    |
| Test Layer        | Both (Web UI + API)                                     |
| Entry Point (UI)  | `http://localhost:5173` → Registration page             |
| Entry Point (API) | `POST http://localhost:3000/api/register`               |
| Actors            | Anonymous (unauthenticated user)                        |
| Auth Required     | No — registration is a public endpoint, no JWT required |

## 2. Input Fields & Constraints

| Field/Param       | Layer    | Type   | Explicit Constraints (from SRS)                                                                                                                                          | Implicit Constraints (Architecture/DB)                                                                                            | API Param Name      |
| ----------------- | -------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| `name`            | UI + API | string | Required, non-empty (per FR-01)                                                                                                                                          | Likely VARCHAR with max length (DB-level, not explicitly stated in SRS); no format restriction stated                             | `name`              |
| `email`           | UI + API | string | Required; valid format `user@domain.com`; must be unique in the system (per FR-01); HTML input `type="email"` (per FR-22)                                                | RFC 5322 email format; DB uniqueness constraint; max length implied by VARCHAR                                                    | `email`             |
| `password`        | UI + API | string | Required; min 8 characters; must contain ≥1 uppercase, ≥1 lowercase, ≥1 digit, ≥1 special char from set `@$!%*?&` (per FR-01); rendered as `type="password"` (per FR-22) | Characters outside the allowed special-char set may be silently rejected or accepted (G4 split candidate)                         | `password`          |
| `confirmPassword` | UI only  | string | Required; must exactly match `password` field (per FR-01); rendered as `type="password"` (per FR-22)                                                                     | This field is UI-side only — API spec does NOT include `confirmPassword` in the request body; mismatch must be caught client-side | _(not in API body)_ |

> **Note:** The API spec (`POST /api/register`) only accepts three fields: `name`, `email`, `password`. The `confirmPassword` field is a UI-only control — the API does not validate it. This means password-mismatch testing is a **UI-only** test scenario.

## 3. Business Rules

- **[BR-01]** The `name` field is mandatory; an empty or missing `name` must be rejected. (per FR-01)
- **[BR-02]** The `email` field is mandatory and must conform to the format `user@domain.com`. (per FR-01)
- **[BR-03]** The `email` must be unique — if the email already exists in the system, registration must be rejected. (per FR-01)
- **[BR-04]** The `password` must be at least 8 characters long. (per FR-01)
- **[BR-05]** The `password` must contain at least 1 uppercase letter (A–Z). (per FR-01)
- **[BR-06]** The `password` must contain at least 1 lowercase letter (a–z). (per FR-01)
- **[BR-07]** The `password` must contain at least 1 digit (0–9). (per FR-01)
- **[BR-08]** The `password` must contain at least 1 special character from the set `@$!%*?&` — characters outside this set (e.g., `#`, `^`, `(`) are NOT considered valid special characters. (per FR-01)
- **[BR-09]** The `confirmPassword` (UI only) must exactly match `password`; if the two fields do not match, the system must reject the submission. (per FR-01)
- **[BR-10]** After successful registration, the user must be redirected to the Login page. (per FR-01)
- **[BR-11]** Passwords must NOT be stored as plaintext — they must be hashed before persistence. (per SEC-01)
- **[BR-12]** The registration API (`POST /api/register`) does not require a JWT token — it is a public endpoint. (per SEC-02, inferred: no auth guard on this endpoint)
- **[BR-13]** All user input displayed back on the UI (e.g., name in toast/welcome messages) must be properly escaped — no raw HTML rendering. (per SEC-04)
- **[BR-14]** Database queries for email uniqueness check and user insertion must use parameterized queries, not string concatenation. (per SEC-05)

## 4. Expected Outputs

### 4.1 Success Path

- **HTTP:** `200 OK` + `{"message": "User registered successfully", "id": <new_user_id>}` (per API spec §1.1)
- **UI:** The user is redirected to the Login page after successful registration. (per FR-01)
- **DB:** A new row is inserted into the `users` table with the provided `name` and `email`; `password` is stored as a hash (bcrypt or equivalent), NOT plaintext. (per SEC-01)

### 4.2 Failure Paths

- **Empty `name`:** HTTP `400 Bad Request` + error message indicating `name` is required. (per FR-01, BR-01)
- **Invalid email format:** HTTP `400 Bad Request` + error message indicating invalid email format. (per FR-01, BR-02)
- **Duplicate email:** HTTP `400 Bad Request` (or `409 Conflict`) + error message indicating the email is already registered. (per FR-01, BR-03)
- **Password too short (< 8 chars):** HTTP `400 Bad Request` + error message indicating password does not meet requirements. (per FR-01, BR-04)
- **Password missing uppercase:** HTTP `400 Bad Request` + password validation error. (per FR-01, BR-05)
- **Password missing lowercase:** HTTP `400 Bad Request` + password validation error. (per FR-01, BR-06)
- **Password missing digit:** HTTP `400 Bad Request` + password validation error. (per FR-01, BR-07)
- **Password missing valid special char:** HTTP `400 Bad Request` + password validation error. (per FR-01, BR-08)
- **Password contains only invalid special chars (e.g., `#`, `^`):** HTTP `400 Bad Request` — the special char requirement is NOT satisfied by out-of-set characters. (per FR-01, BR-08)
- **`confirmPassword` ≠ `password` (UI only):** The UI must prevent form submission and display an error above the submit button indicating passwords do not match. No API call is made. (per FR-01, BR-09, FR-22)

## 5. GUI Requirements Applicable (FR-21~24)

> **Platform:** Web UI — HTML/DOM semantics checks apply.

- **[GUI-01]** The registration page must have **exactly one `<h1>` tag** describing the page content (e.g., "Đăng ký tài khoản"). (per FR-21)
- **[GUI-02]** All mandatory fields (`name`, `email`, `password`, `confirmPassword`) must have a `*` symbol next to their labels. (per FR-22)
- **[GUI-03]** The email input must use `type="email"` (enables HTML5 format validation in browser). (per FR-22)
- **[GUI-04]** Both password fields must use `type="password"` (characters must be masked/hidden). (per FR-22)
- **[GUI-05]** Error messages must appear **above the submit button**, not below it. (per FR-22)
- **[GUI-06]** The registration form is a **single-step form** (no Step Indicator required — Step Indicator only applies to forms with 2+ steps). (per FR-22)
- **[GUI-07]** The submit/register button must use **blue (positive action color)** per the color consistency rule. (per FR-21)
- **[GUI-08]** Breadcrumb is **not required** for the registration page — it is required only for sub-pages (Shopping Cart, Checkout, Product Detail). (per FR-23)
- **[GUI-09]** Tab Order must follow top-to-bottom, left-to-right focus sequence: `name` → `email` → `password` → `confirmPassword` → submit button. (per FR-21)
- **[GUI-10]** No toast notification is mandated by SRS for registration success — the redirect to the Login page serves as the success feedback. (per FR-01, FR-24 — no explicit toast requirement for this FR)

## 6. Security Requirements Applicable (SEC-xx)

- **[SEC-01]** Password must be hashed before storage. Test indirectly: after registration, attempt login with the submitted password via `POST /api/login` — if it succeeds, password hashing is functioning. Direct DB inspection is required to confirm no plaintext storage.
- **[SEC-02]** The `POST /api/register` endpoint must NOT require a JWT — it must be accessible without any `Authorization` header. If a token is accidentally required, unauthenticated users cannot register.
- **[SEC-04]** If the registered `name` is ever displayed back on the UI (e.g., in a welcome message or profile), it must be escaped. Test by registering with `name = <script>alert(1)</script>` and verifying no script executes.
- **[SEC-05]** The email uniqueness check and user insertion must use parameterized queries. This is a code-level concern; indirect testing via SQL injection payload in `email` field (e.g., `' OR '1'='1`) can detect concatenation vulnerabilities.

> **Note:** SEC-03 (role=admin check), SEC-06 (role field protection), and SEC-07 (OTP) do NOT apply to FR-01.

## 7. Notes for Domain Testing

- **Input variables identified:** `name`, `email`, `password`, `confirmPassword` (UI only)
- **Output variables identified:** HTTP status code, JSON response body (`message`, `id`), UI redirect behavior, DB row created (hashed password), error message text and position
- **Boundary candidates:**
  - `password` length: LB = 8 characters (min); no explicit upper bound stated (UB = system/DB limit, e.g., 255)
  - `name` length: no explicit bound stated in SRS — implicit DB VARCHAR limit is a boundary candidate
  - `email` length: no explicit bound stated — implicit DB limit applies
- **High-risk areas:**
  - Password special character set restriction (`@$!%*?&` only) — chars outside this set (e.g., `#`, `^`, `(`, `)`) look like valid special chars but must be rejected
  - `confirmPassword` mismatch — UI-only validation, not present in API body
  - Duplicate email handling — must be tested both via UI and direct API call
  - Password exactly at boundary (length = 7 → reject, length = 8 → accept)
  - Password meets length but missing one category (e.g., all lowercase + digit + special, no uppercase)
- **AI blind spot warnings:**
  - `confirmPassword` field does NOT appear in the API spec — AI may forget to test password mismatch via UI, or may mistakenly try to send `confirmPassword` to the API
  - Special chars OUTSIDE the allowed set (e.g., `#`, `_`, `(`) are a hidden invalid class — AI tends to only test "no special char at all" and misses "wrong special char"
  - Email already exists is a stateful test — the test environment must have a pre-existing email to test against (e.g., `test@eshop.com`)
  - The API success response returns `"id"` (new user ID) — this should be validated as a positive integer in the response body
