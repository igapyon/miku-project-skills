import { resolveRuntimeArtifactPath } from "./runtime-artifacts.mjs";

export const DEFAULT_JAVA_RUNTIME_KIND = "java";
export const DEFAULT_NODE_RUNTIME_KIND = "node";

export const operationRegistry = {
  spec: {
    cliArgs: ["ai", "spec"],
    mcpTool: "mikuproject_ai_spec",
    mcp: {
      tool: "mikuproject_ai_spec",
      inputFields: [],
      outputModes: [],
      primaryArtifactRole: "ai_spec"
    },
    requires: []
  },
  draft: {
    cliArgs: ["state", "from-draft"],
    mcpTool: "mikuproject_state_from_draft",
    mcp: {
      tool: "mikuproject_state_from_draft",
      pathInputFields: ["draftPath"],
      inlineInputFields: ["draftContent"],
      outputModes: ["path", "content"],
      primaryArtifactRole: "workbook_state"
    },
    requires: ["inputPath", "outputPath"]
  },
  patch: {
    cliArgs: ["state", "apply-patch"],
    mcpTool: "mikuproject_state_apply_patch",
    mcp: {
      tool: "mikuproject_state_apply_patch",
      pathInputFields: ["statePath", "patchPath"],
      inlineInputFields: ["stateContent", "patchContent"],
      outputModes: ["path", "content"],
      primaryArtifactRole: "workbook_state"
    },
    requires: ["statePath", "inputPath", "outputPath"]
  },
  "workbook-export": {
    cliArgs: ["export", "workbook-json"],
    mcpTool: "mikuproject_export_workbook_json",
    mcp: {
      tool: "mikuproject_export_workbook_json",
      pathInputFields: ["workbookPath"],
      inlineInputFields: ["workbookContent"],
      outputModes: ["path", "content"],
      primaryArtifactRole: "mikuproject_workbook_json"
    },
    requires: ["inputPath", "outputPath"]
  },
  "wbs-markdown-export": {
    cliArgs: ["report", "wbs-markdown"],
    mcpTool: "mikuproject_report_wbs_markdown",
    mcp: {
      tool: "mikuproject_report_wbs_markdown",
      pathInputFields: ["workbookPath"],
      inlineInputFields: ["workbookContent"],
      outputModes: ["path", "content"],
      primaryArtifactRole: "report_output"
    },
    requires: ["inputPath", "outputPath"]
  },
  "mermaid-export": {
    cliArgs: ["report", "mermaid"],
    mcpTool: "mikuproject_report_mermaid",
    mcp: {
      tool: "mikuproject_report_mermaid",
      pathInputFields: ["workbookPath"],
      inlineInputFields: ["workbookContent"],
      outputModes: ["path", "content"],
      primaryArtifactRole: "report_output"
    },
    requires: ["inputPath", "outputPath"]
  },
  "wbs-xlsx-export": {
    cliArgs: ["report", "wbs-xlsx"],
    mcpTool: "mikuproject_report_wbs_xlsx",
    mcp: {
      tool: "mikuproject_report_wbs_xlsx",
      pathInputFields: ["workbookPath"],
      inlineInputFields: ["workbookContent"],
      outputModes: ["path", "base64"],
      primaryArtifactRole: "report_output"
    },
    requires: ["inputPath", "outputPath"]
  },
  "daily-svg-export": {
    cliArgs: ["report", "daily-svg"],
    mcpTool: "mikuproject_report_daily_svg",
    mcp: {
      tool: "mikuproject_report_daily_svg",
      pathInputFields: ["workbookPath"],
      inlineInputFields: ["workbookContent"],
      outputModes: ["path", "content"],
      primaryArtifactRole: "report_output"
    },
    requires: ["inputPath", "outputPath"]
  },
  "weekly-svg-export": {
    cliArgs: ["report", "weekly-svg"],
    mcpTool: "mikuproject_report_weekly_svg",
    mcp: {
      tool: "mikuproject_report_weekly_svg",
      pathInputFields: ["workbookPath"],
      inlineInputFields: ["workbookContent"],
      outputModes: ["path", "content"],
      primaryArtifactRole: "report_output"
    },
    requires: ["inputPath", "outputPath"]
  },
  "monthly-calendar-svg-export": {
    cliArgs: ["report", "monthly-calendar-svg"],
    mcpTool: "mikuproject_report_monthly_calendar_svg",
    mcp: {
      tool: "mikuproject_report_monthly_calendar_svg",
      pathInputFields: ["workbookPath"],
      inlineInputFields: ["workbookContent"],
      outputModes: ["path", "base64"],
      primaryArtifactRole: "report_output"
    },
    requires: ["inputPath", "outputPath"]
  },
  "all-report-export": {
    cliArgs: ["report", "all"],
    mcpTool: "mikuproject_report_all",
    mcp: {
      tool: "mikuproject_report_all",
      pathInputFields: ["workbookPath"],
      inlineInputFields: ["workbookContent"],
      outputModes: ["path", "base64"],
      primaryArtifactRole: "report_output"
    },
    requires: ["inputPath", "outputPath"]
  }
};

