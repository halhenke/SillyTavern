import { main_api } from './api-core.js';
import { characters } from './character-core.js';
import { name1, name2, this_chid } from './chat-core.js';
import { event_types, eventSource } from './events.js';
import { cleanUpMessage } from './message-core.js';
import { getRequestHeaders } from './network-core.js';
import { baseChatReplace, extractJsonFromData, extractMessageFromData, getBiasStrings, removeMacros, substituteParams } from './parser-core.js';
import { chat } from './chat-operations-core.js';

let generateImpl = null;
let addChatsPreambleImpl = null;
let addChatsSeparatorImpl = null;
let appendFileContentImpl = null;
let collapseNewlinesImpl = null;
let createPromptReasoningImpl = null;
let createRawPromptImpl = null;
let generateHordeImpl = null;
let getKoboldGenerationDataImpl = null;
let getKoboldSettingsConfigImpl = null;
let getGenerateUrlImpl = null;
let getGroupsImpl = null;
let getNovelGenerationDataImpl = null;
let getNovelSettingsConfigImpl = null;
let getOpenAiMaxTokensImpl = null;
let getAnimationDurationImpl = null;
let getAbortControllerImpl = null;
let getAllExtensionPromptsImpl = null;
let getAutoContinueConfigImpl = null;
let getCurrentInputTextImpl = null;
let getConsoleLogPromptsEnabledImpl = null;
let getCustomStoppingStringsImpl = null;
let getGeneratingApiConfigImpl = null;
let getGenericSystemMessageTypeImpl = null;
let getCharacterCardFieldsImpl = null;
let getCfgPromptImpl = null;
let getBeforePromptTypeImpl = null;
let getCollapseNewlinesEnabledImpl = null;
let getDepthPromptIdImpl = null;
let getDepthPromptIndexIdImpl = null;
let getExtensionPromptRoleByNameImpl = null;
let getExtensionPromptImpl = null;
let getTrimSpacesEnabledImpl = null;
let getInChatPromptTypeImpl = null;
let getInPromptPromptTypeImpl = null;
let getInstructStoppingSequencesImpl = null;
let getInstructWrapImpl = null;
let getForceOutputSequencesImpl = null;
let getGenerationTriggerImpl = null;
let getGuidanceScaleImpl = null;
let getHordeAdjustConfigImpl = null;
let getInstructionPromptImpl = null;
let getIsGroupGeneratingImpl = null;
let getIsInstructEnabledImpl = null;
let getIsKoboldStreamingUnsupportedImpl = null;
let getMinLengthImpl = null;
let getNamesAsStopStringsImpl = null;
let getOaiSendIfEmptyImpl = null;
let getOpenAiMessagesCountImpl = null;
let getPromptMetadataExtrasImpl = null;
let getSelectedPresetNameImpl = null;
let getSyspromptConfigImpl = null;
let getTextareaTextImpl = null;
let getTokenCountImpl = null;
let getTokenCountAsyncImpl = null;
let getTextGenGenerationDataImpl = null;
let getTokenizerNameImpl = null;
let getUserAlignmentMessageImpl = null;
let getPinExamplesImpl = null;
let getStoryStringConfigImpl = null;
let getTokenPaddingImpl = null;
let getWorldInfoIncludeNamesImpl = null;
let getWiAnchorBeforeImpl = null;
let executeSlashCommandsOnChatInputImpl = null;
let generateGroupWrapperImpl = null;
let getSelectedGroupImpl = null;
let getMaxContextSizeImpl = null;
let hasPendingFileAttachmentImpl = null;
let hideStopButtonImpl = null;
let hideSwipeButtonsImpl = null;
let isCharacterEditMenuImpl = null;
let isHordeGenerationNotAllowedImpl = null;
let isStreamingEnabledImpl = null;
let removeDepthPromptsImpl = null;
let removeReasoningFromStringImpl = null;
let deactivateSendButtonsImpl = null;
let addPersonaDescriptionExtensionPromptImpl = null;
let doChatInjectImpl = null;
let emitImpersonateReadyImpl = null;
let formatMessageHistoryItemImpl = null;
let formatInstructModeExamplesImpl = null;
let formatInstructModeChatImpl = null;
let formatInstructModePromptImpl = null;
let formatInstructModeStoryStringImpl = null;
let formatPromptMessageImpl = null;
let formatPromptReasoningImpl = null;
let flushWIDepthInjectionsImpl = null;
let getGroupDepthPromptsImpl = null;
let getAllowWIScanImpl = null;
let extractImageFromDataImpl = null;
let extractMultiSwipesImpl = null;
let extractTitleFromDataImpl = null;
let extractReasoningFromDataImpl = null;
let hasToolCallsImpl = null;
let invokeFunctionToolsImpl = null;
let normalizeReasoningTextImpl = null;
let createStreamingProcessorImpl = null;
let sendMessageAsUserImpl = null;
let sendGenerationRequestImpl = null;
let sendOpenAIRequestImpl = null;
let sendSystemMessageImpl = null;
let sendStreamingRequestImpl = null;
let setExtensionPromptImpl = null;
let setAbortControllerImpl = null;
let setCharacterIdImpl = null;
let setCharacterNameImpl = null;
let setOpenAiMaxTokensImpl = null;
let setCustomWorldInfoDepthPromptImpl = null;
let setGenerationParamsFromPresetImpl = null;
let setGenerationProgressImpl = null;
let setSendButtonStateImpl = null;
let setInContextMessagesImpl = null;
let setStreamingProcessorImpl = null;
let setOpenAIMessageExamplesImpl = null;
let setOpenAIMessagesImpl = null;
let setFloatingPromptImpl = null;
let setChatTaintedImpl = null;
let setQuietPromptImpl = null;
let setStoryStringPromptImpl = null;
let clearStoryStringPromptImpl = null;
let showStopButtonImpl = null;
let showToolCallErrorImpl = null;
let showKoboldStreamingUnsupportedImpl = null;
let showServerUnreachableImpl = null;
let trimToEndSentenceImpl = null;
let triggerContinueImpl = null;
let triggerAutoContinueImpl = null;
let adjustHordeGenerationParamsImpl = null;
let adjustNovelInstructionPromptImpl = null;
let parseMesExamplesImpl = null;
let parseAndSaveLogprobsImpl = null;
let playMessageSoundImpl = null;
let prepareOpenAIMessagesImpl = null;
let renderStoryStringImpl = null;
let runGenerationInterceptorsImpl = null;
let saveChatConditionalImpl = null;
let saveReplyImpl = null;
let setGeneratedTitleImpl = null;
let getWorldInfoPromptImpl = null;
let shouldIncludePersonaInStoryStringImpl = null;
let setImpersonationTextImpl = null;
let showApiErrorImpl = null;
let showTextGenerationErrorImpl = null;
let shouldAutoSwipeResultImpl = null;
let swipeRightImpl = null;
let unblockGenerationImpl = null;
let emitGenerationStartedImpl = null;
let emitGenerationAfterCommandsImpl = null;
let pingServerImpl = null;
let unshallowCharacterImpl = null;

export let amount_gen = 0;
export let depth_prompt_depth_default = 0;
export let depth_prompt_role_default = 'system';
export let max_context = 0;
export let online_status = 'no_connection';
export let streamingProcessor = null;
export let talkativeness_default = 0;

function throwUnbound(name) {
    throw new Error(`[generation-core] ${name} was called before bindings were initialized`);
}

/**
 * Binds legacy generation implementations to standalone wrappers.
 * @param {{
 *   Generate: (...args: any[]) => Promise<any>,
 *   addChatsPreamble: (...args: any[]) => string,
 *   addChatsSeparator: (...args: any[]) => string,
 *   appendFileContent: (...args: any[]) => Promise<string>,
  *   collapseNewlines: (...args: any[]) => string,
  *   createPromptReasoning: () => any,
  *   createRawPrompt: (...args: any[]) => string|object[],
 *   emitGenerationAfterCommands: (...args: any[]) => Promise<any>,
 *   emitGenerationStarted: (...args: any[]) => Promise<any>,
 *   generateHorde: (...args: any[]) => Promise<any>,
 *   generateGroupWrapper: (...args: any[]) => Promise<any>,
 *   adjustHordeGenerationParams: (...args: any[]) => Promise<any>,
 *   adjustNovelInstructionPrompt: (prompt: string) => string,
 *   addPersonaDescriptionExtensionPrompt: () => any,
 *   emitImpersonateReady: (message: string) => Promise<any>,
 *   executeSlashCommandsOnChatInput: (...args: any[]) => Promise<any>,
 *   createStreamingProcessor: (...args: any[]) => any,
 *   doChatInject: (...args: any[]) => Promise<number[]>,
 *   getAnimationDuration: () => number,
 *   getAllExtensionPrompts: () => Promise<string>,
 *   getBeforePromptType: () => number,
 *   getCfgPrompt: (...args: any[]) => any,
 *   getCollapseNewlinesEnabled: () => boolean,
 *   getCurrentInputText: () => string,
 *   getCustomStoppingStrings: () => string[],
 *   getCharacterCardFields: (...args: any[]) => any,
 *   getDepthPromptId: () => any,
 *   getDepthPromptIndexId: (index: number) => any,
 *   getExtensionPrompt: (...args: any[]) => Promise<string>,
 *   getExtensionPromptRoleByName: (...args: any[]) => any,
 *   getForceOutputSequences: () => { first?: any, last?: any },
 *   getGenerationTrigger: (type: string|undefined) => string,
 *   getTrimSpacesEnabled: () => boolean,
 *   getInChatPromptType: () => number,
 *   getInPromptPromptType: () => number,
 *   getInstructWrap: () => boolean,
 *   getGenericSystemMessageType: () => any,
 *   getKoboldGenerationData: (...args: any[]) => any,
 *   getKoboldSettingsConfig: () => { kaiSettings?: any, kaiFlags?: any, koboldaiSettings?: any, koboldaiSettingNames?: any },
 *   getAbortController: () => AbortController|null|undefined,
 *   getAutoContinueConfig: () => { enabled?: boolean, target_length?: number, allow_chat_completions?: boolean },
 *   getGenerateUrl: (...args: any[]) => string,
 *   getGroups: () => any[],
 *   getConsoleLogPromptsEnabled: () => boolean,
 *   getGuidanceScale: () => any,
 *   getHordeAdjustConfig: () => { autoAdjustContextLength?: boolean, autoAdjustResponseLength?: boolean },
 *   getInstructionPrompt: (system: string) => string,
 *   getIsGroupGenerating: () => boolean,
 *   getIsInstructEnabled: () => boolean,
 *   getIsKoboldStreamingUnsupported: () => boolean,
 *   getInstructStoppingSequences: () => string[],
 *   getMaxContextSize: () => number,
 *   getMinLength: () => number,
 *   getNamesAsStopStrings: () => boolean,
 *   getOaiSendIfEmpty: () => string,
 *   getOpenAiMessagesCount: () => number,
 *   getPromptMetadataExtras: () => { authorsNoteString?: string, chatVectorsString?: string, dataBankVectorsString?: string, smartContextString?: string, summarizeString?: string },
 *   getSelectedPresetName: () => string,
 *   getSyspromptConfig: () => { enabled?: boolean, preferCharacterPrompt?: boolean, content?: string },
 *   getNovelGenerationData: (...args: any[]) => any,
 *   getNovelSettingsConfig: () => { naiSettings?: any, novelaiSettings?: any, novelaiSettingNames?: any },
 *   getOpenAiMaxTokens: () => number,
 *   getPinExamples: () => boolean,
 *   getStoryStringConfig: () => { position?: number, depth?: number, role?: any, stripExamples?: boolean },
 *   getGeneratingApiConfig: () => { mainApi?: string, openAiSource?: string, textgenType?: string, textgenOobaType?: string },
  *   getTextareaText: () => string,
  *   getTokenCount: (text: string) => number,
 *   getTokenCountAsync: (...args: any[]) => Promise<number>,
 *   getTokenPadding: () => number,
 *   getTextGenGenerationData: (...args: any[]) => Promise<any>,
 *   getTokenizerName: () => string,
 *   getUserAlignmentMessage: () => string,
 *   getWiAnchorBefore: () => any,
 *   getWorldInfoIncludeNames: () => boolean,
 *   getWorldInfoPrompt: (...args: any[]) => Promise<any>,
 *   getSelectedGroup: () => string|null|undefined,
 *   hasPendingFileAttachment: () => boolean,
 *   hideStopButton: () => any,
 *   hideSwipeButtons: () => any,
 *   isCharacterEditMenu: () => boolean,
 *   isHordeGenerationNotAllowed: () => boolean,
 *   isStreamingEnabled: (...args: any[]) => boolean,
 *   removeDepthPrompts: (...args: any[]) => any,
 *   removeReasoningFromString: (...args: any[]) => string,
 *   deactivateSendButtons: () => any,
 *   extractImageFromData: (...args: any[]) => any,
 *   extractMultiSwipes: (...args: any[]) => any,
 *   extractReasoningFromData: (...args: any[]) => any,
 *   extractTitleFromData: (...args: any[]) => any,
 *   flushWIDepthInjections: () => any,
 *   hasToolCalls: (...args: any[]) => boolean,
 *   invokeFunctionTools: (...args: any[]) => Promise<any>,
 *   formatMessageHistoryItem: (...args: any[]) => string,
 *   formatInstructModeExamples: (...args: any[]) => string[],
 *   formatInstructModeChat: (...args: any[]) => string,
 *   formatInstructModePrompt: (...args: any[]) => string,
 *   formatInstructModeStoryString: (...args: any[]) => string,
 *   formatPromptMessage: (...args: any[]) => string,
 *   formatPromptReasoning: (...args: any[]) => string,
 *   getGroupDepthPrompts: (...args: any[]) => any[],
 *   getAllowWIScan: () => boolean,
 *   parseMesExamples: (...args: any[]) => string[],
 *   parseAndSaveLogprobs: (...args: any[]) => any,
 *   pingServer: () => Promise<boolean>,
 *   playMessageSound: () => any,
 *   renderStoryString: (...args: any[]) => string,
 *   saveChatConditional: () => Promise<any>,
 *   saveReply: (...args: any[]) => Promise<any>,
 *   sendMessageAsUser: (...args: any[]) => Promise<any>,
 *   sendGenerationRequest: (...args: any[]) => Promise<any>,
 *   sendOpenAIRequest: (...args: any[]) => Promise<any>,
 *   sendSystemMessage: (...args: any[]) => any,
 *   sendStreamingRequest: (...args: any[]) => Promise<any>,
 *   setAbortController: (controller: AbortController) => any,
 *   setCharacterId: (value: number) => any,
 *   setCharacterName: (value: string) => any,
 *   setChatTainted: () => any,
 *   setCustomWorldInfoDepthPrompt: (depth: number, role: any, value: string) => any,
 *   setExtensionPrompt: (...args: any[]) => any,
 *   setOpenAiMaxTokens: (value: number) => any,
 *   setGenerationParamsFromPreset: (...args: any[]) => void,
 *   setGenerationProgress: (...args: any[]) => void,
  *   setInContextMessages: (...args: any[]) => any,
 *   setGeneratedTitle: (value: string) => any,
 *   setImpersonationText: (message: string) => any,
 *   setQuietPrompt: (value: string) => any,
 *   setSendButtonState: (...args: any[]) => any,
 *   setFloatingPrompt: () => any,
 *   setStreamingProcessor: (...args: any[]) => any,
 *   setOpenAIMessageExamples: (...args: any[]) => any,
 *   setOpenAIMessages: (...args: any[]) => any,
 *   setStoryStringPrompt: (value: string, depth: number, role: any) => any,
 *   clearStoryStringPrompt: () => any,
 *   shouldIncludePersonaInStoryString: () => boolean,
 *   shouldAutoSwipeResult: (message: string) => boolean,
 *   showApiError: (message: string) => any,
 *   showKoboldStreamingUnsupported: () => any,
 *   showStopButton: () => any,
 *   showServerUnreachable: () => any,
 *   showToolCallError: (...args: any[]) => any,
 *   showTextGenerationError: (message: string) => any,
 *   swipeRight: () => any,
 *   trimToEndSentence: (...args: any[]) => string,
 *   triggerContinue: () => any,
 *   triggerAutoContinue: (...args: any[]) => any,
 *   unshallowCharacter: (characterId: any) => Promise<any>,
 *   unblockGeneration: (type?: string) => any,
 *   normalizeReasoningText: (...args: any[]) => string,
 *   prepareOpenAIMessages: (...args: any[]) => Promise<any>,
 *   runGenerationInterceptors: (...args: any[]) => Promise<boolean>,
 * }} impl Implementations to bind
 */
