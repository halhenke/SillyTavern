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
