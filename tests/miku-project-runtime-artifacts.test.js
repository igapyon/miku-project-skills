import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

import { afterEach, describe, expect, it } from "vitest";

import {
  DEFAULT_RUNTIME_ROOT,
  resolveRuntimeArtifact,
  resolveRuntimeArtifactPath
} from "../skills/igapyon-miku-project/lib/runtime-artifacts.mjs";

const ROOT = process.cwd();
const helperPath = path.resolve(ROOT, "skills/igapyon-miku-project/lib/runtime-artifacts.mjs");

describe("miku-project runtime artifact paths", () => {
  const tempDirs = [];

  afterEach(() => {
    while (tempDirs.length > 0) {
      fs.rmSync(tempDirs.pop(), { recursive: true, force: true });
    }
  });

  it("uses an absolute Skill-relative default and returns absolute artifact paths", () => {
    expect(path.isAbsolute(DEFAULT_RUNTIME_ROOT)).toBe(true);
    expect(resolveRuntimeArtifactPath({ kind: "java" })).toBe(
      path.resolve(DEFAULT_RUNTIME_ROOT, "miku-project-1.1.2.jar")
    );
    expect(resolveRuntimeArtifactPath({ kind: "node" })).toBe(
      path.resolve(DEFAULT_RUNTIME_ROOT, "miku-project-1.1.2.mjs")
    );
  });

  it("resolves an explicit relative runtime root from the caller cwd without confusing sources", () => {
    const tempRoot = makeTempRoot("runtime-root-test-", tempDirs);
    const runtimeRoot = path.resolve(tempRoot, "runtime files");
    fs.mkdirSync(runtimeRoot);
    for (const name of [
      "miku-project-0.9.9.jar",
      "miku-project-0.10.0.jar",
      "miku-project-0.10.0.mjs",
      "miku-project-sources-0.10.0.jar",
      "miku-project-sources-0.10.0.tgz"
    ]) {
      fs.writeFileSync(path.resolve(runtimeRoot, name), "fixture");
    }

    const relativeRuntimeRoot = path.relative(ROOT, runtimeRoot);
    expect(resolveRuntimeArtifact({ kind: "java", runtimeRoot: relativeRuntimeRoot })).toMatchObject({
      name: "miku-project-0.10.0.jar",
      path: path.resolve(runtimeRoot, "miku-project-0.10.0.jar"),
      version: "0.10.0"
    });
    expect(resolveRuntimeArtifact({ kind: "node-sources", runtimeRoot }).path).toBe(
      path.resolve(runtimeRoot, "miku-project-sources-0.10.0.tgz")
    );
  });

  it("resolves defaults from an unrelated cwd using the imported helper location", () => {
    const tempRoot = makeTempRoot("unrelated-workspace-", tempDirs);
    const fakeRuntimeRoot = path.resolve(
      tempRoot,
      "skills/igapyon-miku-project/runtime"
    );
    fs.mkdirSync(fakeRuntimeRoot, { recursive: true });
    fs.writeFileSync(path.resolve(fakeRuntimeRoot, "miku-project-99.0.0.jar"), "impostor");
    fs.writeFileSync(path.resolve(fakeRuntimeRoot, "miku-project-99.0.0.mjs"), "impostor");

    const moduleUrl = pathToFileURL(helperPath).href;
    const result = JSON.parse(execFileSync(process.execPath, [
      "--input-type=module",
      "-e",
      `
        const runtime = await import(${JSON.stringify(moduleUrl)});
        const { buildCliInvocation } = await import(${JSON.stringify(
          pathToFileURL(path.resolve(ROOT, "skills/igapyon-miku-project/lib/backend-operations.mjs")).href
        )});
        process.stdout.write(JSON.stringify({
          node: runtime.resolveRuntimeArtifactPath({ kind: "node" }),
          java: runtime.resolveRuntimeArtifactPath({ kind: "java" }),
          invocation: buildCliInvocation({ operation: "spec", runtime: "node" })
        }));
      `
    ], {
      cwd: tempRoot,
      encoding: "utf8"
    }));

    expect(result.node).toBe(path.resolve(DEFAULT_RUNTIME_ROOT, "miku-project-1.1.2.mjs"));
    expect(result.java).toBe(path.resolve(DEFAULT_RUNTIME_ROOT, "miku-project-1.1.2.jar"));
    expect(result.invocation.args[0]).toBe(result.node);
    expect(result.node).not.toContain(tempRoot);
    expect(fs.existsSync(result.node)).toBe(true);
  });
});

function makeTempRoot(prefix, tempDirs) {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  tempDirs.push(tempRoot);
  return tempRoot;
}
