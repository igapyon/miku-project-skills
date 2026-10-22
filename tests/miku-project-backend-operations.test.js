import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  buildCliInvocation,
  extractMcpPrimaryArtifact,
  extractMcpPrimaryArtifactText,
  getMcpOperationMetadata,
  getMcpPrimaryArtifactRole,
  getMcpToolName,
  operationRegistry,
  operationCapabilities
} from "../skills/igapyon-miku-project/lib/backend-operations.mjs";
import { resolveRuntimeArtifactPath } from "../skills/igapyon-miku-project/lib/runtime-artifacts.mjs";

const javaRuntimePath = resolveRuntimeArtifactPath({ kind: "java" });
const nodeRuntimePath = resolveRuntimeArtifactPath({ kind: "node" });
const operationsMap = fs.readFileSync(path.resolve(
  process.cwd(),
  "skills/igapyon-miku-project/references/runtime/operations-map.md"
), "utf8");
const backendCorrespondenceTable = operationsMap
  .split("## Backend Operation Correspondence")[1]
  .split("\nUnder `cli-only`")[0];

describe("miku-project backend operation registry", () => {
  it("exposes operation capabilities for backend policy selection", () => {
    expect(operationCapabilities["spec"]).toEqual({ cli: true, mcp: true });
    expect(operationCapabilities["wbs-markdown-export"]).toEqual({ cli: true, mcp: true });
    expect(operationCapabilities["wbs-xlsx-export"]).toEqual({ cli: true, mcp: true });
    expect(operationCapabilities["daily-svg-export"]).toEqual({ cli: true, mcp: true });
    expect(operationCapabilities["weekly-svg-export"]).toEqual({ cli: true, mcp: true });
    expect(operationCapabilities["monthly-calendar-svg-export"]).toEqual({ cli: true, mcp: true });
    expect(operationCapabilities["all-report-export"]).toEqual({ cli: true, mcp: true });
    expect(operationCapabilities["xlsx-import"]).toEqual({ cli: true, mcp: true });
    expect(operationCapabilities["xlsx-merge-import"]).toEqual({ cli: true, mcp: false });
    expect(operationCapabilities["workbook-import"]).toEqual({ cli: true, mcp: false });
    expect(operationCapabilities["workbook-merge-import"]).toEqual({ cli: true, mcp: false });
    expect(operationCapabilities.workbook).toEqual(operationCapabilities["workbook-export"]);
    expect(operationCapabilities["xml-import"]).toBeUndefined();
    expect(Object.keys(operationRegistry)).toEqual([
      "spec", "draft", "patch", "workbook-export", "workbook",
      "project-overview", "task-edit", "phase-detail", "patch-validate",
      "state-diff", "state-summarize", "detect-kind", "xml-export",
      "xlsx-import", "xlsx-export", "xlsx-merge-import", "workbook-import",
      "workbook-merge-import", "wbs-markdown-export", "mermaid-export",
      "wbs-xlsx-export", "daily-svg-export", "weekly-svg-export",
      "monthly-calendar-svg-export", "all-report-export"
    ]);
    for (const operation of Object.keys(operationRegistry)) {
      expect(backendCorrespondenceTable).toContain(`\`${operation}\``);
    }
    expect(backendCorrespondenceTable).not.toContain("| `xml-import` |");
    expect(operationsMap).toContain("`xml-import` is omitted from the executable capability table");
  });

  it("builds Java CLI invocations for report exports", () => {
    const invocation = buildCliInvocation({
      operation: "wbs-xlsx-export",
      runtime: "java",
      inputPath: "state/workbook.json",
      outputPath: "report/wbs.xlsx"
    });

    expect(invocation).toEqual({
      command: "java",
      args: [
        "-jar",
        javaRuntimePath,
        "report",
        "wbs-xlsx",
        "--in",
        "state/workbook.json",
        "--out",
        "report/wbs.xlsx"
      ]
    });
  });

  it("builds Node.js CLI invocations for draft import", () => {
    const invocation = buildCliInvocation({
      operation: "draft",
      runtime: "node",
      inputPath: "state/draft.editjson",
      outputPath: "state/workbook.json"
    });

    expect(invocation).toEqual({
      command: "node",
      args: [
        nodeRuntimePath,
        "state",
        "from-draft",
        "--in",
        "state/draft.editjson",
        "--out",
        "state/workbook.json"
      ]
    });
  });

  it("builds CLI invocations requiring base state for patch apply", () => {
    const invocation = buildCliInvocation({
      operation: "patch",
      runtime: "java",
      statePath: "state/workbook.before.json",
      inputPath: "state/patch.editjson",
      outputPath: "state/workbook.after.json"
    });

    expect(invocation.args).toEqual([
      "-jar",
      javaRuntimePath,
      "state",
      "apply-patch",
      "--state",
      "state/workbook.before.json",
      "--in",
      "state/patch.editjson",
      "--out",
      "state/workbook.after.json"
    ]);
  });

  it("builds projection, validation, and diff arguments with their command-specific options", () => {
    expect(buildCliInvocation({
      operation: "project-overview",
      runtime: "node",
      inputPath: "state/workbook.json",
      outputPath: "state/overview.editjson"
    }).args.slice(1)).toEqual([
      "ai", "export", "project-overview",
      "--in", "state/workbook.json",
      "--out", "state/overview.editjson"
    ]);

    expect(buildCliInvocation({
      operation: "task-edit",
      runtime: "node",
      inputPath: "state/workbook.json",
      taskUid: "task-17",
      select: "uid"
    }).args.slice(1)).toEqual([
      "ai", "export", "task-edit",
      "--in", "state/workbook.json",
      "--task-uid", "task-17",
      "--select", "uid"
    ]);

    expect(buildCliInvocation({
      operation: "phase-detail",
      runtime: "java",
      inputPath: "state/workbook.json",
      phaseUid: "phase-2",
      select: "uid",
      mode: "scoped",
      rootTaskUid: "task-0",
      maxDepth: 0
    }).args.slice(2)).toEqual([
      "ai", "export", "phase-detail",
      "--in", "state/workbook.json",
      "--phase-uid", "phase-2",
      "--select", "uid",
      "--mode", "scoped",
      "--root-task-uid", "task-0",
      "--max-depth", "0"
    ]);

    expect(buildCliInvocation({
      operation: "patch-validate",
      runtime: "node",
      statePath: "state/workbook.json",
      inputPath: "state/patch.editjson"
    }).args.slice(1)).toEqual([
      "ai", "validate-patch",
      "--state", "state/workbook.json",
      "--in", "state/patch.editjson"
    ]);

    expect(buildCliInvocation({
      operation: "state-diff",
      runtime: "java",
      beforePath: "state/before.json",
      afterPath: "state/after.json"
    }).args.slice(2)).toEqual([
      "state", "diff", "--before", "state/before.json", "--after", "state/after.json"
    ]);
  });

  it("normalizes the workbook alias and rejects missing inputs or unsupported runtimes", () => {
    const canonical = buildCliInvocation({
      operation: "workbook-export",
      runtime: "java",
      inputPath: "state/workbook.json",
      outputPath: "state/normalized.json"
    });
    const alias = buildCliInvocation({
      operation: "workbook",
      runtime: "java",
      inputPath: "state/workbook.json",
      outputPath: "state/normalized.json"
    });

    expect(alias).toEqual(canonical);
    expect(getMcpToolName("workbook")).toBe(getMcpToolName("workbook-export"));
    expect(() => buildCliInvocation({ operation: "state-diff", beforePath: "before.json" }))
      .toThrow(/missing afterPath/);
    expect(() => buildCliInvocation({
      operation: "patch",
      inputPath: "patch.json",
      outputPath: "next.json"
    })).toThrow(/missing statePath/);
    expect(() => buildCliInvocation({
      operation: "xlsx-merge-import",
      runtime: "node",
      statePath: "state.json",
      inputPath: "sheet.xlsx",
      outputPath: "next.json"
    })).toThrow(/not supported by node runtime/);
  });

  it("builds a CLI invocation for every registered operation", () => {
    const javaOnlyOperations = new Set([
      "xlsx-merge-import",
      "workbook-import",
      "workbook-merge-import"
    ]);

    for (const operation of Object.keys(operationRegistry)) {
      const invocation = buildCliInvocation({
        operation,
        runtime: javaOnlyOperations.has(operation) ? "java" : "node",
        inputPath: "input.json",
        outputPath: "output.json",
        statePath: "state.json",
        beforePath: "before.json",
        afterPath: "after.json",
        taskUid: "task-1",
        phaseUid: "phase-1",
        select: "uid",
        mode: "scoped",
        rootTaskUid: "task-1",
        maxDepth: 0
      });

      expect(invocation.command).toBe(javaOnlyOperations.has(operation) ? "java" : "node");
      expect(Array.isArray(invocation.args)).toBe(true);
    }
  });

  it("uses MCP metadata only where the operation reference documents it", () => {
    expect(getMcpOperationMetadata("project-overview")).toMatchObject({
      tool: "mikuproject_ai_export_project_overview",
      primaryArtifactRole: "projection"
    });
    expect(getMcpOperationMetadata("patch-validate")).toBeNull();
    expect(getMcpPrimaryArtifactRole("state-diff")).toBeNull();
    expect(getMcpToolName("xlsx-import")).toBe("mikuproject_import_xlsx");
    expect(getMcpToolName("workbook-import")).toBeNull();
  });

  it("returns MCP tool names only for MCP-supported operations", () => {
    expect(getMcpToolName("spec")).toBe("mikuproject_ai_spec");
    expect(getMcpToolName("wbs-markdown-export")).toBe("mikuproject_report_wbs_markdown");
    expect(getMcpToolName("wbs-xlsx-export")).toBe("mikuproject_report_wbs_xlsx");
    expect(getMcpToolName("daily-svg-export")).toBe("mikuproject_report_daily_svg");
    expect(getMcpToolName("weekly-svg-export")).toBe("mikuproject_report_weekly_svg");
    expect(getMcpToolName("monthly-calendar-svg-export")).toBe("mikuproject_report_monthly_calendar_svg");
    expect(getMcpToolName("all-report-export")).toBe("mikuproject_report_all");
  });

  it("describes HTTP MCP content-mode fields and primary artifact roles", () => {
    expect(getMcpOperationMetadata("draft")).toMatchObject({
      tool: "mikuproject_state_from_draft",
      inlineInputFields: ["draftContent"],
      outputModes: ["path", "content"],
      primaryArtifactRole: "workbook_state"
    });
    expect(getMcpOperationMetadata("wbs-markdown-export")).toMatchObject({
      tool: "mikuproject_report_wbs_markdown",
      inlineInputFields: ["workbookContent"],
      outputModes: ["path", "content"],
      primaryArtifactRole: "report_output"
    });
    expect(getMcpOperationMetadata("wbs-xlsx-export")).toMatchObject({
      outputModes: ["path", "base64"],
      primaryArtifactRole: "report_output"
    });
  });

  it("extracts workbook content from the primary MCP artifact, not top-level text", () => {
    const result = {
      ok: true,
      operation: "mikuproject_state_from_draft",
      artifacts: [
        {
          role: "workbook_state",
          text: "{\"format\":\"mikuproject_workbook_json\"}",
          mimeType: "application/json"
        },
        {
          role: "operation_summary",
          text: "{\"ok\":true}",
          mimeType: "application/json"
        },
        {
          role: "diagnostics_log",
          text: "{\"diagnostics\":[]}",
          mimeType: "application/json"
        }
      ],
      stdout: "{\"format\":\"legacy_stdout_fallback\"}"
    };

    expect(getMcpPrimaryArtifactRole("draft")).toBe("workbook_state");
    expect(extractMcpPrimaryArtifact(result, "draft")).toEqual({
      role: "workbook_state",
      text: "{\"format\":\"mikuproject_workbook_json\"}",
      mimeType: "application/json"
    });
    expect(extractMcpPrimaryArtifactText(result, "draft")).toBe(
      "{\"format\":\"mikuproject_workbook_json\"}"
    );
    expect(result.text).toBeUndefined();
  });

  it("extracts report content by role even when operation artifacts are inlined", () => {
    const result = {
      ok: true,
      operation: "mikuproject_report_wbs_markdown",
      artifacts: [
        {
          role: "operation_summary",
          text: "{\"ok\":true}",
          mimeType: "application/json"
        },
        {
          role: "report_output",
          text: "# WBS",
          mimeType: "text/markdown"
        },
        {
          role: "diagnostics_log",
          text: "{\"diagnostics\":[]}",
          mimeType: "application/json"
        }
      ]
    };

    expect(extractMcpPrimaryArtifactText(result, "wbs-markdown-export")).toBe("# WBS");
  });

  it("falls back to stdout for older MCP text results without inline artifact text", () => {
    const result = {
      ok: true,
      operation: "mikuproject_state_from_draft",
      artifacts: [
        {
          role: "workbook_state",
          uri: "mikuproject://state/current",
          path: "/tmp/current-workbook.json"
        }
      ],
      stdout: "{\"format\":\"mikuproject_workbook_json\"}"
    };

    expect(extractMcpPrimaryArtifactText(result, "draft")).toBe(
      "{\"format\":\"mikuproject_workbook_json\"}"
    );
  });
});
