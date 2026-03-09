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

## 2026-03-05 - Adapter Migration Wave 7

### Completed
- Added `runtime/app-state-adapter.js` for `menu_type`, `entitiesFilter`, and `DEFAULT_PRINT_TIMEOUT`.
- Expanded adapter surfaces:
  - `runtime/settings-adapter.js` (`saveSettings`, `saveCharacterDebounced`, `saveMetadata`)
  - `runtime/extensions-adapter.js` (`getExtensionPromptByName`)
  - `runtime/character-adapter.js` (`printCharacters`)
- Migrated additional high-coupling files:
  - `preset-manager.js`
  - `tags.js`
  - `world-info.js`

### Measurable Impact
- Direct `../script.js` imports across `public/scripts` reduced from **30** to **24**.
- Root-level direct imports reduced from **15** to **12**.

### Insights
- `world-info` and `tags` were viable to migrate once adapter coverage reached settings/state/extension prompt bindings.
- Splitting adapters by concern continues to keep migrations mechanical and low risk.

## 2026-03-05 - Adapter Migration Wave 8

### Completed
- Added `runtime/message-adapter.js` for message lifecycle/editing helpers.
- Expanded adapter surfaces:
  - `runtime/generation-adapter.js` (`Generate`, `getGeneratingApi`, `isStreamingEnabled`)
  - `runtime/parser-adapter.js` (`substituteParamsExtended`)
- Migrated:
  - `logprobs.js`
  - `reasoning.js`

### Measurable Impact
- Direct `../script.js` imports across `public/scripts` reduced from **24** to **20**.
- Root-level direct imports reduced from **12** to **10**.

### Insights
- Message and generation adapters unlock remaining mid-sized consumer migrations quickly.
- Remaining direct imports are now highly concentrated in top-level orchestration hubs.

### Next
1. Tackle remaining hubs in priority order: `openai`, `slash-commands`, `power-user`, `chats`, `group-chats`, `st-context`, `welcome-screen`, `RossAscends-mods`, `extensions`.
2. Add lint constraints for new direct `../script.js` imports.
3. Begin replacing adapter internals with standalone service modules (starting with settings and event bus).

## 2026-03-05 - Adapter Migration Wave 9

### Completed
- Added `runtime/session-adapter.js` to isolate high-level session/navigation bindings:
  - chat switching and entity selection helpers,
  - assistant/system message helpers,
  - navbar/send triggers and active entity state.
- Expanded focused adapters:
  - `runtime/api-adapter.js` now exports `CLIENT_VERSION`.
  - `runtime/character-adapter.js` now exports `groupToEntity`.
  - `runtime/chat-adapter.js` now exports `default_user_avatar` and `setUserName`.
- Migrated additional root-level modules off direct `../script.js` imports:
  - `extensions.js`
  - `personas.js`
  - `welcome-screen.js`
  - `RossAscends-mods.js`
  - `power-user.js`
  - `st-context.js`
  - `chats.js`

### Measurable Impact
- Direct `../script.js` imports across `public/scripts` reduced from **10** to **3**.
- Remaining direct imports are now limited to:
  - `group-chats.js`
  - `openai.js`
  - `slash-commands.js`

### Insights
- A narrow `session-adapter` provides a cleaner seam for orchestration-heavy modules than overloading existing settings/chat adapters.
- `st-context.js` now consumes typed runtime adapters only, which centralizes extension-facing surface composition behind explicit seams.
- Remaining work is now concentrated in three large orchestration hubs rather than utility or feature leaf modules.

### Next
1. Continue hub migration in dependency order: `group-chats` -> `slash-commands`/`openai`.
2. Add lint guardrails to prevent new direct `../script.js` imports in `public/scripts`.
3. Start replacing at least one adapter implementation with standalone service logic instead of pure re-export.

## 2026-03-05 - Adapter Migration Wave 10

### Completed
- Expanded focused adapters to support group chat orchestration migration:
  - `runtime/app-state-adapter.js` (`isChatSaving`, `setMenuType`)
  - `runtime/chat-adapter.js` (`default_avatar`)
  - `runtime/chat-operations-adapter.js` (`displayPastChats`, `sendMessageAsUser`, `loadItemizedPrompts`)
  - `runtime/generation-adapter.js` (`talkativeness_default`, `depth_prompt_depth_default`, `depth_prompt_role_default`, `shouldAutoContinue`)
  - `runtime/parser-adapter.js` (`baseChatReplace`, `getBiasStrings`)
  - `runtime/session-adapter.js` (`select_rm_info`, `setCharacterName`, `resetChatState`, `selectRightMenuWithAnimation`, `select_selected_character`, `cancelTtsPlay`, `setScenarioOverride`, `setExternalAbortController`)
- Migrated `group-chats.js` off direct `../script.js` imports to focused runtime adapters.

### Measurable Impact
- Direct `../script.js` imports across `public/scripts` reduced from **3** to **2**.
- Remaining direct imports are now limited to:
  - `openai.js`
  - `slash-commands.js`

### Insights
- `group-chats.js` confirms the current adapter split can handle even high-coupling orchestration modules without a compatibility break.
- Remaining direct-import modules (`openai`, `slash-commands`) are tightly interconnected and should be migrated together to avoid temporary adapter churn.

### Next
1. Migrate `slash-commands.js` and `openai.js` to runtime adapters in one coordinated pass.
2. Add lint guardrails to block new direct `../script.js` imports under `public/scripts`.
3. Start replacing one adapter concern with standalone implementation (event bus or settings persistence).

## 2026-03-05 - Adapter Migration Wave 11

### Completed
- Expanded focused adapter coverage for command/orchestration dependencies:
  - `runtime/character-adapter.js` (`duplicateCharacter`, `renameCharacter`)
  - `runtime/chat-adapter.js` (`comment_avatar`)
  - `runtime/chat-operations-adapter.js` (`deleteSwipe`, `extractMessageBias`, `getCurrentChatDetails`)
  - `runtime/extensions-adapter.js` (`getExtensionPrompt`, `getExtensionPromptMaxDepth`)
  - `runtime/parser-adapter.js` (`removeMacros`)
- Migrated final root hubs off direct `../script.js` imports:
  - `slash-commands.js`
  - `openai.js`

### Measurable Impact
- Direct `../script.js` imports across `public/scripts` reduced from **2** to **0**.
- Legacy runtime coupling now flows through `public/scripts/runtime/*-adapter.js` only.

### Insights
- Completing `slash-commands` and `openai` together avoided temporary adapter churn caused by their shared prompt/generation contracts.
- The next maintainability win is enforcing this boundary in CI so regressions cannot reintroduce direct script coupling.

### Next
1. Add lint/boundary checks that reject new direct `../script.js` imports in `public/scripts`.
2. Start replacing adapter internals with standalone service modules (event bus, then settings persistence).
3. Begin the next React-facing migration slice using adapter-backed services as the integration seam.

## 2026-03-05 - Boundary Guardrail (Phase 8 hardening step)

### Completed
- Added import-boundary enforcement script:
  - `scripts/check-import-boundaries.mjs`
- Added root npm script:
  - `check:import-boundaries`
- Guardrail behavior:
  - scans top-level `public/scripts/*.js`,
  - allows direct `script.js` imports only inside `public/scripts/runtime/`,
  - fails on any direct `script.js` import elsewhere.

### Measurable Impact
- The boundary check currently passes with **0** violations.
- Prevents regression after reaching **0** direct `../script.js` imports outside runtime adapters.
- Extension subtree imports remain a separate migration track and are intentionally out of this guardrail's initial scope.

### Next
1. Wire `check:import-boundaries` into CI validation flow.
2. Start swapping one adapter concern from re-export to standalone implementation.

## 2026-03-05 - Adapter Migration Wave 12 (Extension + Utility Surface)

### Completed
- Migrated additional shared modules off direct `script.js` imports:
  - `slash-commands/SlashCommandClosure.js`
  - `slash-commands/SlashCommandCommonEnumsProvider.js`
  - `slash-commands/SlashCommandReturnHelper.js`
  - `util/AccountStorage.js`
  - `extensions/shared.js`
- Expanded adapter exports for extension-facing needs:
  - `runtime/chat-adapter.js` (`getUserAvatar`)
  - `runtime/chat-operations-adapter.js` (`processDroppedFiles`, `formatCharacterAvatar`, `getCharacterAvatar`)
  - `runtime/ui-adapter.js` (`animation_easing`)
- Migrated extension subtree modules to runtime adapters, including:
  - `extensions/assets`, `attachments`, `caption`, `connection-manager`, `expressions`, `gallery`, `memory`
  - `extensions/quick-reply` core and src modules
  - `extensions/regex` engine and index
  - `extensions/stable-diffusion`, `token-counter`, `translate`, `vectors`
  - `extensions/tts` core plus provider modules (`azure`, `edge`, `google-native`, `google-translate`, `minimax`, `novel`, `openai`, `openai-compatible`, `pollinations`, `speecht5`)

### Measurable Impact
- Direct static `script.js` imports outside `public/scripts/runtime/*` are now **0** across all `public/scripts` JS modules.
- Runtime coupling now consistently passes through focused adapters, including extension and slash-command helper surfaces.

### Insights
- The adapter set is now broad enough to support high-coupling extension modules without reintroducing direct monolith imports.
- Remaining modernization leverage is less about import rewiring and more about replacing adapter internals with standalone services.

### Next
1. Extend CI guardrails to enforce `script.js` boundary beyond top-level modules.
2. Replace first adapter concern with standalone implementation (event bus, then settings).
3. Start React slice migration against adapter-backed services (instead of direct legacy bindings).

## 2026-03-05 - Boundary Guardrail Expansion

### Completed
- Updated `check:import-boundaries` scanner scope from top-level `public/scripts/*.js` to recursive `public/scripts/**/*.js` (excluding `public/scripts/runtime/*`).
- Kept comment-line exclusion so JSDoc type references do not produce false positives.

### Measurable Impact
- Recursive boundary check passes with **0** direct static/dynamic `script.js` imports outside runtime adapters.

### Next
1. Add `check:import-boundaries` to CI so boundary regressions fail pull requests.
2. Start standalone implementation extraction behind adapters (event bus first).

## 2026-03-05 - Adapter Internal Extraction Wave 1 (Events)

### Completed
- Replaced `runtime/events-adapter.js` monolith binding source:
  - before: re-export from `script.js`
  - after: direct import from `public/scripts/events.js`
- Preserved extension/runtime contract (`event_types`, `eventSource`) while removing one adapter-level dependency on the monolith entry.

### Measurable Impact
- Runtime adapter direct `script.js` re-export files reduced from **15** to **14**.

### Insights
- `events.js` is already a clean standalone boundary and is a strong pattern for extracting other concerns.
- Next extractions should prioritize similarly self-contained sources to minimize runtime regression risk.

### Next
1. Continue adapter-internal extraction with another low-risk concern (settings or network).
2. Add CI wiring for `check:import-boundaries`.

## 2026-03-05 - Adapter Internal Extraction Wave 2 (Network Core)

### Completed
- Added standalone network module:
  - `public/scripts/network-core.js`
  - exports: `setCsrfToken`, `getRequestHeaders`, `getThumbnailUrl`
- Updated `public/script.js` to use the standalone network module:
  - `getRequestHeaders` and `getThumbnailUrl` now proxy to `network-core`
  - CSRF token initialization now syncs through `setCsrfToken(...)`
- Switched `runtime/network-adapter.js` from `script.js` re-export to `network-core.js`.

### Measurable Impact
- Runtime adapter direct `script.js` re-export files reduced from **14** to **13**.

### Insights
- CSRF and thumbnail URL logic is now independently reusable without importing the monolith entry.
- This is a viable extraction pattern for other adapter concerns where logic can be moved to standalone helper modules first.

### Next
1. Continue adapter-internal extraction with the settings concern.
2. Keep parity checks green while reducing `runtime/*-adapter.js` direct monolith dependencies.

## 2026-03-05 - CI Guardrail Wiring

### Completed
- Added workflow:
  - `.github/workflows/frontend-modernization-checks.yml`
- CI now runs on relevant push/PR paths:
  - `npm run check:import-boundaries`
  - `npm run ui:typecheck`
  - `npm run ui:test`

### Outcome
- Boundary and frontend quality gates are now enforceable at PR time, reducing risk of coupling regressions.

## 2026-03-05 - Adapter Internal Extraction Wave 3 (Settings Core)

### Completed
- Added standalone settings module:
  - `public/scripts/settings-core.js`
  - exports: `bindSettingsCore`, `saveSettings`, `saveSettingsDebounced`, `saveMetadata`, `saveCharacterDebounced`
- Updated `public/script.js` to bind legacy settings implementations into `settings-core` during runtime bootstrap.
- Switched `runtime/settings-adapter.js` from `script.js` re-export to `settings-core.js`.

### Measurable Impact
- Runtime adapter direct `script.js` re-export files reduced from **13** to **12**.

### Insights
- Binding-based extraction allows decoupling adapter imports without rewriting core settings behavior immediately.
- This pattern can be reused for other high-coupling concerns where full logic extraction would otherwise be risky.

### Next
1. Continue adapter-internal extraction with app-state/ui concerns.
2. Keep replacing adapter `script.js` imports with standalone core modules while preserving parity.

## 2026-03-05 - Adapter Internal Extraction Wave 4 (Backend Status Core)

