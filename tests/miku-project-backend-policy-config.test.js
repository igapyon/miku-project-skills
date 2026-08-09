import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  BACKEND_POLICIES,
  resolveBackendPolicy
} from "../skills/igapyon-miku-project/lib/backend-policy.mjs";

const ROOT = process.cwd();
const policyConfigPath = path.resolve(
  ROOT,
  "skills/igapyon-miku-project/config/backend-policy.json"
);

const expectedPolicies = [
  "cli-only",
  "cli-preferred",
  "mcp-only",
  "mcp-preferred",
  "handoff-only"
];

describe("miku-project backend policy config", () => {
  it("defines the supported policy contract", () => {
    const config = JSON.parse(fs.readFileSync(policyConfigPath, "utf8"));

    expect(config.schema_version).toBe(1);
    expect(config.default_policy).toBe("cli-preferred");
    expect(config.allowed_policies).toEqual(expectedPolicies);
    expect(config.strict_policies).toEqual([
      "cli-only",
      "mcp-only",
      "handoff-only"
    ]);
    expect(config.precedence).toEqual([
      "user-request",
      "environment-policy",
      "skill-config",
      "repository-default"
    ]);
    expect(config.fallback_allowed).toEqual({
      "cli-only": false,
      "cli-preferred": true,
      "mcp-only": false,
      "mcp-preferred": true,
      "handoff-only": false
    });
    expect(config.allowed_policies).toEqual(BACKEND_POLICIES);
  });

  it("resolves policy by user, environment, skill config, then repository default", () => {
    const config = JSON.parse(fs.readFileSync(policyConfigPath, "utf8"));

    expect(resolveBackendPolicy({
      userRequestPolicy: "mcp-only",
      environmentPolicy: "cli-only",
      skillConfigPolicy: "cli-preferred"
    }, config)).toBe("mcp-only");

    expect(resolveBackendPolicy({
      environmentPolicy: "cli-only",
      skillConfigPolicy: "mcp-preferred"
    }, config)).toBe("cli-only");

    expect(resolveBackendPolicy({
      skillConfigPolicy: "mcp-preferred"
    }, config)).toBe("mcp-preferred");

    expect(resolveBackendPolicy({}, config)).toBe("cli-preferred");
  });
});
