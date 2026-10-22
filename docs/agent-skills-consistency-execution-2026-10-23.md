---
title: Agent Skills整合性修正 実施記録
description: 2026-10-23に行ったmiku-project-skillsのAgent Skills整合性修正と検証結果。
status: completed
created: 2026-10-23
updated: 2026-10-23
---

# Agent Skills整合性修正 実施記録

## 対象と開始状態

- 対象: `igapyon/miku-project-skills`
- branch: `devel-tiga1022vbj`
- 開始・終了時のHEAD: `c0888447a79452fb1189008e5828e430bc5b4699`（実装をcommitしていないため同じ）
- 開始時に既にあった変更: `TODO.md`と実装計画。どちらも維持して更新した。
- package: `0.12.4`
- 対応Node.js: `>=20`。既存CI matrixはNode.js 20 / 24、Java 17。

レビュー指摘2のXML import不足は[Issue #77](https://github.com/igapyon/miku-project-skills/issues/77)に登録済みのまま、今回の実装範囲に含めていない。残る指摘1・3・4・5・6を実装した。

## 変更内容

- Runtime artifact resolverの既定rootをhelper moduleに対する相対位置から絶対pathとして解決し、明示rootを使う場合も戻り値を絶対pathにした。
- operation registryに記載済みのCLI/MCP操作を登録し、`workbook` alias、command別のpath option、task/phase projection option、Java専用操作を追加した。`xml-import`は登録していない。MCP toolとartifact roleは既存文書で確認できる範囲に限定した。
- 環境由来の`cli-only` / `mcp-only` / `handoff-only`をhard constraintとして実装し、対立する利用者指定に`backend_policy_conflict`を返すようにした。JSON config、Skill、workflow、開発文書を同期した。
- 同梱Node.js `0.12.0`の構造XLSX `import xlsx`を能力表、CLI例、shared help fixture、smoke testへ反映した。古い0.8.3.3のupstream help依頼は当時の記録を残し、現行artifactの注記を追加した。
- Skill内CLI例を`<skill-root>`基準にそろえ、設置directory名、quickstart図、ZIP内Markdown linkを修正した。開発文書の切れたMCP noteリンクと固定Release runtime更新説明も修正した。
- `TODO.md`と[実装計画](agent-skills-consistency-plan-2026-10-23.md)に完了状態を記録した。

## 検証

実行環境:

- Node.js `v26.12.0`
- npm `11.20.0`
- Java `17.0.21`
- repo内Vitest `4.1.12`（`npm ci`後に`npm ls vitest --depth=0`で確認）

実行した確認:

- 実装前baseline: `npm test` — 15 files / 41 tests passed。
- focused verification: 9 files / 36 tests passed。runtime path、operation argv/capability、backend policy、XLSX import、help compatibility、naming/reference integrity、ZIP smokeを含む。
- 最終確認: `npm run build` — 17 files / 53 tests passed。続けて`bundle/miku-project-skills-0.12.4.zip`を生成した。
- ZIPを一時directoryへ展開し、展開したSkill helperを空白と日本語を含む別workspaceからimportした。作業workspace内の偽runtimeではなく配布Skill内のJava/Node runtimeが解決され、Node `state from-draft`とJava `state summarize`が成果物をworkspaceに生成した。
- NodeとJavaの構造XLSX import/exportをそれぞれruntime固有のroundtripで確認し、import後のdocument kind、project名、task名、dependencyを確認した。
- Markdown local link checkはsourceの`docs/`と`skills/`全体、およびZIP展開後のSkill内で通過した。ZIP内参照がSkill directory外へ出ないことも確認した。
- `git diff --check`に問題なし。4個の固定runtime artifactのSHA-256は`artifact-provenance.md`と一致した。runtime jar / mjs / sources、`package.json`、`package-lock.json`、CI matrixに変更はない。

## 残る確認と観測

- GitHub Actionsはこの作業では起動していない。Node.js 20 / 24 とJava 17のCI matrix結果は未確認であり、成功とは記録しない。
- MCP実serverへの接続確認は行っていない。operation registryとpolicyのローカル確認のみである。
- XLSXの異runtime間交換を追加調査したところ、Node runtimeが出力したXLSXをJava `import xlsx`へ渡すと、取込自体は成功するがtask dependencyの`Predecessors`が空になった。Javaが出力したXLSXはJavaでのimportでdependencyを保ち、Node importでも保った。今回のsmoke testはNode/Javaそれぞれのruntime内roundtripを対象とし、この異runtime間の差は修正していない。runtime artifact差し替えは今回の範囲外であり、追加のIssueは作成していない。
- Issue #77のXML import経路不足は未解決のまま残る。
- commit、push、PR、Release、ローカルSkill配備は行っていない。
