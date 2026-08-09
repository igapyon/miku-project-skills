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

const runtimes = [
  {
    name: "Node.js",
    command: "node",
    prefixArgs: [nodeRuntimePath]
  },
  {
    name: "Java",
    command: "java",
    prefixArgs: ["-jar", javaRuntimePath],
    timeout: 15_000
  }
];

describe("miku-project Phase C report export smoke", () => {
  const tempDirs = [];

  afterEach(() => {
    while (tempDirs.length > 0) {
      fs.rmSync(tempDirs.pop(), { recursive: true, force: true });
    }
  });

  for (const runtime of runtimes) {
    it(`supports WBS XLSX, SVG, Markdown, Mermaid, and report bundle exports with ${runtime.name}`, () => {
      const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "miku-project-phase-c-test-"));
      tempDirs.push(tempRoot);

      const draftPath = path.resolve(tempRoot, "draft.editjson");
      const workbookPath = path.resolve(tempRoot, "workbook.json");
      const wbsXlsxPath = path.resolve(tempRoot, "wbs.xlsx");
      const dailySvgPath = path.resolve(tempRoot, "daily.svg");
      const weeklySvgPath = path.resolve(tempRoot, "weekly.svg");
      const monthlyCalendarPath = path.resolve(tempRoot, "monthly-calendar.zip");
      const markdownPath = path.resolve(tempRoot, "wbs.md");
      const mermaidPath = path.resolve(tempRoot, "mermaid.mmd");
      const reportBundlePath = path.resolve(tempRoot, "report-bundle.zip");

      fs.writeFileSync(draftPath, `${JSON.stringify(buildDraft(), null, 2)}\n`, "utf8");

      runRuntime(runtime, [
        "state",
        "from-draft",
        "--in",
        draftPath,
        "--out",
        workbookPath
      ], tempRoot);

      runRuntime(runtime, [
        "report",
        "wbs-xlsx",
        "--in",
        workbookPath,
        "--out",
        wbsXlsxPath
      ], tempRoot);
      expectZipLikeFile(wbsXlsxPath);

      runRuntime(runtime, [
        "report",
        "daily-svg",
        "--in",
        workbookPath,
        "--out",
        dailySvgPath
      ], tempRoot);
      expect(fs.readFileSync(dailySvgPath, "utf8")).toContain("<svg");

      runRuntime(runtime, [
        "report",
        "weekly-svg",
        "--in",
        workbookPath,
        "--out",
        weeklySvgPath
      ], tempRoot);
      expect(fs.readFileSync(weeklySvgPath, "utf8")).toContain("<svg");

      runRuntime(runtime, [
        "report",
        "monthly-calendar-svg",
        "--in",
        workbookPath,
        "--out",
        monthlyCalendarPath
      ], tempRoot);
      expectZipLikeFile(monthlyCalendarPath);

      runRuntime(runtime, [
        "report",
        "wbs-markdown",
        "--in",
        workbookPath,
        "--out",
        markdownPath
      ], tempRoot);
      const markdown = fs.readFileSync(markdownPath, "utf8");
      expect(markdown).toContain("# WBS");
      expect(markdown).toContain("Phase C Report Smoke");

      runRuntime(runtime, [
        "report",
        "mermaid",
        "--in",
        workbookPath,
        "--out",
        mermaidPath
      ], tempRoot);
      const mermaid = fs.readFileSync(mermaidPath, "utf8");
      expect(mermaid).toContain("gantt");
      expect(mermaid).toContain("Implementation");

      runRuntime(runtime, [
        "report",
        "all",
        "--in",
        workbookPath,
        "--out",
        reportBundlePath
      ], tempRoot);
      expectZipLikeFile(reportBundlePath);
    }, runtime.timeout);
  }
});

function runRuntime(runtime, args, cwd) {
  return execFileSync(runtime.command, [...runtime.prefixArgs, ...args], {
    cwd,
    encoding: "utf8"
  });
}

function expectZipLikeFile(filePath) {
  const buffer = fs.readFileSync(filePath);
  expect(buffer.length).toBeGreaterThan(0);
  expect(buffer.subarray(0, 2).toString("utf8")).toBe("PK");
}

function buildDraft() {
  return {
    view_type: "project_draft_view",
    project: {
      name: "Phase C Report Smoke",
      planned_start: "2026-04-01",
      planned_finish: "2026-04-10"
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
        name: "Implementation",
        parent_uid: null,
        position: 1,
        planned_start: "2026-04-03",
        planned_finish: "2026-04-08",
        predecessor_uids: ["draft-1"]
      },
      {
        uid: "draft-3",
        name: "Review",
        parent_uid: null,
        position: 2,
        is_milestone: true,
        planned_start: "2026-04-10",
        planned_finish: "2026-04-10",
        predecessor_uids: ["draft-2"]
      }
    ],
    resources: [],
    assignments: []
  };
}
