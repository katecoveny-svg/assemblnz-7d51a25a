

## Fix ORA False Triggers and "Needs Your Attention" Accuracy

### Problems Identified

1. **Duplicate trigger rules** in `agent-intelligence/index.ts` — The `new_project|project_started` rule for `construction` appears TWICE (lines 39-46 and lines 57-65), generating double alerts for the same event.

2. **Overly broad regex matching** — Patterns like `/deal_closed|deal_won|new_client/i` can match substrings in unrelated context keys (e.g., a context key containing "client" anywhere). This causes false cross-agent alerts that surface on wrong agent dashboards.

3. **ORA false trigger** — ORA (publichealth, ASM-035) is not a target in any trigger rule, but the `ProactiveAlertCards` component shows alerts where `target_agent` OR `source_agent` matches — if any context key from a health-related agent matches a broad regex, ORA's dashboard picks it up. The target agents use generic IDs like `"hr"`, `"legal"`, `"finance"`, `"it"`, `"echo"` which don't map cleanly to actual agent IDs in the system (e.g., `"hr"` could be confused with health/hauora contexts).

4. **"Needs Your Attention" inaccuracy** — The section blindly merges health faults, compliance deadlines, and legislation changes without deduplication or relevance filtering. Health faults from false health check failures (now fixed) may still be cached in the database.

### Plan

**Step 1: Fix duplicate trigger rules in `agent-intelligence`**
- Remove the duplicate `new_project|project_started` block (lines 57-65)
- Make regexes more specific with word boundaries where possible
- Ensure `targetAgent` IDs match actual agent IDs from the registry (e.g., `"hr"` → `"people"` or the correct agent ID used in routing)

**Step 2: Verify agent ID mapping**
- Cross-reference trigger rule `targetAgent` and `sourceAgent` values against actual agent IDs in `src/data/agents.ts`
- Fix mismatches (the agents data uses IDs like `"people"` for AROHA, `"finance"` for LEDGER, `"sales"` for FLUX, etc.)

**Step 3: Fix ProactiveAlertCards filtering**
- Tighten the query in `ProactiveAlertCards.tsx` to only show alerts where `target_agent` equals the current agent ID (not source_agent — source alerts belong on the source agent's page, not the target's)
- This prevents ORA from showing alerts meant for other agents

**Step 4: Clean up "Needs Your Attention"**
- Add deduplication logic to prevent the same deadline appearing in both the attention list and the compliance section
- Filter out stale health check errors (older than 1 hour) from the attention items
- Cap the severity display so only genuinely actionable items surface

**Step 5: Redeploy `agent-intelligence` edge function**

### Files Modified
- `supabase/functions/agent-intelligence/index.ts` — remove duplicate rules, tighten regexes
- `src/components/chat/ProactiveAlertCards.tsx` — fix query to filter by `target_agent` only
- `src/pages/DashboardPage.tsx` — improve attention items filtering and deduplication

