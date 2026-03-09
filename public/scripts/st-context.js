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
    extension_settings,
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
import { getChatCompletionModel, oai_settings } from './openai.js';
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
import { getTextGenServer, textgenerationwebui_settings } from './textgen-settings.js';
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
        getWorldNames,
        getSelectedWorldInfo,
        saveWorldInfo,
        setSelectedWorldInfo,
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
