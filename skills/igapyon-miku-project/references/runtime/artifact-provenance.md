---
title: Miku Project runtime artifact provenance
description: Fixed upstream Release artifacts bundled by this skill.
topics: [miku-project, runtime, provenance]
category: reference
status: active
audience: [maintainer]
updated: 2026-10-23
---

# Runtime Artifact Provenance

The runtime artifacts bundled under `skills/igapyon-miku-project/runtime/` are
downloaded from the fixed Release tags below. Do not replace them from a moving
branch, a `latest` URL, or a GitHub redirect.

| Runtime | Repository | Tag | Asset | SHA-256 |
| --- | --- | --- | --- | --- |
| Node.js | `igapyon/miku-project` | `v1.1.2` | `miku-project-1.1.2.mjs` | `fac633d60560cf332d7cf3aeb64f8df6d50389b1d506d7e7b7626027e8e45f17` |
| Node.js sources | `igapyon/miku-project` | `v1.1.2` | `miku-project-sources-1.1.2.tgz` | `9a1262431cc5f15a0f9b4d9b9d222c104271affa4572a443bd0514cdf0c9f89c` |
| Java | `igapyon/miku-project-java` | `v1.1.2` | `miku-project-1.1.2.jar` | `99933cfd85b09ff3dbfba61e0849268a64aca946d24085a1b47164cf86560292` |
| Java sources | `igapyon/miku-project-java` | `v1.1.2` | `miku-project-sources-1.1.2.jar` | `4bf8784013fe84883612ffeadae2e5d1fa894a45613a0ba14ef6c427de99bda5` |

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
