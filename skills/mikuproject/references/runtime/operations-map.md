---
title: Mikuproject operation map
description: Agent Skill operation vocabulary and CLI/MCP backend correspondence.
topics: [mikuproject, agent-skills, cli, mcp]
category: reference
status: active
audience: [agent, maintainer]
updated: 2026-08-06
sources:
  - type: local-file
    role: primary
    path: skills/mikuproject/config/backend-policy.json
    checked: 2026-08-06
---

# Operations Map

Use this reference when you need the supported operation list or the preferred upstream runtime surface.

## Operations

Conversation workflow:

- `spec`: provide `mikuproject-ai-json-spec`
- `draft`: accept AI-produced `project_draft_view`
- `patch`: accept AI-produced `Patch JSON`
- `workbook`: return current `mikuproject_workbook_json`
- `project-overview`: return `project_overview_view` for existing-plan entry
- `task-edit`: return `task_edit_view` for local task revision
- `phase-detail`: return `phase_detail_view` for local phase revision
- `patch-validate`: validate `patch_json` against current workbook state
- `state-diff`: summarize changes between two workbook states

File workflow:

- `xml-import`: accept `MS Project XML` and return `mikuproject_workbook_json`
- `xml-export`: return current `MS Project XML`
- `xlsx-import`: accept structural workbook `XLSX` and return `mikuproject_workbook_json`
- `xlsx-merge-import`: apply structural workbook `XLSX` edits onto an existing state
- `xlsx-export`: return current structural workbook `XLSX`
- `workbook-import`: accept `mikuproject_workbook_json` as a replace import
- `workbook-merge-import`: apply `mikuproject_workbook_json` onto an existing state
- `workbook-export`: return current `mikuproject_workbook_json` as a file-oriented export

Report workflow:

- `wbs-xlsx-export`: return current `WBS XLSX`
- `daily-svg-export`: return current daily `SVG`
- `weekly-svg-export`: return current weekly `SVG`
- `monthly-calendar-svg-export`: return current monthly calendar `SVG` entries
- `all-report-export`: return current report bundle `ZIP`
- `wbs-markdown-export`: return current `WBS Markdown`
- `mermaid-export`: return current Mermaid gantt text

## Runtime Search Order

When this skill is installed from `skill-bundle`, prefer the bundled runtime artifacts:

- `skills/mikuproject/runtime/mikuproject-<version>.jar`
- `skills/mikuproject/runtime/mikuproject-<version>.mjs`

`<version>` is a placeholder. Resolve the actual versioned artifact under `runtime/`
before invoking the CLI.

When working in the development repository, use the same skill-local runtime paths:

- `skills/mikuproject/runtime/mikuproject-<version>.jar`
- `skills/mikuproject/runtime/mikuproject-<version>.mjs`

Do not search broadly for alternate copies before checking these expected locations.

## Preferred Runtime Surface

List Java examples before Node.js examples so agents see the Java runtime first.
Use the runtime that supports the requested operation:

- `java -jar skills/mikuproject/runtime/mikuproject-<version>.jar ...`
- `node skills/mikuproject/runtime/mikuproject-<version>.mjs ...`

Use the upstream CLI runtime artifacts before falling back to direct file reads or UI-oriented flows.

## Runtime `--help` Compatibility

The bundled Java and Node.js runtime artifacts are compared as documented
similarity, not byte-for-byte identity. The executable compatibility fixture is
[`help-compatibility.json`](./help-compatibility.json): it records shared command
vocabulary and Java-only / Node-only operations while checking exit status,
stdout, stderr, and the final newline.

The current `0.8.3.3` artifacts provide usage lists. The fuller AI-era command
help contract is an upstream responsibility and is tracked in
[`docs/upstream-mikuproject-ai-era-cli-contract-request.md`](../../../../docs/upstream-mikuproject-ai-era-cli-contract-request.md).

## Backend Operation Correspondence

Use this table when an execution backend policy needs CLI backend / MCP backend
selection. The Agent Skill operation name remains stable even when the backend
changes.

MCP backend phase grouping:

