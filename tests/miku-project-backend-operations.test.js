import { describe, expect, it } from "vitest";

import {
  buildCliInvocation,
  extractMcpPrimaryArtifact,
  extractMcpPrimaryArtifactText,
  getMcpOperationMetadata,
  getMcpPrimaryArtifactRole,
  getMcpToolName,
  operationCapabilities
} from "../skills/igapyon-miku-project/lib/backend-operations.mjs";
import { resolveRuntimeArtifactPath } from "../skills/igapyon-miku-project/lib/runtime-artifacts.mjs";

const javaRuntimePath = resolveRuntimeArtifactPath({ kind: "java" });
const nodeRuntimePath = resolveRuntimeArtifactPath({ kind: "node" });

describe("miku-project backend operation registry", () => {
  it("exposes operation capabilities for backend policy selection", () => {
    expect(operationCapabilities["spec"]).toEqual({ cli: true, mcp: true });
    expect(operationCapabilities["wbs-markdown-export"]).toEqual({ cli: true, mcp: true });
    expect(operationCapabilities["wbs-xlsx-export"]).toEqual({ cli: true, mcp: true });
    expect(operationCapabilities["daily-svg-export"]).toEqual({ cli: true, mcp: true });
    expect(operationCapabilities["weekly-svg-export"]).toEqual({ cli: true, mcp: true });
    expect(operationCapabilities["monthly-calendar-svg-export"]).toEqual({ cli: true, mcp: true });
    expect(operationCapabilities["all-report-export"]).toEqual({ cli: true, mcp: true });
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
