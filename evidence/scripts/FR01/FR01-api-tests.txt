[1m>>> Preflight checks...[0m
[0;32mAll systems ready.[0m

[1m>>> Acquiring tokens...[0m
[0;32mTokens acquired.[0m

[0;36m=== FR01-EP-001: API ===[0m
[0;32m[PASS][0m [1mFR01-EP-001[0m — HTTP 200 (expected 200)

[0;32m[PASS][0m FR01-EP-001-msg — field 'message': expected=User registered successfully, actual=User registered successfully
[0;32m[PASS][0m FR01-EP-001-id — field 'id': expected=POSITIVE_INT, actual=3
[0;32m[PASS][0m FR01-EP-001-exists — DB: User row exists
       SQL:      SELECT email FROM users WHERE email='ep001@test.com';
       Expected: ep001@test.com | Actual: ep001@test.com

[0;31m[FAIL][0m FR01-EP-001-hash — DB: Password is bcrypt-hashed
       SQL:      SELECT password FROM users WHERE email='ep001@test.com';
       Expected: BCRYPT | Actual: Test@123

[1;33m[TEARDOWN][0m Delete test user
  [0;32mDone[0m

[0;36m=== FR01-EP-002: API ===[0m
[0;31m[FAIL][0m [1mFR01-EP-002[0m — HTTP 200 (expected 400)
        {
            "message": "User registered successfully",
            "id": 4
        }

[0;36m=== FR01-EP-003: API ===[0m
[0;31m[FAIL][0m [1mFR01-EP-003[0m — HTTP 200 (expected 400)
        {
            "message": "User registered successfully",
            "id": 5
        }

[0;36m=== FR01-EP-004: API ===[0m
[0;31m[FAIL][0m [1mFR01-EP-004[0m — HTTP 200 (expected 400)
        {
            "message": "User registered successfully",
            "id": 6
        }

[0;36m=== FR01-EP-005: API ===[0m
[0;31m[FAIL][0m [1mFR01-EP-005[0m — HTTP 200 (expected 400)
        {
            "message": "User registered successfully",
            "id": 7
        }

[0;36m=== FR01-EP-006: API ===[0m
[0;31m[FAIL][0m [1mFR01-EP-006[0m — HTTP 200 (expected 400)
        {
            "message": "User registered successfully",
            "id": 8
        }

[0;36m=== FR01-EP-007: API ===[0m
[0;31m[FAIL][0m [1mFR01-EP-007[0m — HTTP 200 (expected 409)
        {
            "message": "User registered successfully",
            "id": 9
        }

[0;36m=== FR01-EP-008: API ===[0m
[0;31m[FAIL][0m [1mFR01-EP-008[0m — HTTP 200 (expected 400)
        {
            "message": "User registered successfully",
            "id": 10
        }

[0;36m=== FR01-EP-009: API ===[0m
[0;31m[FAIL][0m [1mFR01-EP-009[0m — HTTP 200 (expected 400)
        {
            "message": "User registered successfully",
            "id": 11
        }

[0;36m=== FR01-EP-010: API ===[0m
[0;31m[FAIL][0m [1mFR01-EP-010[0m — HTTP 200 (expected 400)
        {
            "message": "User registered successfully",
            "id": 12
        }

[0;36m=== FR01-EP-011: API ===[0m
[0;31m[FAIL][0m [1mFR01-EP-011[0m — HTTP 200 (expected 400)
        {
            "message": "User registered successfully",
            "id": 13
        }

[0;36m=== FR01-EP-012: API ===[0m
[0;31m[FAIL][0m [1mFR01-EP-012[0m — HTTP 200 (expected 400)
        {
            "message": "User registered successfully",
            "id": 14
        }

[0;36m=== FR01-EP-013: API ===[0m
[0;31m[FAIL][0m [1mFR01-EP-013[0m — HTTP 200 (expected 400)
        {
            "message": "User registered successfully",
            "id": 15
        }

[0;36m=== FR01-EP-014: API ===[0m
[0;31m[FAIL][0m [1mFR01-EP-014[0m — HTTP 200 (expected 400)
        {
            "message": "User registered successfully",
            "id": 16
        }

[0;36m=== FR01-EP-015: API ===[0m
[0;31m[FAIL][0m [1mFR01-EP-015[0m — HTTP 200 (expected 400)
        {
            "message": "User registered successfully",
            "id": 17
        }

[0;36m=== FR01-EP-016: API ===[0m
[0;31m[FAIL][0m [1mFR01-EP-016[0m — HTTP 200 (expected 400)
        {
            "message": "User registered successfully",
            "id": 18
        }

[0;36m=== FR01-EP-017: API ===[0m
[0;31m[FAIL][0m [1mFR01-EP-017[0m — HTTP 200 (expected 400)
        {
            "message": "User registered successfully",
            "id": 19
        }

[0;36m=== FR01-EP-020: API ===[0m
[0;32m[PASS][0m [1mFR01-EP-020[0m — HTTP 200 (expected 200)

[0;32m[PASS][0m FR01-EP-020-msg — field 'message': expected=User registered successfully, actual=User registered successfully
[0;32m[PASS][0m FR01-EP-020-id — field 'id': expected=POSITIVE_INT, actual=20
[0;32m[PASS][0m FR01-EP-020-exists — DB: User row exists
       SQL:      SELECT email FROM users WHERE email='ep020@test.com';
       Expected: ep020@test.com | Actual: ep020@test.com

[0;31m[FAIL][0m FR01-EP-020-hash — DB: Password is bcrypt-hashed
       SQL:      SELECT password FROM users WHERE email='ep020@test.com';
       Expected: BCRYPT | Actual: Test@123

[1;33m[TEARDOWN][0m Delete test user
  [0;32mDone[0m

[0;36m=== FR01-BVA-001: API ===[0m
[0;31m[FAIL][0m [1mFR01-BVA-001[0m — HTTP 200 (expected 400)
        {
            "message": "User registered successfully",
            "id": 21
        }

[0;36m=== FR01-BVA-002: API ===[0m
[0;31m[FAIL][0m [1mFR01-BVA-002[0m — HTTP 200 (expected 400)
        {
            "message": "User registered successfully",
            "id": 22
        }

[0;36m=== FR01-BVA-003: API ===[0m
[0;32m[PASS][0m [1mFR01-BVA-003[0m — HTTP 200 (expected 200)

[0;32m[PASS][0m FR01-BVA-003-msg — field 'message': expected=User registered successfully, actual=User registered successfully
[0;32m[PASS][0m FR01-BVA-003-id — field 'id': expected=POSITIVE_INT, actual=23
[0;32m[PASS][0m FR01-BVA-003-exists — DB: User row exists
       SQL:      SELECT email FROM users WHERE email='bva003@test.com';
       Expected: bva003@test.com | Actual: bva003@test.com

[0;31m[FAIL][0m FR01-BVA-003-hash — DB: Password is bcrypt-hashed
       SQL:      SELECT password FROM users WHERE email='bva003@test.com';
       Expected: BCRYPT | Actual: Test@123

[1;33m[TEARDOWN][0m Delete test user
  [0;32mDone[0m

[0;36m=== FR01-BVA-004: API ===[0m
[0;32m[PASS][0m [1mFR01-BVA-004[0m — HTTP 200 (expected 200)

[0;32m[PASS][0m FR01-BVA-004-msg — field 'message': expected=User registered successfully, actual=User registered successfully
[0;32m[PASS][0m FR01-BVA-004-id — field 'id': expected=POSITIVE_INT, actual=24
[0;32m[PASS][0m FR01-BVA-004-exists — DB: User row exists
       SQL:      SELECT email FROM users WHERE email='bva004@test.com';
       Expected: bva004@test.com | Actual: bva004@test.com

[0;31m[FAIL][0m FR01-BVA-004-hash — DB: Password is bcrypt-hashed
       SQL:      SELECT password FROM users WHERE email='bva004@test.com';
       Expected: BCRYPT | Actual: Test@1234

[1;33m[TEARDOWN][0m Delete test user
  [0;32mDone[0m

[0;36m=== FR01-BVA-005: API ===[0m
[0;32m[PASS][0m [1mFR01-BVA-005[0m — HTTP 200 (expected 200)

[0;32m[PASS][0m FR01-BVA-005-msg — field 'message': expected=User registered successfully, actual=User registered successfully
[0;32m[PASS][0m FR01-BVA-005-id — field 'id': expected=POSITIVE_INT, actual=25
[0;32m[PASS][0m FR01-BVA-005-exists — DB: User row exists
       SQL:      SELECT email FROM users WHERE email='bva005@test.com';
       Expected: bva005@test.com | Actual: bva005@test.com

[0;31m[FAIL][0m FR01-BVA-005-hash — DB: Password is bcrypt-hashed
       SQL:      SELECT password FROM users WHERE email='bva005@test.com';
       Expected: BCRYPT | Actual: TestPassw0rd!Ab

[1;33m[TEARDOWN][0m Delete test user
  [0;32mDone[0m

[0;36m=== FR01-BVA-006: API ===[0m
[0;31m[FAIL][0m [1mFR01-BVA-006[0m — HTTP 200 (expected 400)
        {
            "message": "User registered successfully",
            "id": 26
        }

[0;36m=== FR01-BVA-007: API ===[0m
[0;31m[FAIL][0m [1mFR01-BVA-007[0m — HTTP 200 (expected 400)
        {
            "message": "User registered successfully",
            "id": 27
        }

[0;36m=== FR01-BVA-008: API ===[0m
[0;32m[PASS][0m [1mFR01-BVA-008[0m — HTTP 200 (expected 200)

[0;32m[PASS][0m FR01-BVA-008-msg — field 'message': expected=User registered successfully, actual=User registered successfully
[0;32m[PASS][0m FR01-BVA-008-id — field 'id': expected=POSITIVE_INT, actual=28
[0;32m[PASS][0m FR01-BVA-008-exists — DB: User row exists
       SQL:      SELECT email FROM users WHERE email='bva008@test.com';
       Expected: bva008@test.com | Actual: bva008@test.com

[0;31m[FAIL][0m FR01-BVA-008-hash — DB: Password is bcrypt-hashed
       SQL:      SELECT password FROM users WHERE email='bva008@test.com';
       Expected: BCRYPT | Actual: Test@123

[1;33m[TEARDOWN][0m Delete test user
  [0;32mDone[0m

[0;36m=== FR01-BVA-009: API ===[0m
[0;32m[PASS][0m [1mFR01-BVA-009[0m — HTTP 200 (expected 200)

[0;32m[PASS][0m FR01-BVA-009-msg — field 'message': expected=User registered successfully, actual=User registered successfully
[0;32m[PASS][0m FR01-BVA-009-id — field 'id': expected=POSITIVE_INT, actual=29
[0;32m[PASS][0m FR01-BVA-009-exists — DB: User row exists
       SQL:      SELECT email FROM users WHERE email='bva009@test.com';
       Expected: bva009@test.com | Actual: bva009@test.com

[0;31m[FAIL][0m FR01-BVA-009-hash — DB: Password is bcrypt-hashed
       SQL:      SELECT password FROM users WHERE email='bva009@test.com';
       Expected: BCRYPT | Actual: Test@123

[1;33m[TEARDOWN][0m Delete test user
  [0;32mDone[0m

[0;36m=== FR01-BVA-010: API ===[0m
[0;32m[PASS][0m [1mFR01-BVA-010[0m — HTTP 200 (expected 200)

[0;32m[PASS][0m FR01-BVA-010-msg — field 'message': expected=User registered successfully, actual=User registered successfully
[0;32m[PASS][0m FR01-BVA-010-id — field 'id': expected=POSITIVE_INT, actual=30
[0;32m[PASS][0m FR01-BVA-010-exists — DB: User row exists
       SQL:      SELECT email FROM users WHERE email='bva010@test.com';
       Expected: bva010@test.com | Actual: bva010@test.com

[0;31m[FAIL][0m FR01-BVA-010-hash — DB: Password is bcrypt-hashed
       SQL:      SELECT password FROM users WHERE email='bva010@test.com';
       Expected: BCRYPT | Actual: Test@123

[1;33m[TEARDOWN][0m Delete test user
  [0;32mDone[0m

[0;36m=== FR01-BVA-011: API ===[0m
[0;32m[PASS][0m [1mFR01-BVA-011[0m — HTTP 200 (expected 200)

[0;32m[PASS][0m FR01-BVA-011-msg — field 'message': expected=User registered successfully, actual=User registered successfully
[0;32m[PASS][0m FR01-BVA-011-id — field 'id': expected=POSITIVE_INT, actual=31
[0;32m[PASS][0m FR01-BVA-011-exists — DB: User row exists
       SQL:      SELECT email FROM users WHERE email='bva011@test.com';
       Expected: bva011@test.com | Actual: bva011@test.com

[0;31m[FAIL][0m FR01-BVA-011-hash — DB: Password is bcrypt-hashed
       SQL:      SELECT password FROM users WHERE email='bva011@test.com';
       Expected: BCRYPT | Actual: Test@123

[1;33m[TEARDOWN][0m Delete test user
  [0;32mDone[0m

[0;36m=== FR01-BVA-012: API ===[0m
[0;32m[PASS][0m [1mFR01-BVA-012[0m — HTTP 200 (expected 200)

[0;32m[PASS][0m FR01-BVA-012-msg — field 'message': expected=User registered successfully, actual=User registered successfully
[0;32m[PASS][0m FR01-BVA-012-id — field 'id': expected=POSITIVE_INT, actual=32
[0;32m[PASS][0m FR01-BVA-012-exists — DB: User row exists
       SQL:      SELECT email FROM users WHERE email='bva012@test.com';
       Expected: bva012@test.com | Actual: bva012@test.com

[0;31m[FAIL][0m FR01-BVA-012-hash — DB: Password is bcrypt-hashed
       SQL:      SELECT password FROM users WHERE email='bva012@test.com';
       Expected: BCRYPT | Actual: Test@123

[1;33m[TEARDOWN][0m Delete test user
  [0;32mDone[0m

[0;36m=== FR01-BVA-013: API ===[0m
[0;31m[FAIL][0m [1mFR01-BVA-013[0m — HTTP 200 (expected 400)
        {
            "message": "User registered successfully",
            "id": 33
        }

[0;36m=== FR01-BVA-014: API ===[0m
[0;31m[FAIL][0m [1mFR01-BVA-014[0m — HTTP 200 (expected 400)
        {
            "message": "User registered successfully",
            "id": 34
        }

[0;36m=== FR01-BVA-015: API ===[0m
[0;32m[PASS][0m [1mFR01-BVA-015[0m — HTTP 200 (expected 200)

[0;32m[PASS][0m FR01-BVA-015-msg — field 'message': expected=User registered successfully, actual=User registered successfully
[0;32m[PASS][0m FR01-BVA-015-id — field 'id': expected=POSITIVE_INT, actual=35
[0;32m[PASS][0m FR01-BVA-015-exists — DB: User row exists
       SQL:      SELECT email FROM users WHERE email='newuser@test.com';
       Expected: newuser@test.com | Actual: newuser@test.com

[0;31m[FAIL][0m FR01-BVA-015-hash — DB: Password is bcrypt-hashed
       SQL:      SELECT password FROM users WHERE email='newuser@test.com';
       Expected: BCRYPT | Actual: Test@123

[1;33m[TEARDOWN][0m Delete test user
  [0;32mDone[0m

[0;36m=== FR01-BVA-016: API ===[0m
[0;32m[PASS][0m [1mFR01-BVA-016[0m — HTTP 200 (expected 200)

[0;32m[PASS][0m FR01-BVA-016-msg — field 'message': expected=User registered successfully, actual=User registered successfully
[0;32m[PASS][0m FR01-BVA-016-id — field 'id': expected=POSITIVE_INT, actual=36
[0;32m[PASS][0m FR01-BVA-016-exists — DB: User row exists
       SQL:      SELECT email FROM users WHERE email='aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa@test.com';
       Expected: aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa@test.com | Actual: aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa@test.com

[0;31m[FAIL][0m FR01-BVA-016-hash — DB: Password is bcrypt-hashed
       SQL:      SELECT password FROM users WHERE email='aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa@test.com';
       Expected: BCRYPT | Actual: Test@123

[1;33m[TEARDOWN][0m Delete test user
  [0;32mDone[0m

[0;36m=== FR01-BVA-017: API ===[0m
[0;31m[FAIL][0m [1mFR01-BVA-017[0m — HTTP 200 (expected 400)
        {
            "message": "User registered successfully",
            "id": 37
        }

[0;36m=== FR01-BVA-018: API ===[0m
[0;31m[FAIL][0m [1mFR01-BVA-018[0m — HTTP 200 (expected 400)
        {
            "message": "User registered successfully",
            "id": 38
        }


[1m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[0m
[1m FR-01 TEST RESULTS — AUTOMATED CHECKS[0m
[1m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[0m
  TC ID / Check        Expected                            Actual                              Status
  ──────────────────────────────────────────────────────────────────
  [0;31mFR01-EP-001          DB: Password is bcrypt-hashed       BCRYPT|Test@123                     FAIL[0m
  [0;31mFR01-EP-002          POST /api/register                  HTTP 400|HTTP 200                   FAIL[0m
  [0;31mFR01-EP-003          POST /api/register                  HTTP 400|HTTP 200                   FAIL[0m
  [0;31mFR01-EP-004          POST /api/register                  HTTP 400|HTTP 200                   FAIL[0m
  [0;31mFR01-EP-005          POST /api/register                  HTTP 400|HTTP 200                   FAIL[0m
  [0;31mFR01-EP-006          POST /api/register                  HTTP 400|HTTP 200                   FAIL[0m
  [0;31mFR01-EP-007          POST /api/register                  HTTP 409|HTTP 200                   FAIL[0m
  [0;31mFR01-EP-008          POST /api/register                  HTTP 400|HTTP 200                   FAIL[0m
  [0;31mFR01-EP-009          POST /api/register                  HTTP 400|HTTP 200                   FAIL[0m
  [0;31mFR01-EP-010          POST /api/register                  HTTP 400|HTTP 200                   FAIL[0m
  [0;31mFR01-EP-011          POST /api/register                  HTTP 400|HTTP 200                   FAIL[0m
  [0;31mFR01-EP-012          POST /api/register                  HTTP 400|HTTP 200                   FAIL[0m
  [0;31mFR01-EP-013          POST /api/register                  HTTP 400|HTTP 200                   FAIL[0m
  [0;31mFR01-EP-014          POST /api/register                  HTTP 400|HTTP 200                   FAIL[0m
  [0;31mFR01-EP-015          POST /api/register                  HTTP 400|HTTP 200                   FAIL[0m
  [0;31mFR01-EP-016          POST /api/register                  HTTP 400|HTTP 200                   FAIL[0m
  [0;31mFR01-EP-017          POST /api/register                  HTTP 400|HTTP 200                   FAIL[0m
  [0;31mFR01-EP-020          DB: Password is bcrypt-hashed       BCRYPT|Test@123                     FAIL[0m
  [0;31mFR01-BVA-001         POST /api/register                  HTTP 400|HTTP 200                   FAIL[0m
  [0;31mFR01-BVA-002         POST /api/register                  HTTP 400|HTTP 200                   FAIL[0m
  [0;31mFR01-BVA-003         DB: Password is bcrypt-hashed       BCRYPT|Test@123                     FAIL[0m
  [0;31mFR01-BVA-004         DB: Password is bcrypt-hashed       BCRYPT|Test@1234                    FAIL[0m
  [0;31mFR01-BVA-005         DB: Password is bcrypt-hashed       BCRYPT|TestPassw0rd!Ab              FAIL[0m
  [0;31mFR01-BVA-006         POST /api/register                  HTTP 400|HTTP 200                   FAIL[0m
  [0;31mFR01-BVA-007         POST /api/register                  HTTP 400|HTTP 200                   FAIL[0m
  [0;31mFR01-BVA-008         DB: Password is bcrypt-hashed       BCRYPT|Test@123                     FAIL[0m
  [0;31mFR01-BVA-009         DB: Password is bcrypt-hashed       BCRYPT|Test@123                     FAIL[0m
  [0;31mFR01-BVA-010         DB: Password is bcrypt-hashed       BCRYPT|Test@123                     FAIL[0m
  [0;31mFR01-BVA-011         DB: Password is bcrypt-hashed       BCRYPT|Test@123                     FAIL[0m
  [0;31mFR01-BVA-012         DB: Password is bcrypt-hashed       BCRYPT|Test@123                     FAIL[0m
  [0;31mFR01-BVA-013         POST /api/register                  HTTP 400|HTTP 200                   FAIL[0m
  [0;31mFR01-BVA-014         POST /api/register                  HTTP 400|HTTP 200                   FAIL[0m
  [0;31mFR01-BVA-015         DB: Password is bcrypt-hashed       BCRYPT|Test@123                     FAIL[0m
  [0;31mFR01-BVA-016         DB: Password is bcrypt-hashed       BCRYPT|Test@123                     FAIL[0m
  [0;31mFR01-BVA-017         POST /api/register                  HTTP 400|HTTP 200                   FAIL[0m
  [0;31mFR01-BVA-018         POST /api/register                  HTTP 400|HTTP 200                   FAIL[0m
  ──────────────────────────────────────────────────────────────────
  [1mTOTAL (automated): [0;32m0 PASS[0m | [0;31m36 FAIL[0m | [1;33m0 SKIP[0m

[1;33m  Still requires manual testing:[0m
    UI-only TCs : FR01-EP-018, FR01-EP-019 → open http://localhost:5173/register
    DOM checks  : paste scripts/curl/FR01-dom-checks.js into DevTools
[1m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[0m

Response JSON files saved to: evidence/api-responses/FR01/
Paste the summary block above into Phase B prompt.
