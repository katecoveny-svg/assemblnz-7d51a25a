

# Restore Hero Robot & Unify Agent Mascots

## Problem Summary

Two distinct issues have been recurring:

1. **Hero robot** (`hero-orb-robot.png`) has been overwritten multiple times and no longer matches the original cosmic orb design you loved.
2. **Agent mascots** keep getting regenerated as **different-looking robots** for each agent. You want them ALL to be the **exact same robot body**, differing ONLY in eye/sparkle/accent colour.

---

## Root Cause

AI image generation produces a unique robot every time it runs. There is no way to generate 40+ identical robots with only colour variations using text-to-image. Each prompt produces a structurally different robot, which is why they keep coming out wrong.

---

## Proposed Solution

### Step 1 — Restore the Original Hero Robot

- Use `cross_project` tools to find the **original** `hero-orb-robot.png` from an earlier project version before any overwrites occurred.
- Copy that exact file back to `src/assets/agents/hero-orb-robot.png`.
- If no earlier version exists, keep the current `assembl-hero.png` (which was already copied over).

### Step 2 — Create ONE Base Mascot Template

Instead of generating 40+ separate images, generate **one single "template" mascot** with:
- Matte black 3D Pixar-style body
- Dark reflective visor
- Tri