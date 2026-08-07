---
title: mikuproject-skills の miku-soft 標準参照
description: このリポジトリで適用する miku-soft 標準と、製品固有の実装境界を記録する。
topics: [miku-soft, agent-skills, mikuproject]
category: reference
status: active
audience: [maintainer, developer, agent]
updated: 2026-08-06
sources:
  - type: local-file
    role: primary
    path: skills/mikuproject/SKILL.md
    checked: 2026-08-06
  - type: canonical-repository
    role: supporting
    url: https://github.com/igapyon/mikuproject
    checked: 2026-08-06
  - type: canonical-repository
    role: supporting
    url: https://github.com/igapyon/mikuproject-java
    checked: 2026-08-06
---

# miku-soft 標準参照

`mikuproject-skills` は、`mikuproject` の Agent Skill 配布リポジトリである。
製品意味論と CLI の実装責務は upstream に置き、このリポジトリは workflow、
reference、backend policy、version 付き runtime artifact と配布 bundle を保守する。

## 正本と確認状態

- miku-soft 共通標準: インストール済みの `igapyon-miku-soft-developer` skill と、その参照先を正本とする。
- 製品正本: [mikuproject](https://github.com/igapyon/mikuproject) と [mikuproject-java](https://github.com/igapyon/mikuproject-java)。
- 同梱 runtime artifact: `skills/mikuproject/runtime/` の `0.8.3.3` artifact。
- 確認日: 2026-08-06。
- 標準 skill の固定 commit: この環境の skill root は Git worktree ではないため未取得。release 前に、利用した標準の version または commit を release record に固定する。

共通標準本文をこのリポジトリへ複製しない。旧ファイル名への互換リンクは残すが、
内容はこの文書と共通標準の正本へ誘導する。

## このリポジトリへの適用

- `skills/mikuproject/` を installable Agent Skill とし、`index.json` は生成物として扱う。
- `runtime/` には実行可能 artifact と sources artifact を version 付きで同梱する。
- `bundle/`、test、開発用 docs、workplace、OS メタデータは配布 ZIP に含めない。
- Node.js の対応下限は 20。CI は Node.js 20 / 24 と Java 17 で検証する。
- GitHub Release は人が tag または release を作成して起動する。workflow は artifact を build・検証・添付するだけで、通常開発から公開しない。
- Java と Node.js の CLI 差分は隠さず、`skills/mikuproject/references/runtime/` で管理する。

製品固有の設計は [agent-skill-design.md](./agent-skill-design.md)、
保守手順は [development.md](./development.md) を参照する。
