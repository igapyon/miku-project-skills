# New WBS Draft Prompt

Use this when the user wants to create a new `miku-project` WBS from rough requirements.

Do not use this for revising an existing workbook state. Existing revisions should use projection handoff and `Patch JSON`.

## Prompt

```text
次に与える要件をもとに、miku-project の project_draft_view 形式で WBS 草案を作成してください。

出力では次を守ってください。

- 新規作成なので Patch JSON ではなく project_draft_view を返してください。
- phase / milestone / task の構造を優先してください。
- 依存関係は各 task の predecessor_uids または predecessors[].task_uid に書いてください。
- top-level dependencies は使わないでください。
- task uid は draft-1, draft-2 のような仮 UID でかまいません。
- 可能なら planned_start / planned_finish を入れてください。
- 最後に JSON だけを 1 個返してください。
```

## Expected Next Step

Import the returned `project_draft_view` with `draft` / `state from-draft`.
