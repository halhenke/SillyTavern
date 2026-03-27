import {
    showdown,
    moment,
    DOMPurify,
    hljs,
    Handlebars,
    Popper,
    initLibraryShims,
    default as libs,
} from './lib.js';

import { humanizedDateTime, favsToHotswap, getMessageTimeStamp, dragElement, isMobile, initRossMods } from './scripts/RossAscends-mods.js';
import { userStatsHandler, statMesProcess, initStats } from './scripts/stats.js';
import {
    generateKoboldWithStreaming,
    kai_settings,
    loadKoboldSettings,
    getKoboldGenerationData,
    kai_flags,
    koboldai_settings,
    koboldai_setting_names,
    initKoboldSettings,
} from './scripts/kai-settings.js';

import {
    textgenerationwebui_settings as textgen_settings,
    loadTextGenSettings,
    generateTextGenWithStreaming,
    getTextGenGenerationData,
    textgen_types,
    parseTextgenLogprobs,
    parseTabbyLogprobs,
    initTextGenSettings,
} from './scripts/textgen-settings.js';

import {
    world_info,
    getWorldInfoPrompt,
    getWorldInfoSettings,
    setWorldInfoSettings,
    world_names,
    importEmbeddedWorldInfo,
    checkEmbeddedWorld,
    setWorldInfoButtonClass,
    importWorldInfo,
    wi_anchor_position,
    world_info_include_names,
    initWorldInfo,
} from './scripts/world-info.js';

import {
    groups,
    selected_group,
    saveGroupChat,
    getGroups,
    generateGroupWrapper,
    is_group_generating,
    resetSelectedGroup,
    select_group_chats,
    regenerateGroup,
    group_generation_id,
    getGroupChat,
    renameGroupMember,
    createNewGroupChat,
    getGroupAvatar,
    editGroup,
    deleteGroupChat,
    renameGroupChat,
    importGroupChat,
    getGroupBlock,
    getGroupCharacterCards,
    getGroupDepthPrompts,
} from './scripts/group-chats.js';

import {
    collapseNewlines,
    loadPowerUserSettings,
    playMessageSound,
    fixMarkdown,
    power_user,
    persona_description_positions,
    loadMovingUIState,
    getCustomStoppingStrings,
    MAX_CONTEXT_DEFAULT,
    MAX_RESPONSE_DEFAULT,
    renderStoryString,
    sortEntitiesList,
    flushEphemeralStoppingStrings,
    resetMovableStyles,
    forceCharacterEditorTokenize,
    applyPowerUserSettings,
    generatedTextFiltered,
    applyStylePins,
} from './scripts/power-user.js';

import {
    setOpenAIMessageExamples,
    setOpenAIMessages,
    setupChatCompletionPromptManager,
    prepareOpenAIMessages,
    sendOpenAIRequest,
    loadOpenAISettings,
    oai_settings,
    openai_messages_count,
    chat_completion_sources,
    getChatCompletionModel,
    proxies,
    loadProxyPresets,
    selected_proxy,
    initOpenAI,
} from './scripts/openai.js';

import {
    generateNovelWithStreaming,
    getNovelGenerationData,
    getKayraMaxContextTokens,
    loadNovelSettings,
    nai_settings,
    adjustNovelInstructionPrompt,
    parseNovelAILogprobs,
    novelai_settings,
    novelai_setting_names,
    initNovelAISettings,
} from './scripts/nai-settings.js';

import {
    initBookmarks,
    showBookmarksButtons,
    updateBookmarkDisplay,
} from './scripts/bookmarks.js';

import {
    horde_settings,
    loadHordeSettings,
    generateHorde,
    getStatusHorde,
    getHordeModels,
    adjustHordeGenerationParams,
    isHordeGenerationNotAllowed,
    MIN_LENGTH,
    initHorde,
} from './scripts/horde.js';

import {
    debounce,
    delay,
    trimToEndSentence,
    countOccurrences,
    isOdd,
    sortMoments,
    timestampToMoment,
    download,
    isDataURL,
    getCharaFilename,
    PAGINATION_TEMPLATE,
    waitUntilCondition,
    escapeRegex,
    resetScrollHeight,
    onlyUnique,
    getBase64Async,
    humanFileSize,
    Stopwatch,
    isValidUrl,
    ensureImageFormatSupported,
    flashHighlight,
    toggleDrawer,
    isElementInViewport,
    copyText,
    escapeHtml,
    saveBase64AsFile,
    uuidv4,
    equalsIgnoreCaseAndAccents,
    localizePagination,
    renderPaginationDropdown,
    paginationDropdownChangeHandler,
} from './scripts/utils.js';
import { debounce_timeout, GENERATION_TYPE_TRIGGERS, IGNORE_SYMBOL, inject_ids } from './scripts/constants.js';

import { cancelDebouncedMetadataSave, doDailyExtensionUpdatesCheck, extension_settings, initExtensions, loadExtensionSettings, runGenerationInterceptors, saveMetadataDebounced } from './scripts/extensions.js';
import { COMMENT_NAME_DEFAULT, CONNECT_API_MAP, executeSlashCommandsOnChatInput, initDefaultSlashCommands, isExecutingCommandsFromChatInput, pauseScriptExecution, stopScriptExecution, UNIQUE_APIS } from './scripts/slash-commands.js';
import {
    tag_map,
    tags,
    filterByTagState,
    isBogusFolder,
    isBogusFolderOpen,
    chooseBogusFolder,
    getTagBlock,
    loadTagsSettings,
    printTagFilters,
    getTagKeyForEntity,
    printTagList,
    createTagMapFromList,
    renameTagKey,
    importTags,
    tag_filter_type,
    compareTagsForSort,
    initTags,
    applyTagsOnCharacterSelect,
    applyTagsOnGroupSelect,
    tag_import_setting,
    applyCharacterTagsToMessageDivs,
} from './scripts/tags.js';
import { initSecrets, readSecretState } from './scripts/secrets.js';
import { NOTE_MODULE_NAME, initAuthorsNote, metadata_keys, setFloatingPrompt, shouldWIAddPrompt } from './scripts/authors-note.js';
import { registerPromptManagerMigration } from './scripts/PromptManager.js';
import { getRegexedString, regex_placement } from './scripts/extensions/regex/engine.js';
import { initLogprobs, saveLogprobsForActiveMessage } from './scripts/logprobs.js';
import { FILTER_STATES, FILTER_TYPES, FilterHelper, isFilterState } from './scripts/filters.js';
import { getCfgPrompt, getGuidanceScale, initCfg } from './scripts/cfg-scale.js';
import {
    force_output_sequence,
    formatInstructModeChat,
    formatInstructModePrompt,
    formatInstructModeExamples,
    formatInstructModeStoryString,
    getInstructStoppingSequences,
} from './scripts/instruct-mode.js';
import { initLocales, t } from './scripts/i18n.js';
import { getFriendlyTokenizerName, getTokenCount, getTokenCountAsync, initTokenizers } from './scripts/tokenizers.js';
import {
    user_avatar,
    getUserAvatars,
    getUserAvatar,
    setUserAvatar,
    initPersonas,
    setPersonaDescription,
    initUserAvatar,
    updatePersonaConnectionsAvatarList,
    isPersonaPanelOpen,
} from './scripts/personas.js';
import { getBackgrounds, initBackgrounds, loadBackgroundSettings, background_settings } from './scripts/backgrounds.js';
import { hideLoader, showLoader } from './scripts/loader.js';
import { BulkEditOverlay } from './scripts/BulkEditOverlay.js';
import { initTextGenModels } from './scripts/textgen-models.js';
import { appendFileContent, hasPendingFileAttachment, populateFileAttachment, decodeStyleTags, encodeStyleTags, isExternalMediaAllowed, preserveNeutralChat, restoreNeutralChat, formatCreatorNotes, initChatUtilities, addDOMPurifyHooks } from './scripts/chats.js';
import { getPresetManager, initPresetManager } from './scripts/preset-manager.js';
import { evaluateMacros, getLastMessageId, initMacros } from './scripts/macros.js';
import { currentUser, setUserControls } from './scripts/user.js';
import { POPUP_RESULT, POPUP_TYPE, Popup, callGenericPopup, fixToastrForDialogs } from './scripts/popup.js';
import { renderTemplate, renderTemplateAsync } from './scripts/templates.js';
import { initScrapers } from './scripts/scrapers.js';
import { initCustomSelectedSamplers, validateDisabledSamplers } from './scripts/samplerSelect.js';
import { DragAndDropHandler } from './scripts/dragdrop.js';
import { INTERACTABLE_CONTROL_CLASS, initKeyboard } from './scripts/keyboard.js';
import { initDynamicStyles } from './scripts/dynamic-styles.js';
import { initInputMarkdown } from './scripts/input-md-formatting.js';
import { initSystemPrompts } from './scripts/sysprompt.js';
import { registerExtensionSlashCommands as initExtensionSlashCommands } from './scripts/extensions-slashcommands.js';
import { ToolManager } from './scripts/tool-calling.js';
import { addShowdownPatch } from './scripts/util/showdown-patch.js';
import { applyBrowserFixes } from './scripts/browser-fixes.js';
import { initServerHistory } from './scripts/server-history.js';
import { initSettingsSearch } from './scripts/setting-search.js';
import { initBulkEdit } from './scripts/bulk-edit.js';
import { getContext } from './scripts/st-context.js';
import { extractReasoningFromData, initReasoning, parseReasoningInSwipes, PromptReasoning, ReasoningHandler, removeReasoningFromString, updateReasoningUI } from './scripts/reasoning.js';
import { bindAppStateCore, setMenuType as setMenuTypeCore, syncDefaultPrintTimeout, syncEntitiesFilter, syncIsChatSaving, syncMenuType } from './scripts/app-state-core.js';
import { getClientVersion as getClientVersionCore, syncClientVersion, syncConnectApiMap, syncMainApi, syncNaiSettings } from './scripts/api-core.js';
import { bindBackendStatusCore, cancelStatusCheck as cancelStatusCheckCore, displayOnlineStatus as displayOnlineStatusCore, resultCheckStatus as resultCheckStatusCore, setAbortStatusCheck, setOnlineStatus as setOnlineStatusCore, startStatusLoading as startStatusLoadingCore, stopStatusLoading as stopStatusLoadingCore } from './scripts/backend-status-core.js';
import { bindCharacterCore, characterToEntity as characterToEntityCore, closeAdvancedCharacterPopup as closeAdvancedCharacterPopupCore, createOrEditCharacter as createOrEditCharacterCore, deleteCharacter as deleteCharacterCore, doCharListDisplaySwitch as doCharListDisplaySwitchCore, getEntitiesList as getEntitiesListCore, getOneCharacter as getOneCharacterCore, groupToEntity as groupToEntityCore, importCharacter as importCharacterCore, importCharactersTags as importCharactersTagsCore, initCharacterDeleteBinding as initCharacterDeleteBindingCore, initCharacterEditorBindings as initCharacterEditorBindingsCore, initCharacterImportExportBindings as initCharacterImportExportBindingsCore, initCharacterPanelBindings as initCharacterPanelBindingsCore, initCharacterSearch as initCharacterSearchCore, openAlternateGreetings as openAlternateGreetingsCore, openCharacterWorldPopup as openCharacterWorldPopupCore, printCharacters as printCharactersCore, processDroppedFiles as processDroppedFilesCore, renameCharacter as characterCoreRename, selectImportedChar as selectImportedCharCore, syncCharacterGroupOverlay, syncCharacters, syncCreateSave as syncCharacterCreateSave, syncCropData, syncDepthPromptDepthDefault as syncCharacterDepthPromptDepthDefault, syncDepthPromptRoleDefault as syncCharacterDepthPromptRoleDefault, syncPrintCharactersDebounced, syncTalkativenessDefault as syncCharacterTalkativenessDefault, tagToEntity as tagToEntityCore, toggleAdvancedCharacterPopup as toggleAdvancedCharacterPopupCore } from './scripts/character-core.js';
import { bindChatCore, getCurrentChatId as getCurrentChatIdCore, setCharacterId as setCharacterIdCore, setCharacterName as setCharacterNameCore, syncChatMetadata, syncCommentAvatar, syncDefaultAvatar, syncDefaultUserAvatar, syncName1, syncName2, syncThisChid, syncUserAvatar } from './scripts/chat-core.js';
import { addOneMessage as addOneMessageCore, bindChatOperationsCore, clearChat as clearChatCore, delChat as delChatCore, deleteCharacterChatByName as deleteCharacterChatByNameCore, displayPastChats as displayPastChatsCore, formatGenerationTimer as formatGenerationTimerCore, formatSwipeCounter as formatSwipeCounterCore, getChat as getChatCore, getChatResult as getChatResultCore, getCurrentChatDetails as getCurrentChatDetailsCore, getFirstMessage as getFirstMessageCore, getPastCharacterChats as getPastCharacterChatsCore, importCharacterChat as importCharacterChatCore, initChatImportBindings as initChatImportBindingsCore, initChatManagementBindings as initChatManagementBindingsCore, openCharacterChat as openCharacterChatCore, printMessages as printMessagesCore, reloadCurrentChat as reloadCurrentChatCore, replaceCurrentChat as replaceCurrentChatCore, saveChatConditional as saveChatConditionalCore, syncChat, syncCreateSave, syncDisplayVersion, syncSystemAvatar, syncSystemUserName, updateChatMetadata as updateChatMetadataCore } from './scripts/chat-operations-core.js';
import { importExternalContent as importExternalContentCore, importFromURL as importFromURLCore } from './scripts/content-import-core.js';
import { addDebugFunctions as addDebugFunctionsCore, bindDebugCore } from './scripts/debug-core.js';
import { bindExtensionsCore, syncExtensionPromptRoles, syncExtensionPromptTypes, syncExtensionPrompts } from './scripts/extensions-core.js';
import { TempResponseLength, bindGenerationCore, buildCombinedPrompt as buildCombinedPromptCore, executeGenerationRequestFlow as executeGenerationRequestFlowCore, generateQuietPrompt as generateQuietPromptCore, generateRaw as generateRawCore, getGeneratingApi as getGeneratingApiCore, getNextMessageId as getNextMessageIdCore, getStoppingStrings as getStoppingStringsCore, handleGenerationError as handleGenerationErrorCore, prepareContextPackingState as prepareContextPackingStateCore, prepareCoreChatState as prepareCoreChatStateCore, prepareGenerationContextWindow as prepareGenerationContextWindowCore, prepareGenerationData as prepareGenerationDataCore, prepareGenerationEntryState as prepareGenerationEntryStateCore, prepareGenerationMessages as prepareGenerationMessagesCore, prepareMessageHistoryState as prepareMessageHistoryStateCore, preparePromptAssemblyState as preparePromptAssemblyStateCore, preparePromptAugmentationState as preparePromptAugmentationStateCore, preparePromptContextState as preparePromptContextStateCore, processCommands as processCommandsCore, removeLastMessage as removeLastMessageCore, shouldAutoContinue as shouldAutoContinueCore, stopGeneration as stopGenerationCore, syncAmountGen, syncDepthPromptDepthDefault, syncDepthPromptRoleDefault, syncMaxContext, syncOnlineStatus, syncStreamingProcessor, syncTalkativenessDefault, triggerAutoContinue as triggerAutoContinueCore } from './scripts/generation-core.js';
import { beginMessageEdit as beginMessageEditCore, bindMessageCore, cancelDeleteMode as cancelDeleteModeCore, cancelMessageEdit as cancelMessageEditCore, closeMessageEditor as closeMessageEditorCore, confirmDeleteMode as confirmDeleteModeCore, copyEditedMessage as copyEditedMessageCore, deleteEditedMessage as deleteEditedMessageCore, deleteSwipe as deleteSwipeCore, editedMessageId as editedMessageIdCore, getFirstDisplayedMessageId as getFirstDisplayedMessageIdCore, hideSwipeButtons as hideSwipeButtonsCore, initMessageCopyBinding as initMessageCopyBindingCore, isDeleteMode as isDeleteModeCore, messageEditAuto as messageEditAutoCore, messageEditDone as messageEditDoneCore, moveEditedMessageDown as moveEditedMessageDownCore, moveEditedMessageUp as moveEditedMessageUpCore, openMessageDelete as openMessageDeleteCore, selectMessageDeleteTarget as selectMessageDeleteTargetCore, setEditedMessageId as setEditedMessageIdCore, showSwipeButtons as showSwipeButtonsCore, swipe_left as swipeLeftCore, swipe_right as swipeRightCore, syncMesToSwipe as syncMesToSwipeCore, syncSwipeToMes as syncSwipeToMesCore, updateEditArrowClasses as updateEditArrowClassesCore, updateMessageBlock as updateMessageBlockCore, updateViewMessageIds as updateViewMessageIdsCore } from './scripts/message-core.js';
import { getRequestHeaders as getRequestHeadersCore, getThumbnailUrl as getThumbnailUrlCore, pingServer as pingServerCore, setCsrfToken } from './scripts/network-core.js';
import { bindParserCore, syncConverter } from './scripts/parser-core.js';
import { bindSessionCore, doNewChat as doNewChatCore, handleDeleteChat as handleDeleteChatCore, initCharacterManagementDropdownBindings as initCharacterManagementDropdownBindingsCore, newAssistantChat as newAssistantChatCore, renameGroupOrCharacterChat as renameGroupOrCharacterChatCore, resetChatState as resetChatStateCore, selectRightMenuWithAnimation as selectRightMenuWithAnimationCore, select_rm_characters as selectRmCharactersCore, select_rm_create as selectRmCreateCore, select_rm_info as selectRmInfoCore, select_selected_character as selectSelectedCharacterCore, sendTextareaMessage as sendTextareaMessageCore, setExternalAbortController as setExternalAbortControllerCore, syncActiveCharacter, syncActiveGroup, syncNeutralCharacterName, syncSystemMessageTypes, updateRemoteChatName as updateRemoteChatNameCore } from './scripts/session-core.js';
import { bindSettingsCore } from './scripts/settings-core.js';
import { activateSendButtons as activateSendButtonsCore, bindUiCore, deactivateSendButtons as deactivateSendButtonsCore, doDrawerOpenClick as doDrawerOpenClickCore, doNavbarIconClick as doNavbarIconClickCore, fixViewport as fixViewportCore, getSlideToggleOptions as getSlideToggleOptionsCore, hideStopButton as hideStopButtonCore, initEditTextareaAutoFit as initEditTextareaAutoFitCore, initExecutionControlBindings as initExecutionControlBindingsCore, initInlineDrawerBindings as initInlineDrawerBindingsCore, initOptionsMenu as initOptionsMenuCore, initRangeInputBindings as initRangeInputBindingsCore, initSendTextareaFocusRetention as initSendTextareaFocusRetentionCore, initStandaloneMode as initStandaloneModeCore, reloadMarkdownProcessor as reloadMarkdownProcessorCore, setAnimationDuration as setAnimationDurationCore, setSendButtonState as setSendButtonStateCore, showStopButton as showStopButtonCore, syncAnimationDuration, syncAnimationDurationDefault, syncAnimationEasing, syncIsSendPress, syncMaxInjectionDepth } from './scripts/ui-core.js';
import { accountStorage } from './scripts/util/AccountStorage.js';
import { initWelcomeScreen, openPermanentAssistantChat, openPermanentAssistantCard, getPermanentAssistantAvatar } from './scripts/welcome-screen.js';
import { initDataMaid } from './scripts/data-maid.js';
import { clearItemizedPrompts, deleteItemizedPrompts, findItemizedPromptSet, initItemizedPrompts, itemizedParams, itemizedPrompts, loadItemizedPrompts, promptItemize, replaceItemizedPromptText, saveItemizedPrompts } from './scripts/itemized-prompts.js';
import { getSystemMessageByType, initSystemMessages, SAFETY_CHAT, sendSystemMessage, system_message_types, system_messages } from './scripts/system-messages.js';
import { event_types, eventSource } from './scripts/events.js';

// API OBJECT FOR EXTERNAL WIRING
globalThis.SillyTavern = {
    libs,
    getContext,
};

syncConnectApiMap(CONNECT_API_MAP);
syncNaiSettings(nai_settings);
syncSystemMessageTypes(system_message_types);
syncUserAvatar(user_avatar);

export {
    user_avatar,
    setUserAvatar,
    getUserAvatars,
    getUserAvatar,
    nai_settings,
    isOdd,
    countOccurrences,
    renderTemplate,
    promptItemize,
    itemizedPrompts,
    saveItemizedPrompts,
    loadItemizedPrompts,
    itemizedParams,
    clearItemizedPrompts,
    replaceItemizedPromptText,
    deleteItemizedPrompts,
    findItemizedPromptSet,
    koboldai_settings,
    koboldai_setting_names,
    novelai_settings,
    novelai_setting_names,
    UNIQUE_APIS,
    CONNECT_API_MAP,
    system_messages,
    system_message_types,
    sendSystemMessage,
    getSystemMessageByType,
    event_types,
    eventSource,
};

/**
 * Wait for page to load before continuing the app initialization.
 */
await new Promise((resolve) => {
    if (document.readyState === 'complete') {
        resolve();
    } else {
        window.addEventListener('load', resolve);
    }
});

// Configure toast library:
toastr.options = {
    closeButton: false,
    progressBar: false,
    showDuration: 250,
    hideDuration: 250,
    timeOut: 4000,
    extendedTimeOut: 10000,
    showEasing: 'linear',
    hideEasing: 'linear',
    showMethod: 'fadeIn',
    hideMethod: 'fadeOut',
    escapeHtml: true,
    onHidden: function () {
        // If we have any dialog still open, the last "hidden" toastr will remove the toastr-container. We need to keep it alive inside the dialog though
        // so the toasts still show up inside there.
        fixToastrForDialogs();
    },
    onShown: function () {
        // Set tooltip to the notification message
        $(this).attr('title', t`Tap to close`);
    },
};

export const characterGroupOverlay = new BulkEditOverlay();
syncCharacterGroupOverlay(characterGroupOverlay);

// Markdown converter
export let mesForShowdownParse; //intended to be used as a context to compare showdown strings against
/** @type {import('showdown').Converter} */
export let converter;
syncConverter(converter);

// array for prompt token calculations

export const systemUserName = 'SillyTavern System';
syncSystemUserName(systemUserName);
export const neutralCharacterName = 'Assistant';
syncNeutralCharacterName(neutralCharacterName);
let default_user_name = 'User';
export let name1 = default_user_name;
syncName1(name1);
export let name2 = systemUserName;
syncName2(name2);
export let chat = [];
syncChat(chat);
let chatSaveTimeout;
export let isChatSaving = false;
syncIsChatSaving(isChatSaving);
let chat_create_date = '';
let firstRun = false;
let settingsReady = false;
let currentVersion = '0.0.0';
export let displayVersion = 'SillyTavern';
syncDisplayVersion(displayVersion);

let generation_started = new Date();
/** @type {import('./scripts/char-data.js').v1CharData[]} */
export let characters = [];
syncCharacters(characters);
/**
 * Stringified index of a currently chosen entity in the characters array.
 * @type {string|undefined} Yes, we hate it as much as you do.
 */
export let this_chid;
syncThisChid(this_chid);
export const default_avatar = 'img/ai4.png';
syncDefaultAvatar(default_avatar);
export const system_avatar = 'img/five.png';
syncSystemAvatar(system_avatar);
export const comment_avatar = 'img/quill.png';
syncCommentAvatar(comment_avatar);
export const default_user_avatar = 'img/user-default.png';
syncDefaultUserAvatar(default_user_avatar);
export let CLIENT_VERSION = 'SillyTavern:UNKNOWN:Cohee#1207'; // For Horde header
syncClientVersion(CLIENT_VERSION);
let optionsPopper = Popper.createPopper(document.getElementById('options_button'), document.getElementById('options'), {
    placement: 'top-start',
});
let exportPopper = Popper.createPopper(document.getElementById('export_button'), document.getElementById('export_format_popup'), {
    placement: 'left',
});

// Saved here for performance reasons
const chatElement = $('#chat');