- Phase A: AI/state workflow tools used for spec, draft, projections, patch validation, patch apply, diff, summarize, and workbook JSON export
- Phase B: primary file import/export tools for structural workbook XLSX and MS Project XML export
- Phase C: report/presentation tools exposed by `mikuproject-mcp` 0.8.2 and later, including WBS XLSX, SVG reports, report bundle, WBS Markdown, and Mermaid

Current `mikuproject-mcp` does not expose every CLI import or merge operation.
Under `mcp-only`, missing MCP tools remain unavailable rather than falling back
to CLI.

| Agent Skill operation | CLI backend command family | MCP backend tool | Notes |
| --- | --- | --- | --- |
| `spec` | `ai spec` | `mikuproject_ai_spec` | Phase A. Same AI spec role. |
| `draft` | `state from-draft` | `mikuproject_state_from_draft` | Phase A. Converts `project_draft_view` to workbook state. |
| `patch` | `state apply-patch` | `mikuproject_state_apply_patch` | Phase A. Requires base workbook state. |
| `workbook` / `workbook-export` | `export workbook-json` | `mikuproject_export_workbook_json` | Phase A. Exports or normalizes workbook JSON. |
| `project-overview` | `ai export project-overview` | `mikuproject_ai_export_project_overview` | Phase A. AI projection for existing-plan entry. |
| `task-edit` | `ai export task-edit` | `mikuproject_ai_export_task_edit` | Phase A. AI projection for task-level editing. |
| `phase-detail` | `ai export phase-detail` | `mikuproject_ai_export_phase_detail` | Phase A. AI projection for phase-level editing. |
| `patch-validate` | `ai validate-patch` | `mikuproject_ai_validate_patch` | Phase A. Validates patch against workbook state. |
| `state-diff` | `state diff` | `mikuproject_state_diff` | Phase A. Compares before / after workbook states. |
| `state-summarize` | `state summarize` | `mikuproject_state_summarize` | Phase A. Summarizes workbook state. |
| `detect-kind` | `ai detect-kind` | `mikuproject_ai_detect_kind` | Phase A. Detects product document kind. |
| `xml-export` | `export xml` | `mikuproject_export_xml` | Phase B. Exports MS Project XML. |
| `xml-import` | `import xml` when supported by CLI | Not currently exposed | Phase B gap. Keep as CLI or handoff until MCP parity exists. |
| `xlsx-import` | `import xlsx` | `mikuproject_import_xlsx` | Phase B. Imports structural workbook XLSX. |
| `xlsx-export` | `export xlsx` | `mikuproject_export_xlsx` | Phase B. Exports structural workbook XLSX. |
| `xlsx-merge-import` | `merge xlsx` | Not currently exposed | Phase B gap. Keep as CLI or handoff until MCP parity exists. |
| `workbook-import` | `state import` | Not currently exposed | Phase B gap. Keep as CLI or handoff until MCP parity exists. |
| `workbook-merge-import` | `state merge` | Not currently exposed | Phase B gap. Keep as CLI or handoff until MCP parity exists. |
| `wbs-markdown-export` | `report wbs-markdown` | `mikuproject_report_wbs_markdown` | Phase C. Human-facing Markdown report. |
| `mermaid-export` | `report mermaid` | `mikuproject_report_mermaid` | Phase C. Mermaid gantt text. |
| `wbs-xlsx-export` | `report wbs-xlsx` | `mikuproject_report_wbs_xlsx` | Phase C. Human-facing WBS XLSX report. |
| `daily-svg-export` | `report daily-svg` | `mikuproject_report_daily_svg` | Phase C. Daily SVG report. |
| `weekly-svg-export` | `report weekly-svg` | `mikuproject_report_weekly_svg` | Phase C. Weekly SVG report. |
| `monthly-calendar-svg-export` | `report monthly-calendar-svg` | `mikuproject_report_monthly_calendar_svg` | Phase C. Monthly calendar SVG archive. |
| `all-report-export` | `report all` | `mikuproject_report_all` | Phase C. Report bundle ZIP. |

