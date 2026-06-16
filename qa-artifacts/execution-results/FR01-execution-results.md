# Execution Results — FR-01: Account Registration

**Executed by:** 23127449 - Nguyến Tấn Phát  
**Date:** 2026-06-14  
**Environment:** Ubuntu (WSL), Edge (Web Browser), Windows 11  
**Session recording:** [Youtube URL]()

## Execution Log

### FR01-EP-001 — Verify user registration succeeds with all valid name, email, and strong password inputs

**Channel:** UI + API + State

| Point         | Expected                                      | Observed          | Match? |
| ------------- | --------------------------------------------- | ----------------- | ------ |
| HTTP status   | HTTP 200 OK...                                | See details below | Yes    |
| Response body | Response body: `{"message": "User regist...   | See details below | Yes    |
| UI/State      | `[UI]` Page redirects to Login page (per F... | See details below | No     |
| UI/State      | `[State]` New user record exists in DB — c... | See details below | Yes    |
| UI/State      | `[State]` Password stored as bcrypt hash, ... | See details below | No     |

- **Status:** FAIL
- **Observed Details:** `[Automated]` DB password stored as plaintext `Test@123`. `[Manual UI]` Password incorrectly rejected due to standard special character (requires space instead).
- **Bug Created:**
- **Evidence:** Script output + UI review

### FR01-EP-002 — Verify user registration rejects submission when the name field is empty

**Channel:** UI + API

| Point         | Expected                                      | Observed          | Match? |
| ------------- | --------------------------------------------- | ----------------- | ------ |
| HTTP status   | HTTP 400 Bad Request...                       | See details below | No     |
| Response body | Response body contains error message ind...   | See details below | No     |
| UI/State      | `[UI]` Inline error displayed for the Name... | See details below | No     |
| UI/State      | No new user record created in DB...           | See details below | No     |

- **Status:** FAIL
- **Observed Details:** `[Automated]` API returned HTTP 200 (expected 400). `[Manual UI]` Relies on native HTML5 tooltip instead of inline error.
- **Bug Created:**
- **Evidence:** Script output + UI review

### FR01-EP-003 — Verify registration API rejects request with name field absent from JSON body

**Channel:** API

| Point         | Expected                                    | Observed          | Match? |
| ------------- | ------------------------------------------- | ----------------- | ------ |
| HTTP status   | HTTP 400 Bad Request...                     | See details below | No     |
| Response body | Response body indicates name field is re... | See details below | No     |
| UI/State      | No new user record created in DB...         | See details below | No     |

- **Status:** FAIL
- **Observed Details:** `[Automated]` API returned HTTP 200 (expected 400).
- **Bug Created:**
- **Evidence:** Script output + UI review

### FR01-EP-004 — Verify user registration rejects email that does not contain an @ symbol

**Channel:** UI + API

| Point       | Expected                                      | Observed          | Match? |
| ----------- | --------------------------------------------- | ----------------- | ------ |
| HTTP status | HTTP 400 Bad Request...                       | See details below | No     |
| UI/State    | Error indicates invalid email format (pe...   | See details below | No     |
| UI/State    | `[UI]` Inline error on Email field; user r... | See details below | No     |
| UI/State    | No new user created in DB...                  | See details below | No     |

- **Status:** FAIL
- **Observed Details:** `[Automated]` API returned HTTP 200 (expected 400). `[Manual UI]` Displayed weak password error instead of invalid email error.
- **Bug Created:**
- **Evidence:** Script output + UI review

### FR01-EP-005 — Verify user registration rejects email with no domain part after the @ symbol

**Channel:** UI + API

| Point       | Expected                                    | Observed          | Match? |
| ----------- | ------------------------------------------- | ----------------- | ------ |
| HTTP status | HTTP 400 Bad Request...                     | See details below | No     |
| UI/State    | Error indicates invalid email format (pe... | See details below | No     |
| UI/State    | `[UI]` Inline error on Email field...       | See details below | No     |
| UI/State    | No new user created in DB...                | See details below | No     |

- **Status:** FAIL
- **Observed Details:** `[Automated]` API returned HTTP 200 (expected 400). `[Manual UI]` Blocked by incorrect password validation.
- **Bug Created:**
- **Evidence:** Script output + UI review

### FR01-EP-006 — Verify user registration rejects email with no local part before the @ symbol

**Channel:** UI + API

| Point       | Expected                                    | Observed          | Match? |
| ----------- | ------------------------------------------- | ----------------- | ------ |
| HTTP status | HTTP 400 Bad Request...                     | See details below | No     |
| UI/State    | Error indicates invalid email format (pe... | See details below | No     |
| UI/State    | `[UI]` Inline error on Email field...       | See details below | No     |
| UI/State    | No new user created in DB...                | See details below | No     |

- **Status:** FAIL
- **Observed Details:** `[Automated]` API returned HTTP 200 (expected 400). `[Manual UI]` Blocked by incorrect password validation.
- **Bug Created:**
- **Evidence:** Script output + UI review

### FR01-EP-007 — Verify user registration rejects email that is already registered in the system

**Channel:** UI + API

| Point         | Expected                                      | Observed          | Match? |
| ------------- | --------------------------------------------- | ----------------- | ------ |
| HTTP status   | HTTP 409 Conflict...                          | See details below | No     |
| Response body | Response body: `{"message": "Email alrea...   | See details below | No     |
| UI/State      | `[UI]` Error message displayed; user remai... | See details below | No     |
| UI/State      | No additional user record created in DB...    | See details below | No     |

- **Status:** FAIL
- **Observed Details:** `[Automated]` API returned HTTP 200 (expected 409). `[Manual UI]` Blocked by incorrect password validation logic.
- **Bug Created:**
- **Evidence:** Script output + UI review

### FR01-EP-008 — Verify user registration rejects submission when the email field is empty

**Channel:** UI + API

| Point       | Expected                                      | Observed          | Match? |
| ----------- | --------------------------------------------- | ----------------- | ------ |
| HTTP status | HTTP 400 Bad Request...                       | See details below | No     |
| UI/State    | Error indicates email is required (per F...   | See details below | No     |
| UI/State    | `[UI]` Inline error on Email field; user r... | See details below | No     |
| UI/State    | No new user created in DB...                  | See details below | No     |

- **Status:** FAIL
- **Observed Details:** `[Automated]` API returned HTTP 200 (expected 400). `[Manual UI]` Relies on native HTML5 tooltip.
- **Bug Created:**
- **Evidence:** Script output + UI review

### FR01-EP-009 — Verify registration API rejects request with email field absent from JSON body

**Channel:** API

| Point         | Expected                                    | Observed          | Match? |
| ------------- | ------------------------------------------- | ----------------- | ------ |
| HTTP status   | HTTP 400 Bad Request...                     | See details below | No     |
| Response body | Response body indicates email is require... | See details below | No     |
| UI/State      | No new user created in DB...                | See details below | No     |

- **Status:** FAIL
- **Observed Details:** `[Automated]` API returned HTTP 200 (expected 400).
- **Bug Created:**
- **Evidence:** Script output + UI review

### FR01-EP-010 — Verify user registration rejects password shorter than the minimum required 8 characters

**Channel:** UI + API

| Point       | Expected                                    | Observed          | Match? |
| ----------- | ------------------------------------------- | ----------------- | ------ |
| HTTP status | HTTP 400 Bad Request...                     | See details below | No     |
| UI/State    | Error indicates password must be at leas... | See details below | No     |
| UI/State    | `[UI]` Inline error on Password field...    | See details below | Yes    |
| UI/State    | No new user created in DB...                | See details below | No     |

- **Status:** FAIL
- **Observed Details:** `[Automated]` API returned HTTP 200 (expected 400). `[Manual UI]` UI correctly blocked and showed inline error.
- **Bug Created:**
- **Evidence:** Script output + UI review

### FR01-EP-011 — Verify user registration rejects password that contains no uppercase letter

**Channel:** UI + API

| Point       | Expected                                    | Observed          | Match? |
| ----------- | ------------------------------------------- | ----------------- | ------ |
| HTTP status | HTTP 400 Bad Request...                     | See details below | No     |
| UI/State    | Error indicates password must contain at... | See details below | No     |
| UI/State    | `[UI]` Inline error on Password field...    | See details below | Yes    |
| UI/State    | No new user created in DB...                | See details below | No     |

- **Status:** FAIL
- **Observed Details:** `[Automated]` API returned HTTP 200 (expected 400). `[Manual UI]` UI correctly blocked and showed inline error.
- **Bug Created:**
- **Evidence:** Script output + UI review

### FR01-EP-012 — Verify user registration rejects password that contains no lowercase letter

**Channel:** UI + API

| Point       | Expected                                    | Observed          | Match? |
| ----------- | ------------------------------------------- | ----------------- | ------ |
| HTTP status | HTTP 400 Bad Request...                     | See details below | No     |
| UI/State    | Error indicates password must contain at... | See details below | No     |
| UI/State    | `[UI]` Inline error on Password field...    | See details below | Yes    |
| UI/State    | No new user created in DB...                | See details below | No     |

- **Status:** FAIL
- **Observed Details:** `[Automated]` API returned HTTP 200 (expected 400). `[Manual UI]` UI correctly blocked and showed inline error.
- **Bug Created:**
- **Evidence:** Script output + UI review

### FR01-EP-013 — Verify user registration rejects password that contains no numeric digit

**Channel:** UI + API

| Point       | Expected                                    | Observed          | Match? |
| ----------- | ------------------------------------------- | ----------------- | ------ |
| HTTP status | HTTP 400 Bad Request...                     | See details below | No     |
| UI/State    | Error indicates password must contain at... | See details below | No     |
| UI/State    | `[UI]` Inline error on Password field...    | See details below | Yes    |
| UI/State    | No new user created in DB...                | See details below | No     |

- **Status:** FAIL
- **Observed Details:** `[Automated]` API returned HTTP 200 (expected 400). `[Manual UI]` UI correctly blocked and showed inline error.
- **Bug Created:**
- **Evidence:** Script output + UI review

### FR01-EP-014 — Verify user registration rejects password that contains no special character at all

**Channel:** UI + API

| Point       | Expected                                    | Observed          | Match? |
| ----------- | ------------------------------------------- | ----------------- | ------ |
| HTTP status | HTTP 400 Bad Request...                     | See details below | No     |
| UI/State    | Error indicates password must contain at... | See details below | No     |
| UI/State    | `[UI]` Inline error on Password field...    | See details below | Yes    |
| UI/State    | No new user created in DB...                | See details below | No     |

- **Status:** FAIL
- **Observed Details:** `[Automated]` API returned HTTP 200 (expected 400). `[Manual UI]` UI correctly blocked and showed inline error.
- **Bug Created:**
- **Evidence:** Script output + UI review

### FR01-EP-015 — Verify user registration rejects password containing a special character outside the allowed set `@$!%*?&`

**Channel:** UI + API

| Point       | Expected                                    | Observed          | Match? |
| ----------- | ------------------------------------------- | ----------------- | ------ |
| HTTP status | HTTP 400 Bad Request...                     | See details below | No     |
| UI/State    | Error indicates password must use only a... | See details below | No     |
| UI/State    | `[UI]` Inline error on Password field...    | See details below | Yes    |
| UI/State    | No new user created in DB...                | See details below | No     |

- **Status:** FAIL
- **Observed Details:** `[Automated]` API returned HTTP 200 (expected 400). `[Manual UI]` UI correctly blocked and showed inline error.
- **Bug Created:**
- **Evidence:** Script output + UI review

### FR01-EP-016 — Verify user registration rejects submission when the password field is empty

**Channel:** UI + API

| Point       | Expected                                    | Observed          | Match? |
| ----------- | ------------------------------------------- | ----------------- | ------ |
| HTTP status | HTTP 400 Bad Request...                     | See details below | No     |
| UI/State    | Error indicates password is required (pe... | See details below | No     |
| UI/State    | `[UI]` Inline error on Password field...    | See details below | No     |
| UI/State    | No new user created in DB...                | See details below | No     |

- **Status:** FAIL
- **Observed Details:** `[Automated]` API returned HTTP 200 (expected 400). `[Manual UI]` Relies on native HTML5 tooltip instead of inline error.
- **Bug Created:**
- **Evidence:** Script output + UI review

### FR01-EP-017 — Verify registration API rejects request with password field absent from JSON body

**Channel:** API

| Point         | Expected                                    | Observed          | Match? |
| ------------- | ------------------------------------------- | ----------------- | ------ |
| HTTP status   | HTTP 400 Bad Request...                     | See details below | No     |
| Response body | Response body indicates password is requ... | See details below | No     |
| UI/State      | No new user created in DB...                | See details below | No     |

- **Status:** FAIL
- **Observed Details:** `[Automated]` API returned HTTP 200 (expected 400).
- **Bug Created:**
- **Evidence:** Script output + UI review

### FR01-EP-018 — Verify user registration rejects submission when confirm password does not match password

**Channel:** UI

| Point       | Expected                                      | Observed          | Match? |
| ----------- | --------------------------------------------- | ----------------- | ------ |
| HTTP status | Registration is rejected — form is not s...   | See details below | No     |
| UI/State    | `[UI]` Inline error on Confirm Password fi... | See details below | No     |
| UI/State    | User remains on the registration page...      | See details below | No     |
| UI/State    | No new user created in DB...                  | See details below | No     |

- **Status:** FAIL
- **Observed Details:** `[Manual UI]` Confirm Password input field is entirely missing from the UI.
- **Bug Created:**
- **Evidence:** Script output + UI review

### FR01-EP-019 — Verify user registration rejects submission when the confirm password field is empty

**Channel:** UI

| Point    | Expected                                      | Observed          | Match? |
| -------- | --------------------------------------------- | ----------------- | ------ |
| UI/State | Registration is rejected (per FR-01, BR-...   | See details below | No     |
| UI/State | `[UI]` Inline error on Confirm Password fi... | See details below | No     |
| UI/State | No new user created in DB...                  | See details below | No     |

- **Status:** FAIL
- **Observed Details:** `[Manual UI]` Confirm Password input field is entirely missing from the UI.
- **Bug Created:**
- **Evidence:** Script output + UI review

### FR01-EP-020 — Verify registration accepts name containing XSS payload and renders it safely on UI without script execution

**Channel:** UI + DOM + State

| Point       | Expected                                      | Observed          | Match? |
| ----------- | --------------------------------------------- | ----------------- | ------ |
| HTTP status | HTTP 200 — registration accepted; name i...   | See details below | Yes    |
| UI/State    | `[UI]` No JavaScript `alert()` dialog appe... | See details below | Yes    |
| UI/State    | [DOM] Name rendered as escaped HTML: `&l...   | See details below | Yes    |
| UI/State    | `[State]` User record with raw name value ... | See details below | Yes    |
| UI/State    | `[State]` Password stored as bcrypt hash, ... | See details below | No     |

- **Status:** FAIL
- **Observed Details:** `[Automated]` DB password stored as plaintext. `[DOM]` XSS payload escaped and not executed.
- **Bug Created:**
- **Evidence:** Script output + UI review

### FR01-BVA-001 — Verify user registration rejects password at absolute minimum length (0 chars — empty string)

**Channel:** API

| Point         | Expected                                    | Observed          | Match? |
| ------------- | ------------------------------------------- | ----------------- | ------ |
| HTTP status   | HTTP 400 Bad Request...                     | See details below | No     |
| Response body | Response body indicates password is requ... | See details below | No     |
| UI/State      | No new user created in DB...                | See details below | No     |

- **Status:** FAIL
- **Observed Details:** `[Automated]` API returned HTTP 200 (expected 400).
- **Bug Created:**
- **Evidence:** Script output + UI review

### FR01-BVA-002 — Verify user registration rejects password of exactly 7 characters, one below the minimum required length of 8

**Channel:** UI + API

| Point       | Expected                                    | Observed          | Match? |
| ----------- | ------------------------------------------- | ----------------- | ------ |
| HTTP status | HTTP 400 Bad Request...                     | See details below | No     |
| UI/State    | Error indicates password must be at leas... | See details below | No     |
| UI/State    | `[UI]` Inline error on Password field...    | See details below | Yes    |
| UI/State    | No new user created in DB...                | See details below | No     |

- **Status:** FAIL
- **Observed Details:** `[Automated]` API returned HTTP 200 (expected 400). `[Manual UI]` UI correctly blocked and showed inline error.
- **Bug Created:**
- **Evidence:** Script output + UI review

### FR01-BVA-003 — Verify user registration accepts password of exactly 8 characters at the lower boundary

**Channel:** UI + API + State

| Point         | Expected                                      | Observed          | Match? |
| ------------- | --------------------------------------------- | ----------------- | ------ |
| HTTP status   | HTTP 200 OK...                                | See details below | Yes    |
| Response body | Response body: `{"message": "User regist...   | See details below | Yes    |
| UI/State      | `[UI]` Redirects to Login page (per FR-01,... | See details below | No     |
| UI/State      | `[State]` New user record created in DB...    | See details below | Yes    |
| UI/State      | `[State]` Password stored as bcrypt hash, ... | See details below | No     |

- **Status:** FAIL
- **Observed Details:** `[Automated]` DB password stored as plaintext `Test@123`. `[Manual UI]` Rejected valid password (requires space).
- **Bug Created:**
- **Evidence:** Script output + UI review

### FR01-BVA-004 — Verify user registration accepts password of 9 characters, one above the lower boundary

**Channel:** API + State

| Point         | Expected                                      | Observed          | Match? |
| ------------- | --------------------------------------------- | ----------------- | ------ |
| HTTP status   | HTTP 200 OK...                                | See details below | Yes    |
| Response body | Response: `{"message": "User registered ...   | See details below | Yes    |
| UI/State      | `[State]` User created in DB...               | See details below | Yes    |
| UI/State      | `[State]` Password stored as bcrypt hash, ... | See details below | No     |

- **Status:** FAIL
- **Observed Details:** `[Automated]` DB password stored as plaintext `Test@1234`.
- **Bug Created:**
- **Evidence:** Script output + UI review

### FR01-BVA-005 — Verify user registration accepts password of 15 characters at nominal length

**Channel:** API + State

| Point         | Expected                                      | Observed          | Match? |
| ------------- | --------------------------------------------- | ----------------- | ------ |
| HTTP status   | HTTP 200 OK...                                | See details below | Yes    |
| Response body | Response: `{"message": "User registered ...   | See details below | Yes    |
| UI/State      | `[State]` User created in DB...               | See details below | Yes    |
| UI/State      | `[State]` Password stored as bcrypt hash, ... | See details below | No     |

- **Status:** FAIL
- **Observed Details:** `[Automated]` DB password stored as plaintext `TestPassw0rd!Ab`.
- **Bug Created:**
- **Evidence:** Script output + UI review

### FR01-BVA-006 — Verify system behavior when password reaches absolute maximum length of 300 characters

**Channel:** API

| Point       | Expected                                    | Observed          | Match? |
| ----------- | ------------------------------------------- | ----------------- | ------ |
| HTTP status | Expected: HTTP 400 or HTTP 500 — system ... | See details below | No     |
| HTTP status | If HTTP 200 is returned: Flag as defect ... | See details below | No     |
| UI/State    | No user created in DB (expected)...         | See details below | No     |

- **Status:** FAIL
- **Observed Details:** `[Automated]` API returned HTTP 200 (expected 400/500).
- **Bug Created:**
- **Evidence:** Script output + UI review

### FR01-BVA-007 — Verify user registration rejects name at absolute minimum length (0 chars — empty string)

**Channel:** API

| Point       | Expected                                    | Observed          | Match? |
| ----------- | ------------------------------------------- | ----------------- | ------ |
| HTTP status | HTTP 400 Bad Request...                     | See details below | No     |
| UI/State    | Error indicates name is required (per FR... | See details below | No     |
| UI/State    | No new user created in DB...                | See details below | No     |

- **Status:** FAIL
- **Observed Details:** `[Automated]` API returned HTTP 200 (expected 400).
- **Bug Created:**
- **Evidence:** Script output + UI review

### FR01-BVA-008 — Verify user registration accepts name of exactly 1 character at the lower boundary

**Channel:** API + State

| Point         | Expected                                      | Observed          | Match? |
| ------------- | --------------------------------------------- | ----------------- | ------ |
| HTTP status   | HTTP 200 OK...                                | See details below | Yes    |
| Response body | Response: `{"message": "User registered ...   | See details below | Yes    |
| UI/State      | `[State]` User created in DB with name "A"... | See details below | Yes    |
| UI/State      | `[State]` Password stored as bcrypt hash, ... | See details below | No     |

- **Status:** FAIL
- **Observed Details:** `[Automated]` DB password stored as plaintext.
- **Bug Created:**
- **Evidence:** Script output + UI review

### FR01-BVA-009 — Verify user registration accepts name of 2 characters, one above the lower boundary

**Channel:** API + State

| Point       | Expected                                      | Observed          | Match? |
| ----------- | --------------------------------------------- | ----------------- | ------ |
| HTTP status | HTTP 200 OK (per FR-01, BR-01)...             | See details below | Yes    |
| UI/State    | `[State]` User created in DB...               | See details below | Yes    |
| UI/State    | `[State]` Password stored as bcrypt hash, ... | See details below | No     |

- **Status:** FAIL
- **Observed Details:** `[Automated]` DB password stored as plaintext.
- **Bug Created:**
- **Evidence:** Script output + UI review

### FR01-BVA-010 — Verify user registration accepts name of 12 characters at nominal length

**Channel:** API + State

| Point       | Expected                                      | Observed          | Match? |
| ----------- | --------------------------------------------- | ----------------- | ------ |
| HTTP status | HTTP 200 OK (per FR-01)...                    | See details below | Yes    |
| UI/State    | `[State]` User created in DB...               | See details below | Yes    |
| UI/State    | `[State]` Password stored as bcrypt hash, ... | See details below | No     |

- **Status:** FAIL
- **Observed Details:** `[Automated]` DB password stored as plaintext.
- **Bug Created:**
- **Evidence:** Script output + UI review

### FR01-BVA-011 — Verify user registration accepts name of 254 characters, one below the assumed DB VARCHAR upper limit

**Channel:** API + State

| Point       | Expected                                      | Observed          | Match? |
| ----------- | --------------------------------------------- | ----------------- | ------ |
| HTTP status | HTTP 200 OK (per FR-01; within assumed D...   | See details below | Yes    |
| UI/State    | `[State]` User record created with full 25... | See details below | Yes    |
| UI/State    | `[State]` Password stored as bcrypt hash, ... | See details below | No     |

- **Status:** FAIL
- **Observed Details:** `[Automated]` DB password stored as plaintext.
- **Bug Created:**
- **Evidence:** Script output + UI review

### FR01-BVA-012 — Verify user registration accepts name of 255 characters at the assumed DB VARCHAR upper boundary

**Channel:** API + State

| Point       | Expected                                      | Observed          | Match? |
| ----------- | --------------------------------------------- | ----------------- | ------ |
| HTTP status | HTTP 200 OK (at assumed DB VARCHAR limit...   | See details below | Yes    |
| UI/State    | `[State]` User created with full 255-char ... | See details below | Yes    |
| UI/State    | `[State]` Password stored as bcrypt hash, ... | See details below | No     |

- **Status:** FAIL
- **Observed Details:** `[Automated]` DB password stored as plaintext.
- **Bug Created:**
- **Evidence:** Script output + UI review

### FR01-BVA-013 — Verify system behavior when name exceeds the assumed DB VARCHAR limit by 1 character

**Channel:** API

| Point       | Expected                                    | Observed          | Match? |
| ----------- | ------------------------------------------- | ----------------- | ------ |
| HTTP status | Expected: HTTP 400 or HTTP 500 — system ... | See details below | No     |
| HTTP status | If HTTP 200 + name silently truncated to... | See details below | No     |
| UI/State    | No valid user created with silently trun... | See details below | No     |

- **Status:** FAIL
- **Observed Details:** `[Automated]` API returned HTTP 200 (expected 400/500).
- **Bug Created:**
- **Evidence:** Script output + UI review

### FR01-BVA-014 — Verify system behavior when name reaches absolute system maximum of 500 characters

**Channel:** API

| Point       | Expected                                    | Observed          | Match? |
| ----------- | ------------------------------------------- | ----------------- | ------ |
| HTTP status | HTTP 400 or HTTP 500 — system rejects or... | See details below | No     |
| UI/State    | No new user created in DB...                | See details below | No     |

- **Status:** FAIL
- **Observed Details:** `[Automated]` API returned HTTP 200 (expected 400/500).
- **Bug Created:**
- **Evidence:** Script output + UI review

### FR01-BVA-015 — Verify user registration accepts email of 16 characters at nominal length

**Channel:** API + State

| Point       | Expected                                      | Observed          | Match? |
| ----------- | --------------------------------------------- | ----------------- | ------ |
| HTTP status | HTTP 200 OK (per FR-01)...                    | See details below | Yes    |
| UI/State    | `[State]` User created in DB...               | See details below | Yes    |
| UI/State    | `[State]` Password stored as bcrypt hash, ... | See details below | No     |

- **Status:** FAIL
- **Observed Details:** `[Automated]` DB password stored as plaintext.
- **Bug Created:**
- **Evidence:** Script output + UI review

### FR01-BVA-016 — Verify user registration accepts email of 255 characters at the assumed DB VARCHAR upper boundary

**Channel:** API + State

| Point       | Expected                                      | Observed          | Match? |
| ----------- | --------------------------------------------- | ----------------- | ------ |
| HTTP status | HTTP 200 OK (at assumed DB VARCHAR bound...   | See details below | Yes    |
| UI/State    | `[State]` User created with full 255-char ... | See details below | Yes    |
| UI/State    | `[State]` Password stored as bcrypt hash, ... | See details below | No     |

- **Status:** FAIL
- **Observed Details:** `[Automated]` DB password stored as plaintext.
- **Bug Created:**
- **Evidence:** Script output + UI review

### FR01-BVA-017 — Verify system behavior when email exceeds the assumed DB VARCHAR limit by 1 character

**Channel:** API

| Point       | Expected                                    | Observed          | Match? |
| ----------- | ------------------------------------------- | ----------------- | ------ |
| HTTP status | Expected: HTTP 400 or HTTP 500 — system ... | See details below | No     |
| HTTP status | If HTTP 200 + silent truncation: Flag as... | See details below | No     |
| UI/State    | No valid user created...                    | See details below | No     |

- **Status:** FAIL
- **Observed Details:** `[Automated]` API returned HTTP 200 (expected 400/500).
- **Bug Created:**
- **Evidence:** Script output + UI review

### FR01-BVA-018 — Verify system behavior when email reaches absolute system maximum of 300 characters

**Channel:** API

| Point       | Expected                                    | Observed          | Match? |
| ----------- | ------------------------------------------- | ----------------- | ------ |
| HTTP status | HTTP 400 or HTTP 500 — system rejects or... | See details below | No     |
| UI/State    | No new user created in DB...                | See details below | No     |

- **Status:** FAIL
- **Observed Details:** `[Automated]` API returned HTTP 200 (expected 400/500).
- **Bug Created:**
- **Evidence:** Script output + UI review

## Execution Summary

| Metric     | Value   |
| ---------- | ------- |
| Total TCs  | 38      |
| Executed   | 38      |
| Passed     | 0       |
| Failed     | 38      |
| Blocked    | 0       |
| Skipped    | 0       |
| Pass Rate  | 0%      |
| Bugs Found | Pending |
