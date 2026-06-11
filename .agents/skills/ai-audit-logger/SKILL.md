---
name: ai-audit-logger
description: >
  Log all AI interactions into the ai-audit file after each session. This is a
  mandatory appendix for HW02. Also supports compiling all logs into the final
  ai-audit-report.md and guides writing ai-critique.md (200-300 words).
trigger:
  - "log this interaction"
  - "audit log"
  - "end of session"
  - "log session"
  - "compile audit report"
output: qa-artifacts/ai-audit/FR{nn}-ai-audit.md and qa-artifacts/ai-audit/ai-critique.md
---

# Skill: ai-audit-logger

## 1. Purpose

HW02 Section 9 requires the AI Audit Report as a **mandatory appendix** containing full details of every AI interaction. This skill ensures logs are recorded consistently and completely after every session without being deferred.

> HW02 Section 9: "include the following information for each interaction: Name of the AI tool, Date and time, Your prompt, The AI output"

## 2. Input Required

- End of each session: tool name, task description, prompts used, AI outputs
- For compilation: all FR-specific audit log files

## 3. Log Format — Per Session

### 3.1 Single Interaction Entry

One entry per skill invocation (or closely related group of interactions):

````markdown
## Interaction [{n}] — {Skill Name}

| Field             | Value                                    |
| ----------------- | ---------------------------------------- |
| **Tool**          | Antigravity CLI (Gemini 2.5 Pro backend) |
| **Date/Time**     | {YYYY-MM-DD HH:MM}                       |
| **Feature**       | FR-{nn} — {Feature Name}                 |
| **Skill Invoked** | {skill-name}                             |
| **Task**          | {One-line description of what was asked} |

### Prompt Given

```
{Full prompt or accurate close paraphrase of what the student typed}
```

### AI Output Summary

{Summary of what Antigravity generated — 2–5 bullet points}

- Generated {n} EP classes for {n} variables
- Applied G1 to `password` length: 1 valid + 2 invalid classes
- Applied G3 to `email` format: 1 valid + 3 invalid classes
- Did not generate: OTP cross-email class (SEC-07)

### Student Review Notes

{What the student verified, corrected, or added manually}

- Accepted as-is: {items accepted without change}
- Modified: {items changed and why}
- Added manually: {items student added that AI missed}
- Rejected: {items that were wrong and removed}

### Interaction Quality Assessment

| Criterion           | Rating (1–5) | Notes                                 |
| ------------------- | ------------ | ------------------------------------- |
| Completeness        | {n}          | Did AI cover all required classes?    |
| Accuracy            | {n}          | Were generated items correct per SRS? |
| Guideline adherence | {n}          | Did AI follow EP/BVA rules correctly? |
| Items missed        | {n} count    | Number of classes AI did not generate |
````

## 4. Step-by-Step Instructions

### Step A — Log Immediately After Each Skill Session

Do NOT wait until all 4 FRs are done. Log after EACH individual skill:

- After `requirement-analyzer` → log 1 entry
- After `equivalence-partitioning` → log 1 entry
- After `boundary-value-analysis` → log 1 entry
- After `domain-coverage-reviewer` → log 1 entry
- After `test-case-generator` → log 1 entry
- After `bug-report-writer` (per bug) → log 1 entry each

### Step B — Record Prompts Accurately

Copy or closely paraphrase the actual prompt. Include:

- The FR and field context provided to the AI
- Specific instructions given (which guideline, which step)
- Any examples provided to the AI

### Step C — Summarize AI Output Objectively

Focus on:

- What the AI generated (types and quantity)
- What the AI applied correctly
- What the AI missed or got wrong
- Do NOT editorialize — record facts only

### Step D — Compile the Full Audit Report

After all 4 FRs are complete, do NOT ask the human to run bash commands. Instead, use your file system capabilities to:

- Read the contents of all 4 per-FR audit files (`qa-artifacts/ai-audit/FR01-ai-audit.md`, FR07..., FR17..., FR03...).
- Merge their contents sequentially into one cohesive document.
- Write the combined output to a single file: `qa-artifacts/ai-audit/ai-audit-report.md`.

