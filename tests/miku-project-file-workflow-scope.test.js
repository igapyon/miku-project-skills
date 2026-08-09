import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const fileImportExportPath = path.resolve(ROOT, "docs/file-import-export.md");
const todoPath = path.resolve(ROOT, "TODO.md");

describe("miku-project file workflow scope", () => {
  it("documents CSV and AI editing JSON as out of scope for primary file workflow", () => {
    const fileWorkflowText = fs.readFileSync(fileImportExportPath, "utf8");
    const todoText = fs.readFileSync(todoPath, "utf8");

    for (const text of [fileWorkflowText, todoText]) {
      expect(text).toContain("対象外 / Deferred");
      expect(text).toContain("CSV");
      expect(text).toContain("project_overview_view");
      expect(text).toContain("phase_detail_view");
      expect(text).toContain("task_edit_view");
    }

    expect(fileWorkflowText).toContain("AI workflow");
    expect(fileWorkflowText).toContain("primary import/export");
    expect(fileWorkflowText).toContain("ai_projection_bundle");
  });
});
