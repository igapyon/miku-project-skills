# Agent Skill Design

`miku-project-skills` の MVP 向け Agent Skill 設計メモです。

## 方針

MVP では、`spec` / `draft` / `patch` / `workbook` を別 skill に分割しない。
まずは 1 つの `miku-project` skill として成立させる。

理由:

- 利用者から見ると 4 機能は 1 つの往復フローを構成している
- upstream 側に Java / Node.js CLI runtime artifact が追加され、skill から安定して呼び出しやすくなった
- 初期段階で skill を分けすぎると、状態管理と呼び分けが複雑になる

## MVP Skill の責務

Skill は次の 4 機能を担当する。

- `miku-project-ai-json-spec` を提示する
- 生成AIが返した `project_draft_view` を受け取って処理する
- 生成AIが返した `Patch JSON` を受け取って処理する
- 現在状態を `mikuproject_workbook_json` として生成AIに渡せる形にする

既存 WBS 修正では、workbook 全体 handoff を第一選択にしない。
MVP でも、可能なら局所 projection を優先する。

Skill は WBS 編集 UI の代替を目指さない。
MVP の責務は、生成AIとの構造化 I/O を安定して往復させることである。

## Skill 名称

第一候補:

- `miku-project`

候補理由:

- upstream 名と一致していて理解しやすい
- `miku-project` 固有の JSON 仕様と往復フローを扱う skill であることが明確

代替候補:

- `miku-project-wbs`
- `miku-project-ai-json`

MVP では `miku-project` を採用する想定とする。

## 想定する利用シーン

### 1. 新規 WBS 草案を作る

- 利用者が要件や制約を文章で与える
- Skill が `miku-project-ai-json-spec` を提示する
- 生成AI が `project_draft_view` を返す
- Skill がそれを受け取って `miku-project` 形式の状態へ変換する

### 2. 既存 WBS を AI に修正させる

- Skill が `project_overview_view` で全体像を出す
- 必要に応じて `task_edit_view` または `phase_detail_view` で局所文脈を出す
- 生成AI が `Patch JSON` を返す
- Skill が validate してから Patch を適用する
- 必要に応じて diff を返す

## 状態管理方針

MVP では、Agent Skill の会話境界における状態保持形式は
`mikuproject_workbook_json` を優先する。

ただし、これは `miku-project` の内部基軸が `MS Project XML` であることを
否定しない。Skill は会話と JSON 往復を扱う層なので、会話境界では
`mikuproject_workbook_json` を主に保持し、内部処理では必要に応じて
`ProjectModel` および `MS Project XML` へ変換する。

理由:

- JSON として扱いやすい
- upstream に import/export API がある
- `ProjectModel` や `MS Project XML` を skill 外へ長期保持するより扱いやすい
- `project_draft_view` と `Patch JSON` の両方の中間状態として使える

補足:

- `MS Project XML` は upstream の基軸・互換形式である
- `mikuproject_workbook_json` は Agent Skill が扱いやすい周辺表現である
- MVP では、必要な情報は `mikuproject_workbook_json` で十分に往復できる前提を置く
- 将来 `workbook_json` に載らない情報を skill で扱う必要が出た場合は、状態保持方針を再検討する

基本変換フロー:

- 新規草案: `project_draft_view -> ProjectModel -> mikuproject_workbook_json`
- 既存修正: `mikuproject_workbook_json -> ProjectModel -> project_overview_view / task_edit_view / phase_detail_view -> Patch JSON validate/apply -> mikuproject_workbook_json`
- 必要時: `ProjectModel -> MS Project XML`

## upstream runtime の利用方針

MVP では、次の upstream runtime artifact を主要入口とする。

- `skills/igapyon-miku-project/runtime/miku-project-<version>.jar`
- `skills/igapyon-miku-project/runtime/miku-project-<version>.mjs`

`<version>` は placeholder であり、実行時は `runtime/` 内の version 付き artifact を解決して使う。

主に使う想定のコマンドは、生成AIに渡す例示で Java runtime が先に見えるように並べる。
その後に Node.js runtime の例を示す。