### Step E — Write ai-critique.md (200–300 words)

HW02 Section 10 requires the AI Critique to answer 3 questions:

**CRITICAL RULE 1: PROMPT HUMAN FIRST**

You CANNOT write this critique alone. Before generating the ai-critique.md file, you MUST explicitly ask the human to provide their insights on:

- Where did the AI get something wrong, biased, or incomplete?
- Why did it fail to catch the issue?
- What principle have you learned about collaborating with AI?

Wait for the human's response before proceeding.

**CRITICAL RULE 2: WORD COUNT ENFORCEMENT**

Once the human provides the answers, expand them into professional paragraphs. The final text MUST be strictly between 200 and 300 words. You must internally count the words. If the count falls outside this range, you must rewrite it before showing the preview.

**Template (student fills in the blanks):**

```markdown
# AI Critique — HW02 Domain Testing

## Where AI Got It Wrong or Incomplete

{Describe specific instances where AI missed classes, misapplied guidelines, or produced incorrect expected results. Reference specific FR and EC IDs.}

Example: "During FR-03 analysis, Antigravity failed to identify the OTP cross-email
equivalence class — the scenario where a user attempts to use an OTP generated for
email A to reset the password of email B. This is a critical security test required
by SEC-07 in the EShop SRS."

## Why AI Failed to Catch the Issue

{Analyze the root cause — was it prompt quality, AI knowledge limitation, or inherent feature complexity?}

Example: "The failure occurred because SEC-07 is stated in the Security Requirements
section, not in the FR-03 specification section. The AI processed FR-03 in isolation
and did not cross-reference the SEC section. This is a limitation of AI's context
processing — it handles explicitly given context well but does not proactively
search for related implicit constraints."

## Lesson Learned About AI Collaboration

{State one clear principle derived from working through this assignment.}

Example: "The core principle is: AI performs well on explicit, well-scoped
requirements but requires deliberate human guidance for implicit constraints,
cross-referenced rules, and security-sensitive test classes. Effective collaboration
means pre-loading all related context before prompting (not just the target FR),
structuring prompts one step at a time following the 4-step framework, and always
performing a manual gap analysis review — particularly for any class involving
security, state transitions, or cross-feature dependencies."

_Word count: {n} words_
```

## 5. Output Format — Per FR Audit File

> **CRITICAL RULE:** All generated content MUST be strictly in English.

```markdown
# AI Audit Log — FR-{nn}: {Feature Name}

**Feature:** FR-{nn}
**Tool:** Antigravity CLI (Gemini/Claude/Codex {model} backend)
**Total interactions logged:** {n}

{Interaction [1] — requirement-analyzer}

{Interaction [2] — domain-identifier}

{Interaction [3] — equivalence-partitioning}

{Interaction [4] — boundary-value-analysis}

{Interaction [5] — domain-coverage-reviewer}

{Interaction [6] — test-case-generator}

{Interaction [7] — test-case-reviewer}

{Interaction [8] — test-execution-assistant}

{Interaction [9+] — bug-report-writer (one per bug)}

{Interaction [n] — github-issue-writer (one per bug)}

## FR-{nn} Session Summary

| Metric                          | Value         |
| ------------------------------- | ------------- |
| Total skill sessions logged     | {n}           |
| Total AI outputs reviewed       | {n}           |
| Items accepted as-is            | {n}           |
| Items modified by student       | {n}           |
| Items added manually by student | {n}           |
| Items rejected                  | {n}           |
| Most common AI gap              | {description} |
```

## 6. Quality Checklist

- [ ] All generated content is completely in English
- [ ] Log written immediately after each skill session (not deferred)
- [ ] Prompts recorded accurately (not a retrospective summary)
- [ ] AI output summary is factual and objective (not emotional)
- [ ] Student review notes are specific: accepted / modified / added / rejected
- [ ] ai-critique.md is between 200–300 words (count before submitting)
- [ ] ai-critique.md answers all 3 questions from HW02 Section 10
- [ ] All per-FR logs compiled into ai-audit-report.md
- [ ] A preview has been shown to the human, and explicit `APPROVE` command was received before saving to disk
