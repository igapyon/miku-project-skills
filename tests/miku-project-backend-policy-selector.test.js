import { describe, expect, it } from "vitest";

import {
  planBackendExecution
} from "../skills/igapyon-miku-project/lib/backend-policy.mjs";

describe("miku-project backend policy selector", () => {
  it("does not use MCP fallback under cli-only", () => {
    const plan = planBackendExecution({
      policy: "cli-only",
      operation: "spec",
      unavailableBackends: ["cli"]
    });

    expect(plan.mode).toBe("error");
    expect(plan.selectedBackend).toBe(null);
    expect(plan.attemptedBackends).toEqual(["cli"]);
    expect(plan.error.reason).toBe("cli_unavailable");
  });

  it("does not use CLI fallback under mcp-only", () => {
    const plan = planBackendExecution({
      policy: "mcp-only",
      operation: "spec",
      unavailableBackends: ["mcp"]
    });

    expect(plan.mode).toBe("error");
    expect(plan.selectedBackend).toBe(null);
    expect(plan.attemptedBackends).toEqual(["mcp"]);
    expect(plan.error.reason).toBe("mcp_unavailable");
  });

  it("uses MCP fallback under cli-preferred when CLI is unavailable", () => {
    const plan = planBackendExecution({
      policy: "cli-preferred",
      operation: "spec",
      unavailableBackends: ["cli"]
    });

    expect(plan.mode).toBe("execute");
    expect(plan.selectedBackend).toBe("mcp");
    expect(plan.attemptedBackends).toEqual(["cli", "mcp"]);
    expect(plan.fallback).toEqual({
      from: "cli",
      to: "mcp",
      reason: "cli_unavailable"
    });
  });

  it("uses CLI fallback under mcp-preferred when MCP is unavailable", () => {
    const plan = planBackendExecution({
      policy: "mcp-preferred",
      operation: "spec",
      unavailableBackends: ["mcp"]
    });

    expect(plan.mode).toBe("execute");
    expect(plan.selectedBackend).toBe("cli");
    expect(plan.attemptedBackends).toEqual(["mcp", "cli"]);
    expect(plan.fallback).toEqual({
      from: "mcp",
      to: "cli",
      reason: "mcp_unavailable"
    });
  });

  it("does not execute any backend under handoff-only", () => {
    const plan = planBackendExecution({
      policy: "handoff-only",
      operation: "spec"
    });

    expect(plan.mode).toBe("handoff");
    expect(plan.selectedBackend).toBe(null);
    expect(plan.attemptedBackends).toEqual([]);
    expect(plan.error).toBe(null);
  });

  it("applies the same policy rules to report exports", () => {
    const markdownPlan = planBackendExecution({
      policy: "cli-preferred",
      operation: "wbs-markdown-export",
      unavailableBackends: ["cli"]
    });

    expect(markdownPlan.mode).toBe("execute");
    expect(markdownPlan.selectedBackend).toBe("mcp");
    expect(markdownPlan.fallback).toEqual({
      from: "cli",
      to: "mcp",
      reason: "cli_unavailable"
    });

    const wbsXlsxPlan = planBackendExecution({
      policy: "mcp-only",
      operation: "wbs-xlsx-export"
    });

    expect(wbsXlsxPlan.mode).toBe("execute");
    expect(wbsXlsxPlan.selectedBackend).toBe("mcp");
    expect(wbsXlsxPlan.attemptedBackends).toEqual(["mcp"]);
    expect(wbsXlsxPlan.error).toBe(null);
  });
});
