[1m>>> Preflight checks...[0m
[0;32mAll systems ready.[0m

[1m>>> Acquiring tokens...[0m
[0;32mTokens acquired.[0m

[0;36m=== FR07-EP-001: Verify product addition to cart ===[0m
[0;32m[PASS][0m [1mFR07-EP-001[0m — HTTP 200 (expected 200)

[0;31m[FAIL][0m FR07-EP-001-db — DB: Cart row inserted in DB
       SQL:      SELECT quantity FROM cart_items WHERE user_id=2 AND product_id=6;
       Expected: 2 | Actual: Error: in prepare, no such table: cart_items

[1;33m[TEARDOWN][0m Delete test product 6 via API
  [0;32mDone[0m

[0;36m=== FR07-EP-002: Merge duplicate product ===[0m
[0;32m[PASS][0m [1mFR07-EP-002[0m — HTTP 200 (expected 200)

[0;31m[FAIL][0m FR07-EP-002-db — DB: Quantity merged to 3
       SQL:      SELECT quantity FROM cart_items WHERE user_id=2 AND product_id=7;
       Expected: 3 | Actual: Error: in prepare, no such table: cart_items

[1;33m[TEARDOWN][0m Delete test product 7 via API
  [0;32mDone[0m

[0;36m=== FR07-EP-006: XSS in Name payload ===[0m
[0;32m[PASS][0m [1mFR07-EP-006[0m — HTTP 200 (expected 200)

[0;31m[FAIL][0m FR07-EP-006-db — DB: XSS inserted in DB
       SQL:      SELECT name FROM cart_items WHERE user_id=2 AND product_id=8;
       Expected: <script>alert(1)</script> | Actual: Error: in prepare, no such table: cart_items

[1;33m[TEARDOWN][0m Delete test product 8 via API
  [0;32mDone[0m

[0;36m=== FR07-EP-007: Admin Token Auth ===[0m
[0;32m[PASS][0m [1mFR07-EP-007[0m — HTTP 200 (expected 200)

[0;31m[FAIL][0m FR07-EP-007-db — DB: Admin cart inserted
       SQL:      SELECT quantity FROM cart_items WHERE user_id=1 AND product_id=9;
       Expected: 1 | Actual: Error: in prepare, no such table: cart_items

[1;33m[TEARDOWN][0m Delete test product 9 via API
  [0;32mDone[0m

[0;36m=== FR07-EP-008 to 020: Invalid Parameters ===[0m
[0;31m[FAIL][0m [1mFR07-EP-008[0m — HTTP 200 (expected 400)
        {
            "message": "Added to cart"
        }

[0;31m[FAIL][0m [1mFR07-EP-009[0m — HTTP 200 (expected 400)
        {
            "message": "Added to cart"
        }

[0;31m[FAIL][0m [1mFR07-EP-010[0m — HTTP 200 (expected 400)
        {
            "message": "Added to cart"
        }

[0;31m[FAIL][0m [1mFR07-EP-011[0m — HTTP 200 (expected 400)
        {
            "message": "Added to cart"
        }

[1;33m[TEARDOWN][0m Delete test product 10 via API
  [0;32mDone[0m

[0;31m[FAIL][0m [1mFR07-EP-012[0m — HTTP 200 (expected 400)
        {
            "message": "Added to cart"
        }

[1;33m[TEARDOWN][0m Delete test product 11 via API
  [0;32mDone[0m

[0;31m[FAIL][0m [1mFR07-EP-013[0m — HTTP 200 (expected 400)
        {
            "message": "Added to cart"
        }

[1;33m[TEARDOWN][0m Delete test product 12 via API
  [0;32mDone[0m

[0;31m[FAIL][0m [1mFR07-EP-014[0m — HTTP 200 (expected 400)
        {
            "message": "Added to cart"
        }

[1;33m[TEARDOWN][0m Delete test product 13 via API
  [0;32mDone[0m

[0;31m[FAIL][0m [1mFR07-EP-015[0m — HTTP 200 (expected 400)
        {
            "message": "Added to cart"
        }

[1;33m[TEARDOWN][0m Delete test product 14 via API
  [0;32mDone[0m

[0;31m[FAIL][0m [1mFR07-EP-016[0m — HTTP 200 (expected 400)
        {
            "message": "Added to cart"
        }

[1;33m[TEARDOWN][0m Delete test product 15 via API
  [0;32mDone[0m

[0;31m[FAIL][0m [1mFR07-EP-017[0m — HTTP 200 (expected 400)
        {
            "message": "Added to cart"
        }

[1;33m[TEARDOWN][0m Delete test product 16 via API
  [0;32mDone[0m

[0;31m[FAIL][0m [1mFR07-EP-018[0m — HTTP 200 (expected 400)
        {
            "message": "Added to cart"
        }

[1;33m[TEARDOWN][0m Delete test product 17 via API
  [0;32mDone[0m

[0;31m[FAIL][0m [1mFR07-EP-019[0m — HTTP 200 (expected 400)
        {
            "message": "Added to cart"
        }

[1;33m[TEARDOWN][0m Delete test product 18 via API
  [0;32mDone[0m

[0;31m[FAIL][0m [1mFR07-EP-020[0m — HTTP 200 (expected 400)
        {
            "message": "Added to cart"
        }

[1;33m[TEARDOWN][0m Delete test product 19 via API
  [0;32mDone[0m

[0;36m=== FR07-EP-021 & 022: Role-Auth Checks ===[0m
[0;32m[PASS][0m [1mFR07-EP-021[0m — HTTP 401 (expected 401)

[1;33m[TEARDOWN][0m Delete test product 20 via API
  [0;32mDone[0m

[0;32m[PASS][0m [1mFR07-EP-022[0m — HTTP 401 (expected 401)

[1;33m[TEARDOWN][0m Delete test product 21 via API
  [0;32mDone[0m

[0;36m=== BVA TESTS ===[0m
[0;31m[FAIL][0m [1mFR07-BVA-001[0m — HTTP 200 (expected 400)
        {
            "message": "Added to cart"
        }

[1;33m[TEARDOWN][0m Delete test product 22 via API
  [0;32mDone[0m

[0;31m[FAIL][0m [1mFR07-BVA-002[0m — HTTP 200 (expected 400)
        {
            "message": "Added to cart"
        }

[1;33m[TEARDOWN][0m Delete test product 23 via API
  [0;32mDone[0m

[0;32m[PASS][0m [1mFR07-BVA-003[0m — HTTP 200 (expected 200)

[0;31m[FAIL][0m FR07-BVA-003-db — DB: DB Insert
       SQL:      SELECT quantity FROM cart_items WHERE user_id=2 AND product_id=24;
       Expected: 1 | Actual: Error: in prepare, no such table: cart_items

[1;33m[TEARDOWN][0m Delete test product 24 via API
  [0;32mDone[0m

[0;32m[PASS][0m [1mFR07-BVA-004[0m — HTTP 200 (expected 200)

[0;31m[FAIL][0m FR07-BVA-004-db — DB: DB Insert
       SQL:      SELECT quantity FROM cart_items WHERE user_id=2 AND product_id=25;
       Expected: 2 | Actual: Error: in prepare, no such table: cart_items

[1;33m[TEARDOWN][0m Delete test product 25 via API
  [0;32mDone[0m

[0;32m[PASS][0m [1mFR07-BVA-005[0m — HTTP 200 (expected 200)

[0;31m[FAIL][0m FR07-BVA-005-db — DB: DB Insert
       SQL:      SELECT quantity FROM cart_items WHERE user_id=2 AND product_id=26;
       Expected: 5 | Actual: Error: in prepare, no such table: cart_items

[1;33m[TEARDOWN][0m Delete test product 26 via API
  [0;32mDone[0m

[0;32m[PASS][0m [1mFR07-BVA-006[0m — HTTP 200 (expected 200)

[0;31m[FAIL][0m FR07-BVA-006-db — DB: DB Insert
       SQL:      SELECT quantity FROM cart_items WHERE user_id=2 AND product_id=27;
       Expected: 9999 | Actual: Error: in prepare, no such table: cart_items

[1;33m[TEARDOWN][0m Delete test product 27 via API
  [0;32mDone[0m

[0;31m[FAIL][0m [1mFR07-BVA-007[0m — HTTP 200 (expected 400)
        {
            "message": "Added to cart"
        }

[1;33m[TEARDOWN][0m Delete test product 28 via API
  [0;32mDone[0m

[0;31m[FAIL][0m [1mFR07-BVA-008[0m — HTTP 200 (expected 400)
        {
            "message": "Added to cart"
        }

[1;33m[TEARDOWN][0m Delete test product 29 via API
  [0;32mDone[0m

[0;32m[PASS][0m [1mFR07-BVA-009[0m — HTTP 200 (expected 200)

[0;31m[FAIL][0m FR07-BVA-009-db — DB: DB Insert
       SQL:      SELECT price FROM cart_items WHERE user_id=2 AND product_id=30;
       Expected: 1 | Actual: Error: in prepare, no such table: cart_items

[1;33m[TEARDOWN][0m Delete test product 30 via API
  [0;32mDone[0m

[0;32m[PASS][0m [1mFR07-BVA-010[0m — HTTP 200 (expected 200)

[0;31m[FAIL][0m FR07-BVA-010-db — DB: DB Insert
       SQL:      SELECT price FROM cart_items WHERE user_id=2 AND product_id=31;
       Expected: 2 | Actual: Error: in prepare, no such table: cart_items

[1;33m[TEARDOWN][0m Delete test product 31 via API
  [0;32mDone[0m

[0;32m[PASS][0m [1mFR07-BVA-011[0m — HTTP 200 (expected 200)

[0;31m[FAIL][0m FR07-BVA-011-db — DB: DB Insert
       SQL:      SELECT price FROM cart_items WHERE user_id=2 AND product_id=32;
       Expected: 100000 | Actual: Error: in prepare, no such table: cart_items

[1;33m[TEARDOWN][0m Delete test product 32 via API
  [0;32mDone[0m

[0;32m[PASS][0m [1mFR07-BVA-012[0m — HTTP 200 (expected 200)

[0;31m[FAIL][0m FR07-BVA-012-db — DB: DB Insert
       SQL:      SELECT price FROM cart_items WHERE user_id=2 AND product_id=33;
       Expected: 2000000000 | Actual: Error: in prepare, no such table: cart_items

[1;33m[TEARDOWN][0m Delete test product 33 via API
  [0;32mDone[0m

[0;31m[FAIL][0m [1mFR07-BVA-013[0m — HTTP 200 (expected 400)
        {
            "message": "Added to cart"
        }

[1;33m[TEARDOWN][0m Delete test product 34 via API
  [0;32mDone[0m

[0;32m[PASS][0m [1mFR07-BVA-014[0m — HTTP 200 (expected 200)

[0;31m[FAIL][0m FR07-BVA-014-db — DB: DB Insert
       SQL:      SELECT quantity FROM cart_items WHERE user_id=2 AND product_id=35;
       Expected: 1 | Actual: Error: in prepare, no such table: cart_items

[1;33m[TEARDOWN][0m Delete test product 35 via API
  [0;32mDone[0m

[0;32m[PASS][0m [1mFR07-BVA-015[0m — HTTP 200 (expected 200)

[0;31m[FAIL][0m FR07-BVA-015-db — DB: DB Insert
       SQL:      SELECT quantity FROM cart_items WHERE user_id=2 AND product_id=36;
       Expected: 1 | Actual: Error: in prepare, no such table: cart_items

[1;33m[TEARDOWN][0m Delete test product 36 via API
  [0;32mDone[0m

[0;32m[PASS][0m [1mFR07-BVA-016[0m — HTTP 200 (expected 200)

[0;31m[FAIL][0m FR07-BVA-016-db — DB: DB Insert
       SQL:      SELECT quantity FROM cart_items WHERE user_id=2 AND product_id=37;
       Expected: 1 | Actual: Error: in prepare, no such table: cart_items

[1;33m[TEARDOWN][0m Delete test product 37 via API
  [0;32mDone[0m

[0;32m[PASS][0m [1mFR07-BVA-017[0m — HTTP 200 (expected 200)

[0;31m[FAIL][0m FR07-BVA-017-db — DB: DB Insert
       SQL:      SELECT quantity FROM cart_items WHERE user_id=2 AND product_id=38;
       Expected: 1 | Actual: Error: in prepare, no such table: cart_items

[1;33m[TEARDOWN][0m Delete test product 38 via API
  [0;32mDone[0m

[0;32m[PASS][0m [1mFR07-BVA-018[0m — HTTP 200 (expected 200)

[0;31m[FAIL][0m FR07-BVA-018-db — DB: DB Insert
       SQL:      SELECT quantity FROM cart_items WHERE user_id=2 AND product_id=39;
       Expected: 1 | Actual: Error: in prepare, no such table: cart_items

[1;33m[TEARDOWN][0m Delete test product 39 via API
  [0;32mDone[0m

[0;31m[FAIL][0m [1mFR07-BVA-019[0m — HTTP 200 (expected 400)
        {
            "message": "Added to cart"
        }

[1;33m[TEARDOWN][0m Delete test product 40 via API
  [0;32mDone[0m

[0;31m[FAIL][0m [1mFR07-BVA-020[0m — HTTP 200 (expected 400)
        {
            "message": "Added to cart"
        }

[1;33m[TEARDOWN][0m Delete test product 41 via API
  [0;32mDone[0m

[1;33m>>> Cleaning up temporary payload files...[0m
  [0;32mDone. Only API responses are kept.[0m

[1m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[0m
[1m FR-07 TEST RESULTS — AUTOMATED CHECKS[0m
[1m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[0m
  TC ID / Check        Expected                       Actual                                        Status
  ──────────────────────────────────────────────────────────────────
  [0;31mFR07-EP-001          2                              Error: in prepare, no such table: cart_items  FAIL[0m
  [0;31mFR07-EP-002          3                              Error: in prepare, no such table: cart_items  FAIL[0m
  [0;31mFR07-EP-006          <script>alert(1)</script>      Error: in prepare, no such table: cart_items  FAIL[0m
  [0;31mFR07-EP-007          1                              Error: in prepare, no such table: cart_items  FAIL[0m
  [0;31mFR07-EP-008          HTTP 400                       HTTP 200                                      FAIL[0m
  [0;31mFR07-EP-009          HTTP 400                       HTTP 200                                      FAIL[0m
  [0;31mFR07-EP-010          HTTP 400                       HTTP 200                                      FAIL[0m
  [0;31mFR07-EP-011          HTTP 400                       HTTP 200                                      FAIL[0m
  [0;31mFR07-EP-012          HTTP 400                       HTTP 200                                      FAIL[0m
  [0;31mFR07-EP-013          HTTP 400                       HTTP 200                                      FAIL[0m
  [0;31mFR07-EP-014          HTTP 400                       HTTP 200                                      FAIL[0m
  [0;31mFR07-EP-015          HTTP 400                       HTTP 200                                      FAIL[0m
  [0;31mFR07-EP-016          HTTP 400                       HTTP 200                                      FAIL[0m
  [0;31mFR07-EP-017          HTTP 400                       HTTP 200                                      FAIL[0m
  [0;31mFR07-EP-018          HTTP 400                       HTTP 200                                      FAIL[0m
  [0;31mFR07-EP-019          HTTP 400                       HTTP 200                                      FAIL[0m
  [0;31mFR07-EP-020          HTTP 400                       HTTP 200                                      FAIL[0m
  [0;32mFR07-EP-021          HTTP 401                       HTTP 401                                      PASS[0m
  [0;32mFR07-EP-022          HTTP 401                       HTTP 401                                      PASS[0m
  [0;31mFR07-BVA-001         HTTP 400                       HTTP 200                                      FAIL[0m
  [0;31mFR07-BVA-002         HTTP 400                       HTTP 200                                      FAIL[0m
  [0;31mFR07-BVA-003         1                              Error: in prepare, no such table: cart_items  FAIL[0m
  [0;31mFR07-BVA-004         2                              Error: in prepare, no such table: cart_items  FAIL[0m
  [0;31mFR07-BVA-005         5                              Error: in prepare, no such table: cart_items  FAIL[0m
  [0;31mFR07-BVA-006         9999                           Error: in prepare, no such table: cart_items  FAIL[0m
  [0;31mFR07-BVA-007         HTTP 400                       HTTP 200                                      FAIL[0m
  [0;31mFR07-BVA-008         HTTP 400                       HTTP 200                                      FAIL[0m
  [0;31mFR07-BVA-009         1                              Error: in prepare, no such table: cart_items  FAIL[0m
  [0;31mFR07-BVA-010         2                              Error: in prepare, no such table: cart_items  FAIL[0m
  [0;31mFR07-BVA-011         100000                         Error: in prepare, no such table: cart_items  FAIL[0m
  [0;31mFR07-BVA-012         2000000000                     Error: in prepare, no such table: cart_items  FAIL[0m
  [0;31mFR07-BVA-013         HTTP 400                       HTTP 200                                      FAIL[0m
  [0;31mFR07-BVA-014         1                              Error: in prepare, no such table: cart_items  FAIL[0m
  [0;31mFR07-BVA-015         1                              Error: in prepare, no such table: cart_items  FAIL[0m
  [0;31mFR07-BVA-016         1                              Error: in prepare, no such table: cart_items  FAIL[0m
  [0;31mFR07-BVA-017         1                              Error: in prepare, no such table: cart_items  FAIL[0m
  [0;31mFR07-BVA-018         1                              Error: in prepare, no such table: cart_items  FAIL[0m
  [0;31mFR07-BVA-019         HTTP 400                       HTTP 200                                      FAIL[0m
  [0;31mFR07-BVA-020         HTTP 400                       HTTP 200                                      FAIL[0m
  ──────────────────────────────────────────────────────────────────
  [1mTOTAL (automated): [0;32m2 PASS[0m | [0;31m37 FAIL[0m | [1;33m0 SKIP[0m

[1;33m  Still requires manual testing:[0m
    UI-only TCs : FR07-EP-003 → open http://localhost:5173
    DOM checks  : paste scripts/curl/FR07-dom-checks.js into DevTools
[1m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[0m

Response JSON files saved to: evidence/api-responses/FR07/
Paste the summary block above into Phase B prompt.
