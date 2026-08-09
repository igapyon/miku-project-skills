import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const referencesRoot = path.resolve(ROOT, "skills/igapyon-miku-project/references");
const indexPath = path.resolve(referencesRoot, "INDEX.md");

const promptReferences = [
  {
    path: "prompts/new-wbs-draft.md",
    requiredTerms: ["project_draft_view", "predecessor_uids", "top-level dependencies"]
  },
  {
    path: "prompts/existing-wbs-review.md",
    requiredTerms: ["projection JSON", "Patch JSON", "operations"]
  },
  {
    path: "prompts/schedule-compression.md",
    requiredTerms: ["スケジュール圧縮", "link_tasks", "unlink_tasks"]
  },
  {
    path: "prompts/patch-request.md",
    requiredTerms: ["Patch JSON", "allowed_edit_fields", "allow_patch_ops"]
  }
];

describe("miku-project prompt references", () => {
  it("lists all prompt references from the references index", () => {
    const indexText = fs.readFileSync(indexPath, "utf8");

    for (const promptReference of promptReferences) {
      expect(indexText).toContain(promptReference.path);
    }
  });

  it("keeps prompt references short and tied to miku-project JSON workflows", () => {
    for (const promptReference of promptReferences) {
      const text = fs.readFileSync(path.resolve(referencesRoot, promptReference.path), "utf8");

      expect(text).toContain("```text");
      expect(text).toContain("Expected Next Step");
      expect(text.length).toBeLessThan(2500);

      for (const requiredTerm of promptReference.requiredTerms) {
        expect(text).toContain(requiredTerm);
      }
    }
  });
});
