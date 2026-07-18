# Boundary Value Analysis — Reference Guide

## Purpose

This reference covers the complete application of BVA: boundary point definitions, data type increments, BVA variants, and when to apply each. Use during **Step 3** of the design process.

## Boundary Points Defined

For any **ordered** (sequential / range) equivalence class with a valid range of [LB, UB]:

| Point   | Notation               | Classification | Description                                       |
| ------- | ---------------------- | -------------- | ------------------------------------------------- |
| LB − 1  | Just below lower bound | **Invalid**    | First value below the valid range                 |
| LB      | Lower Boundary         | **Valid**      | Exact minimum valid value                         |
| LB + 1  | Just above lower bound | **Valid**      | First value above the minimum                     |
| Nominal | Mid-range              | **Valid**      | Representative from the center of the valid range |
| UB − 1  | Just below upper bound | **Valid**      | Last value below the maximum                      |
| UB      | Upper Boundary         | **Valid**      | Exact maximum valid value                         |
| UB + 1  | Just above upper bound | **Invalid**    | First value above the valid range                 |

## BVA Variants

### 2-Value BVA (Standard)

Test each boundary with **2 points** — just outside and the boundary itself.

For range `[LB, UB]`, test: `LB-1`, `LB`, `UB`, `UB+1`

**When to use:** Standard functional testing, lower-risk systems, when test count needs to be minimized.

### 3-Value BVA (Extended)

Test each boundary with **3 points** — just outside, the boundary itself, and just inside.

For range `[LB, UB]`, test: `LB-1`, `LB`, `LB+1`, `UB-1`, `UB`, `UB+1`

**When to use:** High-risk systems, safety-critical applications, when off-by-one errors inside the valid range are a significant concern.

### Choosing Between Variants

| Factor                                    | Recommended Variant               |
| ----------------------------------------- | --------------------------------- |
| Standard functional testing               | 2-value BVA                       |
| High-risk / safety-critical system        | 3-value BVA                       |
| History of off-by-one defects in codebase | 3-value BVA                       |
| Under time/resource pressure              | 2-value BVA                       |
| Certification or audit requirements       | 3-value BVA (higher traceability) |

## Always Include a Nominal Value

Regardless of BVA variant, always include at least one **nominal value** — a value from the interior of the valid range (not near any boundary). This confirms core logic works independently of boundary conditions.

**Recommended:** Pick the midpoint of the valid range. Example: for range [10, 50], nominal = 30.

## Minimum Increment by Data Type

The "just inside" and "just outside" boundary points require defining the **smallest meaningful step** for the data type in use.

| Data Type          | Minimum Increment                              | Notes                                          |
| ------------------ | ---------------------------------------------- | ---------------------------------------------- |
| Integer            | 1                                              | LB−1 = LB minus 1, UB+1 = UB plus 1            |
| Float / Decimal    | Smallest precision unit                        | For 2 decimal places: 0.01; for currency: 0.01 |
| String length      | 1 character                                    | LB-1 = one character shorter than minimum      |
| Date               | 1 day                                          | Day before LB, day after UB                    |
| Time               | 1 second (or smallest unit in spec)            | Depends on system granularity                  |
| List / Array count | 1 item                                         | One fewer or one more item than the limit      |
| File size          | 1 byte (or smallest unit meaningful to system) | Confirm with spec                              |

## BVA Applied Across Data Types

### Numeric Range

**Requirement:** "Discount percentage must be between 0 and 100 (inclusive)."

| Test Point | Value | Class   | BVA Variant  |
| ---------- | ----- | ------- | ------------ |
| LB − 1     | −1    | Invalid | Both         |
| LB         | 0     | Valid   | Both         |
| LB + 1     | 1     | Valid   | 3-value only |
| Nominal    | 50    | Valid   | Both         |
| UB − 1     | 99    | Valid   | 3-value only |
| UB         | 100   | Valid   | Both         |
| UB + 1     | 101   | Invalid | Both         |

### String Length

**Requirement:** "Password must be between 8 and 20 characters (inclusive)."

| Test Point | Length   | Example Value    | Class   | BVA Variant  |
| ---------- | -------- | ---------------- | ------- | ------------ |
| LB − 1     | 7 chars  | "Abc123!"        | Invalid | Both         |
| LB         | 8 chars  | "Abc123!@"       | Valid   | Both         |
| LB + 1     | 9 chars  | "Abc123!@#"      | Valid   | 3-value only |
| Nominal    | 14 chars | "Abc123!@#DefGh" | Valid   | Both         |
| UB − 1     | 19 chars | (19-char string) | Valid   | 3-value only |
| UB         | 20 chars | (20-char string) | Valid   | Both         |
| UB + 1     | 21 chars | (21-char string) | Invalid | Both         |

### Date Boundary

**Requirement:** "User must be at least 18 years old to register. Date of birth is used to determine age."

| Test Point | Date of Birth (relative to today)        | Age                | Class   |
| ---------- | ---------------------------------------- | ------------------ | ------- |
| LB − 1     | Today's date minus 18 years, plus 1 day  | 17 years, 364 days | Invalid |
| LB         | Today's date minus 18 years exactly      | Exactly 18         | Valid   |
| LB + 1     | Today's date minus 18 years, minus 1 day | 18 years, 1 day    | Valid   |

### List / Array Count

**Requirement:** "A shopping cart must contain between 1 and 10 items."

| Test Point | Item Count | Class                |
| ---------- | ---------- | -------------------- |
| LB − 1     | 0 items    | Invalid              |
| LB         | 1 item     | Valid                |
| LB + 1     | 2 items    | Valid (3-value only) |
| Nominal    | 5 items    | Valid                |
| UB − 1     | 9 items    | Valid (3-value only) |
| UB         | 10 items   | Valid                |
| UB + 1     | 11 items   | Invalid              |

## When BVA Does NOT Apply

BVA is only meaningful for **ordered, sequential domains** where the concept of "just inside" and "just outside" has meaning.

**Do NOT apply BVA to:**

| Field Type                                                          | Reason                                               |
| ------------------------------------------------------------------- | ---------------------------------------------------- |
| Discrete enumeration (e.g., status = ACTIVE, INACTIVE, PENDING)     | No ordering — "just outside" has no meaning          |
| Boolean / flag fields (true/false, 0/1)                             | Only two values exist; both are already tested by EP |
| Categorical data (e.g., gender = M/F/Other, color = Red/Green/Blue) | No numeric ordering between values                   |
| Unordered sets (e.g., set of permissions, set of tags)              | No boundary concept                                  |

For these types, EP representative values are sufficient.

## BVA Quick Reference Card

```
ORDERED RANGE [LB, UB]
───────────────────────────────────────────────────────────

  Invalid │    Valid    │ Nominal │    Valid    │ Invalid
          │             │         │             │
  LB−1    LB   LB+1   ....  mid  ....   UB−1   UB   UB+1
   ↑      ↑     ↑                         ↑     ↑     ↑
  Both   Both  3-val                   3-val  Both  Both

2-value BVA: LB−1, LB, UB, UB+1 (+ Nominal)
3-value BVA: LB−1, LB, LB+1, UB−1, UB, UB+1 (+ Nominal)
```
