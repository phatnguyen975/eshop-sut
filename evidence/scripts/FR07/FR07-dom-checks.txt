━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 FR-07 DOM CHECK RESULTS                
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[PASS] FR07-EP-006 — No raw <script> tag injected into DOM (per SEC-04)
      Expected: SAFE | Actual: SAFE
[FAIL] FR07-DOM-H1 — Page has exactly 1 <h1> tag (per FR-21)
      Expected: 1 | Actual: 0
[FAIL] FR07-DOM-TOTAL — Display 'Tổng cộng' (not 'Tổng tạm tính')
      Expected: EXISTS | Actual: FOUND_WRONG_LABEL: Tổng tạm tính
[PASS] FR07-DOM-BTN — Display 'Tiếp tục mua sắm' or 'Mua tiếp' button
      Expected: EXISTS | Actual: EXISTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL: 2 PASS | 2 FAIL
