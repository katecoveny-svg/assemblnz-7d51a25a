/**
 * PIKAU data generator — Assembl simulator
 * Version: stub · 0.1.0 · 2026-04-09
 *
 * Generates synthetic NZ-realistic data for the PIKAU (privacy/tech) kete.
 * Pure function — deterministic given scenario_id + seed. No LLM calls.
 *
 * Fixture types produced:
 *   - support_tickets: IT support tickets for a synthetic NZ tech company
 *   - incident_timeline: privacy or security incident timeline
 *   - access_logs: authentication and access events
 *   - vendor_register: third-party data processors
 *
 * Full implementation: Milestone 3 (simulator runner v0.1)
 */

import type { KeteGenerator, GeneratorOutput } from '../../types.js';

/**
 * Seeded pseudo-random number generator (Mulberry32).
 * Gives us deterministic outputs without a crypto dependency.
 */
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── Fake-data pools ──────────────────────────────────────────────────────────
// All names, addresses, IRD numbers, and domains are synthetic.
// IRD numbers use 000-prefix (reserved fake range).
// Domains use example.co.nz.

const COMPANY_NAMES = [
  'Tūhono Tech Ltd',
  'Aotearoa Cloud Services Ltd',
  'Kōpura Systems Limited',
  'Rerenga Digital Ltd',
  'Pūanga Software Limited',
];

const FIRST_NAMES = ['Aroha', 'Tama', 'Mere', 'Hemi', 'Anika', 'James', 'Sarah', 'Daniel', 'Ngaio', 'Rangi'];
const LAST_NAMES = ['Tane', 'Walker', 'Smith', 'Brown', 'Ngata', 'Chen', 'Parata', 'Williams', 'Harawira', 'King'];

const AUCKLAND_STREETS = [
  '12 Simulated Street',
  '44 Fictional Avenue',
  '7 Placeholder Lane',
  '99 Demo Road',
  '3 Example Terrace',
];

// ─── Generator implementation ─────────────────────────────────────────────────

/**
 * [TODO: Milestone 3] Replace stub fixture generation with full synthetic data sets:
 *   - 5–10 realistic support tickets with priority, category, timestamps
 *   - Incident timeline with 6–12 events (detection, containment, assessment, notification)
 *   - Access log with 20–50 events (logins, failed attempts, privilege escalations)
 *   - Vendor register with 3–8 third-party processors + data categories they hold
 */
export const pikauGenerator: KeteGenerator = {
  generate(scenario_id: string, seed: number, params: Record<string, unknown>): GeneratorOutput {
    const rng = mulberry32(seed);
    const companyName = COMPANY_NAMES[Math.floor(rng() * COMPANY_NAMES.length)];
    const employeeCount = params.employee_count as number ?? 25;

    // [TODO: Milestone 3] Generate full fixture set. For now, return minimal stubs.
    const fixtures = {
      company: {
        name: companyName,
        ird_number: `000-${Math.floor(rng() * 900000 + 100000)}-${Math.floor(rng() * 9)}`,
        address: AUCKLAND_STREETS[Math.floor(rng() * AUCKLAND_STREETS.length)] + ', Auckland 1010',
        domain: 'example.co.nz',
        employee_count: employeeCount,
        industry: 'technology',
      },
      support_tickets: [] as unknown[],   // [TODO: Milestone 3]
      incident_timeline: [],              // [TODO: Milestone 3]
      access_logs: [],                    // [TODO: Milestone 3]
      vendor_register: [],                // [TODO: Milestone 3]
    };

    return {
      scenario_id,
      seed,
      kete: 'PIKAU',
      fixtures,
      metadata: {
        generator_version: '0.1.0',
        generated_at: new Date().toISOString(),
        real_enough_checklist: [
          'Company name uses te reo Māori / NZ English mix — realistic for NZ tech sector',
          'IRD numbers use 000-prefix reserved fake range — will never match a real IRD number',
          'Domain is example.co.nz — cannot resolve to a real site',
          'Street names are from a curated fictional list — not real Auckland addresses',
          '[TODO: add checklist items as fixture types are filled in at Milestone 3]',
        ],
      },
    };
  },
};
