/**
 * Scenario runner — Assembl simulator
 * Version: stub · 0.1.0 · 2026-04-09
 *
 * Takes a ScenarioConfig, runs it through the generator + agent, pipes the
 * WorkflowResult to the evidence bundle generator, and asserts the output
 * matches the scenario's success criteria.
 *
 * Full implementation: Milestone 3 (simulator runner v0.1)
 */

import type { ScenarioConfig, ScenarioRunResult, ScenarioFailure } from '../types.js';
import type { BundleArtifact } from '../../evidence-bundles/schema.js';
import { pikauGenerator } from '../generators/pikau/index.js';
import { runAgentStub } from './agent-stub.js';
import { buildBundle } from '../../evidence-bundles/generator.js';

const GENERATORS: Record<string, import('../types.js').KeteGenerator> = {
  PIKAU: pikauGenerator,
  // [TODO: Milestone 6+] add MANAAKI, WAIHANGA, ARATAKI, AUAHA generators
};

/**
 * Run a single scenario and return the result.
 *
 * [TODO: Milestone 3] Replace runAgentStub with the real managed agents runtime shim.
 * [TODO: Milestone 3] Implement all success_criteria assertion types.
 */
export async function runScenario(scenario: ScenarioConfig): Promise<ScenarioRunResult> {
  const start = Date.now();

  const generator = GENERATORS[scenario.kete];
  if (!generator) {
    return {
      scenario_id: scenario.id,
      kete: scenario.kete,
      passed: false,
      failures: [{ criterion: 'generator_exists', expected: `generator for ${scenario.kete}`, actual: 'not found' }],
      bundle_artifact: null,
      duration_ms: Date.now() - start,
    };
  }

  // 1. Generate synthetic fixtures
  const generatorOutput = generator.generate(scenario.id, scenario.seed, scenario.generator_inputs);

  // 2. Run through the agent (stub for now)
  const workflowResult = await runAgentStub(generatorOutput, scenario.workflow_id);

  // 3. Build the evidence pack
  const buildResult = buildBundle(workflowResult, {
    scenario_id: scenario.id,
    generator_version: generatorOutput.metadata.generator_version,
  });

  if ('kind' in buildResult) {
    return {
      scenario_id: scenario.id,
      kete: scenario.kete,
      passed: false,
      failures: [{ criterion: 'bundle_builds', expected: 'BundleArtifact', actual: `error: ${buildResult.kind}` }],
      bundle_artifact: null,
      duration_ms: Date.now() - start,
    };
  }

  const bundleArtifact = buildResult as BundleArtifact;

  // 4. Assert success criteria
  const failures: ScenarioFailure[] = [];

  for (const criterion of scenario.success_criteria) {
    const failure = assertCriterion(criterion, workflowResult, bundleArtifact);
    if (failure) failures.push(failure);
  }

  return {
    scenario_id: scenario.id,
    kete: scenario.kete,
    passed: failures.length === 0,
    failures,
    bundle_artifact: bundleArtifact,
    duration_ms: Date.now() - start,
  };
}

/**
 * [TODO: Milestone 3] Implement all assertion types properly.
 * Stubs pass everything for now so the skeleton compiles and CI runs.
 */
function assertCriterion(
  criterion: import('../types.js').SuccessCriteria,
  workflowResult: import('../../evidence-bundles/schema.js').WorkflowResult,
  _bundle: BundleArtifact,
): ScenarioFailure | null {
  switch (criterion.assertion) {
    case 'no_unsourced_findings': {
      const unsourced = workflowResult.findings.filter(f => !f.source_pointer);
      if (unsourced.length > 0) {
        return {
          criterion: criterion.description,
          expected: 'all findings have source_pointer',
          actual: `${unsourced.length} findings without source_pointer: ${unsourced.map(f => f.id).join(', ')}`,
        };
      }
      return null;
    }

    case 'bundle_valid': {
      if (criterion.params.simulated && !workflowResult.simulated) {
        return {
          criterion: criterion.description,
          expected: 'simulated: true',
          actual: 'simulated: false',
        };
      }
      return null;
    }

    case 'ipp_snapshot_status':     // [TODO: Milestone 3]
    case 'finding_exists':          // [TODO: Milestone 3]
    case 'finding_severity':        // [TODO: Milestone 3]
      return null;   // stub: pass all for now

    default:
      return null;
  }
}
