# Frontend Migration Journal

## 2026-03-05 - Bootstrap

### Completed
- Added frontend modernization docs and ADR framework.
- Added server-managed React feature flags:
  - `frontend.reactLoginEnabled`
  - `frontend.reactShellEnabled`
  - `frontend.distDirectory`
- Added route-level fallback strategy:
  - React candidates: `/`, `/login`
  - Legacy-safe paths: `/legacy`, `/legacy-login`
- Added frontend runtime flags API: `/api/frontend/flags`.
- Scaffolded a strict TypeScript React app in `frontend/` using Vite.
- Implemented first bridge interfaces:
  - `CoreEventBus`
  - `SettingsService`
  - `ChatService`
  - `GenerationService`
  - `ExtensionHostService`
- Added legacy bridge adapter that consumes `window.SillyTavern.getContext()`.
- Implemented initial React login flow and minimal app shell (legacy iframe host).
- Added initial browser-side runtime adapter seam: `public/scripts/runtime-adapter.js` and moved selected modules (`server-history`, `sysprompt`, `logit-bias`) to it.

### Insights
- Full rewrite is high-risk because extension compatibility is coupled to both global context and event semantics.
- The safest migration seam is route-level cutover plus typed adapters, not direct module-by-module replacement in place.
- A dedicated `/legacy` route is useful for rollback verification, iframe bridging, and side-by-side comparisons.

### Risks
- React shell currently embeds legacy runtime in an iframe; deeper integration requires explicit cross-runtime event/state strategy.
- Frontend dependencies are not installed in this workspace yet, so compile/runtime validation is pending.

### Next
1. Install frontend dependencies and run `ui:typecheck`, `ui:test`, and smoke checks.
2. Add parity E2E assertions for login states (discreet, normal, recovery).
3. Begin replacing direct `../script.js` imports via typed adapter modules.

## 2026-03-05 - Runtime Adapter Expansion

### Completed
- Expanded `public/scripts/runtime-adapter.js` to include broader legacy runtime bindings.
- Migrated additional modules from direct `../script.js` imports to `./runtime-adapter.js`:
  - `backgrounds.js`
  - `custom-request.js`
  - `data-maid.js`
  - `instruct-mode.js`
  - `scrapers.js`
  - `secrets.js`
  - `showdown-exclusion.js`
  - `stats.js`
  - `textgen-models.js`
  - `user.js`
  - `variables.js`

### Measurable Impact
- Direct `../script.js` imports across `public/scripts` reduced from **92** to **66**.

### Insights
- A central facade lets us cut monolith coupling quickly without breaking runtime behavior.
- This adapter pass creates a clear seam for later extraction of real service modules.

### Next
1. Split `runtime-adapter.js` into concern-specific adapters (`events`, `settings`, `network`, `generation`) to avoid becoming a second monolith.
2. Continue migrating remaining `../script.js` imports to adapters.
3. Start swapping selected adapter exports from `script.js` bindings to standalone service implementations.
