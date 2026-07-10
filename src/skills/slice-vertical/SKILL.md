---
name: slice-vertical
description: "Turn an approved specification into ordered, independently demonstrable vertical slices with executable evidence. Use for requests such as 'break this approved team-invitations spec into vertical slices', 'plan tracer-bullet delivery', 'разбей утверждённую фичу на вертикальные срезы', or 'составь план вертикальных срезов'; do not use before the specification and acceptance criteria are approved."
---

# Slice Work Vertically

Convert approved outcomes into the smallest reviewable increments that prove user value end to end.

## Establish the Baseline

1. Locate the approved specification and its acceptance criteria.
2. Stop and request definition or approval when either is missing, ambiguous, or still disputed. Do not silently invent product intent.
3. Read the repository instructions, architecture, tests, and current task state. Read `AGENTS.md` and `CLAUDE.md` when present, but never overwrite them automatically.
4. Reuse the repository's task-state convention. If none exists, write the slice plan to `.agent/tasks/<slug>.md`.
5. State assumptions, competing interpretations, constraints, and unresolved risks before choosing slices.

## Build the Slice Map

1. Trace each acceptance criterion through the relevant data, domain, API, UI, integration, and operations boundaries. Include only layers the outcome actually needs.
2. Select the thinnest capability a user or stakeholder can demonstrate independently. Prefer delivered user value and risk reduction over minimum file count.
3. Carry the minimum required work across relevant layers inside the same slice. Do not create horizontal phases such as "all database work," then "all APIs," then "all UI."
4. Put dependency blockers and high-impact unknowns into the earliest slice that can test them through a real end-to-end path. If a standalone investigation is unavoidable, mark it as an enabling checkpoint rather than completed product value.
5. Order the remaining slices by dependency, risk, and incremental user value. Keep each slice independently reviewable as one PR-sized checkpoint.
6. Keep exactly one slice `Active`; mark all others `Pending`, `Blocked`, or `Done`.

## Define Every Slice

Record all of these fields:

- **User outcome**: the observable value or learned constraint.
- **Scope**: behavior included in this slice.
- **Not in scope**: behavior deliberately deferred.
- **Dependencies**: prior slices, decisions, services, or data required.
- **Likely paths**: repository areas expected to change; label uncertainty instead of fabricating paths.
- **Done when**: fresh executable checks and observable assertions that prove the outcome.
- **Demo method**: exact user or stakeholder path for showing the increment.
- **Status**: `Pending`, `Active`, `Blocked`, or `Done`.

Map each slice to one or more approved acceptance criteria. Split a slice further when its evidence cannot isolate the promised outcome or when it cannot be reviewed coherently.

## Apply Delivery Guardrails

- Treat roughly 150 changed lines as a signal to reconsider scope, not as a universal pass/fail gate. Keep a larger slice when splitting would obscure one coherent behavior, and record why.
- Batch purely mechanical refactors in coherent dependency-safe groups. Prove preserved behavior with executable checks instead of inventing a UI slice where no user-facing path exists.
- Preserve unrelated and pre-existing worktree changes. Never use `git reset --hard`.
- Prepare each slice so it could become one commit, PR, or checkpoint, but commit, open a PR, or push only with explicit user authorization and only for task-owned changes.
- Update status and evidence after each checkpoint. Do not activate the next slice until the current one is `Done` or explicitly `Blocked` with a recorded reason.

Read [slice examples and the record template](references/slice-examples.md) when drafting or reviewing a slice plan.
