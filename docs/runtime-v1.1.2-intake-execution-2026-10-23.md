---
title: Node.js / Java runtime v1.1.2取り込み実施記録
description: 同梱CLIの更新、互換性確認、XLSX交換、ローカルbuildの結果。
status: local-implementation-pending-ci
created: 2026-10-23
updated: 2026-10-23
---

# Node.js / Java runtime v1.1.2取り込み実施記録

[取り込み計画](runtime-v1.1.2-intake-plan-2026-10-23.md)に基づき、公開Releaseの固定4 assetを`0.12.0`から`1.1.2`へ更新した。Skill packageも利用者の指示どおり`1.1.2`にした。実装とローカル検証は完了。Node.js 20 / 24を使う既存GitHub Actionsの結果は未確認で、後続の通常PR workflowで確認する。

## 実行環境とbaseline

- 開始HEAD: `9ffbd56e083e23916ffe9bc9f676e70754aef60e`、branch `devel-tiga1023mba`
- 作業開始前の差分: 計画・version関連の既存変更を保持し、取り消していない。
- ローカル: Node.js `v26.12.0`、npm `11.20.0`、OpenJDK `17.0.21`
- 更新前baseline: `npm ci`成功（84 packages、0 vulnerabilities）、Vitest `4.1.12`、`npm test`で17 files / 53 tests passed。
- 旧4 assetのコピー、hash、両CLIのversion/help/spec結果: ignored調査用directory `workplace/runtime-v1.1.2-intake/`に保存した。配布物には含めない。

## 固定Release asset

updaterとprovenanceに固定tag・asset名・SHA-256を記載した。`npm run update:runtime`は取得した4ファイルをdigest確認し、両CLIの`ai spec`と`--version`を実行した。旧4ファイルは新assetを確認した後に取り除いた。

| 種類 | asset | bytes | SHA-256 |
| --- | --- | ---: | --- |
| Node CLI | `miku-project-1.1.2.mjs` | 2,798,497 | `fac633d60560cf332d7cf3aeb64f8df6d50389b1d506d7e7b7626027e8e45f17` |
| Node sources | `miku-project-sources-1.1.2.tgz` | 1,104,662 | `9a1262431cc5f15a0f9b4d9b9d222c104271affa4572a443bd0514cdf0c9f89c` |
| Java CLI | `miku-project-1.1.2.jar` | 516,447 | `99933cfd85b09ff3dbfba61e0849268a64aca946d24085a1b47164cf86560292` |
| Java sources | `miku-project-sources-1.1.2.jar` | 214,304 | `4bf8784013fe84883612ffeadae2e5d1fa894a45613a0ba14ef6c427de99bda5` |

`artifact-provenance.md`が同じ4行を管理し、provenance testはその値を実ファイルのSHA-256と比較する。Node / Javaの`--version`はいずれも`miku-project 1.1.2`。

## CLI / spec確認

- help compatibility testはexit status、UTF-8のlossless decode、末尾改行、stderr、command単位のUsage option、runtime-specific表記、versionを確認する。
- 旧`0.12.0`と新`1.1.2`の`ai spec`を保存して比較した。NodeとJavaで主要heading、既存document kind、記載されたpatch operation群は維持されている。Node specはphase-detailの`--max-depth`範囲と`update_task.percent_complete`の整数制約を追記している。Java specの内容は今回の比較ではbyte-identicalだった。
- 両runtimeで`ai spec --out`はMarkdown fileを生成しstdoutは空。`ai detect-kind --out`はkind名を含むtext fileを生成する。`state diff --out`はparse可能なJSONを生成する。
- 両runtimeの`ai validate-patch --out`は、拡張子を`.json`にしてもtext reportを出力する。success、0 warning、0 errorを確認した。Java helpの`validation.txt`例はformat contractではない。helper APIにはこの任意`--out`を追加していない。
- `--max-depth`の`0`と`100`は受理、`-1`と`101`はusage error (exit 2)。存在しないinputと未知optionの組合せもexit 2となり、inputを読み込む前に拒否する。
- 両runtimeでdraft → workbook、overview / task-edit / phase-detail / bundle、projectionから取得したUIDによるpatch validate → apply → diffを実行した。task名の更新、開始・終了日時とpredecessorの保持、元stateの不変、diffの完了状態を確認した。既存operationのCLI argvは`buildCliInvocation`経由で実行した。

## XLSX交換

二つのtask（milestoneを含む）と一つのpredecessor linkを使い、構造XLSXの4経路を比較した。project名、task名、milestoneとpredecessorが保持されることを確認した。

| Export → import | `0.12.0` predecessor | `1.1.2` predecessor |
| --- | --- | --- |
| Node → Node | `1` | `1` |
| Java → Java | `1` | `1` |
| Node → Java | 欠落（空） | `1` |
| Java → Node | `1` | `1` |

従来のNode→Java依存欠落はこのfixtureでは解消した。date-time値のJSON文字列表記はNodeが`YYYY-MM-DD HH:mm:ss`、Javaが`YYYY-MM-DDTHH:mm:ss`となるため、日時の意味を比較し文字列の完全一致は要求しない。再発防止として現在の4経路すべてでpredecessorを確認するsmoke assertionを加えた。

## Tests、build、配布物

- 追加・更新した回帰確認: core CLI workflow、XLSX四経路、provenanceとruntime help、runtime path / version、展開済みbundleのasset basenameと実byte hash。
- focused確認: core API、phase B / C、runtime artifact / provenance / help / naming、backend operations、isolated bundle smoke。
- 最終build: `npm run build`成功。18 test files / 55 tests passed。
- 生成ZIP: `bundle/miku-project-skills-1.1.2.zip`、2,175,410 bytes、SHA-256 `555e5ac026aaf224105b353ad77ce60df90ad88830ab8afaf2da27b3867f4c32`。runtime directoryはversion付き4 assetだけを含み、ZIP展開後の各asset byteがsourceと同じことをbundle smokeで確認した。
- GitHub Actions Node.js 20 / 24 + Java 17: **未実行・確認待ち**。ローカルはNode.js 26.12.0である。対応versionの正式確認は後続の既存workflowで行う。

## 適用したmiku-soft標準と対象外

2026-10-23に`igapyon-miku-soft-developer`のreference commit `ee88c7ce1dab2d5dde5cf2a05acd5660bce7e98a`、Maintenance mode、`40-agent-skills-workflow.md`を適用した。同階層package/runtimeの運用例を確認し、runtimeとpackageを独立管理しつつおおよそ追従させる方針に沿ってpackageを`1.1.2`にした。

Issue #77のXML import execution path、新v1 workflow移行、MCP契約変更は対象外。commit、push、tag、PR作成、Release操作、installed Skillへの同期も行っていない。
