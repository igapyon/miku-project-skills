# WBS Review Workflow

Use this reference when the user asks to review an existing `miku-project` WBS.

This workflow reviews the WBS structure and scheduling surface that `miku-project`
can expose. It does not certify business validity and does not replace browser
visual review.

## Preferred Inputs

Use the smallest projection that gives enough context.

Preferred order:

1. `project_overview_view` for project-level structure and entry review
2. `phase_detail_view` for phase-level structure, dependencies, and schedule review
3. `task_edit_view` for focused task-level review

Use full `mikuproject_workbook_json` only when projection handoff is unavailable
or the user explicitly asks for full workbook inspection.

## Review Checklist

Check for:

- unclear phase / milestone / task hierarchy
- task granularity that is too broad or too small for WBS review
- milestones that look like normal work tasks
- summary tasks that appear to be edited directly
- missing or excessive dependencies
- dependency direction that looks suspicious from task names and dates
- planned start / finish order problems
- tasks whose planned date range is inconsistent with their role
- obvious review warnings from the upstream runtime

Do not infer missing business requirements that are not present in the user's
request or the projection.

## Output Shape

Return a concise review summary first.

Use these sections when useful:

- `Findings`: concrete issues or risks found in the projection
- `No Change Needed`: areas that look structurally acceptable
- `Patch Candidate`: whether a `Patch JSON` proposal is appropriate
- `Warnings`: upstream warnings or review limits

If the user asked for changes, or if the review naturally leads to a small
structural fix, request or generate `Patch JSON` and validate it before applying.

If no safe change is clear, do not invent a patch. Report the review result and
ask for the missing decision only when needed.

## Patch Flow

For a review that leads to edits:

1. export the relevant projection
2. use the review prompt when needed: `references/prompts/existing-wbs-review.md`
3. receive or create `Patch JSON`
4. run `patch-validate`
5. apply the patch only if validation succeeds
6. run `state-diff` when change review matters

## Boundaries

- do not claim that the WBS is business-complete
- do not replace visual inspection in the `miku-project` browser UI
- do not rewrite the whole WBS when a local patch is enough
- do not return ad-hoc Markdown tables as the reviewed WBS state
- do not treat report exports as editable source
