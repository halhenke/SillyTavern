import { menu_type } from './runtime/app-state-adapter.js';
import { CONNECT_API_MAP, main_api } from './runtime/api-adapter.js';
import { characters, getCharacters } from './runtime/character-adapter.js';
import { chat_metadata, default_avatar, getCurrentChatId, name1, name2, this_chid } from './runtime/chat-adapter.js';
import {
    activateSendButtons,
    addOneMessage,
    appendMediaToMessage,
    chat,
    clearChat,
    create_save,
    deactivateSendButtons,
    deleteLastMessage,
    deleteSwipe,
    getCharacterCardFields,
    openCharacterChat,
    printMessages,
    reloadCurrentChat,
    renameChat,
    saveChatConditional,
    saveReply,
    sendMessageAsUser,
    swipe_left,
    swipe_right,
    updateChatMetadata,
} from './runtime/chat-operations-adapter.js';
import { event_types, eventSource } from './runtime/events-adapter.js';
import { extension_prompts, setExtensionPrompt } from './runtime/extensions-adapter.js';
import {
    Generate,
    generateQuietPrompt,
    generateRaw,
    max_context,
    online_status,
    sendGenerationRequest,
    sendStreamingRequest,
    stopGeneration,
    streamingProcessor,
} from './runtime/generation-adapter.js';
import { messageFormatting, updateMessageBlock } from './runtime/message-adapter.js';
import { getRequestHeaders, getThumbnailUrl } from './runtime/network-adapter.js';
import { extractMessageFromData, substituteParams, substituteParamsExtended } from './runtime/parser-adapter.js';
import { saveMetadata, saveSettingsDebounced } from './runtime/settings-adapter.js';
import { deleteCharacterChatByName, selectCharacterById, sendSystemMessage, unshallowCharacter } from './runtime/session-adapter.js';
import { callPopup } from './runtime/ui-adapter.js';
import {
    disableExtension,
    enableExtension,
    extensionNames,
    extension_settings,
    extensionTypes,
    ModuleWorkerWrapper,
    renderExtensionTemplate,
    renderExtensionTemplateAsync,
    saveMetadataDebounced,
    writeExtensionField,
} from './extensions.js';
import { deleteGroupChatByName, groups, openGroupById, openGroupChat, selected_group, unshallowGroupMembers } from './group-chats.js';
import { addLocaleData, getCurrentLocale, t, translate } from './i18n.js';
import { hideLoader, showLoader } from './loader.js';
import { MacrosParser } from './macros.js';
import { chat_completion_sources, getChatCompletionModel, oai_settings, promptManager as chatPromptManager, setupChatCompletionPromptManager } from './openai.js';
import { callGenericPopup, Popup, POPUP_RESULT, POPUP_TYPE } from './popup.js';
import { power_user, registerDebugFunction } from './power-user.js';
import { getPresetManager } from './preset-manager.js';
import { humanizedDateTime, isMobile, shouldSendOnEnter } from './RossAscends-mods.js';
import { ScraperManager } from './scrapers.js';
import { executeSlashCommands, executeSlashCommandsWithOptions, registerSlashCommand } from './slash-commands.js';
import { SlashCommand } from './slash-commands/SlashCommand.js';
import { ARGUMENT_TYPE, SlashCommandArgument, SlashCommandNamedArgument } from './slash-commands/SlashCommandArgument.js';
import { SlashCommandParser } from './slash-commands/SlashCommandParser.js';
import { tag_map, tags } from './tags.js';
import { getTextGenServer, textgen_types, textgenerationwebui_settings } from './textgen-settings.js';
import { tokenizers, getTextTokens, getTokenCount, getTokenCountAsync, getTokenizerModel } from './tokenizers.js';
import { ToolManager } from './tool-calling.js';
import { accountStorage } from './util/AccountStorage.js';
import { timestampToMoment, uuidv4 } from './utils.js';
import { getGlobalVariable, getLocalVariable, setGlobalVariable, setLocalVariable } from './variables.js';
import { convertCharacterBook, createNewWorldInfo, deleteWorldInfo, getWorldInfoPrompt, loadWorldInfo, reloadEditor, saveWorldInfo, selected_world_info, updateWorldInfoList, world_names } from './world-info.js';
import { ChatCompletionService, TextCompletionService } from './custom-request.js';
import { ConnectionManagerRequestService } from './extensions/shared.js';
import { updateReasoningUI, parseReasoningFromString } from './reasoning.js';
import { IGNORE_SYMBOL } from './constants.js';
import { createOrEditCharacter, syncCropData, syncFavChChecked } from './character-core.js';
import { SECRET_KEYS, deleteSecret, rotateSecret, secret_state, writeSecret } from './secrets.js';

