# Delegation and Review Briefs

Copy the relevant structure and replace each angle-bracket field with task-specific facts.

## Bounded Delegation Contract

```markdown
## Delegation Contract

- Role: <specialized responsibility>
- Context: <minimum repository and product facts>
- Task: <exact actions, paths, and required behavior>
- Constraints, tools, and authority: <required skills/tools; allowed writes; prohibited or approval-gated actions; quality rules>
- Input: <exact files, data, artifacts, and verified dependencies>
- Expected output: <artifact format or location; concise summary; evidence; assumptions; limitations>
- Acceptance criteria: <measurable checks for completeness, correctness, constraints, and integration>
- Example: <one correct result or stable reference>
- Stop condition: <completion boundary; blockers or discoveries that must return control>
```

Require the delegate to return the artifact and concise evidence, not a full reasoning trace.

### Correct Example: Repository Survey

```markdown
- Role: Repository Architecture Analyst focused on authentication boundaries.
- Context: Node.js ESM repository; the approved change must add service-token authentication without changing browser login.
- Task: Inspect authentication entry points, middleware, token storage, and focused tests. Produce a dependency map and identify the smallest safe extension seams. Do not implement.
- Constraints, tools, and authority: Use repository search and read-only shell commands. Read AGENTS.md first. Do not edit files, install dependencies, call external services, or inspect unrelated secrets.
- Input: AGENTS.md, package.json, src/auth/, tests/auth/, and the approved acceptance criteria.
- Expected output: A Markdown summary naming concrete paths and symbols, current request flow, extension seams, risks, unknowns, and commands used as evidence.
- Acceptance criteria: Cover every supplied path; trace browser and service-token flows separately; support each claim with a path or command result; make no writes.
- Example: `src/auth/middleware.js -> verifySession() -> request.user`, with the test that exercises the edge.
- Stop condition: Return control when the map and evidence are complete, or immediately when a required path is missing or access would exceed read-only authority.
```

### Incorrect Example: Unnecessary Delegation

Do not delegate a one-file typo correction with an existing focused test. Keep it single-agent because the boundary, context, edit, and verification are already coherent.

## Fresh-Context Review Brief

```markdown
## Independent Review

- Artifact or diff: <exact path, commit range, or supplied patch>
- Approved specification: <stable path or verbatim approved text>
- Acceptance criteria: <numbered observable criteria>
- Run instructions: <setup and exact verification commands>
- Verifier tools: <test runner and applicable test-web-ui, test-mobile-app, or ui-audit skill>
- Review boundary: Check only correctness and requirements. Do not modify the artifact or suggest unrelated improvements.
- Required report: Criterion-by-criterion evidence, reproduction steps for failures, overall PASS/FAIL/PARTIAL, and Independence status.
```

Provide none of the following:

- implementation conversation or design history;
- the implementer's reasoning or confidence;
- a suspected defect, likely failure location, or expected answer;
- prior reviewer conclusions or the intended fix.

### Correct Reviewer Input

Send the approved team-invitation criteria, the resulting diff, setup commands, and the relevant integration/E2E tools. Ask whether each criterion passes from the observable interface.

### Contaminated Reviewer Input

Do not say, "The token reuse guard is probably wrong in `acceptInvite`; confirm that it needs an atomic update." This leaks both a suspected defect and expected answer.

## Orchestrator Grade

```markdown
- Mode: Bounded Delegation | Independent Fresh-Context Review
- Grade: PASS | FAIL | PARTIAL
- Acceptance evidence: <criterion-to-evidence mapping>
- Independence: CONFIRMED | MISSING | NOT APPLICABLE
- Decision: Accept | Re-delegate | Require human/external review
- Retries: <count and correction boundary>
- Limitations: <remaining verified constraints>
```

Use `PASS` only when every acceptance criterion has current evidence and all constraints were respected. Use `FAIL` for an incorrect or unsafe result. Use `PARTIAL` for incomplete evidence or scope. When no fresh agent exists, set `Independence: MISSING` even if local black-box checks pass.
