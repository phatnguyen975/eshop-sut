# Example: Error Guessing — User Registration API

## Scenario

**Feature:** REST API endpoint — User Registration  
**Endpoint:** `POST /api/v1/users/register`  
**Business Rules:**

- **BR-001:** Request body must include: `username` (string), `email` (string), `password` (string), `date_of_birth` (string, ISO 8601 format)
- **BR-002:** Username: 5–20 characters, alphanumeric and underscore only
- **BR-003:** Email must be a valid email format and unique in the system
- **BR-004:** Password: 8–30 characters, at least 1 uppercase, 1 lowercase, 1 digit, 1 special character
- **BR-005:** User must be at least 18 years old (based on date_of_birth)
- **BR-006:** On success: HTTP 201, user record created, welcome email sent
- **BR-007:** On validation failure: HTTP 400 with error code and message
- **BR-008:** On duplicate email: HTTP 409 with error code DUPLICATE_EMAIL

**Technology context:** RESTful API, JSON payloads, PostgreSQL database, Node.js backend

## Step 1 — Review Existing Systematic Test Suite

The systematic test suite (EP/BVA applied to all 4 fields) already covers:

**Username (BR-002):**

- **EC-01:** Valid (5–20 chars, alphanumeric+underscore) — nominal, LB=5, UB=20
- **EC-02:** Too short (LB−1=4)
- **EC-03:** Too long (UB+1=21)
- **EC-04:** Invalid chars (space, special chars excl. underscore)
- **EC-05:** Empty

**Email (BR-003):**

- **EC-06:** Valid format, unique in system
- **EC-07:** Invalid format (no @, no domain, etc.)
- **EC-08:** Duplicate email (HTTP 409)
- **EC-09:** Empty

**Password (BR-004):**

- **EC-10:** Valid (8–30 chars, all character classes present) — nominal, LB=8, UB=30
- **EC-11:** Too short (7 chars)
- **EC-12:** Too long (31 chars)
- **EC-13:** Missing uppercase
- **EC-14:** Missing lowercase
- **EC-15:** Missing digit
- **EC-16:** Missing special character
- **EC-17:** Empty

**Date of birth (BR-005):**

- **EC-18:** Valid (≥18 years ago)
- **EC-19:** Under 18 (LB−1 = yesterday of 18th birthday)
- **EC-20:** Exact 18th birthday today
- **EC-21:** Invalid date format (not ISO 8601)
- **EC-22:** Empty

**Gap summary — what the systematic suite does NOT cover:**

- Implementation-level limits not in the BR (DB constraints, JSON parsing limits)
- Special string values within valid classes
- API-level attack patterns (injection, unexpected fields)
- Concurrency scenarios (two simultaneous registrations with same email)
- Partial/malformed request body scenarios
- HTTP-level edge cases (wrong Content-Type, missing body)
- Date-specific edge cases (leap day, timezone interpretation)

## Step 2 — Gather Error Guessing Inputs

**Technology stack knowledge:**

- **Node.js:** JSON parsing has no default payload size limit unless explicitly configured — large payloads may exhaust server memory
- **PostgreSQL:** `VARCHAR` fields have explicit limits; JSON parsing in Node may throw before reaching DB
- Email validation libraries frequently have non-obvious edge cases (+ in local part, IP address domains, very long domains)
- Password validation regex is complex — character class intersection errors are common

