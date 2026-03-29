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

## 2026-03-10 - React Migration Wave 21 (Legacy Fallback Drawer)

### Completed
- Replaced the inline visible fallback iframe in [frontend/src/features/shell/ShellPage.tsx](/Users/hal/.codex/worktrees/dc18/SillyTavern/frontend/src/features/shell/ShellPage.tsx) with an explicit on-demand modal drawer.
- Added supporting overlay/header styles in [frontend/src/styles/global.css](/Users/hal/.codex/worktrees/dc18/SillyTavern/frontend/src/styles/global.css).
- Kept the hidden bridge iframe unchanged, so React state sync still depends on the same runtime contract while the visible legacy UI is demoted further.

### Measurable Impact
- The legacy runtime no longer occupies inline page space during normal use.
- React is now visually and structurally the default runtime surface, with legacy UI available only through an explicit escape hatch.

### Insights
- At this stage the highest-value maintainability move is reducing reliance on visible legacy presence, not continuing to add side panels indefinitely.
- Separating the hidden bridge runtime from the visible fallback window keeps compatibility intact while making it clearer which UI is authoritative for common workflows.

### Next
1. Continue only with slices that either remove real legacy dependence or let us eventually remove the visible fallback entirely.
2. Treat new runtime regressions as first-priority fixes before widening the React surface further.

## 2026-03-10 - React Migration Wave 22 (Prompt Reordering Controls)

### Completed
- Extended the typed prompt-management service with explicit reorder actions:
  - [frontend/src/core/contracts.ts](/Users/hal/.codex/worktrees/dc18/SillyTavern/frontend/src/core/contracts.ts)
  - [frontend/src/legacy/bridge.ts](/Users/hal/.codex/worktrees/dc18/SillyTavern/frontend/src/legacy/bridge.ts)
- Exposed bounded prompt move helpers in [public/scripts/st-context.js](/Users/hal/.codex/worktrees/dc18/SillyTavern/public/scripts/st-context.js) using the existing prompt-order list rather than the legacy sortable UI.
- Added React `Move up` / `Move down` controls to the prompt panel in [frontend/src/features/shell/ShellPage.tsx](/Users/hal/.codex/worktrees/dc18/SillyTavern/frontend/src/features/shell/ShellPage.tsx).
- Expanded bridge coverage in [frontend/src/test/bridge.test.ts](/Users/hal/.codex/worktrees/dc18/SillyTavern/frontend/src/test/bridge.test.ts) to cover prompt reorder delegation.

### Measurable Impact
- Prompt ordering now has a React-owned path for common adjustments.
- The legacy prompt manager is needed less for day-to-day prompt work; remaining dependency is mostly import/export and richer popup-based editing.

### Insights
- Directly swapping prompt-order entries is safer than trying to mimic the old sortable widget behavior in React. The runtime already stores prompt order as plain data; React does not need the widget.
- This continues the useful pattern for the modernization: move high-value interactions onto stable data seams, not DOM-driven legacy behavior.

### Next
1. Prioritize runtime smoke testing and regression cleanup over widening the React surface further.
2. Only take another migration slice if it removes a real remaining need for the visible fallback or unlocks deleting legacy UI.

## 2026-03-10 - Stabilization Wave 1 (Configured Entry Smoke Coverage)

### Completed
- Expanded the Playwright smoke suite in [frontend/e2e/smoke.spec.ts](/Users/hal/.codex/worktrees/dc18/SillyTavern/frontend/e2e/smoke.spec.ts) beyond the legacy-login check.
- Added coverage for:
  - the frontend runtime flags endpoint
  - the configured root entry surface at `/`, branching between React shell and legacy app based on `/api/frontend/flags`
- Installed the Playwright Chromium runtime locally and executed the suite against a live local server.

### Measurable Impact
- The branch now has a working smoke gate for the current deployment shape, not just a static login-page reachability check.
- Route regressions in feature-flag serving logic should now surface earlier:
  - wrong root surface for the active flags
  - broken `/api/frontend/flags`
  - broken legacy login reachability

### Insights
- The right smoke assertion is not “React should always render.” The repo still supports both surfaces, so the gate should assert the configured serving path rather than the long-term target state.
- Stabilization has become high leverage. Small missing bindings and route mismatches are now more likely to waste time than the next marginal React panel.

### Next
1. Keep using smoke-first validation before further migration waves.
2. Add one or two higher-value authenticated smoke paths only after deciding which runtime workflow is the next stable contract to protect.

## 2026-03-10 - React Migration Wave 23 (Enable React Frontend By Default)

### Completed
- Enabled the React frontend flags in:
  - [config.yaml](/Users/hal/.codex/worktrees/dc18/SillyTavern/config.yaml)
  - [default/config.yaml](/Users/hal/.codex/worktrees/dc18/SillyTavern/default/config.yaml)
- Expanded the smoke suite in [frontend/e2e/smoke.spec.ts](/Users/hal/.codex/worktrees/dc18/SillyTavern/frontend/e2e/smoke.spec.ts) with an explicit `/legacy` fallback check, since the React shell is now the default root surface.
- Rebuilt the frontend dist and validated the React-default configuration with smoke tests.

### Measurable Impact
- This branch now serves the migrated React shell at `/` by default when the frontend build exists.
- The legacy runtime remains reachable through `/legacy`, and that fallback is now covered by smoke tests.

### Insights
- The migration had reached the point where keeping the React shell disabled by default was obscuring progress and reducing the practical value of testing. Serving React by default on this branch is the correct forcing function now.
- Once React becomes the default surface, fallback reachability matters more than legacy parity at `/`. The smoke suite needs to protect both the new default and the old escape hatch.

### Next
1. Rebuild the frontend dist and validate the React-default boot path with smoke tests.
2. Continue treating runtime regressions as first-priority fixes before widening the React surface again.

## 2026-03-11 - React Migration Wave 24 (Connection-First Shell Layout)

### Completed
- Added connection-profile contracts and bridge support in:
  - [frontend/src/core/contracts.ts](/Users/hal/.codex/worktrees/dc18/SillyTavern/frontend/src/core/contracts.ts)
  - [frontend/src/legacy/bridge.ts](/Users/hal/.codex/worktrees/dc18/SillyTavern/frontend/src/legacy/bridge.ts)
- Reworked the React shell layout in [frontend/src/features/shell/ShellPage.tsx](/Users/hal/.codex/worktrees/dc18/SillyTavern/frontend/src/features/shell/ShellPage.tsx) so connection state is visible above the fold.
- Added dedicated styling for the new connection card in [frontend/src/styles/global.css](/Users/hal/.codex/worktrees/dc18/SillyTavern/frontend/src/styles/global.css).
- Expanded tests in:
  - [frontend/src/test/bridge.test.ts](/Users/hal/.codex/worktrees/dc18/SillyTavern/frontend/src/test/bridge.test.ts)
  - [frontend/e2e/smoke.spec.ts](/Users/hal/.codex/worktrees/dc18/SillyTavern/frontend/e2e/smoke.spec.ts)

### Measurable Impact
- Connection state is now visible at the top of the default React shell instead of being buried behind lower sections or the fallback drawer.
- Saved connection profiles can now be switched directly from React for the common “pick the active backend/profile” workflow.
- The legacy runtime remains the richer editor for creating and editing connection profiles, but routine switching no longer requires it.

### Insights
- This was not just a layout concern. Once React became the default surface, hiding connection setup below the fold made the migrated shell materially less usable than the legacy app.
- The right seam here was not reimplementing the whole connection-manager extension. The legacy runtime already had stable profile data plus a slash-command application path, which is enough for a pragmatic React-owned switching surface.

### Next
1. Decide whether the next connection step should be a fuller React profile editor or a different high-friction workflow.
2. Keep prioritizing usability blockers in the default React path over broad but low-value surface expansion.

## 2026-03-11 - React Migration Wave 25 (Bounded Connection Profile Editor)

### Completed
- Extended connection contracts and bridge support in:
  - [frontend/src/core/contracts.ts](/Users/hal/.codex/worktrees/dc18/SillyTavern/frontend/src/core/contracts.ts)
  - [frontend/src/legacy/bridge.ts](/Users/hal/.codex/worktrees/dc18/SillyTavern/frontend/src/legacy/bridge.ts)
- Added bounded connection-profile persistence methods to [public/scripts/st-context.js](/Users/hal/.codex/worktrees/dc18/SillyTavern/public/scripts/st-context.js), reusing the existing connection-manager settings store and event flow.
- Expanded the React shell in [frontend/src/features/shell/ShellPage.tsx](/Users/hal/.codex/worktrees/dc18/SillyTavern/frontend/src/features/shell/ShellPage.tsx) with a common-fields connection editor:
  - name
  - API
  - server URL
  - model
  - preset
- Added supporting style updates in [frontend/src/styles/global.css](/Users/hal/.codex/worktrees/dc18/SillyTavern/frontend/src/styles/global.css).
- Expanded bridge coverage in [frontend/src/test/bridge.test.ts](/Users/hal/.codex/worktrees/dc18/SillyTavern/frontend/src/test/bridge.test.ts).

### Measurable Impact
- Common connection profile setup no longer requires the legacy connection-manager popup.
- React now owns both of the high-frequency connection workflows:
  - switch a saved profile
  - create/edit/delete a common profile definition
- The remaining legacy dependency is mostly the richer, profile-command-complete editor rather than basic provider setup.

### Insights
- The stable seam was the connection-manager profile store plus the existing event names, not the legacy popup UI. That made it possible to add real editing without duplicating the extension implementation wholesale.
- A bounded editor is the right compromise here. The common path is now React-owned, while advanced profile fields can remain in legacy until they are worth formalizing.

### Next
1. Decide whether to broaden the React connection editor to advanced profile fields or stop here and pivot back to another workflow.
2. Keep default-path usability as the decision rule: migrate what blocks everyday use, not what is merely possible to port.

## 2026-03-11 - React Migration Wave 26 (Advanced Connection Profile Editing)

