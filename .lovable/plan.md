

## Te Kāhui Reo Agents — Already Present

All 8 Te Kāhui Reo agents and the sector already exist in `src/data/agents.ts`:

| Agent | Current Designation | Your Requested Designation |
|-------|-------------------|---------------------------|
| KAIAKO | ASM-044 | ASM-048 |
| WHAKAMĀORI | ASM-045 | ASM-049 |
| TURE | ASM-046 | ASM-050 |
| KAWANATANGA | ASM-047 | ASM-051 |
| MĀTAURANGA | ASM-048 | ASM-052 |
| ŌHANGA | ASM-049 | ASM-053 |
| HAPORI | ASM-050 | ASM-054 |
| MATIHIKO | ASM-051 | ASM-055 |

"Te Kāhui Reo" is already in the sectors array (line 670).

### What Needs Doing

**Option A — Update designations only**: Change ASM-044→ASM-048 through ASM-051→ASM-055 to match your requested numbering. This is a simple find-and-replace on 8 designation strings.

**Option B — No changes needed**: Keep the current ASM-044–ASM-051 numbering as-is since all content matches.

### Build Error (GIT_FILES_NOT_LISTABLE)

This error is a Git sync issue, not a code error. It typically resolves by:
1. Making any small edit to trigger a fresh build
2. Refreshing the editor

### Plan (if Option A)

| File | Change |
|------|--------|
| `src/data/agents.ts` | Update 8 designation values from ASM-044–051 to ASM-048–055 |

