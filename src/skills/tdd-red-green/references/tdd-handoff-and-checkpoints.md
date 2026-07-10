# TDD Handoff and Checkpoints

Use these formats to keep the test contract independent, preserve evidence, and resume without losing the causal RED → GREEN chain.

## Fresh Test-Author Brief

Give a fresh test author only the contract needed to design the test:

```markdown
# Test-author brief

Behavior: <one externally observable behavior>
Acceptance criterion: <exact criterion>
Public entry point: <API, command, component, or user action>
Relevant test conventions: <framework, nearby examples, command>
Allowed test paths: <paths the author may modify>
Constraints: Do not inspect or propose implementation internals. Do not modify production code.
Expected output: One focused test plus the exact command that should run it.
Stop condition: Stop if the criterion is ambiguous, untestable, or conflicts with the public contract.
```

Do not include the intended fix, suspected implementation file, implementation diff, previous failed approaches, or a test body drafted by the implementer. Treat the resulting test as an independent executable contract.

## Cycle Evidence Record

Record this information in the task's existing progress mechanism or in the work report; do not create a new state file unless the repository or user asks for one.

```markdown
## Behavior: <name>

- Classification: bug | feature
- Criterion: <one testable outcome>
- Owned paths: <paths changed by this cycle>
- Pre-existing dirty paths preserved: <paths, or none>
- Focused command: `<command>`
- RED expected assertion: <assertion>
- RED actual result: <failure and relevant exit status>
- RED causal check: <why this is the intended missing/wrong behavior>
- GREEN change: <minimum behavior change>
- GREEN result: <fresh pass and relevant exit status>
- Broader checks: <command/result pairs>
- Remaining risk or unrun check: <item, or none>
```

Acceptable RED evidence names the behavioral mismatch. Example: `calculateTotal([10], 0.2)` returned `10`, so the assertion expecting `12` failed. An import error, syntax error, unavailable service, stale log, or unrelated failing test is not acceptable RED evidence.

## Bug No-Change Record

Use this outcome when the reported defect does not exist under the accepted criterion:

```markdown
## Reproduce-or-abstain result

- Reported behavior: <claim>
- Criterion: <expected behavior>
- Reproduction or test command: `<command>`
- Fresh observed result: <output and exit status>
- Conclusion: Current behavior already satisfies the criterion; no production change made.
- Remaining uncertainty: <environment or case not covered, or none>
```

Do not add a speculative regression test that merely restates already-covered behavior unless the user requests added coverage.

## Failed Attempt Recovery

1. Capture the RED command and output before undoing diagnostic work.
2. Re-read `git status` and the diff for every affected file.
3. Identify exact hunks created by the current attempt.
4. Reverse only those owned hunks with a surgical patch. Do not use whole-file restore when the file had pre-existing changes.
5. Re-run the original RED command to confirm that recovery did not damage the user's work or test environment.
6. Never use `git reset --hard`, broad clean commands, or deletion of unowned files.

## Interrupted-Cycle Handoff

```markdown
# TDD handoff

Current phase: RED | GREEN | REFACTOR | VERIFY
Behavior and criterion: <exact outcome>
Owned paths: <paths>
Pre-existing changes to preserve: <paths and relevant hunks>
Last command: `<command>`
Last result: <exit status and behavioral reason>
Test state: <failing/passing and why>
Implementation state: <not started/partial/minimum complete>
Next action: <one concrete command or edit>
Do not: <unsafe recovery action or test change to avoid>
```

Resume by inspecting repository instructions and `git status`, then re-running the last focused command. Do not trust a stale RED or GREEN result.

## Authorization Boundary

Treat test and code edits requested by the user as implementation authority. Treat history-changing and remote actions separately: create a commit, checkpoint branch, pull request, or push only when the user explicitly authorizes that action. Stage or publish only owned paths.
