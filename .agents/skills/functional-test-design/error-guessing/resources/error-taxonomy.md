# Error Taxonomy — Structured Catalog for Fault Attack

## Purpose

This taxonomy provides a structured catalog of error categories to guide systematic error guessing. For each category, work through the applicable sub-categories and ask: "Could this type of defect exist in the feature under test? What specific scenario would trigger it?"

This taxonomy is not exhaustive — add domain-specific categories as needed. The goal is to ensure all major defect categories are considered, not to produce test cases for every item.

## Category 1: Input Value Faults

Defects triggered by specific input values that receive special handling (or fail to receive it).

### 1.1 Special Numeric Values

| Value                                            | Why It Is Error-Prone                                                                                      |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| 0 (zero)                                         | Division by zero; empty collection; no-op that produces wrong result; treated as false in boolean contexts |
| 1 (one)                                          | Off-by-one in single-item collections; unit boundary                                                       |
| −1 (negative one)                                | Sentinel value in some APIs; misinterpreted as "not found"                                                 |
| Maximum integer (e.g., 2,147,483,647 for 32-bit) | Integer overflow when incremented; SQL/API integer field limits                                            |
| Minimum integer (e.g., −2,147,483,648)           | Underflow; absolute value fails (abs(MIN_INT) = MIN_INT in 2's complement)                                 |
| Floating point: 0.1, 0.2, 0.3                    | Binary floating-point representation; 0.1 + 0.2 ≠ 0.3 in most languages                                    |
| Very large float (approaching infinity)          | Overflow to Inf or NaN                                                                                     |
| NaN (Not a Number)                               | Propagates silently through calculations; comparison with NaN always false                                 |

### 1.2 Special String Values

| Value                                                             | Why It Is Error-Prone                                                                            |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Empty string `""`                                                 | Distinguished from null in many systems; may be treated as valid or invalid depending on context |
| String of spaces `"   "`                                          | Often passes "not empty" checks but fails business validation; trimming assumptions              |
| String with only whitespace (tabs, newlines)                      | Same as spaces but often missed in trim/validation logic                                         |
| Very long string (near field limit, at limit, beyond limit)       | Buffer overflow (rare in modern high-level languages); DB column truncation; UI display overflow |
| String with leading/trailing spaces                               | Stored differently than expected; comparison fails; "john " ≠ "john"                             |
| Unicode characters (e.g., accented letters, CJK, emoji)           | Encoding errors; byte length vs. character length confusion; DB storage issues                   |
| Null character `\0`                                               | String termination in C-based systems; may truncate strings unexpectedly                         |
| HTML/script injection characters `<`, `>`, `"`, `'`, `&`          | XSS if unescaped in output; SQL injection if unparameterized                                     |
| SQL injection patterns (`' OR 1=1 --`, `'; DROP TABLE`)           | Unparameterized queries                                                                          |
| Path traversal patterns (`../`, `..\\`)                           | File system access outside intended directory                                                    |
| Format string patterns (`%s`, `%n`)                               | Format string vulnerabilities in C-based code                                                    |
| Control characters (newline `\n`, carriage return `\r`, tab `\t`) | Log injection; CSV/text file parsing errors                                                      |

### 1.3 Special Collection / List Values

| Value                               | Why It Is Error-Prone                                                      |
| ----------------------------------- | -------------------------------------------------------------------------- |
| Empty list/array `[]`               | Loop executes 0 times; index access fails; "first element" operations fail |
| Single-element list                 | Logic that assumes multiple elements; min/max with one element             |
| List with duplicate elements        | Deduplication logic; set operations; count/aggregate errors                |
| Very large list                     | Memory; pagination boundary; timeout                                       |
| Null inside a list (`[1, null, 3]`) | Null pointer in iteration; aggregate function failures                     |

### 1.4 Special Date/Time Values

| Value                                 | Why It Is Error-Prone                                                         |
| ------------------------------------- | ----------------------------------------------------------------------------- |
| Midnight (00:00:00)                   | Day boundary; "today" vs "yesterday" ambiguity                                |
| End of day (23:59:59)                 | Expiration calculations; "within the day" logic                               |
| Leap day (Feb 29)                     | Non-leap year calculations; date arithmetic                                   |
| Year-end / Year-start (Dec 31, Jan 1) | Year rollover in date arithmetic                                              |
| DST transition times                  | Clock jumps forward/back; duplicate or missing hour                           |
| Unix epoch (1970-01-01)               | Sentinel value; default "not set" date in some systems                        |
| Far future dates (e.g., year 9999)    | Date format overflow; UI display issues                                       |
| Far past dates (e.g., year 1000)      | Calendar system assumptions (Gregorian)                                       |
| Timezone edge cases                   | UTC vs. local time; daylight saving time; same instant in different timezones |

## Category 2: Boundary and Limit Faults

Defects at the edges of valid ranges — closely related to BVA but targeting implementation-specific limits not always in the specification.

### 2.1 Technical Limits Beyond Business Rules

| Limit Type                   | Examples                                                    |
| ---------------------------- | ----------------------------------------------------------- |
| Database column capacity     | VARCHAR(255): test at 254, 255, 256 characters              |
| Integer field in database    | INT: test at 2,147,483,647 and 2,147,483,648                |
| API payload size             | JSON body near the server's max payload limit               |
| URL length                   | Browsers/servers typically limit to ~2,000–8,000 characters |
| File size                    | Upload limits; processing memory limits                     |
| Concurrent connection limits | Connection pool exhaustion                                  |

### 2.2 Off-by-One in Logic

Areas where developers commonly misuse `<` vs `<=`, `>` vs `>=`:

- Loop termination conditions
- Page boundary in pagination (last item on page N vs. first item on page N+1)
- Collection index (0-based vs. 1-based)
- "At least N" vs. "more than N" conditions

## Category 3: Computation and Logic Faults

Defects in calculations, transformations, or conditional logic.

### 3.1 Arithmetic Errors

- Division: integer division truncation (5/2 = 2 not 2.5); division when denominator may be 0
- Rounding: rounding mode (banker's rounding vs. half-up); premature rounding in multi-step calculations
- Overflow: result exceeding data type capacity
- Precision: cumulative floating-point error in iterative calculations

### 3.2 Boolean Logic Errors

- De Morgan's law misapplication: `NOT (A AND B)` ≠ `NOT A AND NOT B`
- Short-circuit evaluation: `if (x != null && x.value > 0)` — order matters
- Inclusive vs. exclusive OR
- Double negation: `NOT NOT condition` ≠ `condition` in some SQL NULL contexts

### 3.3 Ordering and Sorting Errors

- Sort stability: elements with equal keys maintain/do not maintain relative order
- Sort direction: ascending vs. descending applied to wrong field
- Locale-sensitive string sort: "a" before "B" in case-insensitive vs. case-sensitive sort
- Null position in sorted results: nulls first vs. nulls last

## Category 4: State and Sequence Faults

Defects arising from the order of operations, system state, or prior history.

### 4.1 Initialization and Default State

- Object created but not fully initialized before use
- Default field values (0, null, empty string) used where explicit values are expected
- Session/cache not cleared between users or test runs

### 4.2 Sequence Dependencies

- Operations performed in wrong order by the system (e.g., commit before validation)
- State left by a previous operation affects a subsequent operation unexpectedly
- Repeated operation produces different result the second time (idempotency failure)

### 4.3 Concurrency and Race Conditions

- Two users modifying the same record simultaneously (last-write-wins vs. optimistic locking)
- Time-of-check to time-of-use (TOCTOU): value valid when checked but changes before used
- Transaction isolation: dirty read, non-repeatable read, phantom read

### 4.4 Timeout and Asynchronous Behavior

- Response received after timeout: system continues as if timed out; late response causes inconsistency
- Partial completion: operation starts, external service fails midway, rollback not performed
- Retry logic: operation performed twice due to retry; non-idempotent operation creates duplicate

## Category 5: Integration and Interface Faults

Defects at the boundary between components, systems, or layers.

### 5.1 API Contract Violations

- Consumer sends field the API does not document; API silently ignores or fails
- API returns field the consumer does not handle (unknown field, new field in newer version)
- Version mismatch: consumer expects v1 response format; API returns v2 format
- HTTP method mismatch: POST vs. PUT vs. PATCH semantics

### 5.2 Data Format and Encoding

- Date format: `YYYY-MM-DD` vs. `DD/MM/YYYY` vs. `MM/DD/YYYY` at integration boundaries
- Decimal separator: `.` vs. `,` for different locales
- Boolean representation: `true/false` vs. `1/0` vs. `"Y"/"N"` across systems
- Encoding: UTF-8 vs. ISO-8859-1; byte order marks (BOM)
- JSON null vs. missing field: `{"field": null}` vs. `{}` — some parsers treat differently

### 5.3 Third-Party Service Failures

- Service returns non-200 HTTP status: does consumer handle 4xx and 5xx correctly?
- Service response is valid JSON but contains unexpected values or structure
- Service is slow/unavailable: timeout; fallback behavior; error message to user
- Service returns partial data (pagination incomplete; truncated response)

### 5.4 Database Integration

- Constraint violations: unique key, foreign key, not-null, check constraints
- Transaction boundary: data visible to other transactions before commit
- Null vs. empty string in database: stored differently in some RDBMS
- Case sensitivity of string comparison (database collation)

## Category 6: Configuration and Environment Faults

Defects that only manifest in specific deployment configurations.

### 6.1 Configuration Values

- Feature flag enabled vs. disabled
- Different behavior in dev/staging/production environment
- Configuration value at limit (e.g., max connections = 1; max retries = 0)
- Missing configuration: system uses default value without warning

### 6.2 Locale and Internationalization

- Number formatting: thousands separator (`,` in US, `.` in Germany)
- Date formatting: month/day order; 12-hour vs. 24-hour
- Text direction: LTR vs. RTL
- String collation and sort order

### 6.3 Resource Constraints

- Low disk space: write operations fail; log rotation stops
- High memory usage: garbage collection pauses; out-of-memory errors
- Network latency: timeouts triggered for operations that succeed under normal conditions

## Category 7: Security-Related Faults

Defects that enable unauthorized access, data exposure, or system compromise.

**Note:** Security testing is a specialized discipline. These are common entry points for Error Guessing; dedicated security testing techniques provide deeper coverage.

### 7.1 Authentication and Authorization

- Accessing a resource without authentication (missing auth check)
- Accessing another user's resource with valid authentication (IDOR — Insecure Direct Object Reference)
- Privilege escalation: regular user performing admin actions
- Session fixation or session hijacking scenarios

### 7.2 Input Validation

- SQL injection via unsanitized user input
- Cross-Site Scripting (XSS) via unescaped output
- Command injection via shell-executed user input
- Path traversal via user-controlled file paths

### 7.3 Sensitive Data Exposure

- Sensitive data in error messages (stack traces, internal IDs, file paths)
- Sensitive data in logs
- Sensitive data in URL parameters (visible in server logs and browser history)

## Category 8: Domain-Specific Faults

Add domain-specific error categories based on the system under test:

### 8.1 Financial Systems

- Rounding of monetary values (banker's rounding; currency-specific rules)
- Currency conversion precision
- Zero-amount transactions
- Negative balance handling
- Concurrent transactions on the same account

### 8.2 E-Commerce

- Zero-quantity items in cart
- Cart with items removed from catalog
- Discount applied multiple times
- Order with mixed tax rates
- Payment initiated but network timeout before confirmation

### 8.3 Healthcare / Regulated Systems

- Patient with no medical history
- Medication dosage at pediatric/elderly boundaries
- Date of birth in future
- Simultaneous prescription by two providers

_Add additional domain-specific categories relevant to the project._
