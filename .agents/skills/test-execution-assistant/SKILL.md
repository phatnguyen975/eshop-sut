---
name: test-execution-assistant
description: >
  Generate a complete, ready-to-run execution package for each FR. Produces a
  single bash script covering all scriptable TCs (API, Role-Auth, State, DB
  verification via sqlite3, Teardown) with automatic PASS/FAIL detection and a
  final summary table, plus a single JS file for all DOM checks. The human runs
  the scripts, records UI-only results manually, then feeds terminal output back
  for Phase B — which updates BOTH the execution-results file AND the test-cases
  file (Observed Result and Status rows). Only run after test-case-reviewer
  has returned APPROVED.
trigger:
  - "generate execution scripts"
  - "execute test cases"
  - "start execution"
  - "help me test"
  - "run TC"
output:
  - scripts/curl/FR{nn}-api-tests.sh
  - scripts/curl/FR{nn}-dom-checks.js
  - qa-artifacts/execution-results/FR{nn}-execution-results.md
  - qa-artifacts/test-cases/FR{nn}-test-cases.md  ← Observed Result + Status updated (Phase B)
---

# Skill: test-execution-assistant

## 1. Purpose

This skill operates in two phases:

- **Phase A — Generate:** Produce all execution artifacts. The agent writes scripts; the human executes them.
- **Phase B — Record:** The human feeds back terminal output and manual UI notes. The agent updates **two files simultaneously**:
  1. `qa-artifacts/execution-results/FR{nn}-execution-results.md` — full execution log
  2. `qa-artifacts/test-cases/FR{nn}-test-cases.md` — Observed Result and Status rows for each TC

**Design principles:**

- **Maximize automation:** Use scripts for everything scriptable (API, DB checks, teardown).
- Use `sqlite3` CLI directly for DB state verification and teardown — faster and more reliable than going through the Admin API.
- Screenshots are NOT required per TC. One screen recording per FR uploaded to YouTube is sufficient execution evidence. JSON files saved by the script are API evidence.
- **DOM screenshots:** one per FR (entire console output panel).

## 2. SUT Database Information

The EShop SUT uses **SQLite**. The database file is located at:

```
eshop-sut/backend/database.sqlite
```

Always use this path when running `sqlite3` commands. Confirm the path exists:

```bash
ls backend/database.sqlite # relative to eshop-sut/ root
```

**Key tables (from SUT source analysis):**

| Table      | Key columns                                         | Used for            |
| ---------- | --------------------------------------------------- | ------------------- |
| `users`    | `id`, `email`, `password`, `name`, `role`           | FR-01, FR-03, FR-19 |
| `products` | `id`, `name`, `price`, `category_id`                | FR-05, FR-06, FR-15 |
| `orders`   | `id`, `user_id`, `status`, `total_amount`           | FR-08, FR-10, FR-11 |
| `coupons`  | `id`, `code`, `type`, `discount_value`, `is_active` | FR-09, FR-17        |

**SQLite helper commands for scripts:**

You must check the `backend/database.js` for more information to generate all exact scripts. Below are some helper scripts that may be need.

```bash
# Set DB path as variable at top of every script
DB="backend/database.sqlite"

# Check a user row exists
sqlite3 "$DB" "SELECT id, email, name FROM users WHERE email='test@example.com';"

# Check password is hashed (must NOT be plaintext)
sqlite3 "$DB" "SELECT password FROM users WHERE email='test@example.com';" | grep -q '^\$2' \
  && echo "HASHED (bcrypt)" || echo "POSSIBLE PLAINTEXT — FAIL"

# Check a coupon exists
sqlite3 "$DB" "SELECT id, code, type, discount_value, is_active FROM coupons WHERE code='SAVE10';"

# Delete a test user (teardown)
sqlite3 "$DB" "DELETE FROM users WHERE email='ep001@test.com';"

# Delete a test coupon (teardown)
sqlite3 "$DB" "DELETE FROM coupons WHERE code='TESTCODE';"
```

## 3. TC Classification (Do This First)

Before generating any script, read ALL TCs from the test-cases `qa-artifacts/test-cases/FRxx-test-cases.md` file and classify each:

| Category           | Definition                                 | Script coverage                                |
| ------------------ | ------------------------------------------ | ---------------------------------------------- |
| **SCRIPT-FULL**    | Channel: API, Role-Auth, State, or DB only | 100% automated via bash script                 |
| **SCRIPT-PARTIAL** | Channel: API + UI                          | Script handles API part; human handles UI part |
| **MANUAL**         | Channel: UI only or Mobile UI only         | Human only — no script                         |
| **DOM**            | Channel includes DOM                       | JS script run in DevTools; human pastes output |

Generate and show this classification table to the human BEFORE writing any scripts:

```
TC Classification — FR-{nn}
─────────────────────────────────────────────────────
TC ID          | Channel        | Category       | Script covers
FR{nn}-EP-001  | API + State    | SCRIPT-FULL    | POST + sqlite3 verify + teardown
FR{nn}-EP-002  | UI + API       | SCRIPT-PARTIAL | POST request; human checks error msg
FR{nn}-EP-018  | UI             | MANUAL         | Human only
FR{nn}-EP-020  | UI + DOM + Sta | DOM + PARTIAL  | DOM JS + sqlite3; human checks UI
FR{nn}-BVA-003 | API            | SCRIPT-FULL    | POST request
─────────────────────────────────────────────────────
Total: {n} SCRIPT-FULL, {n} SCRIPT-PARTIAL, {n} MANUAL, {n} DOM
```