function setCharacterFormValue(id, value) {
    const element = document.getElementById(id);
    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement) {
        element.value = String(value ?? '');
    }
}

async function createCharacter(profile) {
    const name = String(profile?.name ?? '').trim();
    if (!name) {
        throw new Error('Character name is required');
    }

    create_save.name = name;
    create_save.description = String(profile?.description ?? '');
    create_save.creator_notes = String(profile?.creatorNotes ?? '');
    create_save.post_history_instructions = String(profile?.postHistoryInstructions ?? '');
    create_save.character_version = String(profile?.characterVersion ?? '');
    create_save.system_prompt = String(profile?.systemPrompt ?? '');
    create_save.tags = Array.isArray(profile?.tags) ? profile.tags.filter(Boolean).join(', ') : '';
    create_save.creator = String(profile?.creator ?? '');
    create_save.personality = String(profile?.personality ?? '');
    create_save.first_message = String(profile?.firstMessage ?? '');
    create_save.avatar = null;
    create_save.scenario = String(profile?.scenario ?? '');
    create_save.mes_example = String(profile?.mesExamples ?? '');
    create_save.world = '';
    create_save.talkativeness = Number.isFinite(profile?.talkativeness) ? profile.talkativeness : 0.5;
    create_save.alternate_greetings = [];
    create_save.depth_prompt_prompt = '';
    create_save.depth_prompt_depth = 4;
    create_save.depth_prompt_role = 'system';
    create_save.extensions = {};
    create_save.extra_books = [];

    syncCropData(undefined);
    syncFavChChecked(false);

    const form = document.getElementById('form_create');
    form?.setAttribute('actiontype', 'createcharacter');

    setCharacterFormValue('character_name_pole', create_save.name);
    setCharacterFormValue('description_textarea', create_save.description);
    setCharacterFormValue('creator_notes_textarea', create_save.creator_notes);
    setCharacterFormValue('post_history_instructions_textarea', create_save.post_history_instructions);
    setCharacterFormValue('character_version_textarea', create_save.character_version);
    setCharacterFormValue('system_prompt_textarea', create_save.system_prompt);
    setCharacterFormValue('tags_textarea', create_save.tags);
    setCharacterFormValue('creator_textarea', create_save.creator);
    setCharacterFormValue('personality_textarea', create_save.personality);
    setCharacterFormValue('firstmessage_textarea', create_save.first_message);
    setCharacterFormValue('scenario_pole', create_save.scenario);
    setCharacterFormValue('mes_example_textarea', create_save.mes_example);
    setCharacterFormValue('talkativeness_slider', create_save.talkativeness);
    setCharacterFormValue('depth_prompt_prompt', create_save.depth_prompt_prompt);
    setCharacterFormValue('depth_prompt_depth', create_save.depth_prompt_depth);
    setCharacterFormValue('depth_prompt_role', create_save.depth_prompt_role);
    setCharacterFormValue('character_world', create_save.world);

    const avatarInput = document.getElementById('add_avatar_button');
    if (avatarInput instanceof HTMLInputElement) {
        avatarInput.value = '';
    }

    await createOrEditCharacter(new CustomEvent('newChat'));
}

function getWorldNames() {
    return Array.isArray(world_names) ? [...world_names] : [];
}

function getPromptManagerInstance() {
    return chatPromptManager ?? setupChatCompletionPromptManager(oai_settings);
}

async function listInstalledExtensions() {
    const names = Array.isArray(extensionNames) ? [...extensionNames] : [];
    const manifests = await Promise.all(names.map(async (name) => {
        try {
            const response = await fetch(`/scripts/extensions/${name}/manifest.json`);
            if (!response.ok) {
                return null;
            }

            const manifest = await response.json();
            return {
                dependencies: Array.isArray(manifest?.dependencies) ? manifest.dependencies : [],
                displayName: String(manifest?.display_name ?? name),
                enabled: !extension_settings.disabledExtensions.includes(name),
                homePage: typeof manifest?.homePage === 'string' ? manifest.homePage : undefined,
                jsFile: typeof manifest?.js === 'string' ? manifest.js : undefined,
                name,
                requires: Array.isArray(manifest?.requires) ? manifest.requires : [],
                type: String(extensionTypes?.[name] ?? ''),
                version: String(manifest?.version ?? ''),
            };
        } catch {
            return {
                dependencies: [],
                displayName: name,
                enabled: !extension_settings.disabledExtensions.includes(name),
                homePage: undefined,
                jsFile: undefined,
                name,
                requires: [],
                type: String(extensionTypes?.[name] ?? ''),
                version: '',
            };
        }
    }));

    return manifests
        .filter(Boolean)
        .sort((left, right) => left.displayName.localeCompare(right.displayName));
}

