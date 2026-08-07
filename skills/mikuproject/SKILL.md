---
name: mikuproject
description: Use only when the user explicitly says `mikuproject`, `miku project`, or `mikuku project` for mikuproject-specific WBS workflows. This skill handles mikuproject draft, patch, workbook, and export operations; do not auto-activate it for generic planning or project discussion.
---

# Mikuproject

Use this skill for `mikuproject`-specific WBS drafting, revision, import, and export.
Keep the focus on WBS planning workflows and state conversion, not on replacing the browser UI.

For this skill, `mikuproject` should be opt-in by default.
Do not trigger `mikuproject` from planning words or export-format words alone.

Start `mikuproject` mode when at least one of these explicit triggers is present:

- the user names `mikuproject`
- the user writes `miku project`
- the user writes `mikuku project`
- the recent conversation is already in an active `mikuproject` workflow from an earlier explicit trigger

Without one of these triggers, do not force `mikuproject` just because the request mentions `WBS`, `スケジュール`, `工程`, `計画`, `Excel`, `xlsx`, `画像`, `SVG`, `Mermaid`, `ガント`, or similar words.
In that case, either answer normally or ask a brief clarifying question.

## Core Rules

- prefer agent-internal execution and keep intermediate JSON internal when possible
- complete import/apply steps internally instead of stopping at visible handoff
- for new WBS drafting, use `project_draft_view`
- for existing plan revision, use `Patch JSON`
- in `project_draft_view`, express dependencies on each task with `predecessor_uids` or `predecessors[].task_uid`; do not rely on top-level `dependencies`
- in `Patch JSON`, change dependencies with `link_tasks` / `unlink_tasks`; when generating lag, emit either `lag` or `lag_hours`, not both
- do not switch a normal `mikuproject` flow to ad-hoc tables, one-off converters, or runtime inspection unless the real path has failed

## Operations

Prefer the bundled upstream runtime artifacts in `runtime/`.
Use these before falling back to direct file reads or UI-oriented flows.

## Runtime Discipline

For explicit `mikuproject` import/export or report requests, first check the bundled `mikuproject` runtime artifacts before broad workspace exploration or generic tool discovery.

Unless the user or environment states another execution backend policy, use `cli-preferred`.
Treat `SKILL.md` and files under `references/` as the normative agent-facing instructions.
Any skill-local configuration files are machine-readable mirrors for tooling and are lower priority than explicit user instructions, environment policy, and these Markdown instructions.

Backend policy values:

- `cli-only`: use only the bundled CLI backend; do not inspect or call MCP tools as fallback
- `cli-preferred`: use the bundled CLI backend first; use MCP only when CLI is unavailable or unsuitable and MCP fallback is allowed
- `mcp-only`: use only the MCP backend; do not inspect or run CLI artifacts as fallback
- `mcp-preferred`: use MCP first; use CLI only when MCP is unavailable or unsuitable and CLI fallback is allowed
- `handoff-only`: do not execute backend operations; return visible spec, JSON, artifact instructions, or handoff steps

Interpret an explicit backend policy in the user's current request when it uses
one of the exact policy values above, with or without simple Japanese particles
or wording such as `で`, `として`, `固定`, `only`, `preferred`, or `fallbackなし`.
Examples:

- `mikuproject、mcp-only で要約して`
- `mikuproject cli-only 固定で WBS XLSX を出して`
- `mikuproject handoff-only として spec を出して`

The latest explicit user policy in the active request wins over the skill
configuration default. Do not infer a strict policy from backend names alone; `MCP でも使える?`
is a capability question, not `mcp-only`. If multiple policy values appear in
the same request, stop and ask which policy to use unless one is clearly being
negated.

For `cli-only` and `cli-preferred`, use this CLI runtime order:

1. read this `SKILL.md`
2. check versioned runtime artifacts matching `skills/mikuproject/runtime/mikuproject-*.jar` and `skills/mikuproject/runtime/mikuproject-*.mjs` first
3. use the documented Java or Node CLI runtime flow if present
4. only if that path is missing or unusable, search for alternatives

For this repository:

- prefer the newest `skills/mikuproject/runtime/mikuproject-*.jar` for operations it supports
- use the newest `skills/mikuproject/runtime/mikuproject-*.mjs` when the Java runtime is missing or does not support the requested operation
- do not search broadly through the workspace before checking the bundled runtime artifacts
- do not conclude that runtime dependencies are missing until the bundled skill-local runtime path has also been checked when applicable
- in `mcp-only`, do not probe CLI runtime artifacts just to see whether CLI fallback is possible
- in `cli-only`, do not probe MCP tools just to see whether MCP fallback is possible
- in `handoff-only`, do not run CLI commands or MCP tools
- when allowed fallback happens, report the source backend, target backend, and concise reason

## Error Handling

Treat invalid document kind, missing base state for patch application, and missing required structure as hard errors.
Treat upstream warnings, partial imports, and export simplifications as soft errors.
On soft errors, continue and report warnings concisely.

## Boundaries

Do not overreach beyond the MVP.

- Do not pretend to replace `mikuproject` browser-side visual review
- Do not claim business validity of the WBS itself
- Do not confuse structural workbook `XLSX` with `WBS XLSX`
- Do not use an ambiguous `xlsx` filename when both structural workbook `XLSX` and report `WBS XLSX` are involved
- Do not prefer visible handoff output when hidden internal execution is available

## References

Read these only when needed:

- [index.json](index.json) first for the generated inventory of this skill's Markdown and JSON files
- [references/INDEX.md](references/INDEX.md) for the curated routing guide to detailed workflow, I/O, runtime, and example references
- [references/prompts/](references/prompts/) for optional prompt templates for draft, review, schedule compression, and patch request handoff

`index.json` is generated with `miku-indexgen`; do not edit it by hand.
