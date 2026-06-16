# Boundary Value Analysis — FR-07: Shopping Cart

## Boundary Variables Identified

| Variable      | Data Type        | LB  | UB          | Increment | Note                                       |
| ------------- | ---------------- | --- | ----------- | --------- | ------------------------------------------ |
| `quantity`    | integer          | 1   | unspecified | 1         | Per FR-06/FR-07 (must be positive integer) |
| `price`       | number (integer) | 1   | unspecified | 1         | Per FR-15 (must be > 0)                    |
| `name` length | integer (string) | 1   | 255         | 1 char    | Implicit DB VARCHAR(255) constraint        |

## BVA Table 1: `quantity` (integer)

**Constraint:** `quantity >= 1`  
**LB = 1, UB = unspecified**

| TC ID        | BVA Point       | Test Value | Valid/Invalid    | Expected Result                              |
| ------------ | --------------- | ---------- | ---------------- | -------------------------------------------- |
| FR07-BVA-001 | -α (empty)      | `null`     | Invalid          | Reject: quantity is required                 |
| FR07-BVA-002 | LB-1            | `0`        | Invalid          | Reject or remove item (boundary gap per SRS) |
| FR07-BVA-003 | LB (exact)      | `1`        | Valid            | Accept: quantity set to 1                    |
| FR07-BVA-004 | LB+1            | `2`        | Valid            | Accept: quantity set to 2                    |
| FR07-BVA-005 | Nominal         | `5`        | Valid            | Accept: quantity set to 5                    |
| FR07-BVA-006 | UB-1            | N/A        | —                | —                                            |
| FR07-BVA-007 | UB              | N/A        | —                | —                                            |
| FR07-BVA-008 | UB+1            | N/A        | —                | —                                            |
| FR07-BVA-009 | +α (very large) | `9999`     | Invalid (likely) | Reject (system limit exceeded) or accept     |

## BVA Table 2: `price` (number)

**Constraint:** `price > 0` (minimum 1 ₫)  
**LB = 1, UB = unspecified**

| TC ID        | BVA Point       | Test Value   | Valid/Invalid    | Expected Result                          |
| ------------ | --------------- | ------------ | ---------------- | ---------------------------------------- |
| FR07-BVA-010 | -α (empty)      | `null`       | Invalid          | Reject: price is required                |
| FR07-BVA-011 | LB-1            | `0`          | Invalid          | Reject: price must be > 0                |
| FR07-BVA-012 | LB (exact)      | `1`          | Valid            | Accept: item added with 1 ₫ price        |
| FR07-BVA-013 | LB+1            | `2`          | Valid            | Accept: item added with 2 ₫ price        |
| FR07-BVA-014 | Nominal         | `100000`     | Valid            | Accept: item added with 100,000 ₫ price  |
| FR07-BVA-015 | UB-1            | N/A          | —                | —                                        |
| FR07-BVA-016 | UB              | N/A          | —                | —                                        |
| FR07-BVA-017 | UB+1            | N/A          | —                | —                                        |
| FR07-BVA-018 | +α (very large) | `2000000000` | Invalid (likely) | Reject (system limit exceeded) or accept |

## BVA Table 3: `name` (string length)

**Constraint:** length between 1 and 255 chars (implicit DB constraint)  
**LB = 1, UB = 255**

| TC ID        | BVA Point      | Test Value   | Length | Valid/Invalid | Expected Result                      |
| ------------ | -------------- | ------------ | ------ | ------------- | ------------------------------------ |
| FR07-BVA-019 | -α (empty)     | `""`         | 0      | Invalid       | Reject: name is required             |
| FR07-BVA-020 | LB-1           | `""`         | 0      | Invalid       | (Same as -α)                         |
| FR07-BVA-021 | LB (exact)     | `"A"`        | 1      | Valid         | Accept: product added                |
| FR07-BVA-022 | LB+1           | `"AB"`       | 2      | Valid         | Accept: product added                |
| FR07-BVA-023 | Nominal        | `"Laptop"`   | 6      | Valid         | Accept: product added                |
| FR07-BVA-024 | UB-1           | `"A" x 254`  | 254    | Valid         | Accept: product added                |
| FR07-BVA-025 | UB             | `"A" x 255`  | 255    | Valid         | Accept: product added                |
| FR07-BVA-026 | UB+1           | `"A" x 256`  | 256    | Invalid       | Reject: name too long                |
| FR07-BVA-027 | +α (very long) | `"A" x 1000` | 1000   | Invalid       | Reject: name too long / system error |

## BVA Summary

| Variable      | Total BVA Points | Valid Points | Invalid Points | BVA TCs Generated |
| ------------- | ---------------- | ------------ | -------------- | ----------------- |
| `quantity`    | 6                | 3            | 3              | 6                 |
| `price`       | 6                | 3            | 3              | 6                 |
| `name` length | 8                | 4            | 4              | 8 (Note 1)        |
| **Total**     |                  |              |                | **20**            |

> **Note 1:** For `name`, `-α` and `LB-1` are identical (length 0). FR07-BVA-019 covers both. The total BVA TCs generated is 20.