Not wait for human confirmation before generating scripts, start generate scripts after showing above table.

**Classification rules by channel:**

- `API` → SCRIPT-FULL
- `API + State` → SCRIPT-FULL (API call + sqlite3 verification + teardown)
- `Role-Auth` → SCRIPT-FULL (3 token states, all automated)
- `UI + API` → SCRIPT-PARTIAL (API call scripted; UI behavior manual)
- `UI` → MANUAL
- `Mobile UI` → MANUAL
- `DOM` → DOM (JS script only; human pastes console output)
- `UI + DOM + State` → DOM + SCRIPT-FULL for State/DB; MANUAL for UI visual

## 4. Phase A — Script Generation

### Deliverable 1: `scripts/curl/FR{nn}-api-tests.sh`

One executable bash script covering ALL SCRIPT-FULL and SCRIPT-PARTIAL TCs, with DB verification and teardown via `sqlite3`.

#### 4.1 Script Skeleton

```bash
#!/usr/bin/env bash
# =============================================================================
# FR-{nn}: {Feature Name} — API & DB Test Suite
# Generated by: test-execution-assistant skill
# Run from: eshop-sut/ root directory
# Usage:    bash scripts/curl/FR{nn}-api-tests.sh
# Evidence: evidence/api-responses/FR{nn}/
# Requires: curl, python3, sqlite3
# =============================================================================

set -uo pipefail

BASE_URL="http://localhost:3000"
DB="backend/database.sqlite"
RESP_DIR="evidence/api-responses/FR{nn}"
mkdir -p "$RESP_DIR"

# Counters and result accumulator
PASS=0; FAIL=0; SKIP=0
declare -a SUMMARY_ROWS=()

# TC Context Variables
CURRENT_TC_ID=""
CURRENT_TC_FAIL=0
CURRENT_TC_DESC=""
CURRENT_TC_EXP=""
CURRENT_TC_ACT=""

# Color codes
GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m';  BOLD='\033[1m';   NC='\033[0m'

# ── Preflight checks ──────────────────────────────────────────────────────────
echo -e "${BOLD}>>> Preflight checks...${NC}"
[[ ! -f "$DB" ]] && echo -e "${RED}ERROR: Database not found at $DB${NC}" && exit 1
curl -sf "$BASE_URL/api/products" > /dev/null \
  || { echo -e "${RED}ERROR: Backend not responding at $BASE_URL${NC}"; exit 1; }
command -v sqlite3 > /dev/null \
  || { echo -e "${RED}ERROR: sqlite3 not installed${NC}"; exit 1; }
echo -e "${GREEN}All systems ready.${NC}\n"

# ── Token Setup ───────────────────────────────────────────────────────────────
echo -e "${BOLD}>>> Acquiring tokens...${NC}"

USER_TOKEN=$(curl -s -X POST "$BASE_URL/api/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@eshop.com","password":"Test1234!"}' \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('token','TOKEN_ERROR'))" 2>/dev/null)

ADMIN_TOKEN=$(curl -s -X POST "$BASE_URL/api/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@eshop.com","password":"Admin123!"}' \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('token','TOKEN_ERROR'))" 2>/dev/null)

[[ "$USER_TOKEN"  == "TOKEN_ERROR" ]] && echo -e "${RED}ERROR: Cannot get user token${NC}"  && exit 1
[[ "$ADMIN_TOKEN" == "TOKEN_ERROR" ]] && echo -e "${RED}ERROR: Cannot get admin token${NC}" && exit 1
echo -e "${GREEN}Tokens acquired.${NC}\n"

# ── Test Data Setup (Cross-FR Dependencies) ───────────────────────────────────
echo -e "${BOLD}>>> Setting up prerequisite test data...${NC}"
# AI INSTRUCTION: If this FR requires data from another FR (e.g., FR-07 Cart needs Products, FR-08 Checkout needs a Cart),
# use the ADMIN_TOKEN to call the creation API here and extract the ID into a bash variable.
# DO NOT USE HARDCODED IDs (like id=1).
# Example:
# TEST_PROD_ID=$(curl -s -X POST "$BASE_URL/api/products" -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" -d '{"name":"AutoTest","price":100,"category_id":1}' | python3 -c "import sys,json; print(json.load(sys.stdin).get('id', ''))")
# [[ -z "$TEST_PROD_ID" ]] && echo -e "${RED}ERROR: Failed to setup test data${NC}" && exit 1

# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

start_tc() {
  CURRENT_TC_ID="$1"
  CURRENT_TC_FAIL=0
  CURRENT_TC_DESC=""
  CURRENT_TC_EXP=""
  CURRENT_TC_ACT=""
}

end_tc() {
  if [[ $CURRENT_TC_FAIL -eq 0 ]]; then
    ((PASS++))
    SUMMARY_ROWS+=("PASS|$CURRENT_TC_ID|$CURRENT_TC_DESC|$CURRENT_TC_EXP|$CURRENT_TC_ACT")
  else
    ((FAIL++))
    SUMMARY_ROWS+=("FAIL|$CURRENT_TC_ID|$CURRENT_TC_DESC|$CURRENT_TC_EXP|$CURRENT_TC_ACT")
  fi
}

# ── run_and_assert ────────────────────────────────────────────────────────────
# Run an HTTP request, save response JSON, check HTTP status, record PASS/FAIL.
# Args: TC_ID  EXPECTED_HTTP  METHOD  ENDPOINT  TOKEN(none|user|admin)  BODY(or "")
run_and_assert() {
  local TC_ID="$1" EXPECTED="$2" METHOD="$3" ENDPOINT="$4" TOKEN="$5"
  local BODY="${6:-}"
  local RESP_FILE="$RESP_DIR/${TC_ID}-response.json"

  local CURL_CMD=(curl -s -o "$RESP_FILE" -w "%{http_code}" -X "$METHOD" "${BASE_URL}${ENDPOINT}" -H "Content-Type: application/json")
  if [[ "$TOKEN" == "user" ]]; then CURL_CMD+=(-H "Authorization: Bearer $USER_TOKEN"); fi
  if [[ "$TOKEN" == "admin" ]]; then CURL_CMD+=(-H "Authorization: Bearer $ADMIN_TOKEN"); fi
  if [[ -n "$BODY" ]]; then CURL_CMD+=(-d "$BODY"); fi

  local ACTUAL
  ACTUAL=$("${CURL_CMD[@]}" 2>/dev/null)

  if [[ $CURRENT_TC_FAIL -eq 0 ]]; then
    CURRENT_TC_DESC="$METHOD $ENDPOINT"
    CURRENT_TC_EXP="HTTP $EXPECTED"
    CURRENT_TC_ACT="HTTP $ACTUAL"
  fi

  local STATUS COLOR
  if [[ "$ACTUAL" == "$EXPECTED" ]]; then
    STATUS="PASS"; COLOR="$GREEN"
  else
    STATUS="FAIL"; COLOR="$RED"
    CURRENT_TC_FAIL=1
    CURRENT_TC_DESC="$METHOD $ENDPOINT"
    CURRENT_TC_EXP="HTTP $EXPECTED"
    CURRENT_TC_ACT="HTTP $ACTUAL"
  fi

  echo -e "${COLOR}[${STATUS}]${NC} ${BOLD}${TC_ID}${NC} — HTTP ${ACTUAL} (expected ${EXPECTED})"
  [[ "$STATUS" == "FAIL" ]] && \
    python3 -m json.tool "$RESP_FILE" 2>/dev/null | sed 's/^/        /' || true
  echo ""
}

# ── assert_json_field ─────────────────────────────────────────────────────────
# Check a field in a saved response JSON file.
# Use EXPECTED="EXISTS" to check key presence only; use EXPECTED="POSITIVE_INT" to
# check the value is an integer > 0.
# Args: TC_ID  RESP_FILE  FIELD  EXPECTED
assert_json_field() {
  local TC_ID="$1" RESP_FILE="$2" FIELD="$3" EXPECTED="$4"
  local ACTUAL STATUS COLOR

  ACTUAL=$(python3 -c "
import json, sys
try:
    d = json.load(open('$RESP_FILE'))
    v = d.get('$FIELD', '__MISSING__')
    print(str(v))
except Exception as e:
    print('__ERROR__:' + str(e))
" 2>/dev/null)

  if   [[ "$EXPECTED" == "EXISTS"       && "$ACTUAL" != "__MISSING__" && "$ACTUAL" != __ERROR__* ]]; then
       STATUS="PASS"
  elif [[ "$EXPECTED" == "POSITIVE_INT" ]] && python3 -c "v=int('$ACTUAL'); exit(0 if v>0 else 1)" 2>/dev/null; then
       STATUS="PASS"
  elif [[ "$EXPECTED" != "EXISTS" && "$EXPECTED" != "POSITIVE_INT" && "$ACTUAL" == "$EXPECTED" ]]; then
       STATUS="PASS"
  else
       STATUS="FAIL"
  fi

  if [[ "$STATUS" == "PASS" ]]; then
    COLOR="$GREEN"
  else
    COLOR="$RED"
    CURRENT_TC_FAIL=1
    CURRENT_TC_DESC="json[$FIELD]"
    CURRENT_TC_EXP="$EXPECTED"
    CURRENT_TC_ACT="${ACTUAL:0:25}"
  fi

  echo -e "${COLOR}[${STATUS}]${NC} ${TC_ID} — field '${FIELD}': expected=${EXPECTED}, actual=${ACTUAL}"
}

# ── assert_db ─────────────────────────────────────────────────────────────────
# Run a sqlite3 query and check the output matches an expected value.
# For password hash checks, use EXPECTED="BCRYPT" — checks the stored value
# starts with '$2' (bcrypt hash prefix).
# Args: TC_ID  DESCRIPTION  SQL_QUERY  EXPECTED(value|"EXISTS"|"EMPTY"|"BCRYPT")
assert_db() {
  local TC_ID="$1" DESC="$2" SQL="$3" EXPECTED="$4"
  local ACTUAL STATUS COLOR

  ACTUAL=$(sqlite3 "$DB" "$SQL" 2>/dev/null)

  case "$EXPECTED" in
    EXISTS) [[ -n "$ACTUAL" ]]         && STATUS="PASS" || STATUS="FAIL" ;;
    EMPTY)  [[ -z "$ACTUAL" ]]         && STATUS="PASS" || STATUS="FAIL" ;;
    BCRYPT) [[ "$ACTUAL" == \$2* ]]    && STATUS="PASS" || STATUS="FAIL" ;;
    *)      [[ "$ACTUAL" == "$EXPECTED" ]] && STATUS="PASS" || STATUS="FAIL" ;;
  esac

  if [[ "$STATUS" == "PASS" ]]; then
    COLOR="$GREEN"
  else
    COLOR="$RED"
    CURRENT_TC_FAIL=1
    CURRENT_TC_DESC="DB: $DESC"
    CURRENT_TC_EXP="$EXPECTED"
    CURRENT_TC_ACT="${ACTUAL:-<empty>}"
  fi

  echo -e "${COLOR}[${STATUS}]${NC} ${TC_ID} — DB: ${DESC}"
  echo -e "       SQL:      ${SQL}"
  echo -e "       Expected: ${EXPECTED} | Actual: ${ACTUAL:-<empty>}"
  echo ""
}

# ── teardown_db ───────────────────────────────────────────────────────────────
# Delete test data directly from SQLite. Always call after any TC that creates data.
# Args: DESCRIPTION  SQL_DELETE_STATEMENT
teardown_db() {
  local DESC="$1" SQL="$2"
  echo -e "${YELLOW}[TEARDOWN]${NC} $DESC"
  sqlite3 "$DB" "$SQL" 2>/dev/null \
    && echo -e "  ${GREEN}Done${NC}" \
    || echo -e "  ${YELLOW}Nothing to delete (OK if TC was expected to fail)${NC}"
  echo ""
}
```

