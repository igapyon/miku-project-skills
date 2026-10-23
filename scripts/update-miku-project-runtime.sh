#!/bin/sh
set -eu

repo_root="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
runtime_root="$repo_root/skills/igapyon-miku-project/runtime"

node_tag="v1.1.2"
node_runtime_name="miku-project-1.1.2.mjs"
node_sources_name="miku-project-sources-1.1.2.tgz"
java_tag="v1.1.2"
java_runtime_name="miku-project-1.1.2.jar"
java_sources_name="miku-project-sources-1.1.2.jar"

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
  "fac633d60560cf332d7cf3aeb64f8df6d50389b1d506d7e7b7626027e8e45f17"
download_asset \
  "https://github.com/igapyon/miku-project/releases/download/$node_tag/$node_sources_name" \
  "$node_sources_name" \
  "9a1262431cc5f15a0f9b4d9b9d222c104271affa4572a443bd0514cdf0c9f89c"
download_asset \
  "https://github.com/igapyon/miku-project-java/releases/download/$java_tag/$java_runtime_name" \
  "$java_runtime_name" \
  "99933cfd85b09ff3dbfba61e0849268a64aca946d24085a1b47164cf86560292"
download_asset \
  "https://github.com/igapyon/miku-project-java/releases/download/$java_tag/$java_sources_name" \
  "$java_sources_name" \
  "4bf8784013fe84883612ffeadae2e5d1fa894a45613a0ba14ef6c427de99bda5"

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