- `java -jar skills/igapyon-miku-project/runtime/miku-project-<version>.jar ai spec`
- `java -jar skills/igapyon-miku-project/runtime/miku-project-<version>.jar state from-draft`
- `java -jar skills/igapyon-miku-project/runtime/miku-project-<version>.jar ai export project-overview`
- `java -jar skills/igapyon-miku-project/runtime/miku-project-<version>.jar ai export task-edit`
- `java -jar skills/igapyon-miku-project/runtime/miku-project-<version>.jar ai export phase-detail`
- `java -jar skills/igapyon-miku-project/runtime/miku-project-<version>.jar ai validate-patch`
- `java -jar skills/igapyon-miku-project/runtime/miku-project-<version>.jar state apply-patch`
- `java -jar skills/igapyon-miku-project/runtime/miku-project-<version>.jar export workbook-json`
- `java -jar skills/igapyon-miku-project/runtime/miku-project-<version>.jar report all`
- `node skills/igapyon-miku-project/runtime/miku-project-<version>.mjs ai spec`
- `node skills/igapyon-miku-project/runtime/miku-project-<version>.mjs state from-draft`
- `node skills/igapyon-miku-project/runtime/miku-project-<version>.mjs ai export project-overview`
- `node skills/igapyon-miku-project/runtime/miku-project-<version>.mjs ai export task-edit`
- `node skills/igapyon-miku-project/runtime/miku-project-<version>.mjs ai export phase-detail`
- `node skills/igapyon-miku-project/runtime/miku-project-<version>.mjs ai validate-patch`
- `node skills/igapyon-miku-project/runtime/miku-project-<version>.mjs state apply-patch`
- `node skills/igapyon-miku-project/runtime/miku-project-<version>.mjs state diff`

## Execution Backend Policy

Agent Skill は workflow layer として残し、実行面だけを backend policy で切り替える。

既定値は `cli-preferred` とする。
ただし、ユーザー指示、実行環境の制約、repo 設定がある場合はそれを優先する。

policy 値:

- `cli-only`: CLI backend だけを使い、MCP へ自動 fallback しない
- `cli-preferred`: CLI backend を先に使い、許可されている場合だけ MCP へ fallback する
- `mcp-only`: MCP backend だけを使い、CLI へ自動 fallback しない
- `mcp-preferred`: MCP backend を先に使い、許可されている場合だけ CLI へ fallback する
- `handoff-only`: backend 実行を行わず、spec / JSON / 手順を visible handoff として返す

`cli-only` と `mcp-only` は strict policy として扱う。
選ばれた backend が使えない場合は、別 backend に逃げず、実行経路エラーとして返す。

fallback が許可されていて実際に発生した場合は、どの backend からどの backend へ移ったか、
および理由を短く返す。

会話上の明示 policy は、現在のユーザー依頼に `cli-only`、`cli-preferred`、
`mcp-only`、`mcp-preferred`、`handoff-only` のいずれかが exact value として
含まれる場合に解釈する。`で`、`として`、`固定`、`only`、`preferred`、
`fallbackなし` のような周辺語は許容する。

例:

- `miku-project、mcp-only で要約して`
- `miku-project cli-only 固定で WBS XLSX を出して`
- `miku-project handoff-only として spec を出して`

同一依頼内に複数の policy 値が出て、どれかが明確に否定されているわけではない場合は、
実行前にどの policy を使うか確認する。`MCP でも使える?` のような backend 名だけの質問は
capability question として扱い、`mcp-only` の strict policy とは解釈しない。

## Agent Skill over CLI backend

CLI backend を使う場合でも、Agent Skill の責務は CLI wrapper そのものではない。

Agent Skill 側の責務:

- `miku-project` の activation boundary を守る
- `spec` / `draft` / `patch` / `workbook` などの操作単位を選ぶ
- `project_draft_view`、`Patch JSON`、`mikuproject_workbook_json` の artifact role を守る
- Java CLI と Node.js CLI のどちらを使うかを runtime policy に従って決める
- 中間ファイルと出力ファイルの置き場所を整理する
- warning / error / diff summary を利用者に分かる形で返す

CLI backend 側の責務:

- upstream runtime artifact として product operation を実行する
- import / export / validate / apply / report などの変換実体を持つ
- upstream product の diagnostics を返す

CLI backend を使っても、skill 側で upstream 変換ロジックを再実装しない。

## Agent Skill over MCP backend

MCP backend を使う場合も、Agent Skill は MCP server にはならない。

Agent Skill 側の責務:

- CLI backend 利用時と同じ operation vocabulary を維持する
- Agent Skill operation と MCP tool / resource の対応を選ぶ
- `mcp-only` / `mcp-preferred` / fallback policy を守る
- MCP tool の結果を、skill の artifact role と response shape に合わせて説明する
- MCP resource URI、server-managed path、workbook JSON の境界を混同しない

MCP backend 側の責務:

- product-specific MCP server として tool / resource / prompt contract を提供する
- tool input schema と result schema を管理する
- state や generated artifact を MCP resource として公開する
- upstream runtime artifact または public API を呼び出す