#### 4.2 TC Section Patterns

Use the correct pattern for each TC based on its classification:

**Pattern A — Simple API call, no state check, no teardown (SCRIPT-FULL, invalid input TCs):**

```bash
# ── FR{nn}-EP-{nnn}: {Objective} ─────────────────────────────────────────────
# EC Ref: {EC ID} | Expected: HTTP {code} — {reason}
echo -e "${CYAN}=== FR{nn}-EP-{nnn}: {Objective} ===${NC}"
start_tc "FR{nn}-EP-{nnn}"
run_and_assert \
  "FR{nn}-EP-{nnn}" "{expectedHttpCode}" "{METHOD}" "{/api/endpoint}" "{none|user|admin}" \
  '{JSON body, or omit for no body}'
end_tc
```

**Pattern B — API call + JSON field check + sqlite3 DB verification + teardown (SCRIPT-FULL, success TCs):**

Use this for any TC that creates a resource (user, coupon, order, cart item) and needs to verify the DB state afterward.

```bash
# ── FR{nn}-EP-{nnn}: {Objective} ─────────────────────────────────────────────
# EC Ref: {EC ID} | Expected: HTTP 200 + resource created in DB
echo -e "${CYAN}=== FR{nn}-EP-{nnn}: {Objective} ===${NC}"
start_tc "FR{nn}-EP-{nnn}"

# Step 1: API call
run_and_assert \
  "FR{nn}-EP-{nnn}" "200" "POST" "/api/register" "none" \
  '{"name":"Test User","email":"ep001@test.com","password":"Test@123"}'

# Step 2: Verify response body fields
assert_json_field "FR{nn}-EP-{nnn}-res-msg" \
  "$RESP_DIR/FR{nn}-EP-{nnn}-response.json" "message" "User registered successfully"

assert_json_field "FR{nn}-EP-{nnn}-res-id" \
  "$RESP_DIR/FR{nn}-EP-{nnn}-response.json" "id" "POSITIVE_INT"

# Step 3: Verify DB state with sqlite3
assert_db "FR{nn}-EP-{nnn}-db-exists" \
  "User row exists in users table" \
  "SELECT email FROM users WHERE email='ep001@test.com';" \
  "ep001@test.com"

# Step 4: Verify password is hashed (must start with $2 — bcrypt prefix)
# SEC-01: Passwords must NOT be stored as plaintext
assert_db "FR{nn}-EP-{nnn}-db-hash" \
  "Password is bcrypt-hashed (per SEC-01)" \
  "SELECT password FROM users WHERE email='ep001@test.com';" \
  "BCRYPT"

# Step 5: Teardown — delete test user from DB
teardown_db \
  "Delete test user ep001@test.com" \
  "DELETE FROM users WHERE email='ep001@test.com';"

end_tc
```

