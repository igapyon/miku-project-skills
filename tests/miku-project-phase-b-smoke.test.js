import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

import { afterEach, describe, expect, it } from "vitest";

import { resolveRuntimeArtifactPath } from "../skills/igapyon-miku-project/lib/runtime-artifacts.mjs";

const ROOT = process.cwd();
const nodeRuntimePath = resolveRuntimeArtifactPath({
  kind: "node",
  runtimeRoot: path.resolve(ROOT, "skills/igapyon-miku-project/runtime")
});
const javaRuntimePath = resolveRuntimeArtifactPath({
  kind: "java",
  runtimeRoot: path.resolve(ROOT, "skills/igapyon-miku-project/runtime")
});

describe("miku-project file workflow smoke", () => {
  const tempDirs = [];

  afterEach(() => {
    while (tempDirs.length > 0) {
      fs.rmSync(tempDirs.pop(), { recursive: true, force: true });
    }
  });

  it("supports workbook JSON, XML, XLSX, and Markdown report CLI flows", () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "miku-project-file-workflow-test-"));
    tempDirs.push(tempRoot);

    const draftPath = path.resolve(tempRoot, "draft.editjson");
    const workbookPath = path.resolve(tempRoot, "workbook.json");
    const xmlPath = path.resolve(tempRoot, "project.xml");
    const xlsxPath = path.resolve(tempRoot, "project.xlsx");
    const javaXlsxPath = path.resolve(tempRoot, "java-project.xlsx");
    const nodeImportedWorkbookPath = path.resolve(tempRoot, "node-imported-workbook.json");
    const javaImportedWorkbookPath = path.resolve(tempRoot, "java-imported-workbook.json");
    const nodeImportedJavaXlsxPath = path.resolve(tempRoot, "node-imported-java-xlsx.json");
    const javaImportedNodeXlsxPath = path.resolve(tempRoot, "java-imported-node-xlsx.json");
    const markdownPath = path.resolve(tempRoot, "wbs.md");
    fs.writeFileSync(draftPath, `${JSON.stringify(buildDraft(), null, 2)}\n`, "utf8");

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

    const workbookJson = execFileSync("node", [
      nodeRuntimePath,
      "export",
      "workbook-json",
      "--in",
      workbookPath
    ], {
      cwd: tempRoot,
      encoding: "utf8"
    });
    expect(JSON.parse(workbookJson).format).toBe("mikuproject_workbook_json");

    const xmlText = execFileSync("node", [
      nodeRuntimePath,
      "export",
      "xml",
      "--in",
      workbookPath,
      "--out",
      xmlPath
    ], {
      cwd: tempRoot,
      encoding: "utf8"
    });
    expect(xmlText).toBe("");
    expect(fs.readFileSync(xmlPath, "utf8")).toContain("<Project");

    execFileSync("node", [
      nodeRuntimePath,
      "export",
      "xlsx",
      "--in",
      workbookPath,
      "--out",
      xlsxPath
    ], {
      cwd: tempRoot,
      encoding: "utf8"
    });
    expect(fs.statSync(xlsxPath).size).toBeGreaterThan(0);

    execFileSync("java", [
      "-jar",
      javaRuntimePath,
      "export",
      "xlsx",
      "--in",
      workbookPath,
      "--out",
      javaXlsxPath
    ], { cwd: tempRoot, encoding: "utf8" });
    expect(fs.statSync(javaXlsxPath).size).toBeGreaterThan(0);

    execFileSync("node", [
      nodeRuntimePath,
      "import",
      "xlsx",
      "--in",
      xlsxPath,
      "--out",
      nodeImportedWorkbookPath
    ], { cwd: tempRoot, encoding: "utf8" });
    execFileSync("java", [
      "-jar",
      javaRuntimePath,
      "import",
      "xlsx",
      "--in",
      javaXlsxPath,
      "--out",
      javaImportedWorkbookPath
    ], { cwd: tempRoot, encoding: "utf8" });
    execFileSync("node", [
      nodeRuntimePath,
      "import",
      "xlsx",
      "--in",
      javaXlsxPath,
      "--out",
      nodeImportedJavaXlsxPath
    ], { cwd: tempRoot, encoding: "utf8" });
    execFileSync("java", [
      "-jar",
      javaRuntimePath,
      "import",
      "xlsx",
      "--in",
      xlsxPath,
      "--out",
      javaImportedNodeXlsxPath
    ], { cwd: tempRoot, encoding: "utf8" });

    for (const importedPath of [
      nodeImportedWorkbookPath,
      javaImportedWorkbookPath,
      nodeImportedJavaXlsxPath,
      javaImportedNodeXlsxPath
    ]) {
      const imported = JSON.parse(fs.readFileSync(importedPath, "utf8"));
      expect(imported.format).toBe("mikuproject_workbook_json");
      expect(imported.sheets.Project).toContainEqual({ Field: "Name", Value: "File Workflow Smoke" });
      expect(imported.sheets.Tasks.map((task) => task.Name)).toEqual(["Planning", "Review"]);
      expect(imported.sheets.Tasks[1].Milestone).toBe("○");
      expect(imported.sheets.Tasks[1].Predecessors).toBe("1");
    }

    execFileSync("node", [
      nodeRuntimePath,
      "report",
      "wbs-markdown",
      "--in",
      workbookPath,
      "--out",
      markdownPath
    ], {
      cwd: tempRoot,
      encoding: "utf8"
    });
    expect(fs.readFileSync(markdownPath, "utf8")).toContain("# WBS");
  });
});

function buildDraft() {
  return {
    view_type: "project_draft_view",
    project: {
      name: "File Workflow Smoke",
      planned_start: "2026-04-01",
      planned_finish: "2026-04-05"
    },
    tasks: [
      {
        uid: "draft-1",
        name: "Planning",
        parent_uid: null,
        position: 0,
        planned_start: "2026-04-01",
        planned_finish: "2026-04-02"
      },
      {
        uid: "draft-2",
        name: "Review",
        parent_uid: null,
        position: 1,
        is_milestone: true,
        planned_start: "2026-04-05",
        planned_finish: "2026-04-05",
        predecessor_uids: ["draft-1"]
      }
    ],
    resources: [],
    assignments: []
  };
}
