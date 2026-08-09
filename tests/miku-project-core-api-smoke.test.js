import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

import { afterEach, describe, expect, it } from "vitest";

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
  });
});

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
