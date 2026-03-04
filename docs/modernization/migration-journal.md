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

## 2026-03-05 - Concern-Specific Adapter Split

### Completed
- Introduced focused runtime adapters under `public/scripts/runtime/`:
  - `events-adapter.js`
  - `network-adapter.js`
  - `settings-adapter.js`
  - `chat-adapter.js`
  - `generation-adapter.js`
  - `parser-adapter.js`
  - `extensions-adapter.js`
  - `api-adapter.js`
- Converted `runtime-adapter.js` into a compatibility re-export layer pointing to focused adapters.
- Rewired migrated modules to consume focused adapters directly (instead of `runtime-adapter.js`):
  - `backgrounds.js`
  - `custom-request.js`
  - `data-maid.js`
  - `instruct-mode.js`
  - `logit-bias.js`
  - `scrapers.js`
  - `secrets.js`
  - `server-history.js`
  - `showdown-exclusion.js`
  - `stats.js`
  - `sysprompt.js`
  - `textgen-models.js`
  - `user.js`
  - `variables.js`
- Migrated additional direct `../script.js` imports in:
  - `tokenizers.js`
  - `utils.js`

### Measurable Impact
- Direct `../script.js` imports across `public/scripts` reduced from **66** to **60**.

### Insights
- Adapter-by-concern is easier to migrate incrementally and reason about than a single broad facade.
- We can now replace adapter internals with real standalone services one concern at a time.

### Next
1. Continue adapter migration for remaining direct imports (`tags`, `macros`, `tool-calling`, `system-messages`, etc.).
2. Start extracting one concrete concern implementation (settings persistence service) behind adapters.
3. Add lint guardrails to block new direct `../script.js` imports outside approved compatibility zones.

## 2026-03-05 - Adapter Migration Wave 3

### Completed
- Added `runtime/chat-operations-adapter.js` for message/chat operations and runtime display/system metadata.
- Rewired additional modules off direct `../script.js` imports:
  - `system-messages.js`
  - `tool-calling.js`
  - `itemized-prompts.js`
  - `macros.js`
- Rewired `tokenizers.js` and `utils.js` to focused adapters (`chat`, `api`, `generation`, `network`).

### Measurable Impact
- Direct `../script.js` imports across `public/scripts` reduced from **60** to **52**.
- Root-level direct imports reduced from **30** to **26**.

### Insights
- Moving consumer files to concern-specific adapters is now faster than expanding one large facade.
- `chat-operations-adapter` is a useful stepping stone before fully isolating message/state services.

### Next
1. Continue with remaining high-coupling modules (`tags`, `world-info`, `slash-commands`, `openai`, `power-user`).
2. Add lint rule(s) to prevent new direct `../script.js` imports where adapters exist.
3. Begin replacing adapter internals for one concern with standalone module implementations.

## 2026-03-05 - Adapter Migration Wave 4

### Completed
- Added shared runtime adapters for backend status and UI state:
  - `runtime/backend-status-adapter.js`
  - `runtime/ui-adapter.js`
- Expanded `runtime/generation-adapter.js` with `getStoppingStrings` and `setGenerationProgress`.
- Migrated additional direct `../script.js` consumers:
  - `PromptManager.js`
  - `samplerSelect.js`
  - `kai-settings.js`
  - `nai-settings.js`
  - `horde.js`
  - `textgen-settings.js`

### Measurable Impact
- Direct `../script.js` imports across `public/scripts` reduced from **52** to **40**.
- Root-level direct imports reduced from **26** to **20**.

### Insights
- Shared backend/status adapters are effective because multiple model/backend modules have near-identical import sets.
- Remaining direct imports are concentrated in the largest coupling hubs (`openai`, `slash-commands`, `world-info`, `power-user`, `group-chats`, `chats`).

### Next
1. Tackle one heavyweight hub next (`tags`/`world-info` first, then `openai` and `slash-commands`).
2. Add CI/lint guardrails against new direct `../script.js` imports.
3. Start replacing one adapter with a real service implementation to move beyond re-export compatibility.

## 2026-03-05 - Adapter Migration Wave 5

### Completed
- Expanded adapters to cover more UI/runtime bindings:
  - `runtime/ui-adapter.js` now exports `animation_duration` and `MAX_INJECTION_DEPTH`.
  - `runtime/extensions-adapter.js` now exports `extension_prompt_roles`.
  - `runtime/chat-operations-adapter.js` now exports `saveChat`, `openCharacterChat`, `getCharacters`, and `saveItemizedPrompts`.
- Migrated additional modules off direct `../script.js` imports:
  - `cfg-scale.js`
  - `authors-note.js`
  - `bookmarks.js`

### Measurable Impact
- Direct `../script.js` imports across `public/scripts` reduced from **40** to **34**.
- Root-level direct imports reduced from **20** to **17**.

### Insights
- Continuing to enrich focused adapters is steadily accelerating consumer-file migrations.
- Remaining direct imports are now concentrated in the largest orchestration files, which should be addressed as dedicated refactor tracks.

### Next
1. Start a focused migration track for `tags.js` and `world-info.js`.
2. Then address `openai.js`, `slash-commands.js`, and `power-user.js` as separate large-scope tracks.
3. Add lint guardrails to prevent regression in import direction.

## 2026-03-05 - Adapter Migration Wave 6

### Completed
- Added `runtime/character-adapter.js` to isolate bulk-edit character operations from direct `script.js` imports.
- Migrated:
  - `bulk-edit.js`
  - `BulkEditOverlay.js`

### Measurable Impact
- Direct `../script.js` imports across `public/scripts` reduced from **34** to **30**.
- Root-level direct imports reduced from **17** to **15**.

### Insights
- Small focused adapters for specific high-coupling UI clusters (like bulk edit) are fast wins.
- The remaining direct imports are increasingly concentrated in top-level orchestration modules.

### Next
1. Create dedicated migration tracks for remaining hubs: `tags`, `world-info`, `openai`, `slash-commands`, `power-user`, `chats`, `group-chats`.
2. Add lint constraints to block new direct `../script.js` usage where adapter equivalents exist.