`miku-project-skills` 側では、MCP tool 名や resource URI contract を勝手に再定義しない。
MCP backend は `mikuproject-mcp` などの MCP server layer によって提供される前提とする。

### 現行 `mikuproject-mcp` contract との対応

現行の `mikuproject-mcp` は、MCP tool 名を upstream CLI command tree から導出している。

例:

- `ai spec` -> `mikuproject_ai_spec`
- `ai detect-kind` -> `mikuproject_ai_detect_kind`
- `state from-draft` -> `mikuproject_state_from_draft`
- `ai export project-overview` -> `mikuproject_ai_export_project_overview`
- `state apply-patch` -> `mikuproject_state_apply_patch`
- `export workbook-json` -> `mikuproject_export_workbook_json`

Agent Skill operation との対応は次の考え方で扱う。

- Agent Skill の `spec` は MCP tool `mikuproject_ai_spec` に対応する
- Agent Skill の `draft` は MCP tool `mikuproject_state_from_draft` に対応する
- Agent Skill の `patch-validate` は MCP tool `mikuproject_ai_validate_patch` に対応する
- Agent Skill の `patch` は MCP tool `mikuproject_state_apply_patch` に対応する
- Agent Skill の `workbook` / `workbook-export` は MCP tool `mikuproject_export_workbook_json` に対応する
- Agent Skill の report 系のうち、現行 MCP backend では `wbs-markdown` と `mermaid` が対応済みである

現行 `mikuproject-mcp` の主な resource URI は次の通り。

- `mikuproject://spec/ai-json`
- `mikuproject://state/current`
- `mikuproject://state/{name}`
- `mikuproject://export/workbook-json`
- `mikuproject://export/project-xml`
- `mikuproject://export/project-xlsx`
- `mikuproject://projection/{name}`
- `mikuproject://report/wbs-markdown`
- `mikuproject://report/mermaid`
- `mikuproject://summary/{operationId}`
- `mikuproject://diagnostics/{operationId}`

state 境界は次のように整理する。

- Agent Skill の会話境界 state は引き続き `mikuproject_workbook_json`
- MCP backend の現在状態は `mikuproject://state/current` として参照できる
- MCP server-managed path に書かれた artifact だけが固定 `mikuproject://` URI を持つ
- custom `outputPath` へ出した artifact は、固定 resource URI ではなく file path artifact として扱う
- operation summary と diagnostics は `operationId` で `mikuproject://summary/{operationId}` / `mikuproject://diagnostics/{operationId}` に紐づける

この対応を使うことで、CLI backend の file path 中心の結果と、MCP backend の resource URI / `operationId` 中心の結果を、同じ artifact role で説明できる。

## 操作単位

MVP では、Skill の責務を 4 つの操作単位として定義する。

### `spec`

入力:

- なし、または利用者の簡単な要求

出力:

- `miku-project-ai-json-spec` の本文
- 必要なら version
- 利用者が生成AIへ渡すための最小補足文

### `draft`

入力:

- 生成AIが返した `project_draft_view`
- `json` フェンス付き全文でも可

出力:

- 取込成功/失敗
- warning の有無
- 変換後の `mikuproject_workbook_json`

### `patch`

入力:

- 現在の `mikuproject_workbook_json`
- 必要に応じて `project_overview_view` / `task_edit_view` / `phase_detail_view`
- 生成AIが返した `Patch JSON`

出力:

- 反映成功/失敗
- warning の有無
- change summary
- 更新後の `mikuproject_workbook_json`
- 必要に応じて diff summary

### `workbook`

入力:

- 現在の `mikuproject_workbook_json`

出力:

- そのまま生成AIへ渡せる `mikuproject_workbook_json`
- 必要なら補足プロンプト

## 会話上の取り扱い

Skill は次のように振る舞う。

- `spec` 要求では prompt/spec を返す
- `draft` 要求では `project_draft_view` を検出して取り込む
- `patch` 要求では `Patch JSON` を検出して適用する
- `workbook` 要求では current workbook を返す

既存修正フローでは、可能なら次を内部的に優先する。

- `project-overview`
- `task-edit` または `phase-detail`
- `validate-patch`
- `apply-patch`
- `state diff`

利用者が document kind を明示しなくても、中身から判定する。
判定不能ならエラーにする。

## handoff 型と agent-to-agent 型

MVP の初期設計は handoff 型だった。

これは、skill が `spec` や `mikuproject_workbook_json` を画面に返し、
その返却内容を利用者または上位エージェントが次の生成AIへ渡す形を意味する。