### Completed
- Extended connection profile contracts and bridge mapping in:
  - [frontend/src/core/contracts.ts](/Users/hal/.codex/worktrees/dc18/SillyTavern/frontend/src/core/contracts.ts)
  - [frontend/src/legacy/bridge.ts](/Users/hal/.codex/worktrees/dc18/SillyTavern/frontend/src/legacy/bridge.ts)
- Expanded [public/scripts/st-context.js](/Users/hal/.codex/worktrees/dc18/SillyTavern/public/scripts/st-context.js) so React can persist mode-specific connection profile fields into the existing connection-manager store while still emitting the legacy profile events.
- Broadened the React connection editor in [frontend/src/features/shell/ShellPage.tsx](/Users/hal/.codex/worktrees/dc18/SillyTavern/frontend/src/features/shell/ShellPage.tsx) with mode-aware advanced fields:
  - chat-completions: proxy preset, prompt post-processing, reasoning template, secret id
  - text-completions: instruct template, instruct mode, context template, tokenizer, reasoning template, secret id
  - shared: start reply with, stop strings
- Expanded bridge coverage in [frontend/src/test/bridge.test.ts](/Users/hal/.codex/worktrees/dc18/SillyTavern/frontend/src/test/bridge.test.ts) for the richer connection profile shape.

### Measurable Impact
- The default React shell now covers most real connection profile authoring, not just common provider fields.
- Existing saved profiles can round-trip their advanced connection-manager fields through the typed React bridge without opening the legacy popup.
- The remaining legacy gap is mostly niche provider-specific UI and command coverage, not the core connection profile workflow.

### Insights
- The practical contract here is the persisted connection-manager profile object, not the popup that edits it. Once that store is treated as the source of truth, React can safely own much more of the workflow.
- The mode split matters. Chat-completions and text-completions profiles have materially different useful knobs, so a single flat editor becomes harder to use than a mode-aware one.

### Next
1. Decide whether to keep widening connection editing into rarer provider-specific fields or stop here and pivot to the next default-path friction point.
2. Keep treating runtime smoke and manual usage issues as the gate before another large migration wave.

## 2026-03-11 - React Migration Wave 27 (Connection Model Picker)

### Completed
- Added typed connection-model support in:
  - [frontend/src/core/contracts.ts](/Users/hal/.codex/worktrees/dc18/SillyTavern/frontend/src/core/contracts.ts)
  - [frontend/src/legacy/bridge.ts](/Users/hal/.codex/worktrees/dc18/SillyTavern/frontend/src/legacy/bridge.ts)
- Exposed model-option lookup through [public/scripts/st-context.js](/Users/hal/.codex/worktrees/dc18/SillyTavern/public/scripts/st-context.js) by reusing the already-populated legacy model controls instead of duplicating provider catalog logic in React.
- Expanded the React connection editor in [frontend/src/features/shell/ShellPage.tsx](/Users/hal/.codex/worktrees/dc18/SillyTavern/frontend/src/features/shell/ShellPage.tsx) with:
  - searchable model filtering
  - clickable model selection
  - model lists scoped to the selected connection API
- Added styling in [frontend/src/styles/global.css](/Users/hal/.codex/worktrees/dc18/SillyTavern/frontend/src/styles/global.css).
- Extended bridge coverage in [frontend/src/test/bridge.test.ts](/Users/hal/.codex/worktrees/dc18/SillyTavern/frontend/src/test/bridge.test.ts).

### Measurable Impact
- The React connection panel no longer forces manual model id entry when the legacy runtime already has a populated model catalog.
- OpenRouter-style workflows now have a usable model search/select path in React instead of relying on the legacy select2 widget.

### Insights
- Reusing the live legacy model controls is the right intermediate seam. It preserves provider-specific formatting and availability without requiring React to understand every model catalog yet.
- The missing model selector was not just a convenience issue. For providers with large catalogs, freeform model entry makes the React path materially worse than the legacy app.

### Next
1. Manually verify the model picker against a real provider flow like OpenRouter on this branch.
2. If it holds up, decide whether to keep this bridge-driven approach for other provider-specific selectors before replacing more of the legacy settings area.

## 2026-03-11 - React Migration Wave 28 (Connection Secret Status And Save Flow)

### Completed
- Added typed connection secret status support in:
  - [frontend/src/core/contracts.ts](/Users/hal/.codex/worktrees/dc18/SillyTavern/frontend/src/core/contracts.ts)
  - [frontend/src/legacy/bridge.ts](/Users/hal/.codex/worktrees/dc18/SillyTavern/frontend/src/legacy/bridge.ts)
- Exposed connection secret status and save/authorize actions in [public/scripts/st-context.js](/Users/hal/.codex/worktrees/dc18/SillyTavern/public/scripts/st-context.js), reusing the legacy `SECRET_KEYS` store and the existing OpenRouter authorization redirect.
- Expanded the React connection panel in [frontend/src/features/shell/ShellPage.tsx](/Users/hal/.codex/worktrees/dc18/SillyTavern/frontend/src/features/shell/ShellPage.tsx) with:
  - current API key status
  - password-field key entry
  - save-key action
  - OpenRouter authorize action
- Expanded bridge coverage in [frontend/src/test/bridge.test.ts](/Users/hal/.codex/worktrees/dc18/SillyTavern/frontend/src/test/bridge.test.ts).

### Measurable Impact
- The React connection panel can now handle the common “provider key is missing” setup path for supported APIs instead of forcing a fallback to the legacy settings UI.
- OpenRouter now has both model selection and authorization surfaced in React.

### Insights
- The useful seam is the legacy secret store, not the old settings form. Once that store is bridged directly, React can own much more of the setup workflow without reimplementing every provider panel.
- This still is not a full “connect/test” flow. It is the credential-management half, which is the higher-friction blocker on the default React path.

### Next
1. Manually verify save and authorize flows against OpenRouter in the React shell.
2. Decide whether the next step should be an explicit connection/apply/test action or more provider-specific settings ownership.

## 2026-03-17 - React Migration Wave 29 (Connection Secret Manager)

### Completed
- Extended connection secret contracts and bridge support in:
  - [frontend/src/core/contracts.ts](/Users/hal/.codex/worktrees/dc18/SillyTavern/frontend/src/core/contracts.ts)
  - [frontend/src/legacy/bridge.ts](/Users/hal/.codex/worktrees/dc18/SillyTavern/frontend/src/legacy/bridge.ts)
- Expanded [public/scripts/st-context.js](/Users/hal/.codex/worktrees/dc18/SillyTavern/public/scripts/st-context.js) so React can:
  - list saved secrets for the selected API
  - add a new secret with an optional label
  - activate a saved secret
  - delete a saved secret
- Reworked the React connection secret panel in [frontend/src/features/shell/ShellPage.tsx](/Users/hal/.codex/worktrees/dc18/SillyTavern/frontend/src/features/shell/ShellPage.tsx) to expose the actual secret-manager workflow instead of a single saved/missing field.
- Added UI styling in [frontend/src/styles/global.css](/Users/hal/.codex/worktrees/dc18/SillyTavern/frontend/src/styles/global.css).
- Expanded bridge tests in [frontend/src/test/bridge.test.ts](/Users/hal/.codex/worktrees/dc18/SillyTavern/frontend/src/test/bridge.test.ts).

### Measurable Impact
- The React connection panel now covers the common secret-manager tasks the legacy UI exposed:
  - add key
  - inspect saved keys
  - activate key
  - delete key
  - bind a saved secret id into the current profile
- This removes one of the more confusing remaining gaps between the React shell and the legacy connection manager.

### Insights
- The `secret-id` field only becomes understandable once the saved-secret list is visible next to it. Exposing that list is more important than preserving a minimal-looking secret card.
- Bridging the legacy secret store directly is still the right approach here. The user-facing problem was not storage, it was missing workflow ownership in React.

### Next
1. Manually verify add/activate/delete secret flows against OpenRouter in the React panel.
2. Revisit whether the next connection step should be explicit apply/test feedback or deeper provider-specific settings ownership.

## 2026-03-17 - React Migration Wave 30 (Legacy-Formatted React Transcript Rendering)

### Completed
- Extended chat message summaries in [frontend/src/core/contracts.ts](/Users/hal/.codex/worktrees/dc18/SillyTavern/frontend/src/core/contracts.ts) with an optional `renderedHtml` field for preformatted transcript output.
- Expanded the legacy bridge in [frontend/src/legacy/bridge.ts](/Users/hal/.codex/worktrees/dc18/SillyTavern/frontend/src/legacy/bridge.ts) so `getMessages()` now reuses the existing legacy `messageFormatting(...)` pipeline when shaping React transcript messages.
- Updated the React chat workspace in [frontend/src/features/shell/ShellPage.tsx](/Users/hal/.codex/worktrees/dc18/SillyTavern/frontend/src/features/shell/ShellPage.tsx) to render formatted transcript HTML instead of printing raw message text.
- Added transcript body styling in [frontend/src/styles/global.css](/Users/hal/.codex/worktrees/dc18/SillyTavern/frontend/src/styles/global.css) so formatted blocks fit the React card layout cleanly.
- Expanded bridge coverage in [frontend/src/test/bridge.test.ts](/Users/hal/.codex/worktrees/dc18/SillyTavern/frontend/src/test/bridge.test.ts) to verify the legacy formatter is invoked and its HTML is carried through the bridge.

### Measurable Impact
- The React chat workspace now uses the same markdown/HTML conversion and sanitization path as the legacy transcript instead of showing raw `**markdown**` or literal HTML snippets.
- System messages that depend on rendered HTML and assistant messages that depend on markdown formatting now have a much closer parity path in React.

### Insights
- Reusing the legacy `messageFormatting(...)` path is the correct seam here. The rendering problem was not missing CSS, it was that React had bypassed the formatter entirely.
- The React transcript should not own a second markdown parser while the legacy runtime remains authoritative for message rendering behavior.

