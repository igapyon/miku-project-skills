#!/bin/sh
set -eu

repo_root="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
runtime_root="$repo_root/skills/igapyon-miku-project/runtime"

node_tag="v0.12.0"
node_runtime_name="miku-project-0.12.0.mjs"
node_sources_name="miku-project-sources-0.12.0.tgz"
java_tag="v0.12.0"
java_runtime_name="miku-project-0.12.0.jar"
java_sources_name="miku-project-sources-0.12.0.jar"

download_asset() {
  source_url="$1"
  target_name="$2"
  expected_digest="$3"
  target_path="$runtime_root/$target_name"
  temp_path="$(mktemp "$runtime_root/.${target_name}.XXXXXX")"

  trap 'rm -f "$temp_path"' EXIT HUP INT TERM
  curl -fL --retry 3 "$source_url" -o "$temp_path"
  actual_digest="$(shasum -a 256 "$temp_path" | awk '{print $1}')"
  test "$actual_digest" = "$expected_digest"
  mv "$temp_path" "$target_path"
  trap - EXIT HUP INT TERM
}

mkdir -p "$runtime_root"

download_asset \
  "https://github.com/igapyon/miku-project/releases/download/$node_tag/$node_runtime_name" \
  "$node_runtime_name" \
  "d21db447e141c93ff33cab51267f44211d51cb949179ee8b01097e94788747a4"
download_asset \
  "https://github.com/igapyon/miku-project/releases/download/$node_tag/$node_sources_name" \
  "$node_sources_name" \
  "3df4c78cf77885ba3849ff851b600f1cbd8a0ce478fa2bdf827789127106e916"
download_asset \
  "https://github.com/igapyon/miku-project-java/releases/download/$java_tag/$java_runtime_name" \
  "$java_runtime_name" \
  "9c1ff3d97e35e6b7688b57b85deb377529fa8b2ea9ddabb0427e58d6bbe4f90b"
download_asset \
  "https://github.com/igapyon/miku-project-java/releases/download/$java_tag/$java_sources_name" \
  "$java_sources_name" \
  "3aa868f8d325d3235eab612ff7822796317aa80d462913c35d5b4d8eeadb09f0"

java -jar "$runtime_root/$java_runtime_name" ai spec >/dev/null
java -jar "$runtime_root/$java_runtime_name" --version >/dev/null
node "$runtime_root/$node_runtime_name" ai spec >/dev/null
node "$runtime_root/$node_runtime_name" --version >/dev/null

printf '%s\n' \
  "[update-miku-project-runtime] verified fixed runtime artifacts" \
  "  - skills/igapyon-miku-project/runtime/$node_runtime_name ($node_tag)" \
  "  - skills/igapyon-miku-project/runtime/$node_sources_name ($node_tag)" \
  "  - skills/igapyon-miku-project/runtime/$java_runtime_name ($java_tag)" \
  "  - skills/igapyon-miku-project/runtime/$java_sources_name ($java_tag)"