export const operationCapabilities = Object.fromEntries(
  Object.entries(operationRegistry).map(([operation, definition]) => [
    operation,
    {
      cli: Boolean(definition.cliArgs),
      mcp: Boolean(definition.mcpTool)
    }
  ])
);

export function buildCliInvocation({
  operation,
  runtime = "java",
  inputPath,
  outputPath,
  statePath,
  javaRuntimePath,
  nodeRuntimePath
} = {}) {
  const definition = operationRegistry[operation];
  if (!definition?.cliArgs) {
    throw new Error(`unsupported CLI operation: ${operation}`);
  }

  assertRequiredFields(definition.requires, {
    inputPath,
    outputPath,
    statePath
  }, operation);

  const operationArgs = [...definition.cliArgs];
  appendPathArgs(operationArgs, {
    inputPath,
    outputPath,
    statePath
  });

  if (runtime === "java") {
    return {
      command: "java",
      args: [
        "-jar",
        javaRuntimePath ?? resolveRuntimeArtifactPath({ kind: DEFAULT_JAVA_RUNTIME_KIND }),
        ...operationArgs
      ]
    };
  }

  if (runtime === "node") {
    return {
      command: "node",
      args: [
        nodeRuntimePath ?? resolveRuntimeArtifactPath({ kind: DEFAULT_NODE_RUNTIME_KIND }),
        ...operationArgs
      ]
    };
  }

  throw new Error(`unsupported CLI runtime: ${runtime}`);
}

export function getMcpToolName(operation) {
  return operationRegistry[operation]?.mcpTool ?? null;
}

export function getMcpOperationMetadata(operation) {
  return operationRegistry[operation]?.mcp ?? null;
}

export function getMcpPrimaryArtifactRole(operation) {
  return getMcpOperationMetadata(operation)?.primaryArtifactRole ?? null;
}

export function extractMcpPrimaryArtifact(result, operation) {
  const primaryRole = getMcpPrimaryArtifactRole(operation);
  if (!primaryRole) {
    return null;
  }

  const artifacts = Array.isArray(result?.artifacts) ? result.artifacts : [];
  return artifacts.find((artifact) => artifact?.role === primaryRole) ?? null;
}

export function extractMcpPrimaryArtifactText(result, operation) {
  const artifact = extractMcpPrimaryArtifact(result, operation);
  if (typeof artifact?.text === "string") {
    return artifact.text;
  }
  if (typeof result?.stdout === "string") {
    return result.stdout;
  }
  return null;
}

function appendPathArgs(args, {
  inputPath,
  outputPath,
  statePath
}) {
  if (statePath) {
    args.push("--state", statePath);
  }
  if (inputPath) {
    args.push("--in", inputPath);
  }
  if (outputPath) {
    args.push("--out", outputPath);
  }
}

function assertRequiredFields(requiredFields, values, operation) {
  for (const field of requiredFields) {
    if (!values[field]) {
      throw new Error(`missing ${field} for operation: ${operation}`);
    }
  }
}
