# File Import and Export

この文書は、`miku-project-skills` における主要ファイル形式の import / export をまとめたものです。

対象:

- `MS Project XML`
- 構造忠実 workbook `XLSX`
- `mikuproject_workbook_json`

対象外 / Deferred:

- `CSV`
- AI 向け編集用 JSON 群
  - `project_overview_view`
  - `phase_detail_view`
  - `task_edit_view`
  - `ai_projection_bundle` / full bundle

この文書では、旧 `Phase B` 系メモを統合し、現在の実装前提に合わせて整理しています。

## 位置づけ

これらは、`spec` / `draft` / `patch` / `workbook` とは別の file workflow です。

- `MS Project XML`: 交換形式
- 構造忠実 workbook `XLSX`: 確認・限定編集向けの表現
- `mikuproject_workbook_json`: 会話境界で扱いやすい JSON 形式

既存 WBS の通常修正では、file workflow を第一選択にしません。
その場合は `project_overview_view` / `task_edit_view` / `phase_detail_view` と
`Patch JSON` を使う AI workflow を優先します。

会話境界の state は、引き続き `mikuproject_workbook_json` を優先します。

`CSV` は primary file import/export workflow の対象外として扱います。
AI 向け編集用 JSON 群は file workflow ではなく、projection / patch の AI workflow として扱います。
`ai_projection_bundle` は全体把握や handoff の補助であり、primary import/export 形式ではありません。

## 現在の利用方針

- import では各形式を `ProjectModel` に戻し、必要に応じて `mikuproject_workbook_json` に正規化します
- export では current state を `ProjectModel` に揃えて目的の形式へ変換します
- `MS Project XML` や `XLSX` を長期の内部 state として保持する前提にはしません

## 利用できる upstream runtime

主要な入口は `skills/igapyon-miku-project/runtime/` の CLI runtime artifact です。
生成AI向けの例では、Java runtime の例を先に示し、続けて Node.js runtime の例を示します。

### `MS Project XML`

- Java runtime: `validate xml`, `export xml`
- Node.js runtime: `export xml`

### `mikuproject_workbook_json`

- Java runtime: `state validate`, `state import`, `state merge`, `export workbook-json`
- Node.js runtime: `state from-draft`, `state summarize`, `state diff`, `state apply-patch`, `export workbook-json`

### 構造忠実 workbook `XLSX`

- Java runtime: `export xlsx`, `validate xlsx`, `import xlsx`, `merge xlsx`
- Node.js runtime: `export xlsx`

## `MS Project XML`

### import

- XML テキストを受け取り、runtime CLI で `mikuproject_workbook_json` に揃えます
- 必要なら Java runtime の `validate xml` で検査します
- file workflow から AI workflow へ入る入口として使えます

### export

- current state を runtime CLI に渡し、XML テキストを生成します
- 必要なら validate 結果を併記します

## `mikuproject_workbook_json`

### export

- current state がすでに `mikuproject_workbook_json` なら、そのまま返せます
- XML や draft から作る場合は runtime CLI で workbook JSON に変換します

### import

次の 2 形態があります。

- replace import:
  既存 state を丸ごと置き換えます
- merge import:
  既存 state に対して部分適用します

merge import では `baseModel` が必要で、`changes` と `warnings` を伴うことがあります。

## 構造忠実 workbook `XLSX`

### export

- current state を `ProjectModel` に揃えます
- `xlsx.exportWorkbook` で workbook-like object を生成します
- `xlsx.encodeWorkbook` で `.xlsx` bytes に変換します

### import

次の 2 形態があります。

- replace import:
  `.xlsx` 全体を現在 state として読み込みます
- merge import:
  既存 state に対して `XLSX` 上の編集を部分反映します

binary を直接扱う場合も、skill 側では runtime CLI の file path 入出力として渡します。

## 代表的な操作

- `xml-import`
- `xml-export`
- `xlsx-import`
- `xlsx-merge-import`
- `xlsx-export`
- `workbook-import`
- `workbook-merge-import`
- `workbook-export`

## エラーと warning

hard error の例:

- 入力形式として parse できない
- current state が必要なのに存在しない
- `.xlsx` の decode / encode に失敗する

soft error の例:

- import 時に未知の列や sheet が無視される
- merge import で一部の変更だけが反映される
- validation issue が返る

soft error の場合は、結果を返しつつ warning を併記する前提です。

## 関連文書

- [quickstart.md](./quickstart.md)
- [agent-skill-design.md](./agent-skill-design.md)
