import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const runtimeRoot = path.resolve(ROOT, "skills/igapyon-miku-project/runtime");
const provenancePath = path.resolve(
  ROOT,
  "skills/igapyon-miku-project/references/runtime/artifact-provenance.md"
);
const provenance = fs.readFileSync(provenancePath, "utf8");
const rows = provenance
  .split(/\r?\n/)
  .filter((line) => line.startsWith("|"))
  .map((line) => line.split("|").slice(1, -1).map((cell) => cell.trim().replace(/^`|`$/g, "")))
  .filter((cells) => cells.length === 5 && cells[2].startsWith("v"));

describe("miku-project runtime artifact provenance", () => {
  it("records one pinned source row for each bundled runtime and sources artifact", () => {
    expect(rows).toHaveLength(4);

    for (const [kind, repository, tag, asset, expectedDigest] of rows) {
      const artifactPath = path.resolve(runtimeRoot, asset);
      expect(fs.existsSync(artifactPath), `${kind} artifact ${asset}`).toBe(true);
      expect(tag).toBe("v1.1.2");

      const bytes = fs.readFileSync(artifactPath);
      const actualDigest = crypto.createHash("sha256").update(bytes).digest("hex");
      expect(bytes.length, `${repository}/${asset} is non-empty`).toBeGreaterThan(0);
      expect(actualDigest, `${repository}/${tag}/${asset}`).toBe(expectedDigest);
    }
  });
});