Under `cli-only`, use only the CLI backend column. Under `mcp-only`, use only
the MCP backend column and fail if the operation is not exposed there. Under a
preferred policy, switch backend only when fallback is allowed and report the
reason.

The current `mikuproject-mcp` contract uses underscore-separated MCP tool names derived
from the upstream CLI command tree:

- `ai spec` -> `mikuproject_ai_spec`
- `state from-draft` -> `mikuproject_state_from_draft`
- `export workbook-json` -> `mikuproject_export_workbook_json`

Do not rewrite these as dot-separated names in Agent Skill documentation.

## MCP Resource and Artifact Roles

The current `mikuproject-mcp` contract uses these common resource URI roles:

- `mikuproject://spec/ai-json`
- `mikuproject://state/current`
- `mikuproject://state/{name}`
- `mikuproject://export/workbook-json`
- `mikuproject://export/project-xml`
- `mikuproject://export/project-xlsx`
- `mikuproject://projection/{name}`
- `mikuproject://report/wbs-markdown`
- `mikuproject://report/mermaid`
- `mikuproject://report/wbs-xlsx`
- `mikuproject://report/daily-svg`
- `mikuproject://report/weekly-svg`
- `mikuproject://report/monthly-calendar-svg`
- `mikuproject://report/all`
- `mikuproject://summary/{operationId}`
- `mikuproject://diagnostics/{operationId}`

Use these URIs only when the MCP server writes to the server-managed path backing
that URI. If a tool receives a custom `outputPath`, treat the result as a file
path artifact rather than pretending it has a fixed `mikuproject://` URI.

Important artifact roles shared with `mikuproject-mcp` include:

- `ai_spec`
- `draft_document`
- `patch_document`
- `projection`
- `workbook_state`
- `mikuproject_workbook_json`
- `ms_project_xml`
- `xlsx_workbook`
- `report_output`
- `operation_summary`
- `diagnostics_log`

## HTTP MCP Content-Mode Results

When using Streamable HTTP, prefer inline inputs and content-return modes instead
of host file paths.

Use inline input fields such as:

- `draftContent`
- `workbookContent`
- `stateContent`
- `patchContent`
- `content`
- `inputBase64`

For text outputs, set `outputMode: "content"`.
For binary outputs, set `outputMode: "base64"`.

In content mode, the generated output is not returned as a top-level `text`
field on the parsed operation payload. The MCP tool result itself is still a
text MCP message whose text is JSON, but after parsing that JSON, generated
artifacts are found under `artifacts[]`.

Read primary outputs by artifact role:

| Operation | Primary artifact role | Field |
| --- | --- | --- |
| `draft` / `mikuproject_state_from_draft` | `workbook_state` | `artifacts[].text` |
| `workbook-export` / `mikuproject_export_workbook_json` | `mikuproject_workbook_json` | `artifacts[].text` |
| AI projection exports | `projection` | `artifacts[].text` |
| text report exports such as WBS Markdown / Mermaid / SVG | `report_output` | `artifacts[].text` |
| binary report exports such as WBS XLSX / ZIP bundles | `report_output` | `artifacts[].base64` |

`stdout` may also contain the generated text output and can be used as a
compatibility fallback. Do not expect `payload.text` after parsing the operation
JSON. Operation summaries and diagnostics may also be appended to `artifacts[]`
with roles `operation_summary` and `diagnostics_log`; select the primary
artifact by role rather than by array position.

## Java / Node.js CLI Correspondence

The Java and Node.js runtime CLIs now use the same grouped command shape for
the main agent-facing workflows. The examples below intentionally list Java
first, then the closest Node.js command when one exists.