let dialogueResolve = null;
let dialogueCloseStop = false;
export let chat_metadata = {};
syncChatMetadata(chat_metadata);
/** @type {StreamingProcessor} */
export let streamingProcessor = null;
syncStreamingProcessor(streamingProcessor);
let crop_data = undefined;
syncCropData(crop_data);
let scrollLock = false;
export let abortStatusCheck = new AbortController();
setAbortStatusCheck(abortStatusCheck);
bindBackendStatusCore();
bindAppStateCore();
bindParserCore({
    baseChatReplace,
    extractJsonFromData,
    extractMessageFromData,
    getBiasStrings,
    removeMacros,
    substituteParams,
    substituteParamsExtended,
});
bindMessageCore({
    addCopyToCodeBlocks,
    cleanUpMessage,
    Generate,
    isHordeGenerationNotAllowed,
    messageFormatting,
    saveChatDebounced,
    setSendButtonState,
    stopStreamingIfNeeded: () => {
        if (isStreamingEnabled() && streamingProcessor) {
            streamingProcessor.onStopStreaming();
        }
    },
    unblockGeneration,
    updateReasoningUI,
});
bindExtensionsCore({
    getExtensionPrompt,
    getExtensionPromptByName,
    getExtensionPromptMaxDepth,
    setExtensionPrompt,
});
bindDebugCore({
    forceOnboarding: async () => {
        firstRun = true;
        await saveSettings();
        location.reload();
    },
    getContext,
    getSettings: () => settings,
});
bindCharacterCore({
    buildAvatarList,
    characterToEntity,
    clearChat,
    createTagMapFromList,
    duplicateCharacter,
    getActiveCharacter: () => active_character,
    getChat: () => chat,
    getCurrentChatId,
    getFirstMessage: getFirstMessageCore,
    getCharacters,
    getPastCharacterChats,
    groupToEntity,
    preserveNeutralChat,
    printMessages,
    printCharacters,
    reloadCurrentChat,
    renameGroupMember,
    resetChatState,
    restoreNeutralChat,
    saveChatConditional,
    saveSettingsDebounced: (...args) => saveSettingsDebounced(...args),
    selectCharacterById,
    setActiveCharacter,
    setCharacterId,
    select_rm_info,
});
bindChatCore({
    getUserAvatar,
    setUserName,
});
bindSessionCore({
    cancelTtsPlay,
    checkEmbeddedWorld,
    createNewGroupChat,
    createOrEditCharacter,
    deleteCharacterChatByName,
    deleteGroupChat,
    delChat,
    doNavbarIconClick,
    formatCreatorNotes,
    getContinueOnSend: () => power_user.continue_on_send,
    getEntitiesList,
    getCharactersPerPageDefault: () => per_page_default,
    getSelectedGroup: () => selected_group,
    getSelectedButton: () => selected_button,
    getSystemMessageByType,
    hasPendingFileAttachment,
    isExternalMediaAllowed,
    isExecutingCommandsFromChatInput: () => isExecutingCommandsFromChatInput,
    openPermanentAssistantChat,
    printCharacters,
    readAvatarLoad: read_avatar_load,
    renameGroupChat,
    selectCharacterById,
    sendSystemMessage,
    setWorldInfoButtonClass,
    setActiveCharacter,
    setActiveGroup,
    setCharacterId,
    setCharacterName,
    setScenarioOverride,
    unshallowCharacter,
});
bindGenerationCore({
    adjustHordeGenerationParams,
    adjustNovelInstructionPrompt,
    addPersonaDescriptionExtensionPrompt,
    appendFileContent,
    emitGenerationAfterCommands: (type, options, dryRun) => eventSource.emit(event_types.GENERATION_AFTER_COMMANDS, type, options, dryRun),
    emitGenerationStarted: (type, options, dryRun) => eventSource.emit(event_types.GENERATION_STARTED, type, options, dryRun),
    emitImpersonateReady: (message) => eventSource.emit(event_types.IMPERSONATE_READY, message),
    Generate,
    addChatsPreamble,
    addChatsSeparator,
    collapseNewlines,
    createPromptReasoning: () => new PromptReasoning(),
    createRawPrompt,
    createStreamingProcessor: (type, forceName2, generationStarted, continueMag, promptReasoning) => new StreamingProcessor(type, forceName2, generationStarted, continueMag, promptReasoning),
    deactivateSendButtons,
    doChatInject,
    executeSlashCommandsOnChatInput,
    flushWIDepthInjections,
    formatInstructModeExamples,
    formatInstructModeStoryString,
    formatPromptMessage: (chatItem, depth) => getRegexedString(chatItem.mes, chatItem.is_user ? regex_placement.USER_INPUT : regex_placement.AI_OUTPUT, { isPrompt: true, depth }),
    formatPromptReasoning: (reasoning, depth) => getRegexedString(String(reasoning ?? ''), regex_placement.REASONING, { isPrompt: true, depth }),
    generateHorde,
    getAnimationDuration: () => animation_duration,
    getAllExtensionPrompts,
    getAbortController: () => abortController,
    getAutoContinueConfig: () => power_user.auto_continue,
    getBeforePromptType: () => extension_prompt_types.BEFORE_PROMPT,
    getCharacterCardFields,
    getCfgPrompt,
    getCollapseNewlinesEnabled: () => power_user.collapse_newlines,
    getCurrentInputText: () => String($('#send_textarea').val()),
    getConsoleLogPromptsEnabled: () => power_user.console_log_prompts,
    getCustomStoppingStrings,
    getDepthPromptId: () => inject_ids.DEPTH_PROMPT,
    getDepthPromptIndexId: (index) => inject_ids.DEPTH_PROMPT_INDEX(index),
    getExtensionPrompt,
    getExtensionPromptRoleByName,
    getForceOutputSequences: () => ({
        first: force_output_sequence.FIRST,
        last: force_output_sequence.LAST,
    }),
    getGenerationTrigger: (type) => GENERATION_TYPE_TRIGGERS.includes(type) ? type : 'normal',
    getTrimSpacesEnabled: () => power_user.trim_spaces,
    getGenericSystemMessageType: () => system_message_types.GENERIC,
    getGenerateUrl,
    getGroups: () => groups,
    getGroupDepthPrompts,
    getGuidanceScale,
    getHordeAdjustConfig: () => ({
        autoAdjustContextLength: horde_settings.auto_adjust_context_length,
        autoAdjustResponseLength: horde_settings.auto_adjust_response_length,
    }),
    getInChatPromptType: () => extension_prompt_types.IN_CHAT,
    getInPromptPromptType: () => extension_prompt_types.IN_PROMPT,
    getInstructionPrompt: (system) => main_api !== 'openai' && power_user.sysprompt.enabled
        ? substituteParams(power_user.prefer_character_prompt && system ? system : power_user.sysprompt.content)
        : '',
    getIsGroupGenerating: () => is_group_generating,
    getIsInstructEnabled: () => power_user.instruct.enabled,
    getIsKoboldStreamingUnsupported: () => main_api == 'kobold' && kai_settings.streaming_kobold && !kai_flags.can_use_streaming,
    getInstructWrap: () => power_user.instruct.wrap,
    getInstructStoppingSequences,
    getKoboldGenerationData,
    getMinLength: () => MIN_LENGTH,
    getKoboldSettingsConfig: () => ({
        kaiSettings: kai_settings,
        kaiFlags: kai_flags,
        koboldaiSettings: koboldai_settings,
        koboldaiSettingNames: koboldai_setting_names,
    }),
    getGeneratingApiConfig: () => ({
        mainApi: main_api,
        openAiSource: oai_settings.chat_completion_source,
        textgenType: textgen_settings.type,
        textgenOobaType: textgen_types.OOBA,
    }),
    getNamesAsStopStrings: () => power_user.context.names_as_stop_strings,
    getNovelGenerationData,
    getNovelSettingsConfig: () => ({
        naiSettings: nai_settings,
        novelaiSettings: novelai_settings,
        novelaiSettingNames: novelai_setting_names,
    }),
    getOpenAiMaxTokens: () => oai_settings.openai_max_tokens,
    getOpenAiMessagesCount: () => openai_messages_count,
    getPinExamples: () => power_user.pin_examples,
    getPromptMetadataExtras: () => ({
        authorsNoteString: extension_prompts['2_floating_prompt']?.value || '',
        chatVectorsString: extension_prompts['3_vectors']?.value || '',
        dataBankVectorsString: extension_prompts['4_vectors_data_bank']?.value || '',
        smartContextString: extension_prompts['chromadb']?.value || '',
        summarizeString: extension_prompts['1_memory']?.value || '',
    }),
    getSelectedPresetName: () => getPresetManager()?.getSelectedPresetName() || '',
    getStoryStringConfig: () => ({
        position: power_user.context.story_string_position,
        depth: power_user.context.story_string_depth ?? 1,
        role: power_user.context.story_string_role ?? extension_prompt_roles.SYSTEM,
        stripExamples: power_user.strip_examples,
    }),
    getStoppingStrings,
    getOaiSendIfEmpty: () => oai_settings.send_if_empty,
    getSyspromptConfig: () => ({
        enabled: power_user.sysprompt.enabled,
        preferCharacterPrompt: power_user.prefer_character_prompt,
        content: power_user.sysprompt.content ?? '',
        preferCharacterJailbreak: power_user.prefer_character_jailbreak,
        postHistory: power_user.sysprompt.post_history ?? '',
    }),
    getTextareaText: () => String($('#send_textarea').val()),
    getUserAlignmentMessage: () => power_user.instruct.user_alignment_message,
    getMaxContextSize,
    getTokenCount,
    getTokenCountAsync,
    getTokenPadding: () => power_user.token_padding,
    getTextGenGenerationData,
    getTokenizerName: () => getFriendlyTokenizerName(main_api).tokenizerName || '',
    getWiAnchorBefore: () => wi_anchor_position.before,
    getWorldInfoIncludeNames: () => world_info_include_names,
    getWorldInfoPrompt,
    generateGroupWrapper,
    getSelectedGroup: () => selected_group,
    getAllowWIScan: () => extension_settings.note.allowWIScan,
    hasPendingFileAttachment,
    hideStopButton,
    hideSwipeButtons,
    isCharacterEditMenu: () => menu_type == 'character_edit',
    isHordeGenerationNotAllowed,
    isStreamingEnabled,
    extractImageFromData,
    extractMultiSwipes,
    extractReasoningFromData,
    extractTitleFromData,
    hasToolCalls: (...args) => ToolManager.hasToolCalls(...args),
    invokeFunctionTools: (...args) => ToolManager.invokeFunctionTools(...args),
    formatMessageHistoryItem,
    formatInstructModeChat,
    formatInstructModePrompt,
    normalizeReasoningText: (reasoning) => getRegexedString(reasoning, regex_placement.REASONING),
    parseMesExamples,
    parseAndSaveLogprobs,
    pingServer: pingServerCore,
    playMessageSound,
    removeDepthPrompts,
    removeReasoningFromString,
    renderStoryString,
    saveChatConditional,
    saveReply,
    sendMessageAsUser,
    sendGenerationRequest,
    sendOpenAIRequest,
    sendSystemMessage,
    sendStreamingRequest,
    setAbortController: (controller) => abortController = controller,
    setCharacterId,
    setCharacterName,
    setChatTainted: () => chat_metadata['tainted'] = true,
    setCustomWorldInfoDepthPrompt: (depth, role, value) => setExtensionPrompt(inject_ids.CUSTOM_WI_DEPTH_ROLE(depth, role), value, extension_prompt_types.IN_CHAT, depth, false, role),
    setExtensionPrompt,
    setGeneratedTitle: (value) => kobold_horde_model = value,
    setImpersonationText: (message) => $('#send_textarea').val(message)[0].dispatchEvent(new Event('input', { bubbles: true })),
    setOpenAiMaxTokens: (value) => oai_settings.openai_max_tokens = value,
    setGenerationParamsFromPreset,
    setGenerationProgress,
    setInContextMessages,
    setQuietPrompt: (value) => setExtensionPrompt(inject_ids.QUIET_PROMPT, value, extension_prompt_types.IN_PROMPT, 0, true),
    setSendButtonState,
    setFloatingPrompt,
    setStreamingProcessor: (value) => {
        streamingProcessor = value;
        syncStreamingProcessor(streamingProcessor);
    },
    setOpenAIMessageExamples,
    setOpenAIMessages,
    setStoryStringPrompt: (value, depth, role) => setExtensionPrompt(inject_ids.STORY_STRING, value, extension_prompt_types.IN_CHAT, depth, false, role),
    clearStoryStringPrompt: () => setExtensionPrompt(inject_ids.STORY_STRING, '', extension_prompt_types.IN_CHAT, 0),
    shouldIncludePersonaInStoryString: () => power_user.persona_description_position == persona_description_positions.IN_PROMPT,
    shouldAutoSwipeResult: (message) => !abortController?.signal?.aborted && power_user.auto_swipe && generatedTextFiltered(message),
    showApiError: (message) => toastr.error(message, t`API Error`, { preventDuplicates: true }),
    showKoboldStreamingUnsupported: () => toastr.error(t`Streaming is enabled, but the version of Kobold used does not support token streaming.`, undefined, { timeOut: 10000, preventDuplicates: true }),
    showStopButton,
    showServerUnreachable: () => toastr.error(t`Verify that the server is running and accessible.`, t`ST Server cannot be reached`),
    showToolCallError: (...args) => ToolManager.showToolCallError(...args),
    showTextGenerationError: (message) => toastr.error(message, t`Text generation error`, { timeOut: 10000, extendedTimeOut: 20000 }),
    swipeRight: () => swipe_right(),
    trimToEndSentence,
    triggerContinue: () => $('#option_continue').trigger('click'),
    triggerAutoContinue,
    unshallowCharacter,
    unblockGeneration,
    prepareOpenAIMessages,
    runGenerationInterceptors,
});
bindChatOperationsCore({
    activateSendButtons,
    addCopyToCodeBlocks,
    appendMediaToMessage,
    applyCharacterTagsToMessageDivs,
    applyStylePins,
    cancelDebouncedChatSave,
    cancelDebouncedMetadataSave,
    cancelDeleteMode: () => cancelDeleteModeCore(css_send_form_display),
    closeMessageEditor,
    createOrEditCharacter,
    deactivateSendButtons,
    deleteSwipe,
    extractMessageBias,
    formatCharacterAvatar,
    getChatTruncation: () => power_user.chat_truncation,
    getCharacterAvatar,
    getCharacterCardFields,
    getCharacters,
    getGroupChat,
    getItemizedPrompts: () => itemizedPrompts,
    getMaxContextSize,
    getSelectedGroup: () => selected_group,
    hideSwipeButtons,
    isDeleteMode: () => isDeleteModeCore,
    loadItemizedPrompts,
    messageFormatting,
    preserveNeutralChat,
    processDroppedFiles,
    renameChat,
    resetChatState,
    resetExtensionPrompts: () => {
        extension_prompts = {};
        syncExtensionPrompts(extension_prompts);
        return extension_prompts;
    },
    resetItemizedPrompts: () => {
        itemizedPrompts.length = 0;
        return itemizedPrompts;
    },
    restoreNeutralChat,
    saveChat,
    saveCharacterDebounced: (...args) => saveCharacterDebounced(...args),
    saveItemizedPrompts,
    scrollChatToBottom,
    saveReply,
    sendMessageAsUser,
    setChatMetadata: (value) => {
        chat_metadata = value;
        syncChatMetadata(chat_metadata);
    },
    setIsChatSaving: (value) => {
        isChatSaving = Boolean(value);
        syncIsChatSaving(isChatSaving);
    },
    select_selected_character,
    showMoreMessages,
    showSwipeButtons,
    shouldShowTimestampModelIcon: () => power_user.timestamp_model_icon,
    swipe_left,
    swipe_right,
    unshallowCharacter,
    updateRemoteChatName,
    updateBookmarkDisplay,
    updateReasoningUI,
});
bindUiCore({
    addCopyToCodeBlocks,
    callPopup,
    debounce,
    delay,
    favsToHotswap,
    pauseScriptExecution,
    stopGeneration,
    stopScriptExecution,
    resetMovableStyles,
    resetScrollHeight,
    scrollChatToBottom,
    showBookmarksButtons,
});
export let charDragDropHandler = null;

/** @type {debounce_timeout} The debounce timeout used for chat/settings save. debounce_timeout.long: 1.000 ms */
export const DEFAULT_SAVE_EDIT_TIMEOUT = debounce_timeout.relaxed;
/** @type {debounce_timeout} The debounce timeout used for printing. debounce_timeout.quick: 100 ms */
export const DEFAULT_PRINT_TIMEOUT = debounce_timeout.quick;
syncDefaultPrintTimeout(DEFAULT_PRINT_TIMEOUT);

export const saveSettingsDebounced = debounce((loopCounter = 0) => saveSettings(loopCounter), DEFAULT_SAVE_EDIT_TIMEOUT);
export const saveCharacterDebounced = debounce(() => $('#create_button').trigger('click'), DEFAULT_SAVE_EDIT_TIMEOUT);
bindSettingsCore({
    saveSettings,
    saveSettingsDebounced,
    saveMetadata,
    saveCharacterDebounced,
});

/**
 * Prints the character list in a debounced fashion without blocking, with a delay of 100 milliseconds.
 * Use this function instead of a direct `printCharacters()` whenever the reprinting of the character list is not the primary focus.
 *
 * The printing will also always reprint all filter options of the global list, to keep them up to date.
 */
export const printCharactersDebounced = debounce(() => { printCharacters(false); }, DEFAULT_PRINT_TIMEOUT);
syncPrintCharactersDebounced(printCharactersDebounced);

/**
 * @enum {number} Extension prompt types
 */
export const extension_prompt_types = {
    NONE: -1,
    IN_PROMPT: 0,
    IN_CHAT: 1,
    BEFORE_PROMPT: 2,
};
syncExtensionPromptTypes(extension_prompt_types);

/**
 * @enum {number} Extension prompt roles
 */
export const extension_prompt_roles = {
    SYSTEM: 0,
    USER: 1,
    ASSISTANT: 2,
};
syncExtensionPromptRoles(extension_prompt_roles);

export const MAX_INJECTION_DEPTH = 10000;
syncMaxInjectionDepth(MAX_INJECTION_DEPTH);

async function getClientVersion() {
    const versionInfo = await getClientVersionCore();
    if (versionInfo) {
        CLIENT_VERSION = versionInfo.clientVersion;
        displayVersion = versionInfo.displayVersion;
        currentVersion = versionInfo.currentVersion;
    }
}

export function reloadMarkdownProcessor() {
    converter = reloadMarkdownProcessorCore();
    return converter;
}

export function getCurrentChatId() {
    return getCurrentChatIdCore();
}

export const talkativeness_default = 0.5;
syncTalkativenessDefault(talkativeness_default);
syncCharacterTalkativenessDefault(talkativeness_default);
export const depth_prompt_depth_default = 4;
syncDepthPromptDepthDefault(depth_prompt_depth_default);
syncCharacterDepthPromptDepthDefault(depth_prompt_depth_default);
export const depth_prompt_role_default = 'system';
syncDepthPromptRoleDefault(depth_prompt_role_default);
syncCharacterDepthPromptRoleDefault(depth_prompt_role_default);
const per_page_default = 50;

/**
 * The type of the right menu
 * @typedef {'characters' | 'character_edit' | 'create' | 'group_edit' | 'group_create' | '' } MenuType
 */

/**
 * The type of the right menu that is currently open
 * @type {MenuType}
 */
export let menu_type = '';

export let selected_button = ''; //which button pressed

//create pole save
export let create_save = {
    name: '',
    description: '',
    creator_notes: '',
    post_history_instructions: '',
    character_version: '',
    system_prompt: '',
    tags: '',
    creator: '',
    personality: '',
    first_message: '',
    /** @type {FileList|null} */
    avatar: null,
    scenario: '',
    mes_example: '',
    world: '',
    talkativeness: talkativeness_default,
    alternate_greetings: [],
    depth_prompt_prompt: '',
    depth_prompt_depth: depth_prompt_depth_default,
    depth_prompt_role: depth_prompt_role_default,
    extensions: {},
    extra_books: [],
};
syncCreateSave(create_save);
syncCharacterCreateSave(create_save);

//animation right menu
export const ANIMATION_DURATION_DEFAULT = 125;
syncAnimationDurationDefault(ANIMATION_DURATION_DEFAULT);
export let animation_duration = ANIMATION_DURATION_DEFAULT;
syncAnimationDuration(animation_duration);
export let animation_easing = 'ease-in-out';
syncAnimationEasing(animation_easing);
let popup_type = '';
let chat_file_for_del = '';
export let online_status = 'no_connection';
syncOnlineStatus(online_status);

export let is_send_press = false; //Send generation
syncIsSendPress(is_send_press);

//message editing
var this_edit_mes_id;

//settings
export let settings;
export let amount_gen = 80; //default max length of AI generated responses
syncAmountGen(amount_gen);
export let max_context = 2048;
syncMaxContext(max_context);

var swipes = true;
export let extension_prompts = {};
syncExtensionPrompts(extension_prompts);

export let main_api;// = "kobold";
syncMainApi(main_api);
/** @type {AbortController} */
let abortController;

//css
var css_send_form_display = $('<div id=send_form></div>').css('display');

var kobold_horde_model = '';

export let token;


/** The tag of the active character. (NOT the id) */
export let active_character = '';
syncActiveCharacter(active_character);
/** The tag of the active group. (Coincidentally also the id) */
export let active_group = '';
syncActiveGroup(active_group);

export const entitiesFilter = new FilterHelper(printCharactersDebounced);
syncEntitiesFilter(entitiesFilter);

export function getRequestHeaders({ omitContentType = false } = {}) {
    return getRequestHeadersCore({ omitContentType });
}

export function getSlideToggleOptions() {
    return getSlideToggleOptionsCore();
}

$.ajaxPrefilter((options, originalOptions, xhr) => {
    xhr.setRequestHeader('X-CSRF-Token', token);
});

/**
 * Pings the STserver to check if it is reachable.
 * @returns {Promise<boolean>} True if the server is reachable, false otherwise.
 */
export async function pingServer() {
    return pingServerCore();
}

//MARK: firstLoadInit
async function firstLoadInit() {
    try {
        const tokenResponse = await fetch('/csrf-token');
        const tokenData = await tokenResponse.json();
        token = tokenData.token;
        setCsrfToken(token);
    } catch {
        toastr.error(t`Couldn't get CSRF token. Please refresh the page.`, t`Error`, { timeOut: 0, extendedTimeOut: 0, preventDuplicates: true });
        throw new Error('Initialization failed');
    }

    showLoader();
    registerPromptManagerMigration();
    initStandaloneMode();
    initLibraryShims();
    addShowdownPatch(showdown);
    addDOMPurifyHooks();
    reloadMarkdownProcessor();
    applyBrowserFixes();
    await getClientVersion();
    await initSecrets();
    await readSecretState();
    await initLocales();
    initChatUtilities();
    initDefaultSlashCommands();
    initTextGenModels();
    initOpenAI();
    initTextGenSettings();
    initKoboldSettings();
    initNovelAISettings();
    initSystemPrompts();
    initExtensions();
    initExtensionSlashCommands();
    ToolManager.initToolSlashCommands();
    await initPresetManager();
    await initSystemMessages();
    await getSettings();
    initKeyboard();
    initDynamicStyles();
    initTags();
    initBookmarks();
    initMacros();
    await getUserAvatars(true, user_avatar);
    await getCharacters();
    await getBackgrounds();
    await initTokenizers();
    initBackgrounds();
    initAuthorsNote();
    await initPersonas();
    initWorldInfo();
    initHorde();
    initRossMods();
    initStats();
    initCfg();
    initLogprobs();
    initInputMarkdown();
    initServerHistory();
    initSettingsSearch();
    initBulkEdit();
    initReasoning();
    initWelcomeScreen();
    await initScrapers();
    initCustomSelectedSamplers();
    initDataMaid();
    initItemizedPrompts();
    addDebugFunctions();
    doDailyExtensionUpdatesCheck();
    await hideLoader();
    await fixViewport();
    await eventSource.emit(event_types.APP_READY);
}

async function fixViewport() {
    return fixViewportCore();
}

function initStandaloneMode() {
    return initStandaloneModeCore();
}

function cancelStatusCheck(reason = 'Manually cancelled status check') {
    abortStatusCheck = cancelStatusCheckCore(reason);
    setAbortStatusCheck(abortStatusCheck);
    return abortStatusCheck;
}

export function displayOnlineStatus() {
    return displayOnlineStatusCore();
}

/**
 * Sets the duration of JS animations.
 * @param {number} ms Duration in milliseconds. Resets to default if null.
 */
export function setAnimationDuration(ms = null) {
    animation_duration = setAnimationDurationCore(ms);
    syncAnimationDuration(animation_duration);
    return animation_duration;
}

/**
 * Sets the currently active character
 * @param {object|number|string} [entityOrKey] - An entity with id property (character, group, tag), or directly an id or tag key. If not provided, the active character is reset to `null`.
 */
export function setActiveCharacter(entityOrKey) {
    active_character = entityOrKey ? getTagKeyForEntity(entityOrKey) : null;
    if (active_character) active_group = null;
    syncActiveCharacter(active_character);
    syncActiveGroup(active_group);
}

/**
 * Sets the currently active group.
 * @param {object|number|string} [entityOrKey] - An entity with id property (character, group, tag), or directly an id or tag key. If not provided, the active group is reset to `null`.
 */
export function setActiveGroup(entityOrKey) {
    active_group = entityOrKey ? getTagKeyForEntity(entityOrKey) : null;
    if (active_group) active_character = null;
    syncActiveCharacter(active_character);
    syncActiveGroup(active_group);
}

export function startStatusLoading() {
    return startStatusLoadingCore();
}

export function stopStatusLoading() {
    return stopStatusLoadingCore();
}

export function resultCheckStatus() {
    return resultCheckStatusCore();
}

/**
 * Switches the currently selected character to the one with the given ID. (character index, not the character key!)
 *
 * If the character ID doesn't exist, if the chat is being saved, or if a group is being generated, this function does nothing.
 * If the character is different from the currently selected one, it will clear the chat and reset any selected character or group.
 * @param {number} id The ID of the character to switch to.
 * @param {object} [options] Options for the switch.
 * @param {boolean} [options.switchMenu=true] Whether to switch the right menu to the character edit menu if the character is already selected.
 * @returns {Promise<void>} A promise that resolves when the character is switched.
 */
export async function selectCharacterById(id, { switchMenu = true } = {}) {
    if (characters[id] === undefined) {
        return;
    }

    if (isChatSaving) {
        toastr.info(t`Please wait until the chat is saved before switching characters.`, t`Your chat is still saving...`);
        return;
    }

    if (selected_group && is_group_generating) {
        return;
    }

    if (selected_group || String(this_chid) !== String(id)) {
        //if clicked on a different character from what was currently selected
        if (!is_send_press) {
            await clearChat();
            cancelTtsPlay();
            resetSelectedGroup();
            this_edit_mes_id = setEditedMessageIdCore(undefined);
            selected_button = 'character_edit';
            setCharacterId(id);
            chat.length = 0;
            chat_metadata = {};
            syncChatMetadata(chat_metadata);
            await getChat();
        }
    } else {
        //if clicked on character that was already selected
        switchMenu && (selected_button = 'character_edit');
        await unshallowCharacter(this_chid);
        select_selected_character(this_chid, { switchMenu });
    }
}

/**
 * Prints the global character list, optionally doing a full refresh of the list
 * Use this function whenever the reprinting of the character list is the primary focus, otherwise using `printCharactersDebounced` is preferred for a cleaner, non-blocking experience.
 *
 * The printing will also always reprint all filter options of the global list, to keep them up to date.
 *
 * @param {boolean} fullRefresh - If true, the list is fully refreshed and the navigation is being reset
 */
export async function printCharacters(fullRefresh = false) {
    return printCharactersCore(fullRefresh);
}

/** @typedef {object} Character - A character */
/** @typedef {object} Group - A group */

/**
 * @typedef {object} Entity - Object representing a display entity
 * @property {Character|Group|import('./scripts/tags.js').Tag|*} item - The item
 * @property {string|number} id - The id
 * @property {'character'|'group'|'tag'} type - The type of this entity (character, group, tag)
 * @property {Entity[]?} [entities=null] - An optional list of entities relevant for this item
 * @property {number?} [hidden=null] - An optional number representing how many hidden entities this entity contains
 * @property {boolean?} [isUseless=null] - Specifies if the entity is useless (not relevant, but should still be displayed for consistency) and should be displayed greyed out
 */

/**
 * Converts the given character to its entity representation
 *
 * @param {Character} character - The character
 * @param {string|number} id - The id of this character
 * @returns {Entity} The entity for this character
 */
export function characterToEntity(character, id) {
    return characterToEntityCore(character, id);
}

/**
 * Converts the given group to its entity representation
 *
 * @param {Group} group - The group
 * @returns {Entity} The entity for this group
 */
export function groupToEntity(group) {
    return groupToEntityCore(group);
}

/**
 * Converts the given tag to its entity representation
 *
 * @param {import('./scripts/tags.js').Tag} tag - The tag
 * @returns {Entity} The entity for this tag
 */
export function tagToEntity(tag) {
    return tagToEntityCore(tag);
}

/**
 * Builds the full list of all entities available
 *
 * They will be correctly marked and filtered.
 *
 * @param {object} param0 - Optional parameters
 * @param {boolean} [param0.doFilter] - Whether this entity list should already be filtered based on the global filters
 * @param {boolean} [param0.doSort] - Whether the entity list should be sorted when returned
 * @returns {Entity[]} All entities
 */
export function getEntitiesList({ doFilter = false, doSort = true } = {}) {
    return getEntitiesListCore({ doFilter, doSort });
}

export async function getOneCharacter(avatarUrl) {
    return getOneCharacterCore(avatarUrl);
}

function getCharacterSource(chId = this_chid) {
    const character = characters[chId];

    if (!character) {
        return '';
    }

    const chubId = characters[chId]?.data?.extensions?.chub?.full_path;

    if (chubId) {
        return `https://chub.ai/characters/${chubId}`;
    }

    const pygmalionId = characters[chId]?.data?.extensions?.pygmalion_id;

    if (pygmalionId) {
        return `https://pygmalion.chat/${pygmalionId}`;
    }

    const githubRepo = characters[chId]?.data?.extensions?.github_repo;

    if (githubRepo) {
        return `https://github.com/${githubRepo}`;
    }

    const sourceUrl = characters[chId]?.data?.extensions?.source_url;

    if (sourceUrl) {
        return sourceUrl;
    }

    const risuId = characters[chId]?.data?.extensions?.risuai?.source;

    if (Array.isArray(risuId) && risuId.length && typeof risuId[0] === 'string' && risuId[0].startsWith('risurealm:')) {
        const realmId = risuId[0].split(':')[1];
        return `https://realm.risuai.net/character/${realmId}`;
    }

    const perchanceSlug = characters[chId]?.data?.extensions?.perchance_data?.slug;

    if (perchanceSlug) {
        return `https://perchance.org/ai-character-chat?data=${perchanceSlug}`;
    }

    return '';
}

export async function getCharacters() {
    const response = await fetch('/api/characters/all', {
        method: 'POST',
        headers: getRequestHeaders(),
        body: JSON.stringify({}),
    });
    if (response.ok) {
        const previousAvatar = this_chid !== undefined ? characters[this_chid]?.avatar : null;
        characters.splice(0, characters.length);
        const getData = await response.json();
        for (let i = 0; i < getData.length; i++) {
            characters[i] = getData[i];
            characters[i]['name'] = DOMPurify.sanitize(characters[i]['name']);

            // For dropped-in cards
            if (!characters[i]['chat']) {
                characters[i]['chat'] = `${characters[i]['name']} - ${humanizedDateTime()}`;
            }

            characters[i]['chat'] = String(characters[i]['chat']);
        }

        if (previousAvatar) {
            const newCharacterId = characters.findIndex(x => x.avatar === previousAvatar);
            if (newCharacterId >= 0) {
                setCharacterId(newCharacterId);
                await selectCharacterById(newCharacterId, { switchMenu: false });
            } else {
                await Popup.show.text(t`ERROR: The active character is no longer available.`, t`The page will be refreshed to prevent data loss. Press "OK" to continue.`);
                return location.reload();
            }
        }

        await getGroups();
        await printCharacters(true);
    } else {
        console.error('Failed to fetch characters:', response.statusText);
        const errorData = await response.json();
        if (errorData?.overflow) {
            await Popup.show.text(t`Character data length limit reached`, t`To resolve this, set "performance.lazyLoadCharacters" to "true" in config.yaml and restart the server.`);
        }
    }
}

async function delChat(chatfile) {
    return delChatCore(chatfile);
}

/**
 * Deletes a character chat by its name.
 * @param {string} characterId Character ID to delete chat for
 * @param {string} fileName Name of the chat file to delete (without .jsonl extension)
 * @returns {Promise<void>} A promise that resolves when the chat is deleted.
 */
export async function deleteCharacterChatByName(characterId, fileName) {
    return deleteCharacterChatByNameCore(characterId, fileName);
}

export async function replaceCurrentChat() {
    return replaceCurrentChatCore();
}

