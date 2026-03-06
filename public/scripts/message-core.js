let cleanUpMessageImpl = null;
let closeMessageEditorImpl = null;
let getFirstDisplayedMessageIdImpl = null;
let messageFormattingImpl = null;
let saveChatDebouncedImpl = null;
let syncMesToSwipeImpl = null;
let updateMessageBlockImpl = null;

export let editedMessageId = undefined;

function throwUnbound(name) {
    throw new Error(`[message-core] ${name} was called before bindings were initialized`);
}

/**
 * Binds legacy message-related implementations to standalone wrappers.
 * @param {{
 *   cleanUpMessage: (...args: any[]) => any,
 *   closeMessageEditor: (...args: any[]) => any,
 *   getFirstDisplayedMessageId: (...args: any[]) => any,
 *   messageFormatting: (...args: any[]) => any,
 *   saveChatDebounced: (...args: any[]) => any,
 *   syncMesToSwipe: (...args: any[]) => any,
 *   updateMessageBlock: (...args: any[]) => any,
 * }} impl Implementations to bind
 */
export function bindMessageCore(impl) {
    cleanUpMessageImpl = impl?.cleanUpMessage ?? null;
    closeMessageEditorImpl = impl?.closeMessageEditor ?? null;
    getFirstDisplayedMessageIdImpl = impl?.getFirstDisplayedMessageId ?? null;
    messageFormattingImpl = impl?.messageFormatting ?? null;
    saveChatDebouncedImpl = impl?.saveChatDebounced ?? null;
    syncMesToSwipeImpl = impl?.syncMesToSwipe ?? null;
    updateMessageBlockImpl = impl?.updateMessageBlock ?? null;
}

export function cleanUpMessage(...args) {
    if (!cleanUpMessageImpl) {
        throwUnbound('cleanUpMessage');
    }

    return cleanUpMessageImpl(...args);
}

export function closeMessageEditor(...args) {
    if (!closeMessageEditorImpl) {
        throwUnbound('closeMessageEditor');
    }

    return closeMessageEditorImpl(...args);
}

export function getFirstDisplayedMessageId(...args) {
    if (!getFirstDisplayedMessageIdImpl) {
        throwUnbound('getFirstDisplayedMessageId');
    }

    return getFirstDisplayedMessageIdImpl(...args);
}

export function messageFormatting(...args) {
    if (!messageFormattingImpl) {
        throwUnbound('messageFormatting');
    }

    return messageFormattingImpl(...args);
}

export function saveChatDebounced(...args) {
    if (!saveChatDebouncedImpl) {
        throwUnbound('saveChatDebounced');
    }

    return saveChatDebouncedImpl(...args);
}

export function setEditedMessageId(value) {
    editedMessageId = value;
    return editedMessageId;
}

export function syncMesToSwipe(...args) {
    if (!syncMesToSwipeImpl) {
        throwUnbound('syncMesToSwipe');
    }

    return syncMesToSwipeImpl(...args);
}

export function updateMessageBlock(...args) {
    if (!updateMessageBlockImpl) {
        throwUnbound('updateMessageBlock');
    }

    return updateMessageBlockImpl(...args);
}
