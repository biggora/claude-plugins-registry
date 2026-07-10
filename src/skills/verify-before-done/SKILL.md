---
name: verify-before-done
description: "Require fresh, acceptance-linked evidence before any completion claim, merge or PR readiness statement, or release check. Use for EN triggers such as 'prove this task is complete' and 'is this ready to merge?', and RU triggers such as 'докажи, что задача завершена' and 'проверь готовность перед релизом'."
---

# Verify Before Done

Replace confidence and prior reports with fresh, reproducible evidence. Verify the product behavior, the implementation, and applicable operational readiness before making a completion claim.

## Establish the Claims

1. Read repository instructions, the accepted specification, acceptance criteria, task-owned diff, and project-defined verification commands.
2. List every claim the result must support. Map each claim to an acceptance criterion or state explicitly that the criterion is missing.
3. Identify the exact proof for each claim before running anything. Prefer the narrowest project-native check that proves the claim, then add the broader gates required by the changed surface.
4. Preserve unrelated and user-owned work. Never use `git reset --hard`, destructive cleanup, or a clean-build procedure that deletes unowned files.

## Build the Readiness Matrix

Read [the readiness matrix](references/readiness-matrix.md) before verifying. Create rows across all three levels:

- **User readiness:** execute the real journey and observable behavior, including relevant failure behavior.
- **Engineering readiness:** run focused and broader tests plus project-owned type, lint, build, integrity, and security gates applicable to the change.
- **Operational readiness:** exercise project-defined clean build, start, deploy validation, rollback, and observability checks where applicable and authorized.

Mark a gate required only when the specification, repository, changed surface, or release process makes it required. Mark a genuinely irrelevant gate `SKIP` with a reason; never use `SKIP` to avoid an available required check.

## Route Product Proof

- Use `test-web-ui` for functional web journeys.
- Use `test-mobile-app` for mobile application journeys.
- Use `ui-audit` for visual quality, accessibility presentation, and localization checks.
- Exercise CLI and API behavior through real black-box invocations against their public interface. Do not substitute unit tests for a required user journey.

Follow those skills when available. If a required capability or environment is unavailable, record it as `MISSING` or `BLOCKED`; do not simulate or fabricate the result.

## Run Fresh Proof

1. Run every proof command or scenario completely in the current session against the final state being judged.
2. Record the command or scenario, working directory or target, timestamp or explicit freshness marker, exit code, pass/fail/skip counts, and the smallest relevant output excerpt.
3. Treat interrupted, truncated, timed-out, stale, pre-change, or self-reported results as no evidence. “Tests passed yesterday” requires a rerun.
4. Rerun an affected proof whenever code, configuration, fixtures, dependencies, or environment changes after it ran.
5. Redact secrets and personal data from evidence. When a scanner finds a secret, report only the file path, rule identifier, and remediation status; never echo the value.
6. After the same failure occurs three times, stop repeating the same action. Change the diagnostic strategy or escalate with the attempts and observed evidence.

Use project-native tools and commands. Do not install a scanner, evaluator, or other dependency merely to create a gate. Treat a change above 150 lines as a review and slicing signal, not an automatic failure. Report a golden score only when the project already owns the dataset, evaluator, threshold, and reproducible command.

## Decide the Verdict

- **PASS:** every required row has fresh passing evidence and every acceptance criterion is proven. Only then make the scoped readiness or completion claim.
- **FAIL:** a required check ran and failed, an acceptance criterion is disproven, or a required gate was deliberately skipped. Continue working; do not claim completion.
- **BLOCKED:** required evidence cannot be produced because a named permission, decision, dependency, environment, or proof mechanism is unavailable. Label each unavailable row `MISSING` or `BLOCKED` and state exactly what would unblock it.

Do not infer that a merge, deployment, or release occurred from a readiness `PASS`. Those external actions require their own evidence and explicit authorization.

## Allow a Proven No-Change Outcome

For a bug or suspected defect, reproduce the agreed behavior before editing. If the unchanged implementation already satisfies the criterion, report **No change required (fix-or-abstain)** with the fresh reproduction and broader applicable evidence. If the issue cannot be reproduced, return `BLOCKED` with the missing condition rather than patching speculatively.

## Report Evidence by Criterion

Return:

1. `# Verification Result: PASS | FAIL | BLOCKED`
2. The exact scope and final state verified.
3. One matrix row per acceptance criterion and supporting gate, including readiness level, proof, freshness, exit code/counts, status, and sanitized evidence.
4. Missing, blocked, failed, or inapplicable checks with reasons.
5. The scoped conclusion: complete/ready only for `PASS`, no-change only when proven, or the next required action for `FAIL`/`BLOCKED`.

Every completion statement must point to a fresh matrix row. Never upgrade partial evidence into a broader claim.