export async function showMoreMessages(messagesToLoad = null) {
    const firstDisplayedMesId = $('#chat').children('.mes').first().attr('mesid');
    let messageId = Number(firstDisplayedMesId);
    let count = messagesToLoad || power_user.chat_truncation || Number.MAX_SAFE_INTEGER;

    // If there are no messages displayed, or the message somehow has no mesid, we default to one higher than last message id,
    // so the first "new" message being shown will be the last available message
    if (isNaN(messageId)) {
        messageId = getLastMessageId() + 1;
    }

    console.debug('Inserting messages before', messageId, 'count', count, 'chat length', chat.length);
    const prevHeight = $('#chat').prop('scrollHeight');
    const isButtonInView = isElementInViewport($('#show_more_messages')[0]);

    while (messageId > 0 && count > 0) {
        let newMessageId = messageId - 1;
        addOneMessage(chat[newMessageId], { insertBefore: messageId >= chat.length ? null : messageId, scroll: false, forceId: newMessageId });
        count--;
        messageId--;
    }

    if (messageId == 0) {
        $('#show_more_messages').remove();
    }

    if (isButtonInView) {
        const newHeight = $('#chat').prop('scrollHeight');
        $('#chat').scrollTop(newHeight - prevHeight);
    }

    applyStylePins();
    await eventSource.emit(event_types.MORE_MESSAGES_LOADED);
}

export async function printMessages() {
    return printMessagesCore();
}

/**
 * Cancels the debounced chat save if it is currently pending.
 */
export function cancelDebouncedChatSave() {
    if (chatSaveTimeout) {
        console.debug('Debounced chat save cancelled');
        clearTimeout(chatSaveTimeout);
        chatSaveTimeout = null;
    }
}

export async function clearChat() {
    return clearChatCore();
}

export async function deleteLastMessage() {
    return deleteLastMessageCore();
}

export async function reloadCurrentChat() {
    const result = await reloadCurrentChatCore();
    if (result?.characterName !== undefined) {
        name2 = result.characterName;
        syncName2(name2);
    }
    if (result?.chatCreateDate !== undefined) {
        chat_create_date = result.chatCreateDate;
    }
    if (result?.chatMetadata !== undefined) {
        chat_metadata = result.chatMetadata;
        syncChatMetadata(chat_metadata);
    }
}

/**
 * Send the message currently typed into the chat box.
 */
export async function sendTextareaMessage() {
    return sendTextareaMessageCore();
}

/**
 * Formats the message text into an HTML string using Markdown and other formatting.
 * @param {string} mes Message text
 * @param {string} ch_name Character name
 * @param {boolean} isSystem If the message was sent by the system
 * @param {boolean} isUser If the message was sent by the user
 * @param {number} messageId Message index in chat array
 * @param {object} [sanitizerOverrides] DOMPurify sanitizer option overrides
 * @param {boolean} [isReasoning] If the message is reasoning output
 * @returns {string} HTML string
 */
export function messageFormatting(mes, ch_name, isSystem, isUser, messageId, sanitizerOverrides = {}, isReasoning = false) {
    if (!mes) {
        return '';
    }

    if (Number(messageId) === 0 && !isSystem && !isUser && !isReasoning) {
        const mesBeforeReplace = mes;
        const chatMessage = chat[messageId];
        mes = substituteParams(mes, undefined, ch_name);
        if (chatMessage && chatMessage.mes === mesBeforeReplace && chatMessage.extra?.display_text !== mesBeforeReplace) {
            chatMessage.mes = mes;
        }
    }

    mesForShowdownParse = mes;

    // Force isSystem = false on comment messages so they get formatted properly
    if (ch_name === COMMENT_NAME_DEFAULT && isSystem && !isUser) {
        isSystem = false;
    }

    // Let hidden messages have markdown
    if (isSystem && ch_name !== systemUserName) {
        isSystem = false;
    }

    // Prompt bias replacement should be applied on the raw message
    const replacedPromptBias = power_user.user_prompt_bias && substituteParams(power_user.user_prompt_bias);
    if (!power_user.show_user_prompt_bias && ch_name && !isUser && !isSystem && replacedPromptBias && mes.startsWith(replacedPromptBias)) {
        mes = mes.slice(replacedPromptBias.length);
    }

    if (!isSystem) {
        function getRegexPlacement() {
            try {
                if (isReasoning) {
                    return regex_placement.REASONING;
                }
                if (isUser) {
                    return regex_placement.USER_INPUT;
                } else if (chat[messageId]?.extra?.type === 'narrator') {
                    return regex_placement.SLASH_COMMAND;
                } else {
                    return regex_placement.AI_OUTPUT;
                }
            } catch {
                return regex_placement.AI_OUTPUT;
            }
        }

        const regexPlacement = getRegexPlacement();
        const usableMessages = chat.map((x, index) => ({ message: x, index: index })).filter(x => !x.message.is_system);
        const indexOf = usableMessages.findIndex(x => x.index === Number(messageId));
        const depth = messageId >= 0 && indexOf !== -1 ? (usableMessages.length - indexOf - 1) : undefined;

        // Always override the character name
        mes = getRegexedString(mes, regexPlacement, {
            characterOverride: ch_name,
            isMarkdown: true,
            depth: depth,
        });
    }

    if (power_user.auto_fix_generated_markdown) {
        mes = fixMarkdown(mes, true);
    }

    if (!isSystem && power_user.encode_tags) {
        mes = mes.replaceAll('<', '&lt;').replaceAll('>', '&gt;');
    }

    // Make sure reasoning strings are always shown, even if they include "<" or ">"
    [power_user.reasoning.prefix, power_user.reasoning.suffix].forEach((reasoningString) => {
        if (!reasoningString || !reasoningString.trim().length) {
            return;
        }
        // Only replace the first occurrence of the reasoning string
        if (mes.includes(reasoningString)) {
            mes = mes.replace(reasoningString, escapeHtml(reasoningString));
        }
    });

    if (!isSystem) {
        // Save double quotes in tags as a special character to prevent them from being encoded
        if (!power_user.encode_tags) {
            mes = mes.replace(/<([^>]+)>/g, function (_, contents) {
                return '<' + contents.replace(/"/g, '\ufffe') + '>';
            });
        }

        mes = mes.replace(
            /<style>[\s\S]*?<\/style>|```[\s\S]*?```|~~~[\s\S]*?~~~|``[\s\S]*?``|`[\s\S]*?`|(".*?")|(\u201C.*?\u201D)|(\u00AB.*?\u00BB)|(\u300C.*?\u300D)|(\u300E.*?\u300F)|(\uFF02.*?\uFF02)/gim,
            function (match, p1, p2, p3, p4, p5, p6) {
                if (p1) {
                    // English double quotes
                    return `<q>"${p1.slice(1, -1)}"</q>`;
                } else if (p2) {
                    // Curly double quotes “ ”
                    return `<q>“${p2.slice(1, -1)}”</q>`;
                } else if (p3) {
                    // Guillemets « »
                    return `<q>«${p3.slice(1, -1)}»</q>`;
                } else if (p4) {
                    // Corner brackets 「 」
                    return `<q>「${p4.slice(1, -1)}」</q>`;
                } else if (p5) {
                    // White corner brackets 『 』
                    return `<q>『${p5.slice(1, -1)}』</q>`;
                } else if (p6) {
                    // Fullwidth quotes ＂ ＂
                    return `<q>＂${p6.slice(1, -1)}＂</q>`;
                } else {
                    // Return the original match if no quotes are found
                    return match;
                }
            },
        );

        // Restore double quotes in tags
        if (!power_user.encode_tags) {
            mes = mes.replace(/\ufffe/g, '"');
        }

        mes = mes.replaceAll('\\begin{align*}', '$$');
        mes = mes.replaceAll('\\end{align*}', '$$');
        mes = converter.makeHtml(mes);

        mes = mes.replace(/<code(.*)>[\s\S]*?<\/code>/g, function (match) {
            // Firefox creates extra newlines from <br>s in code blocks, so we replace them before converting newlines to <br>s.
            return match.replace(/\n/gm, '\u0000');
        });
        mes = mes.replace(/\u0000/g, '\n'); // Restore converted newlines
        mes = mes.trim();

        mes = mes.replace(/<code(.*)>[\s\S]*?<\/code>/g, function (match) {
            return match.replace(/&amp;/g, '&');
        });
    }

    if (!power_user.allow_name2_display && ch_name && !isUser && !isSystem) {
        mes = mes.replace(new RegExp(`(^|\n)${escapeRegex(ch_name)}:`, 'g'), '$1');
    }

    /** @type {import('dompurify').Config & { RETURN_DOM_FRAGMENT: false; RETURN_DOM: false }} */
    const config = {
        RETURN_DOM: false,
        RETURN_DOM_FRAGMENT: false,
        RETURN_TRUSTED_TYPE: false,
        MESSAGE_SANITIZE: true,
        ADD_TAGS: ['custom-style'],
        ...sanitizerOverrides,
    };
    mes = encodeStyleTags(mes);
    mes = DOMPurify.sanitize(mes, config);
    mes = decodeStyleTags(mes, { prefix: '.mes_text ' });

    return mes;
}

/**
 * Re-renders a message block with updated content.
 * @param {number} messageId Message ID
 * @param {object} message Message object
 * @param {object} [options={}] Optional arguments
 * @param {boolean} [options.rerenderMessage=true] Whether to re-render the message content (inside <c>.mes_text</c>)
 */
export function updateMessageBlock(messageId, message, { rerenderMessage = true } = {}) {
    return updateMessageBlockCore(messageId, message, { rerenderMessage });
}

/**
 * Appends image or file to the message element.
 * @param {object} mes Message object
 * @param {JQuery<HTMLElement>} messageElement Message element
 * @param {boolean} [adjustScroll=true] Whether to adjust the scroll position after appending the media
 */
export function appendMediaToMessage(mes, messageElement, adjustScroll = true) {
    // Add image to message
    if (mes.extra?.image) {
        const container = messageElement.find('.mes_img_container');
        const chatHeight = $('#chat').prop('scrollHeight');
        const image = messageElement.find('.mes_img');
        const text = messageElement.find('.mes_text');
        const isInline = !!mes.extra?.inline_image;
        const doAdjustScroll = () => {
            if (!adjustScroll) {
                return;
            }
            const scrollPosition = $('#chat').scrollTop();
            const newChatHeight = $('#chat').prop('scrollHeight');
            const diff = newChatHeight - chatHeight;
            $('#chat').scrollTop(scrollPosition + diff);
        };
        image.off('load').on('load', function () {
            image.removeAttr('alt');
            image.removeClass('error');
            doAdjustScroll();
        });
        image.off('error').on('error', function () {
            image.attr('alt', '');
            image.addClass('error');
            doAdjustScroll();
        });
        image.attr('src', mes.extra?.image);
        image.attr('title', mes.extra?.title || mes.title || '');
        container.addClass('img_extra');
        image.toggleClass('img_inline', isInline);
        text.toggleClass('displayNone', !isInline);

        const imageSwipes = mes.extra.image_swipes;
        if (Array.isArray(imageSwipes) && imageSwipes.length > 0) {
            container.addClass('img_swipes');
            const counter = container.find('.mes_img_swipe_counter');
            const currentImage = imageSwipes.indexOf(mes.extra.image) + 1;
            counter.text(`${currentImage}/${imageSwipes.length}`);

            const swipeLeft = container.find('.mes_img_swipe_left');
            swipeLeft.off('click').on('click', function () {
                eventSource.emit(event_types.IMAGE_SWIPED, { message: mes, element: messageElement, direction: 'left' });
            });

            const swipeRight = container.find('.mes_img_swipe_right');
            swipeRight.off('click').on('click', function () {
                eventSource.emit(event_types.IMAGE_SWIPED, { message: mes, element: messageElement, direction: 'right' });
            });
        }
    } else {
        const container = messageElement.find('.mes_img_container');
        container.removeClass('img_extra img_swipes');
        const text = messageElement.find('.mes_text');
        text.removeClass('displayNone');
    }

    // Add video to message
    if (mes.extra?.video) {
        const container = $('#message_video_template .mes_video_container').clone();
        messageElement.find('.mes_video_container').remove();
        messageElement.find('.mes_block').append(container);
        const chatHeight = $('#chat').prop('scrollHeight');
        const video = container.find('.mes_video');
        video.off('loadedmetadata').on('loadedmetadata', function () {
            if (!adjustScroll) {
                return;
            }
            const scrollPosition = $('#chat').scrollTop();
            const newChatHeight = $('#chat').prop('scrollHeight');
            const diff = newChatHeight - chatHeight;
            $('#chat').scrollTop(scrollPosition + diff);
        });

        video.attr('src', mes.extra?.video);
    } else {
        messageElement.find('.mes_video_container').remove();
    }

    // Add file to message
    if (mes.extra?.file) {
        messageElement.find('.mes_file_container').remove();
        const messageId = messageElement.attr('mesid');
        const template = $('#message_file_template .mes_file_container').clone();
        template.find('.mes_file_name').text(mes.extra.file.name);
        template.find('.mes_file_size').text(humanFileSize(mes.extra.file.size));
        template.find('.mes_file_download').attr('mesid', messageId);
        template.find('.mes_file_delete').attr('mesid', messageId);
        messageElement.find('.mes_block').append(template);
    } else {
        messageElement.find('.mes_file_container').remove();
    }
}

/**
 * @deprecated Use appendMediaToMessage instead.
 */
export function appendImageToMessage(mes, messageElement) {
    appendMediaToMessage(mes, messageElement);
}

export function addCopyToCodeBlocks(messageElement) {
    const codeBlocks = $(messageElement).find('pre code');
    for (let i = 0; i < codeBlocks.length; i++) {
        hljs.highlightElement(codeBlocks.get(i));
        const copyButton = document.createElement('i');
        copyButton.classList.add('fa-solid', 'fa-copy', 'code-copy', 'interactable');
        copyButton.title = 'Copy code';
        codeBlocks.get(i).appendChild(copyButton);
        copyButton.addEventListener('click', function (e) {
            e.stopPropagation();
        });
        copyButton.addEventListener('pointerup', async function () {
            const text = codeBlocks.get(i).innerText;
            await copyText(text);
            toastr.info(t`Copied!`, '', { timeOut: 2000 });
        });
    }
}


/**
 * Adds a single message to the chat.
 * @param {object} mes Message object
 * @param {object} [options] Options
 * @param {string} [options.type='normal'] Message type
 * @param {number} [options.insertAfter=null] Message ID to insert the new message after
 * @param {boolean} [options.scroll=true] Whether to scroll to the new message
 * @param {number} [options.insertBefore=null] Message ID to insert the new message before
 * @param {number} [options.forceId=null] Force the message ID
 * @param {boolean} [options.showSwipes=true] Whether to show swipe buttons
 * @returns {void}
 */
export function addOneMessage(mes, { type = 'normal', insertAfter = null, scroll = true, insertBefore = null, forceId = null, showSwipes = true } = {}) {
    return addOneMessageCore(mes, { type, insertAfter, scroll, insertBefore, forceId, showSwipes });
}

/**
 * Returns the URL of the avatar for the given character Id.
 * @param {number|string} characterId Character Id
 * @returns {string} Avatar URL
 */
export function getCharacterAvatar(characterId) {
    const character = characters[characterId];
    const avatarImg = character?.avatar;

    if (!avatarImg || avatarImg === 'none') {
        return default_avatar;
    }

    return formatCharacterAvatar(avatarImg);
}

export function formatCharacterAvatar(characterAvatar) {
    return `characters/${characterAvatar}`;
}

/**
 * Formats the title for the generation timer.
 * @param {Date} gen_started Date when generation was started
 * @param {Date} gen_finished Date when generation was finished
 * @param {number} tokenCount Number of tokens generated (0 if not available)
 * @param {number?} [reasoningDuration=null] Reasoning duration (null if no reasoning was done)
 * @param {number?} [timeToFirstToken=null] Time to first token
 * @returns {Object} Object containing the formatted timer value and title
 * @example
 * const { timerValue, timerTitle } = formatGenerationTimer(gen_started, gen_finished, tokenCount);
 * console.log(timerValue); // 1.2s
 * console.log(timerTitle); // Generation queued: 12:34:56 7 Jan 2021\nReply received: 12:34:57 7 Jan 2021\nTime to generate: 1.2 seconds\nToken rate: 5 t/s
 */
function formatGenerationTimer(gen_started, gen_finished, tokenCount, reasoningDuration = null, timeToFirstToken = null) {
    return formatGenerationTimerCore(gen_started, gen_finished, tokenCount, reasoningDuration, timeToFirstToken);
}

export function scrollChatToBottom() {
    if (power_user.auto_scroll_chat_to_bottom) {
        let position = chatElement[0].scrollHeight;

        if (power_user.waifuMode) {
            const lastMessage = chatElement.find('.mes').last();
            if (lastMessage.length) {
                const lastMessagePosition = lastMessage.position().top;
                position = chatElement.scrollTop() + lastMessagePosition;
            }
        }

        chatElement.scrollTop(position);
    }
}

/**
 * Substitutes {{macro}} parameters in a string.
 * @param {string} content - The string to substitute parameters in.
 * @param {Record<string,any>} additionalMacro - Additional environment variables for substitution.
 * @param {(x: string) => string} [postProcessFn] - Post-processing function for each substituted macro.
 * @returns {string} The string with substituted parameters.
 */
export function substituteParamsExtended(content, additionalMacro = {}, postProcessFn = (x) => x) {
    return substituteParams(content, undefined, undefined, undefined, undefined, true, additionalMacro, postProcessFn);
}

/**
 * Substitutes {{macro}} parameters in a string.
 * @param {string} content - The string to substitute parameters in.
 * @param {string} [_name1] - The name of the user. Uses global name1 if not provided.
 * @param {string} [_name2] - The name of the character. Uses global name2 if not provided.
 * @param {string} [_original] - The original message for {{original}} substitution.
 * @param {string} [_group] - The group members list for {{group}} substitution.
 * @param {boolean} [_replaceCharacterCard] - Whether to replace character card macros.
 * @param {Record<string,any>} [additionalMacro] - Additional environment variables for substitution.
 * @param {(x: string) => string} [postProcessFn] - Post-processing function for each substituted macro.
 * @returns {string} The string with substituted parameters.
 */
export function substituteParams(content, _name1, _name2, _original, _group, _replaceCharacterCard = true, additionalMacro = {}, postProcessFn = (x) => x) {
    if (!content) {
        return '';
    }

    const environment = {};

    if (typeof _original === 'string') {
        let originalSubstituted = false;
        environment.original = () => {
            if (originalSubstituted) {
                return '';
            }

            originalSubstituted = true;
            return _original;
        };
    }

    const getGroupValue = (includeMuted) => {
        if (typeof _group === 'string') {
            return _group;
        }

        if (selected_group) {
            const members = groups.find(x => x.id === selected_group)?.members;
            /** @type {string[]} */
            const disabledMembers = groups.find(x => x.id === selected_group)?.disabled_members ?? [];
            const isMuted = x => includeMuted ? true : !disabledMembers.includes(x);
            const names = Array.isArray(members)
                ? members.filter(isMuted).map(m => characters.find(c => c.avatar === m)?.name).filter(Boolean).join(', ')
                : '';
            return names;
        } else {
            return _name2 ?? name2;
        }
    };

    if (_replaceCharacterCard) {
        const fields = getCharacterCardFields();
        environment.charPrompt = fields.system || '';
        environment.charInstruction = environment.charJailbreak = fields.jailbreak || '';
        environment.description = fields.description || '';
        environment.personality = fields.personality || '';
        environment.scenario = fields.scenario || '';
        environment.persona = fields.persona || '';
        environment.mesExamples = () => {
            const isInstruct = power_user.instruct.enabled && main_api !== 'openai';
            const mesExamplesArray = parseMesExamples(fields.mesExamples, isInstruct);
            if (isInstruct) {
                const instructExamples = formatInstructModeExamples(mesExamplesArray, name1, name2);
                return instructExamples.join('');
            }
            return mesExamplesArray.join('');
        };
        environment.mesExamplesRaw = fields.mesExamples || '';
        environment.charVersion = fields.version || '';
        environment.char_version = fields.version || '';
        environment.charDepthPrompt = fields.charDepthPrompt || '';
        environment.creatorNotes = fields.creatorNotes || '';
    }

    // Must be substituted last so that they're replaced inside {{description}}
    environment.user = _name1 ?? name1;
    environment.char = _name2 ?? name2;
    environment.group = environment.charIfNotGroup = getGroupValue(true);
    environment.groupNotMuted = getGroupValue(false);
    environment.model = getGeneratingModel();

    if (additionalMacro && typeof additionalMacro === 'object') {
        Object.assign(environment, additionalMacro);
    }

    return evaluateMacros(content, environment, postProcessFn);
}


/**
 * Gets stopping sequences for the prompt.
 * @param {boolean} isImpersonate A request is made to impersonate a user
 * @param {boolean} isContinue A request is made to continue the message
 * @returns {string[]} Array of stopping strings
 */
export function getStoppingStrings(isImpersonate, isContinue) {
    const result = getStoppingStringsCore(isImpersonate, isContinue);

    if (power_user.single_line) {
        result.unshift('\n');
    }

    return result.filter(x => x).filter(onlyUnique);
}

/**
 * Background generation based on the provided prompt.
 * @typedef {object} GenerateQuietPromptParams
 * @prop {string} [quietPrompt] Instruction prompt for the AI
 * @prop {boolean} [quietToLoud] Whether the message should be sent in a foreground (loud) or background (quiet) mode
 * @prop {boolean} [skipWIAN] Whether to skip addition of World Info and Author's Note into the prompt
 * @prop {string} [quietImage] Image to use for the quiet prompt
 * @prop {string} [quietName] Name to use for the quiet prompt (defaults to "System:")
 * @prop {number} [responseLength] Maximum response length. If unset, the global default value is used.
 * @prop {number} [forceChId] Character ID to use for this generation run. Works in groups only.
 * @prop {object} [jsonSchema] JSON schema to use for the structured generation. Usually requires a special instruction.
 * @prop {boolean} [removeReasoning] Parses and removes the reasoning block according to reasoning format preferences
 * @prop {boolean} [trimToSentence] Whether to trim the response to the last complete sentence
 * @param {GenerateQuietPromptParams} params Parameters for the quiet prompt generation
 * @returns {Promise<string>} Generated text. If using structured output, will contain a serialized JSON object.
 */
export async function generateQuietPrompt({ quietPrompt = '', quietToLoud = false, skipWIAN = false, quietImage = null, quietName = null, responseLength = null, forceChId = null, jsonSchema = null, removeReasoning = true, trimToSentence = false } = {}) {
    return generateQuietPromptCore({ quietPrompt, quietToLoud, skipWIAN, quietImage, quietName, responseLength, forceChId, jsonSchema, removeReasoning, trimToSentence });
}

/**
 * Executes slash commands and returns the new text and whether the generation was interrupted.
 * @param {string} message Text to be sent
 * @returns {Promise<boolean>} Whether the message sending was interrupted
 */
export async function processCommands(message) {
    return processCommandsCore(message);
}

/**
 * Extracts the contents of bias macros from a message.
 * @param {string} message Message text
 * @returns {string} Message bias extracted from the message (or an empty string if not found)
 */
export function extractMessageBias(message) {
    if (!message) {
        return '';
    }

    try {
        const biasHandlebars = Handlebars.create();
        const biasMatches = [];
        biasHandlebars.registerHelper('bias', function (text) {
            biasMatches.push(text);
            return '';
        });
        const template = biasHandlebars.compile(message);
        template({});

        if (biasMatches && biasMatches.length > 0) {
            return ` ${biasMatches.join(' ')}`;
        }

        return '';
    } catch {
        return '';
    }
}

/**
 * Removes impersonated group member lines from the group member messages.
 * Doesn't do anything if group reply trimming is disabled.
 * @param {string} getMessage Group message
 * @returns Cleaned-up group message
 */
function cleanGroupMessage(getMessage) {
    if (power_user.disable_group_trimming) {
        return getMessage;
    }

    const group = groups.find((x) => x.id == selected_group);

    if (group && Array.isArray(group.members) && group.members) {
        for (let member of group.members) {
            const character = characters.find(x => x.avatar == member);

            if (!character) {
                continue;
            }

            const name = character.name;

            // Skip current speaker.
            if (name === name2) {
                continue;
            }

            const regex = new RegExp(`(^|\n)${escapeRegex(name)}:`);
            const nameMatch = getMessage.match(regex);
            if (nameMatch) {
                getMessage = getMessage.substring(0, nameMatch.index);
            }
        }
    }
    return getMessage;
}

function addPersonaDescriptionExtensionPrompt() {
    const INJECT_TAG = 'PERSONA_DESCRIPTION';
    setExtensionPrompt(INJECT_TAG, '', extension_prompt_types.IN_PROMPT, 0);

    if (!power_user.persona_description || power_user.persona_description_position === persona_description_positions.NONE) {
        return;
    }

    const promptPositions = [persona_description_positions.BOTTOM_AN, persona_description_positions.TOP_AN];

    if (promptPositions.includes(power_user.persona_description_position) && shouldWIAddPrompt) {
        const originalAN = extension_prompts[NOTE_MODULE_NAME].value;
        const ANWithDesc = power_user.persona_description_position === persona_description_positions.TOP_AN
            ? `${power_user.persona_description}\n${originalAN}`
            : `${originalAN}\n${power_user.persona_description}`;

        setExtensionPrompt(NOTE_MODULE_NAME, ANWithDesc, chat_metadata[metadata_keys.position], chat_metadata[metadata_keys.depth], extension_settings.note.allowWIScan, chat_metadata[metadata_keys.role]);
    }

    if (power_user.persona_description_position === persona_description_positions.AT_DEPTH) {
        setExtensionPrompt(INJECT_TAG, power_user.persona_description, extension_prompt_types.IN_CHAT, power_user.persona_description_depth, true, power_user.persona_description_role);
    }
}

/**
 * Returns all extension prompts combined.
 * @returns {Promise<string>} Combined extension prompts
 */
async function getAllExtensionPrompts() {
    const values = [];

    for (const prompt of Object.values(extension_prompts)) {
        const value = prompt?.value?.trim();

        if (!value) {
            continue;
        }

        const hasFilter = typeof prompt.filter === 'function';
        if (hasFilter && !await prompt.filter()) {
            continue;
        }

        values.push(value);
    }

    return substituteParams(values.join('\n'));
}

/**
 * Wrapper to fetch extension prompts by module name
 * @param {string} moduleName Module name
 * @returns {Promise<string>} Extension prompt
 */
export async function getExtensionPromptByName(moduleName) {
    if (!moduleName) {
        return '';
    }

    const prompt = extension_prompts[moduleName];

    if (!prompt) {
        return '';
    }

    const hasFilter = typeof prompt.filter === 'function';

    if (hasFilter && !await prompt.filter()) {
        return '';
    }

    return substituteParams(prompt.value);
}

/**
 * Gets the maximum depth of extension prompts.
 * @returns {number} Maximum depth of extension prompts
 */
export function getExtensionPromptMaxDepth() {
    return MAX_INJECTION_DEPTH;
    /*
    const prompts = Object.values(extension_prompts);
    const maxDepth = Math.max(...prompts.map(x => x.depth ?? 0));
    // Clamp to 1 <= depth <= MAX_INJECTION_DEPTH
    return Math.max(Math.min(maxDepth, MAX_INJECTION_DEPTH), 1);
    */
}

/**
 * Returns the extension prompt for the given position, depth, and role.
 * If multiple prompts are found, they are joined with a separator.
 * @param {number} [position] Position of the prompt
 * @param {number} [depth] Depth of the prompt
 * @param {string} [separator] Separator for joining multiple prompts
 * @param {number} [role] Role of the prompt
 * @param {boolean} [wrap] Wrap start and end with a separator
 * @returns {Promise<string>} Extension prompt
 */
export async function getExtensionPrompt(position = extension_prompt_types.IN_PROMPT, depth = undefined, separator = '\n', role = undefined, wrap = true) {
    const filterByFunction = async (prompt) => {
        const hasFilter = typeof prompt.filter === 'function';
        if (hasFilter && !await prompt.filter()) {
            return false;
        }
        return true;
    };
    const promptPromises = Object.keys(extension_prompts)
        .sort()
        .map((x) => extension_prompts[x])
        .filter(x => x.position == position && x.value)
        .filter(x => depth === undefined || x.depth === undefined || x.depth === depth)
        .filter(x => role === undefined || x.role === undefined || x.role === role)
        .filter(filterByFunction);
    const prompts = await Promise.all(promptPromises);

    let values = prompts.map(x => x.value.trim()).join(separator);
    if (wrap && values.length && !values.startsWith(separator)) {
        values = separator + values;
    }
    if (wrap && values.length && !values.endsWith(separator)) {
        values = values + separator;
    }
    if (values.length) {
        values = substituteParams(values);
    }
    return values;
}

export function baseChatReplace(value, name1, name2) {
    if (value !== undefined && value.length > 0) {
        const _ = undefined;
        value = substituteParams(value, name1, name2, _, _, false);

        if (power_user.collapse_newlines) {
            value = collapseNewlines(value);
        }

        value = value.replace(/\r/g, '');
    }
    return value;
}

/**
 * Returns the character card fields for the current character.
 * @param {object} [options]
 * @param {number} [options.chid] Optional character index
 *
 * @typedef {object} CharacterCardFields
 * @property {string} system System prompt
 * @property {string} mesExamples Message examples
 * @property {string} description Description
 * @property {string} personality Personality
 * @property {string} persona Persona
 * @property {string} scenario Scenario
 * @property {string} jailbreak Jailbreak instructions
 * @property {string} version Character version
 * @property {string} charDepthPrompt Character depth note
 * @property {string} creatorNotes Character creator notes
 * @returns {CharacterCardFields} Character card fields
 */
export function getCharacterCardFields({ chid = null } = {}) {
    const currentChid = chid ?? this_chid;

    const result = {
        system: '',
        mesExamples: '',
        description: '',
        personality: '',
        persona: '',
        scenario: '',
        jailbreak: '',
        version: '',
        charDepthPrompt: '',
        creatorNotes: '',
    };
    result.persona = baseChatReplace(power_user.persona_description?.trim(), name1, name2);

    const character = characters[currentChid];

    if (!character) {
        return result;
    }

    const scenarioText = chat_metadata['scenario'] || character.scenario || '';
    result.description = baseChatReplace(character.description?.trim(), name1, name2);
    result.personality = baseChatReplace(character.personality?.trim(), name1, name2);
    result.scenario = baseChatReplace(scenarioText.trim(), name1, name2);
    result.mesExamples = baseChatReplace(character.mes_example?.trim(), name1, name2);
    result.system = power_user.prefer_character_prompt ? baseChatReplace(character.data?.system_prompt?.trim(), name1, name2) : '';
    result.jailbreak = power_user.prefer_character_jailbreak ? baseChatReplace(character.data?.post_history_instructions?.trim(), name1, name2) : '';
    result.version = character.data?.character_version ?? '';
    result.charDepthPrompt = baseChatReplace(character.data?.extensions?.depth_prompt?.prompt?.trim(), name1, name2);
    result.creatorNotes = baseChatReplace(character.data?.creator_notes?.trim(), name1, name2);

    if (selected_group) {
        const groupCards = getGroupCharacterCards(selected_group, Number(currentChid));

        if (groupCards) {
            result.description = groupCards.description;
            result.personality = groupCards.personality;
            result.scenario = groupCards.scenario;
            result.mesExamples = groupCards.mesExamples;
        }
    }

    return result;
}

/**
 * Parses an examples string.
 * @param {string} examplesStr
 * @returns {string[]} Examples array with block heading
 */
export function parseMesExamples(examplesStr, isInstruct) {
    if (!examplesStr || examplesStr.length === 0 || examplesStr === '<START>') {
        return [];
    }

    if (!examplesStr.startsWith('<START>')) {
        examplesStr = '<START>\n' + examplesStr.trim();
    }

    const exampleSeparator = power_user.context.example_separator ? `${substituteParams(power_user.context.example_separator)}\n` : '';
    const blockHeading = (main_api === 'openai' || isInstruct) ? '<START>\n' : exampleSeparator;
    const splitExamples = examplesStr.split(/<START>/gi).slice(1).map(block => `${blockHeading}${block.trim()}\n`);

    return splitExamples;
}

export function isStreamingEnabled() {
    return (
        (main_api == 'openai' &&
            oai_settings.stream_openai &&
            !(oai_settings.chat_completion_source == chat_completion_sources.OPENAI && ['o1-2024-12-17', 'o1'].includes(oai_settings.openai_model))
        )
        || (main_api == 'kobold' && kai_settings.streaming_kobold && kai_flags.can_use_streaming)
        || (main_api == 'novel' && nai_settings.streaming_novel)
        || (main_api == 'textgenerationwebui' && textgen_settings.streaming));
}

function showStopButton() {
    return showStopButtonCore();
}

function hideStopButton() {
    return hideStopButtonCore();
}

class StreamingProcessor {
    /**
     * Creates a new streaming processor.
     * @param {string} type Generation type
     * @param {boolean} forceName2 If true, force the use of name2
     * @param {Date} timeStarted Date when generation was started
     * @param {string} continueMessage Previous message if the type is 'continue'
     * @param {PromptReasoning} promptReasoning Prompt reasoning instance
     */
    constructor(type, forceName2, timeStarted, continueMessage, promptReasoning) {
        this.result = '';
        this.messageId = -1;
        /** @type {HTMLElement} */
        this.messageDom = null;
        /** @type {HTMLElement} */
        this.messageTextDom = null;
        /** @type {HTMLElement} */
        this.messageTimerDom = null;
        /** @type {HTMLElement} */
        this.messageTokenCounterDom = null;
        /** @type {HTMLTextAreaElement} */
        this.sendTextarea = document.querySelector('#send_textarea');
        this.type = type;
        this.force_name2 = forceName2;
        this.isStopped = false;
        this.isFinished = false;
        this.generator = this.nullStreamingGeneration;
        this.abortController = new AbortController();
        this.firstMessageText = '...';
        this.timeStarted = timeStarted;
        /** @type {number?} */
        this.timeToFirstToken = null;
        this.createdAt = new Date();
        this.continueMessage = type === 'continue' ? continueMessage : '';
        this.swipes = [];
        /** @type {import('./scripts/logprobs.js').TokenLogprobs[]} */
        this.messageLogprobs = [];
        this.toolCalls = [];
        // Initialize reasoning in its own handler
        this.reasoningHandler = new ReasoningHandler(timeStarted);
        /** @type {PromptReasoning} */
        this.promptReasoning = promptReasoning;
        /** @type {string} */
        this.image = '';
    }

    /**
     * Initializes DOM elements for the current message.
     * @param {number} messageId Current message ID
     * @param {boolean?} continueOnReasoning If continuing on reasoning
     */
    async #checkDomElements(messageId, continueOnReasoning = null) {
        if (this.messageDom === null || this.messageTextDom === null) {
            this.messageDom = document.querySelector(`#chat .mes[mesid="${messageId}"]`);
            this.messageTextDom = this.messageDom?.querySelector('.mes_text');
            this.messageTimerDom = this.messageDom?.querySelector('.mes_timer');
            this.messageTokenCounterDom = this.messageDom?.querySelector('.tokenCounterDisplay');
        }
        if (continueOnReasoning) {
            await this.reasoningHandler.process(messageId, false, this.promptReasoning);
        }
        this.reasoningHandler.updateDom(messageId);
    }

    #updateMessageBlockVisibility() {
        if (this.messageDom instanceof HTMLElement && Array.isArray(this.toolCalls) && this.toolCalls.length > 0) {
            const shouldHide = ['', '...'].includes(this.result) && !this.reasoningHandler.reasoning;
            this.messageDom.classList.toggle('displayNone', shouldHide);
        }
    }

    markUIGenStarted() {
        deactivateSendButtons();
    }

    markUIGenStopped() {
        activateSendButtons();
    }

    async onStartStreaming(text) {
        const continueOnReasoning = !!(this.type === 'continue' && this.promptReasoning.prefixReasoning);
        if (continueOnReasoning) {
            this.reasoningHandler.initContinue(this.promptReasoning);
        }

        let messageId = -1;

        if (this.type == 'impersonate') {
            this.sendTextarea.value = '';
            this.sendTextarea.dispatchEvent(new Event('input', { bubbles: true }));
        } else {
            await saveReply({ type: this.type, getMessage: text, fromStreaming: true });
            messageId = chat.length - 1;
            await this.#checkDomElements(messageId, continueOnReasoning);
            this.markUIGenStarted();
        }
        hideSwipeButtons();
        scrollChatToBottom();
        return messageId;
    }

    async onProgressStreaming(messageId, text, isFinal) {
        const isImpersonate = this.type == 'impersonate';
        const isContinue = this.type == 'continue';

        if (!isImpersonate && !isContinue && Array.isArray(this.swipes) && this.swipes.length > 0) {
            for (let i = 0; i < this.swipes.length; i++) {
                this.swipes[i] = cleanUpMessage({
                    getMessage: this.swipes[i],
                    isImpersonate: false,
                    isContinue: false,
                    displayIncompleteSentences: true,
                    stoppingStrings: this.stoppingStrings,
                });
            }
        }

        let processedText = cleanUpMessage({
            getMessage: text,
            isImpersonate: isImpersonate,
            isContinue: isContinue,
            displayIncompleteSentences: !isFinal,
            stoppingStrings: this.stoppingStrings,
        });

        const charsToBalance = ['*', '"', '```', '~~~'];
        for (const char of charsToBalance) {
            if (!isFinal && isOdd(countOccurrences(processedText, char))) {
                const separator = char.length > 1 ? '\n' : '';
                processedText = processedText.trimEnd() + separator + char;
            }
        }

        if (isImpersonate) {
            this.sendTextarea.value = processedText;
            this.sendTextarea.dispatchEvent(new Event('input', { bubbles: true }));
        } else {
            const mesChanged = chat[messageId]['mes'] !== processedText;
            await this.#checkDomElements(messageId);
            this.#updateMessageBlockVisibility();
            const currentTime = new Date();
            chat[messageId]['mes'] = processedText;
            chat[messageId]['gen_started'] = this.timeStarted;
            chat[messageId]['gen_finished'] = currentTime;
            if (!chat[messageId]['extra']) {
                chat[messageId]['extra'] = {};
            }
            chat[messageId]['extra']['time_to_first_token'] = this.timeToFirstToken;

            // Update reasoning
            await this.reasoningHandler.process(messageId, mesChanged, this.promptReasoning);
            processedText = chat[messageId]['mes'];

            // Token count update.
            const tokenCountText = this.reasoningHandler.reasoning + processedText;
            const currentTokenCount = isFinal && power_user.message_token_count_enabled ? await getTokenCountAsync(tokenCountText, 0) : 0;
            if (currentTokenCount) {
                chat[messageId]['extra']['token_count'] = currentTokenCount;
                if (this.messageTokenCounterDom instanceof HTMLElement) {
                    this.messageTokenCounterDom.textContent = `${currentTokenCount}t`;
                }
            }

            if ((this.type == 'swipe' || this.type === 'continue') && Array.isArray(chat[messageId]['swipes'])) {
                chat[messageId]['swipes'][chat[messageId]['swipe_id']] = processedText;
                chat[messageId]['swipe_info'][chat[messageId]['swipe_id']] = {
                    'send_date': chat[messageId]['send_date'],
                    'gen_started': chat[messageId]['gen_started'],
                    'gen_finished': chat[messageId]['gen_finished'],
                    'extra': structuredClone(chat[messageId]['extra']),
                };
            }

            const formattedText = messageFormatting(
                processedText,
                chat[messageId].name,
                chat[messageId].is_system,
                chat[messageId].is_user,
                messageId,
                {},
                false,
            );
            if (this.messageTextDom instanceof HTMLElement) {
                this.messageTextDom.innerHTML = formattedText;
            }

            const timePassed = formatGenerationTimer(this.timeStarted, currentTime, currentTokenCount, this.reasoningHandler.getDuration(), this.timeToFirstToken);
            if (this.messageTimerDom instanceof HTMLElement) {
                this.messageTimerDom.textContent = timePassed.timerValue;
                this.messageTimerDom.title = timePassed.timerTitle;
            }

            this.setFirstSwipe(messageId);
        }

        if (!scrollLock) {
            scrollChatToBottom();
        }
    }

    async onFinishStreaming(messageId, text) {
        this.markUIGenStopped();
        await this.onProgressStreaming(messageId, text, true);
        addCopyToCodeBlocks($(`#chat .mes[mesid="${messageId}"]`));

        await this.reasoningHandler.finish(messageId);

        if (Array.isArray(this.swipes) && this.swipes.length > 0) {
            const message = chat[messageId];
            const swipeInfoExtra = structuredClone(message.extra ?? {});
            delete swipeInfoExtra.token_count;
            delete swipeInfoExtra.reasoning;
            delete swipeInfoExtra.reasoning_duration;
            const swipeInfo = {
                send_date: message.send_date,
                gen_started: message.gen_started,
                gen_finished: message.gen_finished,
                extra: swipeInfoExtra,
            };
            const swipeInfoArray = Array(this.swipes.length).fill().map(() => structuredClone(swipeInfo));
            parseReasoningInSwipes(this.swipes, swipeInfoArray, message.extra?.reasoning_duration);
            chat[messageId].swipes.push(...this.swipes);
            chat[messageId].swipe_info.push(...swipeInfoArray);
        }

        if (this.image) {
            await processImageAttachment(chat[messageId], { imageUrl: this.image });
            appendMediaToMessage(chat[messageId], $(this.messageDom));
        }

        if (this.type !== 'impersonate') {
            await eventSource.emit(event_types.MESSAGE_RECEIVED, this.messageId, this.type);
            await eventSource.emit(event_types.CHARACTER_MESSAGE_RENDERED, this.messageId, this.type);
        } else {
            await eventSource.emit(event_types.IMPERSONATE_READY, text);
        }

        syncMesToSwipe(messageId);
        saveLogprobsForActiveMessage(this.messageLogprobs.filter(Boolean), this.continueMessage);
        await saveChatConditional();
        unblockGeneration();

        const isAborted = this.abortController.signal.aborted;
        if (!isAborted && power_user.auto_swipe && generatedTextFiltered(text)) {
            return swipe_right();
        }

        playMessageSound();
    }

    onErrorStreaming() {
        this.abortController.abort();
        this.isStopped = true;

        this.markUIGenStopped();
        unblockGeneration();

        const noEmitTypes = ['swipe', 'impersonate', 'continue'];
        if (!noEmitTypes.includes(this.type)) {
            eventSource.emit(event_types.MESSAGE_RECEIVED, this.messageId, this.type);
            eventSource.emit(event_types.CHARACTER_MESSAGE_RENDERED, this.messageId, this.type);
        }
    }

    setFirstSwipe(messageId) {
        if (this.type !== 'swipe' && this.type !== 'impersonate') {
            if (Array.isArray(chat[messageId]['swipes']) && chat[messageId]['swipes'].length === 1 && chat[messageId]['swipe_id'] === 0) {
                chat[messageId]['swipes'][0] = chat[messageId]['mes'];
                chat[messageId]['swipe_info'][0] = {
                    'send_date': chat[messageId]['send_date'],
                    'gen_started': chat[messageId]['gen_started'],
                    'gen_finished': chat[messageId]['gen_finished'],
                    'extra': structuredClone(chat[messageId]['extra']),
                };
            }
        }
    }

    onStopStreaming() {
        this.abortController.abort();
        this.isFinished = true;
    }

    /**
     * @returns {Generator<{ text: string, swipes: string[], logprobs: import('./scripts/logprobs.js').TokenLogprobs, toolCalls: any[], state: any }, void, void>}
     */
    *nullStreamingGeneration() {
        throw new Error('Generation function for streaming is not hooked up');
    }

    async generate() {
        if (this.messageId == -1) {
            this.messageId = await this.onStartStreaming(this.firstMessageText);
            await delay(1); // delay for message to be rendered
            scrollLock = false;
        }

        // Stopping strings are expensive to calculate, especially with macros enabled. To remove stopping strings
        // when streaming, we cache the result of getStoppingStrings instead of calling it once per token.
        const isImpersonate = this.type == 'impersonate';
        const isContinue = this.type == 'continue';
        this.stoppingStrings = getStoppingStrings(isImpersonate, isContinue);

        try {
            const sw = new Stopwatch(1000 / power_user.streaming_fps);
            const timestamps = [];
            for await (const { text, swipes, logprobs, toolCalls, state } of this.generator()) {
                const now = Date.now();
                timestamps.push(now);
                if (!this.timeToFirstToken) {
                    this.timeToFirstToken = now - this.createdAt.getTime();
                }
                if (this.isStopped || this.abortController.signal.aborted) {
                    return this.result;
                }

                this.toolCalls = toolCalls;
                this.result = text;
                this.swipes = Array.from(swipes ?? []);
                if (logprobs) {
                    this.messageLogprobs.push(...(Array.isArray(logprobs) ? logprobs : [logprobs]));
                }
                // Get the updated reasoning string into the handler
                this.reasoningHandler.updateReasoning(this.messageId, state?.reasoning);
                this.image = state?.image ?? '';
                await eventSource.emit(event_types.STREAM_TOKEN_RECEIVED, text);
                await sw.tick(async () => await this.onProgressStreaming(this.messageId, this.continueMessage + text));
            }
            const seconds = (timestamps[timestamps.length - 1] - timestamps[0]) / 1000;
            console.warn(`Stream stats: ${timestamps.length} tokens, ${seconds.toFixed(2)} seconds, rate: ${Number(timestamps.length / seconds).toFixed(2)} TPS`);
        }
        catch (err) {
            // in the case of a self-inflicted abort, we have already cleaned up
            if (!this.isFinished) {
                console.error(err);
                this.onErrorStreaming();
            }
            return this.result;
        }

        this.isFinished = true;
        return this.result;
    }
}

