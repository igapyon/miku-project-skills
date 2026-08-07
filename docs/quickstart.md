# Quickstart

この文書は、`mikuproject-skills` をいま動く範囲で試すための最短手順です。

対象:

- `spec`
- `draft`
- `patch`
- `workbook`
- `project-overview` / `task-edit` / `phase-detail`
- `validate` / `apply` / `diff`
- `mikuproject` CLI の `workbook-json` / `xml` / `xlsx`
- `mikuproject` CLI の `wbs-xlsx` / `daily-svg` / `weekly-svg` / `monthly-calendar-svg` / `wbs-markdown` / `mermaid`

この時点で向いている相手:

- 開発者
- 評価目的の利用者
- `spec -> draft -> patch -> workbook` の往復を追える利用者

この時点でまだ向いていない相手:

- 実行環境が fallback なしの hidden state をまだ実現できていない利用者

## 先に結論

最短で試すなら、次の条件を満たします。

1. このリポジトリ全体を workspace に置く
2. Node.js 20 以降と Java 17 を使えるようにする
3. `bundle/mikuproject-skills` を作って skill home に展開する
4. `npm install`
5. `npm test`
6. Codex との会話で `mikuproject` skill を使う

## Execution backend policy

通常は `cli-preferred` として扱います。

これは、まず同梱 CLI backend を使い、CLI が使えない場合だけ、許可されていれば MCP backend へ fallback する方針です。

skill bundle には `skills/mikuproject/config/backend-policy.json` が含まれます。
このファイルは skill 側の既定 policy と許可値を記録するためのものです。
ユーザーの明示指示と実行環境 policy が優先で、設定ファイルはそれらより下位です。

主な使い分け:

- `cli-preferred`: 既定。ローカル CLI 実行が許可されている通常環境向け
- `cli-only`: CLI 実行だけを許可し、MCP fallback を禁止したい環境向け
- `mcp-only`: CLI 実行を禁止し、承認済み MCP server だけを使いたい環境向け
- `mcp-preferred`: MCP を先に使い、許可されている場合だけ CLI へ fallback したい環境向け
- `handoff-only`: CLI も MCP も実行せず、spec / JSON / 手順だけを受け渡したい環境向け

`cli-only` と `mcp-only` は strict policy です。
選んだ backend が使えない場合、別 backend へ自動 fallback せず、実行経路エラーとして扱います。

MCP backend を使う場合の server product 名は `mikuproject-mcp` です。
MCP client 設定上の server key は短く `mikuproject` としてよいですが、repo / package / server adapter の名称は `mikuproject-mcp` として扱います。

現行 `mikuproject-mcp` の tool 名は `mikuproject_ai_spec`、`mikuproject_state_from_draft`、`mikuproject_state_apply_patch` のようなアンダースコア区切りです。
resource URI は `mikuproject://state/current`、`mikuproject://summary/{operationId}` などを使います。

会話で明示する場合は、依頼に含めます。

```text
mikuproject、mcp-only でこの workbook を要約して
```

```text
mikuproject、cli-only で WBS XLSX を出力して
```

## 事前準備

### 1. workspace を揃える

このリポジトリ全体を workspace に置いて開きます。

必要なのは次です。

- `skills/mikuproject`
- `skills/mikuproject/runtime/mikuproject-<version>.jar`
- `skills/mikuproject/runtime/mikuproject-<version>.mjs`

ここでの `<version>` は同梱 runtime の version です。
実行時は `skills/mikuproject/runtime/` 内の version 付き artifact を解決して使います。

`skills/` だけでは不足します。

### 2. bundle を作って配置する

次を実行します。

```bash
npm run build:bundle
```

これで次が作られます。

```text
bundle/mikuproject-skills/
  skills/
    mikuproject/
      runtime/
        mikuproject-<version>.jar
        mikuproject-<version>.mjs
```

その中身を skill home にコピーします。

