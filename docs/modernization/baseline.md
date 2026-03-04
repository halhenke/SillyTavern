# Frontend Baseline Metrics (2026-03-05)

## File Size / Complexity Snapshot
- `public/index.html`: 7,705 LOC, ~670 KB, 1,255 element IDs, 735 controls (`input/select/button/textarea`)
- `public/script.js`: 11,019 LOC, ~420 KB
- Largest JS modules by size:
  - `public/scripts/openai.js`: 6,340 LOC (~252 KB)
  - `public/scripts/world-info.js`: 5,784 LOC (~231 KB)
  - `public/scripts/slash-commands.js`: 5,578 LOC (~220 KB)
  - `public/scripts/power-user.js`: 4,469 LOC (~166 KB)

## Coupling / Dependency Snapshot
- Imports in `public/script.js`: 63
- jQuery call sites in `public/script.js`: 666
- Imports of `../script.js` across `public/scripts`: 92
- Highest import fan-out modules:
  - `public/scripts/slash-commands.js`: 76 imports
  - `public/script.js`: 63 imports
  - `public/scripts/st-context.js`: 56 imports

## Baseline Quality Gates
- Preserve extension compatibility (`window.SillyTavern.getContext`, `event_types`, `eventSource`).
- Ship all new frontend surfaces behind server-side feature flags.
- Maintain direct legacy fallback routes for each migrated entrypoint.