/**
 * Constructs a prompt to be used for either Text Completion or Chat Completion. Input is format-agnostic.
 * @param {string | object[]} prompt Input prompt. Can be a string or an array of chat-style messages, i.e. [{role: '', content: ''}, ...]
 * @param {string} api API to use.
 * @param {boolean} instructOverride true to override instruct mode, false to use the default value
 * @param {boolean} quietToLoud true to generate a message in system mode, false to generate a message in character mode
 * @param {string} [systemPrompt] System prompt to use.
 * @param {string} [prefill] Prefill for the prompt.
 * @returns {string | object[]} Prompt ready for use in generation. If using TC, this will be a string. If using CC, this will be an array of chat-style messages.
 */
export function createRawPrompt(prompt, api, instructOverride, quietToLoud, systemPrompt, prefill) {
    const isInstruct = power_user.instruct.enabled && api !== 'openai' && api !== 'novel' && !instructOverride;

    // If the prompt was given as a string, convert to a message-style object assuming user role
    if (typeof prompt === 'string') {
        const message = api === 'openai'
            ? { role: 'user', content: prompt.trim() }
            : { role: 'system', content: prompt };
        prompt = [message];
    } else {  // checks for message-style object
        if (prompt.length === 0 && !systemPrompt) throw Error('No messages provided');
    }

    // Substitute the prefill if provided
    prefill = substituteParams(prefill ?? '');

    // Format each message in the prompt, accounting for the provided roles
    for (const message of prompt) {
        let name = '';
        if (message.role === 'user') name = message.name ?? name1;
        if (message.role === 'assistant') name = message.name ?? name2;
        if (message.role === 'system') name = message.name ?? '';
        const prefix = isInstruct || api === 'openai' ? '' : (name ? `${name}: ` : '');
        message.content = prefix + substituteParams(message.content ?? '');
        if (isInstruct) {  // instruct formatting for text completion
            const isUser = message.role === 'user';
            const isNarrator = message.role === 'system';
            message.content = formatInstructModeChat(name, message.content, isUser, isNarrator, '', name1, name2, false);
        }
    }

    // prepend system prompt, if provided
    if (systemPrompt) {
        systemPrompt = substituteParams(systemPrompt);
        systemPrompt = isInstruct ? (formatInstructModeStoryString(systemPrompt) + '\n') : systemPrompt.trim();
        prompt.unshift({ role: 'system', content: systemPrompt });
    }

    // with Chat Completion, the prefill is an additional assistant message at the end.
    if (api === 'openai' && prefill) {
        prompt.push({ role: 'assistant', content: prefill });
    }

    // if text completion, convert to text prompt by concatenating all message contents and adding the prefill as a promptBias.
    if (api !== 'openai') {
        const joiner = isInstruct ? '' : '\n';
        prompt = prompt.map(message => message.content).join(joiner);
        prompt = api === 'novel' ? adjustNovelInstructionPrompt(prompt) : prompt;
        prompt = prompt + (isInstruct ? formatInstructModePrompt(name2, false, prefill, name1, name2, true, quietToLoud) : `\n${prefill}`);  // add last line
    }

    return prompt;
}

/**
 * Generates a message using the provided prompt.
 * If the prompt is an array of chat-style messages and not using chat completion, it will be converted to a text prompt.
 * @typedef {object} GenerateRawParams
 * @prop {string | object[]} [prompt] Prompt to generate a message from. Can be a string or an array of chat-style messages, i.e. [{role: '', content: ''}, ...]
 * @prop {string} [api] API to use. Main API is used if not specified.
 * @prop {boolean} [instructOverride] true to override instruct mode, false to use the default value
 * @prop {boolean} [quietToLoud] true to generate a message in system mode, false to generate a message in character mode
 * @prop {string} [systemPrompt] System prompt to use.
 * @prop {number} [responseLength] Maximum response length. If unset, the global default value is used.
 * @prop {boolean} [trimNames] Whether to allow trimming "{{user}}:" and "{{char}}:" from the response.
 * @prop {string} [prefill] An optional prefill for the prompt.
 * @prop {object} [jsonSchema] JSON schema to use for the structured generation. Usually requires a special instruction.
 * @param {GenerateRawParams} params Parameters for generating a message
 * @returns {Promise<string>} Generated message
 */
export async function generateRaw({ prompt = '', api = null, instructOverride = false, quietToLoud = false, systemPrompt = '', responseLength = null, trimNames = true, prefill = '', jsonSchema = null } = {}) {
    return generateRawCore({ prompt, api, instructOverride, quietToLoud, systemPrompt, responseLength, trimNames, prefill, jsonSchema });
}

/**
 * Removes last message from the chat DOM.
 * @returns {Promise<void>} Resolves when the message is removed.
 */
function removeLastMessage() {
    return removeLastMessageCore();
}

/**
 * @typedef {object} JsonSchema
 * @property {string} name Name of the schema.
 * @property {object} value JSON schema value.
 * @property {string} [description] Description of the schema.
 * @property {boolean} [strict] If true, the schema will be used in strict mode, meaning that only the fields defined in the schema will be allowed.
 *
 * @typedef {object} GenerateOptions
 * @property {boolean} [automatic_trigger] If the generation was triggered automatically (e.g. group auto mode).
 * @property {boolean} [force_name2] If a char name should be forced to add to the prompt's last line (Text Completion, non-Instruct only).
 * @property {string} [quiet_prompt] A system instruction to use for the quiet prompt.
 * @property {boolean} [quietToLoud] Whether the system instruction should be sent in background (quiet) or a foreground (loud) mode.
 * @property {boolean} [skipWIAN] Skip adding World Info and Author's Note to the prompt.
 * @property {number} [force_chid] Force character ID to use for the generation. Only works in groups.
 * @property {AbortSignal} [signal] Abort signal to cancel the generation. If not provided, will create a new AbortController.
 * @property {string} [quietImage] Image URL to use for the quiet prompt (defaults to empty string)
 * @property {string} [quietName] Name to use for the quiet prompt (defaults to "System:")
 * @property {number} [depth] Recursion depth for the generation. Used to prevent infinite loops in tool calls.
 * @property {JsonSchema} [jsonSchema] JSON schema to use for the structured generation. Usually requires a special instruction.
 */

/**
 * MARK:Generate()
 * Runs a generation using the current chat context.
 * @param {string} type Generation type
 * @param {GenerateOptions} options Generation options
 * @param {boolean} dryRun Whether to actually generate a message or just assemble the prompt
 * @returns {Promise<any>} Returns a promise that resolves when the text is done generating.
 */
export async function Generate(type, { automatic_trigger, force_name2, quiet_prompt, quietToLoud, skipWIAN, force_chid, signal, quietImage, quietName, jsonSchema = null, depth = 0 } = {}, dryRun = false) {
    console.log('Generate entered');
    setGenerationProgress(0);
    generation_started = new Date();

    const entryState = await prepareGenerationEntryStateCore({
        automaticTrigger: automatic_trigger,
        currentCharacterId: this_chid,
        dryRun,
        forceChid: force_chid,
        forceName2: force_name2,
        quietImage,
        quietPrompt: quiet_prompt,
        quietToLoud,
        signal,
        skipWIAN,
        type,
    });

    if (entryState.status === 'complete') {
        return entryState.value;
    }

    const { isImpersonate, isInstruct } = entryState;
    quiet_prompt = entryState.quietPrompt;

    let {
        generationStarted,
        isContinue,
        messageBias,
        promptBias,
        isUserPromptBias,
        textareaText,
    } = await prepareGenerationMessagesCore({
        type,
        dryRun,
        isImpersonate,
        automaticTrigger: automatic_trigger,
        generationStarted: generation_started,
    });
    generation_started = generationStarted;

    let {
        description,
        personality,
        persona,
        scenario,
        mesExamples,
        system,
        jailbreak,
        charDepthPrompt,
        creatorNotes,
    } = preparePromptContextStateCore({ isInstruct });

    const canUseTools = ToolManager.isToolCallingSupported();
    const canPerformToolCalls = !dryRun && ToolManager.canPerformToolCalls(type) && depth < ToolManager.RECURSE_LIMIT;
    let { coreChat, promptReasoning } = await prepareCoreChatStateCore({
        canUseTools,
        isContinue,
        type,
    });

    let {
        aborted: contextWindowAborted,
        adjustedParams,
        cfgGuidanceScale,
        thisMaxContext: this_max_context,
        useCfgPrompt,
    } = await prepareGenerationContextWindowCore({
        coreChat,
        dryRun,
        type,
    });

    if (contextWindowAborted) {
        unblockGeneration(type);
        return Promise.resolve();
    }

    console.log(`Core/all messages: ${coreChat.length}/${chat.length}`);

    if ((promptBias && !isUserPromptBias) || power_user.always_force_name2 || main_api == 'novel') {
        force_name2 = true;
    }

    if (isImpersonate) {
        force_name2 = false;
    }

    let {
        afterScenarioAnchor,
        beforeScenarioAnchor,
        combinedStoryString,
        injectedIndices,
        jailbreak: preparedJailbreak,
        mesExamplesArray,
        storyString,
        worldInfoAfter,
        worldInfoBefore,
        worldInfoString,
    } = await preparePromptAugmentationStateCore({
        charDepthPrompt,
        coreChat,
        creatorNotes,
        description,
        dryRun,
        isContinue,
        isInstruct,
        jailbreak,
        mesExamples,
        personality,
        persona,
        quietPrompt: quiet_prompt,
        scenario,
        skipWIAN,
        system,
        thisMaxContext: this_max_context,
        type,
    });
    jailbreak = preparedJailbreak;

    let {
        addUserAlignment,
        chat2,
        continueMag: continue_mag,
        oaiMessageExamples,
        oaiMessages,
        userAlignmentMessage,
        userMessageIndices,
    } = prepareMessageHistoryStateCore({
        coreChat,
        isContinue,
        isInstruct,
        mesExamplesArray,
    });

    let {
        arrMes,
        countExmAdd: count_exm_add,
        cyclePrompt,
        injectedIndices: packedInjectedIndices,
        pinExmString,
    } = await prepareContextPackingStateCore({
        addUserAlignment,
        chat2,
        combinedStoryString,
        forceName2: force_name2,
        injectedIndices,
        isContinue,
        isImpersonate,
        isInstruct,
        mesExamplesArray,
        promptBias,
        quietName,
        quietPrompt: quiet_prompt,
        quietToLoud,
        thisMaxContext: this_max_context,
        type,
        userAlignmentMessage,
        userMessageIndices,
    });
    injectedIndices = packedInjectedIndices;

    let mesSend = [];

    if (isContinue) {
        // Coping mechanism for OAI spacing
        if (main_api === 'openai' && !cyclePrompt.endsWith(' ')) {
            cyclePrompt += oai_settings.continue_postfix;
            continue_mag += oai_settings.continue_postfix;
        }
    }

    const originalType = type;

    if (!dryRun) {
        setSendButtonState(true);
    }

    let generatedPromptCache = cyclePrompt || '';
    console.debug('calling runGenerate');

    let mesExmString = '';
    ({
        countExmAdd: count_exm_add,
        mesExmString,
        mesSend,
    } = await preparePromptAssemblyStateCore({
        arrMes,
        combinedStoryString,
        countExmAdd: count_exm_add,
        forceName2: force_name2,
        generatedPromptCache,
        isContinue,
        isImpersonate,
        isInstruct,
        mesExamplesArray,
        pinExmString,
        promptBias,
        quietName,
        quietPrompt: quiet_prompt,
        quietToLoud,
        thisMaxContext: this_max_context,
        type,
    }));

    // For prompt bit itemization
    let mesSendString = '';
    let { combinedPrompt: finalPrompt, mesSendString: builtMesSendString } = await buildCombinedPromptCore({
        afterScenarioAnchor,
        beforeScenarioAnchor,
        cfgGuidanceScale,
        combinedStoryString,
        description,
        generatedPromptCache,
        injectedIndices,
        isImpersonate,
        isInstruct,
        isNegative: false,
        jailbreak,
        mesExmString,
        mesSend,
        name: name2,
        naiPreamble: nai_settings.preamble,
        persona,
        personality,
        promptBias,
        scenario,
        storyString,
        system,
        useCfgPrompt,
        user: name1,
        worldInfoAfter,
        worldInfoBefore,
    });
    mesSendString = builtMesSendString;

    const eventData = { prompt: finalPrompt, dryRun: dryRun };
    await eventSource.emit(event_types.GENERATE_AFTER_COMBINE_PROMPTS, eventData);
    finalPrompt = eventData.prompt;

    let thisPromptBits = [];
    const negativePrompt = main_api === 'textgenerationwebui' && useCfgPrompt
        ? (await buildCombinedPromptCore({
            afterScenarioAnchor,
            beforeScenarioAnchor,
            cfgGuidanceScale,
            combinedStoryString,
            description,
            generatedPromptCache,
            injectedIndices,
            isImpersonate,
            isInstruct,
            isNegative: true,
            jailbreak,
            mesExmString,
            mesSend,
            name: name2,
            naiPreamble: nai_settings.preamble,
            persona,
            personality,
            promptBias,
            scenario,
            storyString,
            system,
            useCfgPrompt,
            user: name1,
            worldInfoAfter,
            worldInfoBefore,
        })).combinedPrompt
        : null;

    let {
        generateData: generate_data,
        maxLength,
        openAiCounts,
        openAiMessageCount,
    } = await prepareGenerationDataCore({
        adjustedParams,
        cfgGuidanceScale,
        cyclePrompt,
        description,
        dryRun,
        extensionPrompts: extension_prompts,
        finalPrompt,
        isContinue,
        isImpersonate,
        jailbreak,
        negativePrompt,
        oaiMessageExamples,
        oaiMessages,
        personality,
        promptBias,
        quietImage,
        quietPrompt: quiet_prompt,
        scenario,
        system,
        type,
        useCfgPrompt,
        worldInfoAfter,
        worldInfoBefore,
    });

    if (openAiCounts) {
        parseTokenCounts(openAiCounts, thisPromptBits);
    }

    if (main_api === 'openai' && !dryRun) {
        setInContextMessages(openAiMessageCount, type);
    }

    await eventSource.emit(event_types.GENERATE_AFTER_DATA, generate_data);

    if (dryRun) {
        return Promise.resolve();
    }

    const normalizedContinueMag = isContinue ? promptReasoning.removePrefix(continue_mag) : continue_mag;

    return executeGenerationRequestFlowCore({
        arrMes,
        beforeScenarioAnchor,
        canPerformToolCalls,
        continueMag: normalizedContinueMag,
        countExmAdd: count_exm_add,
        deleteLastMessage,
        description,
        finalPrompt,
        generateData: generate_data,
        generateOptions: { automatic_trigger, force_name2, quiet_prompt, quietToLoud, skipWIAN, force_chid, signal, quietImage, quietName, depth, itemizedPrompts, tokenPadding: power_user.token_padding },
        generatedPromptCache,
        generationStarted: generation_started,
        injectedIndices,
        isContinue,
        isImpersonate,
        jsonSchema,
        mesExamplesArray,
        mesExmString,
        mesSend,
        mesSendString,
        oaiMessageExamples,
        oaiMessages,
        originalType,
        persona,
        personality,
        pinExmString,
        promptBias,
        promptBits: thisPromptBits,
        promptReasoning,
        quietToLoud,
        scenario,
        storyString,
        system,
        thisMaxContext: this_max_context,
        type,
        worldInfoString,
    }).then(onExecutionResult, onError);

    async function onExecutionResult(result) {
        if (result.status === 'recurse') {
            depth = depth + 1;
            await ToolManager.saveFunctionToolInvocations(result.invocationResult.invocations);
            return Generate('normal', { ...result.generateOptions, depth }, dryRun);
        }

        return result.value;
    }

    /**
     * Exception handler for finishGenerating
     * @param {Error|object} exception Error or response JSON
     * @throws {Error|object} Re-throws the exception
     */
    function onError(exception) {
        return handleGenerationErrorCore({ exception, type });
    }
}
//MARK: Generate() ends