async function setExtensionEnabled(name, enabled) {
    const trimmedName = String(name ?? '').trim();
    if (!trimmedName) {
        throw new Error('Extension name is required');
    }

    if (enabled) {
        await enableExtension(trimmedName, false);
        return;
    }

    await disableExtension(trimmedName, false);
}

function getPromptTemplates() {
    const manager = getPromptManagerInstance();
    if (!manager) {
        return [];
    }

    const promptOrder = manager.getPromptOrderForCharacter(manager.activeCharacter);
    return promptOrder
        .map((entry) => {
            const prompt = manager.getPromptById(entry.identifier);
            if (!prompt) {
                return null;
            }

            return {
                content: String(prompt.content ?? ''),
                enabled: Boolean(entry.enabled ?? true),
                forbidOverrides: Boolean(prompt.forbid_overrides),
                identifier: String(prompt.identifier ?? entry.identifier),
                injectionDepth: Number(prompt.injection_depth ?? 4),
                injectionOrder: Number(prompt.injection_order ?? 100),
                injectionPosition: Number(prompt.injection_position ?? 0),
                injectionTriggers: Array.isArray(prompt.injection_trigger) ? [...prompt.injection_trigger] : [],
                name: String(prompt.name ?? ''),
                role: String(prompt.role ?? 'system'),
                systemPrompt: Boolean(prompt.system_prompt),
            };
        })
        .filter(Boolean);
}

async function savePromptTemplate(template) {
    const manager = getPromptManagerInstance();
    if (!manager) {
        throw new Error('Prompt manager unavailable');
    }

    const identifier = String(template?.identifier ?? '').trim();
    if (!identifier) {
        throw new Error('Prompt identifier is required');
    }

    const existing = manager.getPromptById(identifier);
    if (!existing) {
        throw new Error(`Prompt ${identifier} not found`);
    }

    const promptOrderEntry = manager.getPromptOrderEntry(manager.activeCharacter, identifier);
    if (promptOrderEntry && typeof template.enabled === 'boolean') {
        promptOrderEntry.enabled = template.enabled;
    }

    manager.updatePromptByIdentifier(identifier, {
        content: String(template?.content ?? ''),
        forbid_overrides: Boolean(template?.forbidOverrides),
        identifier,
        injection_depth: Number(template?.injectionDepth ?? 4),
        injection_order: Number(template?.injectionOrder ?? 100),
        injection_position: Number(template?.injectionPosition ?? 0),
        injection_trigger: Array.isArray(template?.injectionTriggers) ? template.injectionTriggers.filter(Boolean) : [],
        name: String(template?.name ?? ''),
        role: String(template?.role ?? 'system'),
        system_prompt: Boolean(template?.systemPrompt),
    });

    manager.render(false);
    saveSettingsDebounced?.();
}

async function movePromptTemplate(identifier, direction) {
    const manager = getPromptManagerInstance();
    if (!manager) {
        throw new Error('Prompt manager unavailable');
    }

    const trimmedIdentifier = String(identifier ?? '').trim();
    if (!trimmedIdentifier) {
        throw new Error('Prompt identifier is required');
    }

    const promptOrder = manager.getPromptOrderForCharacter(manager.activeCharacter);
    const currentIndex = promptOrder.findIndex((entry) => entry.identifier === trimmedIdentifier);
    if (currentIndex === -1) {
        throw new Error(`Prompt ${trimmedIdentifier} not found in active order`);
    }

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= promptOrder.length) {
        return;
    }

    const currentEntry = promptOrder[currentIndex];
    const targetEntry = promptOrder[targetIndex];
    promptOrder[currentIndex] = targetEntry;
    promptOrder[targetIndex] = currentEntry;

    manager.render(false);
    saveSettingsDebounced?.();
}