export function bindGenerationCore(impl) {
    adjustHordeGenerationParamsImpl = impl?.adjustHordeGenerationParams ?? null;
    adjustNovelInstructionPromptImpl = impl?.adjustNovelInstructionPrompt ?? null;
    addPersonaDescriptionExtensionPromptImpl = impl?.addPersonaDescriptionExtensionPrompt ?? null;
    appendFileContentImpl = impl?.appendFileContent ?? null;
    emitGenerationAfterCommandsImpl = impl?.emitGenerationAfterCommands ?? null;
    emitGenerationStartedImpl = impl?.emitGenerationStarted ?? null;
    emitImpersonateReadyImpl = impl?.emitImpersonateReady ?? null;
    generateImpl = impl?.Generate ?? null;
    addChatsPreambleImpl = impl?.addChatsPreamble ?? null;
    addChatsSeparatorImpl = impl?.addChatsSeparator ?? null;
    collapseNewlinesImpl = impl?.collapseNewlines ?? null;
    createPromptReasoningImpl = impl?.createPromptReasoning ?? null;
    createRawPromptImpl = impl?.createRawPrompt ?? null;
    createStreamingProcessorImpl = impl?.createStreamingProcessor ?? null;
    doChatInjectImpl = impl?.doChatInject ?? null;
    generateHordeImpl = impl?.generateHorde ?? null;
    executeSlashCommandsOnChatInputImpl = impl?.executeSlashCommandsOnChatInput ?? null;
    deactivateSendButtonsImpl = impl?.deactivateSendButtons ?? null;
    getAnimationDurationImpl = impl?.getAnimationDuration ?? null;
    getAllExtensionPromptsImpl = impl?.getAllExtensionPrompts ?? null;
    getAllowWIScanImpl = impl?.getAllowWIScan ?? null;
    getBeforePromptTypeImpl = impl?.getBeforePromptType ?? null;
    getCharacterCardFieldsImpl = impl?.getCharacterCardFields ?? null;
    getCfgPromptImpl = impl?.getCfgPrompt ?? null;
    getCollapseNewlinesEnabledImpl = impl?.getCollapseNewlinesEnabled ?? null;
    getCurrentInputTextImpl = impl?.getCurrentInputText ?? null;
    getCustomStoppingStringsImpl = impl?.getCustomStoppingStrings ?? null;
    getDepthPromptIdImpl = impl?.getDepthPromptId ?? null;
    getDepthPromptIndexIdImpl = impl?.getDepthPromptIndexId ?? null;
    getExtensionPromptImpl = impl?.getExtensionPrompt ?? null;
    getExtensionPromptRoleByNameImpl = impl?.getExtensionPromptRoleByName ?? null;
    getForceOutputSequencesImpl = impl?.getForceOutputSequences ?? null;
    getGenerationTriggerImpl = impl?.getGenerationTrigger ?? null;
    getTrimSpacesEnabledImpl = impl?.getTrimSpacesEnabled ?? null;
    getInChatPromptTypeImpl = impl?.getInChatPromptType ?? null;
    getInPromptPromptTypeImpl = impl?.getInPromptPromptType ?? null;
    getInstructWrapImpl = impl?.getInstructWrap ?? null;
    getGenericSystemMessageTypeImpl = impl?.getGenericSystemMessageType ?? null;
    getGuidanceScaleImpl = impl?.getGuidanceScale ?? null;
    getGroupDepthPromptsImpl = impl?.getGroupDepthPrompts ?? null;
    getHordeAdjustConfigImpl = impl?.getHordeAdjustConfig ?? null;
    getKoboldGenerationDataImpl = impl?.getKoboldGenerationData ?? null;
    getKoboldSettingsConfigImpl = impl?.getKoboldSettingsConfig ?? null;
    getAbortControllerImpl = impl?.getAbortController ?? null;
    getAutoContinueConfigImpl = impl?.getAutoContinueConfig ?? null;
    getGenerateUrlImpl = impl?.getGenerateUrl ?? null;
    getGroupsImpl = impl?.getGroups ?? null;
    getConsoleLogPromptsEnabledImpl = impl?.getConsoleLogPromptsEnabled ?? null;
    getIsGroupGeneratingImpl = impl?.getIsGroupGenerating ?? null;
    getIsInstructEnabledImpl = impl?.getIsInstructEnabled ?? null;
    getIsKoboldStreamingUnsupportedImpl = impl?.getIsKoboldStreamingUnsupported ?? null;
    getInstructStoppingSequencesImpl = impl?.getInstructStoppingSequences ?? null;
    getInstructionPromptImpl = impl?.getInstructionPrompt ?? null;
    getMaxContextSizeImpl = impl?.getMaxContextSize ?? null;
    getMinLengthImpl = impl?.getMinLength ?? null;
    getNamesAsStopStringsImpl = impl?.getNamesAsStopStrings ?? null;
    getOaiSendIfEmptyImpl = impl?.getOaiSendIfEmpty ?? null;
    getOpenAiMessagesCountImpl = impl?.getOpenAiMessagesCount ?? null;
    getPromptMetadataExtrasImpl = impl?.getPromptMetadataExtras ?? null;
    getSelectedPresetNameImpl = impl?.getSelectedPresetName ?? null;
    getSyspromptConfigImpl = impl?.getSyspromptConfig ?? null;
    getNovelGenerationDataImpl = impl?.getNovelGenerationData ?? null;
    getNovelSettingsConfigImpl = impl?.getNovelSettingsConfig ?? null;
    getOpenAiMaxTokensImpl = impl?.getOpenAiMaxTokens ?? null;
    getPinExamplesImpl = impl?.getPinExamples ?? null;
    getGeneratingApiConfigImpl = impl?.getGeneratingApiConfig ?? null;
    getStoryStringConfigImpl = impl?.getStoryStringConfig ?? null;
    getTextareaTextImpl = impl?.getTextareaText ?? null;
    getTokenCountImpl = impl?.getTokenCount ?? null;
    getTokenCountAsyncImpl = impl?.getTokenCountAsync ?? null;
    getTokenPaddingImpl = impl?.getTokenPadding ?? null;
    getTextGenGenerationDataImpl = impl?.getTextGenGenerationData ?? null;
    getTokenizerNameImpl = impl?.getTokenizerName ?? null;
    getUserAlignmentMessageImpl = impl?.getUserAlignmentMessage ?? null;
    getWiAnchorBeforeImpl = impl?.getWiAnchorBefore ?? null;
    getWorldInfoIncludeNamesImpl = impl?.getWorldInfoIncludeNames ?? null;
    getWorldInfoPromptImpl = impl?.getWorldInfoPrompt ?? null;
    generateGroupWrapperImpl = impl?.generateGroupWrapper ?? null;
    getSelectedGroupImpl = impl?.getSelectedGroup ?? null;
    hasPendingFileAttachmentImpl = impl?.hasPendingFileAttachment ?? null;
    hideStopButtonImpl = impl?.hideStopButton ?? null;
    hideSwipeButtonsImpl = impl?.hideSwipeButtons ?? null;
    isCharacterEditMenuImpl = impl?.isCharacterEditMenu ?? null;
    isHordeGenerationNotAllowedImpl = impl?.isHordeGenerationNotAllowed ?? null;
    isStreamingEnabledImpl = impl?.isStreamingEnabled ?? null;
    removeDepthPromptsImpl = impl?.removeDepthPrompts ?? null;
    removeReasoningFromStringImpl = impl?.removeReasoningFromString ?? null;
    extractImageFromDataImpl = impl?.extractImageFromData ?? null;
    extractMultiSwipesImpl = impl?.extractMultiSwipes ?? null;
    extractReasoningFromDataImpl = impl?.extractReasoningFromData ?? null;
    extractTitleFromDataImpl = impl?.extractTitleFromData ?? null;
    flushWIDepthInjectionsImpl = impl?.flushWIDepthInjections ?? null;
    hasToolCallsImpl = impl?.hasToolCalls ?? null;
    invokeFunctionToolsImpl = impl?.invokeFunctionTools ?? null;
    formatMessageHistoryItemImpl = impl?.formatMessageHistoryItem ?? null;
    formatInstructModeExamplesImpl = impl?.formatInstructModeExamples ?? null;
    formatInstructModeChatImpl = impl?.formatInstructModeChat ?? null;
    formatInstructModePromptImpl = impl?.formatInstructModePrompt ?? null;
    formatInstructModeStoryStringImpl = impl?.formatInstructModeStoryString ?? null;
    formatPromptMessageImpl = impl?.formatPromptMessage ?? null;
    formatPromptReasoningImpl = impl?.formatPromptReasoning ?? null;
    normalizeReasoningTextImpl = impl?.normalizeReasoningText ?? null;
    parseMesExamplesImpl = impl?.parseMesExamples ?? null;
    parseAndSaveLogprobsImpl = impl?.parseAndSaveLogprobs ?? null;
    pingServerImpl = impl?.pingServer ?? null;
    playMessageSoundImpl = impl?.playMessageSound ?? null;
    renderStoryStringImpl = impl?.renderStoryString ?? null;
    sendMessageAsUserImpl = impl?.sendMessageAsUser ?? null;
    sendGenerationRequestImpl = impl?.sendGenerationRequest ?? null;
    sendOpenAIRequestImpl = impl?.sendOpenAIRequest ?? null;
    sendSystemMessageImpl = impl?.sendSystemMessage ?? null;
    sendStreamingRequestImpl = impl?.sendStreamingRequest ?? null;
    saveChatConditionalImpl = impl?.saveChatConditional ?? null;
    saveReplyImpl = impl?.saveReply ?? null;
    setAbortControllerImpl = impl?.setAbortController ?? null;
    setCharacterIdImpl = impl?.setCharacterId ?? null;
    setCharacterNameImpl = impl?.setCharacterName ?? null;
    setChatTaintedImpl = impl?.setChatTainted ?? null;
    setCustomWorldInfoDepthPromptImpl = impl?.setCustomWorldInfoDepthPrompt ?? null;
    setExtensionPromptImpl = impl?.setExtensionPrompt ?? null;
    setGeneratedTitleImpl = impl?.setGeneratedTitle ?? null;
    setImpersonationTextImpl = impl?.setImpersonationText ?? null;
    setOpenAiMaxTokensImpl = impl?.setOpenAiMaxTokens ?? null;
    setGenerationParamsFromPresetImpl = impl?.setGenerationParamsFromPreset ?? null;
    setGenerationProgressImpl = impl?.setGenerationProgress ?? null;
    setInContextMessagesImpl = impl?.setInContextMessages ?? null;
    setQuietPromptImpl = impl?.setQuietPrompt ?? null;
    setSendButtonStateImpl = impl?.setSendButtonState ?? null;
    setFloatingPromptImpl = impl?.setFloatingPrompt ?? null;
    setStreamingProcessorImpl = impl?.setStreamingProcessor ?? null;
    setOpenAIMessageExamplesImpl = impl?.setOpenAIMessageExamples ?? null;
    setOpenAIMessagesImpl = impl?.setOpenAIMessages ?? null;
    setStoryStringPromptImpl = impl?.setStoryStringPrompt ?? null;
    clearStoryStringPromptImpl = impl?.clearStoryStringPrompt ?? null;
    shouldIncludePersonaInStoryStringImpl = impl?.shouldIncludePersonaInStoryString ?? null;
    shouldAutoSwipeResultImpl = impl?.shouldAutoSwipeResult ?? null;
    showApiErrorImpl = impl?.showApiError ?? null;
    showKoboldStreamingUnsupportedImpl = impl?.showKoboldStreamingUnsupported ?? null;
    showStopButtonImpl = impl?.showStopButton ?? null;
    showServerUnreachableImpl = impl?.showServerUnreachable ?? null;
    showToolCallErrorImpl = impl?.showToolCallError ?? null;
    showTextGenerationErrorImpl = impl?.showTextGenerationError ?? null;
    swipeRightImpl = impl?.swipeRight ?? null;
    trimToEndSentenceImpl = impl?.trimToEndSentence ?? null;
    triggerContinueImpl = impl?.triggerContinue ?? null;
    triggerAutoContinueImpl = impl?.triggerAutoContinue ?? null;
    unshallowCharacterImpl = impl?.unshallowCharacter ?? null;
    unblockGenerationImpl = impl?.unblockGeneration ?? null;
    prepareOpenAIMessagesImpl = impl?.prepareOpenAIMessages ?? null;
    runGenerationInterceptorsImpl = impl?.runGenerationInterceptors ?? null;
}

