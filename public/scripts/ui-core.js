let addCopyToCodeBlocksImpl = null;
let callPopupImpl = null;
let reloadMarkdownProcessorImpl = null;
let scrollChatToBottomImpl = null;
let setAnimationDurationImpl = null;

export let ANIMATION_DURATION_DEFAULT = 0;
export let animation_duration = 0;
export let animation_easing = 'ease-in-out';
export let is_send_press = false;
export let MAX_INJECTION_DEPTH = 0;

function throwUnbound(name) {
    throw new Error(`[ui-core] ${name} was called before bindings were initialized`);
}

/**
 * Binds legacy UI implementations to standalone wrappers.
 * @param {{
 *   addCopyToCodeBlocks: (...args: any[]) => any,
 *   callPopup: (...args: any[]) => any,
 *   reloadMarkdownProcessor: (...args: any[]) => any,
 *   scrollChatToBottom: (...args: any[]) => any,
 *   setAnimationDuration: (...args: any[]) => any,
 * }} impl Implementations to bind
 */
export function bindUiCore(impl) {
    addCopyToCodeBlocksImpl = impl?.addCopyToCodeBlocks ?? null;
    callPopupImpl = impl?.callPopup ?? null;
    reloadMarkdownProcessorImpl = impl?.reloadMarkdownProcessor ?? null;
    scrollChatToBottomImpl = impl?.scrollChatToBottom ?? null;
    setAnimationDurationImpl = impl?.setAnimationDuration ?? null;
}

export function syncAnimationDurationDefault(value) {
    ANIMATION_DURATION_DEFAULT = value;
}

export function syncAnimationDuration(value) {
    animation_duration = value;
}

export function syncAnimationEasing(value) {
    animation_easing = value;
}

export function syncIsSendPress(value) {
    is_send_press = value;
}

export function syncMaxInjectionDepth(value) {
    MAX_INJECTION_DEPTH = value;
}

export function addCopyToCodeBlocks(...args) {
    if (!addCopyToCodeBlocksImpl) {
        throwUnbound('addCopyToCodeBlocks');
    }

    return addCopyToCodeBlocksImpl(...args);
}

export function callPopup(...args) {
    if (!callPopupImpl) {
        throwUnbound('callPopup');
    }

    return callPopupImpl(...args);
}

export function reloadMarkdownProcessor(...args) {
    if (!reloadMarkdownProcessorImpl) {
        throwUnbound('reloadMarkdownProcessor');
    }

    return reloadMarkdownProcessorImpl(...args);
}

export function scrollChatToBottom(...args) {
    if (!scrollChatToBottomImpl) {
        throwUnbound('scrollChatToBottom');
    }

    return scrollChatToBottomImpl(...args);
}

export function setAnimationDuration(...args) {
    if (!setAnimationDurationImpl) {
        throwUnbound('setAnimationDuration');
    }

    return setAnimationDurationImpl(...args);
}
