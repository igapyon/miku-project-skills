---
title: Node.js / Java runtime v1.1.2取り込み計画
description: 固定Releaseの4 assetを取り込み、既存CLIの互換性、XLSX交換、provenanceと配布物を確認する実装手順。
status: implemented-local-pending-ci
created: 2026-10-23
updated: 2026-10-23
---

# Node.js / Java runtime v1.1.2取り込み計画

利用者の「対応を計画して。実装はまだ」に基づき作成し、後続の「実装して」の指示を受けて実施した計画。実施内容・結果は[実施記録](runtime-v1.1.2-intake-execution-2026-10-23.md)を参照する。ローカル実装・検証は完了し、Node.js 20 / 24のGitHub Actions結果が未確認のため、その受入だけ保留中。

## 1. 目的と対象範囲

同梱Node.js / Java CLI runtimeを、それぞれの公開Release `v0.12.0`から`v1.1.2`へ更新する。Skillの既存operationと会話境界を保ち、公開assetの由来と実行互換性を確認した配布ZIPを作る。

| 項目 | 計画作成時の状態 / 実装時の方針 |
| --- | --- |
| repository | `igapyon/miku-project-skills` |
| branch / HEAD | `devel-tiga1023hee` / `d419a2300b879561c01c5c1be48a1ab19c6deaa8` |
| 開始時のworktree | 計画作成時はclean。実装開始時は計画 / version関連の既存変更があり、保持した |
| Skill package version | 計画作成時は`0.12.4`。実施ではmiku-softの近似追従方針に沿って`1.1.2`を採用した |
| Node.js / Java runtime | 両方`0.12.0` → 両方`1.1.2` |
| installable Skill | `skills/igapyon-miku-project/` |
| 対応Node.js | 現在の`>=20`を維持する計画。20で動かない場合は受入を止める |
| CI | Node.js 20 / 24、Java 17、`npm ci` → `npm run build` |
| ローカルとCIの役割 | ローカルのNode版が異なっても確認を進める。対応版20 / 24の最終保証は既存GitHub Actionsの結果で行う |

取り込み対象は公開済みの単体CLIと、そのsourcesの計4 assetである。Nodeのbrowser runtimeと、新しいv1 workflowの内部reference candidateは対象にしない。製品versionが`1.1.2`であることを、新v1 workflowの公開・Skill対応が完了した意味として扱わない。

既存の`project_draft_view`、`patch_json`、`mikuproject_workbook_json`、projection、CLI/MCP/handoff policyを維持する。新operation、新しいMCP tool、汎用backend runner、製品の変換処理は追加しない。追加されたCLIの任意`--out`をSkill helperへ新たに公開する機能拡張も別作業とし、今回は直接CLIでの互換性確認と記録を行う。

