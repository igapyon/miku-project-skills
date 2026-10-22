import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { findMarkdownLinkFailures } from "./helpers/markdown-link-check.mjs";

const ROOT = process.cwd();

describe("miku-project local Markdown references", () => {
  it("resolves local links in source documentation without checking network URLs", () => {
    expect(findMarkdownLinkFailures({
      root: ROOT,
      startDirectories: ["docs", "skills"]
    })).toEqual([]);
  });

  it("keeps canonical install identity separate from the display trigger", () => {
    const installation = requireText("docs/skill-installation.md");
    const quickstart = requireText("docs/quickstart.md");

    expect(installation).toContain("repository / package: `miku-project-skills`");
    expect(installation).toContain("installed Skill directory / name: `igapyon-miku-project`");
    expect(installation).toContain("display name / conversation trigger: `miku-project`");
    expect(installation).toContain("<installed-skills-root>/igapyon-miku-project");
    expect(installation).not.toContain("<skill-home>/skills/");
    expect(quickstart).toContain("igapyon-miku-project/");
  });
});

function requireText(relativePath) {
  return fs.readFileSync(path.resolve(ROOT, relativePath), "utf8");
}
