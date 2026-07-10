# State Templates

Use these templates only when the repository has no established state convention. Keep placeholders until verified; never replace them with plausible guesses. Omit sections that add no useful state.

## Contents

- [Location Precedence](#location-precedence)
- [Repository Context Template](#repository-context-template)
- [Progress and Handoff Template](#progress-and-handoff-template)
- [Decision Log Template](#decision-log-template)
- [Specification Template](#specification-template)
- [Task Plan Template](#task-plan-template)

## Location Precedence

1. Use paths and formats required by repository instructions or existing, actively used task artifacts.
2. Extend an existing progress, decision, specification, or task system rather than duplicating it.
3. When no convention exists, use:

| Purpose | Fallback path |
|---|---|
| Stable repository context | `.agent/CONTEXT.md` |
| Current task progress and handoff | `.agent/PROGRESS.md` |
| Durable decisions | `.agent/DECISIONS.md` |
| Approved task specification | `.agent/specs/<slug>.md` |
| Executable task plan | `.agent/tasks/<slug>.md` |

Use one stable `<slug>` for the specification, task plan, and progress links. Do not move project-owned state merely to match these fallback names.

## Repository Context Template

```markdown
# Repository Context

Last verified: <ISO timestamp or date>
Repository root: <verified path>

## Purpose

<One short, source-backed description of the project.>

## Instruction Sources

- `<path>` — <applicable scope and key constraint>

## Relevant Structure

- `<path>` — <task-relevant responsibility>

## Project-Owned Commands

| Purpose | Exact command | Source | Last verified result |
|---|---|---|---|
| <setup/build/test/lint/type-check/validation/smoke> | `<exact command>` | `<manifest, docs, build file, or CI path>` | <timestamp, exit status, or not run> |

## Constraints and Conventions

- <Verified language, runtime, style, security, or workflow constraint and its source.>

## Environment Assumptions

- <Required service, toolchain, credential, platform, or unresolved assumption.>

## Known Baseline

- <Current branch/HEAD and verified repository condition.>
- <Known pre-existing failure or none observed by the recorded checks.>
```

Never place a command in this file unless it was copied from a project-owned source or explicitly supplied by the user. Keep changing task details out of repository context.

## Progress and Handoff Template

```markdown
# Task Progress: <slug>

Updated: <ISO timestamp or date>
Goal: <one observable outcome>
Specification: `<path or not established>`
Task plan: `<path or not established>`

## Acceptance Criteria

| ID | Executable criterion | Status | Evidence |
|---|---|---|---|
| AC-1 | <observable criterion> | todo | <none yet> |

Allowed status values: `todo`, `doing`, `done`. Use `done` only with a fresh command, artifact, or direct observation that proves the criterion.

## Current Focus

- Criterion: <ID>
- Intended outcome: <single active outcome>

## Completed

- <Owned change or verified result, with path or evidence reference.>

## Broken or Uncertain

- <Failure, regression, blocked check, or unresolved uncertainty and its evidence.>

## Remaining

- <Unmet criterion or required work.>

## Open Questions

- <Question whose answer can change implementation or acceptance.>

## Best Next Action

<Exactly one bounded action that advances an unmet acceptance criterion.>

## Worktree and Verification Snapshot

- Branch/HEAD: <verified value>
- Pre-existing changes: <paths and ownership evidence>
- Task-owned changes: <paths>
- Last focused check: `<exact command>` — <timestamp and result>
- Last baseline smoke check: `<exact command>` — <timestamp and result>
- Checks not run: <command or check plus reason>
```

Use `none` only after checking the relevant source. Do not omit broken behavior to make the handoff look clean. Replace the best next action whenever evidence makes it stale, and record why.

## Decision Log Template

Append decisions in chronological order. Preserve superseded records.

```markdown
# Decisions

## D-<number>: <short title>

Date: <ISO timestamp or date>
Status: accepted | superseded by D-<number>

### Context

<Problem, constraint, and evidence that required a decision.>

### Options Considered

- <Option A and relevant tradeoff>
- <Option B and relevant tradeoff>

### Choice

<Selected option and concise rationale.>

### Consequences

- <Expected benefit.>
- <Cost, risk, compatibility effect, or follow-up obligation.>
```

Record decisions that prevent repeated analysis or contradictory implementation. Do not log routine edits or retroactively invent alternatives.

## Specification Template

Use this compact form only when the task needs a durable specification and no repository template exists.

```markdown
# Specification: <task title>

Status: draft | approved
Owner: <user, team, or unknown>

## Goal

<Product outcome, not an implementation activity.>

## User or Job

<Who needs what outcome and why.>

## In Scope

- <Required behavior.>

## Out of Scope

- <Explicit exclusion.>

## Release Scenarios

- <User-visible or operational scenario that must work.>

## Constraints and Boundaries

- Always: <permitted or mandatory behavior>
- Ask: <action requiring user authority>
- Never: <forbidden behavior>

## Acceptance Criteria

1. <Executable, observable criterion.>
```

Do not mark a draft specification approved without explicit user confirmation or an established project approval signal.

## Task Plan Template

Use this form to keep implementation steps tied to the approved specification.

```markdown
# Task Plan: <slug>

Specification: `<path>`
Updated: <ISO timestamp or date>

| Step | Acceptance criterion | Status | Done when | Evidence |
|---|---|---|---|---|
| <bounded action> | <AC ID> | todo | <observable completion condition> | <none yet> |

## Dependencies

- <What must be true before a step can start.>

## Risks or Blockers

- <Known risk, blocker, or none after checking.>
```

Keep one item in `doing` at a time. Split work when a step cannot be verified independently. Treat a size near 150 changed lines as a prompt to reconsider the split, not as a universal gate.