**Pattern C — Role-Auth (3 token states, all automated):**

```bash
# ── FR{nn}-EP-{nnn}: Role-Auth — {Method} {Endpoint} ─────────────────────────
# Expected: no-token→401, user-token→403, admin-token→200
echo -e "${CYAN}=== FR{nn}-EP-{nnn}: Role-Auth Test ===${NC}"
start_tc "FR{nn}-EP-{nnn}"
RA_BODY='{...valid JSON body...}'

run_and_assert "FR{nn}-EP-{nnn}-notoken"    "401" "{METHOD}" "{/api/endpoint}" "none"  "$RA_BODY"
run_and_assert "FR{nn}-EP-{nnn}-usertoken"  "403" "{METHOD}" "{/api/endpoint}" "user"  "$RA_BODY"
run_and_assert "FR{nn}-EP-{nnn}-admintoken" "200" "{METHOD}" "{/api/endpoint}" "admin" "$RA_BODY"

# Teardown if admin call created data:
teardown_db "Remove Role-Auth test data" "DELETE FROM {table} WHERE {condition};"

end_tc
```

**Pattern D — sqlite3-only verification (no HTTP call), for implicit state checks:**

Use when you need to verify something in the DB that was created by a prior TC or by a manual UI action. No API call needed.

```bash
# ── FR{nn}-EP-{nnn}: DB state check — {Description} ──────────────────────────
echo -e "${CYAN}=== FR{nn}-EP-{nnn}: DB State Check ===${NC}"
start_tc "FR{nn}-EP-{nnn}"

assert_db "FR{nn}-EP-{nnn}-db-otp" \
  "OTP token stored in password_resets for email" \
  "SELECT token FROM password_resets WHERE email='test@eshop.com';" \
  "EXISTS"

# For OTP reuse check — after reset, the token row should be deleted:
assert_db "FR{nn}-EP-{nnn}-db-otp-cleared" \
  "OTP row removed after successful password reset (per SEC-07)" \
  "SELECT COUNT(*) FROM password_resets WHERE email='test@eshop.com';" \
  "0"

end_tc
```

