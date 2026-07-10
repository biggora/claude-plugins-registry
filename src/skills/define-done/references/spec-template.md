# Product Specification and Definition of Done

Use the main template for features and behavior changes. Use the bug/no-change variant when a request assumes existing behavior is defective.

## Main Template

```markdown
# <Outcome-oriented title>

Status: Draft | Awaiting confirmation | Approved | Implemented | No change required | Blocked
Owner: <user, team, or role>
Last updated: <YYYY-MM-DD>

## Product Outcome

- User: <who experiences the outcome>
- Job-to-be-done: When <situation>, I want to <motivation>, so I can <expected benefit>.
- Product goal: <one observable outcome>

## Repository Context

- Applicable instructions: <paths or none>
- Existing conventions and relevant components: <paths and concise findings>
- Baseline evidence: <commands, tests, or observed behavior>
- Assumptions requiring confirmation: <none or a short list>

## Release Scenarios

### Happy Path

<Describe the end-to-end user flow from entry to observable result.>

### Required for Release

1. <Scenario that must work>
2. <Failure, recovery, or compatibility scenario that must work>

## Scope

### In Scope

- <Behavior or deliverable>

### Out of Scope

- <Explicit non-goal>

## Constraints

- Technology and compatibility: <versions, interfaces, repository conventions>
- Performance: <measurable limit or not applicable>
- Security and privacy: <trust boundaries, sensitive data rules, or not applicable>

## Action Boundaries

### ALWAYS

- Preserve unrelated and user-owned changes.
- Attach fresh evidence to every completion claim.

### ASK

- Ask before <project-specific destructive, external, or irreversible action>.
- Obtain explicit permission before commit, push, or pull request creation.

### NEVER

- Never run `git reset --hard`.
- Never overwrite `AGENTS.md` or `CLAUDE.md` automatically.
- Never expand the agreed scope silently.

## Acceptance Criteria

### AC-1 — <Observable happy-path behavior>

- Given: <initial state>
- When: <user or system action>
- Then: <observable result>
- Evidence: `<project-owned command>` or <artifact/inspection>
- Passing signal: <exit code, assertion, visible state, or measured threshold>

### AC-2 — <Observable failure or recovery behavior>

- Given: <initial state>
- When: <action>
- Then: <observable result or safe failure>
- Evidence: `<project-owned command>` or <artifact/inspection>
- Passing signal: <expected observation>

### AC-3 — <Observable constraint or compatibility behavior>

- Given: <initial state>
- When: <action>
- Then: <observable result>
- Evidence: `<project-owned command>` or <artifact/inspection>
- Passing signal: <expected observation>

Example criterion:

- Given: an invited user with a valid token
- When: they accept the invitation
- Then: membership is created
- Evidence: `<project-owned integration-test command>`
- Passing signal: the integration test exits 0 and asserts the persisted membership

## Risks and Open Decisions

- <None, or the decision/condition and owner>

## Confirmation

- Requested: <timestamp or not yet>
- Confirmed by: <user/owner or pending>
- Confirmed scope revision: <identifier, date, or summary>

## Outcome Evidence

- Outcome: Implemented | No change required | Blocked
- Evidence: <fresh commands, results, artifacts, or blocker>
- Remaining work: <none or explicitly deferred items>
```

Replace all angle-bracket fields. Keep only relevant sections and 3–7 acceptance criteria.

## Bug / No-Change Variant

```markdown
# <Reported behavior>

Status: Draft | Awaiting confirmation | Approved | Implemented | No change required | Blocked

## Agreed Criterion

- Given: <state that exposes the reported behavior>
- When: <trigger>
- Then: <expected behavior>
- Evidence: `<reproduction or verification command>`
- Passing signal: <specific assertion or observable result>

## Reproduction

- Reported claim: <what is believed to be wrong>
- Environment and inputs: <versions, fixtures, configuration>
- Reproduction command or steps: `<exact command>`
- Baseline result: <fresh output and exit status>

## Decision

Choose one path:

1. **Reproduced:** preserve the failing evidence, implement the smallest fix, and rerun the same criterion plus relevant regressions.
2. **No change required:** prove with fresh evidence that current behavior satisfies the agreed criterion, record `no change required`, and make no patch.
3. **Blocked:** record why the result is inconclusive and name the decision, dependency, permission, or environment needed to continue.

Failure to reproduce is not, by itself, proof that no change is required.

## Outcome Evidence

- Outcome: Implemented | No change required | Blocked
- Before evidence: <failure, existing passing behavior, or inconclusive result>
- After evidence: <fresh command and result, or not applicable>
- Files changed: <paths or none>
- Rationale: <why this outcome satisfies the agreed criterion>
```
