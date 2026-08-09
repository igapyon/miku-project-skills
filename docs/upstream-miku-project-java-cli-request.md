# miku-project-java CLI Change Request

この文書は upstream `miku-project-java` 側への依頼メモです。
`miku-project-skills` 側の実装ではなく、Java runtime artifact の CLI contract を変更する作業として扱います。

Status: fulfilled by upstream `miku-project-java` commits through `7c8fcf4`.

確認済み:

- Java CLI は grouped command 体系へ移行済み
- `--version` は利用可能
- workbook JSON 中心の `state` / `ai` / `export` / `report` CLI は利用可能
- `state summarize` / `state diff` は利用可能
- public help から旧 XML-first / 位置引数 command と `.xlsxbin` 例示は消えている
- `ai export bundle` は follow-up 依頼として追加し、同じく対応済み

## 背景

`miku-project-skills` では、生成AI agent から `miku-project` runtime を呼び出して、
WBS 草案作成、workbook JSON 状態管理、patch 適用、各種 report export を行います。

現状の Java CLI は XML と位置引数を中心にした低レベル command が多く、生成AI agent が安全に組み立てるには扱いづらいです。
一方、Node.js CLI は次のように、用途別の command group と named option を持っており、agent から呼び出しやすい形になっています。

```bash
node skills/igapyon-miku-project/runtime/miku-project-<version>.mjs ai spec
node skills/igapyon-miku-project/runtime/miku-project-<version>.mjs state from-draft --in draft.editjson --out workbook.json
node skills/igapyon-miku-project/runtime/miku-project-<version>.mjs state apply-patch --state workbook.json --in patch.editjson --out workbook.next.json
node skills/igapyon-miku-project/runtime/miku-project-<version>.mjs report all --in workbook.json --out report-bundle.zip
```

Java 版の利用者はまだ少ないため、既存 Java CLI の互換性維持は優先しません。
Node.js 版を手本に、Java CLI 自体を agent-friendly な形へ変更してください。

## 依頼内容

Java CLI を Node.js CLI の引数体系へ寄せてください。

基本方針:

- `ai ...`、`state ...`、`export ...`、`report ...` の command group を使う
- 位置引数ではなく `--in`、`--out`、`--state`、`--before`、`--after` などの named option を使う
- 生成AI agent との会話境界では `mikuproject_workbook_json` を主要 state として扱う
- XML は明示的に XML を扱う command でのみ表に出す
- `output.xlsxbin` のような実装都合の拡張子をユーザー向け CLI から露出しない
- visible workbook / report は `.xlsx` のような自然な拡張子で扱う
- Java CLI runtime artifact と Node.js CLI runtime artifact の両方に `--version` を追加する

legacy / batch command の扱い:

- 新しい public help / README / Agent Skills 向け examples では、command group 形式を正とする
- 既存 Java CLI command の下方互換性維持は優先しないため、旧 XML-first / 位置引数 command は削除対象とする
- 移行中に legacy command が一時的に残る場合でも、完了状態とは扱わない
- legacy command に `xlsxbin` が残っている場合は、公開 CLI 整理の未完了項目として扱う
- batch command も public runtime artifact に含めるなら、command group / named option / `.xlsx` 方針へ寄せる
- 内部検証だけに必要な旧 command は、通常 CLI help / README / Agent Skills 向け examples から分離し、最終的には削除または別の内部テスト入口へ移す

## 優先度

最初に Java 側で対応してほしい項目:

1. Node.js CLI と同じ command group / named option 形への変更
2. workbook JSON を入力 state として扱う Java CLI entrypoint の整備
3. Java 側に不足している `state summarize` 相当の直接 command 追加
4. Java 側に不足している `state diff` 相当の直接 command 追加
5. `.xlsxbin` 露出の廃止
6. `--version` の追加
7. legacy / batch command の削除、または command group / named option 形への移行

## TOBE Java CLI

期待する Java CLI の例です。