### Next
1. Manually smoke the React transcript with real markdown-heavy and HTML-heavy messages to catch any remaining layout or sanitization mismatches.
2. If needed, tighten transcript-specific CSS around code blocks, blockquotes, and tables rather than introducing a new formatter.

## 2026-03-17 - React Migration Wave 31 (Transcript Autoscroll Stabilization)

### Completed
- Updated the React transcript scroll behavior in [frontend/src/features/shell/ShellPage.tsx](/Users/hal/.codex/worktrees/dc18/SillyTavern/frontend/src/features/shell/ShellPage.tsx) so polling refreshes do not force the viewport back to the bottom on every message snapshot.
- Added transcript stickiness tracking that only keeps auto-scroll active when the user is already near the bottom.
- Changed the auto-scroll effect to react to real tail changes instead of every refreshed `messages` array instance.
- Preserved the expected behavior when auto-scroll is explicitly re-enabled by the user: the transcript jumps once and then resumes stick-to-bottom behavior.

### Measurable Impact
- Scrolling back through chat history in the React workspace no longer gets interrupted every polling cycle.
- New messages still pin to the bottom when the user is already following the live end of the transcript.

### Insights
- The issue was not the polling interval itself. The problem was tying scroll behavior directly to a recreated message array rather than to meaningful transcript tail changes.
- For the React runtime path, scroll policy needs to be user-position aware. "Auto-scroll enabled" should not mean "override manual reading state on every refresh."

### Next
1. Add clearer live connection/apply feedback in the React connection panel so switching profiles gives immediate runtime confirmation.
2. Keep prioritizing default-path usability issues in the React chat workspace before widening more side panels.

## 2026-03-21 - React Migration Wave 32 (Connection Apply Feedback)

### Completed
- Extended the typed connection bridge contract in `frontend/src/core/contracts.ts` so profile application returns an explicit result instead of only firing the legacy command.
- Updated `frontend/src/legacy/bridge.ts` so `connections.applyProfile(...)` now reports:
  - requested profile id/name
  - immediately observed selected profile id/name
  - current runtime API and online status
  - whether the legacy runtime confirmed the requested switch synchronously
- Reworked the React connection panel in `frontend/src/features/shell/ShellPage.tsx` to show apply-state feedback:
  - applying
  - pending runtime confirmation
  - confirmed live
- Added compact styling for the new feedback block in `frontend/src/styles/global.css`.
- Expanded `frontend/src/test/bridge.test.ts` so the apply-profile path verifies the returned confirmation payload and the mocked legacy runtime selection change.
- Installed frontend workspace dependencies in this worktree and reran `npm run typecheck` and `npm run test`.

### Measurable Impact
- Switching saved connection profiles in React no longer relies entirely on the user noticing the general runtime snapshot update on the next poll.
- The React shell can now tell the user whether the requested profile switch was immediately confirmed by the bridged legacy runtime or is still waiting for confirmation.

### Insights
- The missing UX piece was not another editor field. The gap was that the apply action had no typed success payload, so the UI could not distinguish "command fired" from "runtime switched."
- Returning a small verification object from the bridge keeps the React shell honest about what was actually observed, while still preserving the existing legacy slash-command seam.

### Next
1. Manually smoke the React connection switch flow against a real provider setup to confirm the returned runtime API/profile data stays accurate outside the test harness.
2. If needed, add the same explicit verification treatment to other high-friction bridge actions that currently rely on polling-only confirmation.

## 2026-03-21 - Stabilization Wave 2 (Shell Connection Apply UI Coverage)

### Completed
- Added a focused `ShellPage` test harness in `frontend/src/test/ShellPage.test.tsx` that mocks the iframe bridge seam instead of standing up the full frontend app.
- Added targeted React UI coverage for connection profile apply feedback:
  - in-flight `applying` state
  - `pending` state when the bridge cannot confirm the switch immediately
  - transition to `confirmed` once the runtime snapshot catches up
- Cleaned up the async test flow so the deferred apply promise resolves inside React `act(...)`.
- Reran `npm run typecheck` and `npm run test` after the UI test addition.

### Measurable Impact
- The new connection apply feedback is now protected at both layers:
  - bridge contract level
  - rendered shell behavior level
- Regressions where the shell stops surfacing `applying`, `pending`, or `confirmed` states should now fail in frontend tests rather than being caught only by manual use.

### Insights
- The iframe bridge load path is testable without bringing up the whole app router or backend flags flow, which makes this a practical seam for other shell-surface tests.
- For this branch, targeted UI tests on top of a mocked bridge give a better risk/effort tradeoff than jumping straight to broader E2E coverage for every shell interaction.

### Next
1. Manually smoke the live connection switch flow with a real provider/runtime to validate the same states outside the mocked bridge harness.
2. Reuse the same mocked bridge harness pattern for other high-friction shell interactions that currently depend on runtime polling or delayed confirmation.

## 2026-03-21 - Monolith Reduction Wave 37 (Past Chat Lifecycle Move)

### Completed
- Moved the past-chat/session-details cluster out of `public/script.js` into `public/scripts/chat-operations-core.js`:
  - `getPastCharacterChats(...)`
  - `getCurrentChatDetails()`
  - `displayPastChats()`
  - the internal chat-search/render helper used by the manage-chat-files view
- Updated `public/script.js` to keep thin exported wrappers that delegate to `chat-operations-core`.
- Removed now-redundant `bindChatOperationsCore(...)` bindings for `displayPastChats` and `getCurrentChatDetails`, since those implementations now live in the core directly.
- Verified syntax for the touched legacy JS files with `node --check`.

### Measurable Impact
- `public/script.js` no longer owns the manage-chat-files display flow or the current-session detail helper that other orchestration paths reuse.
- The chat-operations core now owns a fuller slice of chat lifecycle behavior rather than only wrapping DOM/message primitives.

### Insights
- This was a good next extraction seam because it is cohesive, frequently reused, and only lightly coupled to the rest of the generation/runtime pipeline.
- The right follow-up is another chat/session lifecycle batch, not another small helper. The remaining value is in draining orchestration ownership from `script.js`, not micro-extracting utilities.

### Next
1. Continue with another coherent chat/session orchestration batch, likely around character/group selection side effects or chat-file lifecycle actions.
2. After another one or two such waves, reassess whether the remaining `script.js` ownership is mostly bootstrap/export glue versus still-meaningful runtime behavior.

## 2026-03-21 - Monolith Reduction Wave 38 (Character Deletion Lifecycle Move)

### Completed
- Moved the character deletion lifecycle out of `public/script.js` into `public/scripts/character-core.js`:
  - `deleteCharacter(...)`
  - the post-delete UI cleanup flow that refreshes chat/session state after deletion
- Updated `public/script.js` to keep a thin exported wrapper that delegates to `character-core`.
- Rewired `bindCharacterCore(...)` so the core now receives the narrower dependencies it still needs for deletion cleanup:
  - current chat id lookup
  - past-character-chat lookup
  - neutral-chat preservation/restore hooks
  - session reset hook
  - settings debounce trigger
- Removed the now-redundant `deleteCharacter` implementation body and local post-delete cleanup helper from `public/script.js`.
- Verified syntax for the touched legacy JS files with `node --check`.

### Measurable Impact
- `public/script.js` no longer owns one of the larger remaining character lifecycle flows.
- Character deletion now lives beside other character-domain behavior in `character-core` instead of in the monolith.

### Insights
- This confirms the next productive pattern: move cohesive orchestration batches into the nearest domain core, then pass only the minimal remaining UI/runtime hooks through bindings.
- The remaining high-value monolith work is now less about helper extraction and more about draining these multi-step lifecycle paths from `script.js`.

### Next
1. Continue with another character/session lifecycle batch, likely character selection/editor side effects or chat-file rename/delete flows.
2. Reassess whether `script.js` is approaching a “bootstrap plus export wrappers” state after one or two more waves like this.

## 2026-03-21 - Monolith Reduction Wave 39 (Chat File Lifecycle Move)

### Completed
- Moved the core chat-file lifecycle flow out of `public/script.js` into `public/scripts/chat-operations-core.js`:
  - `delChat(...)`
  - `deleteCharacterChatByName(...)`
  - `replaceCurrentChat()`
  - `saveChatConditional()`
- Kept `public/script.js` as thin wrappers/exports for those paths so existing callers and bindings continue to work without importing the monolith directly.
- Rewired `bindChatOperationsCore(...)` so the core now receives only the remaining runtime hooks it still needs:
  - mirrored chat-metadata setter
  - mirrored `isChatSaving` setter
  - character-save debounce trigger
  - remote chat rename hook
- Verified syntax for the touched legacy JS files with `node --check`.

### Measurable Impact
- `public/script.js` no longer owns the main character-chat delete/replace/save orchestration path.
- `chat-operations-core` now owns a more coherent slice of chat session file lifecycle behavior instead of only message rendering and wrappers.

### Insights
- The mirrored state still present between `script.js` and the extracted cores means some moves need explicit setter hooks rather than direct core-only mutation.
- Even with that constraint, cohesive lifecycle batches are still moving cleanly if the bindings are narrowed to just the few state-bridge hooks that remain.

### Next
1. Continue draining `public/script.js` with another chat/session orchestration batch, most likely chat rename flows or character selection side effects.
2. Reassess whether the remaining monolith ownership is now mostly bootstrap/event wiring plus a shrinking set of UI-side orchestration paths.

## 2026-03-21 - Monolith Reduction Wave 40 (Character Editor Selection Flow Move)

### Completed
- Moved the character editor/right-menu selection flow out of `public/script.js` into `public/scripts/session-core.js`:
  - `selectRightMenuWithAnimation(...)`
  - `select_rm_info(...)`
  - `select_selected_character(...)`
  - `select_rm_create(...)`
  - `select_rm_characters()`
- Rewired `bindSessionCore(...)` so `session-core` now receives only the remaining helper hooks it still needs from the legacy bootstrap:
  - creator notes formatting
  - world-info button/embed checks
  - external media allowance lookup
  - avatar file preload reader
  - favorite button DOM updater
  - filtered entity list lookup / character list printing
  - selected-button / per-page state reads