### Completed
- Added standalone backend status module:
  - `public/scripts/backend-status-core.js`
  - exports: `abortStatusCheck`, `setAbortStatusCheck`, `bindBackendStatusCore`, `setOnlineStatus`, `startStatusLoading`, `resultCheckStatus`
- Updated `public/script.js` to:
  - bind backend status wrappers via `bindBackendStatusCore(...)`
  - synchronize abort-controller replacements via `setAbortStatusCheck(...)`
- Switched `runtime/backend-status-adapter.js` from `script.js` re-export to `backend-status-core.js`.

### Measurable Impact
- Runtime adapter direct `script.js` re-export files reduced from **12** to **11**.

### Insights
- Controller-synchronization plus bound function wrappers is a safe extraction pattern for mutable runtime state.
- This unlocks further extraction of stateful concerns without requiring immediate deep rewrites.

### Next
1. Continue adapter-internal extraction with app-state/ui concerns.
2. Track and reduce remaining runtime `script.js` adapter imports to single digits.

## 2026-03-05 - Adapter Internal Extraction Wave 5 (App State Core)

### Completed
- Added standalone app state module:
  - `public/scripts/app-state-core.js`
  - exports: `DEFAULT_PRINT_TIMEOUT`, `entitiesFilter`, `isChatSaving`, `menu_type`, `setMenuType`, and sync/bind helpers.
- Updated `public/script.js` to:
  - bind app-state wrapper (`bindAppStateCore`)
  - synchronize app-state values (`syncDefaultPrintTimeout`, `syncEntitiesFilter`, `syncIsChatSaving`, `syncMenuType`)
  - keep legacy behavior intact while mirroring state into standalone core.
- Switched `runtime/app-state-adapter.js` from `script.js` re-export to `app-state-core.js`.

### Measurable Impact
- Runtime adapter direct `script.js` re-export files reduced from **11** to **10**.

### Insights
- State sync is now stable for app-state concern because write points are centralized (`setMenuType`, save-chat lifecycle).
- The same synchronization approach is viable for remaining stateful concerns as long as mutation points are controlled.

### Next
1. Continue adapter-internal extraction with next concern candidates (`parser`, `message`, or `ui`).
2. Drive runtime adapter `script.js` import count into single digits.

## 2026-03-05 - Adapter Internal Extraction Wave 6 (Parser Core)

### Completed
- Added standalone parser module:
  - `public/scripts/parser-core.js`
  - exports: `converter`, `syncConverter`, `bindParserCore`, and wrappers for parser helpers (`substituteParams`, `substituteParamsExtended`, `extractMessageFromData`, `extractJsonFromData`, `removeMacros`, `baseChatReplace`, `getBiasStrings`).
- Updated `public/script.js` to:
  - bind parser wrappers via `bindParserCore(...)`
  - synchronize markdown converter updates via `syncConverter(...)`.
- Switched `runtime/parser-adapter.js` from `script.js` re-export to `parser-core.js`.

### Measurable Impact
- Runtime adapter direct `script.js` re-export files reduced from **10** to **9**.
- Remaining runtime monolith-bound adapters are now in single digits.

### Insights
- Converter synchronization plus function binding works for parser concern without behavior changes.
- The extraction approach remains stable across both stateful and helper-heavy concerns.

### Next
1. Continue with next concern candidates (`message` or `ui`).
2. Reduce remaining runtime `script.js` adapter imports further while maintaining parity checks.

## 2026-03-05 - Adapter Internal Extraction Wave 7 (Message Core)

### Completed
- Added standalone message module:
  - `public/scripts/message-core.js`
  - exports: `bindMessageCore` and wrappers for message concern helpers (`messageFormatting`, `updateMessageBlock`, `cleanUpMessage`, `syncMesToSwipe`, `closeMessageEditor`, `setEditedMessageId`, `getFirstDisplayedMessageId`, `saveChatDebounced`).
- Updated `public/script.js` to bind message wrappers via `bindMessageCore(...)`.
- Switched `runtime/message-adapter.js` from `script.js` re-export to `message-core.js`.

### Measurable Impact
- Runtime adapter direct `script.js` re-export files reduced from **9** to **8**.

### Insights
- Message concern extraction required no state sync hooks beyond existing function bindings, making it a clean low-risk win.
- Remaining runtime concerns are now concentrated in broader state/orchestration adapters.

### Next
1. Continue adapter-internal extraction with `ui` and/or `chat` concern candidates.
2. Keep runtime adapter `script.js` import count trending toward zero with parity-first validation.

## 2026-03-05 - Adapter Internal Extraction Wave 8 (API Core)

### Completed
- Added standalone API state module:
  - `public/scripts/api-core.js`
  - exports: `CLIENT_VERSION`, `CONNECT_API_MAP`, `main_api`, `nai_settings`, and sync helpers.
- Updated `public/script.js` to synchronize API-facing state into `api-core`:
  - one-time sync for `CONNECT_API_MAP` and `nai_settings`,
  - initial + update sync for `CLIENT_VERSION`,
  - initial + reassignment sync for `main_api` in both assignment paths.
- Switched `runtime/api-adapter.js` from `script.js` re-export to `api-core.js`.

### Measurable Impact
- Runtime adapter direct `script.js` re-export files reduced from **8** to **7**.

### Insights
- Sync-based extraction works cleanly for mixed state shapes (object references plus reassigned primitives) when mutation points are explicit.
- API concern is now isolated enough for React-facing consumers to avoid monolith imports for version/api-selection state.

### Next
1. Continue adapter-internal extraction on remaining orchestration adapters (`chat`, `chat-operations`, `session`, `ui`, `extensions`, `generation`, `character`).
2. Maintain parity checks while reducing runtime `script.js` adapter imports toward zero.

## 2026-03-05 - Adapter Internal Extraction Wave 9 (Extensions Core)

### Completed
- Added standalone extension prompt module:
  - `public/scripts/extensions-core.js`
  - exports: extension prompt state mirrors (`extension_prompts`, `extension_prompt_roles`, `extension_prompt_types`), sync helpers, and bound wrappers for extension prompt APIs.
- Updated `public/script.js` to:
  - bind extension prompt wrappers via `bindExtensionsCore(...)`,
  - synchronize extension prompt constants/state into `extensions-core`,
  - keep state in sync when `extension_prompts` is reset in `clearChat()`.
- Switched `runtime/extensions-adapter.js` from `script.js` re-export to `extensions-core.js`.

### Measurable Impact
- Runtime adapter direct `script.js` re-export files reduced from **7** to **6**.

### Insights
- Extension prompt concern is a good fit for bind+sync extraction because constants and mutable prompt maps can be mirrored with explicit write points.
- Adapter consumers can now read extension prompt state/contracts without monolith imports, which improves React integration seams for prompt-related UI.

### Next
1. Continue adapter-internal extraction for remaining adapters (`chat`, `chat-operations`, `session`, `ui`, `generation`, `character`).
2. Keep parity checks green while reducing runtime adapter monolith dependencies.

## 2026-03-05 - Adapter Internal Extraction Wave 10 (Character Core)

### Completed
- Added standalone character module:
  - `public/scripts/character-core.js`
  - exports: mirrored character state (`characters`, `characterGroupOverlay`, `printCharactersDebounced`), sync helpers, and bound wrappers for character operations.
- Updated `public/script.js` to:
  - bind character operation wrappers via `bindCharacterCore(...)`,
  - synchronize character state/objects (`characters`, `characterGroupOverlay`, `printCharactersDebounced`) into `character-core`.
- Switched `runtime/character-adapter.js` from `script.js` re-export to `character-core.js`.

### Measurable Impact
- Runtime adapter direct `script.js` re-export files reduced from **6** to **5**.

### Insights
- Character concern extraction is straightforward when state is mostly mutable-by-reference (array/object sync once, function binding for behavior).
- `character-core` now gives React-facing code a stable seam for character list and entity transforms without monolith coupling.

### Next
1. Continue adapter-internal extraction for remaining adapters (`chat`, `chat-operations`, `session`, `ui`, `generation`).
2. Keep boundary and frontend quality gates green while reducing remaining runtime monolith dependencies.

## 2026-03-05 - Adapter Internal Extraction Wave 11 (Session Core)

### Completed
- Added standalone session/orchestration module:
  - `public/scripts/session-core.js`
  - exports: mirrored session state (`active_character`, `active_group`, `neutralCharacterName`, `system_message_types`), sync helpers, and bound wrappers for session actions/navigation/system-message integration.
- Updated `public/script.js` to:
  - bind session wrappers via `bindSessionCore(...)`,
  - synchronize session constants and active entity state into `session-core`,
  - update sync points at active entity mutation sites (`setActiveCharacter`, `setActiveGroup`, settings load, and character-rename path).
- Switched `runtime/session-adapter.js` from `script.js` re-export to `session-core.js`.

### Measurable Impact
- Runtime adapter direct `script.js` re-export files reduced from **5** to **4**.

### Insights
- Session extraction required explicit sync coverage for direct write sites outside setter helpers; documenting these mutation points avoids drift.
- This creates a cleaner React seam for navigation/entity-selection behavior without touching backend contracts.

### Next
1. Continue adapter-internal extraction for remaining adapters (`chat`, `chat-operations`, `ui`, `generation`).
2. Keep parity and boundary checks green while reducing runtime adapter monolith dependencies toward zero.

## 2026-03-05 - Adapter Internal Extraction Wave 12 (UI Core)

### Completed
- Added standalone UI module:
  - `public/scripts/ui-core.js`
  - exports: mirrored UI state/constants (`ANIMATION_DURATION_DEFAULT`, `animation_duration`, `animation_easing`, `is_send_press`, `MAX_INJECTION_DEPTH`), sync helpers, and bound wrappers for core UI functions.
- Updated `public/script.js` to:
  - bind UI wrappers via `bindUiCore(...)`,
  - synchronize animation/send state and constants into `ui-core`,
  - centralize send-state writes via `setSendButtonState(...)` so `is_send_press` sync is maintained through one path.
- Switched `runtime/ui-adapter.js` from `script.js` re-export to `ui-core.js`.

### Measurable Impact
- Runtime adapter direct `script.js` re-export files reduced from **4** to **3**.

### Insights
- Centralizing `is_send_press` writes eliminated fragile scattered sync points and makes future UI state extraction safer.
- UI concern extraction is now adapter-safe without altering extension-facing contracts or generation flow behavior.

### Next
1. Continue adapter-internal extraction for remaining adapters (`chat`, `chat-operations`, `generation`).
2. Keep parity/boundary checks green while reducing runtime adapter monolith dependencies to zero.

## 2026-03-05 - Adapter Internal Extraction Wave 13 (Generation Core)

### Completed
- Added standalone generation module:
  - `public/scripts/generation-core.js`
  - exports: mirrored generation state/defaults (`amount_gen`, `max_context`, `online_status`, `streamingProcessor`, `talkativeness_default`, depth defaults), sync helpers, and bound wrappers for generation APIs.
- Updated `public/script.js` to:
  - bind generation wrappers via `bindGenerationCore(...)`,
  - synchronize generation state/default values into `generation-core`,
  - synchronize all known write paths for mutable generation state:
    - response-length temporary overrides,
    - settings load and preset application,
    - slider updates,
    - online-status updates,
    - streaming processor lifecycle transitions.
- Switched `runtime/generation-adapter.js` from `script.js` re-export to `generation-core.js`.

### Measurable Impact
- Runtime adapter direct `script.js` re-export files reduced from **3** to **2**.

### Insights
- Generation concern extraction is viable with explicit write-site synchronization even when state is touched across several orchestration paths.
- Remaining runtime monolith coupling is now concentrated in chat-focused adapters (`chat`, `chat-operations`), making next extraction scope clearer.

### Next
1. Continue adapter-internal extraction for remaining adapters (`chat`, `chat-operations`).
2. Keep parity/boundary checks green while driving runtime adapter monolith dependencies to zero.

## 2026-03-05 - Adapter Internal Extraction Wave 14 (Chat + Chat Operations Core)

### Completed
- Added standalone chat modules:
  - `public/scripts/chat-core.js`
  - `public/scripts/chat-operations-core.js`
- Updated `public/script.js` to:
  - bind chat/chat-operations wrappers via `bindChatCore(...)` and `bindChatOperationsCore(...)`,
  - synchronize chat-facing state/constants (`name1`, `name2`, `this_chid`, `chat_metadata`, avatar constants, `chat`, `create_save`, `displayVersion`, `systemUserName`, `system_avatar`),
  - add explicit sync coverage at known chat metadata/name/character-id write sites.
- Updated persona write paths to keep chat-core `user_avatar` mirror in sync:
  - `public/scripts/personas.js` now calls `syncUserAvatar(...)` in avatar mutation paths.
- Switched remaining runtime adapters from `script.js` re-export to standalone cores:
  - `runtime/chat-adapter.js` -> `chat-core.js`
  - `runtime/chat-operations-adapter.js` -> `chat-operations-core.js`

### Measurable Impact
- Runtime adapter direct `script.js` re-export files reduced from **2** to **0**.
- Runtime adapter layer is now fully detached from direct monolith imports.

### Insights
- Final chat-surface extraction required explicit sync discipline for reassigned metadata/state fields (`chat_metadata`, `name*`, `this_chid`) while allowing reference-stable structures (`chat`, `create_save`) to sync once.
- Keeping persona avatar updates synchronized into chat-core preserves adapter contract expectations for extension consumers.

