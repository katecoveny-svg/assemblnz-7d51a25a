/**
 * Evidence pack generator — Assembl
 * Version: stub · 0.1.0 · 2026-04-09
 *
 * Pure function: WorkflowResult → BundleArtifact | BuildBundleError
 *
 * Rules (non-negotiable, enforced in this file):
 *   1. Trace check: every Finding must have a non-empty source_pointer. Refuses to build if not.
 *   2. Simulated flag: if ANY input has simulated: true, the bundle is SIMULATED — no override.
 *   3. User-facing strings say "evidence pack" — not "bundle", not "compliance pack".
 *
 * Milestone 2 will replace the zip stub with:
 *   - cover.pdf with SIMULATED watermark if simulated: true (using jsPDF)
 *   - detail.pdf with full pipeline trace
 *   - JSZip packaging
 *   - sha-256 signing of all files
 *
 * [TODO: Milestone 2] Full PDF generation + JSZip packaging
 */

import { createHash } from 'crypto';
import type {
  WorkflowResult,
  BundleOptions,
  BundleArtifact,
  BundleManifest,
  BuildBundleError,
  BundleFileEntry,
} from './schema.js';

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Build an evidence pack from a fully-resolved WorkflowResult.
 *
 * Returns BundleArtifact on success.
 * Returns BuildBundleError if the trace check fails or the simulated flag is inconsistent.
 *
 * Pure: same input → same output. No network calls. No state.
 * Side effects (storage, email, signing) live in the host, not here.
 */
export function buildBundle(
  workflowResult: WorkflowResult,
  options: BundleOptions,
): BundleArtifact | BuildBundleError {
  // ── 1. Simulated flag consistency check ──────────────────────────────────
  const hasSimulatedInput = workflowResult.inputs.some(i => i.simulated);
  if (hasSimulatedInput && !workflowResult.simulated) {
    const error: BuildBundleError = {
      kind: 'simulated_flag_mismatch',
      message:
        'workflow_result.simulated must be true because at least one input has simulated: true. ' +
        'There is no override flag.',
    };
    return error;
  }

  // ── 2. Trace check — no unsourced claims ────────────────────────────────
  const unsourcedFindings = workflowResult.findings.filter(f => !f.source_pointer || f.source_pointer.trim() === '');
  if (unsourcedFindings.length > 0) {
    const error: BuildBundleError = {
      kind: 'trace_check_failed',
      finding_ids_without_source: unsourcedFindings.map(f => f.id),
    };
    return error;
  }

  // ── 3. Assemble data.json ────────────────────────────────────────────────
  const dataJson = JSON.stringify(workflowResult, null, 2);
  const dataJsonBytes = Buffer.from(dataJson, 'utf-8');
  const rawJsonSha256 = sha256(dataJsonBytes);

  // ── 4. Build manifest.json ───────────────────────────────────────────────
  const pipelineStagesRun = Object.entries(workflowResult.pipeline)
    .filter(([, stage]) => stage !== null)
    .map(([name]) => name);

  const files: BundleFileEntry[] = [
    {
      path: 'data.json',
      sha256: rawJsonSha256,
      size_bytes: dataJsonBytes.length,
    },
    // [TODO: Milestone 2] add cover.pdf, detail.pdf, cover.docx entries after generation
  ];

  const manifest: BundleManifest = {
    bundle_id: workflowResult.bundle_id,
    schema_version: workflowResult.schema_version,
    generated_at: workflowResult.generated_at,
    generator_version: options.generator_version,
    agent_name: workflowResult.agent.name,
    agent_version: workflowResult.agent.version,
    kete: workflowResult.agent.kete,
    pipeline_stages_run: pipelineStagesRun,
    simulated: workflowResult.simulated,
    scenario_id: options.scenario_id ?? null,
    files,
    raw_json_sha256: rawJsonSha256,
  };

  const manifestJson = JSON.stringify(manifest, null, 2);
  const manifestBytes = Buffer.from(manifestJson, 'utf-8');

  // Add manifest to the files list now we have its content
  manifest.files.push({
    path: 'manifest.json',
    sha256: sha256(manifestBytes),
    size_bytes: manifestBytes.length,
  });

  // ── 5. Package as zip ────────────────────────────────────────────────────
  // [TODO: Milestone 2] Replace with JSZip to produce a proper .zip archive.
  // Stub: produce a minimal valid Uint8Array that encodes both files as a
  // newline-delimited concatenation so tests can verify the contents.
  const zipStub = buildZipStub({ 'data.json': dataJsonBytes, 'manifest.json': manifestBytes });

  return {
    bundle_id: workflowResult.bundle_id,
    zip_bytes: zipStub,
    manifest,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sha256(bytes: Buffer): string {
  return createHash('sha256').update(bytes).digest('hex');
}

/**
 * Minimal zip stub — concatenates files with a simple header.
 * Replaced by real JSZip in Milestone 2.
 * Format: JSON array of { path, content_base64 } entries, UTF-8 encoded.
 * Tests use extractZipStub() to verify contents without a real zip parser.
 */
function buildZipStub(files: Record<string, Buffer>): Uint8Array {
  const entries = Object.entries(files).map(([path, content]) => ({
    path,
    content_base64: content.toString('base64'),
  }));
  return Buffer.from(JSON.stringify(entries), 'utf-8');
}

/**
 * Extracts the zip stub for testing purposes.
 * Not used in production — replaced when real zip is added in Milestone 2.
 */
export function extractZipStub(zipBytes: Uint8Array): Record<string, Buffer> {
  const entries = JSON.parse(Buffer.from(zipBytes).toString('utf-8')) as Array<{
    path: string;
    content_base64: string;
  }>;
  const result: Record<string, Buffer> = {};
  for (const entry of entries) {
    result[entry.path] = Buffer.from(entry.content_base64, 'base64');
  }
  return result;
}
