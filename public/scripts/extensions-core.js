let getExtensionPromptByNameImpl = null;
let getExtensionPromptImpl = null;
let getExtensionPromptMaxDepthImpl = null;
let setExtensionPromptImpl = null;

export let extension_prompts = {};
export let extension_prompt_roles = {};
export let extension_prompt_types = {};

function throwUnbound(name) {
    throw new Error(`[extensions-core] ${name} was called before bindings were initialized`);
}

/**
 * Binds legacy extension prompt implementations to standalone wrappers.
 * @param {{
 *   getExtensionPromptByName: (...args: any[]) => Promise<any>,
 *   getExtensionPrompt: (...args: any[]) => Promise<any>,
 *   getExtensionPromptMaxDepth: (...args: any[]) => number,
 *   setExtensionPrompt: (...args: any[]) => any,
 * }} impl Implementations to bind
 */
export function bindExtensionsCore(impl) {
    getExtensionPromptByNameImpl = impl?.getExtensionPromptByName ?? null;
    getExtensionPromptImpl = impl?.getExtensionPrompt ?? null;
    getExtensionPromptMaxDepthImpl = impl?.getExtensionPromptMaxDepth ?? null;
    setExtensionPromptImpl = impl?.setExtensionPrompt ?? null;
}

export function syncExtensionPrompts(value) {
    extension_prompts = value;
}

export function syncExtensionPromptRoles(value) {
    extension_prompt_roles = value;
}

export function syncExtensionPromptTypes(value) {
    extension_prompt_types = value;
}

export function getExtensionPromptByName(...args) {
    if (!getExtensionPromptByNameImpl) {
        throwUnbound('getExtensionPromptByName');
    }

    return getExtensionPromptByNameImpl(...args);
}

export function getExtensionPrompt(...args) {
    if (!getExtensionPromptImpl) {
        throwUnbound('getExtensionPrompt');
    }

    return getExtensionPromptImpl(...args);
}

export function getExtensionPromptMaxDepth(...args) {
    if (!getExtensionPromptMaxDepthImpl) {
        throwUnbound('getExtensionPromptMaxDepth');
    }

    return getExtensionPromptMaxDepthImpl(...args);
}

export function setExtensionPrompt(...args) {
    if (!setExtensionPromptImpl) {
        throwUnbound('setExtensionPrompt');
    }

    return setExtensionPromptImpl(...args);
}
