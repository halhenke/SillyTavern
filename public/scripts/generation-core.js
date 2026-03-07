import { main_api } from './api-core.js';
import { characters } from './character-core.js';
import { name1, name2, this_chid } from './chat-core.js';
import { event_types, eventSource } from './events.js';
import { cleanUpMessage } from './message-core.js';
import { getRequestHeaders } from './network-core.js';
import { baseChatReplace, extractJsonFromData, extractMessageFromData, getBiasStrings, removeMacros, substituteParams } from './parser-core.js';
import { chat } from './chat-operations-core.js';

let generateImpl = null;
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
let getAutoContinueConfigImpl = null;
let getCustomStoppingStringsImpl = null;
let getGeneratingApiConfigImpl = null;
let getGenericSystemMessageTypeImpl = null;
let getCharacterCardFieldsImpl = null;
let getCfgPromptImpl = null;
let getDepthPromptIdImpl = null;
let getDepthPromptIndexIdImpl = null;
let getExtensionPromptRoleByNameImpl = null;
let getInChatPromptTypeImpl = null;
let getInstructStoppingSequencesImpl = null;
let getGuidanceScaleImpl = null;
let getHordeAdjustConfigImpl = null;
let getNamesAsStopStringsImpl = null;
let getOaiSendIfEmptyImpl = null;
let getSyspromptConfigImpl = null;
let getTextareaTextImpl = null;
let getTokenCountImpl = null;
let getTokenCountAsyncImpl = null;
let getTextGenGenerationDataImpl = null;
let executeSlashCommandsOnChatInputImpl = null;
let getSelectedGroupImpl = null;
let getMaxContextSizeImpl = null;
let hasPendingFileAttachmentImpl = null;
let hideStopButtonImpl = null;
let isStreamingEnabledImpl = null;
let removeDepthPromptsImpl = null;
let removeReasoningFromStringImpl = null;
let deactivateSendButtonsImpl = null;
let getGroupDepthPromptsImpl = null;
let getAllowWIScanImpl = null;
let sendMessageAsUserImpl = null;
let sendGenerationRequestImpl = null;
let sendOpenAIRequestImpl = null;
let sendSystemMessageImpl = null;
let sendStreamingRequestImpl = null;
let setExtensionPromptImpl = null;
let setOpenAiMaxTokensImpl = null;
let setGenerationParamsFromPresetImpl = null;
let setGenerationProgressImpl = null;
let setSendButtonStateImpl = null;
let trimToEndSentenceImpl = null;
let triggerContinueImpl = null;
let adjustHordeGenerationParamsImpl = null;
let runGenerationInterceptorsImpl = null;

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
 *   createRawPrompt: (...args: any[]) => string|object[],
 *   generateHorde: (...args: any[]) => Promise<any>,
 *   adjustHordeGenerationParams: (...args: any[]) => Promise<any>,
 *   executeSlashCommandsOnChatInput: (...args: any[]) => Promise<any>,
 *   getAnimationDuration: () => number,
 *   getCfgPrompt: (...args: any[]) => any,
 *   getCustomStoppingStrings: () => string[],
 *   getCharacterCardFields: (...args: any[]) => any,
 *   getDepthPromptId: () => any,
 *   getDepthPromptIndexId: (index: number) => any,
 *   getExtensionPromptRoleByName: (...args: any[]) => any,
 *   getInChatPromptType: () => number,
 *   getGenericSystemMessageType: () => any,
 *   getKoboldGenerationData: (...args: any[]) => any,
 *   getKoboldSettingsConfig: () => { kaiSettings?: any, kaiFlags?: any, koboldaiSettings?: any, koboldaiSettingNames?: any },
 *   getAbortController: () => AbortController|null|undefined,
 *   getAutoContinueConfig: () => { enabled?: boolean, target_length?: number, allow_chat_completions?: boolean },
 *   getGenerateUrl: (...args: any[]) => string,
 *   getGroups: () => any[],
 *   getGuidanceScale: () => any,
 *   getHordeAdjustConfig: () => { autoAdjustContextLength?: boolean, autoAdjustResponseLength?: boolean },
 *   getInstructStoppingSequences: () => string[],
 *   getMaxContextSize: () => number,
 *   getNamesAsStopStrings: () => boolean,
 *   getOaiSendIfEmpty: () => string,
 *   getSyspromptConfig: () => { enabled?: boolean, preferCharacterPrompt?: boolean, content?: string },
 *   getNovelGenerationData: (...args: any[]) => any,
 *   getNovelSettingsConfig: () => { naiSettings?: any, novelaiSettings?: any, novelaiSettingNames?: any },
 *   getOpenAiMaxTokens: () => number,
 *   getGeneratingApiConfig: () => { mainApi?: string, openAiSource?: string, textgenType?: string, textgenOobaType?: string },
 *   getTextareaText: () => string,
 *   getTokenCount: (text: string) => number,
 *   getTokenCountAsync: (...args: any[]) => Promise<number>,
 *   getTextGenGenerationData: (...args: any[]) => Promise<any>,
 *   getSelectedGroup: () => string|null|undefined,
 *   hasPendingFileAttachment: () => boolean,
 *   hideStopButton: () => any,
 *   isStreamingEnabled: (...args: any[]) => boolean,
 *   removeDepthPrompts: (...args: any[]) => any,
 *   removeReasoningFromString: (...args: any[]) => string,
 *   deactivateSendButtons: () => any,
 *   getGroupDepthPrompts: (...args: any[]) => any[],
 *   getAllowWIScan: () => boolean,
 *   sendMessageAsUser: (...args: any[]) => Promise<any>,
 *   sendGenerationRequest: (...args: any[]) => Promise<any>,
 *   sendOpenAIRequest: (...args: any[]) => Promise<any>,
 *   sendSystemMessage: (...args: any[]) => any,
 *   sendStreamingRequest: (...args: any[]) => Promise<any>,
  *   setExtensionPrompt: (...args: any[]) => any,
 *   setOpenAiMaxTokens: (value: number) => any,
 *   setGenerationParamsFromPreset: (...args: any[]) => void,
 *   setGenerationProgress: (...args: any[]) => void,
 *   setSendButtonState: (...args: any[]) => any,
 *   trimToEndSentence: (...args: any[]) => string,
 *   triggerContinue: () => any,
 *   runGenerationInterceptors: (...args: any[]) => Promise<boolean>,
 * }} impl Implementations to bind
 */