function listConnectionApiOptions() {
    return Object.entries(CONNECT_API_MAP)
        .map(([id, config]) => ({
            id,
            kind: config.selected === 'openai' ? 'chat' : 'text',
            label: id,
        }))
        .sort((left, right) => left.label.localeCompare(right.label));
}

const CONNECTION_COMMON_FIELDS = ['api-url', 'model', 'preset', 'stop-strings', 'start-reply-with', 'reasoning-template', 'secret-id'];
const CONNECTION_CHAT_ONLY_FIELDS = ['proxy', 'prompt-post-processing'];
const CONNECTION_TEXT_ONLY_FIELDS = ['instruct', 'context', 'instruct-state', 'tokenizer'];
const CONNECTION_SECRET_CONFIG = {
    ai21: { key: SECRET_KEYS.AI21, label: 'AI21' },
    aimlapi: { key: SECRET_KEYS.AIMLAPI, label: 'AI/ML API' },
    aphrodite: { requiresSecret: false, label: 'Aphrodite' },
    claude: { key: SECRET_KEYS.CLAUDE, label: 'Claude' },
    cohere: { key: SECRET_KEYS.COHERE, label: 'Cohere' },
    cometapi: { key: SECRET_KEYS.COMETAPI, label: 'CometAPI' },
    custom: { key: SECRET_KEYS.CUSTOM, label: 'Custom (OpenAI-compatible)' },
    deepseek: { key: SECRET_KEYS.DEEPSEEK, label: 'DeepSeek' },
    dreamgen: { key: SECRET_KEYS.DREAMGEN, label: 'DreamGen' },
    featherless: { key: SECRET_KEYS.FEATHERLESS, label: 'Featherless' },
    fireworks: { key: SECRET_KEYS.FIREWORKS, label: 'Fireworks AI' },
    generic: { key: SECRET_KEYS.GENERIC, label: 'Generic (OpenAI-compatible)' },
    google: { key: SECRET_KEYS.MAKERSUITE, label: 'Google AI Studio' },
    groq: { key: SECRET_KEYS.GROQ, label: 'Groq' },
    huggingface: { key: SECRET_KEYS.HUGGINGFACE, label: 'HuggingFace' },
    infermaticai: { key: SECRET_KEYS.INFERMATICAI, label: 'InfermaticAI' },
    kcpp: { key: SECRET_KEYS.KOBOLDCPP, label: 'KoboldCpp' },
    koboldcpp: { key: SECRET_KEYS.KOBOLDCPP, label: 'KoboldCpp' },
    llamacpp: { key: SECRET_KEYS.LLAMACPP, label: 'llama.cpp' },
    mancer: { key: SECRET_KEYS.MANCER, label: 'Mancer' },
    mistralai: { key: SECRET_KEYS.MISTRALAI, label: 'MistralAI' },
    moonshot: { key: SECRET_KEYS.MOONSHOT, label: 'Moonshot AI' },
    nanogpt: { key: SECRET_KEYS.NANOGPT, label: 'NanoGPT' },
    oai: { key: SECRET_KEYS.OPENAI, label: 'OpenAI' },
    ollama: { requiresSecret: false, label: 'Ollama' },
    openai: { key: SECRET_KEYS.OPENAI, label: 'OpenAI' },
    openrouter: { key: SECRET_KEYS.OPENROUTER, label: 'OpenRouter', supportsAuthorize: true },
    'openrouter-text': { key: SECRET_KEYS.OPENROUTER, label: 'OpenRouter', supportsAuthorize: true },
    oooba: { key: SECRET_KEYS.OOBA, label: 'Text Generation WebUI' },
    ooba: { key: SECRET_KEYS.OOBA, label: 'Text Generation WebUI' },
    perplexity: { key: SECRET_KEYS.PERPLEXITY, label: 'Perplexity' },
    pollinations: { requiresSecret: false, label: 'Pollinations' },
    tabby: { key: SECRET_KEYS.TABBY, label: 'TabbyAPI' },
    togetherai: { key: SECRET_KEYS.TOGETHERAI, label: 'TogetherAI' },
    vertexai: { key: SECRET_KEYS.VERTEXAI, label: 'Vertex AI' },
    vllm: { key: SECRET_KEYS.VLLM, label: 'vLLM' },
    xai: { key: SECRET_KEYS.XAI, label: 'xAI' },
};
const CONNECTION_MODEL_CONTROL_MAP = [
    { id: 'generic_model_textgenerationwebui', api: 'textgenerationwebui', type: textgen_types.GENERIC },
    { id: 'custom_model_textgenerationwebui', api: 'textgenerationwebui', type: textgen_types.OOBA },
    { id: 'model_togetherai_select', api: 'textgenerationwebui', type: textgen_types.TOGETHERAI },
    { id: 'openrouter_model', api: 'textgenerationwebui', type: textgen_types.OPENROUTER },
    { id: 'model_infermaticai_select', api: 'textgenerationwebui', type: textgen_types.INFERMATICAI },
    { id: 'model_dreamgen_select', api: 'textgenerationwebui', type: textgen_types.DREAMGEN },
    { id: 'mancer_model', api: 'textgenerationwebui', type: textgen_types.MANCER },
    { id: 'vllm_model', api: 'textgenerationwebui', type: textgen_types.VLLM },
    { id: 'aphrodite_model', api: 'textgenerationwebui', type: textgen_types.APHRODITE },
    { id: 'ollama_model', api: 'textgenerationwebui', type: textgen_types.OLLAMA },
    { id: 'tabby_model', api: 'textgenerationwebui', type: textgen_types.TABBY },
    { id: 'featherless_model', api: 'textgenerationwebui', type: textgen_types.FEATHERLESS },
    { id: 'model_openai_select', api: 'openai', source: chat_completion_sources.OPENAI },
    { id: 'model_claude_select', api: 'openai', source: chat_completion_sources.CLAUDE },
    { id: 'model_openrouter_select', api: 'openai', source: chat_completion_sources.OPENROUTER },
    { id: 'model_ai21_select', api: 'openai', source: chat_completion_sources.AI21 },
    { id: 'model_google_select', api: 'openai', source: chat_completion_sources.MAKERSUITE },
    { id: 'model_vertexai_select', api: 'openai', source: chat_completion_sources.VERTEXAI },
    { id: 'model_mistralai_select', api: 'openai', source: chat_completion_sources.MISTRALAI },
    { id: 'custom_model_id', api: 'openai', source: chat_completion_sources.CUSTOM },
    { id: 'model_cohere_select', api: 'openai', source: chat_completion_sources.COHERE },
    { id: 'model_perplexity_select', api: 'openai', source: chat_completion_sources.PERPLEXITY },
    { id: 'model_groq_select', api: 'openai', source: chat_completion_sources.GROQ },
    { id: 'model_nanogpt_select', api: 'openai', source: chat_completion_sources.NANOGPT },
    { id: 'model_deepseek_select', api: 'openai', source: chat_completion_sources.DEEPSEEK },
    { id: 'model_aimlapi_select', api: 'openai', source: chat_completion_sources.AIMLAPI },
    { id: 'model_xai_select', api: 'openai', source: chat_completion_sources.XAI },
    { id: 'model_pollinations_select', api: 'openai', source: chat_completion_sources.POLLINATIONS },
    { id: 'model_moonshot_select', api: 'openai', source: chat_completion_sources.MOONSHOT },
    { id: 'model_fireworks_select', api: 'openai', source: chat_completion_sources.FIREWORKS },
    { id: 'model_cometapi_select', api: 'openai', source: chat_completion_sources.COMETAPI },
];

