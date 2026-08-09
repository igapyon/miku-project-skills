# Workbook Handoff

Use this reference when the user explicitly wants to see the current workbook JSON,
or when the host runtime cannot keep workbook state internal.

Do not use workbook handoff as the first choice for ordinary existing-WBS revision.
Prefer local projection handoff first:

- `project_overview_view`
- `task_edit_view`
- `phase_detail_view`

## Retrieval Rule

If you already have current state as `mikuproject_workbook_json`, return it directly.

If you need to regenerate current state from runtime input, use:

- `java -jar skills/igapyon-miku-project/runtime/miku-project-<version>.jar export workbook-json --in workbook.json --out workbook.normalized.json`
- `node skills/igapyon-miku-project/runtime/miku-project-<version>.mjs export workbook-json --in workbook.json --out workbook.normalized.json`

## Preferred Behavior

The preferred behavior is agent-internal use.

- keep the current `mikuproject_workbook_json` in internal state
- do not show raw workbook JSON unless the user explicitly asks for it

## Fallback Return Shape

Return three parts in this order:

1. One short line:
   `現在の WBS 状態を mikuproject_workbook_json として示します。`
2. The full `mikuproject_workbook_json`
3. One short prompt for the next AI turn when useful

## Minimal Prompt Examples

### For general iterative editing

`次に与える mikuproject_workbook_json を受け取り、変更提案を Patch JSON 形式で返してください。`

### For schedule tightening

`次に与える mikuproject_workbook_json を受け取り、日程の見直し案を Patch JSON 形式で返してください。`

### For md-first AI-driven planning

`次に与える mikuproject_workbook_json を受け取り、md準備を先行させる前提で変更提案を Patch JSON 形式で返してください。`

## Short Conversation Example

User intent:

- current WBS を別の AI に渡して改善提案をもらいたい

Skill output shape:

1. `現在の WBS 状態を mikuproject_workbook_json として示します。`
2. workbook JSON
3. `次に与える mikuproject_workbook_json を受け取り、変更提案を Patch JSON 形式で返してください。`

## Preferred Existing-Revision Alternative

When the host runtime can continue internally, prefer this sequence instead:

1. export `project_overview_view`
2. export `task_edit_view` or `phase_detail_view`
3. ask the next AI turn for `Patch JSON`
4. validate the patch
5. apply the patch