/**
 * Stops the generation and any streaming if it is currently running.
 */
export function stopGeneration() {
    const stopped = stopGenerationCore();
    eventSource.emit(event_types.GENERATION_STOPPED);
    return stopped;
}

/**
 * Injects extension prompts into chat messages.
 * @param {object[]} messages Array of chat messages
 * @param {boolean} isContinue Whether the generation is a continuation. If true, the extension prompts of depth 0 are injected at position 1.
 * @returns {Promise<number[]>} Array of indices where the extension prompts were injected
 */
async function doChatInject(messages, isContinue) {
    const injectedIndices = [];
    let totalInsertedMessages = 0;
    messages.reverse();

    const maxDepth = getExtensionPromptMaxDepth();
    for (let i = 0; i <= maxDepth; i++) {
        // Order of priority (most important go lower)
        const roles = [extension_prompt_roles.SYSTEM, extension_prompt_roles.USER, extension_prompt_roles.ASSISTANT];
        const names = {
            [extension_prompt_roles.SYSTEM]: '',
            [extension_prompt_roles.USER]: name1,
            [extension_prompt_roles.ASSISTANT]: name2,
        };
        const roleMessages = [];
        const separator = '\n';
        const wrap = false;

        for (const role of roles) {
            const extensionPrompt = String(await getExtensionPrompt(extension_prompt_types.IN_CHAT, i, separator, role, wrap)).trimStart();
            const isNarrator = role === extension_prompt_roles.SYSTEM;
            const isUser = role === extension_prompt_roles.USER;
            const name = names[role];

            if (extensionPrompt) {
                roleMessages.push({
                    name: name,
                    is_user: isUser,
                    mes: extensionPrompt,
                    extra: {
                        type: isNarrator ? system_message_types.NARRATOR : null,
                    },
                });
            }
        }

        if (roleMessages.length) {
            const depth = isContinue && i === 0 ? 1 : i;
            const injectIdx = Math.min(depth + totalInsertedMessages, messages.length);
            messages.splice(injectIdx, 0, ...roleMessages);
            totalInsertedMessages += roleMessages.length;
            injectedIndices.push(...Array.from({ length: roleMessages.length }, (_, i) => injectIdx + i));
        }
    }

    messages.reverse();
    return injectedIndices;
}

function flushWIDepthInjections() {
    //prevent custom depth WI entries (which have unique random key names) from duplicating
    for (const key of Object.keys(extension_prompts)) {
        if (key.startsWith(inject_ids.CUSTOM_WI_DEPTH)) {
            delete extension_prompts[key];
        }
    }
}

/**
 * Unblocks the UI after a generation is complete.
 * @param {string} [type] Generation type (optional)
 */
function unblockGeneration(type) {
    // Don't unblock if a parallel stream is still running
    if (type === 'quiet' && streamingProcessor && !streamingProcessor.isFinished) {
        return;
    }

    setSendButtonState(false);
    activateSendButtons();
    showSwipeButtons();
    setGenerationProgress(0);
    flushEphemeralStoppingStrings();
    flushWIDepthInjections();
}

export function getNextMessageId(type) {
    return getNextMessageIdCore(type);
}

/**
 * Determines if the message should be auto-continued.
 * @param {string} messageChunk Current message chunk
 * @param {boolean} isImpersonate Is the user impersonation
 * @returns {boolean} Whether the message should be auto-continued
 */
export function shouldAutoContinue(messageChunk, isImpersonate) {
    if (is_send_press) {
        console.debug('Auto-continue is disabled because a message is currently being sent.');
        return false;
    }

    return shouldAutoContinueCore(messageChunk, isImpersonate);
}

/**
 * Triggers auto-continue if the message meets the criteria.
 * @param {string} messageChunk Current message chunk
 * @param {boolean} isImpersonate Is the user impersonation
 */
export function triggerAutoContinue(messageChunk, isImpersonate) {
    return triggerAutoContinueCore(messageChunk, isImpersonate);
}

export function getBiasStrings(textareaText, type) {
    if (type == 'impersonate' || type == 'continue') {
        return { messageBias: '', promptBias: '', isUserPromptBias: false };
    }

    let promptBias = '';
    let messageBias = extractMessageBias(textareaText);

    // If user input is not provided, retrieve the bias of the most recent relevant message
    if (!textareaText) {
        for (let i = chat.length - 1; i >= 0; i--) {
            const mes = chat[i];
            if (type === 'swipe' && chat.length - 1 === i) {
                continue;
            }
            if (mes && (mes.is_user || mes.is_system || mes.extra?.type === system_message_types.NARRATOR)) {
                if (mes.extra?.bias?.trim()?.length > 0) {
                    promptBias = mes.extra.bias;
                }
                break;
            }
        }
    }

    promptBias = messageBias || promptBias || power_user.user_prompt_bias || '';
    const isUserPromptBias = promptBias === power_user.user_prompt_bias;

    // Substitute params for everything
    messageBias = substituteParams(messageBias);
    promptBias = substituteParams(promptBias);

    return { messageBias, promptBias, isUserPromptBias };
}

/**
 * @param {Object} chatItem Message history item.
 * @param {boolean} isInstruct Whether instruct mode is enabled.
 * @param {boolean|number} forceOutputSequence Whether to force the first/last output sequence for instruct mode.
 */
function formatMessageHistoryItem(chatItem, isInstruct, forceOutputSequence) {
    const isNarratorType = chatItem?.extra?.type === system_message_types.NARRATOR;
    const characterName = chatItem?.name ? chatItem.name : name2;
    const itemName = chatItem.is_user ? chatItem['name'] : characterName;
    const shouldPrependName = !isNarratorType;

    // If this symbol flag is set, completely ignore the message.
    // This can be used to hide messages without affecting the number of messages in the chat.
    if (chatItem.extra?.[IGNORE_SYMBOL]) {
        return '';
    }

    // Don't include a name if it's empty
    let textResult = chatItem?.name && shouldPrependName ? `${itemName}: ${chatItem.mes}\n` : `${chatItem.mes}\n`;

    if (isInstruct) {
        textResult = formatInstructModeChat(itemName, chatItem.mes, chatItem.is_user, isNarratorType, chatItem.force_avatar, name1, name2, forceOutputSequence);
    }

    return textResult;
}

/**
 * Removes all {{macros}} from a string.
 * @param {string} str String to remove macros from.
 * @returns {string} String with macros removed.
 */
export function removeMacros(str) {
    return (str ?? '').replace(/\{\{[\s\S]*?\}\}/gm, '').trim();
}

/**
 * Inserts a user message into the chat history.
 * @param {string} messageText Message text.
 * @param {string} messageBias Message bias.
 * @param {number} [insertAt] Optional index to insert the message at.
 * @param {boolean} [compact] Send as a compact display message.
 * @param {string} [name] Name of the user sending the message. Defaults to name1.
 * @param {string} [avatar] Avatar of the user sending the message. Defaults to user_avatar.
 * @returns {Promise<any>} A promise that resolves to the message when it is inserted.
 */
export async function sendMessageAsUser(messageText, messageBias, insertAt = null, compact = false, name = name1, avatar = user_avatar) {
    messageText = getRegexedString(messageText, regex_placement.USER_INPUT);

    const message = {
        name: name,
        is_user: true,
        is_system: false,
        send_date: getMessageTimeStamp(),
        mes: substituteParams(messageText),
        extra: {
            isSmallSys: compact,
        },
    };

    if (power_user.message_token_count_enabled) {
        message.extra.token_count = await getTokenCountAsync(message.mes, 0);
    }

    // Lock user avatar to a persona.
    if (avatar in power_user.personas) {
        message.force_avatar = getThumbnailUrl('persona', avatar);
    }

    if (messageBias) {
        message.extra.bias = messageBias;
        message.mes = removeMacros(message.mes);
    }

    await populateFileAttachment(message);
    statMesProcess(message, 'user', characters, this_chid, '');

    if (typeof insertAt === 'number' && insertAt >= 0 && insertAt <= chat.length) {
        chat.splice(insertAt, 0, message);
        await saveChatConditional();
        await eventSource.emit(event_types.MESSAGE_SENT, insertAt);
        await reloadCurrentChat();
        await eventSource.emit(event_types.USER_MESSAGE_RENDERED, insertAt);
    } else {
        chat.push(message);
        const chat_id = (chat.length - 1);
        await eventSource.emit(event_types.MESSAGE_SENT, chat_id);
        addOneMessage(message);
        await eventSource.emit(event_types.USER_MESSAGE_RENDERED, chat_id);
        await saveChatConditional();
    }

    return message;
}

/**
 * Gets the maximum usable context size for the current API.
 * @param {number|null} overrideResponseLength Optional override for the response length.
 * @returns {number} Maximum usable context size.
 */
export function getMaxContextSize(overrideResponseLength = null) {
    if (typeof overrideResponseLength !== 'number' || overrideResponseLength <= 0 || isNaN(overrideResponseLength)) {
        overrideResponseLength = null;
    }

    let this_max_context = 1487;
    if (main_api == 'kobold' || main_api == 'koboldhorde' || main_api == 'textgenerationwebui') {
        this_max_context = (max_context - (overrideResponseLength || amount_gen));
    }
    if (main_api == 'novel') {
        this_max_context = Number(max_context);
        if (nai_settings.model_novel.includes('clio')) {
            this_max_context = Math.min(max_context, 8192);
        }
        if (nai_settings.model_novel.includes('kayra')) {
            this_max_context = Math.min(max_context, 8192);

            const subscriptionLimit = getKayraMaxContextTokens();
            if (typeof subscriptionLimit === 'number' && this_max_context > subscriptionLimit) {
                this_max_context = subscriptionLimit;
                console.log(`NovelAI subscription limit reached. Max context size is now ${this_max_context}`);
            }
        }
        if (nai_settings.model_novel.includes('erato')) {
            // subscriber limits coming soon
            this_max_context = Math.min(max_context, 8192);

            // Added special tokens and whatnot
            this_max_context -= 10;
        }

        this_max_context = this_max_context - (overrideResponseLength || amount_gen);
    }
    if (main_api == 'openai') {
        this_max_context = oai_settings.openai_max_context - (overrideResponseLength || oai_settings.openai_max_tokens);
    }
    return this_max_context;
}

function parseTokenCounts(counts, thisPromptBits) {
    /**
     * @param {any[]} numbers
     */
    function getSum(...numbers) {
        return numbers.map(x => Number(x)).filter(x => !Number.isNaN(x)).reduce((acc, val) => acc + val, 0);
    }
    const total = getSum(Object.values(counts));

    thisPromptBits.push({
        oaiStartTokens: (counts?.start + counts?.controlPrompts) || 0,
        oaiPromptTokens: getSum(counts?.prompt, counts?.charDescription, counts?.charPersonality, counts?.scenario) || 0,
        oaiBiasTokens: counts?.bias || 0,
        oaiNudgeTokens: counts?.nudge || 0,
        oaiJailbreakTokens: counts?.jailbreak || 0,
        oaiImpersonateTokens: counts?.impersonate || 0,
        oaiExamplesTokens: (counts?.dialogueExamples + counts?.examples) || 0,
        oaiConversationTokens: (counts?.conversation + counts?.chatHistory) || 0,
        oaiNsfwTokens: counts?.nsfw || 0,
        oaiMainTokens: counts?.main || 0,
        oaiTotalTokens: total,
    });
}

function addChatsPreamble(mesSendString) {
    return main_api === 'novel'
        ? substituteParams(nai_settings.preamble) + '\n' + mesSendString
        : mesSendString;
}

function addChatsSeparator(mesSendString) {
    if (power_user.context.chat_start) {
        return substituteParams(power_user.context.chat_start + '\n') + mesSendString;
    }

    else {
        return mesSendString;
    }
}

export async function duplicateCharacter() {
    if (this_chid === undefined || !characters[this_chid]) {
        toastr.warning(t`You must first select a character to duplicate!`);
        return '';
    }

    const confirmMessage = $(await renderTemplateAsync('duplicateConfirm'));
    const confirm = await callGenericPopup(confirmMessage, POPUP_TYPE.CONFIRM);

    if (!confirm) {
        console.log('User cancelled duplication');
        return '';
    }

    const body = { avatar_url: characters[this_chid].avatar };
    const response = await fetch('/api/characters/duplicate', {
        method: 'POST',
        headers: getRequestHeaders(),
        body: JSON.stringify(body),
    });
    if (response.ok) {
        toastr.success(t`Character Duplicated`);
        const data = await response.json();
        await eventSource.emit(event_types.CHARACTER_DUPLICATED, { oldAvatar: body.avatar_url, newAvatar: data.path });
        await getCharacters();
    }

    return '';
}

function setInContextMessages(msgInContextCount, type) {
    $('#chat .mes').removeClass('lastInContext');

    if (type === 'swipe' || type === 'regenerate' || type === 'continue') {
        msgInContextCount++;
    }

    const lastMessageBlock = $('#chat .mes:not([is_system="true"])').eq(-msgInContextCount);
    lastMessageBlock.addClass('lastInContext');

    if (lastMessageBlock.length === 0) {
        const firstMessageId = getFirstDisplayedMessageId();
        $(`#chat .mes[mesid="${firstMessageId}"`).addClass('lastInContext');
    }

    // Update last id to chat. No metadata save on purpose, gets hopefully saved via another call
    const lastMessageId = Math.max(0, chat.length - msgInContextCount);
    chat_metadata['lastInContextMessageId'] = lastMessageId;
}

/**
 * @typedef {object} AdditionalRequestOptions
 * @property {JsonSchema} [jsonSchema]
 */

/**
 * Sends a non-streaming request to the API.
 * @param {string} type Generation type
 * @param {object} data Generation data
 * @param {AdditionalRequestOptions} [options] Additional options for the generation request
 * @returns {Promise<object>} Response data from the API
 * @throws {Error|object}
 */
export async function sendGenerationRequest(type, data, options = {}) {
    if (main_api === 'openai') {
        return await sendOpenAIRequest(type, data.prompt, abortController.signal, options);
    }

    if (main_api === 'koboldhorde') {
        return await generateHorde(data.prompt, data, abortController.signal, true);
    }

    const response = await fetch(getGenerateUrl(main_api), {
        method: 'POST',
        headers: getRequestHeaders(),
        cache: 'no-cache',
        body: JSON.stringify(data),
        signal: abortController.signal,
    });

    if (!response.ok) {
        throw await response.json();
    }

    return await response.json();
}

/**
 * Sends a streaming request to the API.
 * @param {string} type Generation type
 * @param {object} data Generation data
 * @param {AdditionalRequestOptions} [options] Additional options for the generation request
 * @returns {Promise<any>} Streaming generator
 */
export async function sendStreamingRequest(type, data, options = {}) {
    if (abortController?.signal?.aborted) {
        throw new Error('Generation was aborted.');
    }

    switch (main_api) {
        case 'openai':
            return await sendOpenAIRequest(type, data.prompt, streamingProcessor.abortController.signal, options);
        case 'textgenerationwebui':
            return await generateTextGenWithStreaming(data, streamingProcessor.abortController.signal);
        case 'novel':
            return await generateNovelWithStreaming(data, streamingProcessor.abortController.signal);
        case 'kobold':
            return await generateKoboldWithStreaming(data, streamingProcessor.abortController.signal);
        default:
            throw new Error('Streaming is enabled, but the current API does not support streaming.');
    }
}

/**
 * Gets the generation endpoint URL for the specified API.
 * @param {string} api API name
 * @returns {string} Generation URL
 * @throws {Error} If the API is unknown
 */
export function getGenerateUrl(api) {
    switch (api) {
        case 'kobold':
            return '/api/backends/kobold/generate';
        case 'koboldhorde':
            return '/api/backends/koboldhorde/generate';
        case 'textgenerationwebui':
            return '/api/backends/text-completions/generate';
        case 'novel':
            return '/api/novelai/generate';
        default:
            throw new Error(`Unknown API: ${api}`);
    }
}

function extractTitleFromData(data) {
    if (main_api == 'koboldhorde') {
        return data.workerName;
    }

    return undefined;
}

/**
 * Extracts the image from the response data.
 * @param {object} data Response data
 * @param {object} [options] Extraction options
 * @param {string} [options.mainApi] Main API to use
 * @param {string} [options.chatCompletionSource] Chat completion source
 * @returns {string} Extracted image
 */
function extractImageFromData(data, { mainApi = null, chatCompletionSource = null } = {}) {
    switch (mainApi ?? main_api) {
        case 'openai': {
            switch (chatCompletionSource ?? oai_settings.chat_completion_source) {
                case chat_completion_sources.VERTEXAI:
                case chat_completion_sources.MAKERSUITE: {
                    const inlineData = data?.responseContent?.parts?.find(x => x.inlineData)?.inlineData;
                    if (inlineData) {
                        return `data:${inlineData.mimeType};base64,${inlineData.data}`;
                    }
                } break;

            }
        } break;
    }

    return undefined;
}

/**
 * parseAndSaveLogprobs receives the full data response for a non-streaming
 * generation, parses logprobs for all tokens in the message, and saves them
 * to the currently active message.
 * @param {object} data - response data containing all tokens/logprobs
 * @param {string} continueFrom - for 'continue' generations, the prompt
 *  */
function parseAndSaveLogprobs(data, continueFrom) {
    /** @type {import('./scripts/logprobs.js').TokenLogprobs[] | null} */
    let logprobs = null;

    switch (main_api) {
        case 'novel':
            // parser only handles one token/logprob pair at a time
            logprobs = data.logprobs?.map(parseNovelAILogprobs) || null;
            break;
        case 'openai':
            // OAI and other chat completion APIs must handle this earlier in
            // `sendOpenAIRequest`. `data` for these APIs is just a string with
            // the text of the generated message, logprobs are not included.
            return;
        case 'textgenerationwebui':
            switch (textgen_settings.type) {
                case textgen_types.LLAMACPP: {
                    logprobs = data?.completion_probabilities?.map(x => parseTextgenLogprobs(x.content, [x])) || null;
                } break;
                case textgen_types.KOBOLDCPP:
                case textgen_types.VLLM:
                case textgen_types.INFERMATICAI:
                case textgen_types.APHRODITE:
                case textgen_types.MANCER:
                case textgen_types.TABBY: {
                    logprobs = parseTabbyLogprobs(data) || null;
                } break;
            } break;
        default:
            return;
    }

    saveLogprobsForActiveMessage(logprobs, continueFrom);
}

/**
 * Extracts the message from the response data.
 * @param {object} data Response data
 * @param {string} activeApi If it's set, ignores active API
 * @returns {string} Extracted message
 */
export function extractMessageFromData(data, activeApi = null) {
    function getResult() {
        if (typeof data === 'string') {
            return data;
        }

        switch (activeApi ?? main_api) {
            case 'kobold':
                return data.results[0].text;
            case 'koboldhorde':
                return data.text;
            case 'textgenerationwebui':
                return data.choices?.[0]?.text ?? data.choices?.[0]?.message?.content ?? data.content ?? data.response ?? '';
            case 'novel':
                return data.output;
            case 'openai':
                return data?.content?.find(p => p.type === 'text')?.text ?? data?.choices?.[0]?.message?.content ?? data?.choices?.[0]?.text ?? data?.text ?? data?.message?.content?.[0]?.text ?? data?.message?.tool_plan ?? '';
            default:
                return '';
        }
    }

    const result = getResult();
    return Array.isArray(result) ? result.map(x => x.text).filter(x => x).join('') : result;
}

/**
 * Extracts JSON from the response data.
 * @param {object} data Response data
 * @returns {string} Extracted JSON string from the response data
 */
export function extractJsonFromData(data, { mainApi = null, chatCompletionSource = null } = {}) {
    mainApi = mainApi ?? main_api;
    chatCompletionSource = chatCompletionSource ?? oai_settings.chat_completion_source;

    const tryParse = (/** @type {string} */ value) => {
        try {
            return JSON.parse(value);
        } catch (e) {
            console.debug('Failed to parse content as JSON.', e);
        }
    };

    let result = {};

    switch (mainApi) {
        case 'openai': {
            const text = extractMessageFromData(data, mainApi);
            switch (chatCompletionSource) {
                case chat_completion_sources.CLAUDE:
                    result = data?.content?.find(x => x.type === 'tool_use')?.input;
                    break;
                case chat_completion_sources.PERPLEXITY:
                    result = tryParse(removeReasoningFromString(text));
                    break;
                case chat_completion_sources.VERTEXAI:
                case chat_completion_sources.MAKERSUITE:
                case chat_completion_sources.DEEPSEEK:
                case chat_completion_sources.AI21:
                case chat_completion_sources.GROQ:
                case chat_completion_sources.POLLINATIONS:
                case chat_completion_sources.AIMLAPI:
                case chat_completion_sources.OPENAI:
                case chat_completion_sources.OPENROUTER:
                case chat_completion_sources.MISTRALAI:
                case chat_completion_sources.CUSTOM:
                case chat_completion_sources.COHERE:
                case chat_completion_sources.XAI:
                default:
                    result = tryParse(text);
                    break;
            }
        } break;
    }

    return JSON.stringify(result ?? {});
}

/**
 * Extracts multiswipe swipes from the response data.
 * @param {Object} data Response data
 * @param {string} type Type of generation
 * @returns {string[]} Array of extra swipes
 */
function extractMultiSwipes(data, type) {
    const swipes = [];

    if (!data) {
        return swipes;
    }

    if (type === 'continue' || type === 'impersonate' || type === 'quiet') {
        return swipes;
    }

    if (main_api === 'openai' || (main_api === 'textgenerationwebui' && [textgen_types.MANCER, textgen_types.VLLM, textgen_types.APHRODITE, textgen_types.TABBY, textgen_types.INFERMATICAI].includes(textgen_settings.type))) {
        if (!Array.isArray(data.choices)) {
            return swipes;
        }

        const multiSwipeCount = data.choices.length - 1;

        if (multiSwipeCount <= 0) {
            return swipes;
        }

        for (let i = 1; i < data.choices.length; i++) {
            const text = data?.choices[i]?.message?.content ?? data?.choices[i]?.text ?? '';
            const cleanedText = cleanUpMessage({
                getMessage: text,
                isImpersonate: false,
                isContinue: false,
                displayIncompleteSentences: false,
            });

            swipes.push(cleanedText);
        }
    }

    return swipes;
}

/**
 * Formats a message according to user settings
 * @param {object} [options] - Additional options.
 * @param {string} [options.getMessage] The message to clean up
 * @param {boolean} [options.isImpersonate] Whether this is an impersonated message
 * @param {boolean} [options.isContinue] Whether this is a continued message
 * @param {boolean} [options.displayIncompleteSentences] Whether to keep incomplete sentences at the end.
 * @param {array} [options.stoppingStrings] Array of stopping strings.
 * @param {boolean} [options.includeUserPromptBias] Whether to permit prepending the user prompt bias at the beginning.
 * @param {boolean} [options.trimNames] Whether to allow trimming "{{char}}:" or "{{user}}:" from the beginning.
 * @param {boolean} [options.trimWrongNames] Whether to allow deleting responses prefixed by the incorrect name, depending on isImpersonate
 *
 * @returns {string} The formatted message
 */
