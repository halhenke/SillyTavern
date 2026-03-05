let generateImpl = null;
let generateRawImpl = null;
let generateQuietPromptImpl = null;
let getGenerateUrlImpl = null;
let getGeneratingApiImpl = null;
let getStoppingStringsImpl = null;
let isStreamingEnabledImpl = null;
let sendGenerationRequestImpl = null;
let sendStreamingRequestImpl = null;
let setGenerationParamsFromPresetImpl = null;
let setGenerationProgressImpl = null;
let shouldAutoContinueImpl = null;
let stopGenerationImpl = null;

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
 *   getGenerateUrl: (...args: any[]) => string,
 *   getGeneratingApi: (...args: any[]) => string,
 *   getStoppingStrings: (...args: any[]) => string[],
 *   isStreamingEnabled: (...args: any[]) => boolean,
 *   sendGenerationRequest: (...args: any[]) => Promise<any>,
 *   sendStreamingRequest: (...args: any[]) => Promise<any>,
 *   setGenerationParamsFromPreset: (...args: any[]) => void,
 *   setGenerationProgress: (...args: any[]) => void,
 *   shouldAutoContinue: (...args: any[]) => boolean,
 *   stopGeneration: (...args: any[]) => boolean,
 * }} impl Implementations to bind
 */
export function bindGenerationCore(impl) {
    generateImpl = impl?.Generate ?? null;
    generateRawImpl = impl?.generateRaw ?? null;
    generateQuietPromptImpl = impl?.generateQuietPrompt ?? null;
    getGenerateUrlImpl = impl?.getGenerateUrl ?? null;
    getGeneratingApiImpl = impl?.getGeneratingApi ?? null;
    getStoppingStringsImpl = impl?.getStoppingStrings ?? null;
    isStreamingEnabledImpl = impl?.isStreamingEnabled ?? null;
    sendGenerationRequestImpl = impl?.sendGenerationRequest ?? null;
    sendStreamingRequestImpl = impl?.sendStreamingRequest ?? null;
    setGenerationParamsFromPresetImpl = impl?.setGenerationParamsFromPreset ?? null;
    setGenerationProgressImpl = impl?.setGenerationProgress ?? null;
    shouldAutoContinueImpl = impl?.shouldAutoContinue ?? null;
    stopGenerationImpl = impl?.stopGeneration ?? null;
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

export function getGeneratingApi(...args) {
    if (!getGeneratingApiImpl) {
        throwUnbound('getGeneratingApi');
    }

    return getGeneratingApiImpl(...args);
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

export function shouldAutoContinue(...args) {
    if (!shouldAutoContinueImpl) {
        throwUnbound('shouldAutoContinue');
    }

    return shouldAutoContinueImpl(...args);
}

export function stopGeneration(...args) {
    if (!stopGenerationImpl) {
        throwUnbound('stopGeneration');
    }

    return stopGenerationImpl(...args);
}