- Reduced `public/script.js` to thin wrappers for those flows instead of keeping the full DOM orchestration bodies there.
- Verified syntax for the touched legacy JS files with `node --check` via `mise`.

### Measurable Impact
- `public/script.js` no longer owns the main character editor selection/menu lifecycle.
- `session-core` now owns a more coherent slice of character/session UI orchestration instead of only session switching helpers.

### Insights
- This batch confirmed that `session-core` is the right home for these “which panel/state should be active now?” behaviors, even when they still need a handful of DOM helper callbacks from the bootstrap layer.
- The remaining monolith code is increasingly concentrated in event wiring and smaller UI helper pockets, which makes future extraction batches less risky.

### Next
1. Continue with another coherent UI/session batch, likely chat rename flows or smaller residual character-panel helper ownership.
2. Reassess whether `public/script.js` is now close to “bootstrap/event wiring plus wrappers” rather than containing major lifecycle logic.

## 2026-03-21 - Monolith Reduction Wave 41 (Past Chat Delete Flow Move)

### Completed
- Moved the past-chat delete orchestration out of `public/script.js` into `public/scripts/session-core.js`:
  - close past chat popup
  - dispatch group vs character chat deletion
  - loader handling
  - slash-command vs UI reopen behavior
- Reduced the inline `handleDeleteChat(...)` body in `public/script.js` to a thin call into `session-core`.
- Verified syntax for the touched legacy JS files with `node --check` via `mise`.

### Measurable Impact
- Another multi-step UI/session lifecycle no longer lives in the monolith.
- The remaining past-chat event handlers in `public/script.js` are now mostly confirmation/wiring glue rather than owning delete behavior.

### Insights
- `session-core` is continuing to absorb the “user chose an operation, now coordinate the right UI/session side effects” logic cleanly.
- The next productive reductions are increasingly about removing these small orchestration islands rather than large domain bodies.

### Next
1. Continue with the remaining small orchestration helpers in `public/script.js`, likely `updateFavButtonState(...)` and other residual character-panel state glue.
2. Reassess whether some of the remaining wrapper-only exports can be collapsed once the adapters are fully on the extracted cores.

## 2026-03-21 - Monolith Reduction Wave 42 (Favorite Button State Move)

### Completed
- Moved the character favorite-button state updater out of `public/script.js` into `public/scripts/character-core.js`:
  - `updateFavButtonState(...)`
- Updated `public/scripts/session-core.js` to consume the character-core helper directly instead of receiving a callback from the bootstrap layer.
- Removed the redundant monolith-local `fav_ch_checked` mirror from `public/script.js` and switched the click handler to read the exported character-core state.
- Verified syntax for the touched legacy JS files with `node --check` via `mise`.

### Measurable Impact
- One more piece of character-panel state is now owned by `character-core` instead of duplicated in `script.js`.
- `session-core` now depends on one fewer bootstrap callback for its character editor flows.

### Insights
- Some remaining monolith cleanup is less about moving large lifecycle paths and more about deleting these duplicated local mirrors as the extracted cores become the real state owners.
- This also makes the next larger moves safer, because there are fewer bootstrap-only state copies left to keep in sync.

### Next
1. Reassess the next meaningful extraction batch from `public/script.js`, with character list/entity rendering still looking like one of the largest remaining ownership clusters.
2. Continue draining small duplicated state helpers when they clearly belong to an extracted core already.

## 2026-03-21 - Monolith Reduction Wave 43 (Character List Rendering Move)

### Completed
- Moved the character/entity list rendering and entity-list construction flow out of `public/script.js` into `public/scripts/character-core.js`:
  - `printCharacters(...)`
  - `getEntitiesList(...)`
  - `characterToEntity(...)`
  - `groupToEntity(...)`
  - `tagToEntity(...)`
  - list/pagination helpers and search-sort visibility handling used only by that flow
- Reduced `public/script.js` to thin wrappers for those exports and removed the monolith-local character list pagination state.
- Kept the extracted logic leaning on already modular helpers from tags/groups/persona modules rather than re-embedding new monolith dependencies.
- Verified syntax for the touched legacy JS files with `node --check` via `mise`.

### Measurable Impact
- One of the largest remaining non-bootstrap ownership clusters has been drained out of `public/script.js`.
- Character list rendering, entity construction, and bogus-folder-aware filtering now live in `character-core`, which is the more natural long-term owner for that behavior.

### Insights
- This was the first post-bootstrap batch large enough that it materially changes the remaining shape of `public/script.js`; what is left is increasingly concentrated in generation, chat editing, and startup/event wiring.
- The extraction worked cleanly because the supporting list/filter logic had already been modularized elsewhere, so `character-core` could compose those modules directly instead of depending on the monolith.

### Next
1. Reassess the next largest ownership cluster still in `public/script.js`, likely in generation/chat-editing flows rather than character/session selection now.
2. Continue removing any remaining duplicated bootstrap-local state that was only supporting these extracted list/editor flows.

## 2026-03-24 - Monolith Reduction Wave 44 (Message Swipe/View Helper Move)

### Completed
- Moved the message swipe/view helper cluster out of `public/script.js` into `public/scripts/message-core.js`:
  - `syncMesToSwipe(...)`
  - `syncSwipeToMes(...)`
  - `showSwipeButtons()`
  - `hideSwipeButtons()`
  - `deleteSwipe(...)`
  - `updateViewMessageIds(...)`
  - `getFirstDisplayedMessageId()`
  - `updateEditArrowClasses()`
  - `closeMessageEditor(...)`
- Reduced the corresponding `public/script.js` exports/helpers to thin delegates into `message-core`.
- Removed the now-stale `bindMessageCore(...)` bootstrap bindings for `closeMessageEditor`, `getFirstDisplayedMessageId`, and `syncMesToSwipe`.
- Updated the remaining `this_edit_mes_id` write sites in `public/script.js` to also sync `message-core`'s `editedMessageId` state, so the extracted editor helpers keep using the real active edit target.
- Verified syntax for the touched legacy JS files with `node --check` via `mise`.

### Measurable Impact
- `message-core` now owns a real behavior slice instead of being mostly a wrapper surface around monolith message helpers.
- The chat-editing/view layer in `public/script.js` lost another cohesive pocket of DOM/state behavior, leaving more of the remaining monolith weight concentrated in message edit flows and startup/event wiring.

### Insights
- The main risk in this batch was not the helper logic itself; it was the split ownership of `this_edit_mes_id`. Promoting `message-core`'s `editedMessageId` to stay in sync with the remaining monolith writes was the key step that made the extraction safe.
- This confirms the message-edit/swipe area can keep moving incrementally into `message-core` without having to migrate the whole edit lifecycle in one shot.

### Next
1. Continue with the remaining message-edit cluster in `public/script.js`, especially `openMessageDelete(...)`, `messageEditAuto(...)`, and `messageEditDone(...)`.
2. After that, reassess whether the next best reduction is deeper message-edit ownership or a separate startup/event-wiring cleanup pass.

## 2026-03-24 - Monolith Reduction Wave 45 (Message Edit Lifecycle Move)

### Completed
- Moved the main message edit/update helpers out of `public/script.js` into `public/scripts/message-core.js`:
  - the shared edited-message update path
  - `messageEditAuto(...)`
  - `messageEditDone(...)`
- Shifted the regex cleanup, bias extraction, macro cleanup, metadata tainting, message re-render, and message-updated event flow for edits into `message-core`.
- Reduced the remaining `public/script.js` edit handlers to thin wrappers that pass the current edited message name/id into the extracted core helpers.
- Kept the monolith-local `this_edit_mes_chname` for now, but used the already-synced `editedMessageId` state in `message-core` to keep edit completion behavior coherent.
- Verified syntax for the touched legacy JS files with `node --check` via `mise`.

### Measurable Impact
- `message-core` now owns not only message swipe/view helpers, but also a substantial piece of the message edit lifecycle itself.
- The message-edit region in `public/script.js` is shrinking from “real implementation” toward “legacy event wiring plus compatibility wrappers.”

### Insights
- The edit lifecycle could move cleanly once the edited message id was synchronized into `message-core`; the remaining local coupling is mostly around delete-mode state and edit-name setup rather than the actual edit/save behavior.
- This reduces the risk of future React or modular message tooling accidentally depending on monolith-only edit internals, because the core now contains the normalization and rerender path.

### Next
1. Continue with the remaining delete-mode helper in `public/script.js`, especially `openMessageDelete(...)` and the local delete-state ownership around `this_del_mes` / `is_delete_mode`.
2. Reassess whether the next best reduction is finishing the rest of the message-edit/delete cluster or switching to startup/event-wiring cleanup once that slice is mostly hollowed out.

## 2026-03-25 - Monolith Reduction Wave 46 (Message Delete Mode Move)

### Completed
- Moved the remaining message delete-mode lifecycle out of `public/script.js` into `public/scripts/message-core.js`:
  - `openMessageDelete(...)`
  - delete target selection/range highlighting
  - cancel delete mode
  - confirm delete mode
  - delete-mode state ownership
- Added core-owned delete-mode state in `message-core` and removed the monolith-local `is_delete_mode` / `this_del_mes` variables from `public/script.js`.
- Reduced the `public/script.js` click handlers for:
  - message-row delete selection
  - delete cancel
  - delete confirm
  - edit-button guard while in delete mode
  to thin delegates into `message-core`.
- Updated the `bindChatOperationsCore(...)` bootstrap seam to read delete-mode state from `message-core` instead of monolith-local state.
- Verified syntax for the touched legacy JS files with `node --check` via `mise`.

### Measurable Impact
- The remaining message delete-mode behavior no longer lives in `public/script.js`; the monolith now mostly wires DOM events into core-owned message edit/delete helpers.
- `message-core` now owns the full local message edit/delete surface except for some event registration glue in the bootstrap layer.