zip が欲しい場合は次も使えます。

```bash
npm run build:bundle:zip
```

生成先:

```text
bundle/igapyon-mikuproject-skills-<version>.zip
```

詳しくは [skill-installation.md](./skill-installation.md) を参照してください。

### 3. 依存関係とテスト

```bash
npm install
npm test
```

ここが通れば、少なくともこのリポジトリ内の前提は揃っています。

配布物までまとめて作るときは次を使えます。

```bash
npm run build
```

これは次をまとめて実行します。

- `npm test`
- `npm run build:bundle`
- `npm run build:bundle:zip`

### 4. 生成物の置き場所を決める

WBS 関連の生成物は、workspace ルートへ直置きせず、専用ディレクトリへ寄せるのを推奨します。

推奨構成:

```text
mikuproject/
  state/
  report/
  tmp/
```

使い分け:

- `mikuproject/state/`: workbook JSON、draft JSON、Patch JSON などの状態ファイル
- `mikuproject/report/`: `WBS XLSX`、`SVG`、`Markdown`、Mermaid などの成果物
- `mikuproject/tmp/`: 一時ファイル

ファイル名は、同じ実行単位で同じ prefix を使うと整理しやすくなります。

推奨例:

- `YYYYMMDDHHmm-workbook.json`
- `YYYYMMDDHHmm-wbs.xlsx`
- `YYYYMMDDHHmm-daily.svg`
- `YYYYMMDDHHmm-weekly.svg`
- `YYYYMMDDHHmm-patch.json`

## まず試す流れ

### 新規草案と既存編集の区別

この skill では、ここを厳密に分けます。

- 新規に WBS を作るとき: `project_draft_view`
- 既存の WBS を直すとき: `Patch JSON`

新規草案の会話で、次へ寄ってはいけません。

- `task_edit_view`
- `phase_detail_view`
- `project_overview_view`

`.editjson` は upstream 側で広い編集用 JSON 群の拡張子として使われることがあります。
`project_draft_view` は JSON 文書であり、`.editjson` として受け渡してかまいません。
ただしこの skill の通常会話では document kind を優先します。
つまり、新規草案では `project_draft_view`、既存編集では `Patch JSON` と呼びます。

### 1. まずは明示トリガー付きで WBS 作成を依頼する

会話では、まず明示トリガー付きの依頼文で始めます。

```text
mikuproject で、れでえいやあでWBSつくって
```

または:

```text
miku project で、れでえいやあでWBSつくって
```

期待すること:

- エージェントが内部で `spec` を参照する
- エージェントが内部で `project_draft_view` を作る
- それを `mikuproject` に内部で取り込み、workbook state まで進める
- ユーザーには WBS 要約や完成結果だけが返る

避けたい挙動:

- `spec` 本文がそのまま画面に出る
- `project_draft_view` の JSON がそのまま画面に出る
- `以下を mikuproject に渡せます` のような visible handoff で止まる
- `task_edit_view` や `.editjson` の説明へ逸れる

このような表示が出る場合は、fallback 動作になっている可能性があります。

補足:

- この skill は generic な planning 語だけでは自動起動しない
- まず `mikuproject` または `miku project` を入れて始める

### 2. 明示的に spec を見たい場合だけ出す

会話で次のように依頼します。

```text
spec を出して
```

期待すること:

- `mikuproject-ai-json-spec` が返る
- これは通常運用ではなく、raw spec を確認したいときの操作

### 3. すでにある `project_draft_view` を取り込む

外部で作った `project_draft_view` を取り込むときは、次のように依頼します。

```text
この project_draft_view を取り込んで
```

期待すること:

- `mikuproject_workbook_json` が返る

### 4. patch を当てる

現在の workbook state をもとに変更したいときは、通常は変更要求をそのまま伝えます。

```text
このWBSを1週間短くして
```

期待すること:

