# Schedule Adjustment Workflow

Use this reference when the user asks to tighten, compress, split, or otherwise
adjust the schedule of an existing `miku-project` WBS.

This workflow proposes schedule changes. It does not guarantee that a business
deadline is feasible.

## Preferred Inputs

Use a projection that exposes enough scheduling context.

Preferred order:

1. `phase_detail_view` for phase-level schedule and dependency review
2. `task_edit_view` for focused adjustment of one task
3. `project_overview_view` for deciding which phase needs deeper review

Use full `mikuproject_workbook_json` only when projection handoff is unavailable
or explicitly requested.

## Adjustment Checklist

Look for:

- tasks that can run in parallel without breaking dependencies
- tasks that are too broad and should be split before date adjustment
- milestone dates that constrain the schedule
- dependencies that may be missing, excessive, or pointing in the wrong direction
- planned_start / planned_finish / planned_duration inconsistencies
- task ranges that can be shortened only with an explicit assumption
- schedule risk that should be reported instead of silently patched

Do not move dates earlier only because the user wants compression. Preserve
dependency meaning unless the user explicitly asks to change it.

## Patch Candidates

Use these Patch JSON operations when a change is justified:

- `update_task` for planned_start / planned_finish / planned_duration changes
- `add_task` when a broad task should be split into explicit child work
- `move_task` when the split task needs a different parent or order
- `link_tasks` / `unlink_tasks` when dependency changes are part of the schedule adjustment

When generating lag, emit either `lag` or `lag_hours`, not both.

Avoid direct summary task edits. Prefer changes to leaf tasks or explicit task
structure changes.

## Output Shape

Return a short schedule adjustment summary first.

Use these sections when useful:

- `Compression Opportunities`: safe or likely candidates
- `Split Candidates`: tasks that should be decomposed before schedule changes
- `Dependency Changes`: proposed link / unlink changes
- `Patch Candidate`: whether a `Patch JSON` proposal is appropriate
- `Warnings`: assumptions, missing data, or limits

If the safe change is clear, produce `Patch JSON` and validate it before applying.
If the change depends on a business decision, ask for that decision instead of
inventing dates or dependencies.

## Patch Flow

For schedule adjustment:

1. export `phase_detail_view` or `task_edit_view`
2. use the schedule prompt when needed: `references/prompts/schedule-compression.md`
3. receive or create `Patch JSON`
4. run `patch-validate`
5. apply the patch only if validation succeeds
6. run `state-diff`
7. optionally export `WBS Markdown`, `WBS XLSX`, or SVG for human review

## Boundaries

- do not guarantee that a requested deadline is feasible
- do not ignore dependencies to make the schedule shorter
- do not change milestone meaning without explicit user intent
- do not edit summary tasks directly when leaf-task changes are possible
- do not use report exports as editable source
- do not create a large rewrite when a local patch is enough
