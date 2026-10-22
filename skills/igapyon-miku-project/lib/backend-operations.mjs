import { resolveRuntimeArtifactPath } from "./runtime-artifacts.mjs";

export const DEFAULT_JAVA_RUNTIME_KIND = "java";
export const DEFAULT_NODE_RUNTIME_KIND = "node";

const BOTH_RUNTIMES = ["java", "node"];
const JAVA_ONLY = ["java"];

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
    runtimeSupport: BOTH_RUNTIMES,
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
    runtimeSupport: BOTH_RUNTIMES,
    pathArguments: [["inputPath", "--in"], ["outputPath", "--out"]],
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
    runtimeSupport: BOTH_RUNTIMES,
    pathArguments: [["statePath", "--state"], ["inputPath", "--in"], ["outputPath", "--out"]],
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
    runtimeSupport: BOTH_RUNTIMES,
    pathArguments: [["inputPath", "--in"], ["outputPath", "--out"]],
    requires: ["inputPath", "outputPath"]
  },
  workbook: {
    aliasOf: "workbook-export"
  },
  "project-overview": projectionOperation(
    ["ai", "export", "project-overview"],
    "mikuproject_ai_export_project_overview"
  ),
  "task-edit": {
    ...projectionOperation(["ai", "export", "task-edit"], "mikuproject_ai_export_task_edit"),
    namedArguments: [["taskUid", "--task-uid"], ["select", "--select"]]
  },
  "phase-detail": {
    ...projectionOperation(["ai", "export", "phase-detail"], "mikuproject_ai_export_phase_detail"),
    namedArguments: [
      ["phaseUid", "--phase-uid"],
      ["select", "--select"],
      ["mode", "--mode"],
      ["rootTaskUid", "--root-task-uid"],
      ["maxDepth", "--max-depth"]
    ]
  },
  "patch-validate": {
    cliArgs: ["ai", "validate-patch"],
    mcpTool: "mikuproject_ai_validate_patch",
    runtimeSupport: BOTH_RUNTIMES,
    pathArguments: [["statePath", "--state"], ["inputPath", "--in"]],
    requires: ["statePath", "inputPath"]
  },
  "state-diff": {
    cliArgs: ["state", "diff"],
    mcpTool: "mikuproject_state_diff",
    runtimeSupport: BOTH_RUNTIMES,
    pathArguments: [["beforePath", "--before"], ["afterPath", "--after"]],
    requires: ["beforePath", "afterPath"]
  },
  "state-summarize": {
    cliArgs: ["state", "summarize"],
    mcpTool: "mikuproject_state_summarize",
    runtimeSupport: BOTH_RUNTIMES,
    pathArguments: [["inputPath", "--in"]],
    requires: ["inputPath"]
  },
  "detect-kind": {
    cliArgs: ["ai", "detect-kind"],
    mcpTool: "mikuproject_ai_detect_kind",
    runtimeSupport: BOTH_RUNTIMES,
    pathArguments: [["inputPath", "--in"]],
    requires: ["inputPath"]
  },
  "xml-export": fileOperation(
    ["export", "xml"],
    "mikuproject_export_xml",
    BOTH_RUNTIMES,
    {
      pathInputFields: ["workbookPath"],
      inlineInputFields: ["workbookContent"],
      outputModes: ["path", "content"],
      primaryArtifactRole: "ms_project_xml"
    }
  ),
  "xlsx-import": fileOperation(
    ["import", "xlsx"],
    "mikuproject_import_xlsx",
    BOTH_RUNTIMES,
    {
      pathInputFields: ["xlsxPath"],
      inlineInputFields: ["inputBase64"],
      outputModes: ["path", "content"],
      primaryArtifactRole: "mikuproject_workbook_json"
    }
  ),
  "xlsx-export": fileOperation(
    ["export", "xlsx"],
    "mikuproject_export_xlsx",
    BOTH_RUNTIMES,
    {
      pathInputFields: ["workbookPath"],
      inlineInputFields: ["workbookContent"],
      outputModes: ["path", "base64"],
      primaryArtifactRole: "xlsx_workbook"
    }
  ),
  "xlsx-merge-import": {
    cliArgs: ["merge", "xlsx"],
    mcpTool: null,
    runtimeSupport: JAVA_ONLY,
    pathArguments: [
      ["statePath", "--state"],
      ["inputPath", "--in"],
      ["outputPath", "--out"]
    ],
    requires: ["statePath", "inputPath", "outputPath"]
  },
  "workbook-import": {
    cliArgs: ["state", "import"],
    mcpTool: null,
    runtimeSupport: JAVA_ONLY,
    pathArguments: [["inputPath", "--in"], ["outputPath", "--out"]],
    requires: ["inputPath", "outputPath"]
  },
  "workbook-merge-import": {
    cliArgs: ["state", "merge"],
    mcpTool: null,
    runtimeSupport: JAVA_ONLY,
    pathArguments: [
      ["statePath", "--state"],
      ["inputPath", "--in"],
      ["outputPath", "--out"]
    ],
    requires: ["statePath", "inputPath", "outputPath"]
  },
  "wbs-markdown-export": reportOperation(
    ["report", "wbs-markdown"],
    "mikuproject_report_wbs_markdown",
    ["path", "content"]
  ),
  "mermaid-export": reportOperation(
    ["report", "mermaid"],
    "mikuproject_report_mermaid",
    ["path", "content"]
  ),
  "wbs-xlsx-export": reportOperation(
    ["report", "wbs-xlsx"],
    "mikuproject_report_wbs_xlsx",
    ["path", "base64"]
  ),
  "daily-svg-export": reportOperation(
    ["report", "daily-svg"],
    "mikuproject_report_daily_svg",
    ["path", "content"]
  ),
  "weekly-svg-export": reportOperation(
    ["report", "weekly-svg"],
    "mikuproject_report_weekly_svg",
    ["path", "content"]
  ),
  "monthly-calendar-svg-export": reportOperation(
    ["report", "monthly-calendar-svg"],
    "mikuproject_report_monthly_calendar_svg",
    ["path", "base64"]
  ),
  "all-report-export": reportOperation(
    ["report", "all"],
    "mikuproject_report_all",
    ["path", "base64"]
  )
};

