#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resolveRuntimeArtifact } from "../skills/mikuproject/lib/runtime-artifacts.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const bundleRoot = path.resolve(repoRoot, "bundle/mikuproject-skills");
const bundleSkillsRoot = path.resolve(bundleRoot, "skills");
const sourceSkillRoot = path.resolve(repoRoot, "skills/mikuproject");
const sourceRuntimeRoot = path.resolve(sourceSkillRoot, "runtime");

main();

function main() {
  ensureSourceExists(sourceSkillRoot, "skills/mikuproject");
  ensureSourceExists(path.resolve(sourceSkillRoot, "index.json"), "skills/mikuproject/index.json");
  ensureSourceExists(sourceRuntimeRoot, "skills/mikuproject/runtime");
  const javaRuntime = resolveRequiredArtifact("java");
  const javaSources = resolveRequiredArtifact("java-sources");
  const nodeRuntime = resolveRequiredArtifact("node");
  const nodeSources = resolveRequiredArtifact("node-sources");

  fs.rmSync(bundleRoot, { recursive: true, force: true });
  fs.mkdirSync(bundleSkillsRoot, { recursive: true });

  fs.cpSync(sourceSkillRoot, path.resolve(bundleSkillsRoot, "mikuproject"), {
    recursive: true,
    filter: shouldCopyBundleEntry
  });

  process.stdout.write([
    "[build:bundle] generated bundle/mikuproject-skills",
    "[build:bundle] copy this directory's contents under your skill home root",
    "[build:bundle] included:",
    "  - skills/mikuproject",
    "  - skills/mikuproject/index.json",
    `  - skills/mikuproject/runtime/${javaRuntime.name}`,
    `  - skills/mikuproject/runtime/${javaSources.name}`,
    `  - skills/mikuproject/runtime/${nodeRuntime.name}`,
    `  - skills/mikuproject/runtime/${nodeSources.name}`
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
