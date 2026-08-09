import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const referencesRoot = path.resolve(ROOT, "skills/igapyon-miku-project/references");
const indexPath = path.resolve(referencesRoot, "INDEX.md");
const scheduleWorkflowPath = path.resolve(referencesRoot, "workflow/schedule-adjustment.md");

describe("miku-project schedule adjustment reference", () => {
  it("is linked from the references index", () => {
    const indexText = fs.readFileSync(indexPath, "utf8");
    expect(indexText).toContain("workflow/schedule-adjustment.md");
  });

  it("defines schedule compression, split, patch, and boundary rules", () => {
    const text = fs.readFileSync(scheduleWorkflowPath, "utf8");

    expect(text).toContain("phase_detail_view");
    expect(text).toContain("task_edit_view");
    expect(text).toContain("project_overview_view");
    expect(text).toContain("update_task");
    expect(text).toContain("add_task");
    expect(text).toContain("move_task");
    expect(text).toContain("link_tasks");
    expect(text).toContain("unlink_tasks");
    expect(text).toContain("lag_hours");
    expect(text).toContain("patch-validate");
    expect(text).toContain("state-diff");
    expect(text).toContain("do not guarantee");
    expect(text).toContain("do not ignore dependencies");
  });
});
