# Output Location Rules

Use this reference when the skill writes user-facing artifacts.

## Default Directories

Unless the user explicitly requests another location, write generated files under the workspace-local `miku-project/` tree.

- state-like artifacts -> `miku-project/state/`
- final report exports -> `miku-project/report/`
- temporary intermediate files -> `miku-project/tmp/`

Standard mapping:

- `project_draft_view` -> `miku-project/state/`
- `Patch JSON` -> `miku-project/state/`
- `mikuproject_workbook_json` -> `miku-project/state/`
- structural workbook `XLSX` -> `miku-project/state/`
- `WBS Markdown`, `Mermaid`, `WBS XLSX`, `daily SVG`, `weekly SVG`, monthly calendar ZIP -> `miku-project/report/`
- ad-hoc scratch files -> `miku-project/tmp/`

## Naming

- use `YYYYMMDDHHmm-<kind>.<ext>` by default
- reuse the same timestamp prefix when one request produces multiple related artifacts
- use `YYYYMMDDHHmm-workbook.xlsx` for structural workbook `XLSX`
- use `YYYYMMDDHHmm-wbs.xlsx` for report `WBS XLSX`
- create target directories first when needed

## Required Defaults

- pass an explicit `--out` path when the CLI supports it
- prefer one upstream-generated archive such as `YYYYMMDDHHmm-report-bundle.zip` for all-report requests

## Forbidden Defaults

- workspace root outputs such as `./foo.svg` or `./bar.xlsx`
- user-facing artifacts under `skills/igapyon-miku-project/runtime/...`
- scattered root outputs with incremented suffixes