たとえば `spec` では、skill 自身が外部の生成AIと自動対話するのではなく、
次の AI ターンへ渡すための `miku-project-ai-json-spec` を返す。

したがって、`spec` 実行時に spec 本文や handoff 用プロンプトが画面に表示されるのは、
初期 handoff 設計では想定どおりの挙動だった。

ただし現在は、既存 WBS 修正については handoff より agent-internal flow を優先する。
特に workbook 全体をそのまま次段 AI に渡すより、局所 projection を優先する。

一方で、将来の理想形としては agent-to-agent 型もありうる。

これは、skill の返却内容を画面にそのまま見せるのではなく、
上位エージェントが内部的に次の生成AI処理へ接続する方式である。

整理すると次の違いがある。

- handoff 型
  - `spec` や `workbook` を画面に返す
  - 人手または上位エージェントが次の AI に渡す
  - MVP の現行設計
- agent-to-agent 型
  - skill 出力を内部的に次の AI 処理へ渡す
  - 画面には中間 spec や handoff 文を必ずしも出さない
  - skill 単体ではなく、上位エージェント側の実装が必要

MVP では後者までは扱わない。
まずは構造化 I/O と state 持ち回りを安定させることを優先する。

## agent-to-agent 型へ進める場合の拡張方針

将来 agent-to-agent 型へ進める場合は、skill 本体だけで完結させるより、
上位エージェント側で吸収する方が整合的である。

理由:

- 現在の skill は構造化 I/O と format 変換に責務を絞っている
- 外部生成AIの呼び出しを skill 自体に埋め込むと、モデル依存や認証、失敗時制御まで抱え込む
- `spec` / `draft` / `patch` / `workbook` の境界が崩れやすい

### 推奨アーキテクチャ

役割は次のように分ける。

- `miku-project` skill
  - `spec` を返す
  - `project_draft_view` を `mikuproject_workbook_json` に変換する
  - `project_overview_view` / `task_edit_view` / `phase_detail_view` を返す
  - `Patch JSON` を validate する
  - `Patch JSON` を base state に適用する
  - state diff を返す
  - workbook / xml / xlsx / report を入出力する
- `miku-project` CLI
  - `ai spec`
  - `ai export project-overview`
  - `ai export task-edit`
  - `ai export phase-detail`
  - `ai validate-patch`
  - `state from-draft`
  - `state summarize`
  - `state diff`
  - `state apply-patch`
  - `export workbook-json`
  - `export xml`
  - `export xlsx`
- 上位エージェント
  - 利用者要求を受ける
  - `miku-project ai spec` の返却内容を内部で参照する
  - `project_draft_view` や `Patch JSON` を内部で生成して `miku-project` に渡す
  - 途中状態として `mikuproject_workbook_json` を保持する

### 最小の内部連携シーケンス

新規草案では次の流れを想定する。

1. 利用者が要件を入力する
2. 上位エージェントが `miku-project ai spec` を呼ぶ
3. 上位エージェントが `spec` と利用者要件をもとに `project_draft_view` を生成する
4. 上位エージェントがその結果を `miku-project state from-draft` に渡す
5. `miku-project` が `mikuproject_workbook_json` を返す
6. 上位エージェントがその workbook state を次ターン用 state として保持する

既存 WBS の修正では次の流れを想定する。

1. 上位エージェントが現在の `mikuproject_workbook_json` を保持している
2. 上位エージェントが `miku-project ai export project-overview` で全体像を得る
3. 必要に応じて `miku-project ai export task-edit` または `miku-project ai export phase-detail` で局所文脈を得る
4. 上位エージェントがその局所文脈と変更要求をもとに `Patch JSON` を生成する
5. 上位エージェントがその結果を `miku-project ai validate-patch` に渡す
6. 上位エージェントが warning / error / change summary を確認する
7. 上位エージェントがその結果を `miku-project state apply-patch` に渡す
8. 必要に応じて `miku-project state diff` で差分確認する
9. `miku-project` が更新後の `mikuproject_workbook_json` を返す
10. 上位エージェントが更新後 state を保持する

### 必要な基盤機能

agent-to-agent 型にするには、少なくとも次の基盤機能が必要になる。

- `miku-project` CLI の返却値を画面表示せず内部 state に回す制御
- `mikuproject_workbook_json` の会話境界 state 保存
- 失敗時の再試行または中断制御
- `project_draft_view` / `Patch JSON` の生成失敗時にどこへ戻すかの制御

