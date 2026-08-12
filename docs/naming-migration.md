# Miku Project Naming Migration

This record implements the repository-local naming contract in
[GitHub Issue #63](https://github.com/igapyon/mikuproject-skills/issues/63)
and tracks the Agent Skills portion of the product-family migration in
[miku-project Issue #123](https://github.com/igapyon/miku-project/issues/123).
It is kept in the repository so that the Release/PR handoff can repeat the
fixed baseline and runtime provenance without relying on a moving GitHub URL.

## Baseline Recorded Before the Migration

| Item | Value |
| --- | --- |
| Repository | `igapyon/mikuproject-skills` |
| Default branch | `devel` |
| Exact HEAD | `dc72f7af8b1002dcf6a19b9b8eadecc068ced3a4` |
| Latest Release | `v0.8.1.1` (2026-05-01) |
| Baseline checks | `npm test` and `npm run build:bundle:zip` passed |

## Current Migration Status

Checked on 2026-08-12:

- repository-local Issue #63 is closed and the tracked Agent Skill source uses
  the canonical package, installed skill, directory, runtime, and bundle names
- `igapyon/miku-project` and `igapyon/miku-project-java` are the current
  canonical upstream repositories
- the GitHub repository is `igapyon/miku-project-skills`; the old
  `igapyon/mikuproject-skills` API URL redirects to the canonical repository
- local `origin` is `git@github.com:igapyon/miku-project-skills.git`, and
  `git fetch origin --prune` succeeded after the rename
- the MCP repository is still `igapyon/mikuproject-mcp`; the target
  `igapyon/miku-project-mcp` repository does not exist yet

The Agent Skills repository rename and local fetch verification are complete.
No verification-only push was performed; verify push routing through the next
reviewed publication workflow instead of creating an unrelated remote update.

The remaining MCP repository rename is a human-owned operation. Do not change
managed MCP URLs or identifiers to a target repository before that target and
its compatibility contract exist.

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
| `igapyon/mikuproject-mcp` and `@igapyon/mikuproject-mcp-node` | Current MCP backend repository and package; their migration is tracked by umbrella Issue #123, but this adapter retains them until the upstream MCP repository supplies and tests canonical identifiers. |
| Java runtime | Pinned to the published `v0.12.0` artifact, whose `ai spec` uses the canonical `miku-project` heading. |

All other repository, package, directory, bundle, runtime, documentation, and
Action references use the canonical miku-project identity. The exact upstream
runtime artifacts and checksums are documented in
[`artifact-provenance.md`](../skills/igapyon-miku-project/references/runtime/artifact-provenance.md).
