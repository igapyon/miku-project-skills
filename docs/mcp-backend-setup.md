# MCP Backend Setup

この文書は、`miku-project-skills` から MCP backend を使うための最小設定メモです。

`miku-project-skills` は MCP server 本体を標準同梱しません。
MCP backend を使う場合は、別配布の `mikuproject-mcp` を MCP client から起動します。

## 位置づけ

- `miku-project-skills`: Agent Skill の workflow layer
- `mikuproject-mcp`: MCP server adapter
- `mikuproject-mcp` の server key は、MCP client 設定では短く `miku-project` として構いません
- MCP tool 名は `mikuproject_ai_spec` のような `mikuproject_*` 形式です

`miku-project-skills` 側の既定 backend policy は `cli-preferred` です。
MCP backend を明示したい場合は、会話で `mcp-only` または `mcp-preferred` を指定します。

例:

```text
miku-project、mcp-only で AI spec を確認して
```

## VS Code 設定例

VS Code で使う場合は、workspace の `.vscode/mcp.json` に MCP server 設定を置きます。

### stdio 例

```json
{
  "servers": {
    "miku-project": {
      "type": "stdio",
      "command": "npm",
      "args": [
        "exec",
        "--yes",
        "--package=${workspaceFolder}/workplace/igapyon-mikuproject-mcp-node-0.8.2.tgz",
        "--",
        "mikuproject-mcp"
      ],
      "env": {
        "MIKUPROJECT_MCP_WORKSPACE": "${workspaceFolder}/workplace/mikuproject-mcp-vscode"
      }
    }
  }
}
```

この例では、MCP server package を次に置いている前提です。

```text
workplace/igapyon-mikuproject-mcp-node-0.8.2.tgz
```

生成物は次の下に出ます。

```text
workplace/mikuproject-mcp-vscode
```

`.vscode/mcp.json` と `workplace/` はローカル環境用として扱います。

### HTTP 例

HTTP transport で接続する場合は、MCP server を別プロセスで起動し、
`.vscode/mcp.json` には接続先 URL だけを書きます。

MCP server 起動例:

```sh
MIKUPROJECT_MCP_HTTP_HOST=127.0.0.1 \
MIKUPROJECT_MCP_HTTP_PORT=3000 \
MIKUPROJECT_MCP_HTTP_ENDPOINT=/mcp \
node /path/to/mikuproject-mcp/packages/node/dist/http.js
```

`mikuproject-mcp-http` コマンドとしてインストール済みの場合は、同じ環境変数で
そのコマンドを起動しても構いません。

VS Code の `.vscode/mcp.json` 例:

```json
{
  "servers": {
    "miku-project": {
      "type": "http",
      "url": "http://127.0.0.1:3000/mcp"
    }
  }
}
```

HTTP transport は request-scoped workspace を使うため、host path 引数を渡さない
運用を基本にします。`draftContent` / `workbookContent` / `stateContent` /
`patchContent` / `content` / `inputBase64` などの inline input と、
`outputMode: "content"` または `outputMode: "base64"` を使います。

content-mode の結果は、operation payload の top-level `text` ではなく
`artifacts[]` に入ります。たとえば `mikuproject_state_from_draft` の workbook
JSON は `artifacts[].role === "workbook_state"` の `text` を読みます。WBS
Markdown や Mermaid などの report は `report_output.text`、WBS XLSX や ZIP
bundle などの binary report は `report_output.base64` を読みます。

## 最小確認

MCP server を起動できたら、まず `mikuproject_ai_spec` を呼び出します。

期待:

- `operation` が `mikuproject_ai_spec`
- hard error ではない
- `mikuproject://spec/ai-json` または AI spec 本文を参照できる

次に tool list で `mikuproject_report_wbs_xlsx` などの report tools が見えることを確認します。
見えない場合は、古い `mikuproject-mcp` package が起動している可能性があります。

## 詳細確認

tool list、prompt list、draft からの workbook state 作成、report 生成まで確認する場合は、
[backend-switching-manual-test.md](./backend-switching-manual-test.md) を使います。

この文書は利用者向けの最小設定メモであり、
`backend-switching-manual-test.md` は開発者・検証者向けの手動テスト手順です。
