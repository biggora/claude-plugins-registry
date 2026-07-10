---
name: keep-goal
description: "Preserve task intent and repository context across long-running work with bootstrap, handoff, and evidence-based resume. Use for EN triggers: 'prepare a handoff for the next session', 'resume this long-running implementation', 'preserve task context'; RU triggers: 'сохрани контекст задачи', 'подготовь передачу следующей сессии', 'восстанови работу по progress-файлу'."
---

# Keep Goal

Maintain a small, repository-grounded external memory for work that spans sessions. Treat the repository and fresh command output as truth; treat state files as claims that must be checked.

Read [state templates](references/state-templates.md) before creating or materially restructuring state files. Reuse only the sections the task needs.

## Select State Locations

1. Inspect repository instructions and existing task artifacts for an established state convention.
2. Reuse the established convention when one exists. Do not create a parallel `.agent/` system beside project-owned progress, decision, specification, or task files.
3. Otherwise use `.agent/CONTEXT.md`, `.agent/PROGRESS.md`, and `.agent/DECISIONS.md`. Store separate specifications at `.agent/specs/<slug>.md` and execution plans at `.agent/tasks/<slug>.md` when the task needs them.
4. Derive one stable, filesystem-safe `<slug>` from the task and reuse it. Do not create multiple names for the same task.
5. Keep state concise and task-relevant. Do not invent a project-management system.

## Choose a Mode

- Use **Bootstrap** when repository context or durable task state is absent or unverified.
- Use **Update/Handoff** after a meaningful work step, before pausing, or before another session takes over.
- Use **Resume** before continuing work from durable state.

## Mode: Bootstrap

1. Establish the repository root and inspect `git status` plus recent `git log` before assigning ownership to any existing change.
2. Read applicable `AGENTS.md` and `CLAUDE.md` files, then inspect the README, relevant docs, manifests, lockfiles, build files, and CI workflows.
3. Discover setup, build, test, lint, type-check, validation, and smoke commands only from project-owned sources such as manifest scripts, build files, contributor docs, or CI. Record each exact command with its source. Never fabricate a likely command.
4. Capture the project purpose, relevant structure, active constraints, environment assumptions, and current worktree condition. State uncertainty explicitly.
5. Compare instructions and artifacts. If they conflict, preserve both facts, explain the contradiction, and ask for direction instead of silently choosing or overwriting.
6. Select state locations using the precedence above. Create the minimum necessary files from the templates; merge verified facts into existing state instead of replacing it wholesale.
7. Read instruction files for authority and context, but never rewrite `AGENTS.md` or `CLAUDE.md` automatically.

## Mode: Update/Handoff

1. Refresh repository status, owned-file diffs, and current verification output.
2. Update the progress record with the goal, acceptance criteria, and `todo` / `doing` / `done` status. Attach fresh evidence to every `done` item.
3. Record completed work, broken or uncertain behavior, remaining work, open questions, and exactly one best next action.
4. Append a decision only when a meaningful choice has been made. Record its context, considered options, choice, and consequences; supersede an old decision explicitly rather than erasing it.
5. Update repository context only when a stable, verified fact changed. Keep transient task details in progress instead.
6. Record enough worktree and command evidence for the next session to distinguish pre-existing changes from task-owned changes and to repeat the last check.
7. Deliver a short handoff that names the state files and the best next action. Do not duplicate their full contents in chat.

## Mode: Resume

Perform these steps before editing code:

1. Establish `pwd` or its platform equivalent, inspect `git status`, and inspect recent `git log`.
2. Locate state using repository conventions first and the `.agent/` fallback second. Read the applicable context, progress, decisions, specification, and task plan.
3. Re-read applicable repository instructions and compare state claims with the current HEAD, worktree, files, dependencies, and available commands.
4. Surface stale paths, missing changes, conflicting instructions, outdated evidence, or any other contradiction. Ask before overwriting ambiguous state or user work.
5. Run the lightest project-owned baseline smoke check that can confirm the environment still works. Use only an exact command discovered from the repository or recorded with a valid source.
6. If the baseline fails, record the failure and determine what evidence is needed to classify it; do not assume the pending task caused it.
7. Only after the state review and baseline check, choose the recorded best next action or replace it with a better action that directly advances an unmet acceptance criterion. Explain the change when it contradicts the handoff.

## Preserve Evidence and User Work

- Never claim the task or an acceptance criterion is done without fresh, relevant evidence.
- Mark stale evidence as requiring revalidation; do not copy an old success into a new session as proof.
- Preserve pre-existing and unrelated changes. Edit only task-owned files unless the user expands scope.
- Never run `git reset --hard`.
- Create a commit, branch, checkpoint, pull request, or push only with explicit user authorization and only for task-owned changes.
- Stop and ask when assumptions, instructions, state files, or repository facts materially disagree.
