import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const referencesRoot = path.resolve(ROOT, "skills/igapyon-miku-project/references");
const indexPath = path.resolve(referencesRoot, "INDEX.md");
const reviewWorkflowPath = path.resolve(referencesRoot, "workflow/wbs-review.md");

describe("miku-project WBS review reference", () => {
  it("is linked from the references index", () => {
    const indexText = fs.readFileSync(indexPath, "utf8");
    expect(indexText).toContain("workflow/wbs-review.md");
  });

  it("defines projection-first review and review-to-patch boundaries", () => {
    const text = fs.readFileSync(reviewWorkflowPath, "utf8");

    expect(text).toContain("project_overview_view");
    expect(text).toContain("phase_detail_view");
    expect(text).toContain("task_edit_view");
    expect(text).toContain("Patch JSON");
    expect(text).toContain("patch-validate");
    expect(text).toContain("state-diff");
    expect(text).toContain("does not certify business validity");
    expect(text).toContain("does not replace browser");
  });
});