### Next
1. Start replacing bind/sync adapter-core internals with true standalone domain services (chat lifecycle first).
2. Advance React surface migration against adapter cores with parity checks.

## 2026-03-07 - Monolith Reduction Wave 1 (UI Implementation Move)

### Completed
- Moved the `setAnimationDuration(...)` implementation out of `public/script.js` into `public/scripts/ui-core.js`.
- Updated `public/script.js` to keep a thin export wrapper that delegates to `ui-core` while preserving local exported state parity.
- Simplified `bindUiCore(...)` by removing `setAnimationDuration` from its bound implementation surface because the function now lives in `ui-core` directly.

### Measurable Impact
- `public/script.js` no longer owns the primary implementation of `setAnimationDuration(...)`; it now proxies to `ui-core`.
- This is the first post-adapter step that reduces monolith implementation ownership rather than only redirecting imports.

### Insights
- The right sequencing is:
  1. detach runtime adapters from `script.js`,
  2. move low-risk implementations into cores,
  3. then delete redundant monolith bodies once enough call sites are migrated.
- Low-coupling UI helpers are the safest first candidates because they have minimal extension/API surface risk.

### Next
1. Continue moving low-risk concrete implementations out of `public/script.js` into core modules.
2. Target small chat/session helpers next, then larger chat lifecycle logic once state ownership is clearer.

## 2026-03-07 - Monolith Reduction Wave 2 (Chat Setter Move)

### Completed
- Moved `setCharacterId(...)` and `setCharacterName(...)` implementations out of `public/script.js` into `public/scripts/chat-core.js`.
- Updated `public/script.js` to keep thin compatibility export wrappers that delegate to `chat-core` and then synchronize local exported state mirrors.

### Measurable Impact
- `public/script.js` no longer owns the primary logic for two commonly used chat/session state mutators.
- This continues the transition from bind/sync scaffolding to actual monolith code removal.

### Insights
- Small state mutators are good next-step candidates after adapter detachment because they reduce monolith write ownership without introducing new dependency pressure.
- The current wrapper pattern is working: move implementation first, then remove the compatibility wrapper later once direct `script.js` consumers are no longer needed.

### Next
1. Continue moving small concrete chat/session helpers out of `public/script.js` into core modules.
2. Prioritize helpers that mutate mirrored state with minimal DOM or network coupling before tackling larger chat lifecycle flows.

## 2026-03-07 - Monolith Reduction Wave 3 (Chat Metadata Move)

### Completed
- Moved `updateChatMetadata(...)` implementation out of `public/script.js` into `public/scripts/chat-operations-core.js`.
- Updated `public/script.js` to keep a thin compatibility wrapper that delegates to `chat-operations-core` and mirrors local exported state.
- Simplified `bindChatOperationsCore(...)` by removing `updateChatMetadata` from the bound implementation surface because the function now lives in the core directly.

### Measurable Impact
- `public/script.js` no longer owns the primary implementation of chat metadata merging/reset behavior.
- Chat metadata mutation is now centered in the chat operations core instead of the monolith body.

### Insights
- Pure state-composition helpers are a productive middle step between trivial setters and larger orchestration flows.
- The current pattern remains sound: move implementation into core, leave a thin wrapper in `script.js`, then remove the wrapper later once compatibility pressure drops.

### Next
1. Continue moving small pure chat/session helpers out of `public/script.js`.
2. After a few more low-risk moves, begin carving out one higher-value chat lifecycle path end-to-end.

## 2026-03-07 - Monolith Reduction Wave 4 (Session Reset Move)

### Completed
- Moved `resetChatState(...)` implementation out of `public/script.js` into `public/scripts/session-core.js`.
- Updated `public/script.js` to keep a compatibility wrapper that delegates to `session-core` and re-synchronizes local mirrored exports (`name2`, `this_chid`, `chat_metadata`).
- Simplified `bindSessionCore(...)` by removing `resetChatState` from the bound implementation surface because the function now lives in the core directly.

### Measurable Impact
- `public/script.js` no longer owns the primary implementation of the chat-state reset path.
- This is the first post-adapter move that coordinates multiple core modules (`chat-core`, `chat-operations-core`, `character-core`, `system-messages`) from outside the monolith body.

### Insights
- Core-to-core orchestration is now viable for pure state reset flows, which is a necessary step before moving larger chat lifecycle paths.
- Aliasing imported helper names in core modules is important as more cores begin owning real implementations instead of wrapper-only surfaces.

### Next
1. Continue moving small chat/session orchestration helpers out of `public/script.js`.
2. Start selecting one larger chat lifecycle slice to move end-to-end once a few more state helpers are externalized.

## 2026-03-07 - Monolith Reduction Wave 5 (UI + App State Helper Batch)

### Completed
- Moved `setMenuType(...)` implementation out of `public/script.js` into `public/scripts/app-state-core.js`.
- Moved these UI helper implementations out of `public/script.js` into `public/scripts/ui-core.js`:
  - `getSlideToggleOptions(...)`
  - `showStopButton()`
  - `hideStopButton()`
  - `activateSendButtons()`
  - `deactivateSendButtons()`
- Updated `public/script.js` to keep thin compatibility wrappers that delegate to the relevant core module and preserve local mirrored exports.
- Simplified `bindAppStateCore(...)` and `bindUiCore(...)` by removing implementations that are now owned directly by their cores.

### Measurable Impact
- `public/script.js` no longer owns a cluster of recurring UI/app-state helper implementations.
- This removes a noticeable amount of UI state/control logic from the monolith in one pass rather than one function at a time.

### Insights
- Batching related low-risk helpers is materially faster now that the adapter layer is stable.
- UI/app-state helpers are good batch candidates because they share clear boundaries and have limited backend or extension API coupling.

### Next
1. Continue batching small-to-medium helper moves instead of single-function waves where the concern boundary is clear.
2. Start carving out one larger chat lifecycle slice after a few more helper batches reduce state ownership in `script.js`.

## 2026-03-07 - Monolith Reduction Wave 6 (Backend Status Batch)

### Completed
- Moved the backend status implementation cluster out of `public/script.js` into `public/scripts/backend-status-core.js`:
  - `cancelStatusCheck(...)`
  - `displayOnlineStatus()`
  - `setOnlineStatus(...)`
  - `startStatusLoading()`
  - `stopStatusLoading()`
  - `resultCheckStatus()`
- Updated `public/script.js` to keep thin compatibility wrappers that delegate to `backend-status-core` and preserve the exported abort controller mirror.
- Simplified `bindBackendStatusCore(...)` so the backend status core now owns its implementation surface directly rather than relying on bound legacy callbacks.

### Measurable Impact
- `public/script.js` no longer owns the primary implementation for the backend connection/status UI flow.
- This removes a cohesive DOM/event/status subsystem from the monolith in one pass, which is more meaningful than continued single-helper extraction.

### Insights
- Status-related code is a good medium-size extraction target because it has a self-contained boundary across DOM updates, event emission, and abort-controller lifecycle.
- The wrapper pattern still scales for medium slices: move the implementation cluster first, then remove the compatibility layer after the remaining direct monolith callers are gone.

### Next
1. Continue taking medium-size concern batches out of `public/script.js` instead of isolated helpers.
2. Target one larger chat lifecycle or UI orchestration path next, where state ownership is now cleaner after the status extraction.

## 2026-03-07 - Monolith Reduction Wave 7 (Bootstrap Helper Batch)

### Completed
- Moved `getCurrentChatId()` out of `public/script.js` into `public/scripts/chat-core.js`.
- Moved `reloadMarkdownProcessor()` out of `public/script.js` into `public/scripts/ui-core.js`.
- Moved `pingServer()` out of `public/script.js` into `public/scripts/network-core.js`.
- Moved `getClientVersion()` out of `public/script.js` into `public/scripts/api-core.js`.
- Updated `public/script.js` to keep thin compatibility wrappers and removed the corresponding bound implementation entries from `bindChatCore(...)` and `bindUiCore(...)`.

### Measurable Impact
- `public/script.js` no longer owns a set of bootstrap/runtime helpers spanning chat identity, markdown initialization, server reachability, and client version loading.
- This further reduces monolith ownership in the early app initialization path instead of limiting extraction to late-stage chat helpers only.

### Insights
- Some remaining `script.js` code can be removed faster by taking one helper from several already-established cores in the same wave, rather than waiting for a perfectly pure single-concern batch.
- Wrapper-only exports are now concentrated enough that the next worthwhile step should be a larger orchestration path, not just more tiny initialization helpers.

### Next
1. Target a larger UI orchestration or chat lifecycle slice that still lives mostly in `public/script.js`.
2. Continue preferring real ownership moves in existing cores over creating more wrapper-only surfaces.

## 2026-03-07 - Monolith Reduction Wave 8 (State Setter Batch)

### Completed
- Moved `setEditedMessageId(...)` out of `public/script.js` into `public/scripts/message-core.js`.
- Moved `setExternalAbortController(...)` out of `public/script.js` into `public/scripts/session-core.js`.
- Moved `setSendButtonState(...)` out of `public/script.js` into `public/scripts/ui-core.js` while preserving the existing `runtime/chat-operations-adapter.js` export surface for compatibility.
- Updated `public/script.js` to keep thin compatibility wrappers and removed the corresponding bound implementation entries from `bindMessageCore(...)`, `bindSessionCore(...)`, and `bindChatOperationsCore(...)`.

### Measurable Impact
- `public/script.js` no longer owns another cluster of mutable UI/session/message state setters.
- Runtime compatibility remains stable even where the internal ownership changed modules, which is important for keeping extension and internal import churn low during the migration.

### Insights
- Small state setters are still worth batching when they also let us simplify bound implementation surfaces across multiple cores in one commit.
- Preserving adapter exports while changing internal ownership is a useful pattern for migration speed: it decouples code movement from broader import rewrites.

### Next
1. Stop spending many more waves on isolated setters unless they unlock a larger path immediately after.
2. Target one higher-value chat or UI orchestration slice next, now that the remaining state ownership in `public/script.js` is narrower.

## 2026-03-07 - Monolith Reduction Wave 9 (Chat Post-Load Flow)

### Completed
- Moved `getChatResult()` out of `public/script.js` into `public/scripts/chat-operations-core.js`.
- Moved the first-message bootstrap helper used by chat loading into `public/scripts/chat-operations-core.js`.
- Updated `public/script.js` to keep a thin compatibility wrapper that only mirrors local `name2` state after the core completes the post-load flow.
- Added the minimal binding needed for character selection (`select_selected_character`) to the chat operations core so the post-load path can fully own its render/event sequence.

### Measurable Impact
- `public/script.js` no longer owns the post-load chat bootstrap sequence that creates the initial greeting, renders the chat, selects the active character, and emits chat lifecycle events.
- This is a more meaningful extraction than another helper-only move because it removes part of the real chat lifecycle from the monolith body.

### Insights
- The best next reductions are lifecycle subsequences with a clear event boundary, not just individual helper functions.
- Returning just the small mirrored state (`characterName`) to `script.js` keeps the wrapper thin without forcing immediate global state rewrites.

### Next
1. Continue on the chat lifecycle path by targeting `getChat()` or `reloadCurrentChat()` next.
2. Prefer moving whole post-fetch/post-clear orchestration blocks instead of peeling off disconnected utilities.

## 2026-03-07 - Monolith Reduction Wave 10 (Chat Load/Open Flow)

### Completed
- Moved `getChat()` out of `public/script.js` into `public/scripts/chat-operations-core.js`.
- Moved `openCharacterChat()` out of `public/script.js` into `public/scripts/chat-operations-core.js`.
- Added the minimal internal callbacks needed for that ownership move:
  - `unshallowCharacter`
  - `createOrEditCharacter`
- Updated `public/script.js` to keep thin compatibility wrappers that only mirror local `name2`, `chat_create_date`, and `chat_metadata` state after the core completes the workflow.

### Measurable Impact
- `public/script.js` no longer owns the main character chat fetch/load path or the “switch to specific chat file” orchestration path.
- The chat lifecycle extraction now covers both the fetch/load stage and the post-load stage, leaving much less of the character-chat path in the monolith body.

### Insights
- Returning a compact result object from extracted lifecycle code is working well for legacy-state mirroring: it avoids over-coupling the core back to `script.js`.
- This confirms the migration can move meaningful asynchronous orchestration paths without needing a full state-management rewrite first.

### Next
1. Continue on the same path with `reloadCurrentChat()` so the full clear/reload branch leaves the monolith.
2. After that, reassess whether the next best slice is still chat lifecycle or whether message rendering becomes the higher-value target.

## 2026-03-07 - Monolith Reduction Wave 11 (Chat Reload Flow)

### Completed
- Moved `reloadCurrentChat()` out of `public/script.js` into `public/scripts/chat-operations-core.js`.
- Added the minimal internal callbacks needed for that ownership move:
  - `getSelectedGroup`
  - `getGroupChat`
  - `preserveNeutralChat`
  - `resetChatState`
  - `restoreNeutralChat`
- Updated `public/script.js` to keep a thin compatibility wrapper that only mirrors local `name2`, `chat_create_date`, and `chat_metadata` state if the reload path returns updated values.

### Measurable Impact
- `public/script.js` no longer owns the central clear/reload branch for active chat state.
- With `getChatResult()`, `getChat()`, `openCharacterChat()`, and `reloadCurrentChat()` now outside the monolith, most of the character chat lifecycle has been extracted into `chat-operations-core`.