export function cleanUpMessage({ getMessage, isImpersonate, isContinue, displayIncompleteSentences = false, stoppingStrings = null, includeUserPromptBias = true, trimNames = true, trimWrongNames = true } = {}) {
    if (arguments.length > 0 && typeof arguments[0] !== 'object') {
        console.trace('cleanUpMessage called with positional arguments. Please use an object instead.');
        [getMessage, isImpersonate, isContinue, displayIncompleteSentences, stoppingStrings, includeUserPromptBias, trimNames, trimWrongNames] = arguments;
    }

    if (!getMessage) {
        return '';
    }

    // Add the prompt bias before anything else
    if (
        includeUserPromptBias &&
        power_user.user_prompt_bias &&
        !isImpersonate &&
        !isContinue &&
        power_user.user_prompt_bias.length !== 0
    ) {
        getMessage = substituteParams(power_user.user_prompt_bias) + getMessage;
    }

    // Allow for caching of stopping strings. getStoppingStrings is an expensive function, especially with macros
    // enabled, so for streaming, we call it once and then pass it into each cleanUpMessage call.
    if (!stoppingStrings) {
        stoppingStrings = getStoppingStrings(isImpersonate, isContinue);
    }

    for (const stoppingString of stoppingStrings) {
        if (stoppingString.length) {
            for (let j = stoppingString.length; j > 0; j--) {
                if (getMessage.slice(-j) === stoppingString.slice(0, j)) {
                    getMessage = getMessage.slice(0, -j);
                    break;
                }
            }
        }
    }

    // Regex uses vars, so add before formatting
    getMessage = getRegexedString(getMessage, isImpersonate ? regex_placement.USER_INPUT : regex_placement.AI_OUTPUT);

    if (power_user.collapse_newlines) {
        getMessage = collapseNewlines(getMessage);
    }

    // trailing invisible whitespace before every newlines, on a multiline string
    // "trailing whitespace on newlines       \nevery line of the string    \n?sample text" ->
    // "trailing whitespace on newlines\nevery line of the string\nsample text"
    getMessage = getMessage.replace(/[^\S\r\n]+$/gm, '');

    if (trimWrongNames) {
        // If this is an impersonation, delete the entire response if it starts with "{{char}}:"
        // If this isn't an impersonation, delete the entire response if it starts with "{{user}}:"
        // Also delete any trailing text that starts with the wrong name.
        // This only occurs if the corresponding "power_user.allow_nameX_display" is false.

        let wrongName = isImpersonate
            ? (!power_user.allow_name2_display ? name2 : '')  // char
            : (!power_user.allow_name1_display ? name1 : '');  // user

        if (wrongName) {
            // If the message starts with the wrong name, delete the entire response
            let startIndex = getMessage.indexOf(`${wrongName}:`);
            if (startIndex === 0) {
                getMessage = '';
                console.debug(`Message started with the wrong name: "${wrongName}" - response was deleted.`);
            }

            // If there is trailing text starting with the wrong name, trim it off.
            startIndex = getMessage.indexOf(`\n${wrongName}:`);
            if (startIndex >= 0) {
                getMessage = getMessage.substring(0, startIndex);
            }
        }
    }

    if (getMessage.indexOf('<|endoftext|>') != -1) {
        getMessage = getMessage.substring(0, getMessage.indexOf('<|endoftext|>'));
    }
    const isInstruct = power_user.instruct.enabled && main_api !== 'openai';
    const isNotEmpty = (str) => str && str.trim() !== '';
    if (isInstruct && power_user.instruct.stop_sequence) {
        if (getMessage.indexOf(power_user.instruct.stop_sequence) != -1) {
            getMessage = getMessage.substring(0, getMessage.indexOf(power_user.instruct.stop_sequence));
        }
    }
    // Hana: Only use the first sequence (should be <|model|>)
    // of the prompt before <|user|> (as KoboldAI Lite does it).
    if (isInstruct && isNotEmpty(power_user.instruct.input_sequence)) {
        if (getMessage.indexOf(power_user.instruct.input_sequence) != -1) {
            getMessage = getMessage.substring(0, getMessage.indexOf(power_user.instruct.input_sequence));
        }
    }

    // Remove instruct sequences leaking to the output
    if (isInstruct && power_user.instruct.sequences_as_stop_strings) {
        const sequences = [
            { value: power_user.instruct.input_sequence, apply: isImpersonate && isNotEmpty(power_user.instruct.input_sequence) },
            { value: power_user.instruct.output_sequence, apply: !isImpersonate && isNotEmpty(power_user.instruct.output_sequence) },
            { value: power_user.instruct.last_output_sequence, apply: !isImpersonate && isNotEmpty(power_user.instruct.last_output_sequence) },
        ];
        for (const seq of sequences.filter(s => s.apply)) {
            seq.value.split('\n').filter(line => line.trim() !== '').forEach(line => { getMessage = getMessage.replaceAll(line, ''); });
        }
    }

    // clean-up group message from excessive generations
    if (selected_group) {
        getMessage = cleanGroupMessage(getMessage);
    }

    if (!power_user.allow_name2_display) {
        const name2Escaped = escapeRegex(name2);
        getMessage = getMessage.replace(new RegExp(`(^|\n)${name2Escaped}:\\s*`, 'g'), '$1');
    }

    if (isImpersonate) {
        getMessage = getMessage.trim();
    }

    if (power_user.auto_fix_generated_markdown) {
        getMessage = fixMarkdown(getMessage, false);
    }

    if (trimNames) {
        // If this is an impersonation, trim "{{user}}:" from the beginning
        // If this isn't an impersonation, trim "{{char}}:" from the beginning.
        // Only applied when the corresponding "power_user.allow_nameX_display" is false.
        const nameToTrim2 = isImpersonate
            ? (!power_user.allow_name1_display ? name1 : '')  // user
            : (!power_user.allow_name2_display ? name2 : '');  // char

        if (nameToTrim2 && getMessage.startsWith(nameToTrim2 + ':')) {
            getMessage = getMessage.replace(nameToTrim2 + ':', '');
            getMessage = getMessage.trimStart();
        }
    }

    if (isImpersonate) {
        getMessage = getMessage.trim();
    }

    if (!displayIncompleteSentences && power_user.trim_sentences) {
        getMessage = trimToEndSentence(getMessage);
    }

    if (power_user.trim_spaces && !PromptReasoning.getLatestPrefix()) {
        getMessage = getMessage.trim();
    }

    return getMessage;
}

/**
 * Adds an image to the message.
 * @param {object} message Message object
 * @param {object} sources Image sources
 * @param {string} [sources.imageUrl] Image URL
 *
 * @returns {Promise<void>}
 */
async function processImageAttachment(message, { imageUrl }) {
    if (!imageUrl) {
        return;
    }

    let url = imageUrl;
    if (isDataURL(url)) {
        const fileName = `inline_image_${Date.now().toString()}`;
        const [mime, base64] = /^data:(.*?);base64,(.*)$/.exec(imageUrl).slice(1);
        url = await saveBase64AsFile(base64, message.name, fileName, mime.split('/')[1]);
    }
    saveImageToMessage({ image: url, inline: true }, message);
}

/**
 * Saves a resulting message to the chat.
 * @param {SaveReplyParams} params
 * @returns {Promise<SaveReplyResult>} Promise when the message is saved
 *
 * @typedef {object} SaveReplyParams
 * @property {string} type Type of generation
 * @property {string} getMessage Generated message
 * @property {boolean} [fromStreaming] If the message is from streaming
 * @property {string} [title] Message tooltip
 * @property {string[]} [swipes] Extra swipes
 * @property {string} [reasoning] Message reasoning
 * @property {string} [imageUrl] Link to an image
 *
 * @typedef {object} SaveReplyResult
 * @property {string} type Type of generation
 * @property {string} getMessage Generated message
 */
export async function saveReply({ type, getMessage, fromStreaming = false, title = '', swipes = [], reasoning = '', imageUrl = '' }) {
    // Backward compatibility
    if (arguments.length > 1 && typeof arguments[0] !== 'object') {
        console.trace('saveReply called with positional arguments. Please use an object instead.');
        [type, getMessage, fromStreaming, title, swipes, reasoning, imageUrl] = arguments;
    }

    if (type != 'append' && type != 'continue' && type != 'appendFinal' && chat.length && (chat[chat.length - 1]['swipe_id'] === undefined ||
        chat[chat.length - 1]['is_user'])) {
        type = 'normal';
    }

    if (chat.length && (!chat[chat.length - 1]['extra'] || typeof chat[chat.length - 1]['extra'] !== 'object')) {
        chat[chat.length - 1]['extra'] = {};
    }

    // Coerce null/undefined to empty string
    if (chat.length && !chat[chat.length - 1]['extra']['reasoning']) {
        chat[chat.length - 1]['extra']['reasoning'] = '';
    }

    if (!reasoning) {
        reasoning = '';
    }

    let oldMessage = '';
    const generationFinished = new Date();
    if (type === 'swipe') {
        oldMessage = chat[chat.length - 1]['mes'];
        chat[chat.length - 1]['swipes'].length++;
        if (chat[chat.length - 1]['swipe_id'] === chat[chat.length - 1]['swipes'].length - 1) {
            chat[chat.length - 1]['title'] = title;
            chat[chat.length - 1]['mes'] = getMessage;
            chat[chat.length - 1]['gen_started'] = generation_started;
            chat[chat.length - 1]['gen_finished'] = generationFinished;
            chat[chat.length - 1]['send_date'] = getMessageTimeStamp();
            chat[chat.length - 1]['extra']['api'] = getGeneratingApi();
            chat[chat.length - 1]['extra']['model'] = getGeneratingModel();
            chat[chat.length - 1]['extra']['reasoning'] = reasoning;
            chat[chat.length - 1]['extra']['reasoning_duration'] = null;
            await processImageAttachment(chat[chat.length - 1], { imageUrl });
            if (power_user.message_token_count_enabled) {
                const tokenCountText = (reasoning || '') + chat[chat.length - 1]['mes'];
                chat[chat.length - 1]['extra']['token_count'] = await getTokenCountAsync(tokenCountText, 0);
            }
            const chat_id = (chat.length - 1);
            await eventSource.emit(event_types.MESSAGE_RECEIVED, chat_id, type);
            addOneMessage(chat[chat_id], { type: 'swipe' });
            await eventSource.emit(event_types.CHARACTER_MESSAGE_RENDERED, chat_id, type);
        } else {
            chat[chat.length - 1]['mes'] = getMessage;
        }
    } else if (type === 'append' || type === 'continue') {
        console.debug('Trying to append.');
        oldMessage = chat[chat.length - 1]['mes'];
        chat[chat.length - 1]['title'] = title;
        chat[chat.length - 1]['mes'] += getMessage;
        chat[chat.length - 1]['gen_started'] = generation_started;
        chat[chat.length - 1]['gen_finished'] = generationFinished;
        chat[chat.length - 1]['send_date'] = getMessageTimeStamp();
        chat[chat.length - 1]['extra']['api'] = getGeneratingApi();
        chat[chat.length - 1]['extra']['model'] = getGeneratingModel();
        chat[chat.length - 1]['extra']['reasoning'] = reasoning;
        chat[chat.length - 1]['extra']['reasoning_duration'] = null;
        await processImageAttachment(chat[chat.length - 1], { imageUrl });
        if (power_user.message_token_count_enabled) {
            const tokenCountText = (reasoning || '') + chat[chat.length - 1]['mes'];
            chat[chat.length - 1]['extra']['token_count'] = await getTokenCountAsync(tokenCountText, 0);
        }
        const chat_id = (chat.length - 1);
        await eventSource.emit(event_types.MESSAGE_RECEIVED, chat_id, type);
        addOneMessage(chat[chat_id], { type: 'swipe' });
        await eventSource.emit(event_types.CHARACTER_MESSAGE_RENDERED, chat_id, type);
    } else if (type === 'appendFinal') {
        oldMessage = chat[chat.length - 1]['mes'];
        console.debug('Trying to appendFinal.');
        chat[chat.length - 1]['title'] = title;
        chat[chat.length - 1]['mes'] = getMessage;
        chat[chat.length - 1]['gen_started'] = generation_started;
        chat[chat.length - 1]['gen_finished'] = generationFinished;
        chat[chat.length - 1]['send_date'] = getMessageTimeStamp();
        chat[chat.length - 1]['extra']['api'] = getGeneratingApi();
        chat[chat.length - 1]['extra']['model'] = getGeneratingModel();
        chat[chat.length - 1]['extra']['reasoning'] += reasoning;
        await processImageAttachment(chat[chat.length - 1], { imageUrl });
        // We don't know if the reasoning duration extended, so we don't update it here on purpose.
        if (power_user.message_token_count_enabled) {
            const tokenCountText = (reasoning || '') + chat[chat.length - 1]['mes'];
            chat[chat.length - 1]['extra']['token_count'] = await getTokenCountAsync(tokenCountText, 0);
        }
        const chat_id = (chat.length - 1);
        await eventSource.emit(event_types.MESSAGE_RECEIVED, chat_id, type);
        addOneMessage(chat[chat_id], { type: 'swipe' });
        await eventSource.emit(event_types.CHARACTER_MESSAGE_RENDERED, chat_id, type);

    } else {
        console.debug('entering chat update routine for non-swipe post');
        chat[chat.length] = {};
        chat[chat.length - 1]['extra'] = {};
        chat[chat.length - 1]['name'] = name2;
        chat[chat.length - 1]['is_user'] = false;
        chat[chat.length - 1]['send_date'] = getMessageTimeStamp();
        chat[chat.length - 1]['extra']['api'] = getGeneratingApi();
        chat[chat.length - 1]['extra']['model'] = getGeneratingModel();
        chat[chat.length - 1]['extra']['reasoning'] = reasoning;
        chat[chat.length - 1]['extra']['reasoning_duration'] = null;
        if (power_user.trim_spaces) {
            getMessage = getMessage.trim();
        }
        chat[chat.length - 1]['mes'] = getMessage;
        chat[chat.length - 1]['title'] = title;
        chat[chat.length - 1]['gen_started'] = generation_started;
        chat[chat.length - 1]['gen_finished'] = generationFinished;

        if (power_user.message_token_count_enabled) {
            const tokenCountText = (reasoning || '') + chat[chat.length - 1]['mes'];
            chat[chat.length - 1]['extra']['token_count'] = await getTokenCountAsync(tokenCountText, 0);
        }

        if (selected_group) {
            console.debug('entering chat update for groups');
            let avatarImg = 'img/ai4.png';
            if (characters[this_chid].avatar != 'none') {
                avatarImg = getThumbnailUrl('avatar', characters[this_chid].avatar);
            }
            chat[chat.length - 1]['force_avatar'] = avatarImg;
            chat[chat.length - 1]['original_avatar'] = characters[this_chid].avatar;
            chat[chat.length - 1]['extra']['gen_id'] = group_generation_id;
        }

        await processImageAttachment(chat[chat.length - 1], { imageUrl });
        const chat_id = (chat.length - 1);

        !fromStreaming && await eventSource.emit(event_types.MESSAGE_RECEIVED, chat_id, type);
        addOneMessage(chat[chat_id]);
        !fromStreaming && await eventSource.emit(event_types.CHARACTER_MESSAGE_RENDERED, chat_id, type);
    }

    const item = chat[chat.length - 1];
    if (item['swipe_info'] === undefined) {
        item['swipe_info'] = [];
    }
    if (item['swipe_id'] !== undefined) {
        const swipeId = item['swipe_id'];
        item['swipes'][swipeId] = item['mes'];
        item['swipe_info'][swipeId] = {
            send_date: item['send_date'],
            gen_started: item['gen_started'],
            gen_finished: item['gen_finished'],
            extra: structuredClone(item['extra']),
        };
    } else {
        item['swipe_id'] = 0;
        item['swipes'] = [];
        item['swipes'][0] = chat[chat.length - 1]['mes'];
        item['swipe_info'][0] = {
            send_date: chat[chat.length - 1]['send_date'],
            gen_started: chat[chat.length - 1]['gen_started'],
            gen_finished: chat[chat.length - 1]['gen_finished'],
            extra: structuredClone(chat[chat.length - 1]['extra']),
        };
    }

    if (Array.isArray(swipes) && swipes.length > 0) {
        const swipeInfoExtra = structuredClone(item.extra ?? {});
        delete swipeInfoExtra.token_count;
        delete swipeInfoExtra.reasoning;
        delete swipeInfoExtra.reasoning_duration;
        const swipeInfo = {
            send_date: item.send_date,
            gen_started: item.gen_started,
            gen_finished: item.gen_finished,
            extra: swipeInfoExtra,
        };
        const swipeInfoArray = Array(swipes.length).fill().map(() => structuredClone(swipeInfo));
        parseReasoningInSwipes(swipes, swipeInfoArray, item.extra?.reasoning_duration);
        item.swipes.push(...swipes);
        item.swipe_info.push(...swipeInfoArray);
    }

    statMesProcess(chat[chat.length - 1], type, characters, this_chid, oldMessage);
    return { type, getMessage };
}

/**
 * Syncs the current message and all its data into the swipe data at the given message ID (or the last message if no ID is given).
 *
 * If the swipe data is invalid in some way, this function will exit out without doing anything.
 * @param {number?} [messageId=null] - The ID of the message to sync with the swipe data. If no ID is given, the last message is used.
 * @returns {boolean} Whether the message was successfully synced
 */
export function syncMesToSwipe(messageId = null) {
    return syncMesToSwipeCore(messageId);
}

/**
 * Syncs swipe data back to the message data at the given message ID (or the last message if no ID is given).
 * If the swipe ID is not provided, the current swipe ID in the message object is used.
 *
 * If the swipe data is invalid in some way, this function will exit out without doing anything.
 * @param {number?} [messageId=null] - The ID of the message to sync with the swipe data. If no ID is given, the last message is used.
 * @param {number?} [swipeId=null] - The ID of the swipe to sync. If no ID is given, the current swipe ID in the message object is used.
 * @returns {boolean} Whether the swipe data was successfully synced to the message
 */
export function syncSwipeToMes(messageId = null, swipeId = null) {
    return syncSwipeToMesCore(messageId, swipeId);
}

/**
 * Saves the image to the message object.
 * @param {ParsedImage} img Image object
 * @param {object} mes Chat message object
 * @typedef {{ image?: string, title?: string, inline?: boolean }} ParsedImage
 */
function saveImageToMessage(img, mes) {
    if (mes && img.image) {
        if (!mes.extra || typeof mes.extra !== 'object') {
            mes.extra = {};
        }
        mes.extra.image = img.image;
        mes.extra.title = img.title;
        mes.extra.inline_image = img.inline;
    }
}

export function getGeneratingApi() {
    return getGeneratingApiCore();
}

function getGeneratingModel(mes) {
    let model = '';
    switch (main_api) {
        case 'kobold':
            model = online_status;
            break;
        case 'novel':
            model = nai_settings.model_novel;
            break;
        case 'openai':
            model = getChatCompletionModel();
            break;
        case 'textgenerationwebui':
            model = online_status;
            break;
        case 'koboldhorde':
            model = kobold_horde_model;
            break;
    }
    return model;
}

/**
 * A function mainly used to switch 'generating' state - setting it to false and activating the buttons again
 */
export function activateSendButtons() {
    return activateSendButtonsCore(setSendButtonState);
}

/**
 * A function mainly used to switch 'generating' state - setting it to true and deactivating the buttons
 */
export function deactivateSendButtons() {
    return deactivateSendButtonsCore();
}

export function resetChatState() {
    const nextState = resetChatStateCore();
    name2 = nextState.name2;
    this_chid = nextState.this_chid;
    chat_metadata = nextState.chat_metadata;
    syncName2(name2);
    syncThisChid(this_chid);
    syncChatMetadata(chat_metadata);
    return nextState;
}

/**
 *
 * @param {'characters' | 'character_edit' | 'create' | 'group_edit' | 'group_create'} value
 */
export function setMenuType(value) {
    menu_type = setMenuTypeCore(value);
    syncMenuType(menu_type);
    return menu_type;
}

export function setExternalAbortController(controller) {
    abortController = setExternalAbortControllerCore(controller);
    return abortController;
}

/**
 * Sets a character array index.
 * @param {number|string|undefined} value
 */
export function setCharacterId(value) {
    this_chid = setCharacterIdCore(value);
    syncThisChid(this_chid);
    return this_chid;
}

export function setCharacterName(value) {
    name2 = setCharacterNameCore(value);
    syncName2(name2);
    return name2;
}

/**
 * Sets the API connection status of the application
 * @param {string|'no_connection'} value Connection status value
 */
export function setOnlineStatus(value) {
    online_status = setOnlineStatusCore(value);
    syncOnlineStatus(online_status);
    return online_status;
}

export function setEditedMessageId(value) {
    this_edit_mes_id = setEditedMessageIdCore(value);
    return this_edit_mes_id;
}

export function setSendButtonState(value) {
    is_send_press = setSendButtonStateCore(value);
    return is_send_press;
}

/**
 * Renames the currently selected character, updating relevant references and optionally renaming past chats.
 *
 * If no name is provided, a popup prompts for a new name. If the new name matches the current name,
 * the renaming process is aborted. The function sends a request to the server to rename the character
 * and handles updates to other related fields such as tags, lore, and author notes.
 *
 * If the renaming is successful, the character list is reloaded and the renamed character is selected.
 * Optionally, past chats can be renamed to reflect the new character name.
 *
 * @param {string?} [name=null] - The new name for the character. If not provided, a popup will prompt for it.
 * @param {object} [options] - Additional options.
 * @param {boolean} [options.silent=false] - If true, suppresses popups and warnings.
 * @param {boolean?} [options.renameChats=null] - If true, renames past chats to reflect the new character name.
 * @returns {Promise<boolean>} - Returns true if the character was successfully renamed, false otherwise.
 */

export async function renameCharacter(name = null, { silent = false, renameChats = null } = {}) {
    return characterCoreRename(name, { silent, renameChats });
}

export function saveChatDebounced() {
    const chid = this_chid;
    const selectedGroup = selected_group;

    cancelDebouncedChatSave();

    chatSaveTimeout = setTimeout(async () => {
        if (selectedGroup !== selected_group) {
            console.warn('Chat save timeout triggered, but group changed. Aborting.');
            return;
        }

        if (chid !== this_chid) {
            console.warn('Chat save timeout triggered, but chid changed. Aborting.');
            return;
        }

        console.debug('Chat save timeout triggered');
        await saveChatConditional();
        console.debug('Chat saved');
    }, DEFAULT_SAVE_EDIT_TIMEOUT);
}

/**
 * Saves the chat to the server.
 * @param {object} [options] - Additional options.
 * @param {string} [options.chatName] The name of the chat file to save to
 * @param {object} [options.withMetadata] Additional metadata to save with the chat
 * @param {number} [options.mesId] The message ID to save the chat up to
 * @param {boolean} [options.force] Force the saving despire the integrity check result
 *
 * @returns {Promise<void>}
 */
export async function saveChat({ chatName, withMetadata, mesId, force = false } = {}) {
    if (arguments.length > 0 && typeof arguments[0] !== 'object') {
        console.trace('saveChat called with positional arguments. Please use an object instead.');
        [chatName, withMetadata, mesId, force] = arguments;
    }

    const metadata = { ...chat_metadata, ...(withMetadata || {}) };
    const fileName = chatName ?? characters[this_chid]?.chat;

    if (!fileName && name2 === neutralCharacterName) {
        // TODO: Do something for a temporary chat with no character.
        return;
    }

    if (!fileName) {
        console.warn('saveChat called without chat_name and no chat file found');
        return;
    }

    characters[this_chid]['date_last_chat'] = Date.now();
    chat.forEach(function (item, i) {
        if (item['is_group']) {
            toastr.error(t`Trying to save group chat with regular saveChat function. Aborting to prevent corruption.`);
            throw new Error('Group chat saved from saveChat');
        }
    });

    const trimmedChat = (mesId !== undefined && mesId >= 0 && mesId < chat.length)
        ? chat.slice(0, Number(mesId) + 1)
        : chat.slice();

    const chatToSave = [
        {
            user_name: name1,
            character_name: name2,
            create_date: chat_create_date,
            chat_metadata: metadata,
        },
        ...trimmedChat,
    ];

    try {
        const result = await fetch('/api/chats/save', {
            method: 'POST',
            cache: 'no-cache',
            headers: getRequestHeaders(),
            body: JSON.stringify({
                ch_name: characters[this_chid].name,
                file_name: fileName,
                chat: chatToSave,
                avatar_url: characters[this_chid].avatar,
                force: force,
            }),
        });

        if (result.ok) {
            return;
        }

        const errorData = await result.json();
        const isIntegrityError = errorData?.error === 'integrity' && !force;
        if (!isIntegrityError) {
            throw new Error(result.statusText);
        }

        const popupResult = await Popup.show.input(
            t`ERROR: Chat integrity check failed while saving the file.`,
            t`<p>After you click OK, the page will be reloaded to prevent data corruption.</p>
              <p>To confirm an overwrite (and potentially <b>LOSE YOUR DATA</b>), enter <code>OVERWRITE</code> (in all caps) in the box below before clicking OK.</p>`,
            '',
            { okButton: 'OK', cancelButton: false },
        );

        const forceSaveConfirmed = popupResult === 'OVERWRITE';

        if (!forceSaveConfirmed) {
            console.warn('Chat integrity check failed, and user did not confirm the overwrite. Reloading the page.');
            window.location.reload();
            return;
        }

        await saveChat({ chatName, withMetadata, mesId, force: true });
    } catch (error) {
        console.error(error);
        toastr.error(t`Check the server connection and reload the page to prevent data loss.`, t`Chat could not be saved`);
    }
}

/**
 * Processes the avatar image from the input element, allowing the user to crop it if necessary.
 * @param {HTMLInputElement} input - The input element containing the avatar file.
 * @returns {Promise<void>}
 */
async function read_avatar_load(input) {
    if (input.files && input.files[0]) {
        if (selected_button == 'create') {
            create_save.avatar = input.files;
        }

        crop_data = undefined;
        syncCropData(crop_data);
        const file = input.files[0];
        const fileData = await getBase64Async(file);

        if (!power_user.never_resize_avatars) {
            const dlg = new Popup('Set the crop position of the avatar image', POPUP_TYPE.CROP, '', { cropImage: fileData });
            const croppedImage = await dlg.show();

            if (!croppedImage) {
                return;
            }

            crop_data = dlg.cropData;
            syncCropData(crop_data);
            $('#avatar_load_preview').attr('src', String(croppedImage));
        } else {
            $('#avatar_load_preview').attr('src', fileData);
        }

        if (menu_type == 'create') {
            return;
        }

        await createOrEditCharacter();
        await delay(DEFAULT_SAVE_EDIT_TIMEOUT);

        const formData = new FormData(/** @type {HTMLFormElement} */($('#form_create').get(0)));
        await fetch(getThumbnailUrl('avatar', formData.get('avatar_url').toString()), {
            method: 'GET',
            cache: 'reload',
        });

        const messages = $('.mes').toArray();
        for (const el of messages) {
            const $el = $(el);
            const nameMatch = $el.attr('ch_name') == formData.get('ch_name');
            if ($el.attr('is_system') == 'true' && !nameMatch) continue;
            if ($el.attr('is_user') == 'true') continue;

            if (nameMatch) {
                const previewSrc = $('#avatar_load_preview').attr('src');
                const avatar = $el.find('.avatar img');
                avatar.attr('src', default_avatar);
                await delay(1);
                avatar.attr('src', previewSrc);
            }
        }

        console.log('Avatar refreshed');
    }
}

/**
 * Gets the URL for a thumbnail of a specific type and file.
 * @param {import('../src/endpoints/thumbnails.js').ThumbnailType} type The type of the thumbnail to get
 * @param {string} file The file name or path for which to get the thumbnail URL
 * @param {boolean} [t=false] Whether to add a cache-busting timestamp to the URL
 * @returns {string} The URL for the thumbnail
 */
export function getThumbnailUrl(type, file, t = false) {
    return getThumbnailUrlCore(type, file, t);
}

export function buildAvatarList(block, entities, { templateId = 'inline_avatar_template', empty = true, interactable = false, highlightFavs = true } = {}) {
    if (empty) {
        block.empty();
    }

    for (const entity of entities) {
        const id = entity.id;

        // Populate the template
        const avatarTemplate = $(`#${templateId} .avatar`).clone();

        let this_avatar = default_avatar;
        if (entity.item.avatar !== undefined && entity.item.avatar != 'none') {
            this_avatar = getThumbnailUrl('avatar', entity.item.avatar);
        }

        avatarTemplate.attr('data-type', entity.type);
        avatarTemplate.attr('data-chid', id);
        avatarTemplate.find('img').attr('src', this_avatar).attr('alt', entity.item.name);
        avatarTemplate.attr('title', `[Character] ${entity.item.name}\nFile: ${entity.item.avatar}`);
        if (highlightFavs) {
            avatarTemplate.toggleClass('is_fav', entity.item.fav || entity.item.fav == 'true');
            avatarTemplate.find('.ch_fav').val(entity.item.fav);
        }

        // If this is a group, we need to hack slightly. We still want to keep most of the css classes and layout, but use a group avatar instead.
        if (entity.type === 'group') {
            const grpTemplate = getGroupAvatar(entity.item);

            avatarTemplate.addClass(grpTemplate.attr('class'));
            avatarTemplate.empty();
            avatarTemplate.append(grpTemplate.children());
            avatarTemplate.attr({ 'data-grid': id, 'data-chid': null });
            avatarTemplate.attr('title', `[Group] ${entity.item.name}`);
        }
        else if (entity.type === 'persona') {
            avatarTemplate.attr({ 'data-pid': id, 'data-chid': null });
            avatarTemplate.find('img').attr('src', getThumbnailUrl('persona', entity.item.avatar));
            avatarTemplate.attr('title', `[Persona] ${entity.item.name}\nFile: ${entity.item.avatar}`);
        }

        if (interactable) {
            avatarTemplate.addClass(INTERACTABLE_CONTROL_CLASS);
            avatarTemplate.toggleClass('character_select', entity.type === 'character');
            avatarTemplate.toggleClass('group_select', entity.type === 'group');
        }

        block.append(avatarTemplate);
    }
}

/**
 * Loads all the data of a shallow character.
 * @param {string|undefined} characterId Array index
 * @returns {Promise<void>} Promise that resolves when the character is unshallowed
 */
export async function unshallowCharacter(characterId) {
    if (characterId === undefined) {
        console.debug('Undefined character cannot be unshallowed');
        return;
    }

    /** @type {import('./scripts/char-data.js').v1CharData} */
    const character = characters[characterId];
    if (!character) {
        console.debug('Character not found:', characterId);
        return;
    }

    // Character is not shallow
    if (!character.shallow) {
        return;
    }

    const avatar = character.avatar;
    if (!avatar) {
        console.debug('Character has no avatar field:', characterId);
        return;
    }

    await getOneCharacter(avatar);
}

export async function getChat() {
    const result = await getChatCore();
    if (result?.characterName !== undefined) {
        name2 = result.characterName;
        syncName2(name2);
    }
    if (result?.chatCreateDate !== undefined) {
        chat_create_date = result.chatCreateDate;
    }
    if (result?.chatMetadata !== undefined) {
        chat_metadata = result.chatMetadata;
        syncChatMetadata(chat_metadata);
    }
}

