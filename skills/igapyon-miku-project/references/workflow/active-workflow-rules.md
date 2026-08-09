---
title: Miku Project active workflow rules
description: Follow-up, intermediate artifact, and backend policy rules for the active skill.
topics: [miku-project, workflow, backend-policy]
category: reference
status: active
audience: [agent]
updated: 2026-08-06
sources:
  - type: local-file
    role: primary
    path: skills/igapyon-miku-project/SKILL.md
    checked: 2026-08-06
---

# Active Workflow Rules

Use this reference when the skill is already active and you need follow-up handling rules.

## Follow-up Handling

- prefer `draft`, `patch`, `workbook`, import, and export operations over ad-hoc reformats
- treat follow-up requests as part of the same workbook-oriented flow unless the user clearly exits that context
- resolve ambiguous format words in `miku-project` terms when that is the most natural continuation
- do not turn a normal WBS request into a runtime-inspection task unless the actual import or export path has failed

## Intermediate Artifact Discipline

- keep `spec`, `project_draft_view`, `Patch JSON`, and `mikuproject_workbook_json` in internal state when possible
- do not show intermediate artifacts unless the user explicitly asks to inspect them
- do not stop at visible handoff when the host runtime can continue internally
- do not show `project_draft_view` or `Patch JSON` just because you created them
- do not ask the user to manually pass generated JSON back into the same active skill flow
- do not answer a WBS request with only a plain Markdown table when `miku-project` can handle it cleanly

## Backend Policy Discipline

- default to `cli-preferred` when no user or environment policy says otherwise
- treat `SKILL.md` and files under `references/` as the normative agent-facing instructions
- treat skill-local configuration files as machine-readable mirrors for tooling, lower priority than explicit user instructions, environment policy, and the Markdown instructions
- treat exact policy values in the current user request as an explicit backend policy: `cli-only`, `cli-preferred`, `mcp-only`, `mcp-preferred`, or `handoff-only`
- accept simple surrounding wording such as `で`, `として`, `固定`, `only`, `preferred`, or `fallbackなし` when the policy value itself is exact
- the latest explicit user policy in the active request wins over the repository default
- do not infer a strict policy from backend names alone; `MCP でも使える?` is a capability question, not `mcp-only`
- if multiple policy values appear in the same request and one is not clearly negated, ask which policy to use before executing
- under `cli-only`, do not inspect or call MCP tools as an automatic fallback
- under `mcp-only`, do not inspect or run CLI runtime artifacts as an automatic fallback
- under `handoff-only`, do not run CLI commands or MCP tools
- under `cli-preferred` or `mcp-preferred`, fallback only when the active policy and environment allow it
- if fallback happens, report which backend failed, which backend was used, and the concise reason
- if a strict backend policy blocks the only available implementation, stop with a hard execution-path error instead of silently switching backend
- do not use backend fallback to change artifact roles, operation names, or the workbook-oriented flow

## Draft vs Patch

- new WBS drafting: `project_draft_view`
- existing plan revision: `Patch JSON`

For existing plan revision, prefer this internal flow:

- `project_overview_view` for entry
- `task_edit_view` or `phase_detail_view` for local context
- `Patch JSON` for the proposed change
- validate before apply
- diff after apply when change review matters

When the user is starting a new WBS from rough requirements, do not switch to:

- `task_edit_view`
- `phase_detail_view`
- `project_overview_view`
- generic `.editjson` handoff wording

If a raw file extension must be mentioned, use the document kind explicitly:

- new draft import: `project_draft_view`
- existing revision: `Patch JSON`
