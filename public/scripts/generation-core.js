import { chat } from './chat-operations-core.js';

let generateImpl = null;
let generateRawImpl = null;
let generateQuietPromptImpl = null;
let getGenerateUrlImpl = null;
let getAbortControllerImpl = null;
let getAutoContinueConfigImpl = null;
let getGeneratingApiConfigImpl = null;
let getStoppingStringsImpl = null;
let getTextareaTextImpl = null;
let getTokenCountImpl = null;
let getSelectedGroupImpl = null;
let hideStopButtonImpl = null;
let isStreamingEnabledImpl = null;
let sendGenerationRequestImpl = null;
let sendStreamingRequestImpl = null;
let setGenerationParamsFromPresetImpl = null;
let setGenerationProgressImpl = null;
let triggerContinueImpl = null;

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
 *   generateRaw: (...args: any[]) => Promise<any>,
 *   generateQuietPrompt: (...args: any[]) => Promise<any>,
 *   getAbortController: () => AbortController|null|undefined,
 *   getAutoContinueConfig: () => { enabled?: boolean, target_length?: number, allow_chat_completions?: boolean },
 *   getGenerateUrl: (...args: any[]) => string,
 *   getGeneratingApiConfig: () => { mainApi?: string, openAiSource?: string, textgenType?: string, textgenOobaType?: string },
 *   getStoppingStrings: (...args: any[]) => string[],
 *   getTextareaText: () => string,
 *   getTokenCount: (text: string) => number,
 *   getSelectedGroup: () => string|null|undefined,
 *   hideStopButton: () => any,
 *   isStreamingEnabled: (...args: any[]) => boolean,
 *   sendGenerationRequest: (...args: any[]) => Promise<any>,
 *   sendStreamingRequest: (...args: any[]) => Promise<any>,
 *   setGenerationParamsFromPreset: (...args: any[]) => void,
 *   setGenerationProgress: (...args: any[]) => void,
 *   triggerContinue: () => any,
 * }} impl Implementations to bind
 */
export function bindGenerationCore(impl) {
    generateImpl = impl?.Generate ?? null;
    generateRawImpl = impl?.generateRaw ?? null;
    generateQuietPromptImpl = impl?.generateQuietPrompt ?? null;
    getAbortControllerImpl = impl?.getAbortController ?? null;
    getAutoContinueConfigImpl = impl?.getAutoContinueConfig ?? null;
    getGenerateUrlImpl = impl?.getGenerateUrl ?? null;
    getGeneratingApiConfigImpl = impl?.getGeneratingApiConfig ?? null;
    getStoppingStringsImpl = impl?.getStoppingStrings ?? null;
    getTextareaTextImpl = impl?.getTextareaText ?? null;
    getTokenCountImpl = impl?.getTokenCount ?? null;
    getSelectedGroupImpl = impl?.getSelectedGroup ?? null;
    hideStopButtonImpl = impl?.hideStopButton ?? null;
    isStreamingEnabledImpl = impl?.isStreamingEnabled ?? null;
    sendGenerationRequestImpl = impl?.sendGenerationRequest ?? null;
    sendStreamingRequestImpl = impl?.sendStreamingRequest ?? null;
    setGenerationParamsFromPresetImpl = impl?.setGenerationParamsFromPreset ?? null;
    setGenerationProgressImpl = impl?.setGenerationProgress ?? null;
    triggerContinueImpl = impl?.triggerContinue ?? null;
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

export function generateRaw(...args) {
    if (!generateRawImpl) {
        throwUnbound('generateRaw');
    }

    return generateRawImpl(...args);
}

export function generateQuietPrompt(...args) {
    if (!generateQuietPromptImpl) {
        throwUnbound('generateQuietPrompt');
    }

    return generateQuietPromptImpl(...args);
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
    if (!getStoppingStringsImpl) {
        throwUnbound('getStoppingStrings');
    }

    return getStoppingStringsImpl(...args);
}

export function isStreamingEnabled(...args) {
    if (!isStreamingEnabledImpl) {
        throwUnbound('isStreamingEnabled');
    }

    return isStreamingEnabledImpl(...args);
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