### Insights
- Binding read-only selectors such as `getSelectedGroup` is a better migration pattern than importing more legacy modules into a core and creating new cycles.
- The chat lifecycle is now far enough along that the next gains will probably come from either send/generation entrypoints or message rendering, not more small chat-loading helpers.

### Next
1. Reassess the next highest-yield slice between `sendTextareaMessage()` and message render/update flows.
2. Continue preferring full async workflow moves over isolated utility extraction.

## 2026-03-07 - Monolith Reduction Wave 12 (Send Entry Flow)

### Completed
- Moved `sendTextareaMessage()` out of `public/script.js` into `public/scripts/session-core.js`.
- Replaced direct monolith dependencies with narrow read-only callbacks bound from `script.js`:
  - `getContinueOnSend`
  - `getSelectedGroup`
  - `hasPendingFileAttachment`
  - `isExecutingCommandsFromChatInput`
- Updated `public/script.js` to keep a thin compatibility wrapper that simply delegates to `session-core`.

### Measurable Impact
- `public/script.js` no longer owns the main “send current textarea contents” entrypoint into generation.
- The session core now owns the decision path for continue-on-send, temporary assistant chat creation, and the handoff into `Generate(...)`.

### Insights
- Read-only callback bindings are working well for UI-derived conditions and avoid pulling legacy modules like `slash-commands.js` and `chats.js` directly into a core.
- The next nearby candidates are not all equally clean: `clearChat()` is still coupled to local debounce timer state and some UI-only delete-mode behavior, so it should be handled as a more deliberate batch instead of being forced into this one.

### Next
1. Reassess whether the best next slice is `clearChat()`/message operations or the message render/update path.
2. Keep prioritizing entrypoints and full async workflows over utility cleanup.

## 2026-03-07 - Monolith Reduction Wave 13 (Clear/Delete Chat Operations)

### Completed
- Moved `clearChat()` out of `public/script.js` into `public/scripts/chat-operations-core.js`.
- Moved `deleteLastMessage()` out of `public/script.js` into `public/scripts/chat-operations-core.js`.
- Kept the remaining legacy-local state mutations behind narrow bound callbacks instead of creating new cross-module imports:
  - debounce cancellation
  - metadata-save cancellation
  - message-editor close
  - delete-mode state/query
  - extension prompt reset
  - itemized prompt reset
- Updated `public/script.js` to keep thin compatibility wrappers that now delegate directly to the core.

### Measurable Impact
- `public/script.js` no longer owns the main chat-clear and last-message-delete operations.
- This removes another part of the chat interaction lifecycle from the monolith without forcing premature centralization of all UI-only state.

### Insights
- A hybrid extraction is sometimes the right move: core-owned orchestration plus callback-based legacy state updates is materially better than either keeping everything in `script.js` or creating new dependency cycles.
- The remaining obvious wins are shifting away from chat housekeeping and toward message render/update or other high-value interaction paths.

### Next
1. Target the message render/update path next (`printMessages()`, `addOneMessage()`, `updateMessageBlock()`), or another adjacent cluster with a similarly clear boundary.
2. Avoid spending too many more waves on small chat-maintenance helpers unless they unlock a larger UI migration step.

## 2026-03-07 - Monolith Reduction Wave 14 (Message Render/Update Flow)

### Completed
- Moved `addOneMessage()` out of `public/script.js` into `public/scripts/chat-operations-core.js`.
- Moved `printMessages()` out of `public/script.js` into `public/scripts/chat-operations-core.js`.
- Moved `updateMessageBlock()` out of `public/script.js` into `public/scripts/message-core.js`.
- Moved the rendering helpers needed for that ownership shift into `chat-operations-core.js`:
  - message template rendering
  - timestamp/model icon insertion
  - generation timer formatting
  - swipe counter formatting
- Removed the now-dead monolith copies of the private message-template helpers from `public/script.js`.

### Measurable Impact
- `public/script.js` no longer owns the main message render/update loop for chat history.
- This is one of the larger UI-facing reductions so far because it removes both the list render path and the single-message update path from the monolith body.

### Insights
- For rendering code, the right migration shape is core-owned DOM orchestration plus callback-based access to cycle-prone services like reasoning, bookmarks, style pins, and tag application.
- After this wave, the remaining high-value monolith areas are more likely to be generation orchestration or character create/edit flows than generic chat rendering.

### Next
1. Reassess the next highest-yield slice between generation orchestration entrypoints and character create/edit flows.
2. Keep favoring multi-function concern batches where private helper code can leave the monolith along with the public function.

## 2026-03-07 - Monolith Reduction Wave 15 (Generation Control Batch)

### Completed
- Moved these generation control implementations out of `public/script.js` into `public/scripts/generation-core.js`:
  - `stopGeneration()`
  - `getGeneratingApi()`
  - `getNextMessageId()`
  - `shouldAutoContinue()`
  - `triggerAutoContinue()`
- Updated `public/script.js` to keep thin compatibility wrappers and preserve legacy event emission on `stopGeneration()`.
- Replaced direct legacy dependencies with narrow bound callbacks for:
  - abort controller access
  - auto-continue settings
  - generating API config
  - textarea text access
  - token counting
  - selected group lookup
  - stop-button hiding
  - continue-button triggering

### Measurable Impact
- `public/script.js` no longer owns the main generation stop/continue control logic.
- This reduces monolith ownership around generation behavior without yet taking on the full complexity of `Generate(...)`.

### Insights
- A dedicated “generation control” batch is a good intermediate step before touching the main generation pipeline, because it removes a coherent behavior surface while keeping the highest-risk orchestration body stable.
- Callback-based API/config access is necessary here to avoid cycles with `openai.js` and `textgen-settings.js`.

### Next
1. Reassess whether the next generation move should be a focused helper/internal batch around `Generate(...)` or whether character create/edit is now the cleaner next target.
2. Continue avoiding large cross-module import cycles by preferring config/state callbacks when moving generation logic.

## 2026-03-07 - Monolith Reduction Wave 16 (Session Chat Management Batch)

### Completed
- Moved these session/chat-management implementations out of `public/script.js` into `public/scripts/session-core.js`:
  - `doNewChat()`
  - `newAssistantChat()`
  - `renameGroupOrCharacterChat()`
  - `updateRemoteChatName()`
- Updated `public/script.js` to keep thin compatibility wrappers for those exports.
- Extended `bindSessionCore(...)` with narrow callbacks for the remaining cycle-prone dependencies:
  - group chat create/delete/rename
  - local `delChat()` deletion path
  - `createOrEditCharacter()`
  - permanent assistant chat open flow

### Measurable Impact
- `public/script.js` no longer owns the main “start a new chat / temp assistant / rename chat” session-management flow.
- This removes another user-visible orchestration cluster from the monolith without taking on the full character editor yet.

### Insights
- The next clean reductions are still orchestration-heavy, but they are safer when grouped by lifecycle surface instead of by individual helper size.
- `session-core` is now a better home for neutral-assistant and chat-file lifecycle logic than `script.js`, because it already owns reset/send/session coordination.

### Next
1. Reassess whether the next highest-yield extraction is the character create/edit flow or the first focused helper batch around `Generate(...)`.
2. Keep using callback bindings for flows that would otherwise create cycles through `welcome-screen.js`, group chat modules, or character editing.

## 2026-03-07 - Monolith Reduction Wave 17 (Character Edit Flow Batch)

### Completed
- Moved `getOneCharacter()` out of `public/script.js` into `public/scripts/character-core.js`.
- Moved `createOrEditCharacter()` out of `public/script.js` into `public/scripts/character-core.js`.
- Added synced character-form state in `character-core` for:
  - `create_save`
  - `crop_data`
  - `fav_ch_checked`
  - character form defaults used by the editor flow
- Updated `public/script.js` to keep thin compatibility wrappers and sync the shared character-form state into `character-core`.
- Extended `bindCharacterCore(...)` with narrow callbacks for legacy-only dependencies:
  - chat access
  - chat clear/print/save
  - first-message generation
  - tag map creation
  - selected-character UI handoff

### Measurable Impact
- `public/script.js` no longer owns the main character create/edit submission flow.
- The remaining monolith-owned character area is now more about editor UI/popup orchestration than persistence logic.

### Insights
- The right shape for character migration is to keep form submission and persistence in `character-core`, while leaving popup-specific UI orchestration behind thin wrappers until the editor UI itself moves.
- Shared mutable form state can be migrated safely by syncing the same object reference into the new core instead of rewriting every caller at once.

### Next
1. Reassess whether the next best batch is character-editor UI helpers around the same surface or a focused helper batch around `Generate(...)`.
2. Keep preferring core-owned persistence/orchestration over moving large DOM-heavy editor widgets all at once.

## 2026-03-07 - Monolith Reduction Wave 18 (Raw/Quiet Generation Batch)

### Completed
- Moved `generateQuietPrompt()` out of `public/script.js` into `public/scripts/generation-core.js`.
- Moved `generateRaw()` out of `public/script.js` into `public/scripts/generation-core.js`.
- Moved the temporary response-length override helper (`TempResponseLength`) out of `public/script.js` into `public/scripts/generation-core.js`.
- Updated `public/script.js` to keep thin compatibility wrappers for the raw/quiet generation entry points.
- Extended `bindGenerationCore(...)` with narrow callbacks for the remaining generation-adjacent dependencies:
  - raw prompt construction
  - Horde/OpenAI request helpers
  - Kobold/Novel/TextGen generation data builders
  - OpenAI max-token accessors
  - result post-processing helpers

### Measurable Impact
- `public/script.js` no longer owns the raw generation utility path or the quiet-generation helper path.
- This removes another significant generation-focused surface from the monolith without yet moving the full `Generate(...)` orchestration body.

### Insights
- The generation area is still best migrated in layers: raw/quiet helpers first, then the larger `Generate(...)` pipeline once enough adjacent state and helper ownership has been reduced.
- Callback-based binding remains the right pattern here because importing the full provider stack directly into `generation-core` would recreate the same dependency pressure the migration is trying to remove.

### Next
1. Reassess whether the next useful batch is the first focused helper/internal extraction from `Generate(...)` or another UI-heavy character-editor surface.
2. Keep generation-related moves centered on coherent helper layers rather than forcing the entire pipeline over at once.

## 2026-03-07 - Monolith Reduction Wave 19 (Generate Helper Batch)

### Completed
- Moved `getStoppingStrings()` out of `public/script.js` into `public/scripts/generation-core.js`.
- Moved `processCommands()` out of `public/script.js` into `public/scripts/generation-core.js`.
- Moved the internal last-message DOM removal helper used by `Generate(...)` out of `public/script.js` into `public/scripts/generation-core.js`.
- Updated `public/script.js` to keep thin wrappers and call the core-owned helper implementations.
- Extended `bindGenerationCore(...)` with narrow callbacks for:
  - slash-command execution
  - animation-duration access
  - custom/instruct stopping-string providers
  - group list access
  - names-as-stop-strings preference access

### Measurable Impact
- `Generate(...)` now depends on more core-owned generation helpers instead of monolith-owned local internals.
- This continues shrinking the internal helper surface around generation before moving the main orchestration body.

### Insights
- The `Generate(...)` migration is safest when decomposed into helper layers first: command handling, stopping-string assembly, and DOM cleanup are all good extraction seams.
- Some generation helpers need a mixed strategy: core-owned logic with narrow callbacks for high-churn UI/runtime dependencies.

### Next
1. Reassess whether the next `Generate(...)` reduction should target one more helper cluster or the first larger orchestration segment.
2. Keep the remaining `Generate(...)` work focused on coherent preflight or post-response segments rather than arbitrary line-count reduction.

## 2026-03-07 - Monolith Reduction Wave 20 (Generate Message-Input Preflight)

### Completed
- Moved the message-input preflight segment out of `public/script.js` into `public/scripts/generation-core.js` as `prepareGenerationMessages(...)`.
- That extracted block now owns:
  - textarea capture/reset for generation
  - continue-timer carry-forward handling
  - send-button/deactivation handling for this preflight stage
  - prompt-bias extraction
  - user/system message dispatch before prompt assembly
- Updated `Generate(...)` in `public/script.js` to consume the returned preflight state instead of owning that block inline.
- Extended `bindGenerationCore(...)` with narrow callbacks for:
  - send button state changes
  - send-message/system-message dispatch
  - pending attachment lookup
  - OpenAI `send_if_empty` access
  - generic system-message type access

### Measurable Impact
- A meaningful preflight segment of `Generate(...)` is now core-owned instead of monolith-owned.
- The remaining `Generate(...)` body is more concentrated around prompt assembly, provider payload construction, and response handling.

### Insights
- The large `Generate(...)` move becomes tractable once preflight state mutation is peeled off into return-value helpers rather than trying to migrate the entire control flow in one pass.
- Returning a compact state bundle from `generation-core` is a safer pattern here than spreading more mutable globals across the script/core boundary.

### Next
1. Reassess whether the next `Generate(...)` move should target prompt-assembly setup or provider-response handling.
2. Keep the next wave centered on one coherent orchestration segment rather than another set of tiny helpers.

## 2026-03-07 - Monolith Reduction Wave 21 (Generate Prompt-Context Setup)

### Completed
- Moved the prompt-context setup segment out of `public/script.js` into `public/scripts/generation-core.js` as `preparePromptContextState(...)`.
- That extracted block now owns:
  - character-card field capture for generation
  - sysprompt shaping for non-OpenAI generation
  - depth-prompt reset and reinjection
  - first-message parameter substitution refresh for fresh 1-on-1 chats