**Historical defect data (from team's past projects):**

- "Same email concurrent registration" bug reported in 2 prior projects — race condition between uniqueness check and INSERT
- "Email with '+' rejected" — overly strict regex previously blocked valid RFC 5321 addresses
- "date_of_birth timezone" — age calculation wrong for users in UTC+ timezones registering near midnight

**Developer input (from brief interview):**

- "The JSON body size is not explicitly limited — we're relying on the framework default, not sure what it is"
- "The uniqueness check and insert are not in a transaction with SERIALIZABLE isolation — concurrent requests could both pass the check"
- "date_of_birth is parsed as a date string — not sure how the library handles timezone-aware ISO strings vs. date-only strings"

## Step 3 — Generate the Fault List

Working through error taxonomy categories:

### High Priority Hypotheses

| ID    | Category            | Hypothesis                                                                                                                                                                                                              | Rationale                                                                                                   | Risk |
| ----- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ---- |
| FH-01 | 1.2 Special Strings | Email with `+` in local part (e.g., `user+tag@domain.com`) may be incorrectly rejected — this is a valid RFC 5321 address                                                                                               | Seen in 2 prior projects; overly strict regex pattern; commonly missed                                      | H    |
| FH-02 | 4.3 Concurrency     | Two simultaneous POST requests with same email may both receive HTTP 201 — uniqueness check passes for both before either commits                                                                                       | Reported by developer: no SERIALIZABLE isolation; race condition; seen in prior projects                    | H    |
| FH-03 | 1.4 Special Dates   | `date_of_birth` as timezone-aware ISO string (e.g., `"1990-01-15T00:00:00+05:30"`) may be interpreted as UTC, shifting the date and causing wrong age calculation                                                       | Developer uncertain about timezone handling; age boundary errors are high impact (underage user registered) | H    |
| FH-04 | 5.1 API Contract    | Request with no `Content-Type: application/json` header may be accepted or produce an unexpected error (not HTTP 400)                                                                                                   | API contract behavior without required header not in BRs; varies by framework                               | H    |
| FH-05 | 5.1 API Contract    | Request body that is valid JSON but not an object (e.g., `[]`, `"string"`, `123`) may cause a 500 internal error instead of HTTP 400                                                                                    | JSON parsing succeeds but type validation missing; common Node.js pattern                                   | H    |
| FH-06 | 1.2 Special Strings | Password containing only the special characters from the allowed set (e.g., `@@@@@@@@`) satisfies "has special char" but missing uppercase, lowercase, digit — regex may evaluate character class checks in wrong order | Complex multi-condition regex; character class intersection errors common                                   | H    |

### Medium Priority Hypotheses

| ID    | Category             | Hypothesis                                                                                                                                                        | Rationale                                                                        | Risk |
| ----- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ---- |
| FH-07 | 2.1 Technical Limits | Very large JSON payload (e.g., username = 10,000 chars) may cause 500 or crash instead of HTTP 400                                                                | Developer noted no explicit size limit; Node.js framework default unknown        | M    |
| FH-08 | 1.2 Special Strings  | Username with leading/trailing spaces (e.g., `" john "`) may be stored with spaces, creating different usernames than intended                                    | Trimming often applied inconsistently; affects login matching                    | M    |
| FH-09 | 5.1 API Contract     | Unknown/extra fields in request body (e.g., `"role": "admin"`) may be accepted and stored — mass assignment vulnerability                                         | Common Node.js ORM risk if model does not whitelist fields                       | M    |
| FH-10 | 1.4 Special Dates    | `date_of_birth = "2000-02-29"` (leap day) submitted in a non-leap year context or date arithmetic across leap years                                               | Leap day boundary; date arithmetic known error-prone                             | M    |
| FH-11 | 1.2 Special Strings  | Email with very long local part or domain (e.g., 255+ char local part) may exceed DB column limit and produce 500 instead of 400                                  | DB VARCHAR limit vs. email spec limit may differ; no explicit length check in BR | M    |
| FH-12 | 5.4 Database         | Submitting a `null` value for a required field (e.g., `{"username": null, "email": "...", ...}`) vs. omitting the field entirely — may produce different behavior | JSON null vs. missing field distinction; some validators treat differently       | M    |
| FH-13 | 4.2 Sequence         | Registering with an email address that was previously registered and then deleted (if deletion is possible) — uniqueness check may still reject it                | Soft delete vs. hard delete implications; depends on implementation              | M    |

### Low Priority Hypotheses (Documented, Not Tested)

| ID    | Hypothesis                                                                                                                            | Rationale                                                          |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| FH-14 | HTTP GET instead of POST to the endpoint — should return HTTP 405 Method Not Allowed                                                  | Standard API behavior; low risk of defect                          |
| FH-15 | Empty JSON body `{}` — should return HTTP 400 with field-level errors                                                                 | Partially covered by empty field tests; low additional risk        |
| FH-16 | Unicode username (e.g., Cyrillic, CJK characters) — BR-002 says alphanumeric only; regex may incorrectly allow Unicode "alphanumeric" | Low probability; alphanumeric regex usually handles this correctly |

## Step 4 — Prioritization Summary

| Priority | Count | Hypotheses                  |
| -------- | ----- | --------------------------- |
| High     | 6     | FH-01 to FH-06              |
| Medium   | 7     | FH-07 to FH-13              |
| Low      | 3     | FH-14 to FH-16 (not tested) |

Test cases designed for: **High (6) + Medium (7) = 13 hypotheses**

## Step 5 — Test Case Suite

### High Priority Test Cases

| TC ID    | Description                                                       | Fault Hypothesis                   | Category            | Priority | Input Value(s)                                                                                                                                                               | Expected Output                                                                                                     |
| -------- | ----------------------------------------------------------------- | ---------------------------------- | ------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| TC-EG-01 | Valid email with + in local part should be accepted               | FH-01: Email with + rejected       | 1.2 Special Strings | H        | `username="john_doe"`<br>`email="john+tag@domain.com"`<br>`password="Secret@1"`<br>`date_of_birth="1990-06-15"`                                                              | HTTP 201; user created with email stored as `john+tag@domain.com`                                                   |
| TC-EG-02 | Concurrent duplicate email — only first should succeed            | FH-02: Race condition duplicate    | 4.3 Concurrency     | H        | Two simultaneous POST requests, both with `email="concurrent@test.com"` and otherwise valid fields                                                                           | First request: HTTP 201. Second request: HTTP 409 with DUPLICATE_EMAIL. No duplicate records in DB.                 |
| TC-EG-03 | Timezone-aware date_of_birth — age calculated correctly           | FH-03: Timezone date parsing       | 1.4 Special Dates   | H        | `username="john_doe"`<br>`email="tz@test.com"`<br>`password="Secret@1"`<br>`date_of_birth="2006-06-15T00:00:00+05:30"` (user is exactly 18 in their timezone but <18 in UTC) | HTTP 400; system must not accept if local age < 18; or HTTP 201 if system correctly uses date-only portion per spec |
| TC-EG-04 | Missing Content-Type header — should return 400 not 500           | FH-04: Missing Content-Type        | 5.1 API Contract    | H        | POST request without `Content-Type: application/json` header; body: `{"username":"john_doe","email":"valid@test.com","password":"Secret@1","date_of_birth":"1990-06-15"}`    | HTTP 400 or HTTP 415 Unsupported Media Type — not HTTP 500                                                          |
| TC-EG-05 | JSON array body — should return 400 not 500                       | FH-05: Non-object JSON body        | 5.1 API Contract    | H        | POST with `Content-Type: application/json`, body: `[]`                                                                                                                       | HTTP 400 with clear error message; not HTTP 500 Internal Server Error                                               |
| TC-EG-06 | Password of only special chars — fails character class validation | FH-06: Password regex intersection | 1.2 Special Strings | H        | `username="john_doe"`<br>`email="valid6@test.com"`<br>`password="@@@@@@@@"`<br>`date_of_birth="1990-06-15"`                                                                  | HTTP 400; password must contain uppercase, lowercase, and digit — not just special chars                            |

### Medium Priority Test Cases

| TC ID    | Description                                | Fault Hypothesis                | Category             | Priority | Input Value(s)                                                                                                                                   | Expected Output                                                                                                                                                              |
| -------- | ------------------------------------------ | ------------------------------- | -------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TC-EG-07 | Oversized JSON payload                     | FH-07: Large payload causes 500 | 2.1 Technical Limits | M        | `username` field = 10,000 character string; all other fields valid                                                                               | HTTP 400 or HTTP 413 Payload Too Large — not HTTP 500; no server crash                                                                                                       |
| TC-EG-08 | Username with trailing space               | FH-08: Spaces not trimmed       | 1.2 Special Strings  | M        | `username="john_doe "` (trailing space)<br>`email="valid8@test.com"`<br>`password="Secret@1"`<br>`date_of_birth="1990-06-15"`                    | HTTP 400 — username invalid (contains space, violates BR-002); OR HTTP 201 with username trimmed to "john_doe" (documented trimming behavior) — NOT stored as "john_doe "    |
| TC-EG-09 | Extra field "role" in request body         | FH-09: Mass assignment          | 5.1 API Contract     | M        | `username="john_doe"`<br>`email="valid9@test.com"`<br>`password="Secret@1"`<br>`date_of_birth="1990-06-15"`<br>`role="admin"`                    | HTTP 201 — user created; `role` field ignored; user NOT created with admin role in DB                                                                                        |
| TC-EG-10 | Leap day date_of_birth                     | FH-10: Leap day arithmetic      | 1.4 Special Dates    | M        | `username="john_doe"`<br>`email="valid10@test.com"`<br>`password="Secret@1"`<br>`date_of_birth="2000-02-29"`                                     | HTTP 201 — valid date (2000 was a leap year, user ≥ 18); record stored with correct date                                                                                     |
| TC-EG-11 | Extremely long email (300 chars)           | FH-11: Email length vs DB limit | 1.2 Special Strings  | M        | `username="john_doe"`<br>`email="[255-char local part]@domain.com"` (total > 300 chars)<br>`password="Secret@1"`<br>`date_of_birth="1990-06-15"` | HTTP 400 with validation error — not HTTP 500 from DB constraint violation                                                                                                   |
| TC-EG-12 | Explicit null for required field           | FH-12: JSON null vs. missing    | 5.4 Database         | M        | `username=null`<br>`email="valid12@test.com"`<br>`password="Secret@1"`<br>`date_of_birth="1990-06-15"`                                           | HTTP 400 with error message indicating username is required — not HTTP 500                                                                                                   |
| TC-EG-13 | Registration with previously deleted email | FH-13: Soft delete reuse        | 4.2 Sequence         | M        | Prerequisite: register with `email="deleted@test.com"`, then delete account. Then re-register with same email.                                   | HTTP 201 — deleted email address can be reused (if hard delete); or HTTP 409 if soft delete retains uniqueness constraint. Behavior must be consistent with deletion policy. |

## Step 6 — Review Against Quality Checklists

### Process Quality Checklist

- [x] Systematic techniques (EP/BVA across all 4 fields) applied first; this suite supplements them.
- [x] Existing test suite reviewed — gap analysis documented in Step 1.
- [x] Error taxonomy consulted — all 8 major categories evaluated.
- [x] Historical defect data consulted — 3 prior defect patterns incorporated (FH-01, FH-02, FH-03).
- [x] Developer knowledge consulted — 3 implementation risks identified (FH-02, FH-03, FH-07).
- [x] Every hypothesis has documented rationale.
- [x] All hypotheses prioritized before test case design.
- [x] All High priority hypotheses have test cases.
- [x] Each test case targets exactly one hypothesis.

### Test Case Quality Checklist

- [x] All 13 test cases have specific, verifiable expected results.
- [x] TC-EG-02 (concurrency) includes expected DB state verification — not just HTTP response.
- [x] TC-EG-03 (timezone) documents the ambiguity and expected behavior per each interpretation — raised as spec gap.
- [x] TC-EG-08 (trailing space) documents two acceptable expected results with constraint: must not store with space.
- [x] No test case duplicates systematic coverage (systematic suite covers empty, out-of-range, wrong-format).
- [x] TC-EG-09 (mass assignment) includes DB-level verification — HTTP 201 alone is insufficient.
- [x] Low priority items FH-14, FH-15, FH-16 documented as acknowledged risks.

## Coverage Summary

| Category             | Hypotheses Generated       | Test Cases Designed                    | Priority Distribution |
| -------------------- | -------------------------- | -------------------------------------- | --------------------- |
| 1.2 Special Strings  | FH-01, FH-06, FH-08, FH-11 | TC-EG-01, TC-EG-06, TC-EG-08, TC-EG-11 | H, H, M, M            |
| 1.4 Special Dates    | FH-03, FH-10               | TC-EG-03, TC-EG-10                     | H, M                  |
| 2.1 Technical Limits | FH-07                      | TC-EG-07                               | M                     |
| 4.2 Sequence         | FH-13                      | TC-EG-13                               | M                     |
| 4.3 Concurrency      | FH-02                      | TC-EG-02                               | H                     |
| 5.1 API Contract     | FH-04, FH-05, FH-09        | TC-EG-04, TC-EG-05, TC-EG-09           | H, H, M               |
| 5.4 Database         | FH-12                      | TC-EG-12                               | M                     |
| Low / not tested     | FH-14, FH-15, FH-16        | —                                      | L                     |

**Total fault hypotheses:** 16  
**Test cases designed:** 13 (6 High + 7 Medium)  
**Acknowledged risks (not tested):** 3 Low priority items  
**Spec gap raised:** TC-EG-03 (timezone interpretation for date_of_birth) — requires clarification from product owner before execution: should the system use the date-only portion or respect timezone offset when calculating age?
