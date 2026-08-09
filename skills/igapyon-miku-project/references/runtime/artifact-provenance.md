---
title: Miku Project runtime artifact provenance
description: Fixed upstream Release artifacts bundled by this skill.
topics: [miku-project, runtime, provenance]
category: reference
status: active
audience: [maintainer]
updated: 2026-08-09
---

# Runtime Artifact Provenance

The runtime artifacts bundled under `skills/igapyon-miku-project/runtime/` are
downloaded from the fixed Release tags below. Do not replace them from a moving
branch, a `latest` URL, or a GitHub redirect.

| Runtime | Repository | Tag | Asset | SHA-256 |
| --- | --- | --- | --- | --- |
| Node.js | `igapyon/miku-project` | `v0.12.0` | `miku-project-0.12.0.mjs` | `d21db447e141c93ff33cab51267f44211d51cb949179ee8b01097e94788747a4` |
| Node.js sources | `igapyon/miku-project` | `v0.12.0` | `miku-project-sources-0.12.0.tgz` | `3df4c78cf77885ba3849ff851b600f1cbd8a0ce478fa2bdf827789127106e916` |
| Java | `igapyon/miku-project-java` | `v0.12.0` | `miku-project-0.12.0.jar` | `9c1ff3d97e35e6b7688b57b85deb377529fa8b2ea9ddabb0427e58d6bbe4f90b` |
| Java sources | `igapyon/miku-project-java` | `v0.12.0` | `miku-project-sources-0.12.0.jar` | `3aa868f8d325d3235eab612ff7822796317aa80d462913c35d5b4d8eeadb09f0` |

Run `npm run update:runtime` to download these exact files and verify their
checksums. Updating the runtime requires changing this document, the fixed
constants in `scripts/update-miku-project-runtime.sh`, and the associated
verification together.

## MCP Compatibility Boundary

The MCP backend remains `igapyon/mikuproject-mcp` on its `devel` branch during
the backend migration. Its `mikuproject_*` tools, `mikuproject://` resource
URIs, package names, and server key are legacy compatibility identifiers.
They delegate to the same miku-project workflows and are covered by regression
tests. This skill does not distribute a second `miku-project` skill identity.
