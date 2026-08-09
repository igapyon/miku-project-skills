import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

import { afterEach, describe, expect, it } from "vitest";

import { resolveRuntimeArtifactPath } from "../skills/igapyon-miku-project/lib/runtime-artifacts.mjs";

const ROOT = process.cwd();
const packageJson = JSON.parse(fs.readFileSync(path.resolve(ROOT, "package.json"), "utf8"));
const releaseZipPath = path.resolve(
  ROOT,
  `bundle/${packageJson.name}-${packageJson.version}.zip`
);
const sourcePolicyConfigPath = path.resolve(
  ROOT,
  "skills/igapyon-miku-project/config/backend-policy.json"
);
const sourceIndexPath = path.resolve(ROOT, "skills/igapyon-miku-project/index.json");
const builtPolicyConfigPath = path.resolve(
  ROOT,
  "bundle/miku-project-skills/skills/igapyon-miku-project/config/backend-policy.json"
);
const builtIndexPath = path.resolve(
  ROOT,
  "bundle/miku-project-skills/skills/igapyon-miku-project/index.json"
);

describe("miku-project bundle smoke", () => {
  const tempDirs = [];

  afterEach(() => {
    while (tempDirs.length > 0) {
      fs.rmSync(tempDirs.pop(), { recursive: true, force: true });
    }
  });

  it("runs bundled runtime artifacts from an isolated release ZIP", () => {
    execFileSync("npm", ["run", "build:bundle:zip"], {
      cwd: ROOT,
      encoding: "utf8"
    });

    const builtRuntimeRoot = path.resolve(
      ROOT,
      "bundle/miku-project-skills/skills/igapyon-miku-project/runtime"
    );
    const builtNodeRuntimePath = resolveRuntimeArtifactPath({
      kind: "node",
      runtimeRoot: builtRuntimeRoot
    });
    const builtJavaRuntimePath = resolveRuntimeArtifactPath({
      kind: "java",
      runtimeRoot: builtRuntimeRoot
    });
    const builtJavaSourcesPath = resolveRuntimeArtifactPath({
      kind: "java-sources",
      runtimeRoot: builtRuntimeRoot
    });
    const builtNodeSourcesPath = resolveRuntimeArtifactPath({
      kind: "node-sources",
      runtimeRoot: builtRuntimeRoot
    });

    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "miku-project-bundle-test-"));
    tempDirs.push(tempRoot);

    execFileSync("unzip", ["-q", releaseZipPath, "-d", tempRoot], {
      cwd: ROOT,
      encoding: "utf8"
    });

    const archiveEntries = execFileSync("unzip", ["-Z1", releaseZipPath], {
      cwd: ROOT,
      encoding: "utf8"
    })
      .split("\n")
      .filter(Boolean);

    const isolatedSkillRoot = path.resolve(tempRoot, "skills");
    const isolatedRuntimeRoot = path.resolve(isolatedSkillRoot, "igapyon-miku-project/runtime");
    const isolatedNodeRuntimePath = resolveRuntimeArtifactPath({
      kind: "node",
      runtimeRoot: isolatedRuntimeRoot
    });
    const isolatedJavaRuntimePath = resolveRuntimeArtifactPath({
      kind: "java",
      runtimeRoot: isolatedRuntimeRoot
    });

    const nodeHelp = execFileSync("node", [isolatedNodeRuntimePath, "--help"], {
      cwd: tempRoot,
      encoding: "utf8"
    });
    const nodeVersion = execFileSync("node", [isolatedNodeRuntimePath, "--version"], {
      cwd: tempRoot,
      encoding: "utf8"
    });
    const javaHelp = execFileSync("java", ["-jar", isolatedJavaRuntimePath], {
      cwd: tempRoot,
      encoding: "utf8"
    });
    const javaVersion = execFileSync("java", ["-jar", isolatedJavaRuntimePath, "--version"], {
      cwd: tempRoot,
      encoding: "utf8"
    });

    expect(fs.existsSync(builtNodeRuntimePath)).toBe(true);
    expect(fs.existsSync(builtJavaRuntimePath)).toBe(true);
    expect(fs.existsSync(builtJavaSourcesPath)).toBe(true);
    expect(fs.existsSync(builtNodeSourcesPath)).toBe(true);
    expect(fs.existsSync(builtIndexPath)).toBe(true);
    expect(fs.existsSync(path.resolve(ROOT, "bundle/miku-project-skills/skills/igapyon-miku-project/.DS_Store"))).toBe(false);
    expect(fs.existsSync(path.resolve(ROOT, "bundle/miku-project-skills/skills/igapyon-miku-project/runtime/.DS_Store"))).toBe(false);
    expect(fs.existsSync(path.resolve(isolatedSkillRoot, "igapyon-miku-project/.DS_Store"))).toBe(false);
    expect(fs.existsSync(path.resolve(isolatedRuntimeRoot, ".DS_Store"))).toBe(false);
    expect(archiveEntries).toEqual(
      expect.arrayContaining([
        "skills/igapyon-miku-project/SKILL.md",
        "skills/igapyon-miku-project/index.json",
        "skills/igapyon-miku-project/agents/openai.yaml",
        "skills/igapyon-miku-project/config/backend-policy.json",
        "skills/igapyon-miku-project/lib/runtime-artifacts.mjs",
        "skills/igapyon-miku-project/lib/backend-policy.mjs",
        "skills/igapyon-miku-project/lib/backend-operations.mjs",
        "skills/igapyon-miku-project/references/INDEX.md",
        "skills/igapyon-miku-project/references/runtime/artifact-provenance.md",
        "skills/igapyon-miku-project/references/runtime/help-compatibility.json",
        "skills/igapyon-miku-project/references/runtime/operations-map.md",
        "skills/igapyon-miku-project/references/runtime/upstream-map.md",
        `skills/igapyon-miku-project/runtime/${path.basename(builtJavaRuntimePath)}`,
        `skills/igapyon-miku-project/runtime/${path.basename(builtNodeRuntimePath)}`,
        `skills/igapyon-miku-project/runtime/${path.basename(builtJavaSourcesPath)}`,
        `skills/igapyon-miku-project/runtime/${path.basename(builtNodeSourcesPath)}`
      ])
    );
    expect(
      archiveEntries.some((entry) =>
        /(^|\/)(\.DS_Store|tests|docs|bundle|node_modules|workplace|tmp|output|state)(\/|$)/.test(
          entry
        )
      )
    ).toBe(false);
    expect(JSON.parse(fs.readFileSync(builtPolicyConfigPath, "utf8"))).toEqual(
      JSON.parse(fs.readFileSync(sourcePolicyConfigPath, "utf8"))
    );
    const skillIndex = JSON.parse(fs.readFileSync(sourceIndexPath, "utf8"));
    expect(skillIndex.files.map((file) => file.path)).toEqual(
      expect.arrayContaining(["SKILL.md", "references/INDEX.md"])
    );
    expect(JSON.parse(fs.readFileSync(builtIndexPath, "utf8"))).toEqual(skillIndex);
    expect(nodeHelp).toContain("miku-project report all");
    expect(nodeVersion).toMatch(/^miku-project \d+\.\d+\.\d+/);
    expect(javaHelp).toContain("ai spec");
    expect(javaVersion).toMatch(/^miku-project \d+\.\d+\.\d+/);
  });
});
