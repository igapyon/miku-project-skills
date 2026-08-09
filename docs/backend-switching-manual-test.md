# Backend Switching Manual Test

この文書は、VS Code で `miku-project-skills` の MCP backend を手動確認するための手順です。

この手順の主経路では MCP server を `workplace/igapyon-mikuproject-mcp-node-0.8.2.tgz`
から stdio で起動します。HTTP transport を確認する場合は、local checkout 版の
HTTP entrypoint を別プロセスで起動する手順も使えます。

## 1. 前提確認

この repository root を VS Code で開いていることを確認します。
以降の VS Code 設定例では、この repository root を `${workspaceFolder}` として参照します。

```text
miku-project-skills
```

tarball があることを確認します。

```bash
ls -lh workplace/igapyon-mikuproject-mcp-node-0.8.2.tgz
```

VS Code 側の前提:

- GitHub Copilot Chat が使える
- Copilot Chat で Agent mode を使える
- MCP server 設定を workspace の `.vscode/mcp.json` から読める

## 2. VS Code MCP 設定を作る

repository root に `.vscode/mcp.json` を作ります。

```text
.vscode/mcp.json
```

内容:

```json
{
  "servers": {
    "miku-project": {
      "type": "stdio",
      "command": "npm",
      "args": [
        "exec",
        "--yes",
        "--package=${workspaceFolder}/workplace/igapyon-mikuproject-mcp-node-0.8.2.tgz",
        "--",
        "mikuproject-mcp"
      ],
      "env": {
        "MIKUPROJECT_MCP_WORKSPACE": "${workspaceFolder}/workplace/mikuproject-mcp-vscode"
      }
    }
  }
}
```

この設定は実質的に `npm exec --yes --package ... -- mikuproject-mcp` を VS Code から stdio server として起動します。

この設定では、生成物は次の下に出ます。

```text
workplace/mikuproject-mcp-vscode
```

HTTP transport を確認する場合は、MCP server を別プロセスで起動します。

```bash
MIKUPROJECT_MCP_HTTP_HOST=127.0.0.1 \
MIKUPROJECT_MCP_HTTP_PORT=3000 \
MIKUPROJECT_MCP_HTTP_ENDPOINT=/mcp \
node /path/to/mikuproject-mcp/packages/node/dist/http.js
```

その場合の `.vscode/mcp.json` は次の形にします。

```json
{
  "servers": {
    "miku-project": {
      "type": "http",
      "url": "http://127.0.0.1:3000/mcp"
    }
  }
}
```

HTTP transport では、MCP client はこの URL へ接続するだけです。server process
の起動、停止、port 変更は別途管理します。

## 3. VS Code を再読み込みする

Command Palette から次を実行します。

```text
Developer: Reload Window
```

## 4. MCP server 一覧を確認する

再読み込み後、Command Palette から MCP server 一覧を開きます。

```text
MCP: List Servers
```

一覧で `miku-project` server が見えることを確認します。

期待:

- server 名が `miku-project`
- 設定元が workspace の `.vscode/mcp.json`
- 起動 command が `npm exec --yes --package ... -- mikuproject-mcp` 相当
- server state が running、または start / restart 可能な状態

見えない場合は、Command Palette で MCP 関連のコマンドを開き、`miku-project` server を start / restart します。

Copilot Chat 側でも、Agent mode の tools 一覧を開き、`miku-project` server または `mikuproject_*` tools が見えることを確認します。

## 5. Tool list を確認する

Copilot Chat を Agent mode にして、次のように依頼します。

```text
miku-project MCP server の tool list を確認して。使える miku-project* tool 名を列挙して。
```

少なくとも次が見えることを確認します。

- `mikuproject_ai_spec`
- `mikuproject_ai_detect_kind`
- `mikuproject_ai_export_phase_detail`
- `mikuproject_ai_export_project_overview`
- `mikuproject_ai_export_task_edit`
- `mikuproject_ai_validate_patch`
- `mikuproject_state_from_draft`
- `mikuproject_state_apply_patch`
- `mikuproject_state_diff`
- `mikuproject_state_summarize`
- `mikuproject_export_workbook_json`
- `mikuproject_export_xlsx`
- `mikuproject_export_xml`
- `mikuproject_import_xlsx`
- `mikuproject_report_wbs_markdown`
- `mikuproject_report_mermaid`
- `mikuproject_report_wbs_xlsx`
- `mikuproject_report_daily_svg`
- `mikuproject_report_weekly_svg`
- `mikuproject_report_monthly_calendar_svg`
- `mikuproject_report_all`

