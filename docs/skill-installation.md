# Miku Project Skill Installation

この文書は、配布された `miku-project-skills-<version>.zip` をインストール先の環境で使えるようにする手順です。

開発元リポジトリでの build 手順ではなく、受け取った bundle をどう配置するかに絞って説明します。

前提:

- この skill の実行には Node.js 20 以降が必要です
- Java runtime artifact を使う場合は Java も必要です
- 配布 bundle には `miku-project` CLI 実行用の runtime artifact が同梱されます

## 対象

この手順は、次のような人向けです。

- `miku-project-skills-<version>.zip` を受け取った
- インストール先の環境で `miku-project` skill を使いたい
- 配布元リポジトリの `npm run build` は実行しない

## 配布物

受け取る想定の配布物は次です。

- `miku-project-skills-<version>.zip`

展開すると、次のような構成になります。

```text
skills/
  miku-project/
    runtime/
      miku-project-<version>.jar
      miku-project-<version>.mjs
```

ここでの `<version>` は runtime artifact の version です。
zip ファイル名の skill package version と一致するとは限りません。

## 先に結論

やることは単純です。

1. `miku-project-skills-<version>.zip` を展開する
2. 展開してできた `skills/` を skill home の直下へコピーする
3. 実行環境を再起動または再読込する
4. 利用可能 skill 一覧に `miku-project` が出ることを確認する

コピー後の想定構成は次です。

```text
<skill-home>/
  skills/
    miku-project/
      runtime/
        miku-project-<version>.jar
        miku-project-<version>.mjs
```

## 手順

### 1. `miku-project-skills-<version>.zip` を展開する

まず、受け取った `miku-project-skills-<version>.zip` を任意の作業用フォルダに展開します。

展開後は `skills/` ディレクトリが見えるはずです。

### 2. skill home を確認する

`miku-project` skill は、bundle 版では `skills/igapyon-miku-project` の中に
実行用の runtime artifact を同梱しています。

必要なのは次です。

- `skills/igapyon-miku-project`
- `skills/igapyon-miku-project/runtime/miku-project-<version>.jar`
- `skills/igapyon-miku-project/runtime/miku-project-<version>.mjs`

`<version>` は実際に同梱されている runtime artifact の version に読み替えます。

最終的な構成は次です。

```text
<skill-home>/
  skills/
    miku-project/
      runtime/
        miku-project-<version>.jar
        miku-project-<version>.mjs
```

この文書では、この `<skill-home>` をインストール先の配置ルートと呼びます。

### 3. `skills/` を skill home へコピーする

展開した `skills/` を、そのまま skill home 直下へコピーします。

重要なのは次です。

- 展開した `skills/igapyon-miku-project` を `<skill-home>/skills/igapyon-miku-project` に入れる
- `skills/igapyon-miku-project/runtime/miku-project-<version>.jar` も一緒に入ることを保つ
- `skills/igapyon-miku-project/runtime/miku-project-<version>.mjs` も一緒に入ることを保つ

この bundle では、展開した `skills/` をそのまま `<skill-home>/` へコピーすれば足ります。

### 4. 実行環境を再起動または再読込する

skill 一覧は起動時に読まれることがあります。

そのため、コピー後は次のどちらかを行います。

- 実行環境を再起動する
- skill 一覧を再読込できる場合は再読込する

### 5. `miku-project` が利用可能 skill に出ることを確認する

利用可能 skill 一覧に `miku-project` が出れば、インストール自体は完了です。

ここで `miku-project` が出ない場合は、まず次を確認します。

- コピー先が skill home 直下になっているか
- `skills/igapyon-miku-project/runtime/miku-project-<version>.jar` があるか
- `skills/igapyon-miku-project/runtime/miku-project-<version>.mjs` があるか
- 実行環境を再起動または再読込したか

## よくある間違い

### `skills/igapyon-miku-project` の一部だけをコピーする

これは不足です。

`miku-project` skill は、bundle 版では `runtime/` を含めて成立します。
`skills/igapyon-miku-project` の中身を欠いた状態では、`spec` や import/export 系で不足する可能性があります。

### `runtime/` を落としてしまう

これは不足です。

今回の bundle 配布では、実行用 runtime artifact は `skills/igapyon-miku-project/runtime/` に同梱されています。
この runtime 部分を落とすと、bundle 内の `skills/igapyon-miku-project` 単体で自己完結しません。

### 展開場所の `skills/` 以外までまとめて入れてしまう

必要なのは展開された `skills/` です。

正しい配置:

```text
<skill-home>/
  skills/
    miku-project/
      runtime/
        miku-project-<version>.jar
        miku-project-<version>.mjs
```

## インストール後の最初の試し方

インストールできたら、まずは明示トリガー付きの依頼文で試します。

例:

```text
miku-project で、れでえいやあのWBSつくって
```

望ましい動作は次です。

- エージェントが内部で `miku-project` を使う
- 中間の `spec` や `project_draft_view` をそのまま画面に出さない
- 既存修正では `project_overview_view` / `task_edit_view` / `phase_detail_view` を内部で優先する
- WBS 要約や結果だけを返す

この skill は、通常の planning 語だけでは起動せず、次の明示トリガーを使う前提です。

- `miku-project`
- `miku project`

ここでの `.editjson` は upstream 側で使われる拡張子名です。
`project_draft_view` は JSON 文書であり、`.editjson` として受け渡してかまいません。
ただしこの skill の通常会話では document kind を優先し、新規草案は `project_draft_view`、
既存編集は `Patch JSON` として扱うのが期待動作です。

ただし実行環境によっては fallback があり、次が画面に出ることがあります。

- `spec`
- `project_draft_view`
- `Patch JSON`
- `mikuproject_workbook_json`
- `.editjson` という広い言い方

その場合でもインストール失敗とは限りません。
まずは `miku-project` が認識されているかと、処理自体が進むかを確認してください。

## 補足

- 既存編集の正規フローは `project-overview -> task-edit / phase-detail -> validate -> apply -> diff` です
- `report` 系 CLI は利用可能です
- `wbs-xlsx` / `daily-svg` / `weekly-svg` / `monthly-calendar-svg` / `all` / `wbs-markdown` / `mermaid` を扱えます

## 関連文書

- 使い始め: [quickstart.md](./quickstart.md)
- 設計メモ: [agent-skill-design.md](./agent-skill-design.md)