export const operationCapabilities = Object.fromEntries(
  Object.keys(operationRegistry).map((operation) => {
    const definition = getOperationDefinition(operation);
    return [operation, {
      cli: Boolean(definition?.cliArgs),
      mcp: Boolean(definition?.mcpTool)
    }];
  })
);

export function buildCliInvocation({
  operation,
  runtime = "java",
  inputPath,
  outputPath,
  statePath,
  beforePath,
  afterPath,
  taskUid,
  phaseUid,
  select,
  mode,
  rootTaskUid,
  maxDepth,
  javaRuntimePath,
  nodeRuntimePath
} = {}) {
  const definition = getOperationDefinition(operation);
  if (!definition?.cliArgs) {
    throw new Error(`unsupported CLI operation: ${operation}`);
  }

  assertRequiredFields(definition.requires, {
    inputPath,
    outputPath,
    statePath,
    beforePath,
    afterPath
  }, operation);

  if (!definition.runtimeSupport.includes(runtime)) {
    throw new Error(`CLI operation ${operation} is not supported by ${runtime} runtime`);
  }

  const operationArgs = [...definition.cliArgs];
  appendPathArguments(operationArgs, definition.pathArguments, {
    inputPath,
    outputPath,
    statePath,
    beforePath,
    afterPath
  });
  appendNamedArguments(operationArgs, definition.namedArguments, {
    taskUid,
    phaseUid,
    select,
    mode,
    rootTaskUid,
    maxDepth
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
  return getOperationDefinition(operation)?.mcpTool ?? null;
}

export function getMcpOperationMetadata(operation) {
  return getOperationDefinition(operation)?.mcp ?? null;
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

function projectionOperation(cliArgs, tool) {
  return {
    cliArgs,
    mcpTool: tool,
    mcp: {
      tool,
      pathInputFields: ["workbookPath"],
      inlineInputFields: ["workbookContent"],
      outputModes: ["path", "content"],
      primaryArtifactRole: "projection"
    },
    runtimeSupport: BOTH_RUNTIMES,
    pathArguments: [["inputPath", "--in"], ["outputPath", "--out"]],
    requires: ["inputPath"]
  };
}

function fileOperation(cliArgs, tool, runtimeSupport, mcp) {
  return {
    cliArgs,
    mcpTool: tool,
    mcp: {
      tool,
      ...mcp
    },
    runtimeSupport,
    pathArguments: [["inputPath", "--in"], ["outputPath", "--out"]],
    requires: ["inputPath", "outputPath"]
  };
}

function reportOperation(cliArgs, tool, outputModes) {
  return {
    cliArgs,
    mcpTool: tool,
    mcp: {
      tool,
      pathInputFields: ["workbookPath"],
      inlineInputFields: ["workbookContent"],
      outputModes,
      primaryArtifactRole: "report_output"
    },
    runtimeSupport: BOTH_RUNTIMES,
    pathArguments: [["inputPath", "--in"], ["outputPath", "--out"]],
    requires: ["inputPath", "outputPath"]
  };
}

function getOperationDefinition(operation) {
  const definition = operationRegistry[operation];
  if (!definition?.aliasOf) {
    return definition;
  }
  return operationRegistry[definition.aliasOf];
}

function appendPathArguments(args, pathArguments = [], values) {
  for (const [field, option] of pathArguments) {
    const value = values[field];
    if (value !== undefined && value !== null) {
      args.push(option, value);
    }
  }
}

function appendNamedArguments(args, namedArguments = [], values) {
  for (const [field, option] of namedArguments) {
    const value = values[field];
    if (value !== undefined && value !== null) {
      args.push(option, String(value));
    }
  }
}

function assertRequiredFields(requiredFields = [], values, operation) {
  for (const field of requiredFields) {
    if (values[field] === undefined || values[field] === null || values[field] === "") {
      throw new Error(`missing ${field} for operation: ${operation}`);
    }
  }
}
