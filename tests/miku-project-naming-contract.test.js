import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const skillRoot = path.resolve(ROOT, "skills/igapyon-miku-project");
const skillMarkdown = fs.readFileSync(path.resolve(skillRoot, "SKILL.md"), "utf8");
const packageJson = JSON.parse(fs.readFileSync(path.resolve(ROOT, "package.json"), "utf8"));

describe("miku-project naming contract", () => {
  it("ships one canonical installed skill identity", () => {
    expect(packageJson.name).toBe("miku-project-skills");
    expect(fs.existsSync(skillRoot)).toBe(true);
    expect(fs.existsSync(path.resolve(ROOT, "skills/mikuproject"))).toBe(false);
    expect(skillMarkdown).toContain("name: igapyon-miku-project");
    expect(skillMarkdown).toContain("$igapyon-miku-project");
  });

  it("documents canonical, legacy, and non-trigger activation boundaries", () => {
    for (const trigger of ["`miku-project`", "`miku-project-skills`", "`igapyon-miku-project`"]) {
      expect(skillMarkdown).toContain(trigger);
    }
    for (const trigger of ["`mikuproject`", "`miku project`", "`mikuku project`"]) {
      expect(skillMarkdown).toContain(trigger);
    }
    expect(skillMarkdown).toContain("`WBS`, `スケジュール`, `工程`, `計画`, `Excel`");
  });

  it("contains only the fixed canonical runtime artifact names", () => {
    expect(fs.readdirSync(path.resolve(skillRoot, "runtime")).filter((entry) => entry !== ".DS_Store").sort()).toEqual([
      "miku-project-0.12.0.jar",
      "miku-project-0.12.0.mjs",
      "miku-project-sources-0.12.0.jar",
      "miku-project-sources-0.12.0.tgz"
    ]);
  });
});
