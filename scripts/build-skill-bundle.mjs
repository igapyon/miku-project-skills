#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resolveRuntimeArtifact } from "../skills/igapyon-miku-project/lib/runtime-artifacts.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const bundleRoot = path.resolve(repoRoot, "bundle/miku-project-skills");
const bundleSkillsRoot = path.resolve(bundleRoot, "skills");
const sourceSkillRoot = path.resolve(repoRoot, "skills/igapyon-miku-project");
const sourceRuntimeRoot = path.resolve(sourceSkillRoot, "runtime");

main();

function main() {
  ensureSourceExists(sourceSkillRoot, "skills/igapyon-miku-project");
  ensureSourceExists(path.resolve(sourceSkillRoot, "index.json"), "skills/igapyon-miku-project/index.json");
  ensureSourceExists(sourceRuntimeRoot, "skills/igapyon-miku-project/runtime");
  const javaRuntime = resolveRequiredArtifact("java");
  const javaSources = resolveRequiredArtifact("java-sources");
  const nodeRuntime = resolveRequiredArtifact("node");
  const nodeSources = resolveRequiredArtifact("node-sources");

  fs.rmSync(bundleRoot, { recursive: true, force: true });
  fs.mkdirSync(bundleSkillsRoot, { recursive: true });

  fs.cpSync(sourceSkillRoot, path.resolve(bundleSkillsRoot, "igapyon-miku-project"), {
    recursive: true,
    filter: shouldCopyBundleEntry
  });

  process.stdout.write([
    "[build:bundle] generated bundle/miku-project-skills",
    "[build:bundle] copy this directory's contents under your skill home root",
    "[build:bundle] included:",
    "  - skills/igapyon-miku-project",
    "  - skills/igapyon-miku-project/index.json",
    `  - skills/igapyon-miku-project/runtime/${javaRuntime.name}`,
    `  - skills/igapyon-miku-project/runtime/${javaSources.name}`,
    `  - skills/igapyon-miku-project/runtime/${nodeRuntime.name}`,
    `  - skills/igapyon-miku-project/runtime/${nodeSources.name}`
  ].join("\n"));
  process.stdout.write("\n");
}

function ensureSourceExists(targetPath, label) {
  if (!fs.existsSync(targetPath)) {
    throw new Error(`missing source directory: ${label}`);
  }
}

function shouldCopyBundleEntry(sourcePath) {
  const name = path.basename(sourcePath);
  if (name === ".DS_Store") {
    return false;
  }

  const relativePath = path.relative(sourceSkillRoot, sourcePath);
  if (!relativePath) {
    return true;
  }

  return !relativePath
    .split(path.sep)
    .some((segment) => segment === "tmp" || segment === "output" || segment === "state");
}

function resolveRequiredArtifact(kind) {
  return resolveRuntimeArtifact({
    kind,
    runtimeRoot: sourceRuntimeRoot
  });
}
