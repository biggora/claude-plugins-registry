---
name: tdd-red-green
description: "Implement one behavior at a time with safe test-driven development and reproduce-or-abstain bug fixing. Use for EN triggers: 'implement this behavior test-first', 'reproduce then fix this bug', 'use RED GREEN REFACTOR'; RU triggers: 'реализуй через тесты', 'сначала воспроизведи и исправь баг', 'реализуй через RED GREEN REFACTOR'."
---

# TDD Red Green

Implement one observable behavior at a time through a verified RED → GREEN → REFACTOR loop. Treat no change as a correct outcome when the reported bug does not reproduce.

Do not use this workflow for documentation-only, copy-only, formatting-only, or other changes that cannot alter behavior.

## Establish Safe Ground

1. Read repository instructions, the requested acceptance criterion, test configuration, and project-defined test commands.
2. Inspect `git status` and relevant diffs before editing. Separate pre-existing user changes from paths owned by this task; preserve all user work.
3. Classify the request as a bug, a new behavior, or behavior that may already be correct. Stop and clarify contradictory or untestable criteria.
4. Select one observable behavior and the narrowest appropriate test level. Split broader work before writing code.
5. Read [TDD handoff and checkpoints](references/tdd-handoff-and-checkpoints.md) when handing off a critical acceptance test, recording cycle evidence, recovering from a failed attempt, or pausing work.

## Reproduce or Abstain for Bugs

1. Translate the report into a relevant automated test that would fail only when the reported defect exists.
2. Run the test against the unchanged implementation.
3. Continue only when the test fails for the intended behavioral reason.
4. If current behavior satisfies the criterion, stop without modifying production code. Report the test or reproduction command, observed output, and why it proves a no-change result.
5. If the defect cannot be reproduced reliably, stop and report the missing evidence or environment requirement. Do not invent a patch.

## Run One RED → GREEN → REFACTOR Cycle

### RED

1. Add one focused test for the selected behavior. For a critical acceptance criterion, use a fresh test-author or session when available; provide only the criterion, public contract, repository test conventions, and allowed test paths—not an implementation plan or prior implementation history.
2. Run the narrowest command that executes the new test.
3. Confirm that the intended assertion fails because the behavior is absent or wrong. Reject syntax errors, import failures, broken fixtures, unrelated failures, and tests that pass immediately as RED evidence.
4. Record the command, expected assertion, actual failure, and causal explanation before changing production code.

### GREEN

1. Implement the smallest change that satisfies the failing test.
2. Keep the test unchanged. Never delete, skip, weaken, over-mock, or rewrite it merely to obtain green.
3. Run the focused test after each logical implementation attempt until it passes for the intended reason.
4. If the test is logically wrong, conflicts with the accepted criterion, or tests an impossible contract, stop and escalate with evidence. Do not edit it just to pass.

### REFACTOR

1. Refactor only after the focused test is green.
2. Remove only duplication or complexity introduced by the owned change; avoid unrelated cleanup and speculative abstractions.
3. Re-run the focused test after each structural change. Restore green before continuing.

## Verify and Report

1. Re-run the focused test from a clean command invocation.
2. Run the project-defined broader checks appropriate to the changed surface, such as the related suite, full tests, type checking, linting, and build.
3. Compare the final diff with the single behavior and acceptance criterion. Confirm that no test was weakened and no unrelated file changed.
4. Report fresh commands, exit status, test counts or key output, the RED failure reason, the GREEN evidence, and any checks not run.
5. Start another cycle only for the next independently testable behavior.

## Protect Work and History

- Never run `git reset --hard`.
- Preserve the diagnostic RED command and output before undoing an attempt.
- Undo only changes owned by this task. Never restore, delete, clean, or overwrite a file containing pre-existing user work; use surgical edits or ask for help when ownership overlaps.
- Create checkpoints, commits, branches, pull requests, or pushes only with explicit user authorization and only for owned paths.
- Leave a resumable handoff when interrupted while RED or GREEN is incomplete.