**Pattern E — State verification with manual UI trigger (SCRIPT-PARTIAL with before/after):**

Use when the state change must be triggered by a UI action (cannot be scripted), but the state itself can be verified via API or sqlite3.

```bash
# ── FR{nn}-EP-{nnn}: State — Before/After {Description} ──────────────────────
echo -e "${CYAN}=== FR{nn}-EP-{nnn}: State Verification — {Description} ===${NC}"
start_tc "FR{nn}-EP-{nnn}"

# Before state
echo -e "${YELLOW}STEP 1: Recording BEFORE state...${NC}"
BEFORE=$(sqlite3 "$DB" "{SQL to capture current state}")
echo "Before: $BEFORE"

echo ""
echo -e "${YELLOW}>>> MANUAL ACTION REQUIRED:${NC}"
echo -e "    {Exact instruction — e.g., 'Open http://localhost:5173/products/1 and click Add to Cart'}"
echo -e "    Press Enter when done..." && read -r

# After state
echo -e "${YELLOW}STEP 2: Recording AFTER state...${NC}"
AFTER=$(sqlite3 "$DB" "{SQL to capture state after action}")
echo "After:  $AFTER"

# Automated comparison
if [[ "$AFTER" == "{expectedValue}" ]]; then
  echo -e "${GREEN}[PASS]${NC} FR{nn}-EP-{nnn}-state — {description}: expected=$expectedValue, actual=$AFTER"
  ((PASS++))
  SUMMARY_ROWS+=("PASS|FR{nn}-EP-{nnn}-state|DB state|{expectedValue}|$AFTER")
else
  echo -e "${RED}[FAIL]${NC} FR{nn}-EP-{nnn}-state — {description}: expected={expectedValue}, actual=$AFTER"
  ((FAIL++))
  SUMMARY_ROWS+=("FAIL|FR{nn}-EP-{nnn}-state|DB state|{expectedValue}|$AFTER")
fi
echo ""

end_tc
```

#### 4.3 Script Closing Block

Always end every script with this block:

```bash
# =============================================================================
# FINAL SUMMARY
# =============================================================================
echo ""
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD} FR-{nn} TEST RESULTS — AUTOMATED CHECKS${NC}"
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
printf "  %-20s %-35s %-35s %s\n" "TC ID / Check" "Expected" "Actual" "Status"
echo "  ──────────────────────────────────────────────────────────────────"
for row in "${SUMMARY_ROWS[@]}"; do
  IFS='|' read -r S ID EP EXP ACT <<< "$row"
  [[ "$S" == "PASS" ]] && C="$GREEN" || C="$RED"
  printf "  ${C}%-20s %-35s %-35s %s${NC}\n" \
    "${ID:0:20}" "${EXP:0:35}" "${ACT:0:35}" "$S"
done
echo "  ──────────────────────────────────────────────────────────────────"
echo -e "  ${BOLD}TOTAL (automated): ${GREEN}${PASS} PASS${NC} | ${RED}${FAIL} FAIL${NC} | ${YELLOW}${SKIP} SKIP${NC}"
echo ""
echo -e "${YELLOW}  Still requires manual testing:${NC}"
echo -e "    UI-only TCs : {list TC IDs} → open http://localhost:{port}"
echo -e "    DOM checks  : paste scripts/curl/FR{nn}-dom-checks.js into DevTools"
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Response JSON files saved to: $RESP_DIR/"
echo "Paste the summary block above into Phase B prompt."
```

### Deliverable 2: `scripts/curl/FR{nn}-dom-checks.js`

A single self-contained JavaScript file for ALL DOM-channel TCs of this FR. The human navigates to the target page, opens DevTools Console (F12), pastes the entire file, presses Enter, screenshots the output, and copies the summary text for Phase B.