| Operation | Java CLI example | Node.js CLI example | Notes |
| --- | --- | --- | --- |
| Version | `java -jar skills/mikuproject/runtime/mikuproject-<version>.jar --version` | `node skills/mikuproject/runtime/mikuproject-<version>.mjs --version` | Same purpose. |
| AI JSON spec | `java -jar skills/mikuproject/runtime/mikuproject-<version>.jar ai spec` | `node skills/mikuproject/runtime/mikuproject-<version>.mjs ai spec` | Same purpose. |
| Draft import | `java -jar skills/mikuproject/runtime/mikuproject-<version>.jar state from-draft --in draft.editjson --out workbook.json` | `node skills/mikuproject/runtime/mikuproject-<version>.mjs state from-draft --in draft.editjson --out workbook.json` | Same purpose. |
| AI document kind detection | `java -jar skills/mikuproject/runtime/mikuproject-<version>.jar ai detect-kind --in document.json` | `node skills/mikuproject/runtime/mikuproject-<version>.mjs ai detect-kind --in document.json` | Same purpose. |
| Workbook JSON validation | `java -jar skills/mikuproject/runtime/mikuproject-<version>.jar state validate --in workbook.json` | Not available as a direct Node.js command | Java validates workbook JSON directly. |
| Workbook JSON replace import | `java -jar skills/mikuproject/runtime/mikuproject-<version>.jar state import --in workbook.json --out workbook.normalized.json` | Not available as a direct Node.js command | Java normalizes workbook JSON directly. |
| Workbook JSON merge import | `java -jar skills/mikuproject/runtime/mikuproject-<version>.jar state merge --state workbook.json --in workbook.patch.json --out workbook.next.json` | Not available as a direct Node.js command | Java merges workbook JSON directly. |
| Workbook JSON export / normalize | `java -jar skills/mikuproject/runtime/mikuproject-<version>.jar export workbook-json --in workbook.json --out workbook.normalized.json` | `node skills/mikuproject/runtime/mikuproject-<version>.mjs export workbook-json --in workbook.json --out workbook.normalized.json` | Same purpose. |
| Project overview view | `java -jar skills/mikuproject/runtime/mikuproject-<version>.jar ai export project-overview --in workbook.json --out overview.editjson` | `node skills/mikuproject/runtime/mikuproject-<version>.mjs ai export project-overview --in workbook.json --out overview.editjson` | Same purpose. |
| AI projection bundle | `java -jar skills/mikuproject/runtime/mikuproject-<version>.jar ai export bundle --in workbook.json --out bundle.editjson` | `node skills/mikuproject/runtime/mikuproject-<version>.mjs ai export bundle --in workbook.json --out bundle.editjson` | Same purpose. |
| Task edit view | `java -jar skills/mikuproject/runtime/mikuproject-<version>.jar ai export task-edit --in workbook.json --task-uid taskUid --out task.editjson` | `node skills/mikuproject/runtime/mikuproject-<version>.mjs ai export task-edit --in workbook.json --task-uid taskUid --out task.editjson` | Same purpose. |
| Phase detail view | `java -jar skills/mikuproject/runtime/mikuproject-<version>.jar ai export phase-detail --in workbook.json --phase-uid phaseUid --out phase.editjson` | `node skills/mikuproject/runtime/mikuproject-<version>.mjs ai export phase-detail --in workbook.json --phase-uid phaseUid --out phase.editjson` | Same purpose. |
| Patch validation | `java -jar skills/mikuproject/runtime/mikuproject-<version>.jar ai validate-patch --state workbook.json --in patch.editjson` | `node skills/mikuproject/runtime/mikuproject-<version>.mjs ai validate-patch --state workbook.json --in patch.editjson` | Same purpose. |
| Patch apply | `java -jar skills/mikuproject/runtime/mikuproject-<version>.jar state apply-patch --state workbook.json --in patch.editjson --out workbook.next.json` | `node skills/mikuproject/runtime/mikuproject-<version>.mjs state apply-patch --state workbook.json --in patch.editjson --out workbook.next.json` | Same purpose. |
| State summary | `java -jar skills/mikuproject/runtime/mikuproject-<version>.jar state summarize --in workbook.json` | `node skills/mikuproject/runtime/mikuproject-<version>.mjs state summarize --in workbook.json` | Same purpose. |
| State diff | `java -jar skills/mikuproject/runtime/mikuproject-<version>.jar state diff --before workbook.before.json --after workbook.after.json` | `node skills/mikuproject/runtime/mikuproject-<version>.mjs state diff --before workbook.before.json --after workbook.after.json` | Same purpose. |
| XML validation | `java -jar skills/mikuproject/runtime/mikuproject-<version>.jar validate xml --in project.xml` | Not available as a direct Node.js command | Java validates XML directly. |
| XML export | `java -jar skills/mikuproject/runtime/mikuproject-<version>.jar export xml --in workbook.json --out project.xml` | `node skills/mikuproject/runtime/mikuproject-<version>.mjs export xml --in workbook.json --out project.xml` | Same purpose. |
| Structural XLSX export | `java -jar skills/mikuproject/runtime/mikuproject-<version>.jar export xlsx --in workbook.json --out workbook.xlsx` | `node skills/mikuproject/runtime/mikuproject-<version>.mjs export xlsx --in workbook.json --out workbook.xlsx` | Same purpose. |
| Structural XLSX validation | `java -jar skills/mikuproject/runtime/mikuproject-<version>.jar validate xlsx --in workbook.xlsx` | Not available as a direct Node.js command | Java validates workbook XLSX directly. |
| Structural XLSX replace import | `java -jar skills/mikuproject/runtime/mikuproject-<version>.jar import xlsx --in workbook.xlsx --out workbook.json` | Not available as a direct Node.js command | Java imports XLSX directly. |
| Structural XLSX merge import | `java -jar skills/mikuproject/runtime/mikuproject-<version>.jar merge xlsx --state workbook.json --in workbook.xlsx --out workbook.next.json` | Not available as a direct Node.js command | Java merges XLSX edits directly. |
| Report bundle | `java -jar skills/mikuproject/runtime/mikuproject-<version>.jar report all --in workbook.json --out report-bundle.zip` | `node skills/mikuproject/runtime/mikuproject-<version>.mjs report all --in workbook.json --out report-bundle.zip` | Same purpose. |
| Report directory | `java -jar skills/mikuproject/runtime/mikuproject-<version>.jar report dir --in workbook.json --out report.dir` | Not available as a direct Node.js command | Java can write an unpacked report directory. |
| WBS XLSX report | `java -jar skills/mikuproject/runtime/mikuproject-<version>.jar report wbs-xlsx --in workbook.json --out wbs.xlsx` | `node skills/mikuproject/runtime/mikuproject-<version>.mjs report wbs-xlsx --in workbook.json --out wbs.xlsx` | Same purpose. |
| Daily SVG report | `java -jar skills/mikuproject/runtime/mikuproject-<version>.jar report daily-svg --in workbook.json --out daily.svg` | `node skills/mikuproject/runtime/mikuproject-<version>.mjs report daily-svg --in workbook.json --out daily.svg` | Same purpose. |
| Weekly SVG report | `java -jar skills/mikuproject/runtime/mikuproject-<version>.jar report weekly-svg --in workbook.json --out weekly.svg` | `node skills/mikuproject/runtime/mikuproject-<version>.mjs report weekly-svg --in workbook.json --out weekly.svg` | Same purpose. |
| Monthly SVG report | `java -jar skills/mikuproject/runtime/mikuproject-<version>.jar report monthly-calendar-svg --in workbook.json --out monthly-calendar.zip` | `node skills/mikuproject/runtime/mikuproject-<version>.mjs report monthly-calendar-svg --in workbook.json --out monthly-calendar.zip` | Same purpose. |
| WBS Markdown report | `java -jar skills/mikuproject/runtime/mikuproject-<version>.jar report wbs-markdown --in workbook.json --out wbs.md` | `node skills/mikuproject/runtime/mikuproject-<version>.mjs report wbs-markdown --in workbook.json --out wbs.md` | Same purpose. |
| Mermaid report | `java -jar skills/mikuproject/runtime/mikuproject-<version>.jar report mermaid --in workbook.json --out mermaid.mmd` | `node skills/mikuproject/runtime/mikuproject-<version>.mjs report mermaid --in workbook.json --out mermaid.mmd` | Same purpose. |

Use `.xlsx` for visible XLSX files. Do not expose implementation-specific names
such as `xlsxbin` in examples or outputs.