function setOptionalConnectionField(target, key, value) {
    const trimmedValue = String(value ?? '').trim();
    if (trimmedValue) {
        target[key] = trimmedValue;
        return;
    }

    delete target[key];
}

function listConnectionModels(api) {
    const trimmedApi = String(api ?? '').trim().toLowerCase();
    if (!trimmedApi) {
        return [];
    }

    const apiConfig = CONNECT_API_MAP[trimmedApi];
    if (!apiConfig) {
        return [];
    }

    const modelControl = CONNECTION_MODEL_CONTROL_MAP.find((item) =>
        item.api === apiConfig.selected
        && (item.source ?? null) === (apiConfig.source ?? null)
        && (item.type ?? null) === (apiConfig.type ?? null));

    if (!modelControl) {
        return [];
    }

    const control = document.getElementById(modelControl.id);
    if (control instanceof HTMLInputElement) {
        const value = control.value.trim();
        return value ? [{ id: value, label: value }] : [];
    }

    if (!(control instanceof HTMLSelectElement)) {
        return [];
    }

    return Array.from(control.options)
        .map((option) => ({
            id: String(option.value ?? '').trim(),
            label: String(option.textContent ?? option.label ?? option.value ?? '').trim(),
        }))
        .filter((option) => option.id.length > 0);
}

