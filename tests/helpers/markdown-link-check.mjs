import fs from "node:fs";
import path from "node:path";

export function findMarkdownLinkFailures({ root, startDirectories = ["."], confineToRoot = false }) {
  const absoluteRoot = path.resolve(root);
  const markdownFiles = startDirectories.flatMap((directory) =>
    walkMarkdownFiles(path.resolve(absoluteRoot, directory))
  );
  const failures = [];

  for (const markdownFile of markdownFiles) {
    const content = fs.readFileSync(markdownFile, "utf8");
    const targets = [...content.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)];

    for (const [, rawTarget] of targets) {
      const target = rawTarget.trim().split(/\s+/u, 1)[0].replace(/^<|>$/g, "");
      if (!target || /^(?:[a-z][a-z\d+.-]*:|\/\/)/iu.test(target) || target.startsWith("#")) {
        continue;
      }

      const localTarget = decodeURIComponent(target.split("#", 1)[0].split("?", 1)[0]);
      if (!localTarget) {
        continue;
      }

      const resolvedTarget = path.resolve(path.dirname(markdownFile), localTarget);
      const relativeTarget = path.relative(absoluteRoot, resolvedTarget);
      if (confineToRoot && (relativeTarget === ".." || relativeTarget.startsWith(`..${path.sep}`) || path.isAbsolute(relativeTarget))) {
        failures.push({ markdownFile, target, reason: "escapes root" });
      } else if (!fs.existsSync(resolvedTarget)) {
        failures.push({ markdownFile, target, reason: "target missing" });
      }
    }
  }

  return failures;
}

function walkMarkdownFiles(directory) {
  if (!fs.existsSync(directory)) {
    return [];
  }

  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.resolve(directory, entry.name);
    if (entry.isDirectory()) {
      return walkMarkdownFiles(target);
    }
    return entry.isFile() && entry.name.endsWith(".md") ? [target] : [];
  });
}
