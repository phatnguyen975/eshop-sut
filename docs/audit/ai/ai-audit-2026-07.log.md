# AI Audit Log — July 2026

> **Last updated:** 2026-07-24T03:35:00+07:00

## Monthly Statistics

- **Period:** 2026-07-01 → 2026-07-24
- **Total Interactions:** 13
- **Models Used:** Gemini 3.1 Pro (High) (8), Claude Sonnet 4.6 (Thinking) (5)

### Status Breakdown

| Status        | Count  | %   |
| ------------- | ------ | --- |
| ✅ VALID      | 11     | 85% |
| ⚠️ PARTIAL    | 2      | 15% |
| 🔄 REVISED    | 0      | 0%  |
| ❌ INVALID    | 0      | 0%  |
| 🔲 INCOMPLETE | 0      | 0%  |
| ⏳ PENDING    | 0      | 0%  |
| **Total**     | **13** |     |

### Tag Breakdown

| Tag             | Count |
| --------------- | ----- |
| `file-output`   | 10    |
| `documentation` | 7     |
| `devops`        | 5     |
| `design`        | 4     |
| `testing`       | 4     |
| `planning`      | 3     |
| `analysis`      | 1     |
| `code-gen`      | 1     |
| `refactor`      | 1     |

### Quality Metrics

- **Acceptance Rate** (VALID + PARTIAL / Total): 100%
- **Revision Rate** (REVISED / Total): 0%
- **Failure Rate** (INVALID + INCOMPLETE / Total): 0%

## [AI-AUDIT-001] 2026-07-12T11:13:56+07:00

### Metadata

- **Model:** Gemini 3.1 Pro (High)
- **Tags:** `design` · `documentation` · `file-output`
- **Status:** ✅ VALID

### Prompt

```prompt
/wat-scope
```

### Output

- `docs/test-scope.md` — Updated status to APPROVED and displayed a summary of the scenarios.

### Evaluation

| Field    | Detail                                                |
| -------- | ----------------------------------------------------- |
| Status   | ✅ VALID                                              |
| Reason   | The scenarios generated match the system descriptions |
| Revised  | No                                                    |
| Revision | N/A                                                   |

## [AI-AUDIT-002] 2026-07-14T16:06:40+07:00

### Metadata

- **Model:** Claude Sonnet 4.6 (Thinking)
- **Tags:** `design` · `documentation` · `file-output`
- **Status:** ✅ VALID

### Prompt

```prompt
/wat-spec SC-01
```

### Output

- `docs/scenarios/SC-01/spec.md` — Created spec.md with both Phase 1 (flow) and Phase 2 (test data matrix).

### Evaluation

| Field    | Detail                                                                          |
| -------- | ------------------------------------------------------------------------------- |
| Status   | ✅ VALID                                                                        |
| Reason   | The detailed specs and data set for SC-01 have been created fully and in detail |
| Revised  | No                                                                              |
| Revision | N/A                                                                             |

## [AI-AUDIT-003] 2026-07-15T02:56:44+07:00

### Metadata

- **Model:** Gemini 3.1 Pro (High)
- **Tags:** `devops` · `planning` · `file-output`
- **Status:** ✅ VALID

### Prompt

```prompt
/playwright-skill Tiếp theo tôi cần bạn áp dụng playwright-skill để giúp tôi tích hợp ci (tôi không biết là best practice thì ci thường chạy regression testing hay sao, kết hợp sharding). Lưu trong .github/workflows/, và lưu ý branch chính hiện tại là web-automation-testing chứ không phải main, nghĩa là khi có code push lên hay merge vào web-automation-testing thì sẽ trigger nó. Đảm bảo các config tối ưu nhất, best practice nhất. Sau đó hướng dẫn tôi để test thử xem ci hoạt động đúng hay không. Và tôi thắc mắc là best practice khi làm regression testing có phải là Partial Regression không, nghĩa là làm cho các flow chúng ta thiết kế, nếu đúng thì hiện tại chỉ cần thiết kế cho SC-01 là được
```

### Output

- `.github/workflows/playwright-smoke.yml` — Initial smoke CI workflow
- `.github/workflows/playwright-regression.yml` — Initial regression CI workflow with sharding
- `e2e/playwright.config.ts` — Updated Playwright reporter configuration for CI

### Evaluation

| Field    | Detail                                                                                                                                                 |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Status   | ✅ VALID                                                                                                                                               |
| Reason   | The AI successfully created the foundational CI workflows with sharding and properly explained regression testing concepts as per Playwright practices |
| Revised  | No                                                                                                                                                     |
| Revision | N/A                                                                                                                                                    |

## [AI-AUDIT-004] 2026-07-15T03:00:54+07:00

### Metadata

- **Model:** Gemini 3.1 Pro (High)
- **Tags:** `devops` · `documentation`
- **Status:** ✅ VALID

### Prompt

```prompt
Tôi thắc mắc là mỗi file có chức năng gì, và nếu tôi chỉ chạy localhost thì có làm được ci không
```

