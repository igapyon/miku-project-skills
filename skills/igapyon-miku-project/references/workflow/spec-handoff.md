# Spec Handoff

Use this reference when the user explicitly wants to see the `miku-project-ai-json-spec`,
or when the host runtime cannot keep the spec internal.

## Retrieval Rule

Prefer upstream runtime retrieval:

- `java -jar skills/igapyon-miku-project/runtime/miku-project-<version>.jar ai spec`
- `node skills/igapyon-miku-project/runtime/miku-project-<version>.mjs ai spec`

Use bundled markdown or source-tree files directly only if the runtime artifacts are unavailable.

## Preferred Behavior

The preferred behavior is agent-internal use.

- retrieve the spec
- keep it in internal state
- do not show the full text unless the user explicitly asks to see it

## Fallback Return Shape

Return three parts in this order:

1. One short line:
   `Below is the current miku-project-ai-json-spec.`
2. The full spec text
3. One short handoff line for the next AI turn

Keep the handoff line short.
Do not add extra interpretation unless the user asks for it.

## Minimal Prompt Examples

### For new WBS drafting

Use this after the spec text:

`次に与える要件をもとに、project_draft_view 形式で具体的なWBSを出力してください。`

### For workbook-based iterative editing

Use this after handing off `mikuproject_workbook_json`:

`次に与える mikuproject_workbook_json を受け取り、変更提案を Patch JSON 形式で返してください。`

Use this only when workbook handoff is actually needed.
For ordinary existing-WBS revision, prefer local projection handoff first.

### For projection-based iterative editing

Use this after handing off `project_overview_view`, `task_edit_view`, or `phase_detail_view`:

`次に与える局所 projection JSON を受け取り、変更提案を Patch JSON 形式で返してください。`

### For patch-only correction

Use this after the user explains the desired change:

`変更提案は Patch JSON 形式で示してください。`