- Updated `Generate(...)` in `public/script.js` to consume the returned prompt-context state instead of owning that inline block.
- Extended `bindGenerationCore(...)` with narrow callbacks for:
  - sysprompt config access
  - depth-prompt id/type helpers
  - extension-prompt injection
  - group depth prompt lookup
  - world-info scan flag access

### Measurable Impact
- Another coherent orchestration segment has left the monolith, further shrinking the setup phase at the start of `Generate(...)`.
- Prompt-context preparation is now core-owned, leaving the remaining `Generate(...)` body more focused on prompt assembly, provider dispatch, and response handling.

### Insights
- Prompt assembly is still too coupled to move wholesale, but the prompt-context setup at its front edge is a good extraction seam because it can return a compact state bundle while keeping the legacy runtime behind callback bindings.
- Extension-prompt interactions are safest to migrate by passing typed ids/config through bindings instead of importing more UI/runtime constants directly into the core layer.

### Next
1. Reassess whether the next `Generate(...)` move should target prompt-assembly construction or provider-response handling.
2. Keep generation extraction centered on contiguous orchestration segments rather than broad partially-owned moves.

## 2026-03-07 - Monolith Reduction Wave 22 (Generate Context-Window Preparation)

### Completed
- Moved the context-window preparation segment out of `public/script.js` into `public/scripts/generation-core.js` as `prepareGenerationContextWindow(...)`.
- That extracted block now owns:
  - extension interceptor execution for generation
  - Horde auto-adjust context/response-length preparation
  - CFG prompt token accounting and context-limit reduction
- Updated `Generate(...)` in `public/script.js` to consume the returned context-window state instead of owning that inline block.
- Extended `bindGenerationCore(...)` with narrow callbacks for:
  - context size calculation
  - interceptor execution
  - Horde adjustment config/helpers
  - CFG prompt lookup
  - async token counting

### Measurable Impact
- Another contiguous orchestration block has left the monolith, shrinking the non-provider middle section of `Generate(...)`.
- `Generate(...)` is now more concentrated around prompt augmentation, history assembly, provider dispatch, and response handling.

### Insights
- The safest remaining `Generate(...)` work is still structured around medium-sized orchestration seams, not line-by-line helper peeling.
- Passing config snapshots and service callbacks into `generation-core` continues to avoid recreating legacy dependency cycles while still letting the monolith shrink meaningfully.

### Next
1. Reassess whether the next useful `Generate(...)` extraction is prompt augmentation/story-string assembly or the later history-building/provider-response segments.
2. Keep the next move focused on one medium-sized orchestration seam with explicit returned state rather than widening the helper API too aggressively.

## 2026-03-07 - Monolith Reduction Wave 23 (Generate History Preparation)

### Completed
- Moved the history-shaping segment out of `public/script.js` into `public/scripts/generation-core.js` as `prepareMessageHistoryState(...)`.
- That extracted block now owns:
  - `chat2` history shaping for OpenAI and non-OpenAI paths
  - continuation trimming for the final message
  - instruct-mode first/last sequence application
  - user-alignment message preparation
  - OpenAI message/example preparation
- Updated `Generate(...)` in `public/script.js` to consume the returned history state instead of owning that inline block.
- Extended `bindGenerationCore(...)` with narrow callbacks for:
  - message-history formatting
  - force-output sequence ids
  - user-alignment text access
  - OpenAI message/example conversion helpers

### Measurable Impact
- Another contiguous middle section of `Generate(...)` is now core-owned.
- The remaining monolith-owned generation code is increasingly concentrated around prompt augmentation, token-fitting/context packing, and provider dispatch/response handling.

### Insights
- The `Generate(...)` function still yields good extraction seams when treated as pipeline stages with explicit returned state.
- History shaping was a safer next move than the world-info/story-string block because it carries less extension-state coupling while still removing a significant chunk of orchestration.

### Next
1. Reassess whether the next `Generate(...)` extraction should target prompt augmentation/story-string assembly or the token-fitting/context-packing block that follows history preparation.
2. Keep the next move centered on a single pipeline stage to avoid mixing extension-prompt concerns with provider-dispatch concerns.

## 2026-03-07 - Monolith Reduction Wave 24 (Generate Context Packing)

### Completed
- Moved the context-packing stage out of `public/script.js` into `public/scripts/generation-core.js` as `prepareContextPackingState(...)`.
- That extracted block now owns:
  - context-window message packing for injected and non-injected chat history
  - optional user-alignment insertion into packed context
  - injected-index normalization after packing
  - in-context message count updates
  - estimation of how many example messages fit into the remaining context window
- Updated `Generate(...)` in `public/script.js` to consume the returned packing state instead of owning that inline block.
- Extended `bindGenerationCore(...)` with narrow callbacks for:
  - chat preamble/separator formatting
  - token padding access
  - pin-examples preference access
  - in-context message count updates

### Measurable Impact
- Another full pipeline stage has left the monolith, further shrinking the middle of `Generate(...)`.
- The remaining monolith-owned generation logic is now more concentrated around prompt-line mutation, final prompt assembly, provider dispatch, and response handling.

### Insights
- Context packing was a cleaner seam than the remaining world-info/story-string block because it is mostly deterministic once the earlier prompt-augmentation state is already prepared.
- Returning packed arrays and normalized indices from `generation-core` keeps the migration incremental without leaking more mutable globals across the boundary.

### Next
1. Reassess whether the next `Generate(...)` extraction should target prompt-line sizing/final prompt assembly or the earlier world-info/story-string augmentation block.
2. Keep the next move focused on one remaining pipeline stage rather than broadening both prompt augmentation and provider dispatch in the same commit.

## 2026-03-07 - Monolith Reduction Wave 25 (Generate Prompt Assembly Preparation)

### Completed
- Moved the prompt-line mutation and sizing stage out of `public/script.js` into `public/scripts/generation-core.js` as `preparePromptAssemblyState(...)`.
- That extracted block now owns:
  - initial `mesSend` construction from packed context messages
  - last-prompt-line mutation for quiet/instruct/impersonate/name-forcing cases
  - prompt-size fitting by trimming examples/history when the assembled prompt exceeds context
  - final example-string selection for the assembled prompt
- Refactored the shared prompt-line mutation logic into a core-local helper so the earlier context-packing stage no longer depends on a script-local callback.
- Extended `bindGenerationCore(...)` with narrow callbacks for:
  - instruct wrap config access
  - instruct-mode chat formatting
  - instruct-mode prompt formatting

### Measurable Impact
- Another full `Generate(...)` pipeline stage has left the monolith.
- The remaining monolith-owned generation logic is now increasingly concentrated around combined-prompt flattening, provider payload construction, and response handling.

### Insights
- The prompt-line logic was worth centralizing in `generation-core` because it was already implicitly shared across adjacent pipeline stages.
- Keeping the extraction at the preparation/sizing boundary avoided mixing context fitting with later event-driven prompt combination logic in the same commit.

### Next
1. Reassess whether the next `Generate(...)` extraction should target the combined-prompt builder/provider-data setup or pivot back to the earlier world-info/story-string augmentation block.
2. Keep the next move centered on one remaining pipeline stage with explicit inputs/outputs, rather than widening the callback surface across multiple stages at once.

## 2026-03-07 - Monolith Reduction Wave 26 (Generate Combined-Prompt Builder)

### Completed
- Moved the combined-prompt flattening stage out of `public/script.js` into `public/scripts/generation-core.js` as `buildCombinedPrompt(...)`.
- That extracted block now owns:
  - CFG prompt injection into the assembled prompt payload
  - prompt-bias application for non-instruct/non-impersonate paths
  - flattening `mesSend` into a final combined prompt string
  - `GENERATE_BEFORE_COMBINE_PROMPTS` event emission and prompt override handling
  - collapse-newlines post-processing for the final flattened prompt
- Updated `Generate(...)` in `public/script.js` to use the core builder for both the main prompt and the TextGen negative CFG prompt path.
- Fixed a latent regression from the earlier context-window extraction by restoring `cfgGuidanceScale` and `useCfgPrompt` as explicit returned state from `prepareGenerationContextWindow(...)`.
- Extended `bindGenerationCore(...)` with narrow callbacks for:
  - newline collapsing
  - collapse-newlines preference access

### Measurable Impact
- Another full `Generate(...)` pipeline stage has left the monolith.
- The remaining monolith-owned generation logic is now more concentrated around provider payload setup and response handling.

### Insights
- The combined-prompt builder was a stable seam because it already behaved like a pure transformation with one event-driven override point.
- Surfacing `cfgGuidanceScale` and `useCfgPrompt` from the earlier helper made the generation pipeline state explicit and avoided relying on hidden locals across extraction boundaries.

### Next
1. Reassess whether the next `Generate(...)` extraction should target provider payload setup or pivot back to the earlier world-info/story-string augmentation block.
2. Keep the next move focused on one remaining pipeline stage, with special care around payload builders that still have provider-specific side effects.

## 2026-03-07 - Monolith Reduction Wave 27 (Generate Provider Payload Setup)

### Completed
- Moved the provider payload setup switch out of `public/script.js` into `public/scripts/generation-core.js` as `prepareGenerationData(...)`.
- That extracted block now owns:
  - Kobold/Kobold Horde payload construction
  - TextGen payload construction
  - Novel payload construction
  - OpenAI prompt preparation handoff
  - Horde response-length clamping for payload setup
- Updated `Generate(...)` in `public/script.js` to consume returned payload state and keep the remaining OpenAI-specific side effects explicit:
  - token-count parsing into prompt bits
  - in-context message marker update
- Extended `bindGenerationCore(...)` with narrow callbacks for:
  - minimum Horde response length access
  - OpenAI message-count access
  - OpenAI prompt preparation

### Measurable Impact
- Another large provider-specific stage has left the monolith.
- The remaining monolith-owned generation logic is now mostly the earlier world-info/story-string augmentation block plus downstream response handling and post-processing.

### Insights
- Provider payload setup was a good seam once the combined-prompt builder had already been extracted; before that, too much implicit state was still bundled into the switch.
- Keeping OpenAI token-count parsing and in-context UI updates in `script.js` for now avoids hiding side effects inside the core layer while still reducing the monolith meaningfully.

### Next
1. Reassess whether the next `Generate(...)` extraction should target the earlier world-info/story-string augmentation block or the later response-handling path.
2. Keep the next move focused on one remaining pipeline stage, with special care around extension prompt mutations and streaming/non-streaming branching.

## 2026-03-07 - Monolith Reduction Wave 28 (Generate Success-State Preparation)

### Completed
- Moved the parsed-response success-state preparation stage out of `public/script.js` into `public/scripts/generation-core.js` as `prepareGenerationSuccessState(...)`.
- That extracted block now owns:
  - response field extraction for title/reasoning/image/swipes
  - primary message cleanup for chunk detection
  - reasoning normalization and trim handling
  - continuation-prefix application to the returned message
  - final quiet/non-quiet display cleanup
- Updated `onSuccess(...)` in `public/script.js` to consume the returned success state while keeping save/tool/UI side effects local:
  - `saveReply(...)`
  - tool-call invocation and recursion
  - sound, auto-swipe, chat save, and unblock logic
- Extended `bindGenerationCore(...)` with narrow callbacks for:
  - title/image/reasoning/swipe extraction
  - trim-spaces preference access
  - reasoning text normalization

### Measurable Impact
- Another response-side stage has left the monolith.
- The remaining monolith-owned generation logic is now increasingly concentrated around streaming/finalization branching and the earlier world-info/story-string augmentation block.

### Insights
- The success-state parser was a better next seam than `finishGenerating()` because it isolates deterministic response normalization from the heavier UI, tool-call, and persistence side effects.
- Keeping continuation-prefix cleanup explicit in `script.js` before calling the core helper made the extracted function simpler and preserved the existing logprob/save interactions.

### Next
1. Reassess whether the next `Generate(...)` extraction should target the streaming/request-finalization branch or pivot back to the earlier world-info/story-string augmentation block.
2. Keep the next move focused on one remaining pipeline stage, with special care around side-effect-heavy branches.

## 2026-03-07 - Monolith Reduction Wave 29 (Generate Request Metadata Recording)

### Completed
- Moved the deterministic prompt-metadata recording step out of `public/script.js` into `public/scripts/generation-core.js` as `recordGenerationPromptMetadata(...)`.
- That extracted block now owns:
  - prompt metadata object construction for itemized prompt inspection
  - replacement/append behavior for the target prompt-metadata entry by `mesId`
- Updated `finishGenerating()` in `public/script.js` to delegate metadata construction/recording while keeping request execution and UI side effects local.

### Measurable Impact
- Another deterministic slice has left the monolith from the request-finalization path.
- The remaining `finishGenerating()` logic is now more concentrated around request execution, streaming orchestration, and tool-call branching.

### Insights
- The request-finalization branch still has several heavy side effects, so it continues to make sense to peel off deterministic metadata/state preparation before attempting a broader execution move.
- Keeping itemized prompt recording in `generation-core` is useful even though the slice is smaller, because it reduces monolith-local bookkeeping without introducing more runtime coupling.

### Next
1. Reassess whether the next `Generate(...)` extraction should target the streaming/request-execution branch or pivot back to the earlier world-info/story-string augmentation block.
2. Keep the next move focused on one remaining side-effect-heavy stage, rather than mixing request execution with prompt augmentation.

