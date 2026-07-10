# Vertical Slice Examples

Use these patterns to distinguish independently demonstrable delivery from horizontal component plans.

## Slice Record Template

Store the plan in the repository's existing task-state location or, when none exists, `.agent/tasks/<slug>.md`.

```markdown
# <Approved capability>

- Specification: <path or stable reference>
- Acceptance criteria: <criterion identifiers>
- Assumptions and competing interpretations: <decisions requiring visibility>
- Active-slice invariant: exactly one slice has Status: Active

## S1 — <Observable increment>

- Acceptance criteria: <criterion identifiers>
- User outcome: <what a user can now do or what material risk is proven>
- Scope: <included behavior>
- Not in scope: <explicitly deferred behavior>
- Dependencies: <prior slices, decisions, services, or none>
- Likely paths: <repository areas; mark uncertain paths>
- Done when:
  - `<exact test, build, lint, or probe command>` passes from the current worktree.
  - <observable assertion tied to the user outcome> is demonstrated.
- Demo method: <ordered user or stakeholder actions and expected result>
- Status: Active
```

Repeat the record for later slices with `Pending`, `Blocked`, or `Done`. Do not mark more than one slice `Active`.

## Correct: Team Invitation Through the System

Assume an approved specification requires an owner to invite a person, the recipient to accept a valid token, and membership to appear in the team.

### S1 — One invited person accepts a valid token

- **Acceptance criteria:** AC-2, recipient accepts an outstanding invitation and becomes a member.
- **User outcome:** An invited, signed-in person accepts one valid token and immediately appears as a team member.
- **Scope:** Persist a seeded invitation; validate and consume its token in the domain/API path; persist membership; expose a minimal acceptance screen and resulting member state; emit the existing audit signal if the application requires one.
- **Not in scope:** Owner invite creation, email delivery, expiration, resend, revocation, role selection, and polished empty/error states.
- **Dependencies:** Confirm the existing authentication identity and team-membership invariant.
- **Likely paths:** Invitation and membership persistence, invitation-acceptance domain service, acceptance endpoint, minimal acceptance/member UI, integration and E2E tests.
- **Done when:** `npm test -- tests/invitations/accept.test.js` proves one token creates exactly one membership and cannot be consumed twice; `npm run test:e2e -- invitations-accept` proves the recipient sees the resulting membership.
- **Demo method:** Seed one invitation, sign in as its recipient, open the token URL, accept it, and show the recipient in the team member list.
- **Status:** Active.

### S2 — An owner creates an invitation

- **Acceptance criteria:** AC-1, owner can invite an eligible address.
- **User outcome:** A team owner creates an invitation and receives a deliverable invitation link through the approved channel.
- **Scope:** Owner authorization, invitation creation, delivery adapter, and minimal owner feedback.
- **Not in scope:** Resend, bulk invite, role changes, and expired-token handling.
- **Dependencies:** S1 acceptance path and the chosen delivery sandbox.
- **Likely paths:** Owner UI, creation endpoint/domain service, persistence, delivery adapter, integration and E2E tests.
- **Done when:** The project integration test proves an authorized owner creates one invitation and the delivery sandbox receives the correct link; the E2E test opens that link and completes S1.
- **Demo method:** Invite one address as the owner, inspect the sandbox message, follow its link, and complete acceptance.
- **Status:** Pending.

### S3 — Failed and expired invitations stay safe

- **Acceptance criteria:** AC-3, invalid or expired invitations do not create membership and show an actionable result.
- **User outcome:** A recipient receives a clear result without gaining membership when a token is invalid or expired.
- **Scope:** Invalid, expired, and already-consumed outcomes plus operationally useful existing telemetry.
- **Not in scope:** Administrative analytics and bulk recovery.
- **Dependencies:** S1 token semantics and S2 delivery path.
- **Likely paths:** Token validation, error response mapping, acceptance UI states, telemetry, integration and E2E tests.
- **Done when:** Fresh integration tests prove no membership is created for each rejected state; the E2E test shows the approved recovery message.
- **Demo method:** Open expired and already-consumed links and show both the user response and unchanged membership list.
- **Status:** Pending.

This ordering tests the core identity/token uncertainty through a real path first while preserving independent demonstrations.

## Incorrect: Horizontal Phases

Do not produce this plan:

1. Build all invitation and membership tables.
2. Build all invitation APIs.
3. Build all invitation screens.
4. Add tests.

No early phase delivers or proves the approved user outcome, integration risk remains until the end, and tests are postponed instead of serving as slice evidence.

## Safe Exception: Mechanical Refactor

For a behavior-preserving module rename or API migration with no meaningful user-facing path, create coherent dependency-safe batches:

1. Migrate the leaf module and its direct tests.
2. Migrate callers in dependency order with the relevant focused test command after each batch.
3. Remove the compatibility shim only after the full project check passes.

Define the outcome as preserved behavior and verified dependency migration. Do not manufacture database/API/UI slices. Keep each batch reviewable, and treat 150 changed lines as a prompt to reconsider boundaries rather than an automatic failure.
