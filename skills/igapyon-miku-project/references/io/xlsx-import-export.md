# XLSX Import/Export

Use this reference when the user wants to move between workbook `XLSX` and the current `miku-project` state.

This reference is for the structural workbook `XLSX`, not `WBS XLSX`.

## Runtime Commands

Prefer the bundled runtime CLI commands:

- `java -jar skills/igapyon-miku-project/runtime/miku-project-<version>.jar export xlsx --in workbook.json --out workbook.xlsx`
- `java -jar skills/igapyon-miku-project/runtime/miku-project-<version>.jar import xlsx --in workbook.xlsx --out workbook.json`
- `java -jar skills/igapyon-miku-project/runtime/miku-project-<version>.jar merge xlsx --state workbook.json --in workbook.xlsx --out workbook.next.json`
- `node skills/igapyon-miku-project/runtime/miku-project-<version>.mjs export xlsx --in workbook.json --out workbook.xlsx`

## `xlsx-import`

Purpose:

- read workbook `XLSX`
- normalize it into the skill state
- return `mikuproject_workbook_json`

Processing order:

1. accept `.xlsx` bytes
2. for replace import, use the Java runtime `import xlsx` command
3. validate the resulting `ProjectModel` when useful
4. export it with `workbookJson.exportDocument`
5. return the resulting `mikuproject_workbook_json`

Response shape:

- one short line saying the workbook `XLSX` was accepted or rejected
- warnings, if any
- the resulting `mikuproject_workbook_json`

## `xlsx-merge-import`

Purpose:

- apply workbook `XLSX` edits onto an existing state

Processing order:

1. require the current workbook state
2. rebuild `baseModel` from the current state
3. call the Java runtime `merge xlsx` command
4. export the resulting model with `workbookJson.exportDocument`
5. return the updated `mikuproject_workbook_json`

Response shape:

- one short line saying the workbook `XLSX` merge was applied or rejected
- warnings, if any
- short change summary
- the updated `mikuproject_workbook_json`

## `xlsx-export`

Purpose:

- take the current state
- return structural workbook `XLSX`

Processing order:

1. require the current state
2. rebuild `ProjectModel` from `mikuproject_workbook_json` if needed
3. run the runtime export command
5. return the bytes as the export result

Response shape:

- one short line saying this is the current workbook `XLSX`
- workbook sheet summary, when useful
- the generated `.xlsx` bytes or file artifact

## Errors

Hard errors:

- `.xlsx` bytes cannot be decoded
- current state is missing for export or merge import

Soft errors:

- unsupported workbook edits are ignored
- partial changes are applied
- validation returns warnings