## 2026-03-07 - Monolith Reduction Wave 30 (Generate Streaming Kickoff)

### Completed
- Moved the streaming request kickoff stage out of `public/script.js` into `public/scripts/generation-core.js` as `executeStreamingGenerationRequest(...)`.
- That extracted block now owns:
  - streaming processor creation through a bound factory
  - processor registration/sync through a bound setter
  - streaming request dispatch
  - initial streamed message collection
  - first-pass message chunk cleanup for the streamed result
- Updated `finishGenerating()` in `public/script.js` to consume the returned streaming kickoff state while keeping tool-call recursion, finish handling, and unblock logic local.
- Extended `bindGenerationCore(...)` with narrow callbacks for:
  - streaming processor construction
  - streaming processor assignment/sync
  - swipe-button hiding during active streaming

### Measurable Impact
- Another side-effect-heavy subsection has left the monolith without yet hiding the more delicate tool-call recursion or stream-finalization behavior.
- `finishGenerating()` is now more concentrated around post-stream branching rather than the initial processor setup.

### Insights
- The streaming path is safest to extract in layers: kickoff first, then tool-call recursion/finalization after the processor lifecycle is already behind a core boundary.
- Using a bound setter for `streamingProcessor` preserves the legacy shared state model while still letting the orchestration body shrink.

### Next
1. Reassess whether the next `Generate(...)` extraction should target the remaining stream finalization/tool-call branch or pivot back to the earlier world-info/story-string augmentation block.
2. Keep the next move focused on one remaining side-effect-heavy stage with explicit state handoff.

## 2026-03-07 - Monolith Reduction Wave 31 (Generate Stream Finalization Branch)

### Completed
- Moved the post-stream decision tree out of `public/script.js` into `public/scripts/generation-core.js` as `finalizeStreamingGeneration(...)`.
- That extracted block now owns:
  - streamed tool-call detection
  - optional deletion of placeholder streamed messages before tool execution
  - tool invocation dispatch and stop/recurse decision shaping
  - streamed completion handoff via `onFinishStreaming(...)`
  - auto-continue trigger for completed streamed generations
- Updated `finishGenerating()` in `public/script.js` to consume returned branch status and keep only the remaining local side effects:
  - unblock on stop
  - `saveFunctionToolInvocations(...)`
  - recursive `Generate(...)` re-entry
- Extended `bindGenerationCore(...)` with narrow callbacks for:
  - tool-call detection
  - tool invocation dispatch
  - tool-call error display
  - auto-continue triggering

### Measurable Impact
- Another major side-effect-heavy subsection has left the monolith.
- The remaining `Generate(...)` body is now much smaller and more concentrated around the earlier prompt augmentation block plus non-streaming success/error flow.

### Insights
- The streaming path only became safe to extract after kickoff and metadata handling were already outside the monolith; trying to move this branch earlier would have made the boundary too broad.
- Returning explicit branch statuses (`stop`, `recurse`, `complete`, `pending`) is a better migration pattern than hiding recursive `Generate(...)` calls inside the core layer.

### Next
1. Reassess whether the next `Generate(...)` extraction should target the earlier world-info/story-string augmentation block or the remaining non-streaming success/error flow.
2. Keep the next move focused on one remaining pipeline stage with clear side-effect boundaries.

## 2026-03-07 - Monolith Reduction Wave 32 (Generate Prompt Augmentation Block)

### Completed
- Moved the world-info/story-string augmentation block out of `public/script.js` into `public/scripts/generation-core.js` as `preparePromptAugmentationState(...)`.
- That extracted block now owns:
  - initial message-example parsing for the generation pass
  - floating prompt and persona-description prompt setup
  - world-info scan preparation and quiet-prompt wrapping
  - WI example insertion into message examples
  - instruct-mode example formatting
  - WI depth-prompt injection setup
  - before/after anchor collection
  - story-string rendering and optional in-chat story-string injection
  - non-OpenAI depth prompt injection into chat history
  - post-history jailbreak shaping and injection
- Updated `Generate(...)` in `public/script.js` to consume a compact returned augmentation state instead of owning that full inline block.
- Extended `bindGenerationCore(...)` with the narrow prompt-augmentation callbacks/config needed to keep the extracted logic off `script.js` without creating new dependency cycles.

### Measurable Impact
- One of the last large early-stage `Generate(...)` seams has left the monolith.
- `Generate(...)` is now more concentrated around context packing, provider setup, and the remaining response/error glue instead of owning prompt augmentation directly.

### Insights
- The WI/story-string path was large, but still a coherent migration unit once prompt writes were pushed behind small bound callbacks instead of exposing legacy constants directly inside `generation-core`.
- Expanding the existing sysprompt config binding was cleaner than adding a separate jailbreak-only binding, because the helper already needed the same configuration family for prompt augmentation decisions.

### Next
1. Reassess the remaining `Generate(...)` body for the next coherent reduction, likely the smaller non-streaming success/error glue that still lives in `finishGenerating()`.
2. Keep avoiding mixed migrations that combine prompt preparation with request execution or UI unblock logic in the same wave.

## 2026-03-08 - Monolith Reduction Wave 33 (Generate Non-Streaming Success and Error Handling)

### Completed
- Moved the non-streaming success/error branch out of `public/script.js` into `public/scripts/generation-core.js` as:
  - `finalizeGenerationResponse(...)`
  - `handleGenerationError(...)`
- That extracted logic now owns:
  - non-streaming response error detection
  - JSON-schema extraction early return handling
  - parsed success-state preparation handoff
  - impersonation textarea/event handling
  - quiet-generation completion handling
  - non-streaming reply persistence and logprob recording
  - non-streaming tool-call stop/recurse decision shaping
  - post-success sound, auto-swipe, chat save, streaming cleanup, and auto-continue handoff
  - centralized non-streaming error cleanup and reporting
- Updated `Generate(...)` in `public/script.js` to consume explicit status returns from the new helpers and keep only the recursive re-entry and tool-invocation persistence local.
- Extended `bindGenerationCore(...)` with the narrow callbacks needed for success/error side effects without reintroducing direct `script.js` imports.

### Measurable Impact
- Another large late-stage `Generate(...)` branch has left the monolith.
- The remaining `Generate(...)` body is now more concentrated around pipeline setup and explicit recurse boundaries rather than response-handling details.

### Insights
- The non-streaming and streaming finalization paths now share the same migration pattern: core-owned orchestration returning explicit statuses, with recursive `Generate(...)` re-entry kept visible in `script.js`.
- Moving cleanup through the existing `setStreamingProcessor(...)` binding is safer than direct shared-state mutation because it preserves the current sync side effects while shrinking monolith ownership.

### Next
1. Reassess whether the next useful reduction is the remaining `finishGenerating()` request-execution shell or a pivot out of `Generate(...)` into an adjacent monolith-owned helper cluster.
2. Keep the next move coherent; avoid mixing request dispatch, UI bootstrapping, and unrelated character/chat helpers in one wave.

## 2026-03-08 - Monolith Reduction Wave 34 (Generate Request-Runner Shell)

### Completed
- Moved the remaining request-runner shell out of `public/script.js` into `public/scripts/generation-core.js` as `executeGenerationRequestFlow(...)`.
- That extracted helper now owns:
  - prompt logging and stop-button display
  - prompt-metadata capture/recording before dispatch
  - streaming vs non-streaming request branching
  - streaming kickoff/finalization handoff
  - non-streaming request dispatch handoff into `finalizeGenerationResponse(...)`
  - normalization of stop/recurse/complete statuses so `script.js` only keeps explicit recursive re-entry
- Updated `Generate(...)` in `public/script.js` to:
  - compute normalized continuation prefix once
  - delegate request execution to the new core helper
  - keep only recurse handling plus `Generate(...)` re-entry local
- Extended `bindGenerationCore(...)` with the small metadata/request-shell callbacks needed for:
  - prompt logging preference
  - extension-prompt aggregation
  - selected preset/tokenizer metadata
  - stop-button display
  - prompt-metadata side-channel values

### Measurable Impact
- Another large orchestration block left the monolith.
- `Generate(...)` is now primarily a pipeline assembler with explicit recurse boundaries instead of owning request execution details.

### Insights
- Once both streaming and non-streaming completion branches were core-owned, the remaining request shell became a clean extraction target; doing it earlier would have produced a helper with too many partially migrated branches.
- Passing a compact `generateOptions` bag through the explicit recurse path is acceptable at this stage because extra fields are ignored by `Generate(...)`, while keeping the re-entry boundary visible and stable.

### Next
1. Reassess whether `Generate(...)` is now small enough to stop, or whether one more focused pass should lift its remaining orchestration shell into `generation-core`.
2. If the remaining `Generate(...)` body is no longer a good extraction target, pivot to the next adjacent monolith-owned orchestration cluster instead of forcing another generation-side split.

## 2026-03-09 - Monolith Reduction Wave 35 (Generate Core Chat Preparation)

### Completed
- Moved the `coreChat` preparation and prompt-reasoning injection block out of `public/script.js` into `public/scripts/generation-core.js` as `prepareCoreChatState(...)`.
- That extracted helper now owns:
  - filtering chat messages down to the prompt-eligible chat set
  - swipe-mode tail trimming
  - prompt-time message formatting
  - file-content append handling
  - appended-title inclusion
  - prompt-reasoning injection and limit handling
- Updated `Generate(...)` in `public/script.js` to consume `{ coreChat, promptReasoning }` directly instead of owning that transformation loop inline.
- Extended `bindGenerationCore(...)` with the narrow callbacks needed for:
  - prompt message formatting
  - prompt reasoning formatting
  - file-content append handling
  - prompt reasoning object creation

### Measurable Impact
- Another cohesive chat-preparation block has left the monolith.
- The remaining `Generate(...)` body is now more clearly an orchestration pipeline rather than a place where raw chat transformation logic lives.

### Insights
- The `coreChat` preparation path was worth extracting even after the larger generation waves because it was still a self-contained transformation stage with minimal UI coupling.
- Passing formatted-message and reasoning helpers as callbacks is a better migration boundary than pulling regex-placement details directly into `generation-core` at this stage.

### Next
1. Reassess whether `Generate(...)` should get one final orchestration-only reduction or whether the next effort should pivot to the next adjacent monolith-owned helper cluster.
2. If generation-side extractions now have sharply diminishing returns, move to the next highest-yield orchestration cluster instead of overfitting the helper boundary.

## 2026-03-09 - Monolith Reduction Wave 36 (Generate Entry Preflight)

### Completed
- Moved the top-of-function generation preflight block out of `public/script.js` into `public/scripts/generation-core.js` as `prepareGenerationEntryState(...)`.
- That extracted helper now owns:
  - shallow-character expansion before generation
  - generation start / post-command event emission
  - abort-controller initialization handoff
  - instruct/impersonate mode derivation
  - slash-command interruption gating
  - kobold streaming support and horde-generation gate checks
  - server ping / backend availability handling
  - non-dry-run swipe hiding and chat tainting
  - group-generation delegation or dry-run member selection
  - quiet-prompt normalization for novel mode
  - no-connection early exit handling
- Updated `Generate(...)` in `public/script.js` to consume the returned entry-state object and keep only the remaining orchestration pipeline local.
- Extended `bindGenerationCore(...)` with the narrow callbacks required for preflight policy and side effects:
  - generation event emission
  - abort controller assignment
  - group-generation delegation
  - server / unsupported-mode notifications
  - group/menu state access
  - chat tainting and connection checks

### Measurable Impact
- The early policy-heavy section of `Generate(...)` has left the monolith.
- `Generate(...)` is now much closer to a pure top-level pipeline coordinator.

### Insights
- The preflight block was a good final generation-side extraction because it was policy-heavy but still internally coherent once its side effects were pushed behind small callbacks.
- At this point, further `Generate(...)` splitting likely has diminishing returns unless another clearly self-contained orchestration seam appears.

### Next
1. Reassess the remaining `Generate(...)` body; if there is no equally coherent seam left, pivot to the next adjacent monolith-owned orchestration cluster.
2. Favor the next highest-yield non-generation cluster rather than forcing more helper fragmentation inside `Generate(...)`.

## 2026-03-09 - React Migration Wave 1 (Shell Runtime Panel)

### Completed
- Upgraded the React shell from an iframe-only wrapper into a real runtime panel in `frontend/src/features/shell/ShellPage.tsx`.
- Extended the typed bridge contracts in `frontend/src/core/contracts.ts` and `frontend/src/legacy/bridge.ts` so React code can read a shell snapshot and update a small, explicit subset of power-user preferences without touching `script.js`.
- Added the first migrated React shell controls:
  - live runtime status and active session facts
  - quick preference toggles for a bounded subset of `power_user` settings
  - generation stop and explicit save actions
  - legacy app/login escape hatches
- Refreshed `frontend/src/styles/global.css` to support the new shell layout while leaving the login surface intact.
- Added bridge contract coverage in `frontend/src/test/bridge.test.ts`.

### Measurable Impact
- The React app now owns a visible, useful shell-side control surface instead of only bootstrapping legacy pages.
- New React code can read and mutate a first real slice of runtime settings through the typed bridge instead of ad hoc globals.

### Insights
- The bridge is now mature enough to support real React surfaces without another long extraction-only phase.
- A shell-side settings panel is a better first React cut than deeper chat UI because it exercises runtime state, persistence, and controls without requiring immediate replacement of the full message DOM stack.

