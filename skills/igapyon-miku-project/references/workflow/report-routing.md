# Report Routing

Use this reference when the user asks for export, report, gantt, Markdown, SVG, Mermaid, or bundled deliverables.

## General Rules

- use the matching `miku-project` export operation directly
- prefer `WBS Markdown` for ambiguous human-readable report requests
- do not treat `Mermaid` as the default gantt format
- prefer upstream `report all` for full report-set requests
- do not replace a working export path with ad-hoc helper scripts or one-off converters

## Routing

- `report で出して` -> prefer `wbs-markdown-export`
- `見やすく出して` -> prefer `wbs-markdown-export`
- `共有しやすい形で出して` -> prefer `wbs-markdown-export`
- `markdown化して` -> `wbs-markdown-export`
- `Mermaid 化して` -> `mermaid-export`
- `svg にして` -> choose `daily-svg-export`, `weekly-svg-export`, or `monthly-calendar-svg-export`
- `xlsx にして` -> usually `wbs-xlsx-export`; use `xlsx-export` only for structural workbook requests
- `Excel ガントが欲しい` -> prefer `wbs-xlsx-export`
- `xlsx でガントが欲しい` -> prefer `wbs-xlsx-export`
- `xml にして` -> `xml-export`

When the user asks for an Excel gantt, Excel schedule, or xlsx gantt in normal conversation, treat that as a request for `WBS XLSX` unless the user explicitly asks for the structural workbook.
Inside an active `miku-project` workflow, short format requests like `markdown`, `xlsx`, `svg`, and `mermaid` should usually map to the corresponding `miku-project` report exports.
For bare `xlsx`, prefer `WBS XLSX` when the request is about a visible deliverable, gantt, schedule, report, or "current result".
Use structural workbook `XLSX` only when the user says `workbook`, `structural`, editable/importable workbook, state handoff, or asks for the file workflow export.

## Gantt Resolution

For `ガント` or `ガントチャート`, resolve in this order:

1. if spreadsheet-like words are also present, prefer `wbs-xlsx-export`
2. if image-like words are also present, prefer `SVG`
3. if `Mermaid` is explicitly present, use `mermaid-export`
4. otherwise, prefer `wbs-xlsx-export`

## SVG Time Scale

- `日`, `日次`, `daily` -> `daily-svg-export`
- `週`, `週次`, `weekly` -> `weekly-svg-export`
- `月`, `月間`, `monthly`, `calendar` -> `monthly-calendar-svg-export`

If the user asks for `SVG` without a clear time scale, ask briefly or make the smallest reasonable inference from nearby wording.

## Report Export Rules

- require a current project state before running report exports
- rebuild `ProjectModel` from `mikuproject_workbook_json` when needed
- prefer the bundled runtime CLI report commands
- treat the main artifact as stdout/file output and diagnostics as stderr side output
- `WBS XLSX` is a report export and is not the same as structural workbook `XLSX`
- name `WBS XLSX` artifacts with `wbs` in the filename; name structural workbook `XLSX` artifacts with `workbook`
- `Mermaid` should be returned as gantt text unless the user asks for fenced Markdown
- monthly calendar `SVG` may return multiple entries rather than a single file
