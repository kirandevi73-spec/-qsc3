/**
 * QSC3 — Formal Verification Engine
 *
 * Implements lightweight model-checking for supply chain state machines:
 *  - State reachability analysis
 *  - Invariant checking (safety properties)
 *  - LTL-style liveness checks (simplified BFS)
 *  - Cryptographic protocol verification (Dolev-Yao attacker model stub)
 */

const crypto = require('crypto');

// ── Types / Schemas ────────────────────────────────────────────────────────

/**
 * StateMachine: { id, states: string[], transitions: [{from,to,label,guard?}], initial, final: string[] }
 * Invariant:    { id, description, predicate: (state) => boolean }
 */

// ── Built-in supply-chain invariants ──────────────────────────────────────
const BUILTIN_INVARIANTS = [
  {
    id: 'no-skip-inspection',
    description: 'Shipment cannot go from CREATED directly to DELIVERED without INSPECTED',
    check: (trace) => {
      for (let i = 0; i < trace.length - 1; i++) {
        if (trace[i] === 'CREATED' && trace[i + 1] === 'DELIVERED') return false;
      }
      return true;
    },
  },
  {
    id: 'quantum-auth-before-sign',
    description: 'PQC signature must follow key generation in the same session',
    check: (trace) => {
      let keyGenSeen = false;
      for (const step of trace) {
        if (step === 'KEY_GENERATED') keyGenSeen = true;
        if (step === 'SIGNED' && !keyGenSeen) return false;
      }
      return true;
    },
  },
  {
    id: 'no-revert-after-finalize',
    description: 'A FINALIZED shipment cannot transition back to any mutable state',
    check: (trace) => {
      const MUTABLE = new Set(['CREATED', 'IN_TRANSIT', 'INSPECTED', 'HELD']);
      let finalSeen = false;
      for (const step of trace) {
        if (step === 'FINALIZED') finalSeen = true;
        if (finalSeen && MUTABLE.has(step)) return false;
      }
      return true;
    },
  },
  {
    id: 'dual-approval-for-high-value',
    description: 'HIGH_VALUE shipments require APPROVAL_A and APPROVAL_B before RELEASED',
    check: (trace) => {
      if (!trace.includes('HIGH_VALUE')) return true; // not applicable
      const idx = trace.indexOf('RELEASED');
      if (idx === -1) return true;
      const pre = trace.slice(0, idx);
      return pre.includes('APPROVAL_A') && pre.includes('APPROVAL_B');
    },
  },
];

// ── Reachability BFS ───────────────────────────────────────────────────────
function bfsReachability(machine) {
  const { states, transitions, initial } = machine;
  const visited = new Set([initial]);
  const queue   = [initial];
  const edges   = {};
  for (const t of transitions) {
    if (!edges[t.from]) edges[t.from] = [];
    edges[t.from].push(t);
  }

  while (queue.length) {
    const cur = queue.shift();
    for (const t of (edges[cur] || [])) {
      if (!visited.has(t.to)) {
        visited.add(t.to);
        queue.push(t.to);
      }
    }
  }

  const unreachable = states.filter(s => !visited.has(s));
  const deadEnds    = states.filter(s =>
    !(machine.final || []).includes(s) &&
    !(edges[s] && edges[s].length > 0)
  );

  return { reachable: [...visited], unreachable, deadEnds };
}

// ── Trace generator (DFS, depth-limited) ──────────────────────────────────
function generateTraces(machine, maxDepth = 10) {
  const { transitions, initial, final = [] } = machine;
  const edges = {};
  for (const t of transitions) {
    if (!edges[t.from]) edges[t.from] = [];
    edges[t.from].push(t);
  }

  const completedTraces = [];
  const stack = [[initial]];

  while (stack.length) {
    const path = stack.pop();
    const cur  = path[path.length - 1];

    if (final.includes(cur)) {
      completedTraces.push([...path]);
      continue;
    }
    if (path.length >= maxDepth) {
      completedTraces.push([...path]); // partial
      continue;
    }

    const nexts = edges[cur] || [];
    if (!nexts.length) {
      completedTraces.push([...path]);
      continue;
    }
    for (const t of nexts) {
      // Avoid trivial cycles (same state twice in path)
      if (path.filter(s => s === t.to).length < 2) {
        stack.push([...path, t.to]);
      }
    }
  }

  return completedTraces;
}

// ── Invariant checking ─────────────────────────────────────────────────────
function checkInvariants(traces, customInvariants = []) {
  const allInvariants = [...BUILTIN_INVARIANTS, ...customInvariants];
  const results = [];

  for (const inv of allInvariants) {
    const violations = [];
    for (const trace of traces) {
      if (!inv.check(trace)) {
        violations.push(trace);
      }
    }
    results.push({
      id:          inv.id,
      description: inv.description,
      passed:      violations.length === 0,
      violations:  violations.length,
      sample:      violations[0] || null,
    });
  }
  return results;
}

