---
title: Agent Skills整合性修正計画
description: XML取込をIssueへ切り出し、残る5件を修正・検証した実装計画と受入条件。
status: completed
created: 2026-10-23
updated: 2026-10-23
---

# Agent Skills整合性修正計画

この文書は当初、利用者の2026-10-23の依頼に基づく実装前計画として作成した。指摘2をGitHub Issueへ登録して除外し、指摘1・3・4・5・6を実装した。実施結果・検証環境・計画からの調整は[実施記録](agent-skills-consistency-execution-2026-10-23.md)を参照する。

## 対応範囲と開始点

| 項目 | 確認した状態 |
| --- | --- |
| 対象repository | `igapyon/miku-project-skills` |
| 計画作成時のbranch | `devel-tiga1022vbj` |
| レビュー時HEAD | `c0888447a79452fb1189008e5828e430bc5b4699` |
| package version | `0.12.4` |
| 同梱runtime | Java / Node.jsともに固定Release `v0.12.0` |
| 現在のCI | Node.js `[20, 24]`、Java 17、`npm ci`後に`npm run build` |
| レビュー時のローカル確認 | Node.js `v26.12.0`。既存15 files / 41 testsが成功 |
| 上記テストの制限 | repo内にnode_modulesがなく、親環境のVitest `4.0.18`で実行。lockfileのVitest `4.1.12`による確認ではない |

