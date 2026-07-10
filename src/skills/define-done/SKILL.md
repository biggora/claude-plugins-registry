---
name: define-done
description: "Turn an ambiguous feature or bug request into a confirmed, evidence-backed product specification and Definition of Done. Use for English triggers such as 'define acceptance criteria before building this feature' and 'turn this vague request into a product spec', and Russian triggers such as 'сформулируй критерии готовности' and 'уточни требования перед реализацией'."
---

# Define Done

Convert the request into an agreed outcome before implementation. Make every completion claim traceable to executable evidence.

## Workflow

1. **Inspect the repository before asking questions.**
   - Read applicable repository instructions, architecture, tests, issue context, and existing planning conventions.
   - Distinguish discoverable facts from product decisions. Resolve facts from the repository instead of asking the user.
   - Preserve existing work. Read `AGENTS.md` and `CLAUDE.md` when present, but never overwrite either file automatically.

2. **Resolve material ambiguity.**
   - State the current interpretation and any assumption that could change scope or behavior.
   - Ask one material question at a time. Prefer a small set of meaningful choices with a recommendation when trade-offs exist.
   - Stop rather than silently choose when the answer would materially change the outcome.

3. **Define the product outcome.**
   - Name the user and their job-to-be-done.
   - State one product goal in observable terms.
   - Describe the happy path and the scenarios required for release.
   - Separate in-scope behavior from explicit non-goals.
   - Record applicable technology, compatibility, performance, and security constraints.
   - Define `ALWAYS`, `ASK`, and `NEVER` boundaries for actions and side effects.

4. **Write 3–7 executable acceptance criteria.**
   - Express each criterion as `Given/When/Then` behavior, not an implementation preference.
   - Attach a project-owned command, test, inspection, or artifact that can prove the result.
   - Include expected observable evidence and relevant failure behavior.
   - Do not weaken a criterion merely to match the current implementation.

5. **Record the specification.**
   - Follow an existing repository convention when one exists.
   - Otherwise write `.agent/specs/<slug>.md` using [the specification template](references/spec-template.md).
   - Use the bug/no-change variant in that reference when correctness of the existing code is uncertain.

6. **Confirm before implementation.**
   - Present the goal, scope, boundaries, criteria, and unresolved risks concisely.
   - Mark a new or changed specification as awaiting confirmation and stop until the user approves it.
   - Treat a complete specification already approved by the user as confirmed; do not request duplicate approval.

## Terminal Outcomes

Conclude with exactly one evidence-backed outcome:

- **Implemented:** all agreed criteria pass with fresh evidence.
- **No change required (fix-or-abstain):** reproduction or an equivalent check proves that current behavior already satisfies the agreed criterion; record the evidence and abstain from editing.
- **Blocked:** a named missing decision, permission, dependency, or reproducible external condition prevents completion; record what would unblock the work.

Never claim success from intention, stale output, or absence of an observed failure alone.

## Default Safety Boundaries

- **ALWAYS:** preserve unrelated and user-owned changes; keep evidence with the criterion it proves.
- **ASK:** obtain explicit permission before commits, pushes, pull requests, destructive actions, or external side effects.
- **NEVER:** run `git reset --hard`, overwrite repository instruction files automatically, or expand scope without confirmation.