// ── Dolev-Yao attacker model (protocol stub) ───────────────────────────────
function dolevYaoAnalysis(protocol) {
  /**
   * protocol: { messages: [{from, to, content, encrypted?, signed?}] }
   * Attacker capabilities: intercept, replay, drop, forge unsigned messages
   */
  const issues = [];

  for (const msg of protocol.messages) {
    if (!msg.encrypted) {
      issues.push({
        severity: 'HIGH',
        type:     'PLAINTEXT_TRANSMISSION',
        message:  `Message from ${msg.from}→${msg.to} ("${msg.content}") is unencrypted`,
      });
    }
    if (!msg.signed) {
      issues.push({
        severity: 'MEDIUM',
        type:     'UNAUTHENTICATED_MESSAGE',
        message:  `Message from ${msg.from}→${msg.to} lacks integrity protection`,
      });
    }
    if (msg.content?.includes('KEY') && !msg.encrypted) {
      issues.push({
        severity: 'CRITICAL',
        type:     'KEY_EXPOSURE',
        message:  `Potential key material in plaintext: ${msg.from}→${msg.to}`,
      });
    }
  }

  return {
    secure:      issues.length === 0,
    issueCount:  issues.length,
    issues,
    attackerModel: 'Dolev-Yao (intercept, replay, forge)',
  };
}

// ── Complexity metrics ─────────────────────────────────────────────────────
function complexityMetrics(machine) {
  const n = machine.states.length;
  const e = machine.transitions.length;
  const cyclomatic = e - n + 2; // McCabe
  return {
    states:         n,
    transitions:    e,
    cyclomaticComplexity: cyclomatic,
    density:        n > 1 ? (e / (n * (n - 1))).toFixed(4) : 0,
  };
}

// ── Main verification entry point ──────────────────────────────────────────
async function verifyStateMachine(machine, options = {}) {
  const startMs = Date.now();
  const verificationId = crypto.randomBytes(8).toString('hex').toUpperCase();

  // 1. Reachability
  const reach = bfsReachability(machine);

  // 2. Trace generation
  const traces = generateTraces(machine, options.maxDepth || 12);

  // 3. Invariant checking
  const invariants = checkInvariants(traces, options.customInvariants || []);

  // 4. Protocol analysis (optional)
  let protocol = null;
  if (options.protocol) {
    protocol = dolevYaoAnalysis(options.protocol);
  }

  // 5. Metrics
  const metrics = complexityMetrics(machine);

  const passed = reach.unreachable.length === 0 &&
                 invariants.every(i => i.passed) &&
                 (protocol ? protocol.secure : true);

  return {
    verificationId,
    machineId:       machine.id,
    passed,
    durationMs:      Date.now() - startMs,
    timestamp:       new Date().toISOString(),
    summary: {
      totalStates:      machine.states.length,
      reachableStates:  reach.reachable.length,
      unreachableStates: reach.unreachable.length,
      deadEndStates:    reach.deadEnds.length,
      tracesExplored:   traces.length,
      invariantsPassed: invariants.filter(i => i.passed).length,
      invariantsFailed: invariants.filter(i => !i.passed).length,
    },
    reachability:  reach,
    invariants,
    protocol,
    metrics,
    recommendation: passed
      ? 'State machine passes all formal checks. Safe to deploy.'
      : 'Violations detected. Review invariant failures before deployment.',
  };
}

/**
 * Quick-verify a single execution trace against built-in invariants.
 */
function verifyTrace(trace) {
  const results = checkInvariants([trace]);
  const passed  = results.every(r => r.passed);
  return {
    trace,
    passed,
    checks: results,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Predefined supply-chain machines for common scenarios.
 */
const PRESET_MACHINES = {
  STANDARD_SHIPMENT: {
    id: 'standard-shipment',
    states: ['CREATED','PICKUP','IN_TRANSIT','CUSTOMS','INSPECTED','DELIVERED','FINALIZED'],
    initial: 'CREATED',
    final:   ['FINALIZED'],
    transitions: [
      { from: 'CREATED',    to: 'PICKUP',     label: 'dispatch'   },
      { from: 'PICKUP',     to: 'IN_TRANSIT', label: 'handoff'    },
      { from: 'IN_TRANSIT', to: 'CUSTOMS',    label: 'border'     },
      { from: 'CUSTOMS',    to: 'INSPECTED',  label: 'cleared'    },
      { from: 'CUSTOMS',    to: 'HELD',       label: 'hold'       },
      { from: 'HELD',       to: 'CUSTOMS',    label: 'resubmit'   },
      { from: 'INSPECTED',  to: 'DELIVERED',  label: 'deliver'    },
      { from: 'DELIVERED',  to: 'FINALIZED',  label: 'confirm'    },
    ],
  },
  PQC_KEY_LIFECYCLE: {
    id: 'pqc-key-lifecycle',
    states: ['INIT','KEY_GENERATED','CERTIFIED','ACTIVE','SUSPENDED','REVOKED','ARCHIVED'],
    initial: 'INIT',
    final:   ['ARCHIVED'],
    transitions: [
      { from: 'INIT',         to: 'KEY_GENERATED', label: 'generate'  },
      { from: 'KEY_GENERATED',to: 'CERTIFIED',     label: 'certify'   },
      { from: 'CERTIFIED',    to: 'ACTIVE',         label: 'activate'  },
      { from: 'ACTIVE',       to: 'SUSPENDED',      label: 'suspend'   },
      { from: 'SUSPENDED',    to: 'ACTIVE',         label: 'resume'    },
      { from: 'ACTIVE',       to: 'REVOKED',        label: 'revoke'    },
      { from: 'SUSPENDED',    to: 'REVOKED',        label: 'revoke'    },
      { from: 'REVOKED',      to: 'ARCHIVED',       label: 'archive'   },
    ],
  },
};

module.exports = {
  verifyStateMachine,
  verifyTrace,
  PRESET_MACHINES
};