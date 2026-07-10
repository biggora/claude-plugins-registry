---
name: delegate-bounded-work
description: "Coordinate narrow delegated work and unbiased verification while keeping small tasks single-agent. Use for 'delegate this large repository survey', 'run an independent fresh-context review', 'сформируй узкий контракт для субагента', or 'проведи независимую проверку в свежем контексте'; do not delegate a small coherent local edit without a concrete benefit."
---

# Delegate Bounded Work

Keep orchestration small, explicit, and evidence-driven. Retain end-to-end responsibility as the orchestrator.

## Choose the Execution Mode

1. Default to **single-agent execution** for a small coherent edit, a local investigation, or work whose context and verification already fit one agent. Avoid delegation when coordination cost exceeds its measurable benefit.
2. Choose **Mode 1: Bounded Delegation** when one separable deliverable benefits from specialist knowledge, parallel discovery, context isolation, or a distinct tool surface.
3. Choose **Mode 2: Independent Fresh-Context Review** when an existing artifact needs unbiased acceptance verification.
4. State the chosen mode, the reason it adds value, assumptions, task boundary, and success evidence. Do not create a swarm to compensate for unclear scope.

## Mode 1: Bounded Delegation

Delegate one atomic deliverable to one appropriate specialist. Keep dependent or cross-cutting integration with the orchestrator unless another boundary is independently verifiable.

Before dispatch, write a contract containing:

- **Role**: one specialized responsibility.
- **Context**: only repository and product facts needed for this deliverable.
- **Task**: exact actions, locations, and behavior.
- **Constraints, tools, and authority**: required skills/tools, quality rules, allowed mutations, and actions that require approval.
- **Input**: exact files, data, artifacts, or prior verified outputs.
- **Expected output and acceptance criteria**: deliverable format plus measurable proof.
- **Example**: one representative correct result or stable reference.
- **Stop condition**: completion boundary and conditions that require returning control rather than expanding scope.

Require the delegate to return the artifact or precise artifact location, a concise result summary, verification evidence, assumptions, and limitations. Do not request a full reasoning trace.

Inspect the result against every contract field. Grade it `PASS`, `FAIL`, or `PARTIAL`. Accept only `PASS`; for `FAIL` or `PARTIAL`, re-delegate with the failed criterion, observed evidence, and correction boundary instead of silently patching the delegate's work. Escalate a repeated identical blocker rather than adding agents or broadening authority.

## Mode 2: Independent Fresh-Context Review

Start a fresh reviewer only after the artifact exists. Give the reviewer only:

- the artifact or diff;
- the approved specification and acceptance criteria;
- commands or steps required to run it;
- verifier tools and environment facts needed for black-box checks.

Do not provide implementation history, suspected defects, expected answers, prior conclusions, or the implementer's reasoning. Ask the reviewer to test acceptance criteria as a user or external verifier and flag only correctness or requirements failures. Exclude style preferences, speculative improvements, and unrelated refactors.

Route web journeys through `test-web-ui`, mobile journeys through `test-mobile-app`, and visual conformance through `ui-audit` when those skills are available and applicable. Keep the review read-only unless the user separately authorizes remediation.

If a fresh agent is unavailable, prepare the same review brief, run the black-box checks locally, label the result `Independence: MISSING`, and require human or external review before claiming independent sign-off.

Grade the review `PASS`, `FAIL`, or `PARTIAL` against the approved criteria. Re-delegate remediation through a bounded contract; never leak the expected fix into the next independent review.

## Assemble Verified Work

Integrate only accepted artifacts, preserve unrelated changes, and rerun the relevant end-to-end checks after integration. Report each contract or review, its grade, evidence, retries, and unresolved limitations.

Read [delegation and review briefs](references/delegation-and-review-briefs.md) before dispatching work or independent review.