function hasSavedConnectionSecret(secretKey) {
    const value = secret_state?.[secretKey];
    if (Array.isArray(value)) {
        return value.length > 0;
    }

    return Boolean(value);
}

function getConnectionSecretConfig(api) {
    const trimmedApi = String(api ?? '').trim().toLowerCase();
    return CONNECTION_SECRET_CONFIG[trimmedApi] ?? null;
}

function getConnectionSecretStatus(api) {
    const trimmedApi = String(api ?? '').trim().toLowerCase();
    const config = getConnectionSecretConfig(trimmedApi);
    if (!config) {
        return {
            api: trimmedApi,
            providerLabel: trimmedApi || 'Connection',
            requiresSecret: false,
            saved: false,
            supportsAuthorize: false,
            supportsManualEntry: false,
        };
    }

    const requiresSecret = config.requiresSecret !== false && Boolean(config.key);
    return {
        api: trimmedApi,
        providerLabel: config.label,
        requiresSecret,
        saved: requiresSecret ? hasSavedConnectionSecret(config.key) : false,
        supportsAuthorize: Boolean(config.supportsAuthorize),
        supportsManualEntry: requiresSecret,
    };
}

function listConnectionSecrets(api) {
    const trimmedApi = String(api ?? '').trim().toLowerCase();
    const config = getConnectionSecretConfig(trimmedApi);
    if (!config?.key) {
        return [];
    }

    const secrets = secret_state?.[config.key];
    if (!Array.isArray(secrets)) {
        return [];
    }

    return secrets.map((secret) => ({
        active: Boolean(secret?.active),
        id: String(secret?.id ?? ''),
        label: String(secret?.label ?? config.label),
        valuePreview: String(secret?.value ?? ''),
    })).filter((secret) => secret.id);
}

async function saveConnectionSecret(api, value, label) {
    const trimmedApi = String(api ?? '').trim().toLowerCase();
    const trimmedValue = String(value ?? '').trim();
    const trimmedLabel = String(label ?? '').trim();
    const config = getConnectionSecretConfig(trimmedApi);
    if (!config?.key || config.requiresSecret === false) {
        throw new Error('Connection secret is not required for this API');
    }
    if (!trimmedValue) {
        throw new Error('Connection secret value is required');
    }

    const result = await writeSecret(config.key, trimmedValue, trimmedLabel || undefined);
    if (!result) {
        throw new Error(`Could not save ${config.label} secret`);
    }
}

async function authorizeConnectionSecret(api) {
    const trimmedApi = String(api ?? '').trim().toLowerCase();
    const config = getConnectionSecretConfig(trimmedApi);
    if (!config?.supportsAuthorize) {
        throw new Error('Connection authorization is unavailable for this API');
    }

    const redirectUrl = new URL('/callback/openrouter', window.location.origin);
    const openRouterUrl = `https://openrouter.ai/auth?callback_url=${encodeURIComponent(redirectUrl.toString())}`;
    window.location.href = openRouterUrl;
}

async function deleteConnectionSecret(api, id) {
    const trimmedApi = String(api ?? '').trim().toLowerCase();
    const trimmedId = String(id ?? '').trim();
    const config = getConnectionSecretConfig(trimmedApi);
    if (!config?.key || !trimmedId) {
        throw new Error('Connection secret deletion is unavailable');
    }

    await deleteSecret(config.key, trimmedId);
}

async function activateConnectionSecret(api, id) {
    const trimmedApi = String(api ?? '').trim().toLowerCase();
    const trimmedId = String(id ?? '').trim();
    const config = getConnectionSecretConfig(trimmedApi);
    if (!config?.key || !trimmedId) {
        throw new Error('Connection secret activation is unavailable');
    }

    await rotateSecret(config.key, trimmedId);
}

