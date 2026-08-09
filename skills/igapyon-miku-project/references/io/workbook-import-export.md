# Workbook JSON Import/Export

Use this reference when the user wants file-style import/export around `mikuproject_workbook_json`.

This is different from the conversational handoff use case because the focus here is primary file workflow.

## Runtime Commands

Prefer the bundled runtime CLI commands:

- `java -jar skills/igapyon-miku-project/runtime/miku-project-<version>.jar state validate --in workbook.json`
- `java -jar skills/igapyon-miku-project/runtime/miku-project-<version>.jar state import --in workbook.json --out workbook.normalized.json`
- `java -jar skills/igapyon-miku-project/runtime/miku-project-<version>.jar state merge --state workbook.json --in workbook.patch.json --out workbook.next.json`
- `java -jar skills/igapyon-miku-project/runtime/miku-project-<version>.jar export workbook-json --in workbook.json --out workbook.normalized.json`
- `node skills/igapyon-miku-project/runtime/miku-project-<version>.mjs export workbook-json --in workbook.json --out workbook.normalized.json`

## `workbook-import`

Purpose:

- replace the current state from a workbook JSON document

Processing order:

1. accept workbook JSON
2. validate it when useful
3. import it with the runtime CLI
4. export or keep the normalized workbook JSON
5. return the normalized `mikuproject_workbook_json`

Response shape:

- one short line saying the workbook JSON was accepted or rejected
- warnings, if any
- the resulting `mikuproject_workbook_json`

## `workbook-merge-import`

Purpose:

- apply workbook JSON changes onto an existing state

Processing order:

1. require the current workbook state
2. rebuild `baseModel` from the current state
3. call the runtime merge command
4. export or keep the updated workbook JSON
5. return the updated `mikuproject_workbook_json`

Response shape:

- one short line saying the workbook JSON merge was applied or rejected
- warnings, if any
- short change summary
- the updated `mikuproject_workbook_json`

## `workbook-export`

Purpose:

- return the current state as `mikuproject_workbook_json`

Processing order:

1. require the current state
2. normalize it with the runtime CLI when needed
4. return the resulting `mikuproject_workbook_json`

Response shape:

- one short line saying this is the current workbook JSON export
- the resulting `mikuproject_workbook_json`
