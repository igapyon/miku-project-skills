# Miku Project Naming Migration

This record implements the naming contract in GitHub Issue #63. It is kept in
the repository so that the Release/PR handoff can repeat the fixed baseline and
runtime provenance without relying on a moving GitHub URL.

## Baseline Recorded Before the Migration

| Item | Value |
| --- | --- |
| Repository | `igapyon/mikuproject-skills` |
| Default branch | `devel` |
| Exact HEAD | `dc72f7af8b1002dcf6a19b9b8eadecc068ced3a4` |
| Latest Release | `v0.8.1.1` (2026-05-01) |
| Baseline checks | `npm test` and `npm run build:bundle:zip` passed |

The GitHub repository rename to `igapyon/miku-project-skills` must be performed
by a repository owner in GitHub Settings. After that rename, update `origin` to
the new SSH URL and verify a fetch and push against the new URL before
publishing a Release.

## Canonical Identity

| Surface | Canonical value |
| --- | --- |
| Repository and npm package | `miku-project-skills` |
| Installed skill and frontmatter name | `igapyon-miku-project` |
| Skill directory | `skills/igapyon-miku-project/` |
| Runtime directory | `skills/igapyon-miku-project/runtime/` |
| Agent display name | `miku-project` |
| Explicit product triggers | `miku-project`, `miku-project-skills`, `igapyon-miku-project`, `$igapyon-miku-project` |

There is no `skills/mikuproject/` alias directory and no second installed skill
identity.

## Intentional Legacy Compatibility

| Legacy text | Scope and exit condition |
| --- | --- |
| `mikuproject`, `miku project`, `mikuku project` | Activation triggers for the canonical skill; keep while existing prompts use them. |
| `mikuproject_*` and `mikuproject://` | MCP backend tools and resource URIs; retain until the MCP backend migration supplies and tests canonical identifiers. |
| `mikuproject_workbook_json` | Existing workbook interchange format; retain until its wire-format migration is separately versioned. |
| `igapyon/mikuproject-mcp` and `@igapyon/mikuproject-mcp-node` | Current MCP backend repository and package; MCP server rename is outside this Issue. |
| Java runtime | Pinned to the published `v0.12.0` artifact, whose `ai spec` uses the canonical `miku-project` heading. |

All other repository, package, directory, bundle, runtime, documentation, and
Action references use the canonical miku-project identity. The exact upstream
runtime artifacts and checksums are documented in
[`artifact-provenance.md`](../skills/igapyon-miku-project/references/runtime/artifact-provenance.md).
