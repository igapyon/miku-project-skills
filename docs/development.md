# Development Notes

この文書は `miku-project-skills` の開発者向けメモです。

## 文書の場所

- 利用開始手順: [quickstart.md](./quickstart.md)
- 設計メモ: [agent-skill-design.md](./agent-skill-design.md)
- agent 内部連携メモ: [agent-to-agent-runner.md](./agent-to-agent-runner.md)
- skill 配置手順: [skill-installation.md](./skill-installation.md)
- ファイル入出力: [file-import-export.md](./file-import-export.md)
- レポート出力: [report-export.md](./report-export.md)
- MCP backend 利用設定: [mcp-backend-setup.md](./mcp-backend-setup.md)
- backend switching 手動テスト: [backend-switching-manual-test.md](./backend-switching-manual-test.md)
- miku-soft 標準の適用と正本: [miku-soft-reference.md](./miku-soft-reference.md)
- upstream MCP tool surface 連絡メモ: [upstream-mikuproject-mcp-tool-surface-note.md](./upstream-mikuproject-mcp-tool-surface-note.md)
- upstream Java CLI 変更依頼（完了）: [upstream-miku-project-java-cli-request.md](./upstream-miku-project-java-cli-request.md)
- upstream Java `ai export bundle` 追加依頼（完了）: [upstream-miku-project-java-ai-export-bundle-request.md](./upstream-miku-project-java-ai-export-bundle-request.md)
- upstream AI-era CLI help contract 依頼: [upstream-miku-project-ai-era-cli-contract-request.md](./upstream-miku-project-ai-era-cli-contract-request.md)
- miku MCP server 共通設計の旧リンク: [miku-soft-50-mcp-design-v20260501.md](./miku-soft-50-mcp-design-v20260501.md)
- 実装 TODO: [../TODO.md](../TODO.md)

## Skill discovery index

`skills/igapyon-miku-project/index.json` は、skill 内の Markdown と JSON を列挙する生成済みの
discovery index です。Agent は詳細な reference を開く前にこれを読んで対象を絞ります。

`SKILL.md`、references、config などの index 対象ファイルを変更したら、次で再生成します。

```bash
miku-indexgen --input-directory skills/igapyon-miku-project
```

生成された `index.json` は手編集しません。`npm test` と `npm run build:bundle` は、
source と installable bundle の両方にこの index があることを検証します。

## upstream runtime artifact 運用

`miku-project-skills` は、通常の skill 実行時に upstream source tree を直接使わず、
`skills/igapyon-miku-project/runtime/` に置いた runtime artifact を使います。

現在の必須 runtime artifact:

- `skills/igapyon-miku-project/runtime/miku-project-<version>.jar`
- `skills/igapyon-miku-project/runtime/miku-project-sources-<version>.jar`
- `skills/igapyon-miku-project/runtime/miku-project-<version>.mjs`
- `skills/igapyon-miku-project/runtime/miku-project-sources-<version>.tgz`

更新時は upstream 側で artifact を生成して、該当する runtime artifact を差し替えます。
Java runtime 更新時は `miku-project-<version>.jar` と `miku-project-sources-<version>.jar` を差し替えます。
Node.js runtime 更新時は `miku-project-<version>.mjs` と `miku-project-sources-<version>.tgz` を差し替えます。
upstream source tree をこのリポジトリに同期する運用は通常不要です。

このリポジトリで一時的に upstream を取得して artifact を更新する場合は、
repo 直下の `workplace/` を使います。`workplace/` はローカル作業用であり、
通常の内容は Git 管理しません。

## バージョン更新

`miku-project-skills` の package version は `package.json` と
`package-lock.json` で管理します。

Node.js 20 以降を対応対象とします。CI は Node.js 20 / 24 と Java 17 で
`npm run build`（test と配布 ZIP build）を検証します。

更新には `npm version` を使います。
Git tag は別途作成するため、通常は `--no-git-tag-version` を付けます。

例:

```bash
npm version 0.12.2 --no-git-tag-version
```

`package.json` と `package-lock.json` では npm の SemVer として `0.12.2`
のように記録します。Git tag やリリース名として `v0.12.2` を使う場合でも、
package version には先頭の `v` を付けません。

更新後は次で root package version が揃っていることを確認します。

```bash
node -e 'const p=require("./package.json"); const l=require("./package-lock.json"); console.log({package:p.version, lock:l.version, root:l.packages[""].version})'
```

同梱 CLI runtime の version は `miku-project-skills` の package version とは別です。
runtime artifact を差し替えた場合、または release note で runtime version を書く場合は、
次で確認します。