- エージェントが必要に応じて `project_overview_view` / `task_edit_view` / `phase_detail_view` を内部で使う
- エージェントが内部で `Patch JSON` を作る
- それを `mikuproject ai validate-patch` で検査する
- それを `mikuproject` に内部で適用する
- 必要に応じて `mikuproject state diff` で変更点を確認する
- ユーザーには更新後の内容だけを返す

外部で作った `Patch JSON` を適用するときは、次のように依頼します。

```text
この Patch JSON を反映して
```

期待すること:

- 更新後の `mikuproject_workbook_json` が返る

### 5. workbook を引き渡す

現在の state をもう一度 AI に渡したいときは、次のように依頼します。

```text
現在の workbook を出して
```

期待すること:

- 現在の `mikuproject_workbook_json` が返る

### 6. Markdown / Mermaid / Excel ガントに変換する

export を頼むときは、補助スクリプトを作るのではなく、`mikuproject` の正式 export を使うのが期待動作です。

例:

```text
これを markdown化して
```

```text
これを Mermaid 化して
```

```text
Excelガントが欲しい
```

期待すること:

- `markdown化` は `wbs-markdown-export` として扱われる
- `Mermaid 化` は `mermaid-export` として扱われる
- `Excelガント` や `xlsxでガント` は通常 `WBS XLSX` として扱われる
- `report を全部` / `一式で` / `まとめて` のような依頼では、upstream の `report all` を使って report 一式 ZIP を出す
- この場合は `wbs-xlsx-export` を使い、一般的な表計算ライブラリ探索や ad-hoc な `.xlsx` 生成へ逸れない
- 通常運用では `tmp/*.mjs` のような補助スクリプトを作らない
- 依存不足で export できない場合だけ、その不足を短く報告する

## `mikuproject` CLI でできること

bundle 配布物では `skills/mikuproject` 配下に runtime artifact が入ります。
通常の参照元は bundle 内の `skills/mikuproject/runtime/mikuproject-<version>.jar` と
`skills/mikuproject/runtime/mikuproject-<version>.mjs` です。
`<version>` をそのまま入力するのではなく、同梱されている実ファイル名を使います。

```text
mikuproject ai spec
mikuproject ai export project-overview
mikuproject ai export task-edit
mikuproject ai export phase-detail
mikuproject ai validate-patch
mikuproject state from-draft
mikuproject state summarize
mikuproject state diff
mikuproject state apply-patch
mikuproject export workbook-json
mikuproject export xml
mikuproject export xlsx
mikuproject report wbs-xlsx
mikuproject report daily-svg
mikuproject report weekly-svg
mikuproject report monthly-calendar-svg
mikuproject report all
mikuproject report wbs-markdown
mikuproject report mermaid
```

この CLI は、上位エージェントが内部で使う前提で考えます。

## いまの利用イメージ

望ましい既定は agent-internal execution です。

つまり:

1. `spec` や workbook は通常は画面に出さない
2. 新規作成では `project_draft_view` を、既存修正では局所 projection と `Patch JSON` を内部で使う
3. 既存修正では `project-overview -> task-edit / phase-detail -> validate -> apply -> diff` を優先する
4. 必要な最終結果だけを画面に出す

実行環境がこれに対応できない場合だけ、handoff 型にフォールバックします。

## つまずきやすい点

- `skills/` だけをコピーしても動かない
- `Patch JSON` は base state なしでは適用できない
- `monthly-calendar-svg` は単一 SVG ではなく ZIP 出力
- `report all` は report 一式 ZIP を返し、`monthly-calendar/YYYY-MM.svg` を含む
- `spec` が画面に出る場合は fallback 動作の可能性がある

## 次に見る文書

- 配置手順: [skill-installation.md](./skill-installation.md)
- 設計メモ: [agent-skill-design.md](./agent-skill-design.md)
- agent 内部連携メモ: [agent-to-agent-runner.md](./agent-to-agent-runner.md)
