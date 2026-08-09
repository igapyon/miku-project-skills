# Report Export

この文書は、`miku-project-skills` における report / presentation 向け出力をまとめたものです。

対象:

- `WBS XLSX`
- `Daily SVG`
- `Weekly SVG`
- `Monthly Calendar SVG`
- `WBS Markdown`
- `Mermaid`
- report bundle `ZIP`

この文書では、旧 `Phase C` 系メモを統合し、現在の実装前提に合わせて整理しています。

## 位置づけ

これらは主要交換形式ではなく、共有・確認・提示のための派生出力です。

- `WBS XLSX`: Excel で見やすく共有するための出力
- `SVG`: 日次・週次・月次の見た目を生成する出力
- `WBS Markdown`: 人が読みやすい軽量テキスト出力
- `Mermaid`: Markdown や設計資料へ貼るための gantt text

## 現在の利用方針

- current state を `ProjectModel` に揃えてから report を生成します
- report 出力は通常 export 先であり、会話境界の state そのものではありません
- 複数成果物が欲しい場合は `report all` を優先できます

## 利用できる upstream runtime

主要な入口は `skills/igapyon-miku-project/runtime/` の CLI runtime artifact です。
生成AI向けの例では、Java runtime の例を先に示し、続けて Node.js runtime の例を示します。

- Java runtime: `report all`, `report dir`, `report wbs-xlsx`, `report daily-svg`, `report weekly-svg`, `report monthly-calendar-svg`, `report wbs-markdown`, `report mermaid`
- Node.js runtime: `report all`, `report wbs-xlsx`, `report daily-svg`, `report weekly-svg`, `report monthly-calendar-svg`, `report wbs-markdown`, `report mermaid`

## `WBS XLSX`

- runtime CLI で `WBS XLSX` artifact を生成します
- 祝日や表示期間に関する option を指定できます

## `SVG`

### Daily SVG

- runtime CLI で daily SVG 文字列または file artifact を生成します

### Weekly SVG

- runtime CLI で weekly SVG 文字列または file artifact を生成します

### Monthly Calendar SVG

- runtime CLI は月別 SVG 一式を ZIP などの file artifact として生成します

## `WBS Markdown`

- runtime CLI で Markdown 文字列または file artifact を生成します
- `WBS XLSX` と近い表示オプションを使えます

## `Mermaid`

- runtime CLI で Mermaid gantt text を生成します
- fenced Markdown ではなく、Mermaid 本文を返す前提です

## report bundle

- `report all` は report 一式をまとめて返します
- 返り値は ZIP file artifact として扱います
- 少なくとも `wbs.xlsx`、`wbs.md`、`mermaid.mmd`、`daily.svg`、`weekly.svg`、月次 SVG 群を含められます

## 代表的な操作

- `wbs-xlsx-export`
- `daily-svg-export`
- `weekly-svg-export`
- `monthly-calendar-svg-export`
- `wbs-markdown-export`
- `mermaid-export`
- `all-report-export`

## エラーと warning

hard error の例:

- current state がない
- export 結果が空
- `.xlsx` encode や monthly archive 生成に失敗する

soft error の例:

- option の一部が既定値へ丸められる
- 表示用の補正により、見た目が期待と少しずれる
- 月次出力の一部だけが省略される

soft error の場合は、可能な範囲で成果物を返しつつ warning を併記する前提です。

## 関連文書

- [quickstart.md](./quickstart.md)
- [agent-skill-design.md](./agent-skill-design.md)
