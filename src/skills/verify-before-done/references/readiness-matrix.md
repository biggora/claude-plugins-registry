# Readiness Matrix

Use this reference to select proofs and render the final evidence report. Keep only gates that the accepted criteria, repository, changed surface, or release process make relevant; do not turn examples into invented requirements.

## Three Readiness Levels

| Level | Question | Typical required proof | Evidence to retain |
|---|---|---|---|
| User | Does the delivered behavior solve the accepted user job? | A real happy-path journey, relevant failure path, and observable acceptance behavior | Scenario steps, target/environment, expected versus observed result, screenshot or sanitized interaction output |
| Engineering | Is the owned change correct and repository-integrated? | Focused tests; related or full suites; project-owned type, lint, build, integrity, and security checks appropriate to the change | Exact command, working directory, fresh time, exit code, counts, relevant sanitized summary |
| Operations | Can the product be built, started, delivered, observed, and recovered as the release process requires? | Project-defined clean build/start; configuration or migration validation; deploy check; rollback or recovery check; health, logs, metrics, or alerts | Environment, command or run identifier, result, authorization boundary, rollback/observability signal |

User readiness is not replaced by compilation. Engineering readiness is not replaced by a successful click-through. Operational readiness is required only when the change or release claim reaches that surface.

## Gate Selection

### User readiness

- Derive journeys from accepted criteria, not from implementation details.
- For web behavior, run the relevant functional journey through `test-web-ui`.
- For mobile behavior, run the relevant journey through `test-mobile-app`.
- For visual, responsive, accessibility-presentation, or localization quality, use `ui-audit` in addition to functional proof.
- For a CLI, invoke the packaged or project-native executable with realistic arguments and verify stdout, stderr, exit code, and resulting state.
- For an API, call the public endpoint or handler boundary with representative success and failure requests and verify status, response, and side effects.
- Do not use a mocked unit test as the sole proof for an acceptance criterion that requires a real journey.

### Engineering readiness

- Start with the focused test that proves each changed behavior, then run the related or full suite required by project convention.
- Run existing type, lint, format-check, build, schema, package-integrity, compatibility, and security commands when relevant.
- Confirm required tests were not deleted, skipped, weakened, or replaced with assertions that no longer prove the criterion.
- Inspect the final scoped diff for unintended files and unresolved generated artifacts. Preserve unrelated dirty-worktree changes.
- Report security findings by file path and rule only. Never include a credential, token, personal record, or raw sensitive payload in evidence.
- Treat more than 150 changed lines as a prompt to reconsider slicing and request closer review, never as an automatic rejection.
- Use a golden dataset score only when the repository owns the dataset, evaluator, threshold, and command. Otherwise mark such a requested gate `MISSING`; do not invent a score.

### Operational readiness

- Prefer a repository-defined clean-room, package, container, or CI-equivalent build. Do not erase caches, data, or unowned work to manufacture cleanliness.
- Verify startup and health with the project-defined entry point and observable readiness signal.
- Validate migrations, configuration, deployment, rollback, and observability only where the changed surface or release process requires them.
- Do not perform a live deploy, rollback, destructive migration, commit, push, or pull request without explicit authorization. Use an authorized staging, dry-run, or static project-owned check when it proves the criterion.
- If production access is required but unauthorized, mark the row `BLOCKED`; do not claim operational readiness.

## Evidence Record

Use one row for each acceptance criterion and each supporting gate:

| Field | Required content |
|---|---|
| ID | Acceptance criterion or named gate |
| Level | `User`, `Engineering`, or `Operations` |
| Claim | Observable statement being proved |
| Proof | Exact command or scenario and working directory/target |
| Freshness | Current-session timestamp or explicit marker tied to the final state |
| Result | Exit code and pass/fail/skip counts; if unavailable, the tool's exact result summary without invented counts |
| Status | `PASS`, `FAIL`, `MISSING`, `BLOCKED`, or `SKIP` |
| Evidence | Minimal relevant output, observed behavior, or artifact; sanitize secrets and personal data |

Example:

| ID | Level | Claim | Proof | Freshness | Result | Status | Evidence |
|---|---|---|---|---|---|---|---|
| AC-1 | User | Valid input completes the primary CLI journey | `node bin/cli.js sample --value valid` from repository root | Current session, after final edit | Exit 0; counts not emitted | PASS | Sanitized output contains the expected completion record |
| ENG-tests | Engineering | The complete project suite passes | `npm test` from repository root | Current session, after final edit | Exit 1; 41 pass, 1 fail, 0 skip | FAIL | Failing test name and assertion summary |
| OPS-rollback | Operations | Release can be rolled back | Project rollback dry-run | Current final state | Environment unavailable | BLOCKED | Staging permission is required |

## Status and Overall Verdict

- `PASS`: fresh proof meets the expected result.
- `FAIL`: proof ran and did not meet it, the criterion is contradicted, or a required gate was deliberately skipped.
- `MISSING`: a required proof mechanism, criterion, command, dataset, threshold, or artifact does not exist.
- `BLOCKED`: the proof exists in principle but a named permission, decision, dependency, environment, or external condition prevents execution.
- `SKIP`: the gate is genuinely inapplicable; include the reason. A required gate cannot become optional by labeling it `SKIP`.

Set the overall verdict to:

- `PASS` only when every acceptance criterion and required gate is `PASS`. Inapplicable `SKIP` rows do not prevent `PASS`.
- `FAIL` when any required row ran and failed or was deliberately skipped.
- `BLOCKED` when no required row fails but at least one required row is `MISSING` or `BLOCKED`.

Stale logs, prior-session output, unsupported self-report, intent, and absence of an observed error are not evidence. If any verified state changes after a proof runs, rerun the affected row.

## No-Change Result

For a suspected defect, run the agreed reproduction against the unchanged implementation. Use `No change required (fix-or-abstain)` only when the reproduction and all applicable broader gates pass freshly. If the reproduction is ambiguous or cannot run, use `BLOCKED`; if it demonstrates the defect, use `FAIL` and continue the implementation workflow.