async function getChatResult() {
    const result = await getChatResultCore();
    name2 = result?.characterName ?? characters[this_chid].name;
    syncName2(name2);
}

export async function openCharacterChat(file_name) {
    const result = await openCharacterChatCore(file_name);
    if (result?.characterName !== undefined) {
        name2 = result.characterName;
        syncName2(name2);
    }
    if (result?.chatCreateDate !== undefined) {
        chat_create_date = result.chatCreateDate;
    }
    if (result?.chatMetadata !== undefined) {
        chat_metadata = result.chatMetadata;
        syncChatMetadata(chat_metadata);
    }
}

////////// OPTIMZED MAIN API CHANGE FUNCTION ////////////

export function changeMainAPI() {
    const selectedVal = $('#main_api').val();
    //console.log(selectedVal);
    const apiElements = {
        'koboldhorde': {
            apiStreaming: $('#NULL_SELECTOR'),
            apiSettings: $('#kobold_api-settings'),
            apiConnector: $('#kobold_horde'),
            apiPresets: $('#kobold_api-presets'),
            apiRanges: $('#range_block'),
            maxContextElem: $('#max_context_block'),
            amountGenElem: $('#amount_gen_block'),
        },
        'kobold': {
            apiStreaming: $('#streaming_kobold_block'),
            apiSettings: $('#kobold_api-settings'),
            apiConnector: $('#kobold_api'),
            apiPresets: $('#kobold_api-presets'),
            apiRanges: $('#range_block'),
            maxContextElem: $('#max_context_block'),
            amountGenElem: $('#amount_gen_block'),
        },
        'textgenerationwebui': {
            apiStreaming: $('#streaming_textgenerationwebui_block'),
            apiSettings: $('#textgenerationwebui_api-settings'),
            apiConnector: $('#textgenerationwebui_api'),
            apiPresets: $('#textgenerationwebui_api-presets'),
            apiRanges: $('#range_block_textgenerationwebui'),
            maxContextElem: $('#max_context_block'),
            amountGenElem: $('#amount_gen_block'),
        },
        'novel': {
            apiStreaming: $('#streaming_novel_block'),
            apiSettings: $('#novel_api-settings'),
            apiConnector: $('#novel_api'),
            apiPresets: $('#novel_api-presets'),
            apiRanges: $('#range_block_novel'),
            maxContextElem: $('#max_context_block'),
            amountGenElem: $('#amount_gen_block'),
        },
        'openai': {
            apiStreaming: $('#NULL_SELECTOR'),
            apiSettings: $('#openai_settings'),
            apiConnector: $('#openai_api'),
            apiPresets: $('#openai_api-presets'),
            apiRanges: $('#range_block_openai'),
            maxContextElem: $('#max_context_block'),
            amountGenElem: $('#amount_gen_block'),
        },
    };
    //console.log('--- apiElements--- ');
    //console.log(apiElements);

    //first, disable everything so the old elements stop showing
    for (const apiName in apiElements) {
        const apiObj = apiElements[apiName];
        //do not hide items to then proceed to immediately show them.
        if (selectedVal === apiName) {
            continue;
        }
        apiObj.apiSettings.css('display', 'none');
        apiObj.apiConnector.css('display', 'none');
        apiObj.apiRanges.css('display', 'none');
        apiObj.apiPresets.css('display', 'none');
        apiObj.apiStreaming.css('display', 'none');
    }

    //then, find and enable the active item.
    //This is split out of the loop so that different apis can share settings divs
    let activeItem = apiElements[selectedVal];

    activeItem.apiStreaming.css('display', 'block');
    activeItem.apiSettings.css('display', 'block');
    activeItem.apiConnector.css('display', 'block');
    activeItem.apiRanges.css('display', 'block');
    activeItem.apiPresets.css('display', 'block');

    if (selectedVal === 'openai') {
        activeItem.apiPresets.css('display', 'flex');
    }

    if (selectedVal === 'textgenerationwebui' || selectedVal === 'novel') {
        console.debug('enabling amount_gen for ooba/novel');
        activeItem.amountGenElem.find('input').prop('disabled', false);
        activeItem.amountGenElem.css('opacity', 1.0);
    }

    //custom because streaming has been moved up under response tokens, which exists inside common settings block
    if (selectedVal === 'novel') {
        $('#ai_module_block_novel').css('display', 'block');
    } else {
        $('#ai_module_block_novel').css('display', 'none');
    }

    $('#prompt_cost_block').toggle(selectedVal === 'textgenerationwebui');

    // Hide common settings for OpenAI
    console.debug('value?', selectedVal);
    if (selectedVal == 'openai') {
        console.debug('hiding settings?');
        $('#common-gen-settings-block').css('display', 'none');
    } else {
        $('#common-gen-settings-block').css('display', 'block');
    }

    main_api = selectedVal;
    syncMainApi(main_api);
    setOnlineStatus('no_connection');

    if (main_api == 'koboldhorde') {
        getStatusHorde();
        getHordeModels(true);
    }
    validateDisabledSamplers();
    setupChatCompletionPromptManager(oai_settings);
    forceCharacterEditorTokenize();
}

export function setUserName(value, { toastPersonaNameChange = true } = {}) {
    name1 = value;
    if (name1 === undefined || name1 == '')
        name1 = default_user_name;
    syncName1(name1);
    console.log(`User name changed to ${name1}`);
    $('#your_name').text(name1);
    if (toastPersonaNameChange && power_user.persona_show_notifications && !isPersonaPanelOpen()) {
        toastr.success(t`Your messages will now be sent as ${name1}`, t`Persona Changed`);
    }
    saveSettingsDebounced();
}

async function doOnboarding(avatarId) {
    const template = $('#onboarding_template .onboarding');
    let userName = await callGenericPopup(template, POPUP_TYPE.INPUT, currentUser?.name || name1, { rows: 2, wider: true, cancelButton: false });

    if (userName) {
        userName = String(userName).replace('\n', ' ');
        setUserName(userName);
        console.log(`Binding persona ${avatarId} to name ${userName}`);
        power_user.personas[avatarId] = userName;
        power_user.persona_descriptions[avatarId] = {
            description: '',
            position: persona_description_positions.IN_PROMPT,
        };
    }
}

function reloadLoop() {
    const MAX_RELOADS = 5;
    let reloads = Number(sessionStorage.getItem('reloads') || 0);
    if (reloads < MAX_RELOADS) {
        reloads++;
        sessionStorage.setItem('reloads', String(reloads));
        window.location.reload();
    }
}

//MARK: getSettings()
///////////////////////////////////////////
export async function getSettings() {
    const response = await fetch('/api/settings/get', {
        method: 'POST',
        headers: getRequestHeaders(),
        body: JSON.stringify({}),
        cache: 'no-cache',
    });

    if (!response.ok) {
        reloadLoop();
        toastr.error(t`Settings could not be loaded after multiple attempts. Please try again later.`);
        throw new Error('Error getting settings');
    }

    const data = await response.json();
    if (data.result != 'file not find' && data.settings) {
        settings = JSON.parse(data.settings);
        if (settings.username !== undefined && settings.username !== '') {
            name1 = settings.username;
            syncName1(name1);
            $('#your_name').text(name1);
        }

        accountStorage.init(settings?.accountStorage);
        await setUserControls(data.enable_accounts);

        // Allow subscribers to mutate settings
        await eventSource.emit(event_types.SETTINGS_LOADED_BEFORE, settings);

        //Load AI model config settings
        amount_gen = settings.amount_gen;
        syncAmountGen(amount_gen);
        if (settings.max_context !== undefined)
            max_context = parseInt(settings.max_context);
        syncMaxContext(max_context);

        swipes = settings.swipes !== undefined ? !!settings.swipes : true;  // enable swipes by default
        $('#swipes-checkbox').prop('checked', swipes); /// swipecode
        hideSwipeButtons();
        showSwipeButtons();

        // Kobold
        loadKoboldSettings(data, settings.kai_settings ?? settings, settings);

        // Novel
        loadNovelSettings(data, settings.nai_settings ?? settings);

        // TextGen
        loadTextGenSettings(data, settings);

        // OpenAI
        loadOpenAISettings(data, settings.oai_settings ?? settings);

        // Horde
        loadHordeSettings(settings);

        // Load power user settings
        await loadPowerUserSettings(settings, data);

        // Apply theme toggles from power user settings
        applyPowerUserSettings();

        // Load character tags
        loadTagsSettings(settings);

        // Load background
        loadBackgroundSettings(settings);

        // Load proxy presets
        loadProxyPresets(settings);

        // Allow subscribers to mutate settings
        await eventSource.emit(event_types.SETTINGS_LOADED_AFTER, settings);

        // Set context size after loading power user (may override the max value)
        $('#max_context').val(max_context);
        $('#max_context_counter').val(max_context);

        $('#amount_gen').val(amount_gen);
        $('#amount_gen_counter').val(amount_gen);

        //Load which API we are using
        if (settings.main_api == undefined) {
            settings.main_api = 'kobold';
        }

        if (settings.main_api == 'poe') {
            settings.main_api = 'openai';
        }

        main_api = settings.main_api;
        syncMainApi(main_api);
        $('#main_api').val(main_api);
        $(`#main_api option[value=${main_api}]`).attr('selected', 'true');
        changeMainAPI();

        //Load User's Name and Avatar
        initUserAvatar(settings.user_avatar);
        setPersonaDescription();

        //Load the active character and group
        active_character = settings.active_character;
        active_group = settings.active_group;
        syncActiveCharacter(active_character);
        syncActiveGroup(active_group);

        setWorldInfoSettings(settings.world_info_settings ?? settings, data);

        selected_button = settings.selected_button;

        if (data.enable_extensions) {
            const enableAutoUpdate = Boolean(data.enable_extensions_auto_update);
            const isVersionChanged = settings.currentVersion !== currentVersion;
            await loadExtensionSettings(settings, isVersionChanged, enableAutoUpdate);
            await eventSource.emit(event_types.EXTENSION_SETTINGS_LOADED);
        }

        firstRun = !!settings.firstRun;

        if (firstRun) {
            hideLoader();
            await doOnboarding(user_avatar);
            firstRun = false;
        }
    }
    await validateDisabledSamplers();
    settingsReady = true;
    await eventSource.emit(event_types.SETTINGS_LOADED);
}

//MARK: saveSettings()
export async function saveSettings(loopCounter = 0) {
    if (!settingsReady) {
        console.warn('Settings not ready, scheduling another save');
        saveSettingsDebounced();
        return;
    }

    const MAX_RETRIES = 3;
    if (TempResponseLength.isCustomized()) {
        if (loopCounter < MAX_RETRIES) {
            console.warn('Response length is currently being overridden, scheduling another save');
            saveSettingsDebounced(++loopCounter);
            return;
        }
        console.error('Response length is currently being overridden, but the save loop has reached the maximum number of retries');
        TempResponseLength.restore(null);
    }

    const payload = {
        firstRun: firstRun,
        accountStorage: accountStorage.getState(),
        currentVersion: currentVersion,
        username: name1,
        active_character: active_character,
        active_group: active_group,
        user_avatar: user_avatar,
        amount_gen: amount_gen,
        max_context: max_context,
        main_api: main_api,
        world_info_settings: getWorldInfoSettings(),
        textgenerationwebui_settings: textgen_settings,
        swipes: swipes,
        horde_settings: horde_settings,
        power_user: power_user,
        extension_settings: extension_settings,
        tags: tags,
        tag_map: tag_map,
        nai_settings: nai_settings,
        kai_settings: kai_settings,
        oai_settings: oai_settings,
        background: background_settings,
        proxies: proxies,
        selected_proxy: selected_proxy,
    };

    try {
        const result = await fetch('/api/settings/save', {
            method: 'POST',
            headers: getRequestHeaders(),
            body: JSON.stringify(payload),
            cache: 'no-cache',
        });

        if (!result.ok) {
            throw new Error(`Failed to save settings: ${result.statusText}`);
        }

        settings = payload;
        await eventSource.emit(event_types.SETTINGS_UPDATED);
    } catch (error) {
        console.error('Error saving settings:', error);
        toastr.error(t`Check the server connection and reload the page to prevent data loss.`, t`Settings could not be saved`);
    }
}

/**
 * Sets the generation parameters from a preset object.
 * @param {{ genamt?: number, max_length?: number }} preset Preset object
 */
export function setGenerationParamsFromPreset(preset) {
    const needsUnlock = (preset.max_length ?? max_context) > MAX_CONTEXT_DEFAULT || (preset.genamt ?? amount_gen) > MAX_RESPONSE_DEFAULT;
    $('#max_context_unlocked').prop('checked', needsUnlock).trigger('change');

    if (preset.genamt !== undefined) {
        amount_gen = preset.genamt;
        syncAmountGen(amount_gen);
        $('#amount_gen').val(amount_gen);
        $('#amount_gen_counter').val(amount_gen);
    }

    if (preset.max_length !== undefined) {
        max_context = preset.max_length;
        syncMaxContext(max_context);
        $('#max_context').val(max_context);
        $('#max_context_counter').val(max_context);
    }
}

function openMessageDelete(fromSlashCommand) {
    return openMessageDeleteCore(fromSlashCommand);
}

function messageEditAuto(div) {
    return messageEditAutoCore(div, undefined, this_edit_mes_id);
}

async function messageEditDone(div) {
    await messageEditDoneCore(div, undefined, this_edit_mes_id);
    this_edit_mes_id = editedMessageIdCore;
}

/**
 * Fetches the chat content for each chat file from the server and compiles them into a dictionary.
 * The function iterates over a provided list of chat metadata and requests the actual chat content
 * for each chat, either as an individual chat or a group chat based on the context.
 *
 * @param {Array} data - An array containing metadata about each chat such as file_name.
 * @param {boolean} isGroupChat - A flag indicating if the chat is a group chat.
 * @returns {Promise<Object>} chat_dict - A dictionary where each key is a file_name and the value is the
 * corresponding chat content fetched from the server.
 */
export async function getChatsFromFiles(data, isGroupChat) {
    const context = getContext();
    let chat_dict = {};
    let chat_list = Object.values(data).sort((a, b) => a['file_name'].localeCompare(b['file_name'])).reverse();

    let chat_promise = chat_list.map(({ file_name }) => {
        return new Promise(async (res, rej) => {
            try {
                const endpoint = isGroupChat ? '/api/chats/group/get' : '/api/chats/get';
                const requestBody = isGroupChat
                    ? JSON.stringify({ id: file_name })
                    : JSON.stringify({
                        ch_name: characters[context.characterId].name,
                        file_name: file_name.replace('.jsonl', ''),
                        avatar_url: characters[context.characterId].avatar,
                    });

                const chatResponse = await fetch(endpoint, {
                    method: 'POST',
                    headers: getRequestHeaders(),
                    body: requestBody,
                    cache: 'no-cache',
                });

                if (!chatResponse.ok) {
                    return res();
                    // continue;
                }

                const currentChat = await chatResponse.json();
                if (!isGroupChat) {
                    // remove the first message, which is metadata, only for individual chats
                    currentChat.shift();
                }
                chat_dict[file_name] = currentChat;

            } catch (error) {
                console.error(error);
            }

            return res();
        });
    });

    await Promise.all(chat_promise);

    return chat_dict;
}

/**
 * Fetches the metadata of all past chats related to a specific character based on its avatar URL.
 * The function sends a POST request to the server to retrieve all chats for the character. It then
 * processes the received data, sorts it by the file name, and returns the sorted data.
 *
 * @param {null|number} [characterId=null] - When set, the function will use this character id instead of this_chid.
 *
 * @returns {Promise<Array>} - An array containing metadata of all past chats of the character, sorted
 * in descending order by file name. Returns an empty array if the fetch request is unsuccessful or the
 * response is an object with an `error` property set to `true`.
 */
export async function getPastCharacterChats(characterId = null) {
    return getPastCharacterChatsCore(characterId);
}

/**
 * Helper for `displayPastChats`, to make the same info consistently available for other functions
 */
export function getCurrentChatDetails() {
    return getCurrentChatDetailsCore();
}

/**
 * Displays the past chats for a character or a group based on the selected context.
 * The function first fetches the chats, processes them, and then displays them in
 * the HTML. It also has a built-in search functionality that allows filtering the
 * displayed chats based on a search query.
 */
export async function displayPastChats() {
    return displayPastChatsCore();
}

export function selectRightMenuWithAnimation(selectedMenuId) {
    return selectRightMenuWithAnimationCore(selectedMenuId);
}

export function select_rm_info(type, charId, previousCharId = null) {
    return selectRmInfoCore(type, charId, previousCharId);
}

/**
 * Selects the right menu for displaying the character editor.
 * @param {number|string} chid Character array index
 * @param {object} [param1] Options for the switch
 * @param {boolean} [param1.switchMenu=true] Whether to switch the menu
 */
export function select_selected_character(chid, { switchMenu = true } = {}) {
    return selectSelectedCharacterCore(chid, { switchMenu });
}

/**
 * Selects the right menu for creating a new character.
 * @param {object} [options] Options for the switch
 * @param {boolean} [options.switchMenu=true] Whether to switch the menu
 */
function select_rm_create({ switchMenu = true } = {}) {
    return selectRmCreateCore({ switchMenu });
}

function select_rm_characters() {
    return selectRmCharactersCore();
}

/**
 * Sets a prompt injection to insert custom text into any outgoing prompt. For use in UI extensions.
 * @param {string} key Prompt injection id.
 * @param {string} value Prompt injection value.
 * @param {number} position Insertion position. 0 is after story string, 1 is in-chat with custom depth.
 * @param {number} depth Insertion depth. 0 represets the last message in context. Expected values up to MAX_INJECTION_DEPTH.
 * @param {number} role Extension prompt role. Defaults to SYSTEM.
 * @param {boolean} scan Should the prompt be included in the world info scan.
 * @param {(function(): Promise<boolean>|boolean)} filter Filter function to determine if the prompt should be injected.
 */
export function setExtensionPrompt(key, value, position, depth, scan = false, role = extension_prompt_roles.SYSTEM, filter = null) {
    extension_prompts[key] = {
        value: String(value),
        position: Number(position),
        depth: Number(depth),
        scan: !!scan,
        role: Number(role ?? extension_prompt_roles.SYSTEM),
        filter: filter,
    };
}

/**
 * Gets a enum value of the extension prompt role by its name.
 * @param {string} roleName The name of the extension prompt role.
 * @returns {number} The role id of the extension prompt.
 */
export function getExtensionPromptRoleByName(roleName) {
    // If the role is already a valid number, return it
    if (typeof roleName === 'number' && Object.values(extension_prompt_roles).includes(roleName)) {
        return roleName;
    }

    switch (roleName) {
        case 'system':
            return extension_prompt_roles.SYSTEM;
        case 'user':
            return extension_prompt_roles.USER;
        case 'assistant':
            return extension_prompt_roles.ASSISTANT;
    }

    // Skill issue?
    return extension_prompt_roles.SYSTEM;
}

/**
 * Removes all char A/N prompt injections from the chat.
 * To clean up when switching from groups to solo and vice versa.
 */
export function removeDepthPrompts() {
    for (const key of Object.keys(extension_prompts)) {
        if (key.startsWith(inject_ids.DEPTH_PROMPT)) {
            delete extension_prompts[key];
        }
    }
}

/**
 * Adds or updates the metadata for the currently active chat.
 * @param {Object} newValues An object with collection of new values to be added into the metadata.
 * @param {boolean} reset Should a metadata be reset by this call.
 */
export function updateChatMetadata(newValues, reset) {
    chat_metadata = updateChatMetadataCore(newValues, reset);
    syncChatMetadata(chat_metadata);
    return chat_metadata;
}

export async function setScenarioOverride() {
    if (!selected_group && (this_chid === undefined || !characters[this_chid])) {
        console.warn('setScenarioOverride() -- no selected group or character');
        return;
    }

    const metadataValue = chat_metadata['scenario'] || '';
    const isGroup = !!selected_group;

    const $template = $(await renderTemplateAsync('scenarioOverride'));
    $template.find('[data-group="true"]').toggle(isGroup);
    $template.find('[data-character="true"]').toggle(!isGroup);
    // TODO: Why does this save on every character input? Save on popup close
    $template.find('.chat_scenario').val(metadataValue).on('input', onScenarioOverrideInput);
    $template.find('.remove_scenario_override').on('click', onScenarioOverrideRemoveClick);

    await callGenericPopup($template, POPUP_TYPE.TEXT, '');
}

function onScenarioOverrideInput() {
    const value = String($(this).val());
    chat_metadata['scenario'] = value;
    saveMetadataDebounced();
}

function onScenarioOverrideRemoveClick() {
    $(this).closest('.scenario_override').find('.chat_scenario').val('').trigger('input');
}

/**
 * Displays a blocking popup with a given text and type.
 * @param {JQuery<HTMLElement>|string|Element} text - Text to display in the popup.
 * @param {string} type
 * @param {string} inputValue - Value to set the input to.
 * @param {PopupOptions} options - Options for the popup.
 * @typedef {{okButton?: string, rows?: number, wide?: boolean, wider?: boolean, large?: boolean, allowHorizontalScrolling?: boolean, allowVerticalScrolling?: boolean, cropAspect?: number }} PopupOptions - Options for the popup.
 * @returns {Promise<any>} A promise that resolves when the popup is closed.
 * @deprecated Use `callGenericPopup` instead.
 */
export function callPopup(text, type, inputValue = '', { okButton, rows, wide, wider, large, allowHorizontalScrolling, allowVerticalScrolling, cropAspect } = {}) {
    function getOkButtonText() {
        if (['text', 'char_not_selected'].includes(popup_type)) {
            $dialoguePopupCancel.css('display', 'none');
            return okButton ?? t`Ok`;
        } else if (['delete_extension'].includes(popup_type)) {
            return okButton ?? t`Ok`;
        } else if (['new_chat', 'confirm'].includes(popup_type)) {
            return okButton ?? t`Yes`;
        } else if (['input'].includes(popup_type)) {
            return okButton ?? t`Save`;
        }
        return okButton ?? t`Delete`;
    }

    dialogueCloseStop = true;
    if (type) {
        popup_type = type;
    }

    const $dialoguePopup = $('#dialogue_popup');
    const $dialoguePopupCancel = $('#dialogue_popup_cancel');
    const $dialoguePopupOk = $('#dialogue_popup_ok');
    const $dialoguePopupInput = $('#dialogue_popup_input');
    const $dialoguePopupText = $('#dialogue_popup_text');
    const $shadowPopup = $('#shadow_popup');

    $dialoguePopup.toggleClass('wide_dialogue_popup', !!wide)
        .toggleClass('wider_dialogue_popup', !!wider)
        .toggleClass('large_dialogue_popup', !!large)
        .toggleClass('horizontal_scrolling_dialogue_popup', !!allowHorizontalScrolling)
        .toggleClass('vertical_scrolling_dialogue_popup', !!allowVerticalScrolling);

    $dialoguePopupCancel.css('display', 'inline-block');
    $dialoguePopupOk.text(getOkButtonText());
    $dialoguePopupInput.toggle(popup_type === 'input').val(inputValue).attr('rows', rows ?? 1);
    $dialoguePopupText.empty().append(text);
    $shadowPopup.css('display', 'block');

    if (popup_type == 'input') {
        $dialoguePopupInput.trigger('focus');
    }

    $shadowPopup.transition({
        opacity: 1,
        duration: animation_duration,
        easing: animation_easing,
    });

    return new Promise((resolve) => {
        dialogueResolve = resolve;
    });
}

export function showSwipeButtons() {
    return showSwipeButtonsCore();
}

export function hideSwipeButtons() {
    return hideSwipeButtonsCore();
}

/**
 * Deletes a swipe from the chat.
 *
 * @param {number?} swipeId - The ID of the swipe to delete. If not provided, the current swipe will be deleted.
 * @returns {Promise<number>|undefined} - The ID of the new swipe after deletion.
 */
export async function deleteSwipe(swipeId = null) {
    return deleteSwipeCore(swipeId);
}

export async function saveMetadata() {
    if (selected_group) {
        await editGroup(selected_group, true, false);
    }
    else {
        await saveChatConditional();
    }
}

export async function saveChatConditional() {
    return saveChatConditionalCore();
}

/**
 * Saves the chat to the server.
 * @param {FormData} formData Form data to send to the server.
 * @param {EventTarget} eventTarget Event target to trigger the event on.
 */
async function importCharacterChat(formData, eventTarget) {
    return importCharacterChatCore(formData, eventTarget);
}

function updateViewMessageIds(startFromZero = false) {
    return updateViewMessageIdsCore(startFromZero);
}

export function getFirstDisplayedMessageId() {
    return getFirstDisplayedMessageIdCore();
}

function updateEditArrowClasses() {
    return updateEditArrowClassesCore();
}

/**
 * Closes the message editor.
 * @param {'message'|'reasoning'|'all'} what What to close. Default is 'all'.
 */
export function closeMessageEditor(what = 'all') {
    return closeMessageEditorCore(what);
}

export function setGenerationProgress(progress) {
    if (!progress) {
        $('#send_textarea').css({ 'background': '', 'transition': '' });
    }
    else {
        $('#send_textarea').css({
            'background': `linear-gradient(90deg, #008000d6 ${progress}%, transparent ${progress}%)`,
            'transition': '0.25s ease-in-out',
        });
    }
}

export function cancelTtsPlay() {
    if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
    }
}

async function openCharacterWorldPopup() {
    return openCharacterWorldPopupCore();
}

function openAlternateGreetings() {
    return openAlternateGreetingsCore();
}

/**
 * Creates or edits a character based on the form data.
 * @param {Event} [e] Event that triggered the function call.
 */
async function createOrEditCharacter(e) {
    return createOrEditCharacterCore(e);
}

/**
 * Formats a counter for a swipe view.
 * @param {number} current The current number of items.
 * @param {number} total The total number of items.
 * @returns {string} The formatted counter.
 */
function formatSwipeCounter(current, total) {
    return formatSwipeCounterCore(current, total);
}

/**
 * Handles the swipe to the left event.
 * @param {JQuery.Event} _event Event.
 * @param {object} params Additional parameters.
 * @param {string} [params.source] The source of the swipe event.
 * @param {boolean} [params.repeated] Is the swipe event repeated.
 */
export function swipe_left(_event, { source, repeated } = {}) {
    return swipeLeftCore(_event, { source, repeated });
}

/**
 * Handles the swipe to the right event.
 * @param {JQuery.Event} [_event] Event.
 * @param {object} params Additional parameters.
 * @param {string} [params.source] The source of the swipe event.
 * @param {boolean} [params.repeated] Is the swipe event repeated.
 */
//MARK: swipe_right
export function swipe_right(_event = null, { source, repeated } = {}) {
    return swipeRightCore(_event, { source, repeated });
}

/**
 * Imports supported files dropped into the app window.
 * @param {File[]} files Array of files to process
 * @param {Map<File, string>} [data] Extra data to pass to the import function
 * @returns {Promise<void>}
 */
export async function processDroppedFiles(files, data = new Map()) {
    return processDroppedFilesCore(files, data);
}

/**
 * Imports tags for the given characters
 * @param {string[]} avatarFileNames character avatar filenames whose tags are to import
 */
async function importCharactersTags(avatarFileNames) {
    return importCharactersTagsCore(avatarFileNames);
}

/**
 * Selects the given imported char
 * @param {string} charId char to select
 */
function selectImportedChar(charId) {
    return selectImportedCharCore(charId);
}

/**
 * Imports a character from a file.
 * @param {File} file File to import
 * @param {object} [options] - Options
 * @param {string} [options.preserveFileName] Whether to preserve original file name
 * @param {Boolean} [options.importTags=false] Whether to import tags
 * @returns {Promise<string>}
 */
async function importCharacter(file, { preserveFileName = '', importTags = false } = {}) {
    return importCharacterCore(file, { preserveFileName, importTags });
}

async function importFromURL(items, files) {
    return importFromURLCore(items, files);
}

export async function doNewChat({ deleteCurrentChat = false } = {}) {
    chat_file_for_del = getCurrentChatDetails()?.sessionName;
    return doNewChatCore({ deleteCurrentChat });
}

/**
 * Renames a group or character chat.
 * @param {object} param Parameters for renaming chat
 * @param {string} [param.characterId] Character ID to rename chat for
 * @param {string} [param.groupId] Group ID to rename chat for
 * @param {string} param.oldFileName Old name of the chat (no JSONL extension)
 * @param {string} param.newFileName New name for the chat (no JSONL extension)
 * @param {boolean} [param.loader=true] Whether to show loader during the operation
 */
export async function renameGroupOrCharacterChat({ characterId, groupId, oldFileName, newFileName, loader }) {
    return renameGroupOrCharacterChatCore({ characterId, groupId, oldFileName, newFileName, loader });
}

/**
 * Renames the currently selected chat.
 * @param {string} oldFileName Old name of the chat (no JSONL extension)
 * @param {string} newName New name for the chat (no JSONL extension)
 */