```javascript
// =============================================================================
// FR-{nn}: {Feature Name} — DOM Check Suite
// Generated by: test-execution-assistant skill
//
// Instructions:
//   1. Navigate browser to: {URL — e.g., http://localhost:5173/register}
//   2. Open DevTools: F12 → Console tab
//   3. Paste this entire script content and press Enter
//   4. Screenshot the console output (1 screenshot for all DOM checks)
//   5. Copy the printed summary and paste into Phase B prompt
// =============================================================================

(function FR{nn}DOMChecks() {
  "use strict";

  let pass = 0, fail = 0;
  const results = [];

  function check(tcId, description, expected, actualFn) {
    let actual, status;
    try {
      actual = actualFn();
      const ok = (expected === "EXISTS")
        ? (actual !== null && actual !== undefined && actual !== "NOT_FOUND")
        : (String(actual) === String(expected));
      status = ok ? "PASS" : "FAIL";
    } catch (e) {
      actual = "ERROR: " + e.message;
      status = "FAIL";
    }
    status === "PASS" ? pass++ : fail++;
    results.push({ tcId, description, expected, actual, status });
  }

  // ── FR{nn}-specific DOM checks (fill in per TC) ────────────────────────────

  // TC: FR{nn}-EP-{nnn} — {Objective}
  // Requirement: {GUI-xx per FR-21~24}
  check(
    "FR{nn}-EP-{nnn}",
    "{Human-readable check description}",
    "{expected value or EXISTS}",
    () => { /* JS expression returning the actual value */ }
  );

  // ── Standard library: include the relevant checks for this FR ────────────────

  // DOM-H1: Exactly 1 <h1> tag (per FR-21 — all web pages)
  check("FR{nn}-DOM-H1", "Page has exactly 1 <h1> tag (per FR-21)",
    "1", () => String(document.querySelectorAll("h1").length));

  // DOM-EMAIL: Email input type="email" (per FR-22 — forms with email field)
  check("FR{nn}-DOM-EMAIL", 'Email input has type="email" (per FR-22)',
    "email",
    () => {
      const el = document.querySelector('input[name="email"], input[autocomplete="email"]')
               || document.querySelector('input[type="email"]');
      return el ? el.type : "NOT_FOUND";
    });

  // DOM-PW: Password input type="password" (per FR-22 — forms with password field)
  check("FR{nn}-DOM-PW", 'Password input has type="password" (per FR-22)',
    "EXISTS",
    () => document.querySelector('input[type="password"]'));

  // DOM-STAR: Required fields have * label marker (per FR-22)
  check("FR{nn}-DOM-STAR", "Required fields have * in label (per FR-22)",
    "EXISTS",
    () => {
      const labels = Array.from(document.querySelectorAll("label"));
      const stars = labels.filter(l => l.textContent.trim().includes("*"));
      return stars.length > 0 ? `${stars.length} marked fields` : null;
    });

  // DOM-ALT: All images have non-empty alt text (per FR-24)
  check("FR{nn}-DOM-ALT", "All <img> have non-empty alt attribute (per FR-24)",
    "0",
    () => String(
      Array.from(document.querySelectorAll("img"))
           .filter(img => !img.alt || img.alt.trim() === "").length
    ));

  // DOM-ERR-POS: Error messages appear above the submit button (per FR-22)
  // Run AFTER triggering a validation error
  check("FR{nn}-DOM-ERRPOS", "Error messages are above submit button (per FR-22)",
    "EXISTS",
    () => {
      const btn  = document.querySelector('button[type="submit"]');
      const errs = document.querySelectorAll('[class*="error"],[class*="alert"],[role="alert"]');
      if (!btn || errs.length === 0) return null;
      const btnTop = btn.getBoundingClientRect().top;
      const allAbove = Array.from(errs).every(e => e.getBoundingClientRect().top < btnTop);
      return allAbove ? "all above" : null;
    });

  // DOM-BADGE: Cart badge visible in navbar (per FR-23 — cart pages)
  check("FR{nn}-DOM-BADGE", "Cart badge visible in navbar (per FR-23)",
    "EXISTS",
    () => document.querySelector('[class*="badge"]')
       || document.querySelector('[data-testid*="cart"]'));

  // DOM-STEP: Step indicator visible (per FR-22 — multi-step forms, FR-03)
  check("FR{nn}-DOM-STEP", "Step indicator visible for multi-step form (per FR-22)",
    "EXISTS",
    () => {
      const el = document.querySelector('[class*="step"],[class*="progress"],[class*="stepper"]');
      return el ? el.textContent.trim().slice(0, 40) : null;
    });

  // DOM-XSS: User input rendered safely — no raw <script> tag in DOM (per SEC-04)
  // Run AFTER submitting a form with name = <script>alert(1)</script>
  check("FR{nn}-DOM-XSS", 'No raw <script> tag injected into DOM (per SEC-04)',
    "SAFE",
    () => document.body.innerHTML.includes("<script>alert(1)</script>") ? "VULNERABLE" : "SAFE");

  // ── Print results ──────────────────────────────────────────────────────────
  console.log("\n" + "=".repeat(72));
  console.log(`FR-{nn} DOM CHECK RESULTS  |  Page: ${location.href}`);
  console.log("=".repeat(72));
  results.forEach(r => {
    const icon = r.status === "PASS" ? "✅ PASS" : "❌ FAIL";
    console.log(`${icon}  ${r.tcId}`);
    console.log(`       Check   : ${r.description}`);
    console.log(`       Expected: ${r.expected}`);
    console.log(`       Actual  : ${r.actual}`);
    console.log("");
  });
  console.log("-".repeat(72));
  console.log(`SUMMARY: ${pass} PASS | ${fail} FAIL | Total: ${results.length}`);
  console.log("=".repeat(72));
  console.log("→ Screenshot this console panel, then paste this output into Phase B.");

  return results;
})();
```

