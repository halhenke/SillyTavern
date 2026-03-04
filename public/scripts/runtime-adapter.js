/**
 * Transitional legacy adapter.
 * Prefer importing focused adapters from ./runtime/*-adapter.js.
 */
export {
    amount_gen,
    generateQuietPrompt,
    getGenerateUrl,
    max_context,
    online_status,
    setGenerationParamsFromPreset,
} from './runtime/generation-adapter.js';

export {
    event_types,
    eventSource,
} from './runtime/events-adapter.js';

export {
    getRequestHeaders,
    getThumbnailUrl,
} from './runtime/network-adapter.js';

export {
    saveSettingsDebounced,
} from './runtime/settings-adapter.js';

export {
    characters,
    chat_metadata,
    getCurrentChatId,
    name1,
    name2,
    this_chid,
} from './runtime/chat-adapter.js';

export {
    extension_prompt_types,
} from './runtime/extensions-adapter.js';

export {
    extractJsonFromData,
    extractMessageFromData,
    substituteParams,
} from './runtime/parser-adapter.js';
