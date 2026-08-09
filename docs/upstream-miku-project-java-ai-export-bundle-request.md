# miku-project-java `ai export bundle` Follow-up Request

この文書は upstream `miku-project-java` 側への追加依頼メモです。
`miku-project-skills` 側の実装ではなく、Java runtime artifact の CLI contract を Node.js runtime と揃える作業として扱います。

Status: fulfilled by upstream `miku-project-java` commit `7c8fcf4`.

確認済み:

- `java -jar skills/igapyon-miku-project/runtime/miku-project-<version>.jar --help` に `ai export bundle` が出る
- `ai export bundle --in workbook.json` が `ai_projection_bundle` を返す
- `--diagnostics text|json` が help に出る
- `miku-project-skills` 側 smoke test に Java `ai export bundle` の確認を追加済み

## 背景

先行依頼により、`miku-project-java 0.8.1` の CLI は Node.js runtime に近い grouped command 体系になりました。
依頼時点では、Node.js runtime に存在する `ai export bundle` が Java runtime にはまだありませんでした。

Node.js runtime:

```bash
node skills/igapyon-miku-project/runtime/miku-project-<version>.mjs ai export bundle --in workbook.json --out bundle.editjson
```

依頼時点の Java runtime:

```bash
java -jar skills/igapyon-miku-project/runtime/miku-project-<version>.jar --help
```

`ai export project-overview`、`ai export task-edit`、`ai export phase-detail` はありますが、
`ai export bundle` は表示されていませんでした。

## 依頼内容

Java runtime に Node.js runtime と同等の `ai export bundle` CLI を追加してください。

期待する CLI:

```bash
java -jar miku-project.jar ai export bundle --in workbook.json --out bundle.editjson
```

標準入出力をサポートする場合の期待形:

```bash
java -jar miku-project.jar ai export bundle --in - --out -
```

`--diagnostics` をサポートする場合は、Node.js runtime と同じ named option を使ってください。

```bash
java -jar miku-project.jar ai export bundle --in workbook.json --diagnostics json --out bundle.editjson
```

## 目的

- Agent Skills から Java runtime 優先で AI 向け projection bundle を取得できるようにする
- Node.js runtime の `ai export bundle` と Java runtime の CLI surface 差分を減らす
- project overview、phase detail、task edit を個別に何度も呼ぶ必要を減らす
- 既存 WBS の全体把握や他 agent への引き渡しで使えるまとまった JSON を得る

通常の細かな既存編集では `task_edit_view` や `phase_detail_view` を優先します。
`ai export bundle` は重めの全体把握、検査、引き渡し、デバッグ向けの補助 CLI として扱います。

## 出力 JSON contract

Node.js runtime と同じ形を期待します。

```json
{
  "view_type": "ai_projection_bundle",
  "project_overview_view": {},
  "phase_detail_views_full": [],
  "task_edit_views_full": []
}
```

期待する内容:

- `project_overview_view`: `ai export project-overview` 相当の出力
- `phase_detail_views_full`: 各 phase に対する `ai export phase-detail --mode full` 相当の配列
- `task_edit_views_full`: root project task や summary task を除く、通常 task 向け `task_edit_view` の配列

配列順序は deterministic にしてください。
可能なら Node.js runtime と同じ順序に合わせてください。

## CLI option の期待

`--in`:

- `--in workbook.json` は指定ファイルを読む
- `--in -` は stdin を読む
- `--in` 省略を許す場合は、Node.js runtime と同様に暗黙 stdin として扱う

`--out`:

- `--out bundle.editjson` は指定ファイルへ書く
- `--out -` は stdout へ書く
- `--out` 省略時は stdout へ書く

`--diagnostics`:

- 初期実装では未対応でもよい
- 対応する場合は `--diagnostics text|json` とし、Node.js runtime の option 名に合わせる
- `--diagnostics json` の場合、本体 JSON と diagnostics JSON が混ざらないようにする

終了コード:

- 成功時は `0`
- usage error は非 `0`
- workbook JSON の parse / validation / export 失敗も非 `0`

## 受け入れ条件

`miku-project-java` 側で artifact を作成した後、`miku-project-skills` 側では次を確認します。

- `java -jar skills/igapyon-miku-project/runtime/miku-project-<version>.jar --help` に `ai export bundle` が出る
- `java -jar skills/igapyon-miku-project/runtime/miku-project-<version>.jar ai export bundle --in workbook.json --out bundle.editjson` が実行できる
- 出力 JSON の `view_type` が `ai_projection_bundle` である
- 出力 JSON に `project_overview_view` が含まれる
- 出力 JSON に `phase_detail_views_full` が配列として含まれる
- 出力 JSON に `task_edit_views_full` が配列として含まれる
- 同じ入力に対して出力順序が安定している
- Node.js runtime の `ai export bundle` と大きく異なる JSON contract になっていない

## 参照

- 先行依頼: `docs/upstream-miku-project-java-cli-request.md`
- 対応表: `skills/igapyon-miku-project/references/runtime/operations-map.md`
- Node.js runtime help: `node skills/igapyon-miku-project/runtime/miku-project-<version>.mjs --help`
- Java runtime help: `java -jar skills/igapyon-miku-project/runtime/miku-project-<version>.jar --help`
