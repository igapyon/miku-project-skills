import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

import { afterEach, describe, expect, it } from "vitest";

import { resolveRuntimeArtifactPath } from "../skills/igapyon-miku-project/lib/runtime-artifacts.mjs";
import { findMarkdownLinkFailures } from "./helpers/markdown-link-check.mjs";

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
const builtPolicyConfigPath = path.resolve(
  ROOT,
  "bundle/miku-project-skills/skills/igapyon-miku-project/config/backend-policy.json"
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
    const extractedSkillRoot = path.resolve(isolatedSkillRoot, "igapyon-miku-project");
    const installedSkillsRoot = path.resolve(tempRoot, "Installed Skills 日本語");
    const installedSkillRoot = path.resolve(installedSkillsRoot, "igapyon-miku-project");
    fs.mkdirSync(installedSkillsRoot, { recursive: true });
    fs.cpSync(extractedSkillRoot, installedSkillRoot, { recursive: true });
    expect(findMarkdownLinkFailures({
      root: installedSkillRoot,
      confineToRoot: true
    })).toEqual([]);
    const workspace = path.resolve(tempRoot, "作業 workspace");
    fs.mkdirSync(workspace, { recursive: true });
    const workspaceRuntimeRoot = path.resolve(
      workspace,
      "skills/igapyon-miku-project/runtime"
    );
    fs.mkdirSync(workspaceRuntimeRoot, { recursive: true });
    fs.writeFileSync(path.resolve(workspaceRuntimeRoot, "miku-project-99.0.0.jar"), "impostor");
    fs.writeFileSync(path.resolve(workspaceRuntimeRoot, "miku-project-99.0.0.mjs"), "impostor");

    const installedRuntimeRoot = path.resolve(installedSkillRoot, "runtime");
    const isolatedNodeRuntimePath = resolveRuntimeArtifactPath({
      kind: "node",
      runtimeRoot: installedRuntimeRoot
    });
    const isolatedJavaRuntimePath = resolveRuntimeArtifactPath({
      kind: "java",
      runtimeRoot: installedRuntimeRoot
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

    const helperModuleUrl = pathToFileURL(path.resolve(installedSkillRoot, "lib/runtime-artifacts.mjs")).href;
    const operationsModuleUrl = pathToFileURL(path.resolve(installedSkillRoot, "lib/backend-operations.mjs")).href;
    const invocations = JSON.parse(execFileSync(process.execPath, [
      "--input-type=module",
      "-e",
      `
        const runtime = await import(${JSON.stringify(helperModuleUrl)});
        const operations = await import(${JSON.stringify(operationsModuleUrl)});
        process.stdout.write(JSON.stringify({
          nodePath: runtime.resolveRuntimeArtifactPath({ kind: "node" }),
          javaPath: runtime.resolveRuntimeArtifactPath({ kind: "java" }),
          draft: operations.buildCliInvocation({
            operation: "draft",
            runtime: "node",
            inputPath: "draft.editjson",
            outputPath: "workbook.json"
          }),
          summarize: operations.buildCliInvocation({
            operation: "state-summarize",
            runtime: "java",
            inputPath: "workbook.json"
          })
        }));
      `
    ], { cwd: workspace, encoding: "utf8" }));

    const draftPath = path.resolve(workspace, "draft.editjson");
    const workbookPath = path.resolve(workspace, "workbook.json");
    fs.writeFileSync(draftPath, `${JSON.stringify(buildDraft(), null, 2)}\n`, "utf8");
    execFileSync(invocations.draft.command, invocations.draft.args.map((arg) =>
      arg === "draft.editjson" ? draftPath : arg === "workbook.json" ? workbookPath : arg
    ), { cwd: workspace, encoding: "utf8" });
    const summary = execFileSync(invocations.summarize.command, invocations.summarize.args.map((arg) =>
      arg === "workbook.json" ? workbookPath : arg
    ), { cwd: workspace, encoding: "utf8" });

    expect(fs.existsSync(builtNodeRuntimePath)).toBe(true);
    expect(fs.existsSync(builtJavaRuntimePath)).toBe(true);
    expect(fs.existsSync(builtJavaSourcesPath)).toBe(true);
    expect(fs.existsSync(builtNodeSourcesPath)).toBe(true);
    expect(fs.existsSync(path.resolve(ROOT, "bundle/miku-project-skills/skills/igapyon-miku-project/.DS_Store"))).toBe(false);
    expect(fs.existsSync(path.resolve(ROOT, "bundle/miku-project-skills/skills/igapyon-miku-project/runtime/.DS_Store"))).toBe(false);
    expect(fs.existsSync(path.resolve(isolatedSkillRoot, "igapyon-miku-project/.DS_Store"))).toBe(false);
    expect(fs.existsSync(path.resolve(installedRuntimeRoot, ".DS_Store"))).toBe(false);
    expect(archiveEntries).toEqual(
      expect.arrayContaining([
        "skills/igapyon-miku-project/SKILL.md",
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
    expect(nodeHelp).toContain("miku-project report all");
    expect(nodeVersion).toMatch(/^miku-project \d+\.\d+\.\d+/);
    expect(javaHelp).toContain("ai spec");
    expect(javaVersion).toMatch(/^miku-project \d+\.\d+\.\d+/);
    expect(invocations.nodePath).toBe(
      fs.realpathSync(path.resolve(installedRuntimeRoot, "miku-project-0.12.0.mjs"))
    );
    expect(invocations.javaPath).toBe(
      fs.realpathSync(path.resolve(installedRuntimeRoot, "miku-project-0.12.0.jar"))
    );
    expect(invocations.nodePath).not.toContain(workspace);
    expect(invocations.draft.args[0]).toBe(invocations.nodePath);
    expect(invocations.summarize.args[1]).toBe(invocations.javaPath);
    const summaryDocument = JSON.parse(summary);
    expect(summaryDocument.project.name).toBe("Bundle Root Check");
    expect(summaryDocument.summary.task_count).toBe(2);
    expect(summaryDocument.major_milestones[0].name).toBe("Finish");
    expect(fs.existsSync(path.resolve(installedSkillRoot, "workbook.json"))).toBe(false);
  }, 30_000);
});

function buildDraft() {
  return {
    view_type: "project_draft_view",
    project: {
      name: "Bundle Root Check",
      planned_start: "2026-10-01",
      planned_finish: "2026-10-03"
    },
    tasks: [
      {
        uid: "dependency-check",
        name: "Prepare",
        parent_uid: null,
        position: 0,
        planned_start: "2026-10-01",
        planned_finish: "2026-10-02"
      },
      {
        uid: "final-check",
        name: "Finish",
        parent_uid: null,
        position: 1,
        is_milestone: true,
        planned_start: "2026-10-03",
        planned_finish: "2026-10-03",
        predecessor_uids: ["dependency-check"]
      }
    ],
    resources: [],
    assignments: []
  };
}
