# mikuproject-mcp Tool Surface Coordination Note

この文書は upstream `mikuproject-mcp` チームへの連絡メモです。
`miku-project-skills` 側では `workplace/mikuproject-mcp-0.8.2` を検証用に変更してもよいですが、正式な反映は upstream `mikuproject-mcp` 側で行う必要があります。

Status: coordination note.

## 背景

VS Code Copilot Agent mode で次の手動テストを行う想定です。

```text
miku-project MCP server の tool list を確認して。使える miku-project* tool 名を列挙して。
```

`miku-project-skills` の手動テスト文書では、MCP server を次の tarball から起動する前提にしています。

```text
workplace/igapyon-mikuproject-mcp-node-0.8.2.tgz
```

`.vscode/mcp.json` の起動設定も同じ tarball を参照しています。

## 確認済みの期待 tool surface

`workplace/igapyon-mikuproject-mcp-node-0.8.2.tgz` および展開済みソース `workplace/mikuproject-mcp-0.8.2` では、少なくとも次の tool が公開される想定です。

- `mikuproject_version`
- `mikuproject_ai_spec`
- `mikuproject_ai_detect_kind`
- `mikuproject_ai_export_project_overview`
- `mikuproject_ai_export_bundle`
- `mikuproject_ai_export_task_edit`
- `mikuproject_ai_export_phase_detail`
- `mikuproject_ai_validate_patch`
- `mikuproject_state_from_draft`
- `mikuproject_state_apply_patch`
- `mikuproject_state_diff`
- `mikuproject_state_summarize`
- `mikuproject_export_workbook_json`
- `mikuproject_export_xml`
- `mikuproject_export_xlsx`
- `mikuproject_import_xlsx`
- `mikuproject_report_wbs_xlsx`
- `mikuproject_report_daily_svg`
- `mikuproject_report_weekly_svg`
- `mikuproject_report_monthly_calendar_svg`
- `mikuproject_report_all`
- `mikuproject_report_wbs_markdown`
- `mikuproject_report_mermaid`

手動テストで特に重要な Phase C report tools は次です。

- `mikuproject_report_wbs_xlsx`
- `mikuproject_report_daily_svg`
- `mikuproject_report_weekly_svg`
- `mikuproject_report_monthly_calendar_svg`
- `mikuproject_report_all`

## 現象

ある実行環境では、tool list に Phase C report tools が表示されず、次のような古い tool surface だけが見えることがあります。

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

この場合は `0.8.2` tarball ではなく古い MCP server package が起動している、または MCP client 側の server reload が未完了で古い tool schema を保持している可能性があります。

### Codex 側で確認した事象

2026-04-29 の確認では、VS Code を再起動し、Codex セッションの切断と再ログインを行っても、Codex セッション上の tool list には Phase C report tools が表示されない事象がありました。

原因は VS Code の `.vscode/mcp.json` ではなく、Codex のユーザー設定 `~/.codex/config.toml` に古い `mcp_servers.miku-project` 登録が残っていたことでした。
該当設定は `@igapyon/mikuproject-mcp-node` の `v0.1.0` release tarball を参照しており、Codex は workspace の `.vscode/mcp.json` ではなくこの Codex 側の MCP server 設定から古い server package を起動していました。

この場合、VS Code 側の MCP server stop / restart や VS Code reload だけでは改善しません。
Codex で同じ古い tool surface が見える場合は、次を確認してください。

- `~/.codex/config.toml` に `[mcp_servers.miku-project]` が残っていないか
- 残っている場合、その `args` が古い release tarball を参照していないか
- Codex 側で workspace-local MCP 設定へ委ねる運用にする場合は、不要な `[mcp_servers.miku-project]` と `[mcp_servers.miku-project.env]` を削除すること

この確認時は、古い `mcp_servers.miku-project` block を `~/.codex/config.toml` から削除しました。
削除前のバックアップは `~/.codex/config.toml.bak-20260429-remove-mikuproject-mcp` として保存しました。

## 根拠

展開済みソースでは、Phase C tools は次に登録されています。

- `workplace/mikuproject-mcp-0.8.2/packages/node/src/tools/registerTools.ts`
- `workplace/mikuproject-mcp-0.8.2/packages/node/src/contract/toolSchemas.ts`
- `workplace/mikuproject-mcp-0.8.2/packages/node/src/test/serverSmoke.test.ts`
- `workplace/mikuproject-mcp-0.8.2/packages/node/scripts/verify-package-surface.mjs`

tarball 内でも同じ tool schema と登録済み JavaScript が含まれていることを確認済みです。

## upstream への依頼候補

`mikuproject-mcp` 側で正式対応が必要になった場合は、次を確認してください。

- release artifact `@igapyon/mikuproject-mcp-node` version `0.8.2` が Phase C tools を含むこと
- package surface verification が `mikuproject_report_wbs_xlsx` などの Phase C tools を必須チェックしていること
- README / contract / tests の tool list が `0.8.2` の公開 surface と一致していること
- MCP client が古い package を起動している場合に判別できるよう、`mikuproject_version` の利用を案内すること

## miku-project-skills 側の運用メモ

`workplace/mikuproject-mcp-0.8.2` に検証用変更を入れた場合でも、それは `miku-project-skills` repository 内の作業コピーです。
正式な修正として扱うには、同じ変更を upstream `mikuproject-mcp` repository に伝達し、upstream release artifact として再作成する必要があります。
