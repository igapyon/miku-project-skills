import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

import { describe, expect, it } from "vitest";

import { resolveRuntimeArtifactPath } from "../skills/igapyon-miku-project/lib/runtime-artifacts.mjs";

const ROOT = process.cwd();
const runtimeRoot = path.resolve(ROOT, "skills/igapyon-miku-project/runtime");
const compatibility = JSON.parse(
  fs.readFileSync(
    path.resolve(runtimeRoot, "../references/runtime/help-compatibility.json"),
    "utf8"
  )
);

function runHelp(command, args) {
  const result = spawnSync(command, args, {
    cwd: ROOT,
    encoding: "buffer"
  });

  return {
    status: result.status,
    stdout: result.stdout,
    stderr: result.stderr
  };
}

function expectSuccessfulHelp(result) {
  expect(result.status).toBe(0);
  expect(Buffer.isBuffer(result.stdout)).toBe(true);
  expect(Buffer.isBuffer(result.stderr)).toBe(true);
  expect(result.stdout.at(-1)).toBe(0x0a);
  expect(result.stderr).toHaveLength(0);
  expect(Buffer.from(result.stdout.toString("utf8"), "utf8")).toEqual(result.stdout);
}

function getSharedUsageLines(text, runtime) {
  const lines = text.split(/\r?\n/);
  const startMarker = runtime === "node"
    ? "Usage:"
    : "Shared Node-compatible commands:";
  const endMarker = runtime === "node"
    ? "Description:"
    : "Java extensions:";
  const start = lines.indexOf(startMarker);
  const end = lines.indexOf(endMarker, start + 1);

  return lines
    .slice(start + 1, end)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^miku-project\s+/, ""));
}

function getJavaOnlyUsageLines(text) {
  const lines = text.split(/\r?\n/);
  const start = lines.indexOf("Java extensions:");

  return lines.slice(start + 1).map((line) => line.trim()).filter(Boolean);
}

function getCommandUsageLine(lines, command) {
  return lines.find((line) => line === command || line.startsWith(`${command} `));
}

describe("miku-project runtime help compatibility", () => {
  it("records compatible help vocabulary and documented runtime differences", () => {
    const nodeRuntimePath = resolveRuntimeArtifactPath({ kind: "node", runtimeRoot });
    const javaRuntimePath = resolveRuntimeArtifactPath({ kind: "java", runtimeRoot });
    const nodeHelp = runHelp("node", [nodeRuntimePath, "--help"]);
    const javaHelp = runHelp("java", ["-jar", javaRuntimePath, "--help"]);

    expectSuccessfulHelp(nodeHelp);
    expectSuccessfulHelp(javaHelp);

    const nodeText = nodeHelp.stdout.toString("utf8");
    const javaText = javaHelp.stdout.toString("utf8");
    const nodeUsageLines = getSharedUsageLines(nodeText, "node");
    const javaUsageLines = getSharedUsageLines(javaText, "java");
    for (const fragment of compatibility.sharedFragments) {
      expect(nodeUsageLines.join("\n")).toContain(fragment);
      expect(javaUsageLines.join("\n")).toContain(fragment);
    }
    for (const [command, options] of Object.entries(compatibility.sharedOptionsByCommand)) {
      const nodeLine = getCommandUsageLine(nodeUsageLines, command);
      const javaLine = getCommandUsageLine(javaUsageLines, command);
      expect(nodeLine, `Node Usage line for ${command}`).toBeDefined();
      expect(javaLine, `Java Usage line for ${command}`).toBeDefined();
      for (const option of options) {
        expect(nodeLine).toContain(option);
        expect(javaLine).toContain(option);
      }
    }
    for (const [command, runtimeExamples] of Object.entries(compatibility.runtimeSpecificUsage)) {
      const nodeLine = getCommandUsageLine(nodeUsageLines, command);
      const javaLine = getCommandUsageLine(javaUsageLines, command);
      expect(nodeLine).toContain(runtimeExamples.node);
      expect(javaLine).toContain(runtimeExamples.java);
    }
    const javaOnlyUsageLines = getJavaOnlyUsageLines(javaText);
    for (const fragment of compatibility.javaOnlyFragments) {
      expect(javaOnlyUsageLines.join("\n")).toContain(fragment);
      expect(nodeUsageLines.join("\n")).not.toContain(fragment);
    }
    for (const fragment of compatibility.nodeOnlyFragments) {
      expect(nodeUsageLines.join("\n")).toContain(fragment);
      expect(javaOnlyUsageLines.join("\n")).not.toContain(fragment);
    }

    const nodeVersion = runHelp("node", [resolveRuntimeArtifactPath({ kind: "node", runtimeRoot }), "--version"]);
    const javaVersion = runHelp("java", ["-jar", resolveRuntimeArtifactPath({ kind: "java", runtimeRoot }), "--version"]);
    expectSuccessfulHelp(nodeVersion);
    expectSuccessfulHelp(javaVersion);
    expect(nodeVersion.stdout.toString("utf8")).toBe(`miku-project ${compatibility.nodeArtifactVersion}\n`);
    expect(javaVersion.stdout.toString("utf8")).toBe(`miku-project ${compatibility.javaArtifactVersion}\n`);
  });
});
