```
eshop-sut/
├── backend/                        # SUT: Node.js API (DO NOT MODIFY)
├── frontend-web/                   # SUT: Customer-facing React app (DO NOT MODIFY)
├── frontend-admin/                 # SUT: Admin panel React app (DO NOT MODIFY)
├── frontend-mobile/                # SUT: Mobile app — out of scope (DO NOT MODIFY)
│
├── e2e/                            # Playwright test project root (standalone Node.js project)
│   ├── playwright.config.ts        # Root Playwright configuration — projects, browsers, reporters
│   ├── package.json                # Own dependencies, separate from SUT build toolchain
│   ├── tsconfig.json               # TypeScript config — path aliases (optional, see 8.2)
│   ├── .env                        # Runtime credentials & base URLs (GITIGNORED)
│   ├── .env.example                # Template for .env — committed to version control
│   ├── .gitignore                  # Excludes: .auth/, node_modules/, .env
│   │
│   ├── global-setup.ts             # Runs once before all tests — authenticates roles, saves storageState
│   ├── global-teardown.ts          # Runs once after all tests — cleans up dynamically created test data
│   │
│   ├── .auth/                      # Saved browser authentication states (GITIGNORED)
│   │   ├── user.json               # storageState for standard user (test@eshop.com)
│   │   └── admin.json              # storageState for admin user (admin@eshop.com)
│   │
│   ├── pages/                      # Page Object Model classes — one file per page
│   │   ├── base.page.ts            # BasePage abstract class — shared navigation helpers
│   │   ├── web/                    # POM classes for Frontend Web (localhost:5173)
│   │   └── admin/                  # POM classes for Web Admin (localhost:5174)
│   │
│   ├── fixtures/                   # Custom Playwright fixtures via test.extend()
│   │   └── index.ts                # Barrel export — single import point for all fixtures
│   │
│   ├── utils/                      # Pure utility functions — no assertions, no fixtures
│   │                               # api.ts    → API call wrappers (create when first needed)
│   │                               # faker.ts  → Test data generators (create when first needed)
│   │                               # Add one file per concern; keep functions pure and reusable
│   │
│   ├── test-data/                  # Static input files committed to version control
│   │                               # csv/ → CSV files for FR-16 product import tests
│   │                               # Create files here when implementing scenarios that require file uploads
│   │
│   └── tests/                      # Test spec files organized by domain
│       ├── web/                    # E2E UI tests for Frontend Web
│       ├── admin/                  # E2E UI tests for Web Admin
│       ├── api/                    # API-only tests — no browser
│       └── smoke/                  # Critical path smoke suite — target < 2 minutes
│           ├── web/                # Smoke tests for Frontend Web critical path
│           └── admin/              # Smoke tests for Web Admin critical path
│
├── .agents/
│   ├── skills/                     # Custom WAT skill definitions (wat- prefix)
│   │   ├── wat-scope/              # Skill: analyze SRS, map FRs, define scenario inventory
│   │   ├── wat-spec/               # Skill: design detailed E2E scenario spec using Scenario Testing approach
│   │   ├── wat-build/              # Skill: implement POM, fixtures, and test spec files one piece at a time
│   │   ├── wat-review/             # Skill: multi-axis quality review of completed test code
│   │   └── wat-fix/                # Skill: fix confirmed blocking findings with root-cause analysis
│   │
│   # The following skills are managed externally and copied into this project:
│   # - playwright-skill       → Playwright API reference + 10 Golden Rules (global or ./skills/)
│   # - functional-test-design → EP, BVA, Decision Table, State Transition, Use Case, Error Guessing (global or ./skills/)
│   # - ai-audit               → Structured AI interaction audit log generator (global or ./skills/)
│
├── docs/
│   ├── sut/                        # SUT references
│   │   ├── srs.md                  # SRS / Business Requirements (SOURCE OF TRUTH — DO NOT MODIFY)
│   │   ├── api-specification.md    # API Contract (SOURCE OF TRUTH — DO NOT MODIFY)
│   │   └── setup-guide.md          # Setup Guide (DO NOT MODIFY)
│   │
│   ├── test-scope.md               # Overall scope document — output of /wat-scope
│   ├── scenarios/                  # One subfolder per E2E scenario
│   │   └── {scenario-id}/          # e.g., SC-01-auth-flow/
│   │       ├── spec.md             # Scenario specification — output of /wat-spec
│   │       └── review-notes.md     # Review findings — output of /wat-review
│   └── test-report.md              # Final test execution report
│
└── AGENTS.md                       # Agent role, rules, skill mapping, workflow reference
```
