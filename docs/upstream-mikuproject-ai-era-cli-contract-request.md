---
title: Upstream request: AI-era CLI help contract
description: mikuproject Node.js / Java runtime の help surface を miku-soft 標準へ近付ける依頼。
topics: [mikuproject, cli, upstream, help]
category: upstream-request
status: pending
audience: [upstream-maintainer]
updated: 2026-08-06
sources:
  - type: runtime-artifact
    role: primary
    path: skills/mikuproject/runtime/
    version: 0.8.3.3
    checked: 2026-08-06
---

# Upstream request: AI-era CLI help contract

対象: `mikuproject` Node.js CLI と `mikuproject-java` CLI。

同梱 `0.8.3.3` artifact の `--help` は実行可能な usage 一覧を返すが、
AI agent と人間が安全に選択できる command contract としては情報が不足している。
この Agent Skill 側で CLI を再実装せず、upstream の CLI contract として改善を希望する。

要求する最小項目:

- `--help` と `<command> --help` で、目的、usage、主要 option、input/output artifact role、exit code を示す。
- Java / Node.js で共有する command は、同じ command vocabulary と対応する説明を使う。
- runtime 固有で未対応の command は、隠さず Java-only / Node-only と明記する。
- diagnostics を stdout の成果物本文と混在させず、stderr と非 0 exit code を一貫して使う。
- 既存の `--version`、`ai`、`state`、`export`、`report` command の意味論と script compatibility を壊さない。

受入条件:

1. help 出力が UTF-8 の末尾改行付きで安定する。
2. `--version` は machine-readable な既存形式を維持する。
3. representative command の help が input / output / failure path を説明する。
4. Node.js と Java の差分が契約または release note に記録される。

Agent Skill 側の現在の比較範囲は
[`help-compatibility.json`](../skills/mikuproject/references/runtime/help-compatibility.json) と
その Vitest で管理する。上流 artifact を更新したら、この依頼の status と比較 fixture を更新する。
