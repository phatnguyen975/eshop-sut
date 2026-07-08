---
name: ai-audit
description: >
  Audit and log AI interactions into a structured monthly log file. Trigger this skill
  whenever the user invokes /ai-audit or /ai-audit --last=N (N: 1–5). The skill reads
  conversation context to extract prompts and outputs, then asks the user to evaluate
  each interaction via a structured form. Use this skill to track AI usage quality,
  model performance, and revision patterns over time.
---

# AI Audit Skill

Logs AI interactions into `docs/audit/ai/ai-audit-YYYY-MM.log.md` with structured entries and monthly statistics.

## Invoke Syntax

```
/ai-audit           # log last 1 interaction (default)
/ai-audit --last=N  # log last N interactions (N: 1–5)
```

If `N > 5`, respond: _"Max --last is 5. Running with --last=5."_ and proceed.

## What AI Self-Detects

From conversation context, AI automatically extracts:

- **Prompt** — exact text of the human's message
- **Model** — current model in use
- **Timestamp** — current datetime (ISO 8601, UTC+7)
- **Output** — AI's response (text/code inline, or file summary as bullets)

## Interaction Flow

1. AI reads context → identifies the last N interactions (excluding the `/ai-audit` invoke itself).
2. AI displays a **numbered summary** of detected interactions for human confirmation.
3. AI outputs a **structured evaluation form** — one section per interaction.
4. Human fills in the form and pastes it back.
5. AI translates any non-English responses to English, then writes log entries.
6. AI updates (or creates) the monthly log file with new entries + updated stats.

## Evaluation Form Template

For each interaction, AI outputs:

```
─── Interaction [N] ───
Prompt excerpt: "[first 80 chars of prompt]..."
Output type: [text | code | file(s) | mixed]

Tags (pick 1–3):
  Domain:  backend · frontend · mobile · data · devops · infra · security · performance · design
  Task:    code-gen · refactor · debugging · testing · planning · review · documentation · analysis · research · prompt-engineering
  Output:  file-output · script · query · config · diagram · report
>

Status:
  ✅ VALID       — Output correct, used as-is
  ⚠️ PARTIAL     — Partially correct, minor fixes needed
  🔄 REVISED     — Output sufficient but required significant edits before use
  ❌ INVALID     — Incorrect, not used
  🔲 INCOMPLETE  — AI did not finish the task (cut off, timeout, etc.)
  ⏳ PENDING     — Not yet evaluated
>

Reason (why this status?):
>

Revision (what did you change? Leave blank if VALID/INVALID/INCOMPLETE/PENDING):
>
```

## Log File Structure

See [`resources/log-format.md`](resources/log-format.md) for full format spec.  
See [`resources/status-definitions.md`](resources/status-definitions.md) for status guidance.  
See [`resources/tag-taxonomy.md`](resources/tag-taxonomy.md) for full tag list.

## Writing Rules

- All log content must be in **English** regardless of input language.
- Prompt goes in a fenced ` ```prompt ``` ` block.
- Text/code output goes in a fenced ` ```markdown ``` ` or language-specific block.
- File output → bullet list: `filename — one-line description`.
- Entry IDs reset to `001` each month: `[AI-AUDIT-001]`, `[AI-AUDIT-002]`, ...
- Append new entries at the **bottom** of the file; update stats block at **top**.
- If the monthly log file does not exist, create it with the stats template first.

## Edge Cases

| Situation                                     | Handling                                         |
| --------------------------------------------- | ------------------------------------------------ |
| `--last > 5`                                  | Cap at 5, notify user                            |
| Not enough interactions in context            | Log what's available, note the gap               |
| Output was a file AI created                  | Summarize as bullet list of files + descriptions |
| Human answers in Vietnamese (or any language) | Translate to English before writing log          |
| Entry ID conflict (file exists, IDs overlap)  | Read existing file, continue from last ID        |

## Quality Checklist

See [`resources/quality-checklist.md`](resources/quality-checklist.md) before finalizing.

## Example Session

See [`examples/example-session.md`](examples/example-session.md) for a full walkthrough.  
See [`examples/sample-ai-audit-2026-07.log.md`](examples/sample-ai-audit-2026-07.log.md) for a populated log file.
