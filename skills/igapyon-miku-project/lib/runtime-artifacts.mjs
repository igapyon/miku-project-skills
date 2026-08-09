import fs from "node:fs";
import path from "node:path";

export const DEFAULT_RUNTIME_ROOT = "skills/igapyon-miku-project/runtime";

const artifactDefinitions = {
  java: {
    label: "Java runtime",
    pattern: /^miku-project-(?!sources-)(.+)\.jar$/
  },
  node: {
    label: "Node.js runtime",
    pattern: /^miku-project-(.+)\.mjs$/
  },
  "java-sources": {
    label: "Java sources",
    pattern: /^miku-project-sources-(.+)\.jar$/
  },
  "node-sources": {
    label: "Node.js sources",
    pattern: /^miku-project-sources-(.+)\.tgz$/
  }
};

export function resolveRuntimeArtifactPath({
  kind,
  runtimeRoot = DEFAULT_RUNTIME_ROOT
} = {}) {
  const artifact = resolveRuntimeArtifact({ kind, runtimeRoot });
  return artifact.path;
}

export function resolveRuntimeArtifact({
  kind,
  runtimeRoot = DEFAULT_RUNTIME_ROOT
} = {}) {
  const definition = artifactDefinitions[kind];
  if (!definition) {
    throw new Error(`unsupported runtime artifact kind: ${kind}`);
  }

  const entries = fs.existsSync(runtimeRoot) ? fs.readdirSync(runtimeRoot) : [];
  const matches = entries
    .map((name) => {
      const match = definition.pattern.exec(name);
      if (!match) {
        return null;
      }
      return {
        name,
        path: path.join(runtimeRoot, name),
        version: match[1]
      };
    })
    .filter(Boolean)
    .sort(compareArtifacts);

  if (matches.length === 0) {
    throw new Error(`missing ${definition.label} artifact in ${runtimeRoot}`);
  }

  return matches[matches.length - 1];
}

function compareArtifacts(left, right) {
  const versionOrder = compareVersionStrings(left.version, right.version);
  if (versionOrder !== 0) {
    return versionOrder;
  }
  return left.name.localeCompare(right.name);
}

function compareVersionStrings(left, right) {
  const leftParts = splitVersion(left);
  const rightParts = splitVersion(right);
  const length = Math.max(leftParts.length, rightParts.length);

  for (let index = 0; index < length; index += 1) {
    const leftPart = leftParts[index] ?? 0;
    const rightPart = rightParts[index] ?? 0;
    if (typeof leftPart === "number" && typeof rightPart === "number") {
      if (leftPart !== rightPart) {
        return leftPart - rightPart;
      }
      continue;
    }
    const order = String(leftPart).localeCompare(String(rightPart));
    if (order !== 0) {
      return order;
    }
  }

  return 0;
}

function splitVersion(version) {
  return version.split(/[.-]/).map((part) => {
    if (/^\d+$/.test(part)) {
      return Number(part);
    }
    return part;
  });
}
