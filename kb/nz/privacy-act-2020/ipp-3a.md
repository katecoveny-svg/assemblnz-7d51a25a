# IPP3A — Collection of personal information from other sources
# KB path: kb/nz/privacy-act-2020/ipp-3a.md
# Version: stub · 0.1 · 2026-04-09
# Last verified: [TODO]
# Source: Privacy Act 2020 s22A (as inserted by Privacy Amendment Act 2025)

---

## What IPP3A says

[TODO: Insert the full text of IPP3A from the Privacy Act 2020 as amended.]

In summary (not a substitute for the Act):

IPP3A applies when an agency collects personal information about an individual **from a source other than the individual themselves** (indirect collection). In that case, the agency must take reasonable steps to ensure the individual is aware of:
- the fact that information about them has been or will be collected;
- the purpose for which it is collected;
- the agency holding the information;
- the individual's right to access and correct the information.

**Effective date: 1 May 2026.** Agencies must comply from this date.

---

## Who IPP3A applies to

[TODO: confirm from OPC guidance — applies to all agencies within scope of the Privacy Act 2020 that collect personal information indirectly.]

---

## What "collection" means for AI systems

[TODO: Add OPC guidance on how IPP3A applies to AI-assisted data collection — e.g. scraping, inference, automated profiling, data bought from third parties, data shared from partner systems.]

Key questions to address:
- Does using an AI agent to process data about a person constitute "collection" under IPP3A?
- When does indirect collection trigger the notice obligation?
- What counts as "reasonable steps" to notify the individual?

---

## Checklist — does IPP3A apply to this workflow?

Ask these questions for every input where `simulated: false` and the input contains personal information:

- [ ] Was this personal information collected directly from the individual (i.e. they provided it to you)? If yes → IPP3A does **not** apply to this input.
- [ ] Was this personal information collected from a third party, a data feed, a partner system, or an AI inference step? If yes → IPP3A **may** apply.
- [ ] Has the individual been notified that you hold this information, for what purpose, and by whom? If not → record a gap finding.
- [ ] Is there an exemption that applies (e.g. the collection was authorised by law, or would prejudice a law enforcement purpose)? If yes → cite the exemption.

---

## Required fields in the PIKAU extension (kete_extension.ipp3a_collection_source_notices)

For each input that triggers IPP3A, record:
- `data_type` — what type of personal information (e.g. "employment history", "health data")
- `collection_method` — `indirect` (IPP3A applies) or `direct` (IPP2/3 applies)
- `source_ref` — filename or system name
- `notice_given` — boolean — has the individual been notified?

---

## Citations to use in findings

When citing IPP3A in a finding:
- Type: `law`
- Label: `Privacy Act 2020 IPP3A`
- Locator: `Privacy Act 2020 s22A` [TODO: confirm section number from final amendment Act]
- Retrieved at: [date of analysis]

---
