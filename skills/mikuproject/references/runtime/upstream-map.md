---
title: Mikuproject upstream runtime map
description: Skill-local runtime artifacts and their upstream product boundaries.
topics: [mikuproject, runtime, upstream]
category: reference
status: active
audience: [agent, maintainer]
updated: 2026-08-06
sources:
  - type: runtime-artifact
    role: primary
    path: skills/mikuproject/runtime/
    version: 0.8.3.3
    checked: 2026-08-06
---

# Upstream Runtime Map

Use this reference when you need the exact `mikuproject` runtime locations behind the MVP workflow.

## Preferred Runtime Search Order

Check these skill-local runtime artifacts before broad repository exploration:

- `skills/mikuproject/runtime/mikuproject-<version>.jar`
- `skills/mikuproject/runtime/mikuproject-<version>.mjs`

`<version>` is a placeholder for the bundled runtime artifact version.
Use the actual file name in `skills/mikuproject/runtime/`.

When both are present, prefer the Java runtime for operations it supports. Use the Node.js runtime when the Java runtime is missing or does not support the requested operation.

## Stable Runtime Entry Points

Java runtime:

```bash
java -jar skills/mikuproject/runtime/mikuproject-<version>.jar ai spec
java -jar skills/mikuproject/runtime/mikuproject-<version>.jar state from-draft --in draft.editjson --out workbook.json
java -jar skills/mikuproject/runtime/mikuproject-<version>.jar report all --in workbook.json --out report-bundle.zip
```

Node.js runtime:

```bash
node skills/mikuproject/runtime/mikuproject-<version>.mjs ai spec
node skills/mikuproject/runtime/mikuproject-<version>.mjs state from-draft --in draft.editjson --out workbook.json
node skills/mikuproject/runtime/mikuproject-<version>.mjs state apply-patch --state workbook.json --in patch.editjson --out workbook.next.json
node skills/mikuproject/runtime/mikuproject-<version>.mjs report all --in workbook.json --out report-bundle.zip
```

## Main Formats

- `MS Project XML`
  - Java CLI: `validate xml` and `export xml`
  - Node CLI: workbook-state commands such as `export xml`
- workbook `XLSX`
  - Java CLI: `export xlsx`, `import xlsx`, `merge xlsx`
  - Node CLI: `export xlsx`
- `project_draft_view`
  - Java CLI: `state from-draft`
  - Node CLI: `state from-draft`
- `Patch JSON`
  - Java CLI: `ai validate-patch` and `state apply-patch`
  - Node CLI: `ai validate-patch` and `state apply-patch`
- `mikuproject_workbook_json`
  - Java CLI: `export workbook-json`, `state import`, `state merge`, `state summarize`, `state diff`
  - Node CLI: `export workbook-json`, `state summarize`, `state diff`

## Working Assumption

For the MVP, prefer `mikuproject_workbook_json` at the conversation boundary.
Use runtime CLI commands rather than reading upstream source files directly.