### Next
1. Expand the React shell with another bounded operational slice, likely session/character switching or a larger settings surface.
2. Start replacing one legacy panel at a time instead of continuing broad compatibility-only extraction work.

## 2026-03-09 - React Migration Wave 2 (Shell Session Switcher)

### Completed
- Extended the typed bridge with a `SessionService` that exposes:
  - a React-friendly character/group catalog
  - character selection
  - group opening
  - current-chat reload
- Upgraded the React shell to include a real session switcher panel with:
  - live character and group lists
  - session filtering
  - one-click character switching
  - one-click group switching
  - current chat reload
- Added bridge contract coverage for catalog mapping and session action delegation.

### Measurable Impact
- The React shell now owns both runtime inspection and a real session navigation workflow.
- React is no longer only reading legacy state; it is now driving active character/group changes through typed bridge operations.

### Insights
- The existing `getContext()` surface is already rich enough to support meaningful React control panels before deeper DOM replacement work.
- A shell-side session switcher is a good migration seam because it uses stable high-level actions (`selectCharacterById`, `openGroupChat`, `reloadCurrentChat`) rather than replicating jQuery-heavy inner panel behavior.

### Next
1. Continue expanding the React shell with a larger settings/editor surface or session metadata actions.
2. After that, move into one deeper in-app panel rather than widening shell-only controls indefinitely.

## 2026-03-09 - React Migration Wave 3 (Shell Chat Actions)

### Completed
- Extended the typed `SessionService` with current-chat actions:
  - clear current chat
  - rename current chat
- Added a React-owned chat action block to the shell so the current session can be renamed or cleared without dropping back to legacy controls.
- Expanded bridge tests to cover the new current-chat action delegation.

### Measurable Impact
- The React shell now controls a small but real piece of chat lifecycle management rather than only navigation and preferences.
- React-owned session actions now cover:
  - switching characters
  - switching groups
  - reloading chats
  - renaming chats
  - clearing chats

### Insights
- The shell is now exercising enough high-level runtime actions that the next step should likely move beyond shell-only controls into one deeper panel or a broader settings editor.
- Using current-chat actions through the typed bridge keeps the React layer focused on stable orchestration calls rather than direct DOM mutation.

### Next
1. Move to a broader React settings/editor slice or a deeper in-app panel.
2. Avoid spending too many more waves on shell controls alone unless they directly support the next larger panel migration.

## 2026-03-09 - React Migration Wave 4 (Shell Settings Editor)

### Completed
- Expanded the typed shell preference contract to cover a broader, still-bounded set of generation and workflow defaults.
- Extended the legacy bridge so React can read and write:
  - auto-continue settings
  - continue / impersonation shortcuts
  - prompt logging and token probability requests
  - compact input and draft restore workflow defaults
- Upgraded the shell panel from a small quick-toggle block into a categorized React settings editor with:
  - message cleanup controls
  - generation default controls
  - workflow controls
  - auto-continue target length slider
- Expanded bridge tests to cover the richer preference mapping and update paths.

### Measurable Impact
- The React shell now owns a materially broader settings surface rather than only a handful of basic toggles.
- React-controlled settings now span cleanup, generation behavior, and workflow defaults through one typed bridge contract.

### Insights
- A bounded settings editor is a better next step than more shell action buttons because it moves a meaningful configuration surface without taking on the message DOM yet.
- The bridge can now support mixed boolean and numeric preference updates cleanly, which will matter for later React settings migration work.

### Next
1. Move into a deeper in-app panel next, likely character management or composer/generation controls.
2. Keep the shell as a useful operational layer, but stop turning it into a full duplicate of the legacy app.

## 2026-03-09 - React Migration Wave 5 (Shell Generation Tools)

### Completed
- Extended the typed generation bridge with a `generateQuietPrompt(...)` surface.
- Added a React-owned generation tools panel to the shell with:
  - quiet prompt text entry
  - target length control
  - quiet-to-loud toggle
  - trim-to-sentence toggle
  - result display
- Expanded bridge tests to cover quiet-prompt delegation.

### Measurable Impact
- React now owns a real generation workflow, not only settings and session management.
- The shell can execute a bounded runtime generation task and display the result without handing control back to legacy UI.

### Insights
- `generateQuietPrompt(...)` is a strong migration seam because it is already a high-level runtime action with a clean input/output boundary.
- This is a better bridge-backed React panel than trying to partially replace the full composer or message list too early.

### Next
1. Move next into a deeper in-app panel, likely character data/editor viewing or a fuller generation/composer surface.
2. Keep React additions aligned to high-level runtime actions rather than recreating low-level DOM behavior.

## 2026-03-09 - React Migration Wave 6 (Shell Character Editor)

### Completed
- Added a typed `CharacterService` to the React bridge for:
  - reading the selected character profile
  - saving a selected character profile back through `/api/characters/edit`
- Built a React character editor panel in the shell that supports:
  - selected character inspection
  - editing core card text fields
  - editing creator/version/talkativeness metadata
  - tag editing
  - saving and draft reset
- Preserved non-edited legacy character fields during save by carrying forward existing avatar, world, alternate greetings, depth prompt, and JSON metadata fields.
- Expanded bridge tests to cover selected-character profile loading and save delegation.

### Measurable Impact
- React now owns a deeper data-editing surface, not just shell controls and bounded generation utilities.
- The migration has crossed from runtime orchestration into actual authoring workflows.

### Insights
- The server-side `/api/characters/edit` contract is stable enough to support a narrow React editor without routing saves through the legacy DOM form.
- Preserving untouched legacy fields during save is important; a naive partial payload would have caused silent data loss in character cards.

### Next
1. Move next into either a fuller composer/generation surface or a more focused chat metadata/editor panel.
2. Keep using stable runtime actions and backend contracts rather than trying to mirror legacy form DOM state.

## 2026-03-09 - React Migration Wave 7 (Shell Chat Metadata Editor)

### Completed
- Extended the typed chat bridge with current chat metadata read/write support.
- Added a React-owned chat metadata panel for editing the active chat scenario override and saving it through the existing runtime metadata path.
- Expanded bridge tests to cover metadata mapping and save delegation.

### Measurable Impact
- React now owns another persistent authoring surface tied directly to the active chat session.
- The shell includes both character-level and chat-level editing workflows, not only global settings and operational controls.

### Insights
- Chat metadata is a good migration seam because it already has a stable runtime API and does not require partial message-list replacement.
- Scenario override editing gives React a useful per-chat authoring surface without introducing prompt assembly duplication into the new UI.

### Next
1. Move next into a fuller composer/generation surface or a more focused message-level tool panel.
2. Keep preferring stable runtime metadata/action APIs over low-level DOM replication.

## 2026-03-09 - React Migration Wave 8 (Shell Composer Surface)

### Completed
- Extended `window.SillyTavern.getContext()` with `sendMessageAsUser(...)` so React can drive user-message sends through an existing high-level runtime action.
- Added a typed `ComposerService` to the React bridge for:
  - send-only user messages
  - send-plus-generate
  - continue generation
  - impersonate generation
  - regenerate
- Added a React-owned composer panel to the shell with a message textarea and direct generation controls.
- Expanded bridge tests to cover send/generate delegation.

### Measurable Impact
- React now owns a real send/generate interaction surface, not just supporting tools around the legacy runtime.
- The shell can drive the core chat loop through stable runtime actions without simulating the legacy textarea DOM.

### Insights
- `sendMessageAsUser(...)` plus `Generate(...)` is a practical bridge seam because both are already high-level orchestration points with stable behavior.
- This is a better interim composer migration than trying to partially reimplement the legacy input widget and its event wiring.

### Next
1. Move next into message-level tools or a more complete chat/history inspection surface.
2. Keep using explicit runtime actions for the React composer instead of coupling React to the legacy textarea state.

## 2026-03-09 - React Migration Wave 9 (Shell History Tools)

### Completed
- Extended the typed chat bridge with:
  - mapped message history summaries
  - delete-last-message
  - generic system-note insertion
- Added a React-owned history tools panel with:
  - live recent-message inspection
  - role/timestamp/token-count display
  - system note insertion
  - delete-last-message action
- Expanded bridge tests to cover message mapping and history actions.

### Measurable Impact
- React now owns a real chat-history inspection surface in addition to send/generate controls.
- The shell can perform a small but useful set of message-level operations through stable runtime actions.

### Insights
- Message history is a good next step because the chat array is already a stable runtime state source, while richer message editing still depends on more legacy DOM-specific flows.
- Avoiding `swipe_left/right` for now was correct; those functions still depend on DOM-bound `this` semantics and are not clean React bridge surfaces yet.

### Next
1. Move next into a cleaner message-editing seam or a richer chat/history panel if a safe runtime action exists.
2. Keep avoiding DOM-bound legacy handlers until they are wrapped behind typed bridge methods.

## 2026-03-09 - React Migration Wave 10 (Primary Runtime Chat Workspace)

### Completed
- Reworked the shell so the main runtime column is now a React-owned chat workspace instead of a full-size iframe.
- Promoted the React transcript/composer surface to the primary runtime area with:
  - live chat transcript rendering
  - runtime badges and chat context header
  - integrated composer controls
  - integrated history and metadata side rail
- Demoted the legacy app to a fallback/details panel in the runtime column instead of keeping it as the main visible surface.
- Added transcript auto-scroll tied to the existing shell preference.

### Measurable Impact
- This is the first wave where React, not the embedded legacy page, is the primary runtime surface for normal chat interaction.
- The migration has moved from “React shell around legacy” to “React first, legacy fallback” for the chat workspace itself.

### Insights
- Reusing the existing bridge-backed transcript/composer/history tools made it possible to flip the visual priority without adding another round of compatibility extraction first.
- Keeping the legacy iframe available as a fallback/details panel is still useful during parity work, but it no longer needs to dominate the layout.

### Next
1. Move next into a safe message-editing or assistant-message action seam.
2. Continue collapsing the legacy iframe’s role as more runtime interactions become React-owned.

## 2026-03-09 - React Migration Wave 11 (Message Editing Seam)

### Completed
- Added a typed `chat.updateMessage(...)` bridge method that:
  - mutates the runtime chat state
  - emits the legacy message edit/update events
  - rerenders the message block
  - persists the chat
- Added a React-owned message editor panel tied to transcript selection.
- Made transcript messages selectable in the React workspace so editing is driven from the new runtime surface instead of the legacy DOM editor.
- Expanded bridge tests to cover the message edit mutation/save/event path.

### Measurable Impact
- React now owns a real message-editing workflow for the active chat.
- This is the first safe message mutation seam moved into React without depending on the legacy inline editor UI.

### Insights
- Reusing the legacy event sequence (`MESSAGE_EDITED` then `MESSAGE_UPDATED`) is important because downstream listeners may still normalize or react to message changes.
- Message editing was a better next seam than swipes because the legacy swipe handlers remain tightly bound to DOM-local animation state.

### Next
1. Move next into assistant-message actions or a safer subset of message duplication/reordering if the runtime seam is clean enough.
2. Continue preferring event-backed chat mutations over DOM-bound legacy handlers.

## 2026-03-09 - React Migration Wave 12 (Hidden Bridge Runtime and Message Actions)

### Completed
- Split the embedded legacy runtime into:
  - a hidden always-mounted bridge iframe used only for React state sync and runtime actions
  - an on-demand visible fallback iframe that only mounts when the fallback panel is opened
- Extended the typed chat bridge with:
  - per-message delete
  - per-message duplicate
  - last-message swipe controls
  - swipe metadata in message summaries
- Expanded the React message editor surface with:
  - duplicate and delete actions for the selected message
  - previous/next swipe controls for the active final assistant turn
  - swipe status display in the transcript and selected-message panel
- Expanded bridge tests to cover the new message mutation and swipe actions.

### Measurable Impact
- The visible legacy iframe is no longer required just to keep the React surface connected; it is now a true fallback panel.
- More common message-management actions are now React-owned, which further reduces the need to open the legacy UI during normal chat use.

### Insights
- Separating the hidden bridge runtime from the visible fallback iframe is a better migration step than trying to remove the iframe entirely too early; it preserves extension/runtime behavior while letting React become the only surface the user normally interacts with.
- Message delete and duplicate are acceptable bridge seams when followed by save-plus-reload, because that keeps the hidden legacy runtime consistent without reintroducing DOM-coupled helpers into React.
- Swipes are still not a fully general message-level bridge seam; exposing them only for the final assistant turn keeps the contract aligned with how the legacy runtime actually behaves.

### Next
1. Keep shrinking the visible fallback by moving another runtime-only message or chat action into the bridge instead of adding more shell-only controls.
2. Start targeting a deeper panel replacement where the visible fallback is only needed for niche tooling, not routine chat management.

## 2026-03-10 - React Migration Wave 13 (Message Reordering and Swipe Deletion)

### Completed
- Extended the typed chat bridge with:
  - message reordering (`moveMessage(..., 'up' | 'down')`)
  - current-swipe deletion for the final assistant turn
- Exposed `deleteSwipe` in [public/scripts/st-context.js](/Users/hal/.codex/worktrees/dc18/SillyTavern/public/scripts/st-context.js) so React can use the existing runtime action instead of recreating swipe deletion logic.
- Expanded the React message editor surface with:
  - move up / move down controls for the selected message
  - delete current swipe alongside the existing previous/next swipe controls
- Expanded bridge tests to cover reorder and swipe-deletion behavior.

