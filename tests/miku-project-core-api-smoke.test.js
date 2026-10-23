import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";

import { afterEach, describe, expect, it } from "vitest";

import { buildCliInvocation } from "../skills/igapyon-miku-project/lib/backend-operations.mjs";
import { resolveRuntimeArtifactPath } from "../skills/igapyon-miku-project/lib/runtime-artifacts.mjs";

const ROOT = process.cwd();
const runtimeRoot = path.resolve(ROOT, "skills/igapyon-miku-project/runtime");
const nodeRuntimePath = resolveRuntimeArtifactPath({ kind: "node", runtimeRoot });
const javaRuntimePath = resolveRuntimeArtifactPath({ kind: "java", runtimeRoot });

describe("miku-project runtime artifact smoke", () => {
  const tempDirs = [];

  afterEach(() => {
    while (tempDirs.length > 0) {
      fs.rmSync(tempDirs.pop(), { recursive: true, force: true });
    }
  });

  it("supports spec, draft import, state summary, report bundle, and Java AI exports", () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "miku-project-runtime-test-"));
    tempDirs.push(tempRoot);

    const draftPath = path.resolve(tempRoot, "draft.editjson");
    const workbookPath = path.resolve(tempRoot, "workbook.json");
    const reportPath = path.resolve(tempRoot, "report-bundle.zip");
    fs.writeFileSync(draftPath, `${JSON.stringify(buildDraft(), null, 2)}\n`, "utf8");

    const nodeSpec = execFileSync("node", [nodeRuntimePath, "ai", "spec"], {
      cwd: tempRoot,
      encoding: "utf8"
    });
    expect(nodeSpec).toContain("# miku-project AI JSON Prompt / Spec");

    execFileSync("node", [
      nodeRuntimePath,
      "state",
      "from-draft",
      "--in",
      draftPath,
      "--out",
      workbookPath
    ], {
      cwd: tempRoot,
      encoding: "utf8"
    });
    expect(fs.existsSync(workbookPath)).toBe(true);

    const summary = execFileSync("node", [
      nodeRuntimePath,
      "state",
      "summarize",
      "--in",
      workbookPath
    ], {
      cwd: tempRoot,
      encoding: "utf8"
    });
    expect(summary).toContain("Runtime Artifact Smoke");

    execFileSync("node", [
      nodeRuntimePath,
      "report",
      "all",
      "--in",
      workbookPath,
      "--out",
      reportPath
    ], {
      cwd: tempRoot,
      encoding: "utf8"
    });
    expect(fs.statSync(reportPath).size).toBeGreaterThan(0);

    const javaSpec = execFileSync("java", ["-jar", javaRuntimePath, "ai", "spec"], {
      cwd: tempRoot,
      encoding: "utf8"
    });
    expect(javaSpec).toContain("# miku-project AI JSON Prompt / Spec");

    const javaBundle = execFileSync("java", [
      "-jar",
      javaRuntimePath,
      "ai",
      "export",
      "bundle",
      "--in",
      workbookPath
    ], {
      cwd: tempRoot,
      encoding: "utf8"
    });
    const parsedJavaBundle = JSON.parse(javaBundle);
    expect(parsedJavaBundle.view_type).toBe("ai_projection_bundle");
    expect(parsedJavaBundle.project_overview_view.project.name).toBe("Runtime Artifact Smoke");
    expect(Array.isArray(parsedJavaBundle.phase_detail_views_full)).toBe(true);
    expect(Array.isArray(parsedJavaBundle.task_edit_views_full)).toBe(true);
  }, 15_000);

  it("keeps the existing AI, patch, diff, output-file, and strict-option workflows on both runtimes", () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "miku-project-runtime-v112-test-"));
    tempDirs.push(tempRoot);

    const draftPath = path.resolve(tempRoot, "draft.editjson");
    const draft = buildHierarchicalDraft();
    fs.writeFileSync(draftPath, `${JSON.stringify(draft, null, 2)}\n`, "utf8");

    for (const runtime of [
      { name: "node", prefix: [nodeRuntimePath] },
      { name: "java", prefix: ["-jar", javaRuntimePath] }
    ]) {
      const workbookPath = path.resolve(tempRoot, `${runtime.name}-workbook.json`);
      const originalWorkbook = buildCliInvocation({
        operation: "draft",
        runtime: runtime.name,
        inputPath: draftPath,
        outputPath: workbookPath
      });
      expect(runInvocation(originalWorkbook, tempRoot).status).toBe(0);

      const specPath = path.resolve(tempRoot, `${runtime.name}-spec.md`);
      const specResult = runRaw(runtime, ["ai", "spec", "--out", specPath], tempRoot);
      expectSuccessful(specResult);
      expect(specResult.stdout).toBe("");
      const specFile = fs.readFileSync(specPath, "utf8");
      expect(specFile).toContain("# miku-project AI JSON Prompt / Spec");
      expect(specFile).toContain("### Patch JSON の例");

      const detectPath = path.resolve(tempRoot, `${runtime.name}-detect.txt`);
      const detectResult = runRaw(
        runtime,
        ["ai", "detect-kind", "--in", draftPath, "--out", detectPath],
        tempRoot
      );
      expectSuccessful(detectResult);
      expect(detectResult.stdout).toBe("");
      expect(fs.readFileSync(detectPath, "utf8").trim()).toBe("project_draft_view");

      const workbookJsonPath = path.resolve(tempRoot, `${runtime.name}-workbook-export.json`);
      const exportWorkbook = buildCliInvocation({
        operation: "workbook-export",
        runtime: runtime.name,
        inputPath: workbookPath,
        outputPath: workbookJsonPath
      });
      expect(runInvocation(exportWorkbook, tempRoot).status).toBe(0);
      const workbookJson = JSON.parse(fs.readFileSync(workbookJsonPath, "utf8"));
      const originalRows = workbookJson.sheets.Tasks;
      expect(originalRows.map((task) => task.Name)).toEqual([
        "Release Planning",
        "Kickoff",
        "Implementation"
      ]);
      const implementationRow = originalRows.find((task) => task.Name === "Implementation");
      expect(implementationRow.Predecessors).toBe("2");

      const overviewPath = path.resolve(tempRoot, `${runtime.name}-overview.editjson`);
      const overview = buildCliInvocation({
        operation: "project-overview",
        runtime: runtime.name,
        inputPath: workbookPath,
        outputPath: overviewPath
      });
      expect(runInvocation(overview, tempRoot).status).toBe(0);
      const overviewView = JSON.parse(fs.readFileSync(overviewPath, "utf8"));
      expect(overviewView.view_type).toBe("project_overview_view");
      expect(overviewView.project.name).toBe("Runtime Artifact Smoke");
      expect(overviewView.phases).toHaveLength(1);

      const bundle = JSON.parse(runRaw(runtime, ["ai", "export", "bundle", "--in", workbookPath], tempRoot).stdout);
      expect(bundle.view_type).toBe("ai_projection_bundle");
      expect(bundle.phase_detail_views_full).toHaveLength(1);
      expect(bundle.task_edit_views_full).toHaveLength(2);
      const taskUid = bundle.task_edit_views_full
        .map((view) => view.target_task)
        .find((task) => task.name === "Implementation").uid;
      const phaseUid = bundle.phase_detail_views_full[0].phase.uid;

      const taskEditPath = path.resolve(tempRoot, `${runtime.name}-task.editjson`);
      const taskEdit = buildCliInvocation({
        operation: "task-edit",
        runtime: runtime.name,
        inputPath: workbookPath,
        outputPath: taskEditPath,
        taskUid,
        select: "uid"
      });
      expect(runInvocation(taskEdit, tempRoot).status).toBe(0);
      const taskEditView = JSON.parse(fs.readFileSync(taskEditPath, "utf8"));
      expect(taskEditView.view_type).toBe("task_edit_view");
      expect(taskEditView.target_task.uid).toBe(taskUid);
      expect(taskEditView.predecessors).toHaveLength(1);

      const phasePath = path.resolve(tempRoot, `${runtime.name}-phase.editjson`);
      const phase = buildCliInvocation({
        operation: "phase-detail",
        runtime: runtime.name,
        inputPath: workbookPath,
        outputPath: phasePath,
        phaseUid,
        select: "uid",
        mode: "scoped",
        rootTaskUid: taskUid,
        maxDepth: 0
      });
      expect(runInvocation(phase, tempRoot).status).toBe(0);
      const phaseView = JSON.parse(fs.readFileSync(phasePath, "utf8"));
      expect(phaseView.view_type).toBe("phase_detail_view");
      expect(phaseView.phase.uid).toBe(phaseUid);

      const patchPath = path.resolve(tempRoot, `${runtime.name}-patch.editjson`);
      fs.writeFileSync(patchPath, `${JSON.stringify({
        operations: [{ op: "update_task", uid: taskUid, fields: { name: "Implementation Updated" } }]
      }, null, 2)}\n`, "utf8");
      const validationPath = path.resolve(tempRoot, `${runtime.name}-validation.json`);
      const validation = runRaw(runtime, [
        "ai", "validate-patch", "--state", workbookPath, "--in", patchPath, "--out", validationPath
      ], tempRoot);
      expectSuccessful(validation);
      expect(validation.stdout).toBe("");
      const validationReport = fs.readFileSync(validationPath, "utf8");
      expect(validationReport).toContain("validate-patch");
      expect(validationReport).toContain("warnings=0");
      expect(validationReport).toContain("errors=0");

      const afterPath = path.resolve(tempRoot, `${runtime.name}-after.json`);
      const apply = buildCliInvocation({
        operation: "patch",
        runtime: runtime.name,
        statePath: workbookPath,
        inputPath: patchPath,
        outputPath: afterPath
      });
      expect(runInvocation(apply, tempRoot).status).toBe(0);
      const afterWorkbook = JSON.parse(fs.readFileSync(afterPath, "utf8"));
      const afterTask = afterWorkbook.sheets.Tasks.find((task) => task.Name === "Implementation Updated");
      expect(afterTask).toBeDefined();
      expect(afterTask.Start).toBe(implementationRow.Start);
      expect(afterTask.Finish).toBe(implementationRow.Finish);
      expect(afterTask.Predecessors).toBe(implementationRow.Predecessors);
      expect(JSON.parse(fs.readFileSync(workbookPath, "utf8")).sheets.Tasks
        .find((task) => task.Name === "Implementation").Name).toBe("Implementation");

      const diffPath = path.resolve(tempRoot, `${runtime.name}-diff.json`);
      const diff = runRaw(runtime, [
        "state", "diff", "--before", workbookPath, "--after", afterPath, "--out", diffPath
      ], tempRoot);
      expectSuccessful(diff);
      expect(diff.stdout).toBe("");
      const diffDocument = JSON.parse(fs.readFileSync(diffPath, "utf8"));
      expect(diffDocument.kind).toBe("state_diff_summary");
      expect(diffDocument.comparison_complete).toBe(true);
      expect(diffDocument.changed_items.tasks.map((task) => task.uid)).toContain(taskUid);

      for (const maxDepth of [0, 100]) {
        const maxDepthPath = path.resolve(tempRoot, `${runtime.name}-phase-depth-${maxDepth}.json`);
        const result = runRaw(runtime, [
          "ai", "export", "phase-detail", "--in", workbookPath,
          "--phase-uid", phaseUid, "--select", "uid", "--mode", "scoped",
          "--root-task-uid", taskUid, "--max-depth", String(maxDepth), "--out", maxDepthPath
        ], tempRoot);
        expectSuccessful(result);
        expect(JSON.parse(fs.readFileSync(maxDepthPath, "utf8")).view_type)
          .toBe("phase_detail_view");
      }

      for (const maxDepth of [-1, 101]) {
        const result = runRaw(runtime, [
          "ai", "export", "phase-detail", "--in", workbookPath,
          "--phase-uid", phaseUid, "--select", "uid", "--mode", "scoped",
          "--root-task-uid", taskUid, "--max-depth", String(maxDepth)
        ], tempRoot);
        expect(result.status, `${runtime.name} max-depth ${maxDepth}`).toBe(2);
      }

      const unknownOption = runRaw(runtime, [
        "ai", "export", "phase-detail", "--in", path.resolve(tempRoot, "missing.json"),
        "--unknown-option", "value"
      ], tempRoot);
      expect(unknownOption.status, `${runtime.name} unknown option`).toBe(2);
      expect(`${unknownOption.stdout}\n${unknownOption.stderr}`).not.toMatch(/ENOENT|No such file/i);
    }
  }, 30_000);
});

