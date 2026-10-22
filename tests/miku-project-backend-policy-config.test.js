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
    expect(config.precedence_scope).toMatch(/after applying hard constraints/i);
    expect(config.environment_constraints).toEqual({
      "cli-only": ["cli"],
      "mcp-only": ["mcp"],
      "handoff-only": []
    });
    expect(config.fallback_allowed).toEqual({
      "cli-only": false,
      "cli-preferred": true,
      "mcp-only": false,
      "mcp-preferred": true,
      "handoff-only": false
    });
    expect(config.allowed_policies).toEqual(BACKEND_POLICIES);
  });

  it("resolves preferences within strict environment constraints", () => {
    const config = JSON.parse(fs.readFileSync(policyConfigPath, "utf8"));

    expect(() => resolveBackendPolicy({
      userRequestPolicy: "mcp-only",
      environmentPolicy: "cli-only",
      skillConfigPolicy: "cli-preferred"
    }, config)).toThrow(expect.objectContaining({
      code: "backend_policy_conflict",
      requestedPolicy: "mcp-only",
      environmentPolicy: "cli-only"
    }));

    expect(resolveBackendPolicy({
      userRequestPolicy: "mcp-preferred",
      environmentPolicy: "cli-only",
      skillConfigPolicy: "mcp-preferred"
    }, config)).toBe("cli-only");

    expect(resolveBackendPolicy({
      userRequestPolicy: "handoff-only",
      environmentPolicy: "cli-only"
    }, config)).toBe("handoff-only");

    expect(resolveBackendPolicy({
      userRequestPolicy: "mcp-only",
      environmentPolicy: "mcp-preferred",
      skillConfigPolicy: "cli-preferred"
    }, config)).toBe("mcp-only");

    expect(resolveBackendPolicy({
      skillConfigPolicy: "mcp-preferred"
    }, config)).toBe("mcp-preferred");

    expect(resolveBackendPolicy({}, config)).toBe("cli-preferred");
  });

  it("matches the full user and environment policy matrix", () => {
    const config = JSON.parse(fs.readFileSync(policyConfigPath, "utf8"));
    const policies = [...expectedPolicies];

    for (const environmentPolicy of [undefined, ...policies]) {
      for (const userRequestPolicy of [undefined, ...policies]) {
        const result = () => resolveBackendPolicy({ environmentPolicy, userRequestPolicy }, config);

        if (environmentPolicy === "cli-only") {
          if (userRequestPolicy === "mcp-only") {
            expect(result).toThrow(expect.objectContaining({ code: "backend_policy_conflict" }));
          } else if (userRequestPolicy === "handoff-only") {
            expect(result()).toBe("handoff-only");
          } else {
            expect(result()).toBe("cli-only");
          }
        } else if (environmentPolicy === "mcp-only") {
          if (userRequestPolicy === "cli-only") {
            expect(result).toThrow(expect.objectContaining({ code: "backend_policy_conflict" }));
          } else if (userRequestPolicy === "handoff-only") {
            expect(result()).toBe("handoff-only");
          } else {
            expect(result()).toBe("mcp-only");
          }
        } else if (environmentPolicy === "handoff-only") {
          if (userRequestPolicy && userRequestPolicy !== "handoff-only") {
            expect(result).toThrow(expect.objectContaining({ code: "backend_policy_conflict" }));
          } else {
            expect(result()).toBe("handoff-only");
          }
        } else if (userRequestPolicy) {
          expect(result()).toBe(userRequestPolicy);
        } else if (environmentPolicy) {
          expect(result()).toBe(environmentPolicy);
        } else {
          expect(result()).toBe("cli-preferred");
        }
      }
    }
  });

  it("does not hide invalid environment or user policies behind another value", () => {
    const config = JSON.parse(fs.readFileSync(policyConfigPath, "utf8"));

    expect(() => resolveBackendPolicy({
      userRequestPolicy: "cli-only",
      environmentPolicy: "not-a-policy"
    }, config)).toThrow(/unsupported backend policy from environmentPolicy/);
    expect(() => resolveBackendPolicy({
      userRequestPolicy: "not-a-policy",
      environmentPolicy: "cli-only"
    }, config)).toThrow(/unsupported backend policy from userRequestPolicy/);
  });
});
