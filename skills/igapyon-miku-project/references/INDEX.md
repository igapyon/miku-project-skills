# References Index

Use this curated index when you need detailed guidance beyond the core rules in
`SKILL.md`. For the generated inventory of the full skill package, read
[`../index.json`](../index.json) first.

## Workflow

- [workflow/active-workflow-rules.md](workflow/active-workflow-rules.md)
  - follow-up handling
  - intermediate artifact discipline
  - draft vs patch rules
- [workflow/spec-handoff.md](workflow/spec-handoff.md)
  - `spec` return rules
  - minimal prompt examples
- [workflow/draft-import.md](workflow/draft-import.md)
  - `project_draft_view` acceptance and conversion rules
- [workflow/patch-import.md](workflow/patch-import.md)
  - `Patch JSON` acceptance and apply rules
- [workflow/workbook-handoff.md](workflow/workbook-handoff.md)
  - `mikuproject_workbook_json` handoff rules
  - prompt examples
- [workflow/report-routing.md](workflow/report-routing.md)
  - export routing
  - report operation rules
- [workflow/output-location-rules.md](workflow/output-location-rules.md)
  - default output paths
  - file naming
- [workflow/wbs-review.md](workflow/wbs-review.md)
  - existing WBS review workflow
  - review-to-patch flow
- [workflow/schedule-adjustment.md](workflow/schedule-adjustment.md)
  - schedule compression and task split workflow
  - schedule adjustment patch flow

## I/O

- [io/xml-import-export.md](io/xml-import-export.md)
  - `MS Project XML` import/export
- [io/xlsx-import-export.md](io/xlsx-import-export.md)
  - structural workbook `XLSX` import/export
- [io/workbook-import-export.md](io/workbook-import-export.md)
  - file-style workbook JSON import/export

## Runtime

- [runtime/operations-map.md](runtime/operations-map.md)
  - operation list
  - preferred API surface
- [runtime/upstream-map.md](runtime/upstream-map.md)
  - upstream file and API locations
- [runtime/artifact-provenance.md](runtime/artifact-provenance.md)
  - exact upstream Release tags, assets, and SHA-256 checksums
- [runtime/help-compatibility.json](runtime/help-compatibility.json)
  - Java / Node.js `--help` similarity and documented differences

## Examples

- [examples/file-workflow-examples.md](examples/file-workflow-examples.md)
  - short `xml/xlsx/workbook` import/export examples

## Prompts

- [prompts/new-wbs-draft.md](prompts/new-wbs-draft.md)
  - new `project_draft_view` WBS draft prompt
- [prompts/existing-wbs-review.md](prompts/existing-wbs-review.md)
  - existing WBS review prompt for projections
- [prompts/schedule-compression.md](prompts/schedule-compression.md)
  - schedule tightening prompt for existing WBS projections
- [prompts/patch-request.md](prompts/patch-request.md)
  - focused `Patch JSON` request prompt