### Insights
- Once the edited-message lifecycle had already moved, the delete-mode flow could follow cleanly because it depended on the same DOM neighborhood and message-core state rather than broader app bootstrap concerns.
- This noticeably improves the shape of `public/script.js`: the message area is increasingly “legacy event hookup” rather than “message behavior implementation.”

### Next
1. Reassess the next largest real-ownership cluster still left in `public/script.js`, likely message editor UI entry/cancel handlers or a different startup/event-wiring pocket.
2. Continue collapsing wrapper-only or state-only monolith remnants when the extracted cores already own the behavior.

## 2026-03-25 - Monolith Reduction Wave 47 (Message Edit Entry/Cancel Move)

### Completed
- Moved the message editor entry and cancel lifecycle out of `public/script.js` into `public/scripts/message-core.js`:
  - begin message edit / initialize textarea UI
  - carry edited message display-name state
  - cancel message edit / restore rendered message
- Added core-owned edited message name state in `message-core` and removed the monolith-local `this_edit_mes_chname` variable from `public/script.js`.
- Reduced the `.mes_edit` and `.mes_edit_cancel` handlers in `public/script.js` to thin delegates into `message-core`, while keeping the high-level “is editing allowed here?” gate in the bootstrap layer.
- Kept the extracted edit lifecycle internally consistent with the already moved edit/done helpers by letting `message-core` own both the edited id and edited display name.
- Verified syntax for the touched legacy JS files with `node --check` via `mise`.

### Measurable Impact
- The message edit/delete slice in `public/script.js` is now mostly reorder/copy/delete wiring rather than edit lifecycle implementation.
- `message-core` now owns the full message edit state surface, not just the save path.

### Insights
- Once delete mode and edit completion were already in `message-core`, moving edit entry/cancel mainly required migrating the display-name state to the same module.
- This makes the remaining message-related monolith code much more obviously “UI hookup” code, which should make the next extractions less error-prone.

### Next
1. Reassess whether the next best reduction is message reorder/copy/delete handlers or a different concentrated ownership pocket elsewhere in `public/script.js`.
2. Continue trimming wrapper-only message helpers now that `message-core` owns essentially all edit state.

## 2026-03-25 - Monolith Reduction Wave 48 (Message Reorder/Copy/Delete Move)

### Completed
- Moved the remaining message editor action handlers out of `public/script.js` into `public/scripts/message-core.js`:
  - move edited message up
  - move edited message down
  - copy edited message
  - delete edited message
- Shifted the confirmation popup, reorder DOM swaps, copy insertion, swipe-delete fallback, delete rerender/update flow, and edited-message state cleanup into `message-core`.
- Reduced the `.mes_edit_up`, `.mes_edit_down`, `.mes_edit_copy`, and `.mes_edit_delete` handlers in `public/script.js` to thin delegates into `message-core`.
- Verified syntax for the touched legacy JS files with `node --check` via `mise`.

### Measurable Impact
- The message editing/deletion area in `public/script.js` is now almost entirely event registration and tiny delegate wrappers.
- `message-core` now owns nearly the full local message action surface, including edit lifecycle, delete mode, reorder, copy, and delete behaviors.

### Insights
- This batch effectively finishes the high-value message extraction work: the remaining message code in `script.js` is much closer to bootstrap glue than true implementation.
- The remaining cleanup in this slice is mostly wrapper collapse and deciding whether those last tiny delegates should stay for compatibility or be folded into direct event-to-core calls later.

### Next
1. Reassess whether to finish the last small message wrappers in `public/script.js` or switch to another dense ownership cluster with higher leverage.
2. If staying in the message slice, consider collapsing the remaining `messageEditAuto(...)` / `messageEditDone(...)` delegates once compatibility requirements are clear.

## 2026-03-25 - Monolith Reduction Wave 49 (Character Editor Popup Move)

### Completed
- Moved the character editor popup/helper cluster out of `public/script.js` into `public/scripts/character-core.js`:
  - character world selector popup
  - alternate greetings popup
  - alternate greeting row add/delete helper logic
  - alternate greetings empty-state hint handling
- Reduced `public/script.js` to thin wrappers for `openCharacterWorldPopup()` and `openAlternateGreetings()`.
- Kept the popup logic close to `createOrEditCharacter(...)`, which is already owned by `character-core`, so world selection and alternate greeting edits now live beside the character save flow they depend on.
- Verified syntax for the touched legacy JS files with `node --check` via `mise`.

### Measurable Impact
- `public/script.js` lost another mid-sized UI ownership pocket instead of just another handful of wrappers.
- Character editor popup behavior is now more coherently owned by `character-core`, which already contains the surrounding character create/edit lifecycle.

### Insights
- This was a better “bigger bite” than forcing the swipe/generation seam immediately, because the dependencies were already aligned with `character-core`.
- The remaining monolith is still large, but it is increasingly concentrated in generation, import flows, and general startup/event wiring rather than these editor-specific helper islands.

### Next
1. Continue with another dense character-editor/import cluster or switch to a larger runtime seam like swipe/generation if the dependency surface looks acceptable.
2. Keep preferring clusters that already have a natural home in an extracted core rather than forcing larger cross-core moves too early.

## 2026-03-25 - Monolith Reduction Wave 50 (Character/Chat Import Move)

### Completed
- Moved the character import flow out of `public/script.js` into `public/scripts/character-core.js`:
  - `importCharacter(...)`
  - `importCharactersTags(...)`
  - `selectImportedChar(...)`
  - `processDroppedFiles(...)`
- Moved the character chat import POST/refresh helper out of `public/script.js` into `public/scripts/chat-operations-core.js`:
  - `importCharacterChat(...)`
- Reduced the remaining `public/script.js` import helpers to thin forwarding wrappers, so the monolith now mainly owns the DOM event registration for those flows rather than the behavior itself.
- Kept the existing runtime contracts intact by reusing the already-bound `getCharacters(...)` and `select_rm_info(...)` seams in `character-core` instead of introducing new cross-module wiring.
- Verified syntax for the touched legacy JS files with `node --check` via `mise`.

### Measurable Impact
- Another contiguous import/export ownership pocket is now out of `public/script.js`, which is down again and further concentrated around startup/event wiring and larger runtime seams.
- Character import behavior now lives beside the rest of the character create/edit logic, and chat import refresh behavior now lives beside the past-chat/session operations it depends on.

### Insights
- This was a safer “larger bite” than pushing immediately into generation-coupled code: the import flows already had natural homes in extracted cores and required no new risky state synchronization.
- Reusing the existing `select_rm_info(...)` and `getCharacters(...)` bindings kept the move simple and avoided the kind of top-level initialization regression that showed up in the earlier debounce-binding fixes.

### Next
1. Continue with the next dense import/editor cluster if it still has a clear core home, or switch to startup/event-wiring reduction once the remaining feature pockets become too cross-cutting.
2. Reassess whether `importFromURL(...)` and adjacent drag/drop character import glue should follow the character import move, or whether the better next leverage is elsewhere in the bootstrap layer.

## 2026-03-26 - Monolith Reduction Wave 51 (Character List Search/UI Move)

### Completed
- Moved the remaining character-list search and view-toggle helpers out of `public/script.js` into `public/scripts/character-core.js`:
  - `initCharacterSearch()`
  - `doCharListDisplaySwitch()`
- Reduced `public/script.js` to thin forwarding wrappers for those list/UI helpers while leaving the event registration in place.
- Kept the move within `character-core` because the helpers already depend on the same character filter/search/settings state used by list rendering.
- Verified syntax for the touched legacy JS files with `node --check` via `mise`.

### Measurable Impact
- Another character-list bootstrap pocket no longer lives in `public/script.js`; the monolith owns less direct filter/search implementation and more pure wiring.
- The search-bar visibility persistence and character-grid toggle now live beside the list/filtering logic they affect.

### Insights
- This was a safer follow-up than forcing the mixed external content import path, because the search and view-toggle helpers already sit squarely in the character-list domain.
- The remaining import/bootstrap logic is now more clearly separated from character list state management, which should make the next reduction target easier to identify.

### Next
1. Reassess the mixed external content import / drag-drop URL path separately from character list concerns.
2. Continue targeting cohesive feature pockets with a natural core home before taking on the broader startup/event-wiring seam.

## 2026-03-26 - Monolith Reduction Wave 52 (External Content Import Split)

### Completed
- Split the mixed external content import and drag/drop URL helpers out of `public/script.js` into a new focused module: `public/scripts/content-import-core.js`.
- Moved:
  - `importFromURL(...)`
  - the external URL/UUID content import workflow that resolves imported content into character-card or lorebook handling
- Reduced the remaining `public/script.js` behavior to:
  - a thin `importFromURL(...)` forwarding wrapper
  - the `.external_import_button` event registration that delegates into the new core
- Kept this logic out of `character-core` on purpose, because the flow handles both character imports and lorebook imports and did not belong cleanly in a character-only module.
- Verified syntax for the touched legacy JS files with `node --check` via `mise`.

### Measurable Impact
- `public/script.js` lost another mixed-responsibility import block instead of accumulating more unrelated helper code.
- The external content import path now has an explicit home, which should make future React or modular import UI work easier to route without touching the monolith.

### Insights
- Creating a focused import module was cleaner than forcing this code into `character-core`, because the workflow spans multiple content types and would otherwise blur module ownership.
- This reduces one of the more awkward “not really character, not really chat” islands in `script.js`, which helps the remaining monolith surface look more like bootstrap glue than feature logic.

### Next
1. Reassess whether the next best target is another mixed bootstrap helper cluster or a bigger feature seam such as character rename.
2. Keep preferring extractions that clarify ownership, even if that means introducing a new focused module instead of stuffing unrelated behavior into an existing core.

## 2026-03-26 - Monolith Reduction Wave 53 (Advanced Character Popup Move)

### Completed
- Moved the advanced character popup lifecycle out of `public/script.js` into `public/scripts/character-core.js`:
  - `toggleAdvancedCharacterPopup()`
  - `closeAdvancedCharacterPopup(...)`
