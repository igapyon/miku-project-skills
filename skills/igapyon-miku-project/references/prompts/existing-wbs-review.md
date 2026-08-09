# Existing WBS Review Prompt

Use this when the user wants an AI-assisted review of an existing `miku-project` WBS.

Prefer local projections over full workbook handoff when possible:

- `project_overview_view`
- `phase_detail_view`
- `task_edit_view`

## Prompt

```text
次に与える miku-project の projection JSON をレビューしてください。

レビューでは次を確認してください。

- phase / milestone / task の構造が自然か
- task の粒度が粗すぎないか、細かすぎないか
- planned_start / planned_finish の順序に明らかな不整合がないか
- dependency の抜けや過剰な依存がないか
- milestone と通常 task の役割が混ざっていないか
- summary task を直接編集すべきでない箇所がないか

変更が必要な場合は、最後に Patch JSON 形式で提案してください。
変更不要の場合は、空の operations を持つ Patch JSON を返してください。
```

## Expected Next Step

Validate the returned `Patch JSON` before applying it.
