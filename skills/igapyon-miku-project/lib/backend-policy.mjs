import { operationCapabilities } from "./backend-operations.mjs";

export const BACKEND_POLICIES = [
  "cli-only",
  "cli-preferred",
  "mcp-only",
  "mcp-preferred",
  "handoff-only"
];

export const DEFAULT_OPERATION_CAPABILITIES = operationCapabilities;

export function resolveBackendPolicy({
  userRequestPolicy,
  environmentPolicy,
  skillConfigPolicy,
  repositoryDefaultPolicy = "cli-preferred"
} = {}, config = {}) {
  const allowedPolicies = config.allowed_policies ?? BACKEND_POLICIES;
  assertAllowedPolicyValues({
    userRequestPolicy,
    environmentPolicy,
    skillConfigPolicy,
    configPolicy: config.default_policy,
    repositoryDefaultPolicy
  }, allowedPolicies);

  if (environmentPolicy && isStrictPolicy(environmentPolicy)) {
    if (userRequestPolicy) {
      if (userRequestPolicy === "handoff-only") {
        return "handoff-only";
      }
      if (isBackendPolicyAllowedByStrictEnvironment(userRequestPolicy, environmentPolicy)) {
        return environmentPolicy;
      }
      throw backendPolicyConflict(userRequestPolicy, environmentPolicy);
    }
    return environmentPolicy;
  }

  return userRequestPolicy ??
    environmentPolicy ??
    skillConfigPolicy ??
    config.default_policy ??
    repositoryDefaultPolicy;
}

export function planBackendExecution({
  policy,
  operation,
  capabilities = DEFAULT_OPERATION_CAPABILITIES,
  unavailableBackends = []
} = {}) {
  assertAllowedPolicy(policy, BACKEND_POLICIES);

  if (!operation) {
    throw new Error("operation is required");
  }

  if (policy === "handoff-only") {
    return {
      policy,
      operation,
      mode: "handoff",
      selectedBackend: null,
      attemptedBackends: [],
      fallback: null,
      error: null
    };
  }

  const operationCapabilities = capabilities[operation];
  if (!operationCapabilities) {
    return hardError(policy, operation, [], "unknown_operation");
  }

  const backendOrder = backendOrderForPolicy(policy);
  const fallbackAllowed = policy.endsWith("-preferred");
  const unavailable = new Set(unavailableBackends);
  const attemptedBackends = [];

  for (const backend of backendOrder) {
    attemptedBackends.push(backend);

    if (!operationCapabilities[backend]) {
      if (!fallbackAllowed) {
        return hardError(policy, operation, attemptedBackends, `${backend}_not_supported`);
      }
      continue;
    }

    if (unavailable.has(backend)) {
      if (!fallbackAllowed) {
        return hardError(policy, operation, attemptedBackends, `${backend}_unavailable`);
      }
      continue;
    }

    const primaryBackend = backendOrder[0];
    const fallback = backend === primaryBackend
      ? null
      : {
          from: primaryBackend,
          to: backend,
          reason: fallbackReason(primaryBackend, operationCapabilities, unavailable)
        };

    return {
      policy,
      operation,
      mode: "execute",
      selectedBackend: backend,
      attemptedBackends,
      fallback,
      error: null
    };
  }

  return hardError(policy, operation, attemptedBackends, "no_allowed_backend_available");
}

function backendOrderForPolicy(policy) {
  switch (policy) {
    case "cli-only":
      return ["cli"];
    case "cli-preferred":
      return ["cli", "mcp"];
    case "mcp-only":
      return ["mcp"];
    case "mcp-preferred":
      return ["mcp", "cli"];
    default:
      throw new Error(`unsupported backend policy: ${policy}`);
  }
}

function fallbackReason(primaryBackend, operationCapabilities, unavailable) {
  if (!operationCapabilities[primaryBackend]) {
    return `${primaryBackend}_not_supported`;
  }
  if (unavailable.has(primaryBackend)) {
    return `${primaryBackend}_unavailable`;
  }
  return `${primaryBackend}_unsuitable`;
}

function hardError(policy, operation, attemptedBackends, reason) {
  return {
    policy,
    operation,
    mode: "error",
    selectedBackend: null,
    attemptedBackends,
    fallback: null,
    error: {
      reason
    }
  };
}

function assertAllowedPolicyValues(policyValues, allowedPolicies) {
  for (const [source, policy] of Object.entries(policyValues)) {
    if (policy === undefined || policy === null) {
      continue;
    }
    if (!allowedPolicies.includes(policy)) {
      throw new Error(`unsupported backend policy from ${source}: ${policy}`);
    }
  }
}

function assertAllowedPolicy(policy, allowedPolicies) {
  if (!allowedPolicies.includes(policy)) {
    throw new Error(`unsupported backend policy: ${policy}`);
  }
}

function isStrictPolicy(policy) {
  return ["cli-only", "mcp-only", "handoff-only"].includes(policy);
}

function isBackendPolicyAllowedByStrictEnvironment(userRequestPolicy, environmentPolicy) {
  if (environmentPolicy === "cli-only") {
    return userRequestPolicy === "cli-only" || userRequestPolicy.endsWith("-preferred");
  }
  if (environmentPolicy === "mcp-only") {
    return userRequestPolicy === "mcp-only" || userRequestPolicy.endsWith("-preferred");
  }
  return userRequestPolicy === "handoff-only";
}

function backendPolicyConflict(requestedPolicy, environmentPolicy) {
  const error = new Error(
    `requested backend policy ${requestedPolicy} conflicts with environment policy ${environmentPolicy}`
  );
  error.code = "backend_policy_conflict";
  error.requestedPolicy = requestedPolicy;
  error.environmentPolicy = environmentPolicy;
  return error;
}