### Measurable Impact
- More of the legacy message editor toolset is now available from the React workspace.
- Opening the visible fallback iframe is less necessary for day-to-day chat cleanup and iteration flows.

### Insights
- Save-and-reload is still the right bridge pattern for reorder operations because it keeps runtime state and message ids coherent without pulling legacy DOM bookkeeping into React.
- Reusing the existing runtime `deleteSwipe()` path is preferable to duplicating swipe mutation logic in the bridge; it preserves current swipe invariants and future changes stay centralized.

### Next
1. Continue removing routine reasons to open the visible fallback by migrating another bounded message or chat-management action.
2. After that, shift focus from incremental editor tools to replacing one deeper legacy panel outright.

## 2026-03-10 - React Migration Wave 14 (Session History Panel)

### Completed
- Added a typed session-history bridge for the current selected character or group with:
  - history search via the existing `/api/chats/search` flow
  - open specific chat file
  - rename specific chat file
  - delete specific chat file
- Exposed the existing character/group chat deletion helpers through [public/scripts/st-context.js](/Users/hal/.codex/worktrees/dc18/SillyTavern/public/scripts/st-context.js) instead of duplicating deletion rules in React.
- Added a React-owned session history panel in the main runtime rail with:
  - search
  - open
  - inline rename
  - delete
  - active-chat highlighting
- Expanded bridge tests to cover session-history loading and current-session open/rename/delete behavior.

### Measurable Impact
- The old past-chats popup is no longer the only practical way to manage saved chats for the active session.
- This is a deeper legacy panel replacement, not just another isolated action button.

### Insights
- Session history is a better panel target than continuing to widen message-editor controls because it replaces a whole legacy popup workflow with a typed service boundary.
- Keeping history scoped to the current selected session avoids premature generalization while still removing one of the more common fallback-iframe use cases.

### Next
1. Keep reducing visible fallback usage by replacing another legacy popup or panel rather than returning to small one-off controls.
2. Revisit whether the visible fallback should stay mounted at all in normal development once a couple more workflow panels are React-owned.

## 2026-03-10 - React Migration Wave 15 (Character Creation Panel)

### Completed
- Added a typed character-creation bridge path so React can create a new character through the hidden runtime without opening the legacy create panel:
  - [frontend/src/core/contracts.ts](/Users/hal/.codex/worktrees/dc18/SillyTavern/frontend/src/core/contracts.ts)
  - [frontend/src/legacy/bridge.ts](/Users/hal/.codex/worktrees/dc18/SillyTavern/frontend/src/legacy/bridge.ts)
  - [public/scripts/st-context.js](/Users/hal/.codex/worktrees/dc18/SillyTavern/public/scripts/st-context.js)
- Added a React-owned `New character` panel in [frontend/src/features/shell/ShellPage.tsx](/Users/hal/.codex/worktrees/dc18/SillyTavern/frontend/src/features/shell/ShellPage.tsx) with:
  - blank-draft creation workflow
  - core card fields needed for initial authoring
  - reset and create actions
- Expanded bridge coverage in [frontend/src/test/bridge.test.ts](/Users/hal/.codex/worktrees/dc18/SillyTavern/frontend/src/test/bridge.test.ts) to cover typed character creation.

### Measurable Impact
- Creating a fresh character no longer requires opening the legacy character-create menu for the common text-only flow.
- The React shell now covers both creation and editing of core character-card data.

### Insights
- Running character creation through the existing hidden-runtime workflow is preferable to reimplementing the backend submission path in React because selection, refresh, and legacy side effects stay centralized.
- Character management is now substantial enough in React that the legacy right-side character form is becoming a fallback rather than the primary authoring path.

### Next
1. Continue replacing another routine authoring panel rather than widening the shell with more isolated buttons.
2. Reassess whether the visible fallback iframe should default to closed once character and chat authoring paths are mostly React-owned.

## 2026-03-10 - React Migration Wave 16 (Group Management Panels)

### Completed
- Extended the typed modernization bridge with explicit group-management contracts and richer character catalog entries:
  - [frontend/src/core/contracts.ts](/Users/hal/.codex/worktrees/dc18/SillyTavern/frontend/src/core/contracts.ts)
  - [frontend/src/legacy/bridge.ts](/Users/hal/.codex/worktrees/dc18/SillyTavern/frontend/src/legacy/bridge.ts)
- Exposed the remaining runtime hooks needed for React-driven group creation/opening in [public/scripts/st-context.js](/Users/hal/.codex/worktrees/dc18/SillyTavern/public/scripts/st-context.js).
- Added React-owned `New group` and `Group editor` panels in [frontend/src/features/shell/ShellPage.tsx](/Users/hal/.codex/worktrees/dc18/SillyTavern/frontend/src/features/shell/ShellPage.tsx), with supporting UI styling in [frontend/src/styles/global.css](/Users/hal/.codex/worktrees/dc18/SillyTavern/frontend/src/styles/global.css).
- Expanded bridge coverage in [frontend/src/test/bridge.test.ts](/Users/hal/.codex/worktrees/dc18/SillyTavern/frontend/src/test/bridge.test.ts) to cover group profile loading, creation, and saving.

### Measurable Impact
- Group creation and core group editing no longer require the legacy group-edit panel for the common text/settings workflow.
- The React shell now covers both major authoring surfaces that were still routinely pulling usage back into the visible fallback: characters and groups.

### Insights
- Direct bridge-level fetches for groups are acceptable here because group creation and editing already map cleanly to stable backend endpoints and a compact serializable group shape.
- Adding `avatarFile` to the session catalog was the key simplification for React member pickers; it avoids leaking more group-editor DOM behavior into the bridge.

### Next
1. Shift from authoring panels to a deeper runtime/editor surface, likely prompt or world-info management, instead of adding more shell-adjacent controls.
2. Reassess whether the visible fallback iframe should stay exposed by default now that both character and group authoring have React-owned paths.

## 2026-03-10 - React Migration Wave 17 (World Info Panel)

### Completed
- Added a typed world-info service to the modernization bridge:
  - [frontend/src/core/contracts.ts](/Users/hal/.codex/worktrees/dc18/SillyTavern/frontend/src/core/contracts.ts)
  - [frontend/src/legacy/bridge.ts](/Users/hal/.codex/worktrees/dc18/SillyTavern/frontend/src/legacy/bridge.ts)
- Exposed world-info catalog and selection helpers through [public/scripts/st-context.js](/Users/hal/.codex/worktrees/dc18/SillyTavern/public/scripts/st-context.js).
- Added a React-owned `World info` panel in [frontend/src/features/shell/ShellPage.tsx](/Users/hal/.codex/worktrees/dc18/SillyTavern/frontend/src/features/shell/ShellPage.tsx) with:
  - lorebook creation
  - lorebook list and global-selection toggles
  - raw JSON loading/editing/saving
  - lorebook deletion
- Added the small supporting inline-toggle style in [frontend/src/styles/global.css](/Users/hal/.codex/worktrees/dc18/SillyTavern/frontend/src/styles/global.css).
- Expanded bridge coverage in [frontend/src/test/bridge.test.ts](/Users/hal/.codex/worktrees/dc18/SillyTavern/frontend/src/test/bridge.test.ts) to cover world-info catalog, load, create, save, delete, and selection behavior.

### Measurable Impact
- Common lorebook workflows now have a React-owned path without opening the legacy world-info editor.
- The visible fallback is needed less for configuration and authoring flows; the remaining heavy legacy dependence is now more concentrated in specialized editor UIs.

### Insights
- A raw-JSON bridge is the right first React world-info surface because it provides immediate ownership of the persistence workflow without recreating the full entry-level editor in one pass.
- World-info selection needs explicit getters/setters in the context bridge; returning a one-time snapshot value would not stay coherent as lorebooks change.

### Next
1. Move into another deep runtime/editor surface, likely prompt management or a more structured world-info entry editor, instead of widening the shell with unrelated controls.
2. Reevaluate whether the visible fallback iframe should be demoted further now that character, group, and world-info authoring all have React-owned paths.

## 2026-03-10 - React Migration Wave 18 (Prompt Manager Panel)

### Completed
- Added a typed prompt-management service to the modernization bridge:
  - [frontend/src/core/contracts.ts](/Users/hal/.codex/worktrees/dc18/SillyTavern/frontend/src/core/contracts.ts)
  - [frontend/src/legacy/bridge.ts](/Users/hal/.codex/worktrees/dc18/SillyTavern/frontend/src/legacy/bridge.ts)
- Exposed bounded prompt-manager helpers through [public/scripts/st-context.js](/Users/hal/.codex/worktrees/dc18/SillyTavern/public/scripts/st-context.js):
  - prompt listing
  - prompt save/update for existing entries
- Added a React-owned `Prompt manager` panel in [frontend/src/features/shell/ShellPage.tsx](/Users/hal/.codex/worktrees/dc18/SillyTavern/frontend/src/features/shell/ShellPage.tsx) with:
  - prompt list and selection
  - enabled/disabled state editing
  - content, role, trigger, and injection-setting editing for existing prompts
- Expanded bridge coverage in [frontend/src/test/bridge.test.ts](/Users/hal/.codex/worktrees/dc18/SillyTavern/frontend/src/test/bridge.test.ts) to cover prompt listing and prompt saving.

### Measurable Impact
- Common prompt-template inspection and editing no longer require the legacy prompt manager UI.
- The remaining visible fallback dependence is pushed further toward niche tooling such as advanced reorder/import-export workflows.

### Insights
- Existing-prompt editing is a safe first seam because `PromptManager` already exposes stable getters and update methods; reorder and import/export remain coupled to its DOM-heavy legacy surface and are better left for a later pass.
- Using `saveSettingsDebounced()` directly from the context bridge is more robust for this React path than awaiting the legacy prompt-manager event chain, which is tuned for the old UI and not necessary for bounded React edits.

### Next
1. Replace another deep editor surface, likely prompt-book/world-info entry editing or extension management, instead of returning to small chat controls.
2. Reassess whether the visible fallback iframe should become fully opt-in once a couple more authoring panels are React-owned.

## 2026-03-10 - React Migration Wave 19 (Extension Management Panel)

### Completed
- Extended the typed extension bridge surface to include installed-extension listing and enable/disable toggles:
  - [frontend/src/core/contracts.ts](/Users/hal/.codex/worktrees/dc18/SillyTavern/frontend/src/core/contracts.ts)
  - [frontend/src/legacy/bridge.ts](/Users/hal/.codex/worktrees/dc18/SillyTavern/frontend/src/legacy/bridge.ts)
- Exposed bounded extension-management helpers through [public/scripts/st-context.js](/Users/hal/.codex/worktrees/dc18/SillyTavern/public/scripts/st-context.js):
  - installed extension catalog
  - enable/disable without reopening the legacy popup
- Added a React-owned `Extensions` panel in [frontend/src/features/shell/ShellPage.tsx](/Users/hal/.codex/worktrees/dc18/SillyTavern/frontend/src/features/shell/ShellPage.tsx) with:
  - installed extension list
  - enabled/disabled state display
  - toggle controls with explicit reload-required messaging
- Expanded bridge coverage in [frontend/src/test/bridge.test.ts](/Users/hal/.codex/worktrees/dc18/SillyTavern/frontend/src/test/bridge.test.ts) to cover extension listing and toggling.

### Measurable Impact
- Routine extension enable/disable no longer requires opening the legacy extensions popup.
- The visible fallback is used less for configuration/admin surfaces; remaining legacy dependency is now concentrated in update/delete/branch operations and richer editor tools.

### Insights
- Extension toggles are a safe React seam because the legacy code already persists them through `enableExtension(..., false)` and `disableExtension(..., false)`; the main caveat is that changes remain reload-bound.
- Treating reload as explicit UI state is better than trying to partially emulate extension reactivation in React, which would blur responsibility between the shell and the legacy runtime.

### Next
1. Return to a deeper authoring/editor surface, likely structured world-info entry editing, rather than widening admin controls indefinitely.
2. Reevaluate whether the visible fallback iframe should become even more hidden now that prompt and extension configuration are React-owned.

## 2026-03-10 - React Migration Wave 20 (Structured World Info Entry Editor)

### Completed
- Added a React-owned structured lorebook-entry editor on top of the existing raw JSON world-info bridge in [frontend/src/features/shell/ShellPage.tsx](/Users/hal/.codex/worktrees/dc18/SillyTavern/frontend/src/features/shell/ShellPage.tsx).
- Added lightweight supporting styles in [frontend/src/styles/global.css](/Users/hal/.codex/worktrees/dc18/SillyTavern/frontend/src/styles/global.css) for active entry state and select controls.
- Kept the raw JSON editor in place as an explicit fallback for unsupported or niche fields instead of widening the bridge contract.

### Measurable Impact
- Common lorebook-entry workflows now have a React-owned path:
  - list entries
  - select an entry
  - edit core trigger/content fields
  - create an entry
  - delete an entry
- The legacy world-info entry editor is no longer required for routine entry authoring.

### Insights
- World-info entry editing is better handled as a UI layer over the existing JSON document than as a new backend/service contract. The persistence seam was already good; the missing piece was structured editing.
- Keeping the raw JSON view alongside the structured editor avoids a false sense of completeness. React owns the common path, while advanced and less-common fields still remain reachable without blocking migration.

### Next
1. Reassess whether the visible fallback iframe should now be hidden behind an even narrower escape hatch.
2. Move to another high-value authoring surface only if it reduces real legacy dependency rather than adding more shell-adjacent controls.
