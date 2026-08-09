# File Workflow Examples

Use these short examples when the user needs concrete prompts for the primary file workflow.

## `xml-import`

Input example:

- "Import this `MS Project XML` and return the current state as `mikuproject_workbook_json`."

Output shape:

- one short line saying the XML import succeeded
- warnings, if any
- the resulting `mikuproject_workbook_json`

## `xml-export`

Input example:

- "Export the current state as `MS Project XML`."

Output shape:

- one short line saying this is the current XML export
- the generated XML text

## `xlsx-import`

Input example:

- "Import this structural workbook `.xlsx` and return the current state as `mikuproject_workbook_json`."

Output shape:

- one short line saying the workbook `XLSX` import succeeded
- warnings, if any
- the resulting `mikuproject_workbook_json`

## `xlsx-export`

Input example:

- "Export the current state as structural workbook `.xlsx`."

Output shape:

- one short line saying this is the current workbook `XLSX`
- workbook sheet summary, when useful
- the generated `.xlsx` bytes or file artifact

## `workbook-import`

Input example:

- "Import this `mikuproject_workbook_json` as the new current state."

Output shape:

- one short line saying the workbook JSON import succeeded
- warnings, if any
- the resulting `mikuproject_workbook_json`