export function bindGenerationCore(impl) {
    adjustHordeGenerationParamsImpl = impl?.adjustHordeGenerationParams ?? null;
    generateImpl = impl?.Generate ?? null;
    createRawPromptImpl = impl?.createRawPrompt ?? null;
    generateHordeImpl = impl?.generateHorde ?? null;
    executeSlashCommandsOnChatInputImpl = impl?.executeSlashCommandsOnChatInput ?? null;
    deactivateSendButtonsImpl = impl?.deactivateSendButtons ?? null;
    getAnimationDurationImpl = impl?.getAnimationDuration ?? null;
    getAllowWIScanImpl = impl?.getAllowWIScan ?? null;
    getCharacterCardFieldsImpl = impl?.getCharacterCardFields ?? null;
    getCfgPromptImpl = impl?.getCfgPrompt ?? null;
    getCustomStoppingStringsImpl = impl?.getCustomStoppingStrings ?? null;
    getDepthPromptIdImpl = impl?.getDepthPromptId ?? null;
    getDepthPromptIndexIdImpl = impl?.getDepthPromptIndexId ?? null;
    getExtensionPromptRoleByNameImpl = impl?.getExtensionPromptRoleByName ?? null;
    getInChatPromptTypeImpl = impl?.getInChatPromptType ?? null;
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
    getInstructStoppingSequencesImpl = impl?.getInstructStoppingSequences ?? null;
    getMaxContextSizeImpl = impl?.getMaxContextSize ?? null;
    getNamesAsStopStringsImpl = impl?.getNamesAsStopStrings ?? null;
    getOaiSendIfEmptyImpl = impl?.getOaiSendIfEmpty ?? null;
    getSyspromptConfigImpl = impl?.getSyspromptConfig ?? null;
    getNovelGenerationDataImpl = impl?.getNovelGenerationData ?? null;
    getNovelSettingsConfigImpl = impl?.getNovelSettingsConfig ?? null;
    getOpenAiMaxTokensImpl = impl?.getOpenAiMaxTokens ?? null;
    getGeneratingApiConfigImpl = impl?.getGeneratingApiConfig ?? null;
    getTextareaTextImpl = impl?.getTextareaText ?? null;
    getTokenCountImpl = impl?.getTokenCount ?? null;
    getTokenCountAsyncImpl = impl?.getTokenCountAsync ?? null;
    getTextGenGenerationDataImpl = impl?.getTextGenGenerationData ?? null;
    getSelectedGroupImpl = impl?.getSelectedGroup ?? null;
    hasPendingFileAttachmentImpl = impl?.hasPendingFileAttachment ?? null;
    hideStopButtonImpl = impl?.hideStopButton ?? null;
    isStreamingEnabledImpl = impl?.isStreamingEnabled ?? null;
    removeDepthPromptsImpl = impl?.removeDepthPrompts ?? null;
    removeReasoningFromStringImpl = impl?.removeReasoningFromString ?? null;
    sendMessageAsUserImpl = impl?.sendMessageAsUser ?? null;
    sendGenerationRequestImpl = impl?.sendGenerationRequest ?? null;
    sendOpenAIRequestImpl = impl?.sendOpenAIRequest ?? null;
    sendSystemMessageImpl = impl?.sendSystemMessage ?? null;
    sendStreamingRequestImpl = impl?.sendStreamingRequest ?? null;
    setExtensionPromptImpl = impl?.setExtensionPrompt ?? null;
    setOpenAiMaxTokensImpl = impl?.setOpenAiMaxTokens ?? null;
    setGenerationParamsFromPresetImpl = impl?.setGenerationParamsFromPreset ?? null;
    setGenerationProgressImpl = impl?.setGenerationProgress ?? null;
    setSendButtonStateImpl = impl?.setSendButtonState ?? null;
    trimToEndSentenceImpl = impl?.trimToEndSentence ?? null;
    triggerContinueImpl = impl?.triggerContinue ?? null;
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

class TempResponseLength {
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
        thisMaxContext,
    };
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