export async function renameChat(oldFileName, newName) {
    return await renameGroupOrCharacterChat({
        characterId: this_chid,
        groupId: selected_group,
        oldFileName: oldFileName,
        newFileName: newName,
        loader: true,
    });
}

/**
 * Forces the update of the chat name for a remote character.
 * @param {string|number} characterId Character ID to update chat name for
 * @param {string} newName New name for the chat
 * @returns {Promise<void>}
 */
export async function updateRemoteChatName(characterId, newName) {
    return updateRemoteChatNameCore(characterId, newName);
}


function doCharListDisplaySwitch() {
    return doCharListDisplaySwitchCore();
}

/**
 * Function to handle the deletion of a character, given a specific popup type and character ID.
 * If popup type equals "del_ch", it will proceed with deletion otherwise it will exit the function.
 * It fetches the delete character route, sending necessary parameters, and in case of success,
 * it proceeds to delete character from UI and saves settings.
 * In case of error during the fetch request, it logs the error details.
 *
 * @param {string} this_chid - The character ID to be deleted.
 * @param {boolean} delete_chats - Whether to delete chats or not.
 */
export async function handleDeleteCharacter(this_chid, delete_chats) {
    if (!characters[this_chid]) {
        return;
    }

    await deleteCharacter(characters[this_chid].avatar, { deleteChats: delete_chats });
}

/**
 * Deletes a character completely, including associated chats if specified
 *
 * @param {string|string[]} characterKey - The key (avatar) of the character to be deleted
 * @param {Object} [options] - Optional parameters for the deletion
 * @param {boolean} [options.deleteChats=true] - Whether to delete associated chats or not
 * @return {Promise<void>} - A promise that resolves when the character is successfully deleted
 */
export async function deleteCharacter(characterKey, { deleteChats = true } = {}) {
    return deleteCharacterCore(characterKey, { deleteChats });
}

/**
 * Creates a new assistant chat.
 * @param {object} params - Parameters for the new assistant chat
 * @param {boolean} [params.temporary=false] I need a temporary secretary
 * @returns {Promise<void>} - A promise that resolves when the new assistant chat is created
 */
export async function newAssistantChat({ temporary = false } = {}) {
    return newAssistantChatCore({ temporary });
}

/**
 * Event handler to open a navbar drawer when a drawer open button is clicked.
 * Handles click events on .drawer-opener elements.
 * Opens the drawer associated with the clicked button according to the data-target attribute.
 * @returns {void}
 */
function doDrawerOpenClick() {
    return doDrawerOpenClickCore.call(this);
}

/**
 * Event handler to open or close a navbar drawer when a navbar icon is clicked.
 * Handles click events on .drawer-toggle elements.
 * @returns {Promise<void>}
 */
export async function doNavbarIconClick() {
    return doNavbarIconClickCore.call(this);
}

function addDebugFunctions() {
    return addDebugFunctionsCore();
}

function initCharacterSearch() {
    return initCharacterSearchCore();
}

// MARK: DOM Handlers Start
jQuery(async function () {
    setTimeout(function () {
        $('#groupControlsToggle').trigger('click');
        $('#groupCurrentMemberListToggle .inline-drawer-icon').trigger('click');
    }, 200);

    $(document).on('click', '.api_loading', () => cancelStatusCheck('Canceled because connecting was manually canceled'));

    initSendTextareaFocusRetentionCore();

    $('#swipes-checkbox').on('change', function () {
        swipes = !!$('#swipes-checkbox').prop('checked');
        if (swipes) {
            //console.log('toggle change calling showswipebtns');
            showSwipeButtons();
        } else {
            hideSwipeButtons();
        }
        saveSettingsDebounced();
    });

    ///// SWIPE BUTTON CLICKS ///////

    //limit swiping to only last message clicks
    $(document).on('click', '.last_mes .swipe_right', swipe_right);
    $(document).on('click', '.last_mes .swipe_left', swipe_left);

    initCharacterSearch();

    $('#mes_impersonate').on('click', function () {
        $('#option_impersonate').trigger('click');
    });

    $('#mes_continue').on('click', function () {
        $('#option_continue').trigger('click');
    });

    $('#send_but').on('click', function () {
        sendTextareaMessage();
    });

    //menu buttons setup

    $('#rm_button_settings').on('click', function () {
        selected_button = 'settings';
        selectRightMenuWithAnimation('rm_api_block');
    });
    $('#rm_button_characters').on('click', function () {
        selected_button = 'characters';
        select_rm_characters();
    });
    $('#rm_button_back').on('click', function () {
        selected_button = 'characters';
        select_rm_characters();
    });
    $('#rm_button_create').on('click', function () {
        selected_button = 'create';
        select_rm_create();
    });
    $('#rm_button_selected_ch').on('click', function () {
        if (selected_group) {
            select_group_chats(selected_group);
        } else {
            selected_button = 'character_edit';
            select_selected_character(this_chid);
        }
        $('#character_search_bar').val('').trigger('input');
    });

    $(document).on('click', '.character_select', async function () {
        const id = Number($(this).attr('data-chid'));
        await selectCharacterById(id);
    });

    $(document).on('click', '.bogus_folder_select', function () {
        const tagId = $(this).attr('tagid');
        console.debug('Bogus folder clicked', tagId);
        chooseBogusFolder($(this), tagId);
    });

    const cssAutofit = CSS.supports('field-sizing', 'content');
    initEditTextareaAutoFitCore({ chatElement, debounceMs: debounce_timeout.short });

    const chatElementScroll = document.getElementById('chat');
    const chatScrollHandler = function () {
        if (power_user.waifuMode) {
            scrollLock = true;
            return;
        }

        const scrollIsAtBottom = Math.abs(chatElementScroll.scrollHeight - chatElementScroll.clientHeight - chatElementScroll.scrollTop) < 5;

        // Resume autoscroll if the user scrolls to the bottom
        if (scrollLock && scrollIsAtBottom) {
            scrollLock = false;
        }

        // Cancel autoscroll if the user scrolls up
        if (!scrollLock && !scrollIsAtBottom) {
            scrollLock = true;
        }
    };
    chatElementScroll.addEventListener('scroll', chatScrollHandler, { passive: true });

    $(document).on('click', '.mes', function () {
        //when a 'delete message' parent div is clicked
        // and we are in delete mode and del_checkbox is visible
        if (!isDeleteModeCore || !$(this).children('.del_checkbox').is(':visible')) {
            return;
        }
        selectMessageDeleteTargetCore(Number($(this).attr('mesid')));
    });

    /**
     * Handles the deletion of a chat file, including group chats.
     *
     * @param {string} chatFile - The name of the chat file to delete.
     * @param {object} group - The group object if the chat is part of a group.
     * @param {boolean} [fromSlashCommand=false] - Whether the deletion was triggered from a slash command.
     * @returns {Promise<void>}
     */
    async function handleDeleteChat(chatFile, group, fromSlashCommand = false) {
        return handleDeleteChatCore(chatFile, group, { fromSlashCommand });
    }

    $(document).on('click', '.PastChat_cross', async function (e, { fromSlashCommand = false } = {}) {
        e.stopPropagation();
        chat_file_for_del = $(this).attr('file_name');
        console.debug('detected cross click for' + chat_file_for_del);

        // Skip confirmation if called from a slash command.
        if (fromSlashCommand) {
            await handleDeleteChat(chat_file_for_del, selected_group, true);
            return;
        }

        const result = await callGenericPopup('<h3>' + t`Delete the Chat File?` + '</h3>', POPUP_TYPE.CONFIRM);
        if (result === POPUP_RESULT.AFFIRMATIVE) {
            await handleDeleteChat(chat_file_for_del, selected_group, false);
        }
    });

    $('#advanced_div').on('click', function () {
        toggleAdvancedCharacterPopupCore();
    });

    $('#character_cross').on('click', function () {
        closeAdvancedCharacterPopupCore();
    });

    $('#character_popup_ok').on('click', function () {
        closeAdvancedCharacterPopupCore({ animate: false });
    });

    $('#dialogue_popup_ok').on('click', async function (_e, customData) {
        const fromSlashCommand = customData?.fromSlashCommand || false;
        dialogueCloseStop = false;
        $('#shadow_popup').transition({
            opacity: 0,
            duration: animation_duration,
            easing: animation_easing,
        });
        setTimeout(function () {
            if (dialogueCloseStop) return;
            $('#shadow_popup').css('display', 'none');
            $('#dialogue_popup').removeClass('large_dialogue_popup');
            $('#dialogue_popup').removeClass('wide_dialogue_popup');
        }, animation_duration);

        if (popup_type == 'del_chat') {
            await handleDeleteChat(chat_file_for_del, selected_group, fromSlashCommand);
        }

        if (dialogueResolve) {
            if (popup_type == 'input') {
                dialogueResolve($('#dialogue_popup_input').val());
                $('#dialogue_popup_input').val('');
            }
            else {
                dialogueResolve(true);
            }

            dialogueResolve = null;
        }
    });

    $('#dialogue_popup_cancel').on('click', function (e) {
        dialogueCloseStop = false;
        $('#shadow_popup').transition({
            opacity: 0,
            duration: animation_duration,
            easing: animation_easing,
        });
        setTimeout(function () {
            if (dialogueCloseStop) return;
            $('#shadow_popup').css('display', 'none');
            $('#dialogue_popup').removeClass('large_dialogue_popup');
        }, animation_duration);

        popup_type = '';

        if (dialogueResolve) {
            dialogueResolve(false);
            dialogueResolve = null;
        }
    });

    $('#add_avatar_button').on('change', function () {
        const inputElement = /** @type {HTMLInputElement} */ (this);
        read_avatar_load(inputElement);
    });

    $('#form_create').on('submit', (e) => createOrEditCharacter(e.originalEvent));

    initCharacterDeleteBindingCore();

    //////// OPTIMIZED ALL CHAR CREATION/EDITING TEXTAREA LISTENERS ///////////////
    initCharacterEditorBindingsCore();

    /* $("#renameCharButton").on('click', renameCharacter); */

    initChatManagementBindingsCore();

    initOptionsMenuCore({ popper: optionsPopper });

    /* $('#set_chat_scenario').on('click', setScenarioOverride); */

    ///////////// OPTIMIZED LISTENERS FOR LEFT SIDE OPTIONS POPUP MENU //////////////////////
    $('#options [id]').on('click', async function (event, customData) {
        const fromSlashCommand = customData?.fromSlashCommand || false;
        var id = $(this).attr('id');

        // Check whether a custom prompt was provided via custom data (for example through a slash command)
        const additionalPrompt = customData?.additionalPrompt?.trim() || undefined;
        const buildOrFillAdditionalArgs = (args = {}) => ({
            ...args,
            ...(additionalPrompt !== undefined && { quiet_prompt: additionalPrompt, quietToLoud: true }),
        });

        if (id == 'option_select_chat') {
            if (this_chid === undefined && !is_send_press && !selected_group) {
                await openPermanentAssistantCard();
            }
            if ((selected_group && !is_group_generating) || (this_chid !== undefined && !is_send_press) || fromSlashCommand) {
                await displayPastChats();
                //this is just to avoid the shadow for past chat view when using /delchat
                //however, the dialog popup still gets one..
                if (!fromSlashCommand) {
                    console.log('displaying shadow');
                    $('#shadow_select_chat_popup').css('display', 'block');
                    $('#shadow_select_chat_popup').css('opacity', 0.0);
                    $('#shadow_select_chat_popup').transition({
                        opacity: 1.0,
                        duration: animation_duration,
                        easing: animation_easing,
                    });
                }
            }
        }

        else if (id == 'option_start_new_chat') {
            if ((selected_group || this_chid !== undefined) && !is_send_press) {
                let deleteCurrentChat = false;
                const result = await Popup.show.confirm(t`Start new chat?`, await renderTemplateAsync('newChatConfirm'), {
                    onClose: () => { deleteCurrentChat = !!$('#del_chat_checkbox').prop('checked'); },
                });
                if (!result) {
                    return;
                }

                await doNewChat({ deleteCurrentChat: deleteCurrentChat });
            }
            if (!selected_group && this_chid === undefined && !is_send_press) {
                const alreadyInTempChat = this_chid === undefined && name2 === neutralCharacterName;
                await newAssistantChat({ temporary: alreadyInTempChat });
            }
        }

        else if (id == 'option_regenerate') {
            closeMessageEditor();
            if (is_send_press == false) {
                //hideSwipeButtons();

                if (selected_group) {
                    regenerateGroup();
                }
                else {
                    setSendButtonState(true);
                    Generate('regenerate', buildOrFillAdditionalArgs());
                }
            }
        }

        else if (id == 'option_impersonate') {
            if (is_send_press == false || fromSlashCommand) {
                setSendButtonState(true);
                Generate('impersonate', buildOrFillAdditionalArgs());
            }
        }

        else if (id == 'option_continue') {
            if (this_edit_mes_id) return; // don't proceed if editing a message

            if (is_send_press == false || fromSlashCommand) {
                setSendButtonState(true);
                Generate('continue', buildOrFillAdditionalArgs());
            }
        }

        else if (id == 'option_delete_mes') {
            setTimeout(() => openMessageDelete(fromSlashCommand), animation_duration);
        }

        else if (id == 'option_close_chat') {
            if (is_send_press == false) {
                await waitUntilCondition(() => !isChatSaving, debounce_timeout.extended, 10);
                await clearChat();
                chat.length = 0;
                resetSelectedGroup();
                setCharacterId(undefined);
                setCharacterName('');
                setActiveCharacter(null);
                setActiveGroup(null);
                this_edit_mes_id = setEditedMessageIdCore(undefined);
                chat_metadata = {};
                syncChatMetadata(chat_metadata);
                selected_button = 'characters';
                $('#rm_button_selected_ch').children('h2').text('');
                select_rm_characters();
                await eventSource.emit(event_types.CHAT_CHANGED, getCurrentChatId());
            } else {
                toastr.info(t`Please stop the message generation first.`);
            }
        }

        else if (id === 'option_settings') {
            //var checkBox = document.getElementById("waifuMode");
            var topBar = document.getElementById('top-bar');
            var topSettingsHolder = document.getElementById('top-settings-holder');
            var divchat = document.getElementById('chat');

            //if (checkBox.checked) {
            if (topBar.style.display === 'none') {
                topBar.style.display = ''; // or "inline-block" if that's the original display value
                topSettingsHolder.style.display = ''; // or "inline-block" if that's the original display value

                divchat.style.borderRadius = '';
                divchat.style.backgroundColor = '';

            } else {

                divchat.style.borderRadius = '10px'; // Adjust the value to control the roundness of the corners
                divchat.style.backgroundColor = ''; // Set the background color to your preference

                topBar.style.display = 'none';
                topSettingsHolder.style.display = 'none';
            }
            //}
        }
        hideMenu();
    });

    $('#newChatFromManageScreenButton').on('click', async function () {
        await doNewChat({ deleteCurrentChat: false });
        $('#select_chat_cross').trigger('click');
    });

    //////////////////////////////////////////////////////////////////////////////////////////////

    //functionality for the cancel delete messages button, reverts to normal display of input form
    $('#dialogue_del_mes_cancel').on('click', function () {
        cancelDeleteModeCore(css_send_form_display);
    });

    //confirms message deletion with the "ok" button
    $('#dialogue_del_mes_ok').on('click', async function () {
        await confirmDeleteModeCore(css_send_form_display);
    });

    $('#main_api').on('change', async function () {
        cancelStatusCheck('Canceled because main api changed');
        changeMainAPI();
        saveSettingsDebounced();
        await eventSource.emit(event_types.MAIN_API_CHANGED, { apiId: main_api });
    });

    ////////////////// OPTIMIZED RANGE SLIDER LISTENERS////////////////

    var sliderLocked = true;
    var sliderTimer;

    $('input[type=\'range\']').on('touchstart', function () {
        // Unlock the slider after 300ms
        setTimeout(function () {
            sliderLocked = false;
            $(this).css('background-color', 'var(--SmartThemeQuoteColor)');
        }.bind(this), 300);
    });

    $('input[type=\'range\']').on('touchend', function () {
        clearTimeout(sliderTimer);
        $(this).css('background-color', '');
        sliderLocked = true;
    });

    $('input[type=\'range\']').on('touchmove', function (event) {
        if (sliderLocked) {
            event.preventDefault();
        }
    });

    const sliders = [
        {
            sliderId: '#amount_gen',
            counterId: '#amount_gen_counter',
            format: (val) => `${val}`,
            setValue: (val) => {
                amount_gen = Number(val);
                syncAmountGen(amount_gen);
            },
        },
        {
            sliderId: '#max_context',
            counterId: '#max_context_counter',
            format: (val) => `${val}`,
            setValue: (val) => {
                max_context = Number(val);
                syncMaxContext(max_context);
            },
        },
    ];

    sliders.forEach(slider => {
        $(document).on('input', slider.sliderId, function () {
            const value = $(this).val();
            const formattedValue = slider.format(value);
            slider.setValue(value);
            $(slider.counterId).val(formattedValue);
            saveSettingsDebounced();
        });
    });

    //////////////////////////////////////////////////////////////

    $('#select_chat_cross').on('click', function () {
        $('#shadow_select_chat_popup').transition({
            opacity: 0,
            duration: animation_duration,
            easing: animation_easing,
        });
        setTimeout(function () { $('#shadow_select_chat_popup').css('display', 'none'); }, animation_duration);
    });

    initMessageCopyBindingCore();

    //********************
    //***Message Editor***
    $(document).on('click', '.mes_edit', async function () {
        if (isDeleteModeCore) {
            return;
        }
        if (this_chid !== undefined || selected_group || name2 === neutralCharacterName) {
            this_edit_mes_id = await beginMessageEditCore($(this), cssAutofit);
        }
    });

    $(document).on('input', '#curEditTextarea', function () {
        if (power_user.auto_save_msg_edits === true) {
            messageEditAuto($(this));
        }
    });

    $(document).on('click', '.extraMesButtonsHint', function (e) {
        const $hint = $(e.target);
        const $buttons = $hint.siblings('.extraMesButtons');

        $hint.transition({
            opacity: 0,
            duration: animation_duration,
            easing: animation_easing,
            complete: function () {
                $hint.hide();
                $buttons
                    .addClass('visible')
                    .css({
                        opacity: 0,
                        display: 'flex',
                    })
                    .transition({
                        opacity: 1,
                        duration: animation_duration,
                        easing: animation_easing,
                    });
            },
        });
    });

    $(document).on('click', function (e) {
        // Expanded options don't need to be closed
        if (power_user.expand_message_actions) {
            return;
        }

        // Check if the click was outside the relevant elements
        if (!$(e.target).closest('.extraMesButtons, .extraMesButtonsHint').length) {
            const $visibleButtons = $('.extraMesButtons.visible');

            if (!$visibleButtons.length) {
                return;
            }

            const $hiddenHints = $('.extraMesButtonsHint:hidden');

            // Transition out the .extraMesButtons first
            $visibleButtons.transition({
                opacity: 0,
                duration: animation_duration,
                easing: animation_easing,
                complete: function () {
                    // Hide the .extraMesButtons after the transition
                    $(this)
                        .hide()
                        .removeClass('visible');

                    // Transition the .extraMesButtonsHint back in
                    $hiddenHints
                        .show()
                        .transition({
                            opacity: 0.3,
                            duration: animation_duration,
                            easing: animation_easing,
                            complete: function () {
                                $(this).css('opacity', '');
                            },
                        });
                },
            });
        }
    });

    $(document).on('click', '.mes_edit_cancel', async function () {
        await cancelMessageEditCore($(this));
        this_edit_mes_id = editedMessageIdCore;
    });

    $(document).on('click', '.mes_edit_up', async function () {
        this_edit_mes_id = await moveEditedMessageUpCore($(this));
    });

    $(document).on('click', '.mes_edit_down', async function () {
        this_edit_mes_id = await moveEditedMessageDownCore($(this));
    });

    $(document).on('click', '.mes_edit_copy', async function () {
        await copyEditedMessageCore($(this));
    });

    $(document).on('click', '.mes_edit_delete', async function (event, customData) {
        await deleteEditedMessageCore($(this), customData);
        this_edit_mes_id = editedMessageIdCore;
    });

    $(document).on('click', '.mes_edit_done', async function () {
        await messageEditDone($(this));
    });

    //Select chat

    //**************************CHARACTER IMPORT EXPORT*************************//
    initCharacterImportExportBindingsCore({ exportPopper });
    //**************************CHAT IMPORT EXPORT*************************//
    initChatImportBindingsCore();

    $('#rm_button_group_chats').on('click', function () {
        selected_button = 'group_chats';
        select_group_chats();
    });

    $('#rm_button_back_from_group').on('click', function () {
        selected_button = 'characters';
        select_rm_characters();
    });

    $('#dupe_button').on('click', async function () {
        await duplicateCharacter();
    });

    initExecutionControlBindingsCore();

    $(document).on('click', '.drawer-opener', doDrawerOpenClick);

    $('.drawer-toggle').on('click', doNavbarIconClick);

    $('html').on('touchstart mousedown', async function (e) {
        const clickTarget = $(e.target);

        const forbiddenTargets = [
            '#character_cross',
            '#avatar-and-name-block',
            '#shadow_popup',
            '.popup',
            '#world_popup',
            '.ui-widget',
            '.text_pole',
            '#toast-container',
            '.select2-results',
        ];

        for (const id of forbiddenTargets) {
            if (clickTarget.closest(id).length > 0) {
                return;
            }
        }

        // This autocloses open drawers that are not pinned if a click happens inside the app which does not target them.
        const targetParentHasOpenDrawer = clickTarget.parents('.openDrawer').length;
        if (!clickTarget.hasClass('drawer-icon') && !clickTarget.hasClass('openDrawer')) {
            const $openDrawers = $('.openDrawer').not('.pinnedOpen');
            if ($openDrawers.length && targetParentHasOpenDrawer === 0) {
                // Toggle icon and drawer classes
                $('.openIcon').not('.drawerPinnedOpen').toggleClass('closedIcon openIcon');
                $openDrawers.toggleClass('closedDrawer openDrawer');
            }
        }
    });

    initInlineDrawerBindingsCore();

    $(document).on('click', '.mes .avatar', function () {
        const messageElement = $(this).closest('.mes');
        const thumbURL = $(this).children('img').attr('src');
        const charsPath = '/characters/';
        const targetAvatarImg = thumbURL.substring(thumbURL.lastIndexOf('=') + 1);
        const charname = targetAvatarImg.replace('.png', '');
        const isValidCharacter = characters.some(x => x.avatar === decodeURIComponent(targetAvatarImg));

        // Remove existing zoomed avatars for characters that are not the clicked character when moving UI is not enabled
        if (!power_user.movingUI) {
            $('.zoomed_avatar').each(function () {
                const currentForChar = $(this).attr('forChar');
                if (currentForChar !== charname && typeof currentForChar !== 'undefined') {
                    console.debug(`Removing zoomed avatar for character: ${currentForChar}`);
                    $(this).remove();
                }
            });
        }

        const avatarSrc = (isDataURL(thumbURL) || /^\/?img\/(?:.+)/.test(thumbURL)) ? thumbURL : charsPath + targetAvatarImg;
        if ($(`.zoomed_avatar[forChar="${charname}"]`).length) {
            console.debug('removing container as it already existed');
            $(`.zoomed_avatar[forChar="${charname}"]`).fadeOut(animation_duration, () => {
                $(`.zoomed_avatar[forChar="${charname}"]`).remove();
            });
        } else {
            console.debug('making new container from template');
            const template = $('#zoomed_avatar_template').html();
            const newElement = $(template);
            newElement.attr('forChar', charname);
            newElement.attr('id', `zoomFor_${charname}`);
            newElement.addClass('draggable');
            newElement.find('.drag-grabber').attr('id', `zoomFor_${charname}header`);

            $('body').append(newElement);
            newElement.fadeIn(animation_duration);
            const zoomedAvatarImgElement = $(`.zoomed_avatar[forChar="${charname}"] img`);
            if (messageElement.attr('is_user') == 'true' || (messageElement.attr('is_system') == 'true' && !isValidCharacter)) {
                //handle user and system avatars
                const isValidPersona = decodeURIComponent(targetAvatarImg) in power_user.personas;
                if (isValidPersona) {
                    const personaSrc = getUserAvatar(targetAvatarImg);
                    zoomedAvatarImgElement.attr('src', personaSrc);
                    zoomedAvatarImgElement.attr('data-izoomify-url', personaSrc);
                } else {
                    zoomedAvatarImgElement.attr('src', thumbURL);
                    zoomedAvatarImgElement.attr('data-izoomify-url', thumbURL);
                }
            } else if (messageElement.attr('is_user') == 'false') { //handle char avatars
                zoomedAvatarImgElement.attr('src', avatarSrc);
                zoomedAvatarImgElement.attr('data-izoomify-url', avatarSrc);
            }
            loadMovingUIState();
            $(`.zoomed_avatar[forChar="${charname}"]`).css('display', 'flex');
            dragElement(newElement);

            if (power_user.zoomed_avatar_magnification) {
                $('.zoomed_avatar_container').izoomify();
            }

            $('.zoomed_avatar, .zoomed_avatar .dragClose').on('click touchend', (e) => {
                if (e.target.closest('.dragClose')) {
                    $(`.zoomed_avatar[forChar="${charname}"]`).fadeOut(animation_duration, () => {
                        $(`.zoomed_avatar[forChar="${charname}"]`).remove();
                    });
                }
            });

            zoomedAvatarImgElement.on('dragstart', (e) => {
                console.log('saw drag on avatar!');
                e.preventDefault();
                return false;
            });
        }
    });

    document.addEventListener('click', function (e) {
        if (!(e.target instanceof HTMLElement)) return;
        if (e.target.matches('#OpenAllWIEntries')) {
            document.querySelectorAll('#world_popup_entries_list .inline-drawer').forEach((/** @type {HTMLElement} */ drawer) => {
                delay(0).then(() => toggleDrawer(drawer, true));
            });
        } else if (e.target.matches('#CloseAllWIEntries')) {
            document.querySelectorAll('#world_popup_entries_list .inline-drawer').forEach((/** @type {HTMLElement} */ drawer) => {
                toggleDrawer(drawer, false);
            });
        }
    });

    initCharacterPanelBindingsCore();
    /* $('#set_character_world').on('click', openCharacterWorldPopup); */

    $(document).on('focus', 'input.auto-select, textarea.auto-select', function () {
        if (!power_user.enable_auto_select_input) return;
        const control = $(this)[0];
        if (control instanceof HTMLInputElement || control instanceof HTMLTextAreaElement) {
            control.select();
            console.debug('Auto-selecting content of input control', control);
        }
    });

    $(document).on('keyup', function (e) {
        if (e.key === 'Escape') {
            const isEditVisible = $('#curEditTextarea').is(':visible') || $('.reasoning_edit_textarea').length > 0;
            if (isEditVisible && power_user.auto_save_msg_edits === false) {
                closeMessageEditor('all');
                $('#send_textarea').trigger('focus');
                return;
            }
            if (isEditVisible && power_user.auto_save_msg_edits === true) {
                $(`#chat .mes[mesid="${this_edit_mes_id}"] .mes_edit_done`).trigger('click');
                closeMessageEditor('reasoning');
                $('#send_textarea').trigger('focus');
                return;
            }
            if (!this_edit_mes_id && $('#mes_stop').is(':visible')) {
                $('#mes_stop').trigger('click');
                if (chat.length && Array.isArray(chat[chat.length - 1].swipes) && chat[chat.length - 1].swipe_id == chat[chat.length - 1].swipes.length) {
                    $('.last_mes .swipe_left').trigger('click');
                }
            }
        }
    });

    initCharacterManagementDropdownBindingsCore({ getCharacterSource, importTags });

    $(window).on('beforeunload', () => {
        cancelTtsPlay();
        if (streamingProcessor) {
            console.log('Page reloaded. Aborting streaming...');
            streamingProcessor.onStopStreaming();
        }
    });

    initRangeInputBindingsCore();

    $('.user_stats_button').on('click', function () {
        userStatsHandler();
    });

    $(document).on('click', '.external_import_button, #external_import_button', async () => {
        await importExternalContentCore();
    });

    charDragDropHandler = new DragAndDropHandler('body', async (files, event) => {
        if (!files.length) {
            await importFromURL(event.originalEvent.dataTransfer.items, files);
        }
        await processDroppedFiles(files);
    }, { noAnimation: true });

    $(document).on('mouseup touchend', '#show_more_messages', async function () {
        await showMoreMessages();
    });

    $(document).on('click', '.open_characters_library', async function () {
        await getCharacters();
        await eventSource.emit(event_types.OPEN_CHARACTER_LIBRARY);
    });

    // Added here to prevent execution before script.js is loaded and get rid of quirky timeouts
    await firstLoadInit();

    window.addEventListener('beforeunload', (e) => {
        if (isChatSaving) {
            e.preventDefault();
            e.returnValue = true;
        }
    });
});