### Deliverable 3: Execution Results Template

Create `qa-artifacts/execution-results/FR{nn}-execution-results.md`. Pre-fill TC metadata and Expected Results. Leave Observed Result and Status blank.

```markdown
# Execution Results — FR-{nn}: {Feature Name}

**Executed by:** {Student ID}  
**Date:** {YYYY-MM-DD}  
**SUT Commit:** `{git log -1 --format="%h"}`  
**API responses:** `evidence/api-responses/FR{nn}/`  
**Session recording:** {YouTube link — add after recording by human}

## How to complete this file

| Source             | What to do                                                          |
| ------------------ | ------------------------------------------------------------------- |
| SCRIPT-FULL TCs    | Paste terminal summary from `bash scripts/curl/FR{nn}-api-tests.sh` |
| SCRIPT-PARTIAL TCs | Script covers API part; fill UI observation manually                |
| MANUAL TCs         | Fill in after browser/mobile testing                                |
| DOM TCs            | Paste console output from `scripts/curl/FR{nn}-dom-checks.js`       |

## Execution Log

### FR{nn}-EP-{nnn} — {Objective} `[SCRIPT-FULL]`

| Field               | Value                                                         |
| ------------------- | ------------------------------------------------------------- |
| **TC ID**           | FR{nn}-EP-{nnn}                                               |
| **Channel**         | {channel}                                                     |
| **Automation**      | SCRIPT-FULL                                                   |
| **Test Data**       | {from TC table}                                               |
| **Expected Result** | {pre-filled from TC table, citing FR number}                  |
| **Observed Result** | _(fill from script output)_                                   |
| **DB Check**        | _(fill from script output)_                                   |
| **API Response**    | `evidence/api-responses/FR{nn}/FR{nn}-EP-{nnn}-response.json` |
| **Status**          | _(PASS / FAIL / BLOCKED / SKIPPED)_                           |

### FR{nn}-EP-{nnn} — {Objective} `[MANUAL]`

| Field               | Value                               |
| ------------------- | ----------------------------------- |
| **TC ID**           | FR{nn}-EP-{nnn}                     |
| **Channel**         | UI                                  |
| **Automation**      | MANUAL                              |
| **Test Data**       | {from TC table}                     |
| **Expected Result** | {pre-filled from TC table}          |
| **Observed Result** | _(fill after browser testing)_      |
| **Status**          | _(PASS / FAIL / BLOCKED / SKIPPED)_ |

[... one entry per TC ...]

## Execution Summary

| Metric         | Script-Full | Script-Partial | Manual | DOM | Total |
| -------------- | ----------- | -------------- | ------ | --- | ----- |
| Total TCs      | {n}         | {n}            | {n}    | {n} | {n}   |
| Passed         |             |                |        |     |       |
| Failed         |             |                |        |     |       |
| Blocked        |             |                |        |     |       |
| Skipped        |             |                |        |     |       |
| **Pass Rate**  |             |                |        |     |       |
| **Bugs Found** |             |                |        |     |       |

**MANUAL TCs list:** {FR{nn}-EP-{nnn}, ...}
**DOM page URL:** {http://localhost:.../...}
```

## 5. Phase B — Record Results & Sync Both Files

After the human runs all scripts and reports back, the agent performs **two simultaneous file updates** per TC:

### 5.1 Input Format

The human provides:

```
Phase B — FR-{nn}

SCRIPT OUTPUT (paste the summary block from terminal):
[paste here]

DOM OUTPUT (paste the block from DevTools console):
[paste here]

MANUAL UI RESULTS:
- FR{nn}-EP-{nnn}: PASS — {brief observation, e.g., "Error shown above button"}
- FR{nn}-EP-{nnn}: FAIL — {exact description of what went wrong}
```

### 5.2 Agent Actions in Phase B

For each TC result received:

**1. Update execution-results file:**

- Fill `Observed Result` with specific details from script output or manual report
- Fill `DB Check` with sqlite3 assertion result if applicable
- Set `Status`: PASS / FAIL / BLOCKED / SKIPPED
- For FAIL: append `**→ Bug Required:** Run bug-report-writer for this TC`
- Update `Execution Summary` table with final counts

**2. Sync test-cases file (`qa-artifacts/test-cases/FR{nn}-test-cases.md`):**

- For each TC table that has `**Observed Result** | _(to be filled)_` → replace with the actual observed result
- For each TC that has `**Status** | _(to be filled)_` → replace with PASS / FAIL / BLOCKED / SKIPPED

**3. Print final Phase B report:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Phase B complete — FR-{nn}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Script-Full TCs : {n} PASS, {n} FAIL
Script-Partial  : {n} PASS, {n} FAIL
DOM checks      : {n} PASS, {n} FAIL
Manual TCs      : {n} PASS, {n} FAIL
─────────────────────────────────────────────────
TOTAL           : {n} PASS, {n} FAIL, {n} BLOCKED
─────────────────────────────────────────────────
Files updated:
  ✅ qa-artifacts/execution-results/FR{nn}-execution-results.md
  ✅ qa-artifacts/test-cases/FR{nn}-test-cases.md

Bugs required for:
  {FR{nn}-EP-{nnn}} — {brief reason}
  → Run bug-report-writer for each
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 6. Evidence Requirements

