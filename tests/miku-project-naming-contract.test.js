import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const skillRoot = path.resolve(ROOT, "skills/igapyon-miku-project");
const skillMarkdown = fs.readFileSync(path.resolve(skillRoot, "SKILL.md"), "utf8");
const namingMigration = fs.readFileSync(path.resolve(ROOT, "docs/naming-migration.md"), "utf8");
const mikuSoftReference = fs.readFileSync(path.resolve(ROOT, "docs/miku-soft-reference.md"), "utf8");
const todo = fs.readFileSync(path.resolve(ROOT, "TODO.md"), "utf8");
const packageJson = JSON.parse(fs.readFileSync(path.resolve(ROOT, "package.json"), "utf8"));

describe("miku-project naming contract", () => {
  it("ships one canonical installed skill identity", () => {
    expect(packageJson.name).toBe("miku-project-skills");
    expect(packageJson.repository.url).toBe("git+https://github.com/igapyon/miku-project-skills.git");
    expect(packageJson.bugs.url).toBe("https://github.com/igapyon/miku-project-skills/issues");
    expect(packageJson.homepage).toBe("https://github.com/igapyon/miku-project-skills#readme");
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

  it("tracks the umbrella rename and its human-owned GitHub handoff", () => {
    expect(namingMigration).toContain("miku-project Issue #123");
    expect(namingMigration).toContain("repository-local Issue #63");
    expect(namingMigration).toContain("the GitHub repository is `igapyon/miku-project-skills`");
    expect(namingMigration).toContain("`igapyon/mikuproject-skills` API URL redirects");
    expect(namingMigration).toContain("git@github.com:igapyon/miku-project-skills.git");
    expect(namingMigration).toContain("`git fetch origin --prune` succeeded");
    expect(todo).toContain("miku-project Issue #123: naming migration");
    expect(todo).toContain("rename後にlocal `origin`、fetch、package metadata、管理中URLを新repository名で確認する");
  });

  it("records the runtime versions actually bundled by the canonical skill", () => {
    expect(mikuSoftReference).toContain("Node.js\n  `0.12.0` と Java `0.12.0` artifact");
    expect(mikuSoftReference).not.toContain("`0.8.3.3` artifact");
  });
});