`mikuproject_report_wbs_xlsx` などの Phase C report tools が見えない場合は、0.8.2 tarball ではなく古い MCP server package が起動している可能性があります。

その場合は、MCP server 一覧で `miku-project` server を stop / restart し、VS Code を再読み込みしてから再確認します。

古い package が疑われる場合は、起動中の server が参照している package version も確認します。期待値は `@igapyon/mikuproject-mcp-node` version `0.8.2` です。

## 6. Prompt list を確認する

Copilot Chat を Agent mode にして、次のように依頼します。

```text
miku-project MCP server の prompt list を確認して。使える miku-project* prompt 名を列挙して。
```

少なくとも次が見えることを確認します。

- `mikuproject_create_project_draft`
- `mikuproject_revise_state_with_patch`
- `mikuproject_review_artifact_diagnostics`

`miku-project.create_project_draft` のようなドット区切り prompt 名が見える場合は、0.8.2 tarball ではなく古い MCP server package が起動している可能性があります。

## 7. AI spec を読む

Copilot Chat で次を依頼します。

```text
mikuproject_ai_spec を呼び出して、結果の ok / operation / diagnostics を短く確認して。
```

期待:

- `operation` が `mikuproject_ai_spec`
- hard error ではない
- `mikuproject://spec/ai-json` または AI spec 本文を参照できる

## 8. Draft から workbook state を作る

まず、Copilot Chat で `miku-project` skill を使い、テスト用 `project_draft_view` を作ります。

```text
miku-project skill を使って、次の要件から project_draft_view 形式の WBS 草案を作って。

要件:
- project name: VS Code MCP Manual Test
- planned_start: 2026-05-01
- phases:
  - Planning: 1 day
  - Implementation: 2 days
  - Review: 1 day

出力では次を守って。
- 新規作成なので Patch JSON ではなく project_draft_view を返して
- 依存関係は各 task の predecessor_uids または predecessors[].task_uid に書いて
- top-level dependencies は使わないで
- task uid は draft-1, draft-2 のような仮 UID でよい
- 最後に JSON だけを 1 個返して
```

返ってきた JSON を次のファイルに保存します。

```text
workplace/mikuproject-mcp-vscode/input/sample-draft.json
```

Copilot Chat で次を依頼します。

```text
mikuproject_state_from_draft を使って、${workspaceFolder}/workplace/mikuproject-mcp-vscode/input/sample-draft.json から workbook state を作って。
outputPath は ${workspaceFolder}/workplace/mikuproject-mcp-vscode/state/manual-workbook.json にして。
結果の ok / operation / artifacts を確認して。
```

期待:

- `operation` が `mikuproject_state_from_draft`
- `workplace/mikuproject-mcp-vscode/state/manual-workbook.json` が生成される
- artifact role が workbook state として扱われる

HTTP transport / content-mode で確認する場合は、host path 引数を渡さず、
`draftContent` と `outputMode: "content"` を使います。

期待:

- HTTP `initialize` が 200 を返す
- HTTP `tools/list` が 200 を返し、`mikuproject_state_from_draft` が含まれる
- `mikuproject_state_from_draft` の operation payload は `ok: true`
- workbook JSON は top-level `text` ではなく、`artifacts[]` の
  `role === "workbook_state"` の `text` に入る
- `stdout` は互換用 fallback として扱えるが、primary artifact は role で選ぶ

返却 payload の要点:

```json
{
  "ok": true,
  "operation": "mikuproject_state_from_draft",
  "artifacts": [
    {
      "role": "workbook_state",
      "text": "{...mikuproject_workbook_json...}",
      "mimeType": "application/json"
    },
    {
      "role": "operation_summary",
      "text": "{...}",
      "mimeType": "application/json"
    },
    {
      "role": "diagnostics_log",
      "text": "{...}",
      "mimeType": "application/json"
    }
  ],
  "stdout": "{...mikuproject_workbook_json...}"
}
```

`payload.text` は期待しません。

## 9. WBS Markdown report を作る

Copilot Chat で次を依頼します。

```text
mikuproject_report_wbs_markdown を使って、${workspaceFolder}/workplace/mikuproject-mcp-vscode/state/manual-workbook.json から WBS Markdown report を作って。
outputPath は ${workspaceFolder}/workplace/mikuproject-mcp-vscode/report/manual-wbs.md にして。
結果の ok / operation / artifacts を確認して。
```

期待:

- `operation` が `mikuproject_report_wbs_markdown`
- `workplace/mikuproject-mcp-vscode/report/manual-wbs.md` が生成される
- report artifact として扱われる