### Output

```markdown
Explained the purpose of `playwright-smoke.yml` and `playwright-regression.yml`. Provided methods for running CI against a local environment by configuring the Playwright `webServer` option or by starting background processes in GitHub Actions steps.
```

### Evaluation

| Field    | Detail                                                                                                       |
| -------- | ------------------------------------------------------------------------------------------------------------ |
| Status   | ✅ VALID                                                                                                     |
| Reason   | The AI accurately explained the workflows' purposes and provided correct strategies for localhost CI testing |
| Revised  | No                                                                                                           |
| Revision | N/A                                                                                                          |

## [AI-AUDIT-005] 2026-07-15T03:16:07+07:00

### Metadata

- **Model:** Gemini 3.1 Pro (High)
- **Tags:** `devops` · `planning` · `file-output`
- **Status:** ✅ VALID

### Prompt

```prompt
Hiện tại tôi mới deploy cho backend và frontend-web (có sẵn 2 URL rồi), còn frontend-admin thì chưa, nhưng tôi vẫn muốn setup luôn cho cả frontend-web và frontend-admin luôn. Đồng thời do đây là monorepo nên chúng ta cần check là nếu code update cho cái nào thì mới trigger cái đó, chứ không phải cứ push lên nó trigger cả 2. Và tôi thắc mắc chạy regression test là chạy lại toàn bộ test case cho web hay admin luôn hay sao, chứ chúng ta không viết thêm các regression test riêng phải không. Đồng thời trên GitHub tôi cần setup thêm những gì thì bạn cũng cần ghi hướng dẫn chi tiết cho tôi luôn, ghi vào file setup-ci-guide.md ở root.
```

### Output

- `.github/workflows/playwright-smoke.yml` — Refactored to use `dorny/paths-filter` for monorepo
- `.github/workflows/playwright-regression.yml` — Refactored to use `dorny/paths-filter` and dynamic project flags
- `setup-ci-guide.md` — Created comprehensive guide for configuring GitHub Secrets and Variables

### Evaluation

| Field    | Detail                                                                                                                      |
| -------- | --------------------------------------------------------------------------------------------------------------------------- |
| Status   | ✅ VALID                                                                                                                    |
| Reason   | The workflows were successfully updated with monorepo path filters, and a clear setup guide was created as per requirements |
| Revised  | No                                                                                                                          |
| Revision | N/A                                                                                                                         |

## [AI-AUDIT-006] 2026-07-15T04:06:52+07:00

### Metadata

- **Model:** Gemini 3.1 Pro (High)
- **Tags:** `devops` · `documentation`
- **Status:** ✅ VALID

### Prompt

```prompt
Tôi cần bạn giải thích lại là nó chỉ chạy khi nào, khi demo thì ví dụ tôi cần thêm comment ở đâu để nó trigger
```

### Output

```markdown
Provided a detailed explanation of exactly when the monorepo path filters evaluate to true, and gave concrete examples of which files to edit (e.g., adding a comment in `sc-01-auth-smoke.spec.ts`) to safely trigger a CI run for a live demonstration.
```

### Evaluation

| Field    | Detail                                                                                                           |
| -------- | ---------------------------------------------------------------------------------------------------------------- |
| Status   | ✅ VALID                                                                                                         |
| Reason   | The AI gave clear and actionable instructions for demonstrating the monorepo CI functionality to a live audience |
| Revised  | No                                                                                                               |
| Revision | N/A                                                                                                              |

## [AI-AUDIT-007] 2026-07-15T04:08:41+07:00

### Metadata

- **Model:** Gemini 3.1 Pro (High)
- **Tags:** `devops` · `analysis`
- **Status:** ✅ VALID

### Prompt

```prompt
Tôi thắc mắc là với frontend-admin nó không trigger khi backend có thay đổi như frontend-web hả
```

### Output