async function saveConnectionProfile(profile) {
    const connectionManager = extension_settings.connectionManager;
    if (!connectionManager) {
        throw new Error('Connection manager settings are unavailable');
    }
    connectionManager.profiles ??= [];

    const name = String(profile?.name ?? '').trim();
    const api = String(profile?.api ?? '').trim().toLowerCase();
    if (!name) {
        throw new Error('Connection profile name is required');
    }
    if (!api) {
        throw new Error('Connection API is required');
    }

    const apiConfig = CONNECT_API_MAP[api];
    if (!apiConfig) {
        throw new Error(`Unknown connection API: ${api}`);
    }
    const mode = apiConfig.selected === 'openai' ? 'cc' : 'tc';

    const existingId = String(profile?.id ?? '').trim();
    const existingProfile = existingId
        ? connectionManager.profiles.find((item) => item.id === existingId)
        : null;

    if (connectionManager.profiles.some((item) => item.id !== existingId && item.name === name)) {
        throw new Error('A connection profile with the same name already exists');
    }

    const nextProfile = {
        ...(existingProfile ?? {}),
        id: existingId || uuidv4(),
        mode,
        name,
        api,
    };

    for (const key of CONNECTION_COMMON_FIELDS) {
        setOptionalConnectionField(nextProfile, key, profile?.[key]);
    }

    if (mode === 'cc') {
        for (const key of CONNECTION_CHAT_ONLY_FIELDS) {
            setOptionalConnectionField(nextProfile, key, profile?.[key]);
        }
        for (const key of CONNECTION_TEXT_ONLY_FIELDS) {
            delete nextProfile[key];
        }
    } else {
        for (const key of CONNECTION_TEXT_ONLY_FIELDS) {
            if (key === 'instruct-state') {
                const instructEnabled = profile?.[key] === true || profile?.[key] === 'true';
                if (instructEnabled) {
                    nextProfile[key] = 'true';
                } else {
                    delete nextProfile[key];
                }
                continue;
            }

            setOptionalConnectionField(nextProfile, key, profile?.[key]);
        }
        for (const key of CONNECTION_CHAT_ONLY_FIELDS) {
            delete nextProfile[key];
        }
    }

    if (existingProfile) {
        const previousProfile = structuredClone(existingProfile);
        Object.assign(existingProfile, nextProfile);
        await eventSource.emit(event_types.CONNECTION_PROFILE_UPDATED, previousProfile, existingProfile);
    } else {
        connectionManager.profiles.push(nextProfile);
        connectionManager.selectedProfile = nextProfile.id;
        await eventSource.emit(event_types.CONNECTION_PROFILE_CREATED, nextProfile);
    }

    saveSettingsDebounced?.();
    return structuredClone(nextProfile);
}

async function deleteConnectionProfile(id) {
    const profileId = String(id ?? '').trim();
    if (!profileId) {
        throw new Error('Connection profile id is required');
    }

    const connectionManager = extension_settings.connectionManager;
    if (!connectionManager) {
        throw new Error('Connection manager settings are unavailable');
    }
    connectionManager.profiles ??= [];

    const profileIndex = connectionManager.profiles.findIndex((profile) => profile.id === profileId);
    if (profileIndex === -1) {
        throw new Error('Connection profile not found');
    }

    const [deletedProfile] = connectionManager.profiles.splice(profileIndex, 1);
    const wasSelected = connectionManager.selectedProfile === profileId;
    if (wasSelected) {
        connectionManager.selectedProfile = '';
    }

    await eventSource.emit(event_types.CONNECTION_PROFILE_DELETED, deletedProfile);
    if (wasSelected) {
        await eventSource.emit(event_types.CONNECTION_PROFILE_LOADED, '<None>');
    }

    saveSettingsDebounced?.();
}

function getSelectedWorldInfo() {
    return Array.isArray(selected_world_info) ? [...selected_world_info] : [];
}

async function setSelectedWorldInfo(names) {
    selected_world_info.splice(0, selected_world_info.length, ...names.filter(Boolean));
    saveSettingsDebounced?.();
    await updateWorldInfoList();
}