HTTP transport / content-mode で確認する場合は、`workbookContent` と
`outputMode: "content"` を使います。Markdown 本文は `artifacts[]` の
`role === "report_output"` の `text` に入ります。operation summary や
diagnostics が同じ `artifacts[]` に追加されるため、配列位置ではなく role で
選びます。

## 10. WBS XLSX report を作る

Copilot Chat で次を依頼します。

```text
mikuproject_report_wbs_xlsx を使って、${workspaceFolder}/workplace/mikuproject-mcp-vscode/state/manual-workbook.json から WBS XLSX report を作って。
outputPath は ${workspaceFolder}/workplace/mikuproject-mcp-vscode/report/manual-wbs.xlsx にして。
結果の ok / operation / artifacts を確認して。
```

期待:

- `operation` が `mikuproject_report_wbs_xlsx`
- `workplace/mikuproject-mcp-vscode/report/manual-wbs.xlsx` が生成される
- report artifact として扱われる
- `mikuproject_export_xlsx` は structural workbook `XLSX` export であり、WBS XLSX report とは別物として扱う

## 11. SVG / bundle report tools を確認する

Copilot Chat で次を順に依頼します。

```text
mikuproject_report_daily_svg を使って、${workspaceFolder}/workplace/mikuproject-mcp-vscode/state/manual-workbook.json から daily SVG を作って。
outputPath は ${workspaceFolder}/workplace/mikuproject-mcp-vscode/report/manual-daily.svg にして。
```

```text
mikuproject_report_weekly_svg を使って、${workspaceFolder}/workplace/mikuproject-mcp-vscode/state/manual-workbook.json から weekly SVG を作って。
outputPath は ${workspaceFolder}/workplace/mikuproject-mcp-vscode/report/manual-weekly.svg にして。
```

```text
mikuproject_report_monthly_calendar_svg を使って、${workspaceFolder}/workplace/mikuproject-mcp-vscode/state/manual-workbook.json から monthly calendar SVG archive を作って。
outputPath は ${workspaceFolder}/workplace/mikuproject-mcp-vscode/report/manual-monthly-calendar.zip にして。
```

```text
mikuproject_report_all を使って、${workspaceFolder}/workplace/mikuproject-mcp-vscode/state/manual-workbook.json から report bundle を作って。
outputPath は ${workspaceFolder}/workplace/mikuproject-mcp-vscode/report/manual-report-bundle.zip にして。
```

期待:

- 各 tool が hard error なく完了する
- 指定した `outputPath` に成果物が生成される
- `daily-svg` / `weekly-svg` は SVG、`monthly-calendar-svg` / `report_all` は ZIP として扱われる

## 12. backend policy の確認

この手動確認では、VS Code MCP server が Phase C report tools を公開していることを確認します。

`miku-project-skills` 側の backend policy では、次の report operations は MCP 対応済みとして扱われます。

- `wbs-xlsx-export`
- `daily-svg-export`
- `weekly-svg-export`
- `monthly-calendar-svg-export`
- `all-report-export`
- `wbs-markdown-export`
- `mermaid-export`

`mcp-only` の考え方:

- MCP 対応済み operation は MCP backend で実行できる
- MCP 未対応 operation は CLI に自動 fallback しない
- 0.8.2 tarball を起動しているのに Phase C report tools が出ない場合は、古い MCP server package が起動しているか、MCP client 側の server reload が未完了と判断する

他の policy 名との区別:

- `cli-only` は CLI backend だけを使う policy
- `handoff-only` は CLI / MCP を実行しない policy

MCP backend 未対応として扱う代表例:

- `xml-import`
- `xlsx-merge-import`
- `workbook-import`
- `workbook-merge-import`

## 13. 完了条件

次を確認できたら、この manual test は完了です。

- VS Code から `miku-project` MCP server が見える
- MCP server 一覧で `miku-project` server の設定元と状態を確認できる
- `workplace/igapyon-mikuproject-mcp-node-0.8.2.tgz` から起動している
- `mikuproject_ai_spec` が通る
- `mikuproject_create_project_draft` が prompt list に見える
- `mikuproject_revise_state_with_patch` が prompt list に見える
- `mikuproject_review_artifact_diagnostics` が prompt list に見える
- `mikuproject_state_from_draft` が通る
- `mikuproject_report_wbs_markdown` が通る
- `mikuproject_report_wbs_xlsx` が通る
- `mikuproject_report_daily_svg` が通る
- `mikuproject_report_weekly_svg` が通る
- `mikuproject_report_monthly_calendar_svg` が通る
- `mikuproject_report_all` が通る
- 生成物が `workplace/mikuproject-mcp-vscode/` 以下に出る