[Issue #77](https://github.com/igapyon/miku-project-skills/issues/77)のXML import実行経路不足は対象外のままとする。新runtimeのhelpにも直接の`import xml`は見当たらず、runtime更新だけで解決済みにしない。

## 2. 既に得られている証拠と未確認事項

- 2026-10-23に固定tagのGitHub Release metadataを確認した。Node Releaseは`2026-10-22T23:03:50Z`、Java Releaseは`2026-10-22T23:04:42Z`に公開され、どちらもdraft / prereleaseではない。Release本文は版番号のみ。
- 一時領域へ取得した新CLIのMJS / JARは、下表のSHA-256と一致した。両方の`--version`は`miku-project 1.1.2`、`--help`はexit 0だった。これはCLIの起動確認であり、全workflowの互換性確認ではない。
- sourcesの2 assetはRelease metadataの名前・サイズ・digestを確認済みだが、実ファイルの照合は実装時に行う。
- 新helpには`ai spec`、`ai detect-kind`、`ai validate-patch`、`state diff`の`--out`、phase-detailの`--max-depth`範囲0〜100が現れる。Nodeの`report.json`とJavaの`validation.txt`はhelp内の出力名例であり、実際の出力形式に差があるとはまだ断定しない。
- Nodeの固定tagの[README](https://github.com/igapyon/miku-project/blob/v1.1.2/README.md)は、既存CLIを維持して新v1 workflowを別に開発する方針と、内部reference candidateと通常Releaseの違いを説明している。固定tagのNode `package.json`には`engines.node`宣言がなく、最低対応版はそこから確定できない。Javaの固定tag POMはsource / target 1.8だが、Skill側で今回確認するJava実行環境は17とする。
- 現行版の直前の全体検証結果は17 files / 53 tests passedである。ただしこれは[前回の実施記録](agent-skills-consistency-execution-2026-10-23.md)であり、今回の計画作成時に再実行した結果ではない。
- 計画作成時に参照した前回記録では「Nodeが生成したXLSXをJavaでimportするとPredecessorsが空になる」と報告されていた。実装時に旧`0.12.0` artifactと新`1.1.2`を同一fixtureで比較し、この差は`1.1.2`で解消していることを確認した。`1.1.2`では全4経路で依存を保持する一方、import後の日付時刻文字列の表記はNodeとJavaで異なる。

## 3. 固定する4 asset

Nodeの取得元は[Node Release v1.1.2](https://github.com/igapyon/miku-project/releases/tag/v1.1.2)、Javaの取得元は[Java Release v1.1.2](https://github.com/igapyon/miku-project-java/releases/tag/v1.1.2)。実装時も`latest`や移動するbranchを取得元にしない。

| 種類 | repository | asset | bytes | SHA-256 |
| --- | --- | --- | --- | --- |
| Node CLI | `igapyon/miku-project` | `miku-project-1.1.2.mjs` | 2798497 | `fac633d60560cf332d7cf3aeb64f8df6d50389b1d506d7e7b7626027e8e45f17` |
| Node sources | `igapyon/miku-project` | `miku-project-sources-1.1.2.tgz` | 1104662 | `9a1262431cc5f15a0f9b4d9b9d222c104271affa4572a443bd0514cdf0c9f89c` |
| Java CLI | `igapyon/miku-project-java` | `miku-project-1.1.2.jar` | 516447 | `99933cfd85b09ff3dbfba61e0849268a64aca946d24085a1b47164cf86560292` |
| Java sources | `igapyon/miku-project-java` | `miku-project-sources-1.1.2.jar` | 214304 | `4bf8784013fe84883612ffeadae2e5d1fa894a45613a0ba14ef6c427de99bda5` |

固定URLは各repositoryの`https://github.com/<owner>/<repo>/releases/download/v1.1.2/<asset>`とする。Nodeの[公開SHA256SUMS](https://github.com/igapyon/miku-project/releases/download/v1.1.2/miku-project-SHA256SUMS-1.1.2.txt)とGitHub APIのasset digestを参考証拠に使い、実ファイルは上表の固定値と照合する。不一致を自動で新しい値へ更新して通さない。

`miku-project-runtime-1.1.2.mjs`と`miku-project-runtime-1.1.2.json`はbrowser runtime用であり、CLI assetの代用品にしない。SHA256SUMSや調査用metadataもruntime directoryへの同梱対象に増やさない。

## 4. 実行順と作業分解

`R112-00 → R112-01 → R112-02 → R112-03 → R112-04 → R112-05 → R112-06`

### R112-00: 開始状態と0.12.0 baselineを保存する

対象: repository状態、依存関係、既存runtimeの読み取り。

1. `README.md`、`TODO.md`、本計画、[開発メモ](development.md)、[provenance](../skills/igapyon-miku-project/references/runtime/artifact-provenance.md)、既存テストを読む。実装時の`AGENTS.md`があれば従う。
2. `git status --short --branch`と`git rev-parse HEAD`を記録する。利用者の既存変更を保存し、無関係な変更を戻さない。
3. `node --version`、`npm --version`、`java -version`を記録する。rootで`npm ci`を行い、`npm ls vitest --depth=0`でrepo内のVitestを使うことを確認する。親directoryの依存関係を正式な結果として代用しない。
4. `npm test`を一度実行し、更新前のbaselineを得る。失敗している場合は、更新による失敗と区別できるまで先に原因を整理する。
5. `workplace/runtime-v1.1.2-intake/`を調査用に使い、旧4 assetのコピーとSHA-256、両runtimeの`--version` / `--help` / `ai spec`のexit status・stdout・stderrを保存する。証拠を`runtime/`に置かない。

完了条件: 開始時の差分、旧artifactの由来、実行環境、baselineが記録されている。旧4 assetのbackupは以後の比較と復旧に使える。

### R112-01: 固定pinを更新し、新4 assetを取り込む

変更対象:

- [scripts/update-miku-project-runtime.sh](../scripts/update-miku-project-runtime.sh)
- `skills/igapyon-miku-project/runtime/`の旧4ファイルと新4ファイル
- [artifact-provenance.md](../skills/igapyon-miku-project/references/runtime/artifact-provenance.md)

手順:

1. updaterの`node_tag` / `java_tag`を`v1.1.2`へ、4つのartifact名と4つのexpected digestを第3節の値へ変更する。固定pin方式と、tempへのdownload → checksum確認 →配置の順序を維持する。環境変数や`latest`でpinを上書きする経路を追加しない。
2. provenanceの4行を同じrepository / tag / asset / digestへ更新し、確認日を実装日にする。sourcesにも独立したdigestを書く。
3. rootで`npm run update:runtime`を実行する。scriptは新4 assetのhash確認と両CLIの`ai spec` / `--version`を行う。
4. 新4 assetのサイズとSHA-256を再照合する。source archiveが空でなく、CLIの代わりにsourcesやbrowser runtimeを取得していないことを確認する。上流sourceのclone / buildで公開Release assetを作り直さない。
5. 新4 assetがすべて揃い、上記確認が成功した後に、旧`miku-project-0.12.0.jar` / `.mjs`と旧`miku-project-sources-0.12.0.jar` / `.tgz`の4 pathだけを削除する。wildcardでruntime directory全体を消さない。
6. updaterは旧版を自動削除せず、途中まで新ファイルを配置する可能性がある点に注意する。途中失敗時は旧4 assetを保持し、混在状態でresolverやbundleを受入確認に使わない。実装開始時に存在せず、この作業が作った新1.1.2 pathだけを特定して復旧する。既存ファイルが新pathにあった場合は上書き前に差分を確認する。

完了条件: `runtime/`は新4 assetだけであり、4個とも固定値に一致する。updaterとprovenanceのpinが一致する。

### R112-02: version・provenance・helpの回帰確認を合わせる

変更対象:

- [help-compatibility.json](../skills/igapyon-miku-project/references/runtime/help-compatibility.json)
- [runtime-help-compatibility.test.js](../tests/miku-project-runtime-help-compatibility.test.js)
- [naming-contract.test.js](../tests/miku-project-naming-contract.test.js)
- [runtime-artifacts.test.js](../tests/miku-project-runtime-artifacts.test.js)
- 新規`tests/miku-project-runtime-provenance.test.js`

手順:

1. fixtureのNode / Java artifact versionを`1.1.2`へ変更し、`documented-similarity`を維持する。`knownLimitations`は新しく観測した事実に合わせる。
2. naming testの4実ファイル名と、resolver testの実配布物を指す期待値を1.1.2へ更新する。resolverの一般的なversion比較を試す偽fixtureの`0.9.9` / `0.10.0`などは置換しない。
3. provenance testを追加し、Markdown表の4行を読み、各assetが実在し、その実バイトのSHA-256が表と一致することを確認する。test内へdigestをもう一組コピーしない。既存naming testと合わせて余分な旧版・browser runtimeの混入を検出する。
4. help testでexit 0、UTF-8としての出力、末尾改行、通常のhelpでstderrが空であることを確認する。`--version`の出力もfixtureのversionと照合する。単にversion文字列が正規表現に合うだけにしない。
5. 共通command一覧を全体へ広げる。AI spec / overview / task-edit / phase-detail / bundle / detect-kind / validate-patch、state from-draft / apply-patch / summarize / diff、XLSX import、workbook-json / XML / XLSX export、既存7 reportを含める。
6. Java-onlyとして既存のstate validate / import / merge、validate xml / xlsx、merge xlsx、report dirを確認する。Node側に存在しない操作を共通一覧へ加えない。
7. 追加された`--out`等は、対応commandのUsage行に属するoptionとして確認する。必要ならfixtureに`sharedOptionsByCommand` mapを追加し、commandごとに該当行を特定して検査する。他commandの`--out`を見つけただけで成功にしない。Node / JavaのUsage全体のbyte equalityや出力ファイル名例の一致は要求しない。

focused確認:

```bash
./node_modules/.bin/vitest run tests/miku-project-runtime-artifacts.test.js tests/miku-project-runtime-provenance.test.js tests/miku-project-runtime-help-compatibility.test.js tests/miku-project-naming-contract.test.js
```

完了条件: version・ファイル名・provenance・共通helpとruntime差が一致し、単なる期待versionの書換えで実バイト確認を省略していない。

### R112-03: 既存Skill workflowと新CLIの実行互換性を確認する

主な変更対象: [core-api-smoke.test.js](../tests/miku-project-core-api-smoke.test.js)、必要な場合だけ[backend-operations.mjs](../skills/igapyon-miku-project/lib/backend-operations.mjs)とその[テスト](../tests/miku-project-backend-operations.test.js)。

手順:

1. 保存した旧`ai spec`と新`ai spec`を比較し、既存document kind、field、patch操作、stdout契約の変更を整理する。heading一致だけで互換としない。AI specに合わせる必要がある場合は、Skill-localの該当prompt / workflow参照を特定する。
2. core smokeの既存2-task draft（milestone、task dependency、日付あり）を再利用し、Node / Javaのそれぞれでdraft → workbook → overview / task-edit / phase-detail / AI bundle → summaryを実行する。返るdocument kindとproject / taskの意味を確認する。
3. 実際のprojectionで得たtask UIDと新`ai spec`のPatch JSON形式を使い、leaf task名を`update_task`で変更する小さなpatch fixtureを作る。仮UIDが正規化後も不変だと仮定しない。両runtimeでvalidate → apply → diffを実行し、変更したtask名、変更していない日付・依存関係、元stateが変更されていないことを確認する。
4. 生のCLI argvを別に組み立てるだけでなく、既存operationは`buildCliInvocation`が返すargvで実行する。新runtimeが不適切なoptionを厳しく拒否しても、Skill helperの既存operationが動くことを確かめる。
5. `ai spec` / detect-kind / validate-patch / diffの新しい任意`--out`について、直接CLIでstdoutとfile出力の内容を確認する。validate-patchの`report.json` / `validation.txt`という名前から出力形式を推測せず、parse可能性・実内容・exit status・diagnosticsを記録する。今回のhelper APIへ任意出力先を追加する必要はない。
6. phase-detailの`--max-depth 0`と`100`を受理し、`-1` / `101`をusage errorとして扱うかを両runtimeで確認する。未知optionと存在しないinput pathを組み合わせた非破壊の呼出しでも、inputを読む前のusage error（exit 2）になることを確認する。runtimeごとのerror文言完全一致は要求しない。
7. 必要なadapter修正は既存operationを新CLIへ正しく渡す範囲にとどめる。製品意味論をSkillへ移植したり、失敗を黙って別backendへ切り替えたりしない。新v1 command treeへ既存operationを切り替えない。

focused確認:

```bash
./node_modules/.bin/vitest run tests/miku-project-core-api-smoke.test.js tests/miku-project-backend-operations.test.js tests/miku-project-backend-policy-selector.test.js tests/miku-project-backend-policy-config.test.js
```

完了条件: 既存会話workflowの意味とstrict backend policyを保って両CLIで動く。新たな製品互換性の破壊がある場合は、期待値を弱めて通さずR112-06の停止条件へ進む。

### R112-04: XLSX交換とreportを確認する

変更対象: [phase-b-smoke.test.js](../tests/miku-project-phase-b-smoke.test.js)、必要な場合だけ[XLSX入出力参照](../skills/igapyon-miku-project/references/io/xlsx-import-export.md)。既存[phase-c-smoke.test.js](../tests/miku-project-phase-c-smoke.test.js)も実行する。

1. 既存のNode→NodeとJava→Javaの構造XLSX roundtripを新runtimeで通す。project名、task名、日付、milestone、dependencyの保持を確認する。UID等の正規化による差と、情報欠落を区別する。
2. 同じfixtureでNode→JavaとJava→Nodeの交換も調べ、4組の結果を実施記録に表で残す。特に既知のNode→Javaの`Predecessors`欠落を確認する。report用WBS XLSXと構造交換用XLSXを混同しない。
3. 既知差が解消していれば、cross-runtimeのdependency保持を通常の回帰testに追加する。残っていれば旧版でも再現することを保存したartifactで比較し、activeなXLSX参照へ制限を明記する。失われること自体を正しい製品仕様としてassertするtestは追加しない。
4. 既存の制限が同程度に残るだけなら、制限を明示したruntime更新の受入は可能とする。従来成功していたruntime内roundtripやJava→Node等に新しい欠落が出る場合は受入を止める。XLSXの全組合せがlosslessだとは記録しない。
5. XML export、workbook JSON export、既存7 reportは既存テストで実行し、形式・内容・生成物の存在を確認する。ZIP / XLSXのbyte equalityは上流が保証していない限り要求しない。

focused確認:

```bash
./node_modules/.bin/vitest run tests/miku-project-phase-b-smoke.test.js tests/miku-project-phase-c-smoke.test.js
```

完了条件: 既存の受入済み入出力に新しい退行がなく、異runtime間の既知差が解消・残存のどちらか明確になっている。upstream JAR / MJSの手修正で差を隠さない。

### R112-05: active文書、Skill package、最終ZIPを同期する

変更対象:

- [upstream-map.md](../skills/igapyon-miku-project/references/runtime/upstream-map.md)
- [operations-map.md](../skills/igapyon-miku-project/references/runtime/operations-map.md)
- [development.md](development.md)、[miku-soft-reference.md](miku-soft-reference.md)
- [naming-migration.md](naming-migration.md)、[過去のCLI help依頼](upstream-miku-project-ai-era-cli-contract-request.md)の現行版に関する注記
- `package.json` / `package-lock.json`
- [bundle-smoke.test.js](../tests/miku-project-bundle-smoke.test.js)
- `TODO.md`、本計画、実装時に作る`docs/runtime-v1.1.2-intake-execution-2026-10-23.md`（日付は実施日に合わせる）

手順:

1. activeなruntime pinとfrontmatterのversion / checked日を新artifactへそろえる。操作能力表は実測と一致させ、XML importや新v1 workflowを実行可能として増やさない。MCPの既存tool / resource契約はCLIの更新から推測して変更しない。
2. docsには公開CLIとbrowser runtime / 内部reference candidateの違い、4 asset、固定tagとdigest、更新command、今回得られた互換性と制限を記録する。
3. 完了済みの過去計画・実施記録の`0.12.0`を機械的に全置換しない。naming migrationの過去baselineも保持し、現在のpinは最新provenanceを参照する注記を加える。古いhelp依頼をtop-level helpの確認だけで全面解決済みにしない。
4. 実装時に`npm version 1.1.2 --no-git-tag-version`でSkill package versionを更新する。miku-softのAgent Skillsではpackage versionを同梱runtimeと厳密に連動させる必要はないが、近い版に追従させる運用例がある。今回はNode / Java runtimeの両方が`1.1.2`で、同版との互換性確認を含むためSkill packageも`1.1.2`とする。root packageとlockのversionが一致し、依存packageの解決結果が意図せず変わっていないことを確認する。
5. bundle smokeの実配布runtime pathを1.1.2へ変更し、展開済み4 assetのSHA-256をsource側と照合する。source側のprovenance testと組み合わせて、最終ZIPのバイトも固定assetであることを確認する。
6. ZIP中のruntime directoryに新4 basenameだけがあることを確認し、旧版、browser runtime、download tempが混入していないことを確認する。`--version`の期待値はNode / Javaとも`miku-project 1.1.2`とする。
7. 既存の日本語・空白を含む設置先 / 別workspace / 偽runtimeを使うisolated smokeを維持し、**展開済みSkillのhelperとruntime**でdraft生成とstate summaryを実行する。元repoへの参照で代用しない。
8. 生成indexは現行Skillの必須契約ではないため追加しない。新規参照の配置は既存`SKILL.md` / `references/INDEX.md`の必要な導線だけを更新する。

focused確認:

```bash
./node_modules/.bin/vitest run tests/miku-project-bundle-smoke.test.js tests/miku-project-reference-integrity.test.js tests/miku-project-naming-contract.test.js
```

完了条件: active文書、4 artifact、test fixture、package version、展開済み配布物が同期している。

### R112-06: 全体検証、記録、受入判定

1. rootで`npm run build`を一度実行する。このcommandは全testと配布ZIP生成を含むため、同じ状態で直後に`npm test`とZIP buildを全て重複実行しない。focused確認の後に最終全体確認を行い、追加変更や失敗があった部分だけ必要に応じて再確認する。
2. `bundle/miku-project-skills-1.1.2.zip`が生成され、isolated bundle smokeが通ることを確認する。bundle smoke以外のtestから同じbundle出力先を並列buildしない。
3. 実施記録に環境、4 assetの照合、実際のtest数、CLI / spec差、XLSX4組の結果、制限、package version、適用した共有標準の確認日・取得できるversion / commitを記録する。標準skillのcommitが取得できなければ、その事実を記録する。
4. ローカルがNode 20 / 24以外でも、その版での結果を記録してローカル作業を完了できる。正式な対応版の最終確認は既存CIの両jobで行う。CIをこの作業から起動せず、通常の後続SCM / 人によるPR操作後の結果を使う。結果がなければ「Node 20 / 24はCI確認待ち」と明記し、成功や全受入完了と書かない。
5. `git diff --check`、`git status --short`、最終diffを確認する。変更対象がruntime / 必要なadapter / test / docs / package versionに収まり、依存更新、公開workflow変更、ローカルSkill配備などが混ざっていないことを確認する。
6. 実装・ローカル確認が終わった項目と、CI確認待ちをTODOと本計画で区別する。実施記録へのリンクは実際にファイルを作ってから加える。

停止条件:

- 取得assetのdigestが第3節と一致しない、4 assetが揃わない、版番号が違う。
- 新runtimeで既存のdraft / patch / JSON / report等の受入済みworkflowが退行する。
- Java / Nodeでdoc kindやprimary resultの意味が食い違い、既存Skill契約を保てない。
- Node 20のCIで動かず、現在の最低対応版を維持できない。黙ってCIから20を外したり、enginesを引き上げたりしない。

停止時は、失敗command・exit status・再現入力・旧新の差を残して報告する。製品側修正が必要なら上流向けの再現情報を準備し、この作業で他repositoryの編集やIssue作成を始めない。

## 5. miku-soft標準の適用範囲

確認日: 2026-10-23。`igapyon-miku-soft-developer`の参照commitは`ee88c7ce1dab2d5dde5cf2a05acd5660bce7e98a`。適用workflowはMaintenance modeと`40-agent-skills-workflow.md`。repository conventions、固定runtime provenance、helpのdocumented similarity、最終配布物の検証を本変更に適用する。

同階層のpackageとruntime versionの例として、`miku-text-bundle-skills`は両方`1.6.0`、`miku-grep-skills`はpackage`0.10.1`・runtime`0.10.0`、`miku-indexgen-skills`はpackage`1.7.1`・runtime`1.6.2`だった（2026-10-23にローカルcheckoutを確認）。この傾向に合わせ、package versionはruntimeと別の管理値として保ちながら、おおよそ追従させる。今回はNode / Javaの双方が`1.1.2`であるため、packageも`1.1.2`とした。

既存CIはNode 20 / 24、Java 17、明示permissions、現行Action majorで構成済み。共有maintenance backlogのNode 22下限、checksum形式の一般移行、Release命名変更、共有workflow採用等は本runtime更新へ混ぜない。今回扱うのはこのrepositoryの受入先としてのruntime pinと、その消費・配布検証である。

## 6. 完了チェック

- [x] R112-00: 開始状態、lockfile依存関係、旧runtime baselineを記録した。
- [x] R112-01: 固定4 assetを1.1.2へ更新し、旧4 assetを除き、全hashを確認した。
- [x] R112-02: version / provenance / help互換性の回帰確認を更新した。
- [x] R112-03: 両runtimeで既存Skill workflow、実argv、strict optionの確認を行った。
- [x] R112-04: XLSX4組の交換結果と既存reportの互換性を記録した。
- [x] R112-05: active文書、Skill package 1.1.2、最終ZIPの内容と実バイトを同期した。
- [x] R112-06-local: `npm run build`、最終diff、実施記録を完了した。
- [ ] R112-06-ci: Node 20 / 24 + Java 17の既存CI結果を確認し、正式な受入を完了した。

この計画の実装完了に、commit、push、tag、PR作成、Release操作、installed Skillへの同期は含めない。これらは後続の明示された作業として扱う。