| Operation | Java CLI example |
| --- | --- |
| Version | `java -jar miku-project.jar --version` |
| AI JSON spec | `java -jar miku-project.jar ai spec` |
| Draft import | `java -jar miku-project.jar state from-draft --in draft.editjson --out workbook.json` |
| AI document kind detection | `java -jar miku-project.jar ai detect-kind --in document.json` |
| Workbook JSON validation | `java -jar miku-project.jar state validate --in workbook.json` |
| Workbook JSON replace import | `java -jar miku-project.jar state import --in workbook.json --out workbook.normalized.json` |
| Workbook JSON merge import | `java -jar miku-project.jar state merge --state workbook.json --in workbook.patch.json --out workbook.next.json` |
| Workbook JSON export / normalize | `java -jar miku-project.jar export workbook-json --in workbook.json --out workbook.normalized.json` |
| Project overview view | `java -jar miku-project.jar ai export project-overview --in workbook.json --out overview.editjson` |
| Task edit view | `java -jar miku-project.jar ai export task-edit --in workbook.json --task-uid taskUid --out task.editjson` |
| Phase detail view | `java -jar miku-project.jar ai export phase-detail --in workbook.json --phase-uid phaseUid --out phase.editjson` |
| Patch validation | `java -jar miku-project.jar ai validate-patch --state workbook.json --in patch.editjson` |
| Patch apply | `java -jar miku-project.jar state apply-patch --state workbook.json --in patch.editjson --out workbook.next.json` |
| State summary | `java -jar miku-project.jar state summarize --in workbook.json` |
| State diff | `java -jar miku-project.jar state diff --before workbook.before.json --after workbook.after.json` |
| XML validation | `java -jar miku-project.jar validate xml --in project.xml` |
| XML export | `java -jar miku-project.jar export xml --in workbook.json --out project.xml` |
| Structural XLSX export | `java -jar miku-project.jar export xlsx --in workbook.json --out workbook.xlsx` |
| Structural XLSX validation | `java -jar miku-project.jar validate xlsx --in workbook.xlsx` |
| Structural XLSX replace import | `java -jar miku-project.jar import xlsx --in workbook.xlsx --out workbook.json` |
| Structural XLSX merge import | `java -jar miku-project.jar merge xlsx --state workbook.json --in workbook.xlsx --out workbook.next.json` |
| Report bundle | `java -jar miku-project.jar report all --in workbook.json --out report-bundle.zip` |
| Report directory | `java -jar miku-project.jar report dir --in workbook.json --out report.dir` |
| WBS XLSX report | `java -jar miku-project.jar report wbs-xlsx --in workbook.json --out wbs.xlsx` |
| Daily SVG report | `java -jar miku-project.jar report daily-svg --in workbook.json --out daily.svg` |
| Weekly SVG report | `java -jar miku-project.jar report weekly-svg --in workbook.json --out weekly.svg` |
| Monthly SVG report | `java -jar miku-project.jar report monthly-calendar-svg --in workbook.json --out monthly-calendar.zip` |
| WBS Markdown report | `java -jar miku-project.jar report wbs-markdown --in workbook.json --out wbs.md` |
| Mermaid report | `java -jar miku-project.jar report mermaid --in workbook.json --out mermaid.mmd` |

## 入出力の期待

`--in` / `--out`:

- `--in path` は指定ファイルを読む
- `--out path` は指定ファイルへ書く
- テキスト / JSON 系 command では、可能なら `--in -` / `--out -` による stdin / stdout も扱えるとよい
- binary output は原則として明示的な `--out path` を推奨する

終了コード:

- 成功時は `0`
- usage error は非 `0`
- validate 失敗や処理失敗も非 `0`

diagnostics:

- まずは text diagnostics でよい
- 将来的に Node.js CLI と同様の `--diagnostics json` を揃えられると望ましい

### `state summarize` / `state diff` の出力形式

`state summarize` と `state diff` は、Java 側で最も設計判断が必要な command です。

可能であれば Node.js CLI の出力形式に合わせてください。
Node.js CLI と完全に合わせるのが難しい場合でも、初期実装では deterministic な text summary として固定してください。

初期実装で期待すること:

- 同じ入力に対して同じ順序・同じ文言で出力する
- task / milestone / dependency などの並び順を安定させる
- locale や実行環境によって表記が変わらないようにする
- agent が差分を読み取りやすい粒度で、過度に詳細な全量 dump にはしない
- JSON output や `--diagnostics json` は後続拡張でよい

将来拡張の候補:

- `--format text|json`
- `--diagnostics text|json`
- summary / diff 本体の JSON schema 固定

## 受け入れ条件

`miku-project-java` 側で artifact を作成した後、`miku-project-skills` 側では次を確認します。

- `java -jar skills/igapyon-miku-project/runtime/miku-project-<version>.jar --version` が実行できる
- `java -jar skills/igapyon-miku-project/runtime/miku-project-<version>.jar ai spec` が実行できる
- `state from-draft` で `project_draft_view` から workbook JSON を生成できる
- `state apply-patch` で workbook JSON と Patch JSON から次の workbook JSON を生成できる
- `state summarize` が workbook JSON の概要を返す
- `state diff` が 2 つの workbook JSON の差分概要を返す
- `state summarize` / `state diff` の text output が deterministic である
- `report all` が workbook JSON から report bundle ZIP を生成できる
- `report wbs-xlsx` が `.xlsx` 出力を生成できる
- public help / README / Agent Skills 向け examples に `.xlsxbin` が出ない
- public runtime artifact の通常 CLI surface に旧 XML-first / 位置引数 command が残っていない
- public runtime artifact に batch command を残す場合も `.xlsxbin` が出ない

## 参照

詳細な ASIS / TOBE 対応表は `miku-project-skills` 側の次の文書にあります。

- `skills/igapyon-miku-project/references/runtime/operations-map.md`
- `TODO.md` の `Cross-Cutting Note`