| 元のレビュー指摘 | 今回の扱い | 実装作業 |
| --- | --- | --- |
| 1: runtime探索がcwd依存 | 対応 | MPAS-01 |
| 2: XML取込の実行経路がない | 今回から除外 | [Issue #77](https://github.com/igapyon/miku-project-skills/issues/77)で別途追跡 |
| 3: 操作一覧とhelper登録の不一致 | 対応 | MPAS-02 |
| 4: 環境制約をユーザー希望で上書き | 対応 | MPAS-03 |
| 5: runtime能力表が古い | 対応 | MPAS-04 |
| 6: 設置名・配布物内参照の不一致 | 対応 | MPAS-05 |

Issue #77の解決に必要なXML import実装、独自converter、上流repositoryの変更、runtime差し替え、XML対応方針の変更は今回に含めない。操作一覧を補完する際も、存在しない`import xml`やMCP toolを実行可能として登録しない。

製品の変換処理は引き続き上流runtimeが担当する。新しいbackend runnerやMCP serverをこの作業で作らない。package/runtime version、公開asset名、checksum形式、Node/Javaの最低対応版、MCPのlegacy識別子を移行する作業も対象外とする。

## 実行順

`MPAS-00 → MPAS-01 → MPAS-02 → MPAS-03 → MPAS-04 → MPAS-05 → MPAS-06`

実装は上記の順に行い、各変更後にfocused検証を実行した。以下のコード名・値・対応表は実装判断を固定するために使った。

## MPAS-00: 作業前提と依存関係を固定する

対象: repository全体の読み取りと、実装時の依存関係準備。

1. `git status --short --branch`、`git rev-parse HEAD`を記録する。開始時点の利用者変更と今回の変更を区別し、無関係な差分を戻さない。
2. `README.md`、`TODO.md`、本計画、`SKILL.md`、対象helperと既存テストを読む。実装時に適用される`AGENTS.md`があれば従う。
3. `node --version`、`npm --version`、`java -version`を記録する。
4. repository rootで`npm ci`を実行する。lockfileを書き換えたり、親directoryのVitestを実装の正式なローカル結果として代用したりしない。
5. `npm ls vitest --depth=0`でrepo内の依存関係を確認し、`npm test`を一度実行して実装前のbaselineを取る。
6. 固定runtimeの由来は`references/runtime/artifact-provenance.md`で確認する。今回`npm run update:runtime`は不要である。

完了条件: repo内のlockfileに対応するテスト環境が用意され、baselineと開始時の差分が記録されている。依存関係の取得やJava実行ができない場合は制限を具体的に記録し、成功した扱いにしない。

## MPAS-01: インストール先を基準にruntimeを解決する

対象:

- `skills/igapyon-miku-project/lib/runtime-artifacts.mjs`
- `skills/igapyon-miku-project/lib/backend-operations.mjs`
- `skills/igapyon-miku-project/SKILL.md`
- `skills/igapyon-miku-project/references/runtime/operations-map.md`
- `skills/igapyon-miku-project/references/runtime/upstream-map.md`
- `skills/igapyon-miku-project/references/`内のCLI例
- `tests/miku-project-bundle-smoke.test.js`
- 新規`tests/miku-project-runtime-artifacts.test.js`

変更手順:

1. `DEFAULT_RUNTIME_ROOT`を、helper moduleの場所から求めた絶対pathにする。`fileURLToPath(new URL("../runtime/", import.meta.url))`を使えば、repoコピーとインストール後のコピーの両方で、それぞれ自身のruntimeを指せる。
2. `runtimeRoot`を明示する既存APIは残す。明示された相対pathは呼出し側cwdを基準に`path.resolve`し、返すartifact pathは既定・明示のどちらでも絶対pathにする。
3. Java / Node / 各source artifactの区別、現行のversion選択、欠落時のエラーを維持する。workspace内の同名runtimeを追加探索する処理を入れない。
4. `buildCliInvocation`の既定runtime pathが上記resolverを通ることを確認する。`javaRuntimePath` / `nodeRuntimePath`の明示指定も引き続き利用可能にする。
5. `SKILL.md`とagent向け参照では、`<skill-root>`を「読み込んだSKILL.mdが存在するdirectoryの絶対path」と定義する。インストール後のCLI例は`<skill-root>/runtime/...`にそろえる。repository rootから実行する保守用scriptのpathは、用途を明記して区別する。
6. workbook等の入力・出力pathは作業workspaceを基準にする。runtimeのpath修正に巻き込んで、WBS出力をインストール済みSkill内へ向けない。

必要な回帰確認:

- 明示runtimeRootから4種類のartifactを正しく選べること。runtimeとsourcesを取り違えないこと。
- 引数なしのresolverと`buildCliInvocation({ operation: "spec" })`が、別のcwdからも動くこと。
- 配布ZIPを一時directoryへ展開し、**展開したlib**を別のworkspaceの子processからimportして確認すること。source repoのhelperへ差し替えて検証しない。
- 別workspaceに、より新しいversion名の偽runtimeを置いても選ばないこと。
- 空白または日本語を含む設置pathで、Java / Node双方のargvと実行が成立すること。
- 展開したruntimeで`--version`に加えて小さな`state from-draft`と`state summarize`を実行し、成果物が作業workspaceにだけできること。

Vitest worker全体の`process.chdir()`は使わず、子processの`cwd`を指定して確認する。ZIP buildは既存bundle smoke内で一度だけ行い、別テストfileから同じbundle出力を同時に作り直さない。

focused確認: `./node_modules/.bin/vitest run tests/miku-project-runtime-artifacts.test.js tests/miku-project-bundle-smoke.test.js tests/miku-project-backend-operations.test.js`

完了条件: repository、展開済みSkill、別workspaceの3つを分離しても既定resolverが正しい同梱runtimeを返す。

## MPAS-02: 実行可能な操作をregistryへそろえる

対象:

- `skills/igapyon-miku-project/lib/backend-operations.mjs`
- `skills/igapyon-miku-project/lib/backend-policy.mjs`のcapability参照部分
- `tests/miku-project-backend-operations.test.js`
- `tests/miku-project-backend-policy-selector.test.js`
- `skills/igapyon-miku-project/references/runtime/operations-map.md`

以下を今回の対応表とする。MCP欄はrepositoryが現在表現しているcontractであり、任意の接続先serverの実在確認を意味しない。

| Agent operation | CLI command | Java | Node | MCP tool |
| --- | --- | --- | --- | --- |
| `spec` | `ai spec` | 可 | 可 | `mikuproject_ai_spec` |
| `draft` | `state from-draft` | 可 | 可 | `mikuproject_state_from_draft` |
| `patch` | `state apply-patch` | 可 | 可 | `mikuproject_state_apply_patch` |
| `workbook-export` | `export workbook-json` | 可 | 可 | `mikuproject_export_workbook_json` |
| `workbook` | `workbook-export`のalias | 可 | 可 | 同上 |
| `project-overview` | `ai export project-overview` | 可 | 可 | `mikuproject_ai_export_project_overview` |
| `task-edit` | `ai export task-edit` | 可 | 可 | `mikuproject_ai_export_task_edit` |
| `phase-detail` | `ai export phase-detail` | 可 | 可 | `mikuproject_ai_export_phase_detail` |
| `patch-validate` | `ai validate-patch` | 可 | 可 | `mikuproject_ai_validate_patch` |
| `state-diff` | `state diff` | 可 | 可 | `mikuproject_state_diff` |
| `state-summarize` | `state summarize` | 可 | 可 | `mikuproject_state_summarize` |
| `detect-kind` | `ai detect-kind` | 可 | 可 | `mikuproject_ai_detect_kind` |
| `xml-export` | `export xml` | 可 | 可 | `mikuproject_export_xml` |
| `xlsx-import` | `import xlsx` | 可 | 可 | `mikuproject_import_xlsx` |
| `xlsx-export` | `export xlsx` | 可 | 可 | `mikuproject_export_xlsx` |
| `xlsx-merge-import` | `merge xlsx` | 可 | 不可 | 未提供 |
| `workbook-import` | `state import` | 可 | 不可 | 未提供 |
| `workbook-merge-import` | `state merge` | 可 | 不可 | 未提供 |
| `wbs-markdown-export` | `report wbs-markdown` | 可 | 可 | `mikuproject_report_wbs_markdown` |
| `mermaid-export` | `report mermaid` | 可 | 可 | `mikuproject_report_mermaid` |
| `wbs-xlsx-export` | `report wbs-xlsx` | 可 | 可 | `mikuproject_report_wbs_xlsx` |
| `daily-svg-export` | `report daily-svg` | 可 | 可 | `mikuproject_report_daily_svg` |
| `weekly-svg-export` | `report weekly-svg` | 可 | 可 | `mikuproject_report_weekly_svg` |
| `monthly-calendar-svg-export` | `report monthly-calendar-svg` | 可 | 可 | `mikuproject_report_monthly_calendar_svg` |
| `all-report-export` | `report all` | 可 | 可 | `mikuproject_report_all` |

`xml-import`はこの表の補完対象から除外する。文書とのcoverage確認では、Issue #77を理由にした**この1操作だけの除外**を明示する。汎用的にimport操作を検査対象外にしたり、架空の実装を登録してcoverageだけ通したりしない。

変更手順:

1. 既存operation名とexported helper名を維持し、上表の不足分をregistryに追加する。`workbook`はaliasとして一箇所で正規化し、selectorとCLI builderの両方で使えるようにする。
2. 既存`operationCapabilities`の`{ cli: boolean, mcp: boolean }`形式を保つ。Java / Nodeの対応差はregistryへ追加のruntime対応情報として持たせ、builderは未対応runtimeを**artifact探索前に**明確に拒否する。
3. MCP未提供の操作は`mcpTool: null`とする。`mcp-only`では`mcp_not_supported`となり、CLIへfallbackしないことを確認する。
4. CLI builderをoperation別の引数に対応させる。共通の`--in` / `--out` / `--state`だけで全操作を生成しない。
5. 入力が必要な操作は`inputPath`、Patch適用・検証とmergeは`statePath`を要求する。ファイル生成操作は明示`outputPath`を使う。
6. `state-diff`は`beforePath` / `afterPath`から`--before` / `--after`を作り、`--in`へ置き換えない。`patch-validate`は`--state` / `--in`を使い、出力fileを必須にしない。
7. projectionでは`taskUid` / `phaseUid` / `select` / `mode` / `rootTaskUid` / `maxDepth`を、該当commandだけのnamed optionとして扱う。`0`などの有効値をtruthy判定で落とさない。
8. argvは配列で返す。helper自身はprocess実行、tool探索、MCP呼出しを行わない。
9. MCP tool名は上表のlegacy名を保つ。新規operationのinline入力やartifact roleは`operations-map.md`に明記された範囲だけをmirrorする。validation/diff等の返却roleが文書から確定できない場合は、自動抽出metadataを未設定にして、tool名の対応と返却schemaの検証済み範囲を区別する。実在しないroleやschemaを補完しない。

必要な回帰確認:

- 上表の全operationについてselectorが`unknown_operation`にならないこと。
- aliasが元operationと同じCLI / MCP対応を返すこと。
- `project-overview → task-edit / phase-detail → patch-validate → patch → state-diff`の各argvを生成できること。
- `state-diff`の2入力、Patchのbase不足、Java専用操作をNodeへ指定する場合に、正しい成功・失敗となること。
- Java専用3操作で`mcp-only`がfallbackせず停止すること。
- 既存MCP artifact抽出の回帰を保ち、配列の先頭ではなくroleでprimary outputを選ぶこと。

focused確認: `./node_modules/.bin/vitest run tests/miku-project-backend-operations.test.js tests/miku-project-backend-policy-selector.test.js`

完了条件: 対応済み操作の文書・selector・CLI builderが同じ範囲を表し、runtime差分とMCP未対応が明示されている。

## MPAS-03: 環境の必須制約と希望順位を分ける

対象:

- `skills/igapyon-miku-project/lib/backend-policy.mjs`
- `skills/igapyon-miku-project/config/backend-policy.json`
- `skills/igapyon-miku-project/SKILL.md`
- `skills/igapyon-miku-project/references/workflow/active-workflow-rules.md`
- `docs/agent-skill-design.md`、`docs/quickstart.md`、`docs/development.md`
- `tests/miku-project-backend-policy-config.test.js`
- `tests/miku-project-backend-policy-selector.test.js`

この修正では次の意味に固定する。

- 環境の`cli-only`はCLIだけを許可する制約、`mcp-only`はMCPだけを許可する制約、`handoff-only`はbackend実行を許可しない制約。
- 環境の`cli-preferred` / `mcp-preferred`は両backendを許可する既定の希望順位。利用者は、その許可範囲内で別の希望を指定できる。
- 利用者の`handoff-only`はbackendを実行しない選択なので、CLI/MCPを許可する環境でも選べる。
- 対立するstrict要求は自動で別方式へ変更しない。`backend_policy_conflict`として処理前に停止する。

| 環境policy | 利用者policy | 結果 |
| --- | --- | --- |
| 未指定 | 未指定 | skill設定、次にrepo defaultを使う |
| 未指定 | 任意の有効policy | 利用者指定 |
| `cli-only` | 未指定 / `cli-only` / どちらかの`*-preferred` | `cli-only` |
| `cli-only` | `mcp-only` | conflict |
| `mcp-only` | 未指定 / `mcp-only` / どちらかの`*-preferred` | `mcp-only` |
| `mcp-only` | `cli-only` | conflict |
| `cli-only` / `mcp-only` | `handoff-only` | `handoff-only` |
| `handoff-only` | 未指定 / `handoff-only` | `handoff-only` |
| `handoff-only` | backend実行を選ぶ他の4policy | conflict |
| どちらかの`*-preferred` | 未指定 | 環境の希望順位 |
| どちらかの`*-preferred` | 任意の有効policy | 利用者指定 |

変更手順:

1. `resolveBackendPolicy`は正常時にpolicy文字列を返す既存APIを維持する。環境のstrict制約を先に確認し、上表の有効policyを返す。
2. conflictは`Error`に`code: "backend_policy_conflict"`、要求policy、環境policyを付けてthrowする。既存の不正policy検出とは区別する。
3. 両方が与えられた場合、採用されなかった値も有効なpolicyか検査する。不正な環境policyを利用者指定で隠さない。
4. JSONの現行`precedence`は「環境制約の適用後に希望を選ぶ順序」と明記する。`precedence_scope`と`environment_constraints`を追加のmirror情報として持たせ、strict環境の許可backendを記録する。既存schema_version 1と既存項目は維持する。
5. JSONの説明だけ変更してcodeを旧動作に残さない。Markdown、JSON、helperとテストで同じ表を表す。
6. 選択不可のbackendを実行したり探索したりしない。環境制約による選択を「そのbackendで実行して失敗した」という架空のfallback結果にしない。
7. 既存テストの「環境cli-onlyでも利用者mcp-onlyが勝つ」という期待値をconflictへ変更する。

必要な回帰確認:

- 環境・利用者の各5policyと未指定を組み合わせ、上表の結果になること。
- 環境`mcp-only` / 利用者`cli-only`、および逆方向が処理前にconflictとなること。
- handoffではbackend候補の探索・実行が発生しないこと。
- 環境制約がない場合の既存defaultとpreferred fallbackを壊さないこと。
- registryにあるCLI専用operationと環境`mcp-only`の組合せが停止すること。

focused確認: `./node_modules/.bin/vitest run tests/miku-project-backend-policy-config.test.js tests/miku-project-backend-policy-selector.test.js tests/miku-project-backend-operations.test.js`

完了条件: user-requestは環境の必須制約を解除できず、相反するstrict指定は選択段階で失敗する。

## MPAS-04: 同梱0.12.0の能力表と説明を同期する

対象:

- `skills/igapyon-miku-project/references/runtime/operations-map.md`
- `skills/igapyon-miku-project/references/runtime/upstream-map.md`
- `skills/igapyon-miku-project/references/io/xlsx-import-export.md`
- `docs/file-import-export.md`、`docs/development.md`
- `docs/upstream-miku-project-ai-era-cli-contract-request.md`
- `skills/igapyon-miku-project/references/runtime/help-compatibility.json`
- `tests/miku-project-phase-b-smoke.test.js`
- `tests/miku-project-runtime-help-compatibility.test.js`

変更手順:

1. 同梱Java / Nodeの`--help`と`--version`を読み、MPAS-02の対応表と照合する。レビューではNode `import xlsx`の実行成功を確認済みである。
2. Nodeの構造XLSX replace importを対応済みとして上記の能力表・CLI例へ反映する。`merge xlsx`はJava専用のままとし、構造XLSXとreport用WBS XLSXを混同しない。
3. `operations-map.md`の「current 0.8.3.3」を現行の記述へ直す。Node / Javaの両方に同じhelp説明が実装されたと断定せず、実際に確認できたroot helpとcommand別helpの範囲を区別する。
4. 過去のupstream依頼のversion・確認日を単純置換しない。現在のartifactに関する短い追記で、既に改善したNode側と残る未確認・Java側の範囲を説明する。根拠なく依頼全体を完了扱いにしない。
5. `help-compatibility.json`の共有commandに`import xlsx`を加える。Node / Javaのartifact versionは`0.12.0`のままでよい。
6. `docs/development.md`内で同じruntime運用に関わる古い説明も訂正する。現行`update-miku-project-runtime.sh`は固定ReleaseをdownloadしてSHA-256を照合する。develのclone/buildや`MIKUPROJECT_REF` / `MIKUPROJECT_RUNTIME_VERSION`で変更できるという現在と異なる説明は、現行手順から外す。scriptと固定artifactは変更しない。
7. XML importに関する能力判定・手順の修正はIssue #77へ残す。

必要な回帰確認:

- 小さなdraftから一つのworkbook JSONを作り、Node runtimeのXLSX export/importとJava runtimeのXLSX export/importを既存phase-B smokeへ追加する。
- 成功exitだけでなく`mikuproject_workbook_json`のkind、project名、task UID / name、少なくとも1件の依存を確認する。
- 各runtimeで依存が保たれることを確認する。Nodeが生成したXLSXをJavaが読む場合には依存が欠落する事象を確認したため、異runtime間の交換はこの実装範囲で受入済みとしない。実施記録に残す。XML importのテストは今回追加しない。
- root helpの共通commandが実際のartifactに存在することを確認する。

focused確認: `./node_modules/.bin/vitest run tests/miku-project-phase-b-smoke.test.js tests/miku-project-runtime-help-compatibility.test.js tests/miku-project-backend-operations.test.js`

完了条件: NodeのXLSX importについて、実装・registry・agent向け参照・開発者文書・回帰確認がそろっている。

## MPAS-05: 設置名と配布物内の参照を修正する

対象:

- `docs/skill-installation.md`、`docs/quickstart.md`、`docs/development.md`
- `skills/igapyon-miku-project/references/runtime/operations-map.md`
- `tests/miku-project-naming-contract.test.js`
- `tests/miku-project-bundle-smoke.test.js`
- 新規`tests/miku-project-reference-integrity.test.js`

変更手順:

1. 次の3つを明確に区別する: repository/package名`miku-project-skills`、installed Skill名・directory名`igapyon-miku-project`、表示名・会話trigger`miku-project`。
2. 設置手順とquickstartのすべての構成図を、実際のZIP内`skills/igapyon-miku-project/`に合わせる。表示名まで一律に`igapyon-miku-project`へ置換しない。
3. `<installed-skills-root>`を「各Skill directoryを置く親directory」と定義し、ZIP内の`skills/igapyon-miku-project/`をその下の`igapyon-miku-project/`へコピーする例にする。曖昧なskill homeの解釈で`skills/skills/`を作らせない。
4. `operations-map.md`からrepository直下docsへの相対リンクを、canonical repositoryの対象文書へのHTTPSリンクに置き換える。上流依頼を読む目的で使うリンクと分かる文言にする。リンク先を成立させるためだけに開発用docs全体をbundleへ追加しない。
5. `docs/development.md`にある存在しない`upstream-mikuproject-mcp-tool-surface-note.md`へのリンクを、実在する`upstream-miku-project-mcp-tool-surface-note.md`へ直す。文書内容内の意図的legacy MCP識別子は維持する。
6. sourceと展開済みSkill内のローカルMarkdownリンクを確認するテストを追加する。相対file / directoryが存在すること、配布Skillの参照がZIP外へ出ないことを検証する。外部HTTPSリンクの到達確認をテストのnetwork前提にしない。
7. 同じZIPを扱う確認は既存bundle smokeにまとめる。新しいtest fileが同じbundle directoryを並列に再生成する構造を避ける。

focused確認: `./node_modules/.bin/vitest run tests/miku-project-naming-contract.test.js tests/miku-project-reference-integrity.test.js tests/miku-project-bundle-smoke.test.js`

完了条件: 利用者向けの設置図と実際の配布名が一致し、配布後のローカル参照がSkill内で解決できる。開発docsの既知のfileリンク切れも解消している。

## MPAS-06: 最終確認と実施記録

1. 各作業のfocused確認が通った後、repository rootで`npm run build`を一度実行する。全suiteと最終ZIPをまとめて確認するため、この時点で再実行する。
2. MPAS-01の別cwd・展開済みhelper確認が含まれていることを確認する。単にruntimeの絶対pathをテスト側から渡して成功した結果で代替しない。
3. `git diff --check`、`git status --short`、関連diffを確認する。
4. `runtime/`の4artifact、固定digest、package / lockfile、CI matrix、公開asset名に意図しない変更がないことを確認する。
5. 受入結果を`docs/agent-skills-consistency-execution-2026-10-23.md`へ記録し、TODOの対応項目を更新する。実施日が別日なら実施日をファイル名・本文に反映する。
6. 実施記録には開始・終了commit/branch、変更file、各taskの結果、実際のNode/Java/Vitest、実行したcommand、失敗・未実施項目、Issue #77が残ることを書く。

ローカルは利用可能なNode版で検証してよい。Node各版の正式な確認先はGitHub Actionsとし、ローカルにmatrixの全Node版を追加することを完了の条件にしない。この計画で既存CIの対応下限を変更しない。Actionsが実行されていない時点ではmatrix成功を報告しない。

MCP実server接続の検証環境がない場合、registry / policy / content抽出のローカル確認と、実serverでの未検証を区別する。未提供toolの創作や、strict policyを外すことで確認を通さない。

実装後のcommit、push、PR、Release、ローカルSkillへの配備は、それぞれ利用者が依頼する後続操作で扱う。

## 完了判定チェックリスト

- [x] MPAS-00: lockfileを使うローカル依存関係とbaselineを記録した。
- [x] MPAS-01: 展開したSkillのhelperが別workspaceから同梱runtimeを解決・実行できる。
- [x] MPAS-02: 対応済みoperationのregistry / selector / argvがそろい、runtime・MCPの未対応を正しく返す。
- [x] MPAS-03: 環境のstrict制約を利用者指定で解除できず、衝突時は処理前に失敗する。
- [x] MPAS-04: 同梱0.12.0の能力表とNode XLSX importの実行結果が一致する。Java/Node間でのXLSX交換は実施記録のとおり未受入。
- [x] MPAS-05: 設置名がcanonical名にそろい、source・配布物内のローカル参照が解決する。
- [x] MPAS-06: 全体build、差分確認、実施記録が完了した。
- [x] Issue #77のXML importは今回実装しておらず、未解決として残した。

## 実装結果

実装・検証の記録は[agent-skills-consistency-execution-2026-10-23.md](agent-skills-consistency-execution-2026-10-23.md)にまとめた。Git commit / push / PR / Releaseは行っていない。
