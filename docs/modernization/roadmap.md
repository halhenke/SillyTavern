# Frontend Modernization Roadmap

## Scope
Modernize SillyTavern frontend incrementally with React + TypeScript + Vite while preserving extension compatibility and UX parity.

## Phase Status

| Phase | Name | Status | Entry Criteria | Exit Criteria |
|---|---|---|---|---|
| 0 | Baseline + governance | In progress | Repo baseline and architecture constraints captured | ADR-0001 accepted, baseline metrics committed |
| 1 | Tooling bootstrap | In progress | Frontend workspace scaffolded | React build served by Express behind flags without default behavior changes |
| 2 | Compatibility bridge | In progress | Typed service contracts defined | New React code uses adapters, no extension-facing contract regressions |
| 3 | Login + shell slice | In progress | Feature flags + bridge + routes exist | React login parity and shell mount available behind flags |
| 4 | Core modularization | Planned | Contract boundaries stable | Reduced direct imports from `script.js`, service modules tested |
| 5 | Incremental UI slices | Planned | Core modules available | Slice-by-slice parity and regression checks pass |
| 6 | Extension stabilization | Planned | Slice migrations underway | Contract tests green for extension context/event surfaces |
| 7 | Cutover + decommission | Planned | Sustained green on migrated slices | React defaults enabled, legacy modules reduced |
| 8 | Perf + quality hardening | Planned | Cutover complete | Measurable startup/runtime improvements and guardrails enforced |

## Migration Order (Locked)
1. Login + app shell
2. Settings surfaces and drawer state
3. Character/group list and selection panes
4. Message list and interaction primitives
5. Composer/send/generation controls
6. World info and prompt manager
7. Extension manager UI

## Rollout Controls
- All migrated surfaces are gated by server config flags.
- Every route has an explicit legacy fallback path.
- No backend API shape changes in migration phases unless an ADR approves it.

## Current Feature Flags
Configured in `config.yaml` under `frontend`:
- `reactLoginEnabled`
- `reactShellEnabled`
- `distDirectory`

## Immediate Next Milestones
1. Build and validate the new frontend in CI (`ui:typecheck`, `ui:test`).
2. Add E2E checks for React login parity and shell iframe bridge.
3. Start extracting high-traffic legacy imports behind typed services.
