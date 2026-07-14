# Review Notes: Customer completes registration then logs in and browses product catalog

**Scenario ID:** SC-01  
**Reviewed:** 2026-07-15  
**Reviewer:** AI (`wat-review` skill)  
**Status:** COMPLETED

## Axis 1 — Playwright Golden Rule Conformance

### FINDING-01 [Non-blocking]

**File:** `e2e/pages/web/home.page.ts`  
**Location:** Line 44  
**Rule violated:** Locator defined at class level  
**Description:** A dynamic locator is created inside a method body (`productCard`) instead of being defined entirely as a class property. While this is often necessary for dynamic parameter injection (like searching by name), it technically violates the strict "locators as properties only" rule. It is non-blocking because it returns a filtered `Locator` object without asserting or executing actions.  
**Evidence:**

```typescript
// Current code (line 44)
productCard(name: string): Locator {
  return this.productCards.filter({ hasText: name });
}
```

**Expected:** Strictly speaking, dynamic locators are a known edge case. No fix is strictly required unless the team prefers a different pattern.

**Human decision:** [X] `CONFIRMED` — reason: Agree with the description / [ ] `DISMISSED` — reason: ...

## Axis 2 — Spec Coverage

No findings.  
All 11 flow steps are implemented in `sc-01-auth-flow.spec.ts`.  
All 14 Registration variants (EP/BVA), 6 Login variants (EP/Error Guessing), and 4 Search variants (EP/Error Guessing) are implemented correctly using `for...of` data-driven loops in their respective validation specs.

## Axis 3 — Test Isolation

No findings.  
Shared mutable state (e.g. `userId`) was refactored out.  
The `cleanup` registry fixture is correctly implemented and called immediately after in-test data creation in both E2E flow and API tests.  
Fixtures in `index.ts` include `.catch()` in their teardown hooks.

## Axis 4 — Security Coverage

No findings.  
The specific security checks required by SC-01 (SEC-04 XSS injection in Search and API missing field handling) are covered in the validation specs.  
This scenario does not invoke any role-protected or authenticated endpoints (Registration, Login, and Product Search are all public endpoints), hence Unauthenticated/Wrong-role access checks are not applicable here.

## Summary

| Finding ID | Classification | Axis         | Status |
| ---------- | -------------- | ------------ | ------ |
| FINDING-01 | Non-blocking   | Golden Rules | FIXED  |