- Reduced the `#advanced_div`, `#character_cross`, and `#character_popup_ok` handlers in `public/script.js` to thin delegates into `character-core`.
- Removed the monolith-local `is_advanced_char_open` state and let `character-core` own that popup-open lifecycle state instead.
- Reused the shared animation values from `ui-core` rather than introducing another one-off binding just for this popup behavior.
- Verified syntax for the touched legacy JS files with `node --check` via `mise`.

### Measurable Impact
- `public/script.js` lost another self-contained popup behavior island and is a bit closer to pure event wiring in the character editor area.
- Character editor popup behavior is now more centralized in `character-core`, alongside the rest of the character editing helpers.

### Insights
- This was a cleaner follow-up than forcing the larger rename seam immediately, because the dependencies were limited to jQuery selectors and shared UI animation state.
- Pulling in `animation_duration` and `animation_easing` from `ui-core` avoided creating another fragile hand-rolled bridge in `script.js`.

### Next
1. Reassess the next cohesive character-editor or bootstrap helper cluster before taking on a larger stateful seam like character rename.
2. Keep preferring moves where `script.js` only needs to keep DOM event registration after extraction.

## 2026-03-26 - Monolith Reduction Wave 54 (Character Rename Move)

### Completed
- Moved the full character rename lifecycle out of `public/script.js` into `public/scripts/character-core.js`:
  - `renameCharacter(...)`
  - the internal past-chat rename/update flow
- Extended `bindCharacterCore(...)` with the session-facing hooks the rename flow actually needs:
  - current active character lookup
  - active character update
  - character id reset
  - character reselection
  - current chat reload
  - group-member rename propagation
- Reduced `public/script.js` to a thin `renameCharacter(...)` forwarding wrapper and removed the redundant monolith-local `renamePastChats(...)` implementation.
- Preserved the existing safety behavior where the current character id is cleared before `getCharacters()` reloads, so the old avatar is not treated as a missing active selection and forced into the reload/error path.
- Verified syntax for the touched legacy JS files with `node --check` via `mise`.

### Measurable Impact
- `public/script.js` dropped by roughly 170 lines in a single extraction and no longer owns one of the bigger remaining character-management behaviors.
- `character-core` now owns not just character creation/import/editor helpers, but also the rename lifecycle and its past-chat update behavior.

### Insights
- The important detail in this move was not the fetch call itself; it was preserving the existing selection/reset choreography around `getCharacters()` so rename does not trip the “active character disappeared” reload guard.
- Passing a few session hooks through `bindCharacterCore(...)` was cleaner than importing `session-core` directly and risking a circular dependency in a high-traffic path.

### Next
1. Reassess whether the next best target is another substantial character-management seam or a broader startup/bootstrap cluster.
2. Keep using explicit bindings for session-owned side effects when a feature naturally belongs in `character-core` but still needs to coordinate with selection state.

## 2026-03-26 - Startup Regression Follow-up (Slash Command Cycle Fixes)

### Completed
- Fixed a set of browser-startup module initialization regressions that surfaced after the recent extraction waves:
  - removed `SlashCommandParser` startup dependencies on `power_user`, `MacrosParser`, and the heavy `SlashCommandCommonEnumsProvider` import path
  - converted type-only `SlashCommand` imports in `SlashCommandClosure.js` and `SlashCommandExecutor.js` into inline JSDoc `import(...)` references so they no longer participate in runtime module loading
  - delayed `i18n.js` access to `power-user.js` and `secrets.js` until `initLocales()` instead of pulling those modules in at top-level parser startup
  - restored the missing `debounce` import in `character-core.js` for `initCharacterSearch()`
- Preserved the existing public behavior and call sites instead of redesigning slash-command initialization:
  - `power_user` and `MacrosParser` are still exposed for the rest of the app, but `SlashCommandParser` now reads them through `globalThis` only when needed
  - the parser’s built-in boolean/on-off enum lists are now created locally where that was enough to avoid another runtime cycle
- Verified syntax on all touched files with `node --check` via `mise`.

### Measurable Impact
- The app now gets through browser startup again after the recent extraction work.
- The slash-command parser path is less brittle at module-evaluation time because it no longer eagerly traverses several heavy runtime modules just to construct parser helpers.

### Insights
- These fixes were intentionally targeted as startup bug repairs, not another broad modernization pass; the goal was to break import cycles with the smallest behavior-preserving changes possible.
- Some of the remaining legacy fragility is in module evaluation order rather than function behavior, so syntax-only verification is not enough after extraction waves that move helpers across files.

### Next
1. Keep an eye on startup/runtime regressions immediately after future `script.js` extractions, especially when moved code depends on utilities that were previously imported only by the monolith.
2. Resume monolith reduction with the user’s stated constraint in mind: prefer relocations and compatibility-preserving fixes over internal rewrites that make upstream equivalence harder to demonstrate.

## 2026-03-26 - Monolith Reduction Wave 55 (Drawer UI Helper Move)

### Completed
- Moved the drawer-open helper pair out of `public/script.js` into `public/scripts/ui-core.js`:
  - `doDrawerOpenClick()`
  - `doNavbarIconClick()`
- Kept `public/script.js` compatibility wrappers in place so existing event registration and `session-core` bindings still call the same exported function names.
- Extended `bindUiCore(...)` just enough for the moved implementation to keep using existing legacy helpers without re-importing broader modules:
  - `delay(...)`
  - `favsToHotswap(...)`
  - `resetScrollHeight(...)`
- Verified syntax for the touched files with `node --check` via `mise`.

### Measurable Impact
- `public/script.js` lost another self-contained DOM/UI behavior block and is slightly closer to bootstrap/event wiring in the navigation area.
- Drawer behavior now lives with the rest of the standalone UI helpers instead of staying mixed into the monolith.

### Insights
- This was a lower-risk extraction than another character or slash-command seam because the behavior is mostly DOM class toggling plus a few well-defined helper calls.
- Keeping the `script.js` wrappers preserves current call paths for `session-core` and legacy modules, which keeps the equivalence story simpler for future upstream comparison.

### Next
1. Reassess whether the next low-risk extraction should stay in startup/UI bootstrap territory or move back to a larger feature seam.
2. Keep preferring batches where `script.js` can retain only wrappers and event hookup after the move.

## 2026-03-26 - Monolith Reduction Wave 56 (Debug Registration Move)

### Completed
- Moved the local debug-menu registration cluster out of `public/script.js` into a new focused module: `public/scripts/debug-core.js`.
- Relocated the `addDebugFunctions()` implementation intact, including:
  - force-onboarding reset
  - token-count backfill
  - generation test helper
  - event-tracing toggle
  - regenerate-warning toggle
  - setup-copy helper
- Kept `public/script.js` as a thin wrapper and bound only the small pieces of legacy-local state the moved logic still needed:
  - `getContext()`
  - `settings`
  - the first-run/save-settings onboarding reset path
- Verified syntax for the touched files with `node --check` via `mise`.

### Measurable Impact
- `public/script.js` lost another self-contained initialization block instead of continuing to accumulate app-level debug/setup helpers.
- Debug-menu registrations now have an explicit home outside the monolith, which should make future cleanup of `firstLoadInit()` easier to reason about.

### Insights
- A small dedicated module was cleaner here than forcing the debug registrations into `power-user.js`, because the behavior depends on several app features but is not itself a power-user setting.
- Keeping the wrapper in `script.js` avoids changing the startup call path while still removing the implementation body from the monolith.

### Next
1. Reassess whether to keep working through startup/bootstrap helpers or switch back to a denser feature seam.
2. Continue preferring focused modules for mixed-but-cohesive helper clusters instead of expanding unrelated existing cores.

## 2026-03-26 - Monolith Reduction Wave 57 (Startup UI Helper Follow-up)

### Completed
- Moved two tiny startup/UI helpers out of `public/script.js` into `public/scripts/ui-core.js`:
  - `fixViewport()`
  - `initStandaloneMode()`
- Kept the `public/script.js` wrappers so `firstLoadInit()` still reads the same way and call flow remains easy to compare against earlier revisions.
- Reused the `delay(...)` binding already added for the drawer extraction, so this follow-up did not need another seam or new startup-specific wiring.
- Verified syntax for the touched files with `node --check` via `mise`.

### Measurable Impact
- `public/script.js` dropped a little more startup/UI implementation detail and is incrementally closer to orchestration rather than direct DOM helper ownership.
- `ui-core.js` now owns a slightly more complete set of generic UI lifecycle helpers instead of leaving one-off viewport/PWA behavior in the monolith.

### Insights
- This was a small move, but it fit naturally after the drawer extraction because the helpers depend on the same UI-level concerns and no app-domain state.
- Keeping these tiny wrappers in `script.js` maintains traceability while still shrinking the monolith body.

### Next
1. Decide whether the next pass should stay in startup/bootstrap cleanup or return to a larger domain seam now that the low-risk UI helper pocket is thinner.
2. Keep bundling obviously-related helper moves together when they share the same destination module and risk profile.

## 2026-03-27 - Monolith Reduction Wave 58 (Options Menu UI Move)

### Completed
- Moved the options-menu visibility/state helper block out of `public/script.js` into `public/scripts/ui-core.js`.
- Relocated the show/hide and hover-dismiss behavior behind a single `initOptionsMenu(...)` entrypoint in `ui-core`, and replaced the local `script.js` block with one startup call that passes the existing Popper instance.
- Extended `bindUiCore(...)` with `showBookmarksButtons(...)`, which was the only legacy helper the moved options-menu logic still needed.
- Verified syntax for the touched files with `node --check` via `mise`.

### Measurable Impact
- `public/script.js` lost another medium-sized DOM/UI block from the jQuery ready handler instead of continuing to accumulate navigation/menu behavior.
- `ui-core.js` now owns a more coherent slice of shared menu/drawer UI behavior rather than splitting it between standalone helpers and monolith-local state.

### Insights
- Moving the whole options-menu block together was cleaner than peeling off only `showMenu()` or `hideMenu()`, because the local state (`isOptionsMenuVisible`) is only meaningful as part of the full interaction.
- Passing the existing Popper instance into `initOptionsMenu(...)` preserved the current startup flow without introducing another global or cross-module singleton.

