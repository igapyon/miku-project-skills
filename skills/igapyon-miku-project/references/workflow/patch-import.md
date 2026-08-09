# Patch Import

Use this reference when the user provides AI output that should be treated as `Patch JSON`.

## Base State Requirement

`Patch JSON` cannot be applied by itself.
Require an existing `mikuproject_workbook_json` as the base state.

Show the Java runtime path first:

- `java -jar skills/igapyon-miku-project/runtime/miku-project-<version>.jar ai validate-patch --state workbook.json --in patch.editjson`
- `java -jar skills/igapyon-miku-project/runtime/miku-project-<version>.jar state apply-patch --state workbook.json --in patch.editjson --out workbook.next.json`

Node.js runtime example:

- `node skills/igapyon-miku-project/runtime/miku-project-<version>.mjs state apply-patch --state workbook.json --in patch.editjson --out workbook.next.json`

## Acceptance Rule

Accept either:

- raw JSON text
- a full LLM response that ends with a `json` fenced block

For validation through the Node.js runtime:

- `node skills/igapyon-miku-project/runtime/miku-project-<version>.mjs ai validate-patch --state workbook.json --in patch.editjson`

## Required Kind

The detected document kind must be `patch_json`.

If the detected kind is:

- `project_draft_view`: reject it and treat it as a draft flow
- `workbook_json`: reject it and treat it as a workbook flow
- `undefined`: return a hard error

If the base workbook state is missing, return a hard error.

## Processing Flow

1. Require current workbook state
2. Keep the current workbook state as `workbook.json`
3. Parse source text and detect kind
4. Validate the patch with the runtime CLI when useful
5. Apply the patch through the runtime CLI
6. Keep the updated workbook JSON in internal state when possible
7. Only return raw workbook JSON when the user explicitly wants the raw state, or when the host runtime requires fallback display

## Dependency Operations

Use `link_tasks` and `unlink_tasks` for dependency changes.
Do not put `predecessors` in `update_task.fields`.

For `link_tasks` / `unlink_tasks` lag, emit only one of:

- `lag`
- `lag_hours`

Prefer `lag` when generating new Patch JSON to match upstream examples and avoid conversion ambiguity.
If both `lag` and `lag_hours` are present, upstream applies `lag` and returns a warning that `lag_hours` was ignored.

## Minimum Validation Expectation

Rely on upstream validation for structural checks and operation handling.
At the skill level, ensure only these minimum conditions:

- the payload parses as JSON after fenced-block extraction
- the detected kind is `patch_json`
- a base workbook state exists
- patch application succeeds without a hard error

## Default Return Shape

Return in this order:

1. One short line:
   `Patch JSON を反映しました。`
2. Warnings if any exist
3. A short change summary
4. The updated `mikuproject_workbook_json`, only when raw state display is needed

If the patch produces no changes, say that no changes were applied.
Do not fabricate a changed workbook state when application fails.
