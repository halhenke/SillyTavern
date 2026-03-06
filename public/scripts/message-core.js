import { appendMediaToMessage } from './chat-operations-core.js';

let cleanUpMessageImpl = null;
let closeMessageEditorImpl = null;
let getFirstDisplayedMessageIdImpl = null;
let messageFormattingImpl = null;
let saveChatDebouncedImpl = null;
let syncMesToSwipeImpl = null;
let addCopyToCodeBlocksImpl = null;
let updateReasoningUIImpl = null;

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
 *   addCopyToCodeBlocks: (...args: any[]) => any,
 *   updateReasoningUI: (...args: any[]) => any,
 * }} impl Implementations to bind
 */
export function bindMessageCore(impl) {
    cleanUpMessageImpl = impl?.cleanUpMessage ?? null;
    closeMessageEditorImpl = impl?.closeMessageEditor ?? null;
    getFirstDisplayedMessageIdImpl = impl?.getFirstDisplayedMessageId ?? null;
    messageFormattingImpl = impl?.messageFormatting ?? null;
    saveChatDebouncedImpl = impl?.saveChatDebounced ?? null;
    syncMesToSwipeImpl = impl?.syncMesToSwipe ?? null;
    addCopyToCodeBlocksImpl = impl?.addCopyToCodeBlocks ?? null;
    updateReasoningUIImpl = impl?.updateReasoningUI ?? null;
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
    if (!messageFormattingImpl) {
        throwUnbound('messageFormatting');
    }
    if (!addCopyToCodeBlocksImpl) {
        throwUnbound('addCopyToCodeBlocks');
    }
    if (!updateReasoningUIImpl) {
        throwUnbound('updateReasoningUI');
    }

    const [messageId, message, { rerenderMessage = true } = {}] = args;
    const messageElement = $(`#chat [mesid="${messageId}"]`);
    if (rerenderMessage) {
        const text = message?.extra?.display_text ?? message.mes;
        messageElement.find('.mes_text').html(messageFormattingImpl(text, message.name, message.is_system, message.is_user, messageId, {}, false));
    }

    updateReasoningUIImpl(messageElement);
    addCopyToCodeBlocksImpl(messageElement);
    appendMediaToMessage(message, messageElement);
    return messageElement;
}
