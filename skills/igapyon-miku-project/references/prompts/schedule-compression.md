# Schedule Compression Prompt

Use this when the user wants schedule tightening or duration review for an existing `miku-project` WBS.

This prompt is for proposing changes. It does not apply changes directly.

## Prompt

```text
次に与える miku-project の projection JSON をもとに、スケジュール圧縮案を検討してください。

検討では次を守ってください。

- 依存関係を無視して日付だけを前倒ししないでください。
- milestone の意味を壊さないでください。
- summary task を直接編集する提案は避けてください。
- task の planned_start / planned_finish / planned_duration を中心に見直してください。
- 依存関係を変える必要がある場合は link_tasks / unlink_tasks を使ってください。
- lag を提案する場合は lag または lag_hours のどちらか一方だけを使ってください。
- 根拠が弱い変更は提案しないでください。

最後に Patch JSON 形式で変更案を返してください。
変更不要の場合は、空の operations を持つ Patch JSON を返してください。
```

## Expected Next Step

Validate the returned `Patch JSON`, apply it only after validation, and review the diff.
