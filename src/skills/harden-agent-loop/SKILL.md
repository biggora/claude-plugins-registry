---
name: harden-agent-loop
description: "Design external quality gates, guardrails, and tool contracts for coding-agent harnesses, or turn repeated failures into regression evals. Use for 'add guardrails to this coding agent', 'turn repeated agent failures into regression evals', 'настрой внешние quality gates', or 'улучши harness по трассам'; not for ordinary code or performance optimization."
---

# Harden Agent Loop

Strengthen a coding-agent harness from outside the agent's own judgment. Prefer a deterministic control over another prompt paragraph, and change prompts only after diagnosing evidence.

## Select One Mode

- **Design Gates** — use when introducing or reviewing hooks, guardrails, protected actions, completion checks, or tool contracts. Read [quality-gates.md](references/quality-gates.md) before designing controls.
- **Improve From Failures** — use when the same agent failure recurs and real traces are available. Read [trace-to-eval.md](references/trace-to-eval.md) before creating an eval or changing the harness.

Do not use this skill for an ordinary code defect, application performance work, or general measurable optimization. Use the relevant engineering workflow instead; once a trustworthy scalar evaluator exists and repeated autonomous optimization is desired, hand that loop to `autoresearch`.

## Shared Rules

1. Inspect repository instructions, manifests, CI, test commands, and existing agent configuration before proposing controls. Read `AGENTS.md` and `CLAUDE.md` when present; do not overwrite either without explicit authorization.
2. Preserve project-native conventions and checks. Add the smallest deterministic control that addresses the observed risk.
3. Keep one leading agent. Do not create a swarm. When independence materially improves verification, use at most one bounded verifier with fresh context and read-only access.
4. Treat production, databases, secrets, irreversible operations, and external side effects as approval boundaries. Require human approval immediately before the action.
5. Never run `git reset --hard`. Commit, push, or open a pull request only with explicit authorization and only for task-owned changes.
6. Fail closed: a blocked, timed-out, malformed, or unavailable safety check is not a pass.
7. Minimize logs and tool output. Redact secrets and personally identifiable information before storage, evaluation, or delegation.

## Mode: Design Gates

1. **Map the boundary.** Inventory untrusted inputs, writable state, tools, network or service access, protected files and commands, sensitive data, and external side effects. Classify each action as read-only, reversible, sensitive, or irreversible.
2. **Discover native evidence.** Derive format, test, type, lint, and build commands from repository-owned sources. Do not invent replacement commands when the project already defines them.
3. **Place controls.** Run the narrow relevant checks after edits; run the repository's completion set before allowing a done claim. Block protected files and commands at the execution boundary, not only in prose.
4. **Define approvals.** Require an explicit human decision for production changes, database mutations, secret access or rotation, irreversible changes, and external actions such as publishing or messaging.
5. **Harden tool contracts.** Give every tool a distinct purpose, precise minimal parameters, explicit use conditions, bounded results, actionable errors, and least privilege. Remove or clarify overlaps.
6. **Specify failure behavior.** Deny on ambiguity or unavailable validation, explain the failed gate concisely, and give a safe corrective next step without exposing sensitive data.
7. **Exercise the gates.** Test both a permitted action and each important denial path. Confirm no success path can bypass completion checks.

Use the design and review checklists in [quality-gates.md](references/quality-gates.md). Report the protected boundary, gate triggers, pass evidence, approval points, and denial behavior.

## Mode: Improve From Failures

1. **Collect evidence.** Preserve sanitized raw traces, outcomes, gate results, and feedback. Diagnose before changing instructions; do not start from a preferred prompt edit.
2. **Name one repeatable class.** Group failures by observable symptom and likely harness boundary. Confirm recurrence across independent traces or a stable reproduction.
3. **Build a protected regression eval.** Derive cases from raw artifacts while keeping the expected answer and scoring rubric outside the agent-visible input. Freeze the evaluator for the comparison.
4. **Measure the baseline.** Record harness revision, eval set revision, run conditions, sample size, metric, variance when relevant, and safety constraints.
5. **Change exactly one layer.** Choose one of: state, instructions, tool contract, gate, or guardrail. Tie the change to the diagnosed failure and leave the evaluator and other layers unchanged.
6. **Rerun and compare.** Use the same protected eval and conditions. Retain the change only when it produces measured improvement without a safety regression; otherwise reject only the candidate change.
7. **Record the decision.** Capture the failure class, hypothesis, changed layer, before/after metric, safety results, and keep/reject outcome.

Follow [trace-to-eval.md](references/trace-to-eval.md) for artifact separation, layer selection, comparison rules, and the `autoresearch` handoff boundary.

## Completion Contract

Finish with concise evidence, not a confidence claim:

- selected mode and diagnosed risk or failure class;
- controls or single harness-layer change made;
- commands/eval revision and fresh results;
- denial-path and safety results;
- unresolved risks or required human approvals.
