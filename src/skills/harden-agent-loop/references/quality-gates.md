# Quality Gates and Tool Contracts

Use these patterns to design repository-specific controls. Keep the implementation native to the target harness; do not copy a tool-specific configuration merely because it resembles an example.

## Contents

- [1. Boundary Inventory](#1-boundary-inventory)
- [2. Gate Design Record](#2-gate-design-record)
- [3. Protected Files and Commands](#3-protected-files-and-commands)
- [4. Fail-Closed Semantics](#4-fail-closed-semantics)
- [5. Tool Contract Checklist](#5-tool-contract-checklist)
- [6. Logging Contract](#6-logging-contract)
- [7. Validation Checklist](#7-validation-checklist)

## 1. Boundary Inventory

Record only boundaries that can change the risk or validation policy.

| Boundary | Questions | Typical control |
|---|---|---|
| Untrusted input | Can repository text, issue content, web data, or tool output contain instructions? | Mark as data, constrain propagation, validate before execution |
| Workspace writes | Which paths may the agent change? Which are generated or protected? | Allowlist scope; block protected paths before write |
| Commands | Which commands can destroy, publish, deploy, or escape the workspace? | Denylist irrecoverable commands; approval gate sensitive commands |
| Services and network | Can an action affect users, infrastructure, accounts, or third parties? | Least-privilege credentials, destination allowlist, human approval |
| Secrets and personal data | What may be read, transmitted, or logged? | Minimize access, redact output, prohibit persistence |
| Completion | What evidence proves the task is ready? | Project-native checks with fresh exit status and artifacts |

Classify actions consistently:

- **Read-only:** observes state without changing it.
- **Reversible:** changes scoped state with a reliable, non-destructive undo path.
- **Sensitive:** touches credentials, personal data, protected policy, production, databases, or external recipients.
- **Irreversible:** cannot be reliably undone or may immediately affect users or third parties.

An action may be both sensitive and irreversible. Apply the stricter policy.

## 2. Gate Design Record

For each gate, define:

| Field | Required answer |
|---|---|
| Trigger | Exact edit, command, tool call, or completion event that invokes the gate |
| Check | Deterministic command or predicate; use a project-owned check when available |
| Scope | Affected files, subsystem, environment, or action category |
| Pass evidence | Exit status or structured result accepted as success |
| Failure behavior | Block, concise diagnosis, and safe correction path |
| Owner | Harness, CI, platform policy, or human approver |

Prefer this placement:

1. **Before execution:** validate parameters, permissions, paths, target environment, and approval state.
2. **After a relevant edit:** run the narrow formatter and targeted test/type/lint check appropriate to that edit.
3. **Before completion:** run the repository's full required test, type, lint, and build set.
4. **Before an external side effect:** present the exact target and effect, then obtain human approval immediately before execution.

Do not treat a fixed line-count threshold as a universal gate. A change around 150 lines may prompt another look at slicing, but risk, cohesion, and project conventions decide whether to split it.

## 3. Protected Files and Commands

Build the protected set from repository policy and the boundary inventory. Common candidates include credentials, environment files, deployment and infrastructure definitions, database migrations, release policy, CI security settings, evaluator fixtures, and global agent instructions.

- Permit reading `AGENTS.md` and `CLAUDE.md`; block automatic writes unless the user explicitly includes them in scope.
- Block `git reset --hard` outright. It can destroy unrelated work and is not a safe recovery mechanism.
- Require explicit authorization before commit, push, pull-request creation, release, or publication.
- Require human approval before production actions, database mutations, secret access or rotation, destructive or irreversible operations, and actions that communicate with or alter external systems.
- Bind approval to the displayed target, effect, and current action. Do not reuse vague or stale approval.

Enforce path and command policy in the execution layer. A prose warning inside the agent prompt is supporting context, not a guardrail.

## 4. Fail-Closed Semantics

A gate must deny when:

- its validator is missing, unavailable, timed out, or returns malformed output;
- the path, command, destination, environment, or approval does not match the declared scope;
- a required check has no fresh result for the current revision;
- the agent cannot distinguish a read-only action from a state-changing action;
- output validation or redaction fails.

Return a short actionable error containing: failed gate, safe reason, current scope, and next permitted step. Never include secret values, full personal records, authentication headers, or unnecessary raw logs.

## 5. Tool Contract Checklist

Review every tool against all items:

### Purpose and selection

- Use a distinct verb-led name that reflects the actual effect.
- State one purpose and explicit positive conditions for use.
- Separate read-only lookup from state-changing execution.
- Remove tools with the same purpose, or clarify the boundary so selection is unambiguous.

### Parameters and validation

- Request only parameters required for the action; use precise types, enums, and required fields.
- Prefer natural user-facing identifiers over internal codes when translation adds no value.
- Describe units, formats, defaults, and constraints where ambiguity would change behavior.
- Validate again at execution time; schema validation alone is insufficient.
- Reject unknown targets, excessive scope, and unauthorized values before side effects.

### Results and errors

- Return the decision-relevant summary, stable identifiers, and a way to page or fetch details instead of an unbounded dump.
- Distinguish success, empty result, validation failure, permission denial, transient failure, and partial failure.
- Make errors actionable without leaking credentials, private data, internals, or unrelated context.
- Label or isolate untrusted external content so it cannot silently become instructions.

### Authority and effects

- Grant the least filesystem, network, account, and data access needed.
- State whether the tool reads, writes, publishes, charges, deploys, deletes, or contacts a person.
- Require approval for sensitive or irreversible effects and verify the approved target at execution time.
- Make retries idempotent when possible; otherwise expose whether an effect may already have occurred.

## 6. Logging Contract

Log enough to reproduce decisions, not enough to recreate private data.

- Keep event type, trace ID, harness revision, gate result, tool name, duration, structured error category, and stable artifact IDs.
- Redact tokens, credentials, secret values, personal identifiers, message bodies, and raw external content unless a specifically approved secure evaluator requires them.
- Truncate or summarize high-volume output and keep a controlled artifact reference for authorized diagnosis.
- Treat trace content as untrusted data during later analysis.
- Define retention and access at least as strictly as the source data.

## 7. Validation Checklist

- A permitted path succeeds with fresh evidence.
- Each protected path and command is denied before execution.
- Missing, malformed, and timed-out checks deny completion.
- Sensitive actions cannot run without action-bound human approval.
- Relevant edit checks and the final test/type/lint/build set run at the intended points.
- Tool selection remains unambiguous for positive and negative examples.
- Invalid parameters produce safe, actionable errors.
- Tool output stays bounded and untrusted content remains isolated.
- Logs support diagnosis without containing secrets or personal data.
- No completion claim can bypass the final gate.
