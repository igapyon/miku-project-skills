import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = path.resolve(import.meta.dirname, "..");
const manualTestPath = path.resolve(ROOT, "docs/backend-switching-manual-test.md");
const developmentPath = path.resolve(ROOT, "docs/development.md");

describe("backend switching manual test documentation", () => {
  it("documents the VS Code tarball MCP server startup path", () => {
    const text = fs.readFileSync(manualTestPath, "utf8");

    expect(text).toContain("VS Code");
    expect(text).toContain(".vscode/mcp.json");
    expect(text).toContain("workplace/igapyon-mikuproject-mcp-node-0.8.2.tgz");
    expect(text).toContain("${workspaceFolder}/workplace/igapyon-mikuproject-mcp-node-0.8.2.tgz");
    expect(text).toContain("npm exec --yes");
  });

  it("keeps the backend switching policy checks visible", () => {
    const text = fs.readFileSync(manualTestPath, "utf8");

    expect(text).toContain("mikuproject_ai_spec");
    expect(text).toContain("mikuproject_state_from_draft");
    expect(text).toContain("mikuproject_report_wbs_markdown");
    expect(text).toContain("mikuproject_report_wbs_xlsx");
    expect(text).toContain("mikuproject_create_project_draft");
    expect(text).toContain("mikuproject_revise_state_with_patch");
    expect(text).toContain("mikuproject_review_artifact_diagnostics");
    expect(text).toContain("mcp-only");
    expect(text).toContain("cli-only");
    expect(text).toContain("handoff-only");
  });

  it("is linked from the development notes", () => {
    const text = fs.readFileSync(developmentPath, "utf8");

    expect(text).toContain(
      "[backend-switching-manual-test.md](./backend-switching-manual-test.md)"
    );
  });
});