export function syncAmountGen(value) {
    amount_gen = value;
}

export function syncDepthPromptDepthDefault(value) {
    depth_prompt_depth_default = value;
}

export function syncDepthPromptRoleDefault(value) {
    depth_prompt_role_default = value;
}

export function syncMaxContext(value) {
    max_context = value;
}

export function syncOnlineStatus(value) {
    online_status = value;
}

export function syncStreamingProcessor(value) {
    streamingProcessor = value;
}

export function syncTalkativenessDefault(value) {
    talkativeness_default = value;
}

export function Generate(...args) {
    if (!generateImpl) {
        throwUnbound('Generate');
    }

    return generateImpl(...args);
}

export class TempResponseLength {
    static #originalResponseLength = -1;
    static #lastApi = null;

    static isCustomized() {
        return this.#originalResponseLength > -1;
    }

    static save(api, responseLength) {
        if (!getOpenAiMaxTokensImpl) {
            throwUnbound('getOpenAiMaxTokens');
        }
        if (!setOpenAiMaxTokensImpl) {
            throwUnbound('setOpenAiMaxTokens');
        }

        if (api === 'openai') {
            this.#originalResponseLength = getOpenAiMaxTokensImpl();
            setOpenAiMaxTokensImpl(responseLength);
        } else {
            this.#originalResponseLength = amount_gen;
            amount_gen = responseLength;
            syncAmountGen(amount_gen);
        }

        this.#lastApi = api;
        console.log('[TempResponseLength] Saved original response length:', TempResponseLength.#originalResponseLength);
    }

    static restore(api) {
        if (!getOpenAiMaxTokensImpl) {
            throwUnbound('getOpenAiMaxTokens');
        }
        if (!setOpenAiMaxTokensImpl) {
            throwUnbound('setOpenAiMaxTokens');
        }

        if (this.#originalResponseLength === -1) {
            return;
        }
        if (!api && this.#lastApi) {
            api = this.#lastApi;
        }
        if (api === 'openai') {
            setOpenAiMaxTokensImpl(this.#originalResponseLength);
        } else {
            amount_gen = this.#originalResponseLength;
            syncAmountGen(amount_gen);
        }

        console.log('[TempResponseLength] Restored original response length:', this.#originalResponseLength);
        this.#originalResponseLength = -1;
        this.#lastApi = null;
    }

    static setupEventHook(api) {
        const eventHook = () => {
            if (this.isCustomized()) {
                this.restore(api);
            }
        };

        switch (api) {
            case 'openai':
                eventSource.once(event_types.CHAT_COMPLETION_SETTINGS_READY, eventHook);
                break;
            default:
                eventSource.once(event_types.GENERATE_AFTER_DATA, eventHook);
                break;
        }

        return eventHook;
    }

    static removeEventHook(api, eventHook) {
        switch (api) {
            case 'openai':
                eventSource.removeListener(event_types.CHAT_COMPLETION_SETTINGS_READY, eventHook);
                break;
            default:
                eventSource.removeListener(event_types.GENERATE_AFTER_DATA, eventHook);
                break;
        }
    }
}

export async function generateQuietPrompt({ quietPrompt = '', quietToLoud = false, skipWIAN = false, quietImage = null, quietName = null, responseLength = null, forceChId = null, jsonSchema = null, removeReasoning = true, trimToSentence = false } = {}) {
    if (!trimToEndSentenceImpl) {
        throwUnbound('trimToEndSentence');
    }
    if (!removeReasoningFromStringImpl) {
        throwUnbound('removeReasoningFromString');
    }

    if (arguments.length > 0 && typeof arguments[0] !== 'object') {
        console.trace('generateQuietPrompt called with positional arguments. Please use an object instead.');
        [quietPrompt, quietToLoud, skipWIAN, quietImage, quietName, responseLength, forceChId, jsonSchema] = arguments;
    }

    const responseLengthCustomized = typeof responseLength === 'number' && responseLength > 0;
    let eventHook = () => { };
    try {
        const generateOptions = {
            quiet_prompt: quietPrompt ?? '',
            quietToLoud: quietToLoud ?? false,
            skipWIAN: skipWIAN ?? false,
            force_name2: true,
            quietImage: quietImage ?? null,
            quietName: quietName ?? null,
            force_chid: forceChId ?? null,
            jsonSchema: jsonSchema ?? null,
        };
        if (responseLengthCustomized) {
            TempResponseLength.save(main_api, responseLength);
            eventHook = TempResponseLength.setupEventHook(main_api);
        }
        let result = await Generate('quiet', generateOptions);
        result = trimToSentence ? trimToEndSentenceImpl(result) : result;
        result = removeReasoning ? removeReasoningFromStringImpl(result) : result;
        return result;
    } finally {
        if (responseLengthCustomized && TempResponseLength.isCustomized()) {
            TempResponseLength.restore(main_api);
            TempResponseLength.removeEventHook(main_api, eventHook);
        }
    }
}

export function getGenerateUrl(...args) {
    if (!getGenerateUrlImpl) {
        throwUnbound('getGenerateUrl');
    }

    return getGenerateUrlImpl(...args);
}

export function getGeneratingApi() {
    if (!getGeneratingApiConfigImpl) {
        throwUnbound('getGeneratingApiConfig');
    }

    const { mainApi, openAiSource, textgenType, textgenOobaType } = getGeneratingApiConfigImpl() ?? {};
    switch (mainApi) {
        case 'openai':
            return openAiSource || 'openai';
        case 'textgenerationwebui':
            return textgenType === textgenOobaType ? 'textgenerationwebui' : textgenType;
        default:
            return mainApi;
    }
}

export function getStoppingStrings(...args) {
    if (!getInstructStoppingSequencesImpl) {
        throwUnbound('getInstructStoppingSequences');
    }
    if (!getCustomStoppingStringsImpl) {
        throwUnbound('getCustomStoppingStrings');
    }
    if (!getNamesAsStopStringsImpl) {
        throwUnbound('getNamesAsStopStrings');
    }
    if (!getGroupsImpl) {
        throwUnbound('getGroups');
    }
    if (!getSelectedGroupImpl) {
        throwUnbound('getSelectedGroup');
    }

    const [isImpersonate, isContinue] = args;
    const result = [];

    if (getNamesAsStopStringsImpl()) {
        const charString = `\n${name2}:`;
        const userString = `\n${name1}:`;
        result.push(isImpersonate ? charString : userString);
        result.push(userString);

        if (isContinue && Array.isArray(chat) && chat[chat.length - 1]?.is_user) {
            result.push(charString);
        }

        const selectedGroup = getSelectedGroupImpl();
        if (selectedGroup && (name2 || isImpersonate)) {
            const group = getGroupsImpl().find(x => x.id === selectedGroup);
            if (group && Array.isArray(group.members)) {
                const names = group.members
                    .map(x => characters.find(y => y.avatar == x))
                    .filter(x => x && x.name && x.name !== name2)
                    .map(x => `\n${x.name}:`);
                result.push(...names);
            }
        }
    }

    result.push(...getInstructStoppingSequencesImpl());
    result.push(...getCustomStoppingStringsImpl());

    return result.filter(x => x).filter((value, index, array) => array.indexOf(value) === index);
}

export async function processCommands(message) {
    if (!executeSlashCommandsOnChatInputImpl) {
        throwUnbound('executeSlashCommandsOnChatInput');
    }

    if (!message || !message.trim().startsWith('/')) {
        return false;
    }

    await executeSlashCommandsOnChatInputImpl(message, {
        clearChatInput: true,
    });
    return true;
}

export function removeLastMessage() {
    if (!getAnimationDurationImpl) {
        throwUnbound('getAnimationDuration');
    }

    return new Promise((resolve) => {
        const lastMes = $('#chat').children('.mes').last();
        if (lastMes.length === 0) {
            return resolve();
        }
        lastMes.hide(getAnimationDurationImpl(), function () {
            $(this).remove();
            resolve();
        });
    });
}

export async function prepareGenerationMessages({ type, dryRun, isImpersonate, automaticTrigger, generationStarted }) {
    if (!setSendButtonStateImpl) {
        throwUnbound('setSendButtonState');
    }
    if (!deactivateSendButtonsImpl) {
        throwUnbound('deactivateSendButtons');
    }
    if (!hasPendingFileAttachmentImpl) {
        throwUnbound('hasPendingFileAttachment');
    }
    if (!sendSystemMessageImpl) {
        throwUnbound('sendSystemMessage');
    }
    if (!sendMessageAsUserImpl) {
        throwUnbound('sendMessageAsUser');
    }
    if (!getOaiSendIfEmptyImpl) {
        throwUnbound('getOaiSendIfEmpty');
    }
    if (!getGenericSystemMessageTypeImpl) {
        throwUnbound('getGenericSystemMessageType');
    }

    let textareaText;
    if (type !== 'regenerate' && type !== 'swipe' && type !== 'quiet' && !isImpersonate && !dryRun) {
        setSendButtonStateImpl(true);
        textareaText = String($('#send_textarea').val());
        $('#send_textarea').val('')[0].dispatchEvent(new Event('input', { bubbles: true }));
    } else {
        textareaText = '';
        if (!(chat.length && chat[chat.length - 1].is_user) && type !== 'quiet' && type !== 'swipe' && !isImpersonate && !dryRun && chat.length) {
            chat.length = chat.length - 1;
            await removeLastMessage();
            await eventSource.emit(event_types.MESSAGE_DELETED, chat.length);
        }
    }

    const isContinue = type == 'continue';
    if (isContinue && chat.length) {
        const prevFinished = chat[chat.length - 1].gen_finished;
        const prevStarted = chat[chat.length - 1].gen_started;

        if (prevFinished && prevStarted) {
            const timePassed = prevFinished - prevStarted;
            generationStarted = new Date(Date.now() - timePassed);
            chat[chat.length - 1].gen_started = generationStarted;
        }
    }

    if (!dryRun) {
        deactivateSendButtonsImpl();
    }

    const { messageBias, promptBias, isUserPromptBias } = getBiasStrings(textareaText, type);
    const noAttachTypes = ['regenerate', 'swipe', 'impersonate', 'quiet', 'continue'];

    if ((textareaText !== '' || (hasPendingFileAttachmentImpl() && !noAttachTypes.includes(type))) && !automaticTrigger && type !== 'quiet' && !dryRun) {
        if (messageBias && !removeMacros(textareaText)) {
            sendSystemMessageImpl(getGenericSystemMessageTypeImpl(), ' ', { bias: messageBias });
        } else {
            await sendMessageAsUserImpl(textareaText, messageBias);
        }
    } else if (textareaText === '' && !automaticTrigger && !dryRun && type === undefined && main_api == 'openai' && getOaiSendIfEmptyImpl().trim().length > 0) {
        await sendMessageAsUserImpl(getOaiSendIfEmptyImpl().trim(), messageBias);
    }

    return {
        generationStarted,
        isContinue,
        isUserPromptBias,
        messageBias,
        promptBias,
        textareaText,
    };
}

export async function prepareGenerationEntryState({
    dryRun,
    forceChid,
    quietImage,
    quietPrompt,
    quietToLoud,
    signal,
    skipWIAN,
    type,
    automaticTrigger,
    forceName2,
    currentCharacterId,
}) {
    if (!unshallowCharacterImpl) {
        throwUnbound('unshallowCharacter');
    }
    if (!emitGenerationStartedImpl) {
        throwUnbound('emitGenerationStarted');
    }
    if (!getAbortControllerImpl) {
        throwUnbound('getAbortController');
    }
    if (!setAbortControllerImpl) {
        throwUnbound('setAbortController');
    }
    if (!getIsInstructEnabledImpl) {
        throwUnbound('getIsInstructEnabled');
    }
    if (!getCurrentInputTextImpl) {
        throwUnbound('getCurrentInputText');
    }
    if (!unblockGenerationImpl) {
        throwUnbound('unblockGeneration');
    }
    if (!emitGenerationAfterCommandsImpl) {
        throwUnbound('emitGenerationAfterCommands');
    }
    if (!isHordeGenerationNotAllowedImpl) {
        throwUnbound('isHordeGenerationNotAllowed');
    }
    if (!getIsKoboldStreamingUnsupportedImpl) {
        throwUnbound('getIsKoboldStreamingUnsupported');
    }
    if (!showKoboldStreamingUnsupportedImpl) {
        throwUnbound('showKoboldStreamingUnsupported');
    }
    if (!generateGroupWrapperImpl) {
        throwUnbound('generateGroupWrapper');
    }
    if (!getSelectedGroupImpl) {
        throwUnbound('getSelectedGroup');
    }
    if (!getIsGroupGeneratingImpl) {
        throwUnbound('getIsGroupGenerating');
    }
    if (!isCharacterEditMenuImpl) {
        throwUnbound('isCharacterEditMenu');
    }
    if (!setCharacterIdImpl) {
        throwUnbound('setCharacterId');
    }
    if (!setCharacterNameImpl) {
        throwUnbound('setCharacterName');
    }
    if (!pingServerImpl) {
        throwUnbound('pingServer');
    }
    if (!hideSwipeButtonsImpl) {
        throwUnbound('hideSwipeButtons');
    }
    if (!setChatTaintedImpl) {
        throwUnbound('setChatTainted');
    }
    if (!showServerUnreachableImpl) {
        throwUnbound('showServerUnreachable');
    }
    if (!setSendButtonStateImpl) {
        throwUnbound('setSendButtonState');
    }

    await unshallowCharacterImpl(currentCharacterId);

    const eventOptions = { automatic_trigger: automaticTrigger, force_name2: forceName2, quiet_prompt: quietPrompt, quietToLoud, skipWIAN, force_chid: forceChid, signal, quietImage };
    await emitGenerationStartedImpl(type, eventOptions, dryRun);

    if (!(getAbortControllerImpl() && signal)) {
        setAbortControllerImpl(new AbortController());
    }

    const isInstruct = getIsInstructEnabledImpl() && main_api !== 'openai';
    const isImpersonate = type === 'impersonate';

    if (!(dryRun || type === 'regenerate' || type === 'swipe' || type === 'quiet')) {
        const interruptedByCommand = await processCommands(getCurrentInputTextImpl());
        if (interruptedByCommand) {
            unblockGenerationImpl(type);
            return { status: 'complete', value: undefined };
        }
    }

    await emitGenerationAfterCommandsImpl(type, eventOptions, dryRun);

    if (getIsKoboldStreamingUnsupportedImpl()) {
        showKoboldStreamingUnsupportedImpl();
        unblockGenerationImpl(type);
        return { status: 'complete', value: undefined };
    }

    if (isHordeGenerationNotAllowedImpl()) {
        unblockGenerationImpl(type);
        return { status: 'complete', value: undefined };
    }

    if (!dryRun) {
        const pingResult = await pingServerImpl();
        if (!pingResult) {
            unblockGenerationImpl(type);
            showServerUnreachableImpl();
            throw new Error('Server unreachable');
        }

        hideSwipeButtonsImpl();
        setChatTaintedImpl();
    }

    const selectedGroup = getSelectedGroupImpl();
    if (selectedGroup && !getIsGroupGeneratingImpl()) {
        if (!dryRun) {
            return {
                status: 'complete',
                value: await generateGroupWrapperImpl(false, type, {
                    quiet_prompt: quietPrompt,
                    force_chid: forceChid,
                    signal: getAbortControllerImpl()?.signal,
                    quietImage,
                }),
            };
        }

        const characterIndexMap = new Map(characters.map((char, index) => [char.avatar, index]));
        const group = (getGroupsImpl() ?? []).find((item) => item.id === selectedGroup);
        const enabledMembers = group.members.reduce((acc, member) => {
            if (!group.disabled_members.includes(member) && !acc.includes(member)) {
                acc.push(member);
            }
            return acc;
        }, []);
        const memberIds = enabledMembers
            .map((member) => characterIndexMap.get(member))
            .filter((index) => index !== undefined && index !== null);

        if (memberIds.length > 0) {
            if (!isCharacterEditMenuImpl()) {
                setCharacterIdImpl(memberIds[0]);
            }
            setCharacterNameImpl('');
        } else {
            console.log('No enabled members found');
            unblockGenerationImpl(type);
            return { status: 'complete', value: undefined };
        }
    }

    if (quietPrompt) {
        quietPrompt = substituteParams(quietPrompt);
        quietPrompt = main_api === 'novel' && !quietToLoud ? adjustNovelInstructionPromptImpl(quietPrompt) : quietPrompt;
    }

    if (!dryRun && online_status === 'no_connection') {
        setSendButtonStateImpl(false);
        return { status: 'complete', value: undefined };
    }

    return {
        isImpersonate,
        isInstruct,
        quietPrompt,
        status: 'continue',
    };
}

export function preparePromptContextState({ isInstruct }) {
    if (!getCharacterCardFieldsImpl) {
        throwUnbound('getCharacterCardFields');
    }
    if (!getSyspromptConfigImpl) {
        throwUnbound('getSyspromptConfig');
    }
    if (!removeDepthPromptsImpl) {
        throwUnbound('removeDepthPrompts');
    }
    if (!getGroupDepthPromptsImpl) {
        throwUnbound('getGroupDepthPrompts');
    }
    if (!getExtensionPromptRoleByNameImpl) {
        throwUnbound('getExtensionPromptRoleByName');
    }
    if (!setExtensionPromptImpl) {
        throwUnbound('setExtensionPrompt');
    }
    if (!getDepthPromptIdImpl) {
        throwUnbound('getDepthPromptId');
    }
    if (!getDepthPromptIndexIdImpl) {
        throwUnbound('getDepthPromptIndexId');
    }
    if (!getAllowWIScanImpl) {
        throwUnbound('getAllowWIScan');
    }
    if (!getSelectedGroupImpl) {
        throwUnbound('getSelectedGroup');
    }
    if (!getInChatPromptTypeImpl) {
        throwUnbound('getInChatPromptType');
    }

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
    } = getCharacterCardFieldsImpl();

    if (main_api !== 'openai') {
        const sysprompt = getSyspromptConfigImpl() ?? {};
        if (sysprompt.enabled) {
            system = sysprompt.preferCharacterPrompt && system
                ? substituteParams(system, name1, name2, (sysprompt.content ?? ''))
                : baseChatReplace(sysprompt.content, name1, name2);
            system = isInstruct ? substituteParams(system, name1, name2, sysprompt.content) : system;
        } else {
            system = '';
        }
    }

    removeDepthPromptsImpl();
    const selectedGroup = getSelectedGroupImpl();
    const groupDepthPrompts = getGroupDepthPromptsImpl(selectedGroup, Number(this_chid));
    const inChatPromptType = getInChatPromptTypeImpl();

    if (selectedGroup && Array.isArray(groupDepthPrompts) && groupDepthPrompts.length > 0) {
        groupDepthPrompts.forEach((value, index) => {
            const role = getExtensionPromptRoleByNameImpl(value.role);
            setExtensionPromptImpl(getDepthPromptIndexIdImpl(index), value.text, inChatPromptType, value.depth, getAllowWIScanImpl(), role);
        });
    } else {
        const depthPromptText = charDepthPrompt || '';
        const depthPromptDepth = characters[this_chid]?.data?.extensions?.depth_prompt?.depth ?? depth_prompt_depth_default;
        const depthPromptRole = getExtensionPromptRoleByNameImpl(characters[this_chid]?.data?.extensions?.depth_prompt?.role ?? depth_prompt_role_default);
        setExtensionPromptImpl(getDepthPromptIdImpl(), depthPromptText, inChatPromptType, depthPromptDepth, getAllowWIScanImpl(), depthPromptRole);
    }

    if (chat.length) {
        chat[0].mes = substituteParams(chat[0].mes);
    }

    return {
        charDepthPrompt,
        creatorNotes,
        description,
        jailbreak,
        mesExamples,
        personality,
        persona,
        scenario,
        system,
    };
}

export async function prepareCoreChatState({ canUseTools, isContinue, type }) {
    if (!formatPromptMessageImpl) {
        throwUnbound('formatPromptMessage');
    }
    if (!appendFileContentImpl) {
        throwUnbound('appendFileContent');
    }
    if (!createPromptReasoningImpl) {
        throwUnbound('createPromptReasoning');
    }
    if (!formatPromptReasoningImpl) {
        throwUnbound('formatPromptReasoning');
    }

    let coreChat = chat.filter((chatItem) => !chatItem.is_system || (canUseTools && Array.isArray(chatItem.extra?.tool_invocations)));
    if (type === 'swipe') {
        coreChat.pop();
    }

    coreChat = await Promise.all(coreChat.map(async (chatItem, index) => {
        const depth = coreChat.length - index - (isContinue ? 2 : 1);
        let message = formatPromptMessageImpl(chatItem, depth);
        message = await appendFileContentImpl(chatItem, message);

        if (chatItem?.extra?.append_title && chatItem?.extra?.title) {
            message = `${message}\n\n${chatItem.extra.title}`;
        }

        return {
            ...chatItem,
            mes: message,
            index,
        };
    }));

    const promptReasoning = createPromptReasoningImpl();
    for (let i = coreChat.length - 1; i >= 0; i--) {
        const depth = coreChat.length - i - (isContinue ? 2 : 1);
        const isPrefix = isContinue && i === coreChat.length - 1;
        coreChat[i] = {
            ...coreChat[i],
            mes: promptReasoning.addToMessage(
                coreChat[i].mes,
                formatPromptReasoningImpl(coreChat[i].extra?.reasoning, depth),
                isPrefix,
                coreChat[i].extra?.reasoning_duration,
            ),
        };

        if (promptReasoning.isLimitReached()) {
            break;
        }
    }

    return {
        coreChat,
        promptReasoning,
    };
}

export async function preparePromptAugmentationState({
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
    quietPrompt,
    scenario,
    skipWIAN,
    system,
    thisMaxContext,
    type,
}) {
    if (!parseMesExamplesImpl) {
        throwUnbound('parseMesExamples');
    }
    if (!setFloatingPromptImpl) {
        throwUnbound('setFloatingPrompt');
    }
    if (!addPersonaDescriptionExtensionPromptImpl) {
        throwUnbound('addPersonaDescriptionExtensionPrompt');
    }
    if (!setQuietPromptImpl) {
        throwUnbound('setQuietPrompt');
    }
    if (!getInPromptPromptTypeImpl) {
        throwUnbound('getInPromptPromptType');
    }
    if (!getWorldInfoIncludeNamesImpl) {
        throwUnbound('getWorldInfoIncludeNames');
    }
    if (!getGenerationTriggerImpl) {
        throwUnbound('getGenerationTrigger');
    }
    if (!getWorldInfoPromptImpl) {
        throwUnbound('getWorldInfoPrompt');
    }
    if (!getWiAnchorBeforeImpl) {
        throwUnbound('getWiAnchorBefore');
    }
    if (!formatInstructModeExamplesImpl) {
        throwUnbound('formatInstructModeExamples');
    }
    if (!flushWIDepthInjectionsImpl) {
        throwUnbound('flushWIDepthInjections');
    }
    if (!setCustomWorldInfoDepthPromptImpl) {
        throwUnbound('setCustomWorldInfoDepthPrompt');
    }
    if (!getInChatPromptTypeImpl) {
        throwUnbound('getInChatPromptType');
    }
    if (!getBeforePromptTypeImpl) {
        throwUnbound('getBeforePromptType');
    }
    if (!getExtensionPromptImpl) {
        throwUnbound('getExtensionPrompt');
    }
    if (!shouldIncludePersonaInStoryStringImpl) {
        throwUnbound('shouldIncludePersonaInStoryString');
    }
    if (!renderStoryStringImpl) {
        throwUnbound('renderStoryString');
    }
    if (!formatInstructModeStoryStringImpl) {
        throwUnbound('formatInstructModeStoryString');
    }
    if (!getStoryStringConfigImpl) {
        throwUnbound('getStoryStringConfig');
    }
    if (!setStoryStringPromptImpl) {
        throwUnbound('setStoryStringPrompt');
    }
    if (!clearStoryStringPromptImpl) {
        throwUnbound('clearStoryStringPrompt');
    }
    if (!doChatInjectImpl) {
        throwUnbound('doChatInject');
    }
    if (!getSyspromptConfigImpl) {
        throwUnbound('getSyspromptConfig');
    }

    let mesExamplesArray = parseMesExamplesImpl(mesExamples, isInstruct);
    const inPromptPromptType = getInPromptPromptTypeImpl();
    const inChatPromptType = getInChatPromptTypeImpl();

    setFloatingPromptImpl();
    addPersonaDescriptionExtensionPromptImpl();

    const chatForWI = coreChat
        .map((message) => getWorldInfoIncludeNamesImpl() ? `${message.name}: ${message.mes}` : message.mes)
        .reverse();
    const globalScanData = {
        personaDescription: persona,
        characterDescription: description,
        characterPersonality: personality,
        characterDepthPrompt: charDepthPrompt,
        scenario,
        creatorNotes,
        trigger: getGenerationTriggerImpl(type),
    };

    let worldInfoString = '';
    let worldInfoBefore = '';
    let worldInfoAfter = '';
    let worldInfoExamples = [];
    let worldInfoDepth = [];

    setQuietPromptImpl(quietPrompt || '');
    try {
        ({
            worldInfoString = '',
            worldInfoBefore = '',
            worldInfoAfter = '',
            worldInfoExamples = [],
            worldInfoDepth = [],
        } = await getWorldInfoPromptImpl(chatForWI, thisMaxContext, dryRun, globalScanData));
    } finally {
        setQuietPromptImpl('');
    }

    for (const example of worldInfoExamples) {
        const exampleMessage = example.content;
        if (exampleMessage.length === 0) {
            continue;
        }

        const formattedExample = baseChatReplace(exampleMessage, name1, name2);
        const cleanedExample = parseMesExamplesImpl(formattedExample, isInstruct);
        if (example.position === getWiAnchorBeforeImpl()) {
            mesExamplesArray.unshift(...cleanedExample);
        } else {
            mesExamplesArray.push(...cleanedExample);
        }
    }

    const mesExamplesRawArray = [...mesExamplesArray];

    if (mesExamplesArray && isInstruct) {
        mesExamplesArray = formatInstructModeExamplesImpl(mesExamplesArray, name1, name2);
    }

    if (skipWIAN !== true) {
        console.log('skipWIAN not active, adding WIAN');
        flushWIDepthInjectionsImpl();
        if (Array.isArray(worldInfoDepth)) {
            worldInfoDepth.forEach((entry) => {
                setCustomWorldInfoDepthPromptImpl(entry.depth, entry.role, entry.entries.join('\n'));
            });
        }
    } else {
        console.log('skipping WIAN');
    }

    const beforeScenarioAnchor = await getExtensionPromptImpl(getBeforePromptTypeImpl());
    const afterScenarioAnchor = await getExtensionPromptImpl(inPromptPromptType);
    const storyString = renderStoryStringImpl({
        description,
        personality,
        persona: shouldIncludePersonaInStoryStringImpl() ? persona : '',
        scenario,
        system,
        char: name2,
        user: name1,
        wiBefore: worldInfoBefore,
        wiAfter: worldInfoAfter,
        loreBefore: worldInfoBefore,
        loreAfter: worldInfoAfter,
        anchorBefore: beforeScenarioAnchor.trim(),
        anchorAfter: afterScenarioAnchor.trim(),
        mesExamples: mesExamplesArray.join(''),
        mesExamplesRaw: mesExamplesRawArray.join(''),
    });

    let combinedStoryString = isInstruct ? formatInstructModeStoryStringImpl(storyString) : storyString;
    const storyStringConfig = getStoryStringConfigImpl() ?? {};
    const applyStoryStringInject = main_api !== 'openai' && storyStringConfig.position === inChatPromptType;
    if (applyStoryStringInject) {
        setStoryStringPromptImpl(combinedStoryString, storyStringConfig.depth ?? 1, storyStringConfig.role);
        combinedStoryString = '';
    } else {
        clearStoryStringPromptImpl();
    }

    if (storyStringConfig.stripExamples) {
        mesExamplesArray = [];
    }

    let injectedIndices = [];
    if (main_api !== 'openai') {
        injectedIndices = await doChatInjectImpl(coreChat, isContinue);
    }

    const sysprompt = getSyspromptConfigImpl() ?? {};
    if (main_api !== 'openai' && sysprompt.enabled) {
        jailbreak = sysprompt.preferCharacterJailbreak && jailbreak
            ? substituteParams(jailbreak, name1, name2, (sysprompt.postHistory ?? ''))
            : baseChatReplace(sysprompt.postHistory ?? '', name1, name2);

        if (jailbreak) {
            if (isContinue) {
                coreChat.splice(coreChat.length - 1, 0, { mes: jailbreak, is_user: true });
            } else {
                coreChat.push({ mes: jailbreak, is_user: true });
                injectedIndices.forEach((index, arrayIndex) => injectedIndices[arrayIndex] = index + 1);
            }
        }
    }

    return {
        afterScenarioAnchor,
        beforeScenarioAnchor,
        combinedStoryString,
        injectedIndices,
        jailbreak,
        mesExamplesArray,
        storyString,
        worldInfoAfter,
        worldInfoBefore,
        worldInfoString,
    };
}

export async function prepareGenerationContextWindow({ coreChat, dryRun, type }) {
    if (!getMaxContextSizeImpl) {
        throwUnbound('getMaxContextSize');
    }
    if (!runGenerationInterceptorsImpl) {
        throwUnbound('runGenerationInterceptors');
    }
    if (!getHordeAdjustConfigImpl) {
        throwUnbound('getHordeAdjustConfig');
    }
    if (!adjustHordeGenerationParamsImpl) {
        throwUnbound('adjustHordeGenerationParams');
    }
    if (!getGuidanceScaleImpl) {
        throwUnbound('getGuidanceScale');
    }
    if (!getCfgPromptImpl) {
        throwUnbound('getCfgPrompt');
    }
    if (!getTokenCountAsyncImpl) {
        throwUnbound('getTokenCountAsync');
    }

    let thisMaxContext = getMaxContextSizeImpl();

    if (!dryRun) {
        console.debug('Running extension interceptors');
        const aborted = await runGenerationInterceptorsImpl(coreChat, thisMaxContext, type);

        if (aborted) {
            console.debug('Generation aborted by extension interceptors');
            return { aborted: true, adjustedParams: undefined, thisMaxContext };
        }
    } else {
        console.debug('Skipping extension interceptors for dry run');
    }

    let adjustedParams;
    const hordeAdjustConfig = getHordeAdjustConfigImpl() ?? {};
    if (main_api === 'koboldhorde' && (hordeAdjustConfig.autoAdjustContextLength || hordeAdjustConfig.autoAdjustResponseLength)) {
        try {
            adjustedParams = await adjustHordeGenerationParamsImpl(max_context, amount_gen);
        } catch {
            return { aborted: true, adjustedParams: undefined, thisMaxContext };
        }

        if (hordeAdjustConfig.autoAdjustContextLength) {
            thisMaxContext = adjustedParams.maxContextLength - adjustedParams.maxLength;
        }
    }

    const cfgGuidanceScale = getGuidanceScaleImpl();
    const useCfgPrompt = cfgGuidanceScale && cfgGuidanceScale.value !== 1;

    if (useCfgPrompt) {
        const negativePrompt = getCfgPromptImpl(cfgGuidanceScale, true, true)?.value || '';
        const positivePrompt = getCfgPromptImpl(cfgGuidanceScale, false, true)?.value || '';
        if (negativePrompt || positivePrompt) {
            const previousMaxContext = thisMaxContext;
            const [negativePromptTokenCount, positivePromptTokenCount] = await Promise.all([
                getTokenCountAsyncImpl(negativePrompt),
                getTokenCountAsyncImpl(positivePrompt),
            ]);
            const decrement = Math.max(negativePromptTokenCount, positivePromptTokenCount);
            thisMaxContext -= decrement;
            console.log(`Max context reduced by ${decrement} tokens of CFG prompt (${previousMaxContext} -> ${thisMaxContext})`);
        }
    }

    return {
        aborted: false,
        adjustedParams,
        cfgGuidanceScale,
        thisMaxContext,
        useCfgPrompt,
    };
}

export function prepareMessageHistoryState({ coreChat, isContinue, isInstruct, mesExamplesArray }) {
    if (!formatMessageHistoryItemImpl) {
        throwUnbound('formatMessageHistoryItem');
    }
    if (!getForceOutputSequencesImpl) {
        throwUnbound('getForceOutputSequences');
    }
    if (!getUserAlignmentMessageImpl) {
        throwUnbound('getUserAlignmentMessage');
    }
    if (!setOpenAIMessagesImpl) {
        throwUnbound('setOpenAIMessages');
    }
    if (!setOpenAIMessageExamplesImpl) {
        throwUnbound('setOpenAIMessageExamples');
    }

    const { first: firstOutputSequence = false, last: lastOutputSequence = false } = getForceOutputSequencesImpl() ?? {};
    let chat2 = [];
    let continueMag = '';
    const userMessageIndices = [];
    const lastUserMessageIndex = coreChat.findLastIndex(x => x.is_user);

    for (let i = coreChat.length - 1, j = 0; i >= 0; i--, j++) {
        if (main_api === 'openai') {
            chat2[i] = coreChat[j].mes;
            if (i === 0 && isContinue) {
                chat2[i] = chat2[i].slice(0, chat2[i].lastIndexOf(coreChat[j].mes) + coreChat[j].mes.length);
                continueMag = coreChat[j].mes;
            }
            continue;
        }

        chat2[i] = formatMessageHistoryItemImpl(coreChat[j], isInstruct, false);

        if (j === 0 && isInstruct) {
            chat2[i] = formatMessageHistoryItemImpl(coreChat[j], isInstruct, firstOutputSequence);
        }

        if (lastUserMessageIndex >= 0 && j === lastUserMessageIndex && isInstruct) {
            chat2[i] = formatMessageHistoryItemImpl(coreChat[j], isInstruct, lastOutputSequence);
        }

        if (i === 0 && isContinue) {
            const FORMAT_TOKEN = '\u0000\ufffc\u0000\ufffd';

            if (isInstruct) {
                const originalMessage = String(coreChat[j].mes ?? '');
                coreChat[j].mes = originalMessage.replaceAll(FORMAT_TOKEN, '') + FORMAT_TOKEN;
                chat2[i] = formatMessageHistoryItemImpl(coreChat[j], isInstruct, lastOutputSequence);
                coreChat[j].mes = originalMessage;
            }

            chat2[i] = chat2[i].includes(FORMAT_TOKEN)
                ? chat2[i].slice(0, chat2[i].lastIndexOf(FORMAT_TOKEN))
                : chat2[i].slice(0, chat2[i].lastIndexOf(coreChat[j].mes) + coreChat[j].mes.length);
            continueMag = coreChat[j].mes;
        }

        if (coreChat[j].is_user) {
            userMessageIndices.push(i);
        }
    }

    const addUserAlignment = Boolean(isInstruct && getUserAlignmentMessageImpl());
    let userAlignmentMessage = '';

    if (addUserAlignment) {
        const alignmentMessage = {
            name: name1,
            mes: substituteParams(getUserAlignmentMessageImpl()),
            is_user: true,
        };
        userAlignmentMessage = formatMessageHistoryItemImpl(alignmentMessage, isInstruct, firstOutputSequence);
    }

    let oaiMessages = [];
    let oaiMessageExamples = [];

    if (main_api === 'openai') {
        oaiMessages = setOpenAIMessagesImpl(coreChat);
        oaiMessageExamples = setOpenAIMessageExamplesImpl(mesExamplesArray);
    }

    if (chat2.length === 0) {
        chat2.push('');
    }

    return {
        addUserAlignment,
        chat2,
        continueMag,
        oaiMessageExamples,
        oaiMessages,
        userAlignmentMessage,
        userMessageIndices,
    };
}

function modifyPromptLine({
    forceName2,
    isContinue,
    isImpersonate,
    isInstruct,
    lastMesString,
    promptBias,
    quietName,
    quietPrompt,
    quietToLoud,
    type,
}) {
    if (!formatInstructModeChatImpl) {
        throwUnbound('formatInstructModeChat');
    }
    if (!formatInstructModePromptImpl) {
        throwUnbound('formatInstructModePrompt');
    }

    if (quietPrompt && quietPrompt.length) {
        const name = name1;
        const quietAppend = isInstruct
            ? formatInstructModeChatImpl(name, quietPrompt, false, true, '', name1, name2, false)
            : `\n${quietPrompt}`;

        lastMesString += quietAppend;

        if (!isInstruct && !quietToLoud) {
            return lastMesString;
        }
    }

    if (isInstruct && !isContinue) {
        const name = (quietPrompt && !quietToLoud && !isImpersonate) ? (quietName ?? 'System') : (isImpersonate ? name1 : name2);
        const isQuiet = quietPrompt && type === 'quiet';
        lastMesString += formatInstructModePromptImpl(name, isImpersonate, promptBias, name1, name2, isQuiet, quietToLoud);
    }

    if (!isInstruct && isImpersonate && !isContinue) {
        const name = name1;
        if (!lastMesString.endsWith('\n')) {
            lastMesString += '\n';
        }
        lastMesString += `${name}:`;
    }

    const isContinuingOnFirstMessage = chat.length === 1 && isContinue;
    if (!isInstruct && forceName2 && !isContinuingOnFirstMessage) {
        if (!lastMesString.endsWith('\n')) {
            lastMesString += '\n';
        }
        if (!isContinue || !(chat[chat.length - 1]?.is_user)) {
            lastMesString += `${name2}:`;
        }
    }

    return lastMesString;
}

export async function prepareContextPackingState({
    addUserAlignment,
    chat2,
    combinedStoryString,
    forceName2,
    injectedIndices,
    isContinue,
    isImpersonate,
    isInstruct,
    mesExamplesArray,
    promptBias,
    quietName,
    quietPrompt,
    quietToLoud,
    thisMaxContext,
    type,
    userAlignmentMessage,
    userMessageIndices,
}) {
    if (!addChatsPreambleImpl) {
        throwUnbound('addChatsPreamble');
    }
    if (!addChatsSeparatorImpl) {
        throwUnbound('addChatsSeparator');
    }
    if (!getPinExamplesImpl) {
        throwUnbound('getPinExamples');
    }
    if (!getTokenCountAsyncImpl) {
        throwUnbound('getTokenCountAsync');
    }
    if (!getTokenPaddingImpl) {
        throwUnbound('getTokenPadding');
    }
    if (!setInContextMessagesImpl) {
        throwUnbound('setInContextMessages');
    }

    let examplesString = '';
    let chatString = addChatsPreambleImpl(addChatsSeparatorImpl(''));
    let cyclePrompt = '';

    const getMessagesTokenCount = async () => {
        const encodeString = [
            combinedStoryString,
            examplesString,
            userAlignmentMessage,
            chatString,
            modifyPromptLine({
                forceName2,
                isContinue,
                isImpersonate,
                isInstruct,
                lastMesString: '',
                promptBias,
                quietName,
                quietPrompt,
                quietToLoud,
                type,
            }),
            cyclePrompt,
        ].join('').replace(/\r/gm, '');
        return getTokenCountAsyncImpl(encodeString, getTokenPaddingImpl());
    };

    let pinExmString;
    if (getPinExamplesImpl()) {
        pinExmString = examplesString = mesExamplesArray.join('');
    }

    if (isContinue && (chat2.length > 1 || main_api === 'openai')) {
        cyclePrompt = chat2.shift();
    }

    let arrMes = new Array(chat2.length);
    let tokenCount = await getMessagesTokenCount();
    let lastAddedIndex = -1;

    for (const index of injectedIndices) {
        const item = chat2[index];

        if (typeof item !== 'string') {
            continue;
        }

        tokenCount += await getTokenCountAsyncImpl(item.replace(/\r/gm, ''));
        if (tokenCount < thisMaxContext) {
            chatString = chatString + item;
            arrMes[index] = item;
            lastAddedIndex = Math.max(lastAddedIndex, index);
        } else {
            break;
        }
    }

    for (let i = 0; i < chat2.length; i++) {
        if (main_api === 'openai') {
            break;
        }

        if (arrMes[i] !== undefined) {
            continue;
        }

        const item = chat2[i];

        if (typeof item !== 'string') {
            continue;
        }

        tokenCount += await getTokenCountAsyncImpl(item.replace(/\r/gm, ''));
        if (tokenCount < thisMaxContext) {
            chatString = chatString + item;
            arrMes[i] = item;
            lastAddedIndex = Math.max(lastAddedIndex, i);
        } else {
            break;
        }
    }

    const stoppedAtUser = userMessageIndices.includes(lastAddedIndex);
    if (addUserAlignment && !stoppedAtUser) {
        tokenCount += await getTokenCountAsyncImpl(userAlignmentMessage.replace(/\r/gm, ''));
        chatString = userAlignmentMessage + chatString;
        arrMes.push(userAlignmentMessage);
        injectedIndices.push(arrMes.length - 1);
    }

    const newArrMes = [];
    const newInjectedIndices = [];
    for (let i = 0; i < arrMes.length; i++) {
        if (arrMes[i] !== undefined) {
            newArrMes.push(arrMes[i]);
            if (injectedIndices.includes(i)) {
                newInjectedIndices.push(newArrMes.length - 1);
            }
        }
    }

    arrMes = newArrMes;
    injectedIndices = newInjectedIndices;

    if (main_api !== 'openai') {
        setInContextMessagesImpl(arrMes.length - injectedIndices.length, type);
    }

    tokenCount = await getMessagesTokenCount();
    let countExmAdd = 0;
    if (!getPinExamplesImpl()) {
        for (const example of mesExamplesArray) {
            tokenCount += await getTokenCountAsyncImpl(example.replace(/\r/gm, ''));
            examplesString += example;
            if (tokenCount < thisMaxContext) {
                countExmAdd++;
            } else {
                break;
            }
        }
    }

    return {
        arrMes,
        countExmAdd,
        cyclePrompt,
        injectedIndices,
        pinExmString,
    };
}

export async function preparePromptAssemblyState({
    arrMes,
    combinedStoryString,
    countExmAdd,
    forceName2,
    generatedPromptCache,
    isContinue,
    isImpersonate,
    isInstruct,
    mesExamplesArray,
    pinExmString,
    promptBias,
    quietName,
    quietPrompt,
    quietToLoud,
    thisMaxContext,
    type,
}) {
    if (!formatInstructModeChatImpl) {
        throwUnbound('formatInstructModeChat');
    }
    if (!formatInstructModePromptImpl) {
        throwUnbound('formatInstructModePrompt');
    }
    if (!getInstructWrapImpl) {
        throwUnbound('getInstructWrap');
    }
    if (!getTokenCountAsyncImpl) {
        throwUnbound('getTokenCountAsync');
    }
    if (!getTokenPaddingImpl) {
        throwUnbound('getTokenPadding');
    }
    if (!addChatsPreambleImpl) {
        throwUnbound('addChatsPreamble');
    }
    if (!addChatsSeparatorImpl) {
        throwUnbound('addChatsSeparator');
    }

    let mesSend = [];
    let mesExmString = '';

    if (generatedPromptCache.length === 0 || type === 'continue') {
        console.debug('generating prompt');
        arrMes = arrMes.reverse();
        arrMes.forEach((item, i, arr) => {
            if (main_api === 'openai') {
                return;
            }

            if (i === arrMes.length - 1 && type !== 'continue') {
                if (!isInstruct || (getInstructWrapImpl() && type !== 'quiet')) {
                    item = item.replace(/\n?$/, '');
                }
            }

            mesSend.push({ message: item, extensionPrompts: [] });
        });
    }

    const setPromptString = () => {
        if (main_api === 'openai') {
            return;
        }

        console.debug('--setting Prompt string');
        mesExmString = pinExmString ?? mesExamplesArray.slice(0, countExmAdd).join('');

        if (mesSend.length) {
            mesSend[mesSend.length - 1].message = modifyPromptLine({
                forceName2,
                isContinue,
                isImpersonate,
                isInstruct,
                lastMesString: mesSend[mesSend.length - 1].message,
                promptBias,
                quietName,
                quietPrompt,
                quietToLoud,
                type,
            });
        }
    };

    const checkPromptSize = async () => {
        console.debug('---checking Prompt size');
        setPromptString();
        const jointMessages = mesSend.map((e) => `${e.extensionPrompts.join('')}${e.message}`).join('');
        const prompt = [
            combinedStoryString,
            mesExmString,
            addChatsPreambleImpl(addChatsSeparatorImpl(jointMessages)),
            '\n',
            modifyPromptLine({
                forceName2,
                isContinue,
                isImpersonate,
                isInstruct,
                lastMesString: '',
                promptBias,
                quietName,
                quietPrompt,
                quietToLoud,
                type,
            }),
            generatedPromptCache,
        ].join('').replace(/\r/gm, '');
        const thisPromptContextSize = await getTokenCountAsyncImpl(prompt, getTokenPaddingImpl());

        if (thisPromptContextSize > thisMaxContext) {
            if (countExmAdd > 0) {
                countExmAdd--;
                await checkPromptSize();
            } else if (mesSend.length > 0) {
                mesSend.shift();
                await checkPromptSize();
            } else {
                console.debug(`---mesSend.length = ${mesSend.length}`);
            }
        }
    };

    if (generatedPromptCache.length > 0 && main_api !== 'openai') {
        console.debug(`---Generated Prompt Cache length: ${generatedPromptCache.length}`);
        await checkPromptSize();
    } else {
        console.debug(`---calling setPromptString ${generatedPromptCache.length}`);
        setPromptString();
    }

    return {
        countExmAdd,
        mesExmString,
        mesSend,
    };
}

export async function buildCombinedPrompt({
    afterScenarioAnchor,
    beforeScenarioAnchor,
    combinedStoryString,
    description,
    generatedPromptCache,
    injectedIndices,
    isImpersonate,
    isInstruct,
    jailbreak,
    mesExmString,
    mesSend,
    name,
    naiPreamble,
    persona,
    personality,
    promptBias,
    scenario,
    storyString,
    system,
    useCfgPrompt,
    user,
    worldInfoAfter,
    worldInfoBefore,
    cfgGuidanceScale,
    isNegative = false,
}) {
    if (!getCfgPromptImpl) {
        throwUnbound('getCfgPrompt');
    }
    if (!addChatsSeparatorImpl) {
        throwUnbound('addChatsSeparator');
    }
    if (!addChatsPreambleImpl) {
        throwUnbound('addChatsPreamble');
    }
    if (!getCollapseNewlinesEnabledImpl) {
        throwUnbound('getCollapseNewlinesEnabled');
    }
    if (!collapseNewlinesImpl) {
        throwUnbound('collapseNewlines');
    }

    if (isNegative && !useCfgPrompt) {
        return {
            combinedPrompt: undefined,
            mesSendString: '',
        };
    }

    if (main_api === 'openai') {
        return {
            combinedPrompt: '',
            mesSendString: '',
        };
    }

    let finalMesSend = structuredClone(mesSend);

    if (useCfgPrompt) {
        const cfgPrompt = getCfgPromptImpl(cfgGuidanceScale, isNegative);
        if (cfgPrompt.value) {
            if (cfgPrompt.depth === 0) {
                finalMesSend[finalMesSend.length - 1].message +=
                    /\s/.test(finalMesSend[finalMesSend.length - 1].message.slice(-1))
                        ? cfgPrompt.value
                        : ` ${cfgPrompt.value}`;
            } else {
                const lengthDiff = mesSend.length - cfgPrompt.depth;
                const cfgDepth = lengthDiff >= 0 ? lengthDiff : 0;
                const cfgMessage = finalMesSend[cfgDepth];
                if (cfgMessage) {
                    if (!Array.isArray(finalMesSend[cfgDepth].extensionPrompts)) {
                        finalMesSend[cfgDepth].extensionPrompts = [];
                    }
                    finalMesSend[cfgDepth].extensionPrompts.push(`${cfgPrompt.value}\n`);
                }
            }
        }
    }

    if (!isInstruct && !isImpersonate && promptBias.trim().length !== 0) {
        finalMesSend[finalMesSend.length - 1].message +=
            /\s/.test(finalMesSend[finalMesSend.length - 1].message.slice(-1))
                ? promptBias.trimStart()
                : ` ${promptBias.trimStart()}`;
    }

    finalMesSend.forEach((item, i) => {
        item.injected = injectedIndices.includes(finalMesSend.length - i - 1);
    });

    let mesSendString = finalMesSend.map((e) => `${e.extensionPrompts.join('')}${e.message}`).join('');
    let data = {
        afterScenarioAnchor,
        api: main_api,
        beforeScenarioAnchor,
        char: name,
        combinedPrompt: null,
        description,
        finalMesSend,
        generatedPromptCache,
        jailbreak,
        main: system,
        mesExmString,
        mesSendString,
        naiPreamble,
        persona,
        personality,
        scenario,
        storyString,
        user,
        worldInfoAfter,
        worldInfoBefore,
    };

    await eventSource.emit(event_types.GENERATE_BEFORE_COMBINE_PROMPTS, data);

    if (!data.combinedPrompt) {
        mesSendString = finalMesSend.map((e) => `${e.extensionPrompts.join('')}${e.message}`).join('');
        mesSendString = addChatsSeparatorImpl(mesSendString);
        mesSendString = addChatsPreambleImpl(mesSendString);

        let combinedPrompt = [
            combinedStoryString,
            mesExmString,
            mesSendString,
            generatedPromptCache,
        ].join('').replace(/\r/gm, '');

        if (getCollapseNewlinesEnabledImpl()) {
            combinedPrompt = collapseNewlinesImpl(combinedPrompt);
        }

        data.combinedPrompt = combinedPrompt;
    }

    return {
        combinedPrompt: data.combinedPrompt,
        mesSendString,
    };
}

export async function prepareGenerationData({
    adjustedParams,
    cfgGuidanceScale,
    cyclePrompt,
    description,
    dryRun,
    extensionPrompts,
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
    quietPrompt,
    scenario,
    system,
    type,
    useCfgPrompt,
    worldInfoAfter,
    worldInfoBefore,
}) {
    if (!getKoboldGenerationDataImpl) {
        throwUnbound('getKoboldGenerationData');
    }
    if (!getKoboldSettingsConfigImpl) {
        throwUnbound('getKoboldSettingsConfig');
    }
    if (!getNovelGenerationDataImpl) {
        throwUnbound('getNovelGenerationData');
    }
    if (!getNovelSettingsConfigImpl) {
        throwUnbound('getNovelSettingsConfig');
    }
    if (!getTextGenGenerationDataImpl) {
        throwUnbound('getTextGenGenerationData');
    }
    if (!getHordeAdjustConfigImpl) {
        throwUnbound('getHordeAdjustConfig');
    }
    if (!getMinLengthImpl) {
        throwUnbound('getMinLength');
    }
    if (!prepareOpenAIMessagesImpl) {
        throwUnbound('prepareOpenAIMessages');
    }
    if (!getOpenAiMessagesCountImpl) {
        throwUnbound('getOpenAiMessagesCount');
    }

    let maxLength = Number(amount_gen);
    let generateData;
    let openAiCounts = null;
    let openAiMessageCount = 0;
    const hordeAdjustConfig = getHordeAdjustConfigImpl() ?? {};

    switch (main_api) {
        case 'koboldhorde':
        case 'kobold': {
            if (main_api === 'koboldhorde' && hordeAdjustConfig.autoAdjustResponseLength) {
                maxLength = Math.min(maxLength, adjustedParams.maxLength);
                maxLength = Math.max(maxLength, getMinLengthImpl());
            }

            const { kaiSettings, koboldaiSettings, koboldaiSettingNames } = getKoboldSettingsConfigImpl() ?? {};
            generateData = {
                prompt: finalPrompt,
                gui_settings: true,
                max_length: maxLength,
                max_context_length: max_context,
                api_server: kaiSettings.api_server,
            };

            if (kaiSettings.preset_settings !== 'gui') {
                const isHorde = main_api === 'koboldhorde';
                const presetSettings = koboldaiSettings[koboldaiSettingNames[kaiSettings.preset_settings]];
                const maxContext = (adjustedParams && hordeAdjustConfig.autoAdjustContextLength) ? adjustedParams.maxContextLength : max_context;
                generateData = getKoboldGenerationDataImpl(finalPrompt, presetSettings, maxLength, maxContext, isHorde, type);
            }
            break;
        }
        case 'textgenerationwebui': {
            const cfgValues = useCfgPrompt ? { guidanceScale: cfgGuidanceScale, negativePrompt } : null;
            generateData = await getTextGenGenerationDataImpl(finalPrompt, maxLength, isImpersonate, isContinue, cfgValues, type);
            break;
        }
        case 'novel': {
            const cfgValues = useCfgPrompt ? { guidanceScale: cfgGuidanceScale } : null;
            const { naiSettings, novelaiSettings, novelaiSettingNames } = getNovelSettingsConfigImpl() ?? {};
            const presetSettings = novelaiSettings[novelaiSettingNames[naiSettings.preset_settings_novel]];
            generateData = getNovelGenerationDataImpl(finalPrompt, presetSettings, maxLength, isImpersonate, isContinue, cfgValues, type);
            break;
        }
        case 'openai': {
            const [prompt, counts] = await prepareOpenAIMessagesImpl({
                name2,
                charDescription: description,
                charPersonality: personality,
                scenario,
                worldInfoBefore,
                worldInfoAfter,
                extensionPrompts,
                bias: promptBias,
                type,
                quietPrompt,
                quietImage,
                cyclePrompt,
                systemPromptOverride: system,
                jailbreakPromptOverride: jailbreak,
                messages: oaiMessages,
                messageExamples: oaiMessageExamples,
            }, dryRun);
            generateData = { prompt };
            openAiCounts = counts || null;
            openAiMessageCount = getOpenAiMessagesCountImpl();
            break;
        }
    }

    return {
        generateData,
        maxLength,
        openAiCounts,
        openAiMessageCount,
    };
}

export function prepareGenerationSuccessState({
    continuePrefix = '',
    data,
    isContinue,
    isImpersonate,
    quietToLoud,
    type,
}) {
    if (!extractTitleFromDataImpl) {
        throwUnbound('extractTitleFromData');
    }
    if (!extractReasoningFromDataImpl) {
        throwUnbound('extractReasoningFromData');
    }
    if (!extractImageFromDataImpl) {
        throwUnbound('extractImageFromData');
    }
    if (!extractMultiSwipesImpl) {
        throwUnbound('extractMultiSwipes');
    }
    if (!normalizeReasoningTextImpl) {
        throwUnbound('normalizeReasoningText');
    }
    if (!getTrimSpacesEnabledImpl) {
        throwUnbound('getTrimSpacesEnabled');
    }

    let getMessage = extractMessageFromData(data);
    const title = extractTitleFromDataImpl(data);
    let reasoning = extractReasoningFromDataImpl(data);
    const imageUrl = extractImageFromDataImpl(data);
    const swipes = extractMultiSwipesImpl(data, type);

    const messageChunk = cleanUpMessage({
        getMessage,
        isImpersonate,
        isContinue,
        displayIncompleteSentences: false,
    });

    reasoning = normalizeReasoningTextImpl(reasoning);
    if (getTrimSpacesEnabledImpl()) {
        reasoning = reasoning.trim();
    }

    if (isContinue) {
        getMessage = continuePrefix + getMessage;
    }

    const displayIncomplete = type === 'quiet' && !quietToLoud;
    getMessage = cleanUpMessage({
        getMessage,
        isImpersonate,
        isContinue,
        displayIncompleteSentences: displayIncomplete,
    });

    return {
        getMessage,
        imageUrl,
        messageChunk,
        reasoning,
        swipes,
        title,
    };
}

export function recordGenerationPromptMetadata({
    allAnchors,
    authorsNoteString = '',
    beforeScenarioAnchor = '',
    charDescription = '',
    charPersonality = '',
    chatInjects = '',
    chatVectorsString = '',
    dataBankVectorsString = '',
    examplesCount = 0,
    examplesString = '',
    finalPrompt = '',
    generatedPromptCache = '',
    instruction = '',
    itemizedPrompts,
    mainApi = '',
    mesId,
    mesSendString = '',
    messagesCount = 0,
    padding = 0,
    presetName = '',
    promptBias = '',
    promptBits = [],
    rawPrompt = '',
    scenarioText = '',
    smartContextString = '',
    storyString = '',
    summarizeString = '',
    thisMaxContext = 0,
    tokenizer = '',
    userPersona = '',
    worldInfoString = '',
}) {
    const currentArrayEntry = Number(promptBits.length - 1);
    const additionalPromptStuff = {
        ...promptBits[currentArrayEntry],
        allAnchors,
        authorsNoteString,
        beforeScenarioAnchor,
        charDescription,
        charPersonality,
        chatInjects,
        chatVectorsString,
        dataBankVectorsString,
        examplesCount,
        examplesString,
        finalPrompt,
        generatedPromptCache,
        instruction,
        main_api: mainApi,
        mesId,
        mesSendString,
        messagesCount,
        padding,
        presetName,
        promptBias,
        rawPrompt,
        scenarioText,
        smartContextString,
        storyString,
        summarizeString,
        this_max_context: thisMaxContext,
        tokenizer,
        userPersona,
        worldInfoString,
    };

    const itemizedIndex = itemizedPrompts.findIndex((item) => item.mesId === additionalPromptStuff.mesId);
    if (itemizedIndex !== -1) {
        itemizedPrompts[itemizedIndex] = additionalPromptStuff;
    } else {
        itemizedPrompts.push(additionalPromptStuff);
    }

    return additionalPromptStuff;
}

export async function executeStreamingGenerationRequest({
    continueMag,
    forceName2,
    generateData,
    generationStarted,
    isContinue,
    isImpersonate,
    promptReasoning,
    type,
}) {
    if (!createStreamingProcessorImpl) {
        throwUnbound('createStreamingProcessor');
    }
    if (!setStreamingProcessorImpl) {
        throwUnbound('setStreamingProcessor');
    }
    if (!sendStreamingRequestImpl) {
        throwUnbound('sendStreamingRequest');
    }
    if (!hideSwipeButtonsImpl) {
        throwUnbound('hideSwipeButtons');
    }

    const processor = createStreamingProcessorImpl(type, forceName2, generationStarted, continueMag, promptReasoning);
    setStreamingProcessorImpl(processor);

    if (isContinue) {
        processor.firstMessageText = '';
    }

    processor.generator = await sendStreamingRequestImpl(type, generateData);

    hideSwipeButtonsImpl();
    let getMessage = await processor.generate();
    const messageChunk = cleanUpMessage({
        getMessage,
        isImpersonate,
        isContinue,
        displayIncompleteSentences: false,
    });

    if (isContinue) {
        getMessage = continueMag + getMessage;
    }

    return {
        getMessage,
        isStreamFinished: processor && !processor.isStopped && processor.isFinished,
        isStreamWithToolCalls: processor && Array.isArray(processor.toolCalls) && processor.toolCalls.length,
        messageChunk,
    };
}

export async function finalizeStreamingGeneration({
    canPerformToolCalls,
    deleteLastMessage,
    dryRun,
    generateOptions,
    getMessage,
    isImpersonate,
    messageChunk,
    type,
}) {
    if (!setStreamingProcessorImpl) {
        throwUnbound('setStreamingProcessor');
    }
    if (!hasToolCallsImpl) {
        throwUnbound('hasToolCalls');
    }
    if (!invokeFunctionToolsImpl) {
        throwUnbound('invokeFunctionTools');
    }
    if (!showToolCallErrorImpl) {
        throwUnbound('showToolCallError');
    }
    if (!triggerAutoContinueImpl) {
        throwUnbound('triggerAutoContinue');
    }

    const processor = streamingProcessor;
    const isStreamFinished = processor && !processor.isStopped && processor.isFinished;
    const isStreamWithToolCalls = processor && Array.isArray(processor.toolCalls) && processor.toolCalls.length;

    if (canPerformToolCalls && isStreamFinished && isStreamWithToolCalls) {
        const lastMessage = chat[chat.length - 1];
        const hasToolCalls = hasToolCallsImpl(processor.toolCalls);
        const shouldDeleteMessage = type !== 'swipe'
            && ['', '...'].includes(lastMessage?.mes)
            && !lastMessage?.extra?.reasoning
            && ['', '...'].includes(processor?.result);

        if (hasToolCalls && shouldDeleteMessage) {
            await deleteLastMessage();
        }

        const invocationResult = await invokeFunctionToolsImpl(processor.toolCalls);
        const shouldStopGeneration = (!invocationResult.invocations.length && shouldDeleteMessage) || invocationResult.stealthCalls.length;

        if (hasToolCalls) {
            if (shouldStopGeneration) {
                if (Array.isArray(invocationResult.errors) && invocationResult.errors.length) {
                    showToolCallErrorImpl(invocationResult.errors);
                }

                setStreamingProcessorImpl(null);
                return {
                    status: 'stop',
                };
            }

            setStreamingProcessorImpl(null);
            return {
                generateOptions,
                invocationResult,
                status: 'recurse',
            };
        }
    }

    if (isStreamFinished) {
        await processor.onFinishStreaming(processor.messageId, getMessage);
        setStreamingProcessorImpl(null);
        triggerAutoContinueImpl(messageChunk, isImpersonate);
        return {
            status: 'complete',
            value: Object.defineProperties(new String(getMessage), {
                'messageChunk': { value: messageChunk },
                'fromStream': { value: true },
            }),
        };
    }

    return {
        status: 'pending',
    };
}

export async function executeGenerationRequestFlow({
    arrMes,
    beforeScenarioAnchor,
    canPerformToolCalls,
    continueMag,
    countExmAdd,
    deleteLastMessage,
    description,
    finalPrompt,
    generateData,
    generateOptions,
    generatedPromptCache,
    generationStarted,
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
    promptBits,
    promptReasoning,
    quietToLoud,
    scenario,
    storyString,
    system,
    thisMaxContext,
    type,
    worldInfoString,
}) {
    if (!getConsoleLogPromptsEnabledImpl) {
        throwUnbound('getConsoleLogPromptsEnabled');
    }
    if (!showStopButtonImpl) {
        throwUnbound('showStopButton');
    }
    if (!getAllExtensionPromptsImpl) {
        throwUnbound('getAllExtensionPrompts');
    }
    if (!getPromptMetadataExtrasImpl) {
        throwUnbound('getPromptMetadataExtras');
    }
    if (!getInstructionPromptImpl) {
        throwUnbound('getInstructionPrompt');
    }
    if (!getSelectedPresetNameImpl) {
        throwUnbound('getSelectedPresetName');
    }
    if (!getTokenizerNameImpl) {
        throwUnbound('getTokenizerName');
    }
    if (!shouldIncludePersonaInStoryStringImpl) {
        throwUnbound('shouldIncludePersonaInStoryString');
    }
    if (!isStreamingEnabledImpl) {
        throwUnbound('isStreamingEnabled');
    }
    if (!sendGenerationRequestImpl) {
        throwUnbound('sendGenerationRequest');
    }
    if (!unblockGenerationImpl) {
        throwUnbound('unblockGeneration');
    }

    if (getConsoleLogPromptsEnabledImpl()) {
        console.log(generateData.prompt);
    }

    console.debug('rungenerate calling API');
    showStopButtonImpl();

    const promptMetadataExtras = getPromptMetadataExtrasImpl() ?? {};
    recordGenerationPromptMetadata({
        allAnchors: await getAllExtensionPromptsImpl(),
        authorsNoteString: promptMetadataExtras.authorsNoteString ?? '',
        beforeScenarioAnchor,
        charDescription: description,
        charPersonality: personality,
        chatInjects: injectedIndices?.map((index) => arrMes[arrMes.length - index - 1])?.join('') || '',
        chatVectorsString: promptMetadataExtras.chatVectorsString ?? '',
        dataBankVectorsString: promptMetadataExtras.dataBankVectorsString ?? '',
        examplesCount: main_api !== 'openai' ? (pinExmString ? mesExamplesArray.length : countExmAdd) : oaiMessageExamples.length,
        examplesString: mesExmString,
        finalPrompt,
        generatedPromptCache,
        instruction: getInstructionPromptImpl(system),
        itemizedPrompts: generateOptions.itemizedPrompts,
        mainApi: main_api,
        mesId: getNextMessageId(type),
        mesSendString,
        messagesCount: main_api !== 'openai' ? mesSend.length : oaiMessages.length,
        padding: generateOptions.tokenPadding,
        presetName: getSelectedPresetNameImpl() || '',
        promptBias,
        promptBits,
        rawPrompt: generateData.prompt || generateData.input,
        scenarioText: scenario,
        smartContextString: promptMetadataExtras.smartContextString ?? '',
        storyString,
        summarizeString: promptMetadataExtras.summarizeString ?? '',
        thisMaxContext,
        tokenizer: getTokenizerNameImpl() || '',
        userPersona: shouldIncludePersonaInStoryStringImpl() ? (persona || '') : '',
        worldInfoString,
    });

    console.debug(`pushed prompt bits to itemizedPrompts array. Length is now: ${generateOptions.itemizedPrompts.length}`);

    if (isStreamingEnabledImpl() && type !== 'quiet') {
        const { getMessage, messageChunk } = await executeStreamingGenerationRequest({
            continueMag,
            forceName2: generateOptions.force_name2,
            generateData,
            generationStarted,
            isContinue,
            isImpersonate,
            promptReasoning,
            type,
        });

        const streamResult = await finalizeStreamingGeneration({
            canPerformToolCalls,
            deleteLastMessage,
            dryRun: false,
            generateOptions,
            getMessage,
            isImpersonate,
            messageChunk,
            type,
        });

        if (streamResult.status === 'stop') {
            unblockGenerationImpl(type);
            return {
                status: 'complete',
                value: undefined,
            };
        }

        if (streamResult.status !== 'complete') {
            return streamResult;
        }

        return streamResult;
    }

    const data = await sendGenerationRequestImpl(type, generateData, { jsonSchema });
    const result = await finalizeGenerationResponse({
        canPerformToolCalls,
        continueMag,
        data,
        deleteLastMessage,
        generateOptions,
        isContinue,
        isImpersonate,
        jsonSchema,
        originalType,
        quietToLoud,
        type,
    });

    if (result.status === 'stop') {
        return {
            status: 'complete',
            value: undefined,
        };
    }

    return result;
}

export async function finalizeGenerationResponse({
    canPerformToolCalls,
    continueMag,
    data,
    deleteLastMessage,
    generateOptions,
    isContinue,
    isImpersonate,
    jsonSchema,
    originalType,
    quietToLoud,
    type,
}) {
    if (!unblockGenerationImpl) {
        throwUnbound('unblockGeneration');
    }
    if (!showApiErrorImpl) {
        throwUnbound('showApiError');
    }
    if (!setGeneratedTitleImpl) {
        throwUnbound('setGeneratedTitle');
    }
    if (!setImpersonationTextImpl) {
        throwUnbound('setImpersonationText');
    }
    if (!emitImpersonateReadyImpl) {
        throwUnbound('emitImpersonateReady');
    }
    if (!saveReplyImpl) {
        throwUnbound('saveReply');
    }
    if (!parseAndSaveLogprobsImpl) {
        throwUnbound('parseAndSaveLogprobs');
    }
    if (!setSendButtonStateImpl) {
        throwUnbound('setSendButtonState');
    }
    if (!saveChatConditionalImpl) {
        throwUnbound('saveChatConditional');
    }
    if (!setStreamingProcessorImpl) {
        throwUnbound('setStreamingProcessor');
    }
    if (!triggerAutoContinueImpl) {
        throwUnbound('triggerAutoContinue');
    }
    if (!playMessageSoundImpl) {
        throwUnbound('playMessageSound');
    }
    if (!shouldAutoSwipeResultImpl) {
        throwUnbound('shouldAutoSwipeResult');
    }
    if (!swipeRightImpl) {
        throwUnbound('swipeRight');
    }
    if (!hasToolCallsImpl) {
        throwUnbound('hasToolCalls');
    }
    if (!invokeFunctionToolsImpl) {
        throwUnbound('invokeFunctionTools');
    }
    if (!showToolCallErrorImpl) {
        throwUnbound('showToolCallError');
    }

    if (!data) {
        return {
            status: 'complete',
            value: undefined,
        };
    }

    if (data?.fromStream) {
        return {
            status: 'complete',
            value: data,
        };
    }

    if (data.error) {
        unblockGenerationImpl(type);
        if (data?.response) {
            showApiErrorImpl(data.response);
        }
        throw new Error(data?.response);
    }

    if (jsonSchema) {
        unblockGenerationImpl(type);
        return {
            status: 'complete',
            value: extractJsonFromData(data),
        };
    }

    let {
        getMessage,
        title,
        reasoning,
        imageUrl,
        swipes,
        messageChunk,
    } = prepareGenerationSuccessState({
        continuePrefix: continueMag,
        data,
        isContinue,
        isImpersonate,
        quietToLoud,
        type,
    });
    setGeneratedTitleImpl(title);

    if (isImpersonate) {
        setImpersonationTextImpl(getMessage);
        await emitImpersonateReadyImpl(getMessage);
    } else if (type === 'quiet') {
        unblockGenerationImpl(type);
        return {
            status: 'complete',
            value: getMessage,
        };
    } else if (originalType !== 'continue') {
        ({ type, getMessage } = await saveReplyImpl({ type, getMessage, title, swipes, reasoning, imageUrl }));
        parseAndSaveLogprobsImpl(data, continueMag);
    } else {
        ({ type, getMessage } = await saveReplyImpl({ type: 'appendFinal', getMessage, title, swipes, reasoning, imageUrl }));
        parseAndSaveLogprobsImpl(data, continueMag);
    }

    if (canPerformToolCalls) {
        const hasToolCalls = hasToolCallsImpl(data);
        const shouldDeleteMessage = type !== 'swipe' && ['', '...'].includes(getMessage) && !reasoning;
        if (hasToolCalls && shouldDeleteMessage) {
            await deleteLastMessage();
        }

        const invocationResult = await invokeFunctionToolsImpl(data);
        const shouldStopGeneration = (!invocationResult.invocations.length && shouldDeleteMessage) || invocationResult.stealthCalls.length;
        if (hasToolCalls) {
            if (shouldStopGeneration) {
                if (Array.isArray(invocationResult.errors) && invocationResult.errors.length) {
                    showToolCallErrorImpl(invocationResult.errors);
                }

                unblockGenerationImpl(type);
                return {
                    status: 'stop',
                };
            }

            return {
                generateOptions,
                invocationResult,
                status: 'recurse',
            };
        }
    }

    if (type !== 'quiet') {
        playMessageSoundImpl();
    }

    if (shouldAutoSwipeResultImpl(getMessage)) {
        setSendButtonStateImpl(false);
        return {
            status: 'complete',
            value: await swipeRightImpl(),
        };
    }

    await saveChatConditionalImpl();
    unblockGenerationImpl(type);
    setStreamingProcessorImpl(null);

    if (type !== 'quiet') {
        triggerAutoContinueImpl(messageChunk, isImpersonate);
    }

    return {
        status: 'complete',
        value: Object.defineProperty(new String(getMessage), 'messageChunk', { value: messageChunk }),
    };
}

export function handleGenerationError({ exception, type }) {
    if (!showTextGenerationErrorImpl) {
        throwUnbound('showTextGenerationError');
    }
    if (!unblockGenerationImpl) {
        throwUnbound('unblockGeneration');
    }
    if (!setStreamingProcessorImpl) {
        throwUnbound('setStreamingProcessor');
    }

    if (typeof exception?.error?.message === 'string') {
        showTextGenerationErrorImpl(exception.error.message);
    }

    unblockGenerationImpl(type);
    console.log(exception);
    setStreamingProcessorImpl(null);
    throw exception;
}

export function isStreamingEnabled(...args) {
    if (!isStreamingEnabledImpl) {
        throwUnbound('isStreamingEnabled');
    }

    return isStreamingEnabledImpl(...args);
}

export async function generateRaw({ prompt = '', api = null, instructOverride = false, quietToLoud = false, systemPrompt = '', responseLength = null, trimNames = true, prefill = '', jsonSchema = null } = {}) {
    if (!createRawPromptImpl) {
        throwUnbound('createRawPrompt');
    }
    if (!getKoboldGenerationDataImpl) {
        throwUnbound('getKoboldGenerationData');
    }
    if (!getKoboldSettingsConfigImpl) {
        throwUnbound('getKoboldSettingsConfig');
    }
    if (!getNovelGenerationDataImpl) {
        throwUnbound('getNovelGenerationData');
    }
    if (!getNovelSettingsConfigImpl) {
        throwUnbound('getNovelSettingsConfig');
    }
    if (!getTextGenGenerationDataImpl) {
        throwUnbound('getTextGenGenerationData');
    }
    if (!sendOpenAIRequestImpl) {
        throwUnbound('sendOpenAIRequest');
    }
    if (!generateHordeImpl) {
        throwUnbound('generateHorde');
    }
    if (arguments.length > 0 && typeof arguments[0] !== 'object') {
        console.trace('generateRaw called with positional arguments. Please use an object instead.');
        [prompt, api, instructOverride, quietToLoud, systemPrompt, responseLength, trimNames, prefill, jsonSchema] = arguments;
    }

    if (!api) {
        api = main_api;
    }

    const abortController = new AbortController();
    const responseLengthCustomized = typeof responseLength === 'number' && responseLength > 0;
    let eventHook = () => { };

    prompt = createRawPromptImpl(prompt, api, instructOverride, quietToLoud, systemPrompt, prefill);

    try {
        if (responseLengthCustomized) {
            TempResponseLength.save(api, responseLength);
        }
        let generateData = {};

        switch (api) {
            case 'kobold':
            case 'koboldhorde': {
                const { kaiSettings, kaiFlags, koboldaiSettings, koboldaiSettingNames } = getKoboldSettingsConfigImpl() ?? {};
                if (kaiSettings.preset_settings === 'gui') {
                    generateData = { prompt: prompt, gui_settings: true, max_length: amount_gen, max_context_length: max_context, api_server: kaiSettings.api_server };
                } else {
                    const isHorde = api === 'koboldhorde';
                    const koboldSettings = koboldaiSettings[koboldaiSettingNames[kaiSettings.preset_settings]];
                    generateData = getKoboldGenerationDataImpl(prompt.toString(), koboldSettings, amount_gen, max_context, isHorde, 'quiet');
                }
                TempResponseLength.restore(api);
                break;
            }
            case 'novel': {
                const { naiSettings, novelaiSettings, novelaiSettingNames } = getNovelSettingsConfigImpl() ?? {};
                const novelSettings = novelaiSettings[novelaiSettingNames[naiSettings.preset_settings_novel]];
                generateData = getNovelGenerationDataImpl(prompt, novelSettings, amount_gen, false, false, null, 'quiet');
                TempResponseLength.restore(api);
                break;
            }
            case 'textgenerationwebui':
                generateData = await getTextGenGenerationDataImpl(prompt, amount_gen, false, false, null, 'quiet');
                TempResponseLength.restore(api);
                break;
            case 'openai':
                generateData = prompt;
                eventHook = TempResponseLength.setupEventHook(api);
                break;
        }

        let data = {};

        if (api === 'koboldhorde') {
            data = await generateHordeImpl(prompt.toString(), generateData, abortController.signal, false);
        } else if (api === 'openai') {
            data = await sendOpenAIRequestImpl('quiet', generateData, abortController.signal, { jsonSchema });
        } else {
            const generateUrl = getGenerateUrl(api);
            const response = await fetch(generateUrl, {
                method: 'POST',
                headers: getRequestHeaders(),
                cache: 'no-cache',
                body: JSON.stringify(generateData),
                signal: abortController.signal,
            });

            if (!response.ok) {
                throw await response.json();
            }

            data = await response.json();
        }

        if (data.error) {
            throw new Error(data.response);
        }

        if (jsonSchema) {
            return extractJsonFromData(data, { mainApi: api });
        }

        const message = cleanUpMessage({
            getMessage: extractMessageFromData(data),
            isImpersonate: false,
            isContinue: false,
            displayIncompleteSentences: true,
            includeUserPromptBias: false,
            trimNames: trimNames,
            trimWrongNames: trimNames,
        });

        if (!message) {
            throw new Error('No message generated');
        }

        return message;
    } finally {
        if (responseLengthCustomized && TempResponseLength.isCustomized()) {
            TempResponseLength.restore(api);
            TempResponseLength.removeEventHook(api, eventHook);
        }
    }
}

export function sendGenerationRequest(...args) {
    if (!sendGenerationRequestImpl) {
        throwUnbound('sendGenerationRequest');
    }

    return sendGenerationRequestImpl(...args);
}

export function sendStreamingRequest(...args) {
    if (!sendStreamingRequestImpl) {
        throwUnbound('sendStreamingRequest');
    }

    return sendStreamingRequestImpl(...args);
}

export function setGenerationParamsFromPreset(...args) {
    if (!setGenerationParamsFromPresetImpl) {
        throwUnbound('setGenerationParamsFromPreset');
    }

    return setGenerationParamsFromPresetImpl(...args);
}

export function setGenerationProgress(...args) {
    if (!setGenerationProgressImpl) {
        throwUnbound('setGenerationProgress');
    }

    return setGenerationProgressImpl(...args);
}

export function getNextMessageId(type) {
    return type == 'swipe' ? chat.length - 1 : chat.length;
}

export function shouldAutoContinue(messageChunk, isImpersonate) {
    if (!getAutoContinueConfigImpl) {
        throwUnbound('getAutoContinueConfig');
    }
    if (!getAbortControllerImpl) {
        throwUnbound('getAbortController');
    }
    if (!getGeneratingApiConfigImpl) {
        throwUnbound('getGeneratingApiConfig');
    }
    if (!getTextareaTextImpl) {
        throwUnbound('getTextareaText');
    }
    if (!getTokenCountImpl) {
        throwUnbound('getTokenCount');
    }

    const autoContinue = getAutoContinueConfigImpl() ?? {};
    if (!autoContinue.enabled) {
        console.debug('Auto-continue is disabled by user.');
        return false;
    }

    if (typeof messageChunk !== 'string') {
        console.debug('Not triggering auto-continue because message chunk is not a string');
        return false;
    }

    if (isImpersonate) {
        console.log('Continue for impersonation is not implemented yet');
        return false;
    }

    const abortController = getAbortControllerImpl();
    if (abortController && abortController.signal.aborted) {
        console.debug('Auto-continue is not triggered because the generation was stopped.');
        return false;
    }

    if (autoContinue.target_length <= 0) {
        console.log('Auto-continue target length is 0, not triggering auto-continue');
        return false;
    }

    const { mainApi } = getGeneratingApiConfigImpl() ?? {};
    if (mainApi === 'openai' && !autoContinue.allow_chat_completions) {
        console.log('Auto-continue for OpenAI is disabled by user.');
        return false;
    }

    const textareaText = String(getTextareaTextImpl());
    const USABLE_LENGTH = 5;
    if (textareaText.length > 0) {
        console.log('Not triggering auto-continue because user input is not empty');
        return false;
    }

    if (messageChunk.trim().length > USABLE_LENGTH && chat.length) {
        const lastMessage = chat[chat.length - 1];
        const messageLength = getTokenCountImpl(lastMessage.mes);
        const shouldContinue = messageLength < autoContinue.target_length;
        if (shouldContinue) {
            console.log(`Triggering auto-continue. Message tokens: ${messageLength}. Target tokens: ${autoContinue.target_length}. Message chunk: ${messageChunk}`);
            return true;
        }
        console.log(`Not triggering auto-continue. Message tokens: ${messageLength}. Target tokens: ${autoContinue.target_length}`);
        return false;
    }

    console.log('Last generated chunk was empty, not triggering auto-continue');
    return false;
}

export function triggerAutoContinue(messageChunk, isImpersonate) {
    if (!getSelectedGroupImpl) {
        throwUnbound('getSelectedGroup');
    }
    if (!triggerContinueImpl) {
        throwUnbound('triggerContinue');
    }

    if (getSelectedGroupImpl()) {
        console.debug('Auto-continue is disabled for group chat');
        return;
    }

    if (shouldAutoContinue(messageChunk, isImpersonate)) {
        triggerContinueImpl();
    }
}

export function stopGeneration() {
    if (!getAbortControllerImpl) {
        throwUnbound('getAbortController');
    }
    if (!hideStopButtonImpl) {
        throwUnbound('hideStopButton');
    }

    let stopped = false;
    if (streamingProcessor) {
        streamingProcessor.onStopStreaming();
        stopped = true;
    }

    const abortController = getAbortControllerImpl();
    if (abortController) {
        abortController.abort('Clicked stop button');
        hideStopButtonImpl();
        stopped = true;
    }

    return stopped;
}
