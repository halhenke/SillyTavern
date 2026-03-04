import { menu_type } from './runtime/app-state-adapter.js';
import { CONNECT_API_MAP, main_api } from './runtime/api-adapter.js';
import { characters, getCharacters } from './runtime/character-adapter.js';
import { chat_metadata, getCurrentChatId, name1, name2, this_chid } from './runtime/chat-adapter.js';
import {
    activateSendButtons,
    addOneMessage,
    appendMediaToMessage,
    chat,
    clearChat,
    create_save,
    deactivateSendButtons,
    deleteLastMessage,
    getCharacterCardFields,
    openCharacterChat,
    printMessages,
    reloadCurrentChat,
    renameChat,
    saveChatConditional,
    saveReply,
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
import { selectCharacterById, sendSystemMessage, unshallowCharacter } from './runtime/session-adapter.js';
import { callPopup } from './runtime/ui-adapter.js';
import {
    extension_settings,
    ModuleWorkerWrapper,
    renderExtensionTemplate,
    renderExtensionTemplateAsync,
    saveMetadataDebounced,
    writeExtensionField,
} from './extensions.js';
import { groups, openGroupChat, selected_group, unshallowGroupMembers } from './group-chats.js';
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
import { convertCharacterBook, getWorldInfoPrompt, loadWorldInfo, reloadEditor, saveWorldInfo, updateWorldInfoList } from './world-info.js';
import { ChatCompletionService, TextCompletionService } from './custom-request.js';
import { ConnectionManagerRequestService } from './extensions/shared.js';
import { updateReasoningUI, parseReasoningFromString } from './reasoning.js';
import { IGNORE_SYMBOL } from './constants.js';

export function getContext() {
    return {
        accountStorage,
        chat,
        characters,
        groups,
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
        deleteLastMessage,
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
        openCharacterChat,
        openGroupChat,
        saveMetadata,
        sendSystemMessage,
        activateSendButtons,
        deactivateSendButtons,
        saveReply,
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
        saveWorldInfo,
        reloadWorldInfoEditor: reloadEditor,
        updateWorldInfoList,
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
