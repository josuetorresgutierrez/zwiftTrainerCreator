# Skill Registry

**Delegator use only.** Sub-agents do not read this file directly; delegators inject matching compact rules into prompts.

## User Skills

| Trigger | Skill | Path |
|---------|-------|------|
| PR creation workflow for Agent Teams Lite following the issue-first enforcement system. Trigger: When creating a pull request, opening a PR, or preparing changes for review. | branch-pr | C:\Users\josue\.config\opencode\skills\branch-pr\SKILL.md |
| Go testing patterns for Gentleman.Dots, including Bubbletea TUI testing. Trigger: When writing Go tests, using teatest, or adding test coverage. | go-testing | C:\Users\josue\.config\opencode\skills\go-testing\SKILL.md |
| Issue creation workflow for Agent Teams Lite following the issue-first enforcement system. Trigger: When creating a GitHub issue, reporting a bug, or requesting a feature. | issue-creation | C:\Users\josue\.config\opencode\skills\issue-creation\SKILL.md |
| Parallel adversarial review protocol that launches two independent blind judge sub-agents simultaneously to review the same target, synthesizes their findings, applies fixes, and re-judges until both pass or escalates after 2 iterations. Trigger: When user says "judgment day", "judgment-day", "review adversarial", "dual review", "doble review", "juzgar", "que lo juzguen". | judgment-day | C:\Users\josue\.config\opencode\skills\judgment-day\SKILL.md |
| Creates new AI agent skills following the Agent Skills spec. Trigger: When user asks to create a new skill, add agent instructions, or document patterns for AI. | skill-creator | C:\Users\josue\.config\opencode\skills\skill-creator\SKILL.md |

## Compact Rules

### branch-pr
- Every PR MUST link an approved issue and include exactly one `type:*` label.
- Branch names MUST be `type/description` with lowercase `a-z0-9._-` only.
- PR body MUST include `Closes/Fixes/Resolves #N`, summary bullets, changes table, test plan, and checklist.
- Use conventional commits; `feat`/`fix` map to `type:feature`/`type:bug`.
- Run shellcheck on modified scripts before opening the PR.

### go-testing
- Prefer table-driven tests for multiple cases.
- Test Bubbletea models by calling `Update()` directly for state transitions.
- Use `teatest.NewTestModel()` for end-to-end TUI flows.
- Use golden files for view/output snapshots.
- Use `t.TempDir()` and isolate filesystem side effects.

### issue-creation
- Blank issues are disabled; always use a template.
- Search for duplicates before creating an issue.
- Every issue starts with `status:needs-review`; a maintainer must add `status:approved` before any PR.
- Questions belong in Discussions, not issues.
- Fill every required field in the chosen template.

### judgment-day
- Resolve the skill registry first, then inject matching compact rules into both judges and the fix agent.
- Launch two blind judges in parallel; never sequentially.
- Classify warnings as real or theoretical; only real warnings block.
- Fix confirmed issues, then re-judge; after 2 iterations, ask the user whether to continue.
- If no registry exists, warn and proceed with generic review.

### skill-creator
- Create skills only for reusable, non-trivial patterns.
- Keep SKILL.md focused: frontmatter, when to use, critical patterns, minimal examples, commands.
- Put templates/schemas in `assets/`; local doc links in `references/`.
- `description` MUST include the trigger text.
- Register new skills in `AGENTS.md` when applicable.

## Project Conventions

No project-level convention files were found in the repository root.