```bash
java -jar skills/igapyon-miku-project/runtime/miku-project-<version>.jar --version
node skills/igapyon-miku-project/runtime/miku-project-<version>.mjs --version
```

## 生成物の配置方針

WBS 関連の生成物は、workspace ルートへ散らさず、`miku-project/` 配下へ寄せる方針を推奨します。

推奨構成:

```text
miku-project/
  state/
  report/
  tmp/
```

使い分け:

- `miku-project/state/`: `mikuproject_workbook_json`、`project_draft_view`、`Patch JSON` などの状態ファイル
- `miku-project/report/`: `WBS XLSX`、`daily/weekly/monthly SVG`、`WBS Markdown`、Mermaid などの成果物
- `miku-project/tmp/`: 一時ファイル

ファイル名は `YYYYMMDDHHmm-` の時系列 prefix を推奨します。
同じ実行で出た複数成果物には、同一 prefix を使う前提で運用します。

例:

- `202604082215-workbook.json`
- `202604082215-wbs.xlsx`
- `202604082215-daily.svg`
- `202604082215-weekly.svg`
- `202604082215-patch.json`

推奨更新手順:

```bash
npm run update:runtime
```

フルビルドや runtime artifact 更新を行う前には、`workplace/upstream/` 以下の
`miku-project` と `miku-project-java` について、最新 clone または pull が必要かを確認します。
未取得または古い可能性がある場合は、先に upstream を更新してから artifact 生成と bundle build を行います。

このコマンドは次を行います。

- `workplace/upstream/miku-project` に `miku-project` を clone または更新する
- `workplace/upstream/miku-project-java` に `miku-project-java` を clone または更新する
- Node.js 側で `bundle/miku-project.mjs` を生成する
- Node.js 側で `bundle/miku-project-sources.tgz` を生成する
- Java 側で `target/miku-project.jar` を生成する
- Java 側で `target/miku-project-sources.jar` を生成する
- 生成物を version 付き名で `skills/igapyon-miku-project/runtime/` にコピーする
- コピー後の `miku-project-<version>.jar` と `miku-project-<version>.mjs` を smoke test する

既定の取得元と ref:

- `miku-project`: `https://github.com/igapyon/miku-project.git` の `devel`
- `miku-project-java`: `https://github.com/igapyon/miku-project-java.git` の `devel`

必要に応じて環境変数で変更できます。

```bash
MIKUPROJECT_REF=main MIKUPROJECT_JAVA_REF=main npm run update:runtime
```

runtime artifact のファイル名 version は、既定では Node.js runtime の
`--version` 出力から決めます。配布番号など別の version 付き名にしたい場合は
`MIKUPROJECT_RUNTIME_VERSION` を指定します。

```bash
MIKUPROJECT_RUNTIME_VERSION=0.8.3.3 npm run update:runtime
```

## 配布と Release

`npm run build` は test と installable ZIP build を行います。ZIP の内容は
`tests/miku-project-bundle-smoke.test.js` で検証し、`.DS_Store`、tests、docs、
開発用 `workplace/` などを含めません。

GitHub Release は人が release を publish するか、`workflow_dispatch` で tag を
指定して起動します。`release-build.yml` は version 付き runtime artifact を検証して
ZIP を添付します。通常の開発作業から公開を起動しません。

## Execution backend policy の保守方針

`miku-project-skills` は Agent Skill workflow layer として保守します。
実行面は backend policy によって CLI backend、MCP backend、handoff backend を選べるようにします。

既定値:

- 明示 policy がない場合は `cli-preferred`

skill-local 設定:

- `skills/igapyon-miku-project/config/backend-policy.json`
- bundle に同梱し、既定 policy、許可 policy、strict policy、fallback 可否を機械可読に記録する
- 優先順位は `user-request`、`environment-policy`、`skill-config`、`repository-default`
- ユーザー明示指示や実行環境 policy と衝突する場合、設定ファイル側を優先しない

policy selector:

- `skills/igapyon-miku-project/lib/backend-policy.mjs`
- CLI や MCP を実行せず、policy と operation capability から実行 backend の候補を決める純粋 helper として扱う
- 実際の backend runner が追加される場合も、この helper の strict policy / fallback contract を崩さない

backend operation registry:

- `skills/igapyon-miku-project/lib/backend-operations.mjs`
- Agent Skill operation から CLI invocation と MCP tool 名を引くための小さな registry として扱う
- CLI invocation builder は command / args を返すだけで、CLI process は実行しない
- MCP tool 名が `null` の operation は、現行 MCP backend では未対応として扱う

policy 値:

- `cli-only`: CLI backend だけを使い、MCP fallback しない
- `cli-preferred`: CLI backend を先に使い、許可されている場合だけ MCP fallback する
- `mcp-only`: MCP backend だけを使い、CLI fallback しない
- `mcp-preferred`: MCP backend を先に使い、許可されている場合だけ CLI fallback する
- `handoff-only`: backend 実行をせず、visible handoff だけを返す

保守時の注意:

- `cli-only` と `mcp-only` は strict policy として扱う
- strict policy では別 backend の探索や自動 fallback を追加しない
- `handoff-only` では CLI command も MCP tool も呼ばない
- fallback を実装または変更した場合は、source backend、target backend、理由を diagnostics に残す
- MCP backend の tool / resource contract は MCP server layer 側に置き、Agent Skill 側で再定義しない
- CLI backend と MCP backend で artifact role と operation vocabulary を変えない

検証対象:

- `cli-only` で MCP fallback しないこと
- `mcp-only` で CLI fallback しないこと
- `cli-preferred` で CLI が使えない場合、許可された MCP fallback だけが起きること
- `mcp-preferred` で MCP が使えない場合、許可された CLI fallback だけが起きること
- `handoff-only` で backend 実行が起きないこと
- import / export / report 系でも同じ backend policy が適用されること
- fallback diagnostics が簡潔に返ること

## 現行 MCP backend 参照

MCP backend の参照実装は `workplace/mikuproject-mcp-devel` の
`mikuproject-mcp` です。

`mikuproject-mcp` 側で確認する contract:

- `contract/runtime-cli-mapping.md`
- `contract/resources/resource-uris.md`
- `contract/results/artifact-roles.md`
- `contract/tools/*.schema.json`

現行 tool 名は upstream CLI command tree から導出されたアンダースコア区切りです。

例:

- `mikuproject_ai_spec`
- `mikuproject_ai_detect_kind`
- `mikuproject_state_from_draft`
- `mikuproject_ai_export_project_overview`
- `mikuproject_ai_export_task_edit`
- `mikuproject_ai_export_phase_detail`
- `mikuproject_ai_validate_patch`
- `mikuproject_state_apply_patch`
- `mikuproject_state_diff`
- `mikuproject_state_summarize`
- `mikuproject_export_workbook_json`
- `mikuproject_export_xml`
- `mikuproject_export_xlsx`
- `mikuproject_import_xlsx`
- `mikuproject_report_wbs_markdown`
- `mikuproject_report_mermaid`
- `mikuproject_report_wbs_xlsx`
- `mikuproject_report_daily_svg`
- `mikuproject_report_weekly_svg`
- `mikuproject_report_monthly_calendar_svg`
- `mikuproject_report_all`

Agent Skill 側の docs で MCP tool 名を書く場合は、このアンダースコア区切り名を使います。
旧ドット区切り名に戻しません。

現行 resource URI の代表例:

- `mikuproject://spec/ai-json`
- `mikuproject://state/current`
- `mikuproject://state/{name}`
- `mikuproject://export/workbook-json`
- `mikuproject://projection/{name}`
- `mikuproject://report/wbs-markdown`
- `mikuproject://report/mermaid`
- `mikuproject://summary/{operationId}`
- `mikuproject://diagnostics/{operationId}`

## テスト

root で `vitest` を有効化しています。

```bash
npm install
npm test
```

現状の既定 test 対象:

- `tests/**/*.test.js`

upstream 側 test は upstream 各リポジトリで実行します。
このリポジトリでは、受け取った runtime artifact の存在と CLI contract を smoke test で確認します。

- このリポジトリで重視するのは、skill 側の動作確認と最低限の smoke test
- upstream `miku-project` 自体の詳細な検証は、まず upstream 側で行われる前提とする
- runtime artifact を差し替えた場合は `npm test` と `npm run build:bundle` を実行する

## 既知メモ: upstream CLI 速度

upstream 側の CLI runtime artifact は、軽い処理でも CLI を毎回起動する固定費が目立つことがあります。

- 簡易計測では、CLI 1 回あたりがおおむね 1 秒前後
- 同じ条件の in-process 計測では、個別の import / patch / export 自体は数 ms から数十 ms 程度

そのため、現時点では「JSON 処理そのもの」よりも、「CLI を毎回 spawn する構造」のほうが支配的に遅い可能性が高いです。
ただし、この repo の skill bundle は runtime artifact 同梱を基本とし、この速度改善対応自体は作業対象に含めません。

## 現在の MVP の前提

- skill は `skills/igapyon-miku-project` にある
- 会話境界の state は `mikuproject_workbook_json`
- upstream の Java CLI runtime artifact と Node.js CLI runtime artifact を前提にしている
