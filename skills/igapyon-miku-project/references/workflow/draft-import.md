# Draft Import

Use this reference when the user provides AI output that should be treated as `project_draft_view`.

## Acceptance Rule

Accept either:

- raw JSON text
- a full LLM response that ends with a `json` fenced block

Show the Java runtime path first:

- `java -jar skills/igapyon-miku-project/runtime/miku-project-<version>.jar state from-draft --in draft.editjson --out workbook.json`

Node.js runtime example:

- `node skills/igapyon-miku-project/runtime/miku-project-<version>.mjs state from-draft --in draft.editjson --out workbook.json`

## Required Kind

The detected document kind must be `project_draft_view`.

If the detected kind is:

- `patch_json`: reject it and treat it as a patch flow
- `workbook_json`: reject it and treat it as a workbook flow
- `undefined`: return a hard error

## Processing Flow

1. Parse source text and detect kind
2. Import with the runtime CLI
3. Confirm the result mode is `replace`
4. Keep the resulting workbook JSON in internal state when possible
5. Only return raw workbook JSON when the user explicitly wants the raw state, or when the host runtime requires fallback display

## Dependency Encoding

For a new `project_draft_view`, encode dependencies on each target task.
Use either:

- `predecessor_uids`: an array of predecessor task UIDs
- `predecessors`: an array of objects with `task_uid`

Do not rely on a top-level `dependencies` field.
Upstream `project_draft_view` import does not import top-level `dependencies`.
If a draft already contains only top-level dependencies, convert them into the target tasks' `predecessor_uids` before import, or add them after import with `Patch JSON` `link_tasks`.

Draft import captures task-to-task predecessor links only.
If a dependency needs `type`, `lag`, or `lag_hours`, use a later `Patch JSON` `link_tasks` operation.

## Minimum Validation Expectation

Rely on upstream validation for structural checks.
At the skill level, ensure only these minimum conditions:

- the payload parses as JSON after fenced-block extraction
- the detected kind is `project_draft_view`
- import succeeds without a hard error

## Default Return Shape

Return in this order:

1. One short line:
   `project_draft_view を取り込みました。`
2. Warnings if any exist
3. The resulting `mikuproject_workbook_json`, only when raw state display is needed

If import fails, return a short error explanation and do not fabricate a partial workbook state.