### Next
1. Reassess whether there is enough startup/UI helper density left to justify more work in `ui-core`, or whether the next batch should switch back to a feature-domain seam.
2. Keep grouping DOM behavior by complete interaction blocks when the state is local to that interaction.

## 2026-03-27 - Monolith Reduction Wave 59 (Input Focus Retention Move)

### Completed
- Moved the send-textarea focus-retention interaction out of `public/script.js` into `public/scripts/ui-core.js`.
- Relocated the full behavior as a single `initSendTextareaFocusRetention()` helper in `ui-core`, including:
  - tracking whether the send textarea was previously focused
  - restoring focus after send/regenerate/continue/impersonate button clicks
  - clearing that state on unrelated document clicks
- Replaced the monolith-local jQuery-ready block with one startup call into `ui-core`.
- Verified syntax for the touched files with `node --check` via `mise`.

### Measurable Impact
- `public/script.js` lost another small-but-stateful DOM interaction block from the jQuery-ready section.
- `ui-core.js` now owns another shared interaction pattern near the input/send controls instead of splitting those concerns between core UI helpers and monolith-local setup code.

### Insights
- This was a good fit for `ui-core` because the state is private to one interaction and does not need any domain-level data or cross-module orchestration.
- Moving the whole block together kept the logic easy to compare with the original implementation and avoided introducing another wrapper-only seam.

### Next
1. Reassess whether the next nearby DOM-ready interaction can move with the same low-risk pattern.
2. Keep prioritizing relocations where the state is local to one UI behavior and not entangled with generation/session logic.

## 2026-03-27 - Monolith Reduction Wave 60 (Edit Textarea Auto-fit Move)

### Completed
- Moved the edit-textarea auto-fit setup out of `public/script.js` into `public/scripts/ui-core.js` as `initEditTextareaAutoFit(...)`.
- Kept the behavior intact:
  - skip the whole path when the browser supports CSS `field-sizing: content`
  - immediately resize when the textarea is empty or expanding without a scrollbar
  - otherwise debounce the resize path using the existing short debounce timeout
- Extended `bindUiCore(...)` with the shared `debounce(...)` helper instead of adding a new direct dependency from `ui-core` into the larger utility module graph.
- Verified syntax for the touched files with `node --check` via `mise`.

### Measurable Impact
- `public/script.js` lost another stateful DOM-ready helper block tied to message editing UI.
- `ui-core.js` now owns more of the generic edit-surface behavior instead of leaving textarea lifecycle setup embedded in the monolith.

### Insights
- Passing `chatElement` and the debounce delay into one init helper was enough to preserve the original behavior without turning this into a larger editor refactor.
- Reusing the existing `debounce` helper through `bindUiCore(...)` kept this move consistent with the recent drawer/options/input UI relocations.

### Next
1. Reassess whether there are enough remaining DOM-ready helper clusters to justify one more `ui-core` pass before switching back to a larger feature seam.
2. Keep preferring complete interaction-block moves over scattering single helper functions across modules.

## 2026-03-27 - Monolith Reduction Wave 61 (Character Editor Binding Move)

### Completed
- Moved the character editor input/favorite listener block out of `public/script.js` into `public/scripts/character-core.js` as `initCharacterEditorBindings()`.
- Relocated the full create/edit form synchronization behavior intact:
  - `#character_name_pole` create-mode update
  - the shared `elementsToUpdate` map for create-save form fields
  - save-vs-create branching for existing characters vs create mode
  - favorite toggle handling with debounced character save for existing characters
- Used the existing `saveCharacterDebounced()` export from `settings-core` rather than adding another custom bind-only seam for this path.
- Verified syntax for the touched files with `node --check` via `mise`.

### Measurable Impact
- `public/script.js` lost another medium-sized character-editor setup block from the jQuery-ready section.
- `character-core.js` now owns more of the actual character editor interaction setup instead of only owning the later create/edit execution path.

### Insights
- This move is easier to justify than spreading these listeners across `ui-core`, because the state being edited is clearly `character-core` state (`create_save`, favorite status, create-vs-edit mode).
- Reusing `settings-core` for the debounced save path kept the move relocation-oriented rather than introducing another temporary binding surface in `script.js`.

### Next
1. Reassess whether the next best move in this area is the delete/import/export character UI cluster or a separate chat-management block.
2. Keep pulling listener setup toward the module that already owns the underlying edited state when that ownership is clear.

## 2026-03-27 - Monolith Reduction Wave 62 (Chat Management Binding Move)

### Completed
- Moved the chat rename/export button handlers out of `public/script.js` into `public/scripts/chat-operations-core.js` as `initChatManagementBindings()`.
- Relocated the full interaction blocks intact:
  - `.renameChatButton` popup/rename/reopen flow
  - `.exportChatButton` and `.exportRawChatButton` export flow
- Kept the existing startup behavior by replacing the monolith-local handlers with one init call in the jQuery-ready block.
- Verified syntax for the touched files with `node --check` via `mise`.

### Measurable Impact
- `public/script.js` lost another medium-sized chat-management block from the DOM-ready section.
- `chat-operations-core.js` now owns more of the chat list/session management UI behavior that already depended on chat state, current selection, and remote chat operations.

### Insights
- This was a natural move into `chat-operations-core` because the handlers depend on `selected_group`, current chat selection, `saveChatConditional()`, and `renameChat()`, all of which already live close to chat-operations ownership.
- Keeping the two handlers together as one init helper was cleaner than splitting rename and export into separate partial moves, because they operate on the same chat-list surface and supporting state.

### Next
1. Reassess whether the next cohesive move is the remaining character import/export/delete UI cluster or another chat-list/popup interaction nearby.
2. Keep preferring modules that already own the state and remote operations used by the moved listeners.

## 2026-03-27 - Monolith Reduction Wave 63 (Character Import/Export Binding Move)

### Completed
- Moved the character import/export UI listener block out of `public/script.js` into `public/scripts/character-core.js` as `initCharacterImportExportBindings(...)`.
- Relocated the full interaction block intact:
  - `#character_import_button` file-picker trigger
  - `#character_import_file` import flow
  - `#export_button` export-popup toggle
  - `.export_format` export action
  - export-popup outside-click dismissal
- Kept the existing Popper instance in `script.js` and passed it into the new init helper rather than creating a new global or moving unrelated popup bootstrap state.
- Verified syntax for the touched files with `node --check` via `mise`.

### Measurable Impact
- `public/script.js` lost another large character-management block from the DOM-ready section.
- `character-core.js` now owns more of the import/export surface that already depended on character state, character save flow, and current selection.

### Insights
- This was a cleaner fit for `character-core` than `ui-core`, because the logic is not just popup chrome; it directly uses character import/export operations and current character state.
- Passing `exportPopper` as an argument preserved the current bootstrap shape while still removing the implementation body from the monolith.

### Next
1. Reassess whether the next move in this area should be the remaining delete-character popup flow or another nearby chat/session interaction.
2. Keep relocating full listener clusters when they already sit on top of state and operations owned by the destination module.

## 2026-03-27 - Monolith Reduction Wave 64 (Character Delete Binding Move)

### Completed
- Moved the delete-character confirmation binding out of `public/script.js` into `public/scripts/character-core.js` as `initCharacterDeleteBinding()`.
- Relocated the full interaction intact:
  - selected-character existence check
  - delete-chats checkbox capture from the confirmation popup
  - final `deleteCharacter(...)` call with the selected character avatar
- Replaced the monolith-local listener registration with one startup call into `character-core`.
- Verified syntax for the touched files with `node --check` via `mise`.

### Measurable Impact
- `public/script.js` lost another character-management listener block from the DOM-ready section.
- `character-core.js` now owns the delete-button UI setup in addition to the underlying delete flow it already implemented.

### Insights
- This was an especially clean move because the destination module already owned both the current-character state and the actual deletion behavior.
- Keeping the popup wiring with the delete flow makes the ownership story simpler for future upstream comparison than leaving the UI trigger in the monolith.

### Next
1. Continue with the adjacent character/chat management listener clusters, especially chat import and nearby control buttons.
2. Keep moving UI triggers toward the module that already owns the invoked behavior when that mapping is straightforward.

## 2026-03-27 - Monolith Reduction Wave 65 (Chat Import Binding Move)

### Completed
- Moved the chat import UI listener block out of `public/script.js` into `public/scripts/chat-operations-core.js` as `initChatImportBindings()`.
- Relocated the full interaction intact:
  - `#chat_import_button` file-picker trigger
  - `#chat_import_file` validation and import flow
  - group-vs-character routing for imported chat files
  - import-format tracking via `#chat_import_file_type`
- Kept the current user-name and selected-group behavior by using the same `name1` and `selected_group` state now imported directly inside `chat-operations-core`.
- Verified syntax for the touched files with `node --check` via `mise`.

### Measurable Impact
- `public/script.js` lost another sizable chat-management listener block from the DOM-ready section.
- `chat-operations-core.js` now owns more of the chat import surface instead of splitting the UI trigger layer away from the actual import operations it already uses.

### Insights
- This was a good fit for `chat-operations-core` because the handler already depended on chat import behavior, selected-group routing, and current user state, all of which are closer to chat/session operations than generic UI.
- Pulling in `importGroupChat` and `name1` directly was simpler and more traceable than inventing another temporary binding seam for a small, already-cohesive block.

### Next
1. Reassess whether the next adjacent move should be the group/duplicate/stop control bindings or a more generic UI cluster like inline drawers.
2. Keep moving complete import/export listener clusters together when they operate on the same area of state and remote behavior.

## 2026-03-27 - Monolith Reduction Wave 66 (Inline Drawer UI Move)

### Completed
- Moved the inline-drawer toggle/maximize interaction block out of `public/script.js` into `public/scripts/ui-core.js` as `initInlineDrawerBindings()`.
- Relocated both interaction blocks intact:
  - `.inline-drawer-toggle` open/close behavior, including icon state updates and auto-height refresh for textarea content
  - `.inline-drawer-maximize` maximize/restore behavior, including reset of movable panel styles