```markdown
Clarified that backend changes DO trigger the admin test suite, quoting the relevant `backend/**` path rule included under the `admin` filter configuration in the generated YAML files.
```

### Evaluation

| Field    | Detail                                                                                                               |
| -------- | -------------------------------------------------------------------------------------------------------------------- |
| Status   | ✅ VALID                                                                                                             |
| Reason   | The AI accurately analyzed its own generated code and correctly resolved the user's confusion regarding the triggers |
| Revised  | No                                                                                                                   |
| Revision | N/A                                                                                                                  |

## [AI-AUDIT-008] 2026-07-15T19:50:53+07:00

### Metadata

- **Model:** Claude Sonnet 4.6 (Thinking)
- **Tags:** `design` · `planning` · `file-output`
- **Status:** ✅ VALID

### Prompt

```prompt
/wat-spec SC-02
```

### Output

- `docs/scenarios/SC-02/spec.md` — Created scenario specification Phase 1 (flow) for SC-02.

### Evaluation

| Field    | Detail                                                                                                                        |
| -------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Status   | ✅ VALID                                                                                                                      |
| Reason   | AI successfully generated a complete and accurate Phase 1 scenario specification for SC-02 based on the provided requirements |
| Revised  | No                                                                                                                            |
| Revision | N/A                                                                                                                           |

## [AI-AUDIT-009] 2026-07-15T20:27:46+07:00

### Metadata

- **Model:** Claude Sonnet 4.6 (Thinking)
- **Tags:** `testing` · `documentation` · `file-output`
- **Status:** ⚠️ PARTIAL

### Prompt

```prompt
Tôi có thắc mắc tại sao bạn lại nhắc teardown trong beforeEach, chúng ta không dùng fixture hay sao
```

### Output

- `docs/scenarios/SC-02/spec.md` — Fixed preconditions section to reference fixture-based cart cleanup instead of `beforeEach`.

### Evaluation

| Field    | Detail                                                                                                                                                    |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Status   | ⚠️ PARTIAL                                                                                                                                                |
| Reason   | AI incorrectly suggested using beforeEach for teardown instead of the agreed-upon fixture pattern. This was caught by the user and subsequently corrected |
| Revised  | Yes                                                                                                                                                       |
| Revision | Fixed spec to correctly specify the `emptyCart` fixture for pre-test isolation                                                                            |

## [AI-AUDIT-010] 2026-07-15T20:31:57+07:00

### Metadata

- **Model:** Claude Sonnet 4.6 (Thinking)
- **Tags:** `testing` · `design` · `file-output`
- **Status:** ✅ VALID

### Prompt

```prompt
APPROVED
Tiếp tục thực hiện phase 2, tạo ra các nội dung đúng, đầy đủ và chi tiết nhất
```

### Output

- `docs/scenarios/SC-02/spec.md` — Appended full Phase 2 test data matrix covering Domain Testing, Decision Table, and Error Guessing.

### Evaluation

| Field    | Detail                                                                                                                 |
| -------- | ---------------------------------------------------------------------------------------------------------------------- |
| Status   | ✅ VALID                                                                                                               |
| Reason   | AI accurately applied functional test design techniques to generate a comprehensive Phase 2 test data matrix for SC-02 |
| Revised  | No                                                                                                                     |
| Revision | N/A                                                                                                                    |

## [AI-AUDIT-011] 2026-07-15T20:36:26+07:00

### Metadata

- **Model:** Claude Sonnet 4.6 (Thinking)
- **Tags:** `documentation` · `file-output`
- **Status:** ✅ VALID

### Prompt

```prompt
APPROVED
Hãy update status và đợi tôi đưa ra yêu cầu tiếp theo
```

### Output

- `docs/scenarios/SC-02/spec.md` — Updated spec status to APPROVED after Gate B human approval.

### Evaluation

| Field    | Detail                                                                                                 |
| -------- | ------------------------------------------------------------------------------------------------------ |
| Status   | ✅ VALID                                                                                               |
| Reason   | AI successfully updated the scenario specification status to APPROVED and awaited further instructions |
| Revised  | No                                                                                                     |
| Revision | N/A                                                                                                    |

## [AI-AUDIT-012] 2026-07-24T03:22:29+07:00

### Metadata

- **Model:** Gemini 3.1 Pro (High)
- **Tags:** `code-gen` · `testing` · `file-output`
- **Status:** ✅ VALID

### Prompt

```prompt
wat-build SC-02
```

### Output

- `e2e/pages/web/cart.page.ts` — Created Page Object Model (POM) for the Cart page including breadcrumbs, table elements, summary, and dialog locators.

### Evaluation

| Field    | Detail                                                                                                     |
| -------- | ---------------------------------------------------------------------------------------------------------- |
| Status   | ✅ VALID                                                                                                   |
| Reason   | AI successfully generated the POM for the Cart page according to the approved spec and Playwright patterns |
| Revised  | No                                                                                                         |
| Revision | N/A                                                                                                        |

## [AI-AUDIT-013] 2026-07-24T03:28:29+07:00

### Metadata

- **Model:** Gemini 3.1 Pro (High)
- **Tags:** `refactor` · `testing` · `file-output`
- **Status:** ⚠️ PARTIAL

### Prompt

```prompt
FAILED
Có vẻ như bạn quên là khi giỏ hàng trống phải có Tiếp tục mua sắm để quay về trang chủ
```

### Output

- `e2e/pages/web/cart.page.ts` — Added `continueShoppingButton` locator and `continueShopping()` action method.

### Evaluation

| Field    | Detail                                                                                                                     |
| -------- | -------------------------------------------------------------------------------------------------------------------------- |
| Status   | ⚠️ PARTIAL                                                                                                                 |
| Reason   | AI missed the "Tiếp tục mua sắm" button for the empty cart state initially, but successfully added it after human feedback |
| Revised  | Yes                                                                                                                        |
| Revision | Added missing locator and method for the empty cart's continue shopping button                                             |
