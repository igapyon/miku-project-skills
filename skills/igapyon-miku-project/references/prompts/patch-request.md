# Patch Request Prompt

Use this when the user has described a concrete change to an existing `miku-project` WBS.

Use a focused projection whenever possible instead of handing off the full workbook.

## Prompt

```text
次に与える miku-project の projection JSON と変更要望をもとに、Patch JSON を作成してください。

Patch JSON では次を守ってください。

- task の field 更新は update_task を使ってください。
- 親子関係や順序の変更は move_task を使ってください。
- 依存関係の追加や解除は link_tasks / unlink_tasks を使ってください。
- predecessor 一覧を update_task.fields に丸ごと入れないでください。
- lag を指定する場合は lag または lag_hours のどちらか一方だけを使ってください。
- summary task を直接編集してはいけない rules がある場合は従ってください。
- allowed_edit_fields と allow_patch_ops にない変更は返さないでください。
- 変更不要の場合は operations を空配列にしてください。

最後に JSON だけを 1 個返してください。
```

## Expected Next Step

Run `patch-validate` before `patch` / `state apply-patch`.
