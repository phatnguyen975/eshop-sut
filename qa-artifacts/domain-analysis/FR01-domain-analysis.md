# Domain Analysis — FR-01: Account Registration

## Step 1: Input & Output Variable Identification

---

### 1.1 Input Variables

#### Direct Inputs (UI Form / API Body)

| #   | Variable          | Source             | Type   | Description                                                                               |
| --- | ----------------- | ------------------ | ------ | ----------------------------------------------------------------------------------------- |
| I1  | `name`            | UI form + API body | string | Full name of the registering user; required, non-empty                                    |
| I2  | `email`           | UI form + API body | string | Email address; must be valid format and unique in the system                              |
| I3  | `password`        | UI form + API body | string | Password; min 8 chars; must have uppercase, lowercase, digit, special char from `@$!%*?&` |
| I4  | `confirmPassword` | UI form **only**   | string | Must exactly match `password`; this field is **not sent to the API**                      |

#### Indirect Inputs (Hidden / System State)

| #   | Variable              | Source              | Type    | Description                                                                                                        |
| --- | --------------------- | ------------------- | ------- | ------------------------------------------------------------------------------------------------------------------ |
| I5  | `email_uniqueness`    | DB state            | boolean | Whether the provided email already exists in the `users` table; drives BR-03                                       |
| I6  | `password_char_set`   | Input content       | enum    | Whether special chars used are from the allowed set `@$!%*?&` or outside it; drives BR-08 (G4 split)               |
| I7  | `auth_token_presence` | HTTP request header | boolean | Whether an `Authorization: Bearer` token is present; must NOT be required for this public endpoint (BR-12, SEC-02) |

---

### 1.2 Output Variables

#### Direct Outputs (Visible)

| #   | Variable                 | Channel | Description                                                                        |
| --- | ------------------------ | ------- | ---------------------------------------------------------------------------------- |
| O1  | HTTP status code         | API     | `200 OK` on success; `400 Bad Request` or `409 Conflict` on failure                |
| O2  | Response body: `message` | API     | `"User registered successfully"` on success; error description string on failure   |
| O3  | Response body: `id`      | API     | Positive integer — new user ID returned on success; absent on failure              |
| O4  | UI redirect              | UI      | On success, browser navigates to Login page (per BR-10, FR-01)                     |
| O5  | UI error message         | UI      | Validation error text displayed **above the submit button** on failure (per FR-22) |

#### Indirect Outputs (Hidden / State Changes)

| #   | Variable                    | Channel | Description                                                                                                      |
| --- | --------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------- |
| O6  | DB: new user record         | State   | A new row inserted in the `users` table with `name`, `email`, hashed `password` (per SEC-01)                     |
| O7  | DB: password storage format | State   | `password` field in DB must be a hash (bcrypt), NOT plaintext (per SEC-01, BR-11)                                |
| O8  | DOM: `<h1>` count           | DOM     | Registration page must have **exactly 1** `<h1>` element (per FR-21, GUI-01)                                     |
| O9  | DOM: email input type       | DOM     | Email `<input>` must have `type="email"` attribute (per FR-22, GUI-03)                                           |
| O10 | DOM: password input types   | DOM     | Both password `<input>` fields must have `type="password"` attribute (per FR-22, GUI-04)                         |
| O11 | DOM: required field markers | DOM     | All 4 mandatory fields must display a `*` next to their labels (per FR-22, GUI-02)                               |
| O12 | DOM: error message position | DOM     | Error messages rendered above the submit button, not below (per FR-22, GUI-05)                                   |
| O13 | DOM: submit button color    | DOM     | Submit button must be blue (positive action color) (per FR-21, GUI-07)                                           |
| O14 | XSS safety: `name` display  | UI      | If `name` is echoed back (e.g., profile/welcome), it must be escaped — no raw HTML rendering (per SEC-04, BR-13) |

---

### 1.3 Variable Summary for EP

- **Total inputs identified:** 7 (4 direct + 3 indirect)
- **Total outputs identified:** 14 (5 direct + 9 indirect)
- **Variables requiring EP (input variables for equivalence partitioning):**
  - `name` (I1)
  - `email` (I2)
  - `password` (I3)
  - `confirmPassword` (I4) — UI channel only
  - `email_uniqueness` (I5) — System state variable
  - `password_char_set` (I6) — Hidden enum, G4 split candidate
  - `auth_token_presence` (I7) — SEC-02 test variable
- **Boundary candidates:**
  - `password` **length**: explicit LB = 8 chars; UB = implicit DB/system limit (→ BVA target)
  - `name` **length**: no explicit SRS bound; implicit DB VARCHAR limit (→ BVA candidate)
  - `email` **length**: no explicit SRS bound; implicit DB VARCHAR limit (→ BVA candidate)

---

> **Blind Spot Check (per domain-identifier skill Section 7):**
>
> - ✅ `confirmPassword` captured as I4 (UI-only, not in API body)
> - ✅ `email_uniqueness` captured as I5 (DB state — stateful hidden input)
> - ✅ `password_char_set` captured as I6 (G4 split: in-set vs out-of-set special chars)
> - ✅ `auth_token_presence` captured as I7 (SEC-02: endpoint must be public)
> - ✅ DOM outputs O8–O13 captured for Web UI channel
> - ✅ Password hashing output O7 captured (SEC-01 indirect test)
