# mikuproject-skills

## English

`mikuproject-skills` is a set of skills for creating and revising WBS plans with `mikuproject`.

What users should care about first:

- you can start by saying `mikuproject`
- you can create a WBS through conversation
- you can revise and update an existing plan
- you can export results as `XLSX`, `Markdown`, `SVG`, and other useful formats
- when needed, you can also handle plan data in forms that are easy to save, reuse, and hand off

At the moment, the main skill in this repository is [`skills/mikuproject`](./skills/mikuproject).

Runtime requirement:

- Node.js 20 or later is required to build and run this skill

## Quick Start

1. Install dependencies with `npm install`.
2. Verify the repository with `npm test`.
3. Build the distributable skill bundle with `npm run build:bundle`.
4. Open [`skills/mikuproject`](./skills/mikuproject) or install the generated bundle into your skill home.
5. In conversation, start with a prompt such as `mikuproject, create a WBS for ...`.

Typical things you can ask for:

- create a new WBS from requirements or constraints
- revise an existing WBS
- export the current result as `XLSX`
- export the current result as `Markdown`
- export the current result as daily or weekly `SVG`

## Notes

- This repository does not aim to replace the `mikuproject` browser UI.
- For advanced workflows, the skill can also work with structured plan data such as workbook JSON.
- The skill is designed as a workflow layer that can run as `Agent Skill over CLI backend` or `Agent Skill over MCP backend`, depending on the execution policy.
- The MCP server adapter product is named `mikuproject-mcp`; MCP tools use `mikuproject_*` names such as `mikuproject_ai_spec`.
- To use the MCP backend, see [`docs/mcp-backend-setup.md`](./docs/mcp-backend-setup.md).
- [`skills/mikuproject/index.json`](./skills/mikuproject/index.json) is the generated discovery index included with the installable skill.
- If you are evaluating or developing the repository itself, see the documents under [`docs/`](./docs/).

Developer-oriented entry points:

- [`docs/quickstart.md`](./docs/quickstart.md)
- [`docs/agent-skill-design.md`](./docs/agent-skill-design.md)
- [`docs/development.md`](./docs/development.md)

## License

This project is licensed under the Apache License 2.0. See [`LICENSE`](./LICENSE).

---

## 日本語

`mikuproject-skills` は、`mikuproject` を使って WBS を作成・修正できる skill 集です。

まずユーザーにとって重要なのは次の点です。

- `mikuproject` と言って使い始められること
- 対話から WBS を作成できること
- 既存の計画を修正・更新できること
- `XLSX`、`Markdown`、`SVG` などの形で出力できること
- 必要に応じて、計画データを保存・再利用・受け渡ししやすい形でも扱えること

現在、このリポジトリの中心となる skill は [`skills/mikuproject`](./skills/mikuproject) です。

実行前提:

- この skill の build と実行には Node.js 20 以降が必要です

## はじめかた

1. `npm install` で依存関係をインストールします。
2. `npm test` でリポジトリの状態を確認します。
3. `npm run build:bundle` で配布用 skill bundle を作成します。
4. [`skills/mikuproject`](./skills/mikuproject) を参照するか、生成された bundle を skill home に配置します。
5. 会話では、たとえば `mikuproject で WBS を作って` のように始めます。

よくある使い方:

- 要件や制約から新しい WBS を作る
- 既存の WBS を修正する
- 現在の結果を `XLSX` として出力する
- 現在の結果を `Markdown` として出力する
- 現在の結果を日次または週次の `SVG` として出力する

## 補足

- このリポジトリは `mikuproject` のブラウザ UI を置き換えることを目的にはしていません。
- より高度な運用では、workbook JSON などの構造化された計画データも扱えます。
- この skill は workflow layer として設計されており、実行 policy に応じて `Agent Skill over CLI backend` または `Agent Skill over MCP backend` として扱えます。
- MCP server adapter の製品名は `mikuproject-mcp` で、MCP tool は `mikuproject_ai_spec` のような `mikuproject_*` 名を使います。
- MCP backend を使う場合は [`docs/mcp-backend-setup.md`](./docs/mcp-backend-setup.md) を参照してください。
- [`skills/mikuproject/index.json`](./skills/mikuproject/index.json) は、インストール用 skill に含める生成済みの discovery index です。
- リポジトリ自体の評価や開発を行う場合は [`docs/`](./docs/) 以下の文書を参照してください。

開発者向けの入口:

- [`docs/quickstart.md`](./docs/quickstart.md)
- [`docs/agent-skill-design.md`](./docs/agent-skill-design.md)
- [`docs/development.md`](./docs/development.md)

## ライセンス

このプロジェクトは Apache License 2.0 のもとで提供されています。詳細は [`LICENSE`](./LICENSE) を参照してください。
