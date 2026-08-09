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
    for (const fragment of compatibility.sharedFragments) {
      expect(nodeText).toContain(fragment);
      expect(javaText).toContain(fragment);
    }
    for (const fragment of compatibility.javaOnlyFragments) {
      expect(javaText).toContain(fragment);
      expect(nodeText).not.toContain(fragment);
    }
    for (const fragment of compatibility.nodeOnlyFragments) {
      expect(nodeText).toContain(fragment);
      expect(javaText).not.toContain(fragment);
    }
  });
});
