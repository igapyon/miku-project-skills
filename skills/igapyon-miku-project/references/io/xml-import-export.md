# XML Import/Export

Use this reference when the user wants to move between `MS Project XML` and the current `miku-project` state.

## Runtime Commands

Prefer the bundled runtime CLI commands:

- `java -jar skills/igapyon-miku-project/runtime/miku-project-<version>.jar validate xml --in project.xml`
- `java -jar skills/igapyon-miku-project/runtime/miku-project-<version>.jar export xml --in workbook.json --out project.xml`
- `node skills/igapyon-miku-project/runtime/miku-project-<version>.mjs export xml --in workbook.json --out project.xml`

## `xml-import`

Purpose:

- read `MS Project XML`
- normalize it into the skill state
- return `mikuproject_workbook_json`

Processing order:

1. accept XML text
2. import it with the runtime CLI
3. validate the resulting `ProjectModel` when useful
4. export it with `workbookJson.exportDocument`
5. return the resulting `mikuproject_workbook_json`

Response shape:

- one short line saying the XML was accepted or rejected
- warnings, if any
- the resulting `mikuproject_workbook_json`

Notes:

- treat this as a replace import
- do not pretend XML merge import exists in the current design

## `xml-export`

Purpose:

- take the current state
- return `MS Project XML`

Processing order:

1. require the current state
2. rebuild `ProjectModel` from `mikuproject_workbook_json` if needed
3. export XML with the runtime CLI
4. return the XML text

Response shape:

- one short line saying this is the current XML export
- the generated XML text

## Errors

Hard errors:

- XML text cannot be parsed
- current state is missing for export

Soft errors:

- model validation returns warnings