export function getContext() {
    return {
        accountStorage,
        chat,
        characters,
        defaultAvatar: default_avatar,
        groups,
        humanizedDateTime,
        name1,
        name2,
        characterId: this_chid,
        groupId: selected_group,
        chatId: selected_group
            ? groups.find(x => x.id == selected_group)?.chat_id
            : (characters[this_chid]?.chat),
        getCurrentChatId,
        getRequestHeaders,
        reloadCurrentChat,
        renameChat,
        saveSettingsDebounced,
        onlineStatus: online_status,
        maxContext: Number(max_context),
        chatMetadata: chat_metadata,
        saveMetadataDebounced,
        streamingProcessor,
        eventSource,
        eventTypes: event_types,
        addOneMessage,
        deleteCharacterChatByName,
        deleteLastMessage,
        deleteSwipe,
        generate: Generate,
        sendStreamingRequest,
        sendGenerationRequest,
        stopGeneration,
        tokenizers,
        getTextTokens,
        /** @deprecated Use getTokenCountAsync instead */
        getTokenCount,
        getTokenCountAsync,
        extensionPrompts: extension_prompts,
        setExtensionPrompt,
        updateChatMetadata,
        saveChat: saveChatConditional,
        deleteGroupChatByName,
        openCharacterChat,
        openGroupById,
        openGroupChat,
        saveMetadata,
        sendSystemMessage,
        activateSendButtons,
        deactivateSendButtons,
        saveReply,
        sendMessageAsUser,
        substituteParams,
        substituteParamsExtended,
        SlashCommandParser,
        SlashCommand,
        SlashCommandArgument,
        SlashCommandNamedArgument,
        ARGUMENT_TYPE,
        executeSlashCommandsWithOptions,
        /** @deprecated Use SlashCommandParser.addCommandObject() instead */
        registerSlashCommand,
        /** @deprecated Use executeSlashCommandWithOptions instead */
        executeSlashCommands,
        timestampToMoment,
        /** @deprecated Handlebars for extensions are no longer supported. */
        registerHelper: () => { },
        registerMacro: MacrosParser.registerMacro.bind(MacrosParser),
        unregisterMacro: MacrosParser.unregisterMacro.bind(MacrosParser),
        registerFunctionTool: ToolManager.registerFunctionTool.bind(ToolManager),
        unregisterFunctionTool: ToolManager.unregisterFunctionTool.bind(ToolManager),
        isToolCallingSupported: ToolManager.isToolCallingSupported.bind(ToolManager),
        canPerformToolCalls: ToolManager.canPerformToolCalls.bind(ToolManager),
        ToolManager,
        registerDebugFunction,
        /** @deprecated Use renderExtensionTemplateAsync instead. */
        renderExtensionTemplate,
        renderExtensionTemplateAsync,
        registerDataBankScraper: ScraperManager.registerDataBankScraper.bind(ScraperManager),
        /** @deprecated Use callGenericPopup or Popup instead. */
        callPopup,
        callGenericPopup,
        showLoader,
        hideLoader,
        mainApi: main_api,
        listInstalledExtensions,
        setExtensionEnabled,
        extensionSettings: extension_settings,
        ModuleWorkerWrapper,
        getTokenizerModel,
        generateQuietPrompt,
        generateRaw,
        writeExtensionField,
        getThumbnailUrl,
        selectCharacterById,
        messageFormatting,
        shouldSendOnEnter,
        isMobile,
        t,
        translate,
        getCurrentLocale,
        addLocaleData,
        tags,
        tagMap: tag_map,
        menuType: menu_type,
        createCharacterData: create_save,
        createCharacter,
        /** @deprecated Legacy snake-case naming, compatibility with old extensions */
        event_types: event_types,
        Popup,
        POPUP_TYPE,
        POPUP_RESULT,
        chatCompletionSettings: oai_settings,
        textCompletionSettings: textgenerationwebui_settings,
        powerUserSettings: power_user,
        getCharacters,
        getCharacterCardFields,
        uuidv4,
        humanizedDateTime,
        updateMessageBlock,
        appendMediaToMessage,
        swipe: { left: swipe_left, right: swipe_right },
        variables: {
            local: {
                get: getLocalVariable,
                set: setLocalVariable,
            },
            global: {
                get: getGlobalVariable,
                set: setGlobalVariable,
            },
        },
        loadWorldInfo,
        getPromptTemplates,
        getWorldNames,
        getSelectedWorldInfo,
        listConnectionApiOptions,
        listConnectionModels,
        listConnectionSecrets,
        getConnectionSecretStatus,
        movePromptTemplate,
        deleteConnectionSecret,
        activateConnectionSecret,
        saveConnectionSecret,
        saveConnectionProfile,
        authorizeConnectionSecret,
        saveWorldInfo,
        savePromptTemplate,
        setSelectedWorldInfo,
        deleteConnectionProfile,
        reloadWorldInfoEditor: reloadEditor,
        updateWorldInfoList,
        createNewWorldInfo,
        deleteWorldInfo,
        convertCharacterBook,
        getWorldInfoPrompt,
        CONNECT_API_MAP,
        getTextGenServer,
        extractMessageFromData,
        getPresetManager,
        getChatCompletionModel,
        printMessages,
        clearChat,
        ChatCompletionService,
        TextCompletionService,
        ConnectionManagerRequestService,
        updateReasoningUI,
        parseReasoningFromString,
        unshallowCharacter,
        unshallowGroupMembers,
        symbols: {
            ignore: IGNORE_SYMBOL,
        },
    };
}

export default getContext;