function runInvocation(invocation, cwd) {
  return spawnSync(invocation.command, invocation.args, {
    cwd,
    encoding: "utf8"
  });
}

function runRaw(runtime, args, cwd) {
  return spawnSync(runtime.name === "node" ? "node" : "java", [...runtime.prefix, ...args], {
    cwd,
    encoding: "utf8"
  });
}

function expectSuccessful(result) {
  expect(result.status).toBe(0);
  expect(result.stderr).toBe("");
}

function buildDraft() {
  return {
    view_type: "project_draft_view",
    project: {
      name: "Runtime Artifact Smoke",
      planned_start: "2026-04-01",
      planned_finish: "2026-04-03"
    },
    tasks: [
      {
        uid: "draft-1",
        name: "Kickoff",
        parent_uid: null,
        position: 0,
        is_milestone: true,
        planned_start: "2026-04-01",
        planned_finish: "2026-04-01"
      },
      {
        uid: "draft-2",
        name: "Implementation",
        parent_uid: null,
        position: 1,
        planned_start: "2026-04-02",
        planned_finish: "2026-04-03",
        predecessor_uids: ["draft-1"]
      }
    ],
    resources: [],
    assignments: []
  };
}

function buildHierarchicalDraft() {
  return {
    view_type: "project_draft_view",
    project: {
      name: "Runtime Artifact Smoke",
      planned_start: "2026-04-01",
      planned_finish: "2026-04-03"
    },
    tasks: [
      {
        uid: "draft-phase",
        name: "Release Planning",
        parent_uid: null,
        position: 0,
        is_summary: true,
        planned_start: "2026-04-01",
        planned_finish: "2026-04-03"
      },
      {
        uid: "draft-1",
        name: "Kickoff",
        parent_uid: "draft-phase",
        position: 0,
        is_milestone: true,
        planned_start: "2026-04-01",
        planned_finish: "2026-04-01"
      },
      {
        uid: "draft-2",
        name: "Implementation",
        parent_uid: "draft-phase",
        position: 1,
        planned_start: "2026-04-02",
        planned_finish: "2026-04-03",
        predecessor_uids: ["draft-1"]
      }
    ],
    resources: [],
    assignments: []
  };
}