- Extended `bindUiCore(...)` with `resetMovableStyles(...)`, which was the only remaining legacy helper this moved UI block still needed.
- Verified syntax for the touched files with `node --check` via `mise`.

### Measurable Impact
- `public/script.js` lost another non-trivial UI interaction block from the DOM-ready section.
- `ui-core.js` now owns a more complete set of drawer/panel interactions instead of splitting drawer chrome across multiple files and the monolith.

### Insights
- This was a good continuation of the earlier drawer/options moves because the logic is local UI state plus a couple of helper calls, not domain behavior.
- Passing `resetMovableStyles(...)` through `bindUiCore(...)` kept the move consistent with the existing UI-core seam instead of hard-importing more legacy modules into the core.

### Next
1. Reassess whether one more nearby UI/control cluster is worth moving before switching back to a denser feature seam.
2. Keep bundling drawer/panel chrome behavior together in `ui-core` when the moved logic is mostly DOM interaction and local UI state.

## 2026-03-27 - Listener Cleanup Batch

### Completed
- Continued shrinking the DOM-ready block with a small batch of relocation-style listener moves rather than deeper refactors:
  - moved the message copy handler into `public/scripts/message-core.js`
  - moved a small character-panel control cluster into `public/scripts/character-core.js`
  - moved execution control button bindings (`.mes_stop` and the STscript continue/pause/stop buttons) into `public/scripts/ui-core.js`
- Kept each move close to the module that already owned the invoked behavior or state, and preserved the existing startup flow by replacing the monolith-local handlers with init calls.
- Verified syntax for the touched files with `node --check` via `mise` after each batch.

### Measurable Impact
- `public/script.js` lost several more listener blocks without widening into a redesign of generation, session, or parser behavior.
- Ownership is a bit clearer:
  - message-surface copy behavior now lives with `message-core`
  - character-panel controls live with `character-core`
  - generic execution-control wiring lives with `ui-core`

### Insights
- These listener moves are still paying off because a lot of the remaining monolith weight is now concentrated in DOM-ready setup rather than unique core business logic.
- Batching the journal note at this level is enough to keep handoff quality without writing a fresh mini-report for every one-button move.

### Next
1. Continue with a few more cohesive listener/control clusters, or switch back to a denser feature seam once the remaining DOM-ready setup stops yielding good chunks.
2. Keep preferring destination modules that already own the state and operations behind the moved bindings.
### 2026-03-28: Wave 66 - moved settings bootstrap and API-mode switch out of `script.js`

This wave moved two larger legacy ownership points into `public/scripts/settings-core.js`: `getSettings()` and `changeMainAPI()`. The move stayed relocation-first rather than redesigning the settings load path. `script.js` now keeps thin wrappers while `bindSettingsCore(...)` supplies the remaining script-owned setters and runtime dependencies that still have to bridge back into legacy locals.

The main constraint here was import-cycle risk. A direct `settings-core -> openai/power-user/tags/backgrounds/...` import graph would have recreated the same startup-order problems we already hit in slash-command and debounce bindings. To keep the equivalence story clear without introducing new module cycles, the moved functions still execute their original flow but call bound hooks for state mutation and settings-loader side effects.

### 2026-03-28: Wave 67 - moved top-level `Generate()` orchestration out of `script.js`

This wave moved the main `Generate()` orchestration path into `public/scripts/generation-core.js`. The implementation already depended on generation-core helpers for most of its work, so the move was done by relocating the orchestration body and extending `bindGenerationCore(...)` with the remaining script-owned hooks it still needed: generation-start timestamp ownership, itemized/extension prompt stores, tool-calling recursion helpers, and `deleteLastMessage()`.

`script.js` now keeps a thin `Generate(...)` compatibility wrapper. A small related cleanup fixed `generation-core` to call a bound `deleteLastMessage` implementation in tool-call cleanup paths instead of relying on an unresolved free reference.

### 2026-03-28: Wave 68 - generation-core now owns streaming plus prompt/request helpers

This batch continued the same relocation-first generation move instead of widening into a redesign. `StreamingProcessor` was moved out of `public/script.js` into `public/scripts/generation-core.js`, and the follow-up browser check exposed one moved-path regression (`getStoppingStringsImpl` inside the streaming flow) that was fixed before continuing. After that, the adjacent prompt/request helpers were moved too: `createRawPrompt()`, `getGenerateUrl()`, `sendGenerationRequest()`, and `sendStreamingRequest()` now live in `generation-core`, while `script.js` keeps thin compatibility wrappers.

The intent here was to keep the generation seam coherent. Once `Generate()` and `StreamingProcessor` were already core-owned, leaving prompt construction and non-streaming request dispatch in `script.js` would have kept generation split across too many files for little benefit. This move stays traceable because the public names and top-level call flow are preserved, but the actual ownership now sits with the same generation module that already executes the rest of the request lifecycle.

Manual verification in the browser covered normal generation plus a legacy-UI streaming send after enabling streaming there. Static verification was `node --check` via `mise` on the touched files.

### 2026-03-28: Wave 69 - moved character list refresh/render ownership out of `script.js`

This batch shifted another meaningful chunk of character management into `public/scripts/character-core.js`. The core now owns `getCharacters()`, `buildAvatarList()`, and `getCharacterSource()`, with `script.js` reduced to thin compatibility wrappers. I also updated the character-core internals that still called the old bound `getCharacters` seam so they now use the core-owned function directly.

This stayed relocation-first rather than rewriting the character list flow. The moved code still preserves active-character restoration, post-refresh selection, and the existing source URL precedence rules; the main change is that character list fetch/render ownership is now in the same module that already owned most character CRUD and list behavior.

### 2026-03-28: Wave 70 - moved character card prompt field shaping into `character-core`

The next adjacent move kept the same approach and moved `getCharacterCardFields()` into `public/scripts/character-core.js`. That logic already depends on character state, group-card overrides, and chat metadata, so leaving it in `script.js` was mostly historical. `script.js` now just forwards to the core-owned implementation.

### 2026-03-28: Wave 71 - moved settings save orchestration into `settings-core`

This wave moved `saveSettings()` out of `public/script.js` into `public/scripts/settings-core.js`. The function body stayed intact: the same readiness checks, temp-response-length retry loop, payload shape, and save endpoint behavior were preserved. The only structural change was adding a few extra bound getters for script-owned runtime state such as `firstRun`, `settingsReady`, `swipes`, and the temp response-length status hooks.

This was a better fit than taking `firstLoadInit()` next because it reduces a large remaining function without re-entering the fragile startup/import-order surface. `script.js` now keeps a thin compatibility wrapper while `settings-core` owns the actual save flow.

### 2026-03-28: Wave 72 - moved character selection orchestration into `session-core`

This follow-up moved `selectCharacterById()` out of `public/script.js` into `public/scripts/session-core.js`. That flow is really session/menu orchestration rather than pure character data logic: it clears chat state, resets selected groups, syncs edited-message state, updates menu selection, and either loads the new chat or re-opens the already-selected character editor.

To keep behavior aligned with the legacy path, `session-core` now receives explicit setters for the script-local mirrors that still matter here, especially chat metadata and edited-message id. `script.js` keeps a thin wrapper and updates its local `this_edit_mes_id` mirror from the core after delegation.

### 2026-03-29: Wave 73 - moved avatar upload/edit flow into `character-core`

This batch moved `read_avatar_load()` out of `public/script.js` into `public/scripts/character-core.js`. The flow already depended on core-owned character edit state such as `create_save`, `crop_data`, `createOrEditCharacter()`, and avatar refresh behavior, so keeping it in the monolith was mostly leftover placement from before the character seam existed.

To preserve the old behavior, `character-core` now receives the selected-button getter through `bindCharacterCore(...)` so it can still distinguish create-mode avatar assignment from edit-mode refresh. `script.js` keeps only a thin wrapper that syncs its local crop-data mirror from the core after delegation.

### 2026-03-29: Wave 74 - moved metadata save and small character utility flows out of `script.js`

This batch kept to the relocation-first approach and peeled out a few remaining self-contained behaviors without touching the startup/bootstrap path. `saveMetadata()` now lives in `public/scripts/chat-operations-core.js`, which is the right ownership point because it already owns chat-save orchestration and metadata state. In parallel, `duplicateCharacter()` and `unshallowCharacter()` moved into `public/scripts/character-core.js`, where the surrounding character fetch/list state and network helpers already live.

`script.js` stays as a thin compatibility layer for all three paths, so runtime adapters and existing callers still hit the same public names. Static verification was `node --check` via `mise` on `public/script.js`, `public/scripts/chat-operations-core.js`, and `public/scripts/character-core.js`.

### 2026-03-29: Wave 75 - moved `showMoreMessages()` into `chat-operations-core`

This follow-up kept the same relocation style and moved the chat-history expansion flow out of `public/script.js`. `showMoreMessages()` now lives in `public/scripts/chat-operations-core.js`, alongside the message rendering helpers it already depends on (`addOneMessage(...)`, style-pin refresh, chat state, and the `MORE_MESSAGES_LOADED` event).

The move stayed intentionally narrow: no behavior change, no new startup wiring, and `script.js` remains a thin wrapper so existing callers still hit the same export surface.

### 2026-03-29: Wave 76 - moved chat-save debounce ownership into `chat-operations-core`

This batch finished the adjacent save-timing seam instead of leaving the timeout state stranded in `public/script.js`. `cancelDebouncedChatSave()` and `saveChatDebounced()` now live in `public/scripts/chat-operations-core.js`, which already owns the actual chat-save path and the clear/reset operations that need to cancel pending saves.

That let the monolith drop its local `chatSaveTimeout` state while keeping compatibility wrappers for the runtime/message adapters. The move also simplified `chat-operations-core` itself by replacing its old `cancelDebouncedChatSave` binding hook with direct core-owned behavior.