現時点では `miku-project` CLI の AI 編集系 first cut が揃っているため、
自動連携の初期スコープは `spec` / `project-overview` / `task-edit` / `phase-detail` /
`validate-patch` / `apply-patch` / `state diff` / `workbook-json` / `xml` / `xlsx` に寄せるのが自然である。

### 画面表示を抑えるための考え方

`spec` の本文や handoff 文を画面にそのまま出したくない場合、
skill 側で spec を返さなくするのではなく、
上位エージェント側で「中間出力」として扱うのが自然である。

つまり:

- skill の返却は維持する
- その返却を UI へ出すか、次段の AI に回すかを基盤側で決める

この方が handoff 型と agent-to-agent 型の両方を同じ skill 定義で支えやすい。

### 非推奨の進め方

次の方向は、現時点では非推奨とする。

- `spec` operation の中で直接外部生成AIを呼ぶ
- skill の責務として API key 管理やモデル選択を持たせる
- `draft` / `patch` の kind 判定と外部 LLM 再呼び出しを一体化する

これらは skill の責務を広げすぎ、再利用性と可観測性を落としやすい。

### 将来の追加候補

将来拡張としては次が考えられる。

- `spec` の返却を `display` 用と `handoff` 用に分けるメタデータ
- `draft` / `patch` の処理結果に次の推奨 action を添える
- agent-internal flow 用のサンプルフロー文書

## エラー方針

### hard error

- JSON として parse できない
- `view_type` / `format` / `operations` から kind を判定できない
- `Patch JSON` なのに base 状態がない
- `project_draft_view` / workbook JSON の必須項目が不足している

### soft error

- upstream の validation check が warning を返した
- Patch の一部 operation が無視された
- workbook JSON の未知列や未知 sheet が無視された

soft error の場合は処理継続し、warning を返す。

## 人手が必要な境界

MVP では次は人手または別会話に委ねる。

- `miku-project` ブラウザ UI 上での目視確認
- WBS 内容の業務妥当性判断
- SVG / XLSX / Markdown の出力活用

## やさしい説明

ここまでの話を、難しい言葉を使わずに言い換える。

### 今の動き

今の `miku-project` skill は、次のように動く。

1. `spec` を実行する
2. skill が「次の AI に渡すための説明文」を返す
3. その説明文が画面に表示される
4. その先は、人が別の AI に渡す

つまり今は、
「skill が別の AI と自動で会話する」のではなく、
「skill が次に渡す文章を出す」方式である。

### いま困っている点

あなたが気にしているのはここである。

- `spec` の結果が画面に見えてしまう
- 本当は、その結果を画面に出さずに、次の AI に自動で渡してほしい

これは自然な要望である。
ただし、今の MVP はそこまでは作っていない。

### 何が足りないか

足りないのは `miku-project` skill 本体ではなく、
「上位エージェントが内部で `miku-project` を使う仕組み」である。

### 上位エージェントがやること

上位エージェントは、次の順で動く。

1. 利用者の依頼を受ける
2. `miku-project` から `spec` を受け取る
3. その内容を画面に出さず内部で使う
4. 既存修正では局所 projection を内部で取り出す
5. `project_draft_view` や `Patch JSON` を内部で生成する
6. validate / apply / diff を内部で回す
7. 更新後の workbook state を保持する

### つまり何を作ればよいか

次に必要なのは、`miku-project` skill の大改造ではない。
まず必要なのは次の仕組みである。

- `miku-project` の返り値を画面表示せず受け取る
- `spec` や局所 projection をもとに内部で `project_draft_view` や `Patch JSON` を生成する
- 生成した JSON をもう一度 `miku-project` に戻す
- `mikuproject_workbook_json` を途中状態として持ち回る

### 先に決めるべきこと

実装前に決めるべき点は少ない。

1. 中間の返り値を画面に見せるか見せないか
2. workbook state をどこに保持するか
3. `report` 系まで含めて、どこまで CLI に寄せるか

### いまの結論

結論は次のとおり。

- 今の挙動は不具合ではない
- ただし、理想形には足りない
- 足りないのは skill よりも「上位エージェント内部の運用」
- 次に進めるなら、その運用要件を書き出すのがよい

## MVP 以外

次は MVP では扱わない。

- MCP 化
- 複数 skill への分割
- `bundle` を主導線にした重い AI 編集
- 自動レビューや自動再計画
- UI 操作の自動化

## 実装含意

MVP 実装では少なくとも次が必要になる。

- skill の `SKILL.md`
- `spec` / `draft` / `patch` / `workbook` の会話ルール
- 状態として扱う `mikuproject_workbook_json` の保存方針
- upstream runtime artifact を呼ぶ補助コードまたは手順