| Evidence                          | Required                           | How produced                                               |
| --------------------------------- | ---------------------------------- | ---------------------------------------------------------- |
| API response JSON files           | ✅ Per API/Role-Auth TC            | Auto-saved by script to `evidence/api-responses/FR{nn}/`   |
| DB sqlite3 query results          | Embedded in script terminal output | Printed inline; captured in session recording              |
| Session recording (1 per FR)      | ✅ Upload to YouTube               | Record screen while running script + UI tests + DOM checks |
| DOM console screenshot (1 per FR) | ✅ 1 screenshot                    | Screenshot DevTools Console showing DOM check summary      |
| Per-TC screenshot                 | ❌ Not required                    | Only take screenshots when creating GitHub Issues for bugs |

## 7. SQLite Best Practices for Script Generation

When generating sqlite3 checks, follow these rules:

**Rule 1 — Always use double-quotes around SQL string values:**

```bash
sqlite3 "$DB" "SELECT email FROM users WHERE email='ep001@test.com';"
```

**Rule 2 — Password hash check pattern (SEC-01):**

```bash
# bcrypt hashes always start with $2a$, $2b$, or $2y$
# assert_db with EXPECTED="BCRYPT" handles this automatically
assert_db "TC-ID" "Password is hashed (per SEC-01)" \
  "SELECT password FROM users WHERE email='ep001@test.com';" "BCRYPT"
```

**Rule 3 — Use `COUNT(*)` for existence checks when rows might not exist:**

```bash
# Returns "0" (safe) or "1" even if row absent, never errors
assert_db "TC-ID" "OTP cleared after use (per SEC-07)" \
  "SELECT COUNT(*) FROM password_resets WHERE email='test@eshop.com';" "0"
```

**Rule 4 — Always teardown after success TCs using sqlite3, not the Admin API:**

```bash
# Faster and more reliable than API calls
teardown_db "Remove test user" \
  "DELETE FROM users WHERE email='ep001@test.com';"
```

**Rule 5 — For cart/order state checks, use user_id not email:**

```bash
# Get user_id first, then query related tables
USER_ID=$(sqlite3 "$DB" "SELECT id FROM users WHERE email='test@eshop.com';")
assert_db "TC-ID" "Cart item exists after add" \
  "SELECT COUNT(*) FROM cart_items WHERE user_id=$USER_ID AND product_id=1;" "1"
```

**Rule 6 — For coupon checks, check both existence and is_active flag:**

```bash
assert_db "TC-ID" "Coupon exists and is active" \
  "SELECT is_active FROM coupons WHERE code='TESTCODE';" "1"
```

**Rule 7 — Handling Large Dynamic BVA Strings:**

When a Test Case requires a very long string (e.g., 255 or 300 characters for boundary testing), do NOT hardcode the string and do NOT inject `$(printf...)` directly into the JSON payload multiple times.
Instead, generate the string into a local bash variable first, then use that variable in the API payload, `assert_db`, and `teardown_db` queries to ensure consistency and avoid false negatives.

```bash
LONG_EMAIL="$(printf 'a%.0s' {1..246})@test.com"
run_and_assert "FR{nn}-BVA-{nnn}" "200" "POST" "/api/register" "none" \
  '{"name": "Nguyen Van A", "email": "'"$LONG_EMAIL"'", "password": "Test@123"}'
```

**Rule 8 — Handling Cross-FR Data Dependencies (Dynamic Setup & Teardown):**

When testing a feature that depends on entities from another feature (e.g., FR-07 Shopping Cart needs existing Products, FR-08 Checkout needs an existing Cart), you MUST NOT rely on hardcoded IDs (like `id=1` or `category_id=1`). Doing so causes Foreign Key constraint errors if the DB is empty.

- **Setup:** At the beginning of the script (in the Test Data Setup block), dynamically create the prerequisite data using Admin APIs. Store the generated IDs in bash variables (e.g., `TEST_PROD_ID`).
- **Execution:** Pass these bash variables into the `curl` JSON payloads for all test cases.
- **Teardown:** At the very end of the bash script, explicitly delete this prerequisite data (via Admin API or `teardown_db`) to ensure the SUT remains completely clean for the next test execution.

## 8. Quality Checklist

**Phase A generation:**

- [ ] TC classification table shown before generating scripts
- [ ] `DB` variable set to `backend/database.sqlite` at top of script
- [ ] Preflight checks present (DB file exists, backend responds, sqlite3 installed)
- [ ] `assert_db` with `EXPECTED="BCRYPT"` used for all password hash checks (SEC-01)
- [ ] All success TCs have `teardown_db` via sqlite3 (not API)
- [ ] Role-Auth TCs test all 3 token states in one block
- [ ] Pattern E (before/after state) used for UI-triggered state changes
- [ ] Script closing block prints formatted summary table
- [ ] DOM checks JS covers all DOM-channel TCs for this FR
- [ ] Execution results template pre-fills Expected Results from TC table
- [ ] Cross-FR data dependencies are handled dynamically (no hardcoded IDs for foreign keys; Setup block and final Teardown included per Rule 8).

**Phase B recording:**

- [ ] BOTH files updated: execution-results.md AND test-cases.md
- [ ] Observed Result is specific (not "looks correct")
- [ ] FAIL TCs flagged with `→ Bug Required:`
- [ ] Execution Summary table fully populated
- [ ] Session recording link added to execution results file header
- [ ] Final Phase B report printed to human
