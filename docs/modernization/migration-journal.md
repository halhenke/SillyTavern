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
