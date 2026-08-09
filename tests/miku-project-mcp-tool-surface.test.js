import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = path.resolve(import.meta.dirname, "..");
const mcpConfigPath = path.resolve(ROOT, ".vscode/mcp.json");
const tarballPath = path.resolve(ROOT, "workplace/igapyon-mikuproject-mcp-node-0.8.2.tgz");
const sourceRoot = path.resolve(ROOT, "workplace/mikuproject-mcp-0.8.2");

const expectedTools = [
  "mikuproject_version",
  "mikuproject_ai_spec",
  "mikuproject_ai_detect_kind",
  "mikuproject_ai_export_project_overview",
  "mikuproject_ai_export_bundle",
  "mikuproject_ai_export_task_edit",
  "mikuproject_ai_export_phase_detail",
  "mikuproject_ai_validate_patch",
  "mikuproject_state_from_draft",
  "mikuproject_state_apply_patch",
  "mikuproject_state_diff",
  "mikuproject_state_summarize",
  "mikuproject_export_workbook_json",
  "mikuproject_export_xml",
  "mikuproject_export_xlsx",
  "mikuproject_import_xlsx",
  "mikuproject_report_wbs_xlsx",
  "mikuproject_report_daily_svg",
  "mikuproject_report_weekly_svg",
  "mikuproject_report_monthly_calendar_svg",
  "mikuproject_report_all",
  "mikuproject_report_wbs_markdown",
  "mikuproject_report_mermaid"
];

const phaseCTools = [
  "mikuproject_report_wbs_xlsx",
  "mikuproject_report_daily_svg",
  "mikuproject_report_weekly_svg",
  "mikuproject_report_monthly_calendar_svg",
  "mikuproject_report_all"
];

describe("miku-project MCP legacy tool surface fixtures", () => {
  it("keeps the legacy MCP transport reachable when the local config exists", () => {
    if (!fs.existsSync(mcpConfigPath)) {
      return;
    }

    const config = JSON.parse(fs.readFileSync(mcpConfigPath, "utf8"));
    const server = config.servers?.mikuproject;
    expect(server).toBeDefined();

    if (server.type === "http") {
      expect(server.url).toMatch(/^http:\/\/127\.0\.0\.1:\d+\/mcp$/);
      return;
    }

    const args = server.args ?? [];
    expect(server.type).toBe("stdio");
    expect(args).toContain("--package=${workspaceFolder}/workplace/igapyon-mikuproject-mcp-node-0.8.2.tgz");
    expect(args.join(" ")).not.toContain("mikuproject-mcp-0.8.0");
  });

  it("keeps the 0.8.2 tarball tool surface compatible with Phase C report tools", () => {
    if (!fs.existsSync(tarballPath)) {
      return;
    }

    const packageJson = JSON.parse(readTarballFile("package/package.json"));
    expect(packageJson.name).toBe("@igapyon/mikuproject-mcp-node");
    expect(packageJson.version).toBe("0.8.2");

    const registerTools = readTarballFile("package/dist/tools/registerTools.js");
    const tarballEntries = listTarballEntries();

    for (const toolName of expectedTools) {
      expect(registerTools).toContain(`registerTool("${toolName}"`);
      expect(tarballEntries).toContain(`package/contract/tools/${toolName}.input.schema.json`);
    }
  });

  it("keeps the expanded 0.8.2 source checkout aligned with Phase C report tools", () => {
    if (!fs.existsSync(sourceRoot)) {
      return;
    }

    const packageJson = JSON.parse(
      fs.readFileSync(path.resolve(sourceRoot, "packages/node/package.json"), "utf8")
    );
    const registerTools = fs.readFileSync(
      path.resolve(sourceRoot, "packages/node/src/tools/registerTools.ts"),
      "utf8"
    );
    const toolSchemas = fs.readFileSync(
      path.resolve(sourceRoot, "packages/node/src/contract/toolSchemas.ts"),
      "utf8"
    );

    expect(packageJson.name).toBe("@igapyon/mikuproject-mcp-node");
    expect(packageJson.version).toBe("0.8.2");

    for (const toolName of phaseCTools) {
      expect(registerTools).toMatch(registerToolPattern(toolName));
      expect(toolSchemas).toContain(`"${toolName}"`);
    }
  });
});

function readTarballFile(entryPath) {
  return execFileSync("tar", ["-xOf", tarballPath, entryPath], {
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024
  });
}

function listTarballEntries() {
  return execFileSync("tar", ["-tzf", tarballPath], {
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024
  })
    .trim()
    .split("\n");
}

function registerToolPattern(toolName) {
  return new RegExp(`registerTool\\(\\s*"${escapeRegExp(toolName)}"`);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
