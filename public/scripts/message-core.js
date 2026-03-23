import { appendMediaToMessage, chat, formatSwipeCounter, reloadCurrentChat, saveChatConditional } from './chat-operations-core.js';
import { is_group_generating, selected_group } from './group-chats.js';
import { t } from './i18n.js';
import { is_send_press } from './ui-core.js';

let cleanUpMessageImpl = null;
let messageFormattingImpl = null;
let saveChatDebouncedImpl = null;
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
 *   messageFormatting: (...args: any[]) => any,
 *   saveChatDebounced: (...args: any[]) => any,
 *   addCopyToCodeBlocks: (...args: any[]) => any,
 *   updateReasoningUI: (...args: any[]) => any,
 * }} impl Implementations to bind
 */
export function bindMessageCore(impl) {
    cleanUpMessageImpl = impl?.cleanUpMessage ?? null;
    messageFormattingImpl = impl?.messageFormatting ?? null;
    saveChatDebouncedImpl = impl?.saveChatDebounced ?? null;
    addCopyToCodeBlocksImpl = impl?.addCopyToCodeBlocks ?? null;
    updateReasoningUIImpl = impl?.updateReasoningUI ?? null;
}

export function cleanUpMessage(...args) {
    if (!cleanUpMessageImpl) {
        throwUnbound('cleanUpMessage');
    }

    return cleanUpMessageImpl(...args);
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

export function syncMesToSwipe(messageId = null) {
    if (!chat.length) {
        return false;
    }

    const targetMessageId = messageId ?? chat.length - 1;
    if (targetMessageId >= chat.length || targetMessageId < 0) {
        console.warn(`[syncMesToSwipe] Invalid message ID: ${messageId}`);
        return false;
    }

    const targetMessage = chat[targetMessageId];
    if (!targetMessage) {
        return false;
    }

    if (typeof targetMessage.swipe_id !== 'number') {
        return false;
    }
    if (!Array.isArray(targetMessage.swipe_info) || !Array.isArray(targetMessage.swipes)) {
        return false;
    }
    if (!targetMessage.swipes[targetMessage.swipe_id] || !targetMessage.swipe_info[targetMessage.swipe_id]) {
        return false;
    }

    const targetSwipeInfo = targetMessage.swipe_info[targetMessage.swipe_id];
    if (typeof targetSwipeInfo !== 'object') {
        return false;
    }

    targetMessage.swipes[targetMessage.swipe_id] = targetMessage.mes;

    targetSwipeInfo.send_date = targetMessage.send_date;
    targetSwipeInfo.gen_started = targetMessage.gen_started;
    targetSwipeInfo.gen_finished = targetMessage.gen_finished;
    targetSwipeInfo.extra = structuredClone(targetMessage.extra);

    return true;
}

export function syncSwipeToMes(messageId = null, swipeId = null) {
    if (!chat.length) {
        return false;
    }

    const targetMessageId = messageId ?? chat.length - 1;
    if (targetMessageId >= chat.length || targetMessageId < 0) {
        console.warn(`[syncSwipeToMes] Invalid message ID: ${messageId}`);
        return false;
    }

    const targetMessage = chat[targetMessageId];
    if (!targetMessage) {
        return false;
    }

    if (swipeId !== null) {
        if (isNaN(swipeId) || swipeId < 0) {
            console.warn(`[syncSwipeToMes] Invalid swipe ID: ${swipeId}`);
            return false;
        }
        targetMessage.swipe_id = swipeId;
    }

    if (typeof targetMessage.swipe_id !== 'number') {
        return false;
    }
    if (!Array.isArray(targetMessage.swipe_info) || !Array.isArray(targetMessage.swipes)) {
        return false;
    }
    if (!targetMessage.swipes[targetMessage.swipe_id] || !targetMessage.swipe_info[targetMessage.swipe_id]) {
        return false;
    }

    const targetSwipeInfo = targetMessage.swipe_info[targetMessage.swipe_id];
    if (typeof targetSwipeInfo !== 'object') {
        return false;
    }

    targetMessage.mes = targetMessage.swipes[targetMessage.swipe_id];
    targetMessage.send_date = targetSwipeInfo.send_date;
    targetMessage.gen_started = targetSwipeInfo.gen_started;
    targetMessage.gen_finished = targetSwipeInfo.gen_finished;
    targetMessage.extra = structuredClone(targetSwipeInfo.extra);

    return true;
}

export function showSwipeButtons() {
    if (chat.length === 0) {
        return;
    }

    if (
        chat[chat.length - 1].is_system ||
        !chat[chat.length - 1].swipes ||
        Number($('.mes:last').attr('mesid')) < 0 ||
        chat[chat.length - 1].is_user ||
        (selected_group && is_group_generating)
    ) {
        return;
    }

    if (chat.length === 1 && chat[0].swipe_id === undefined) {
        return;
    }

    if (chat[chat.length - 1].swipe_id === undefined) {
        chat[chat.length - 1].swipe_id = 0;
        chat[chat.length - 1].swipes = [];
        chat[chat.length - 1].swipes[0] = chat[chat.length - 1].mes;
        chat[chat.length - 1].swipe_info = [];
        chat[chat.length - 1].swipe_info[0] = {
            send_date: chat[chat.length - 1].send_date,
            gen_started: chat[chat.length - 1].gen_started,
            gen_finished: chat[chat.length - 1].gen_finished,
            extra: structuredClone(chat[chat.length - 1].extra),
        };
    }

    const currentMessage = $('#chat').children().filter(`[mesid="${chat.length - 1}"]`);
    const swipeId = chat[chat.length - 1].swipe_id;
    const swipeCounterText = formatSwipeCounter(swipeId + 1, chat[chat.length - 1].swipes.length);
    const swipeRight = currentMessage.find('.swipe_right');
    const swipeLeft = currentMessage.find('.swipe_left');
    const swipeCounter = currentMessage.find('.swipes-counter');

    if (swipeId !== undefined && (chat[chat.length - 1].swipes.length > 1 || swipeId > 0)) {
        swipeLeft.css('display', 'flex');
    }

    if (is_send_press === false || chat[chat.length - 1].swipes.length >= swipeId) {
        swipeRight.css('display', 'flex').css('opacity', '0.3');
        swipeCounter.css('opacity', '0.3');
    }

    if ((chat[chat.length - 1].swipes.length - swipeId) === 1) {
        swipeRight.css('opacity', '0.7');
        swipeCounter.css('opacity', '0.7');
    }

    $('.last_mes .swipes-counter').text(swipeCounterText).show();
}

export function hideSwipeButtons() {
    const chatElement = $('#chat');
    chatElement.find('.swipe_right').hide();
    chatElement.find('.last_mes .swipes-counter').hide();
    chatElement.find('.swipe_left').hide();
}

export async function deleteSwipe(swipeId = null) {
    if (swipeId && (isNaN(swipeId) || swipeId < 0)) {
        toastr.warning(t`Invalid swipe ID: ${swipeId + 1}`);
        return;
    }

    const lastMessage = chat[chat.length - 1];
    if (!lastMessage || !Array.isArray(lastMessage.swipes) || !lastMessage.swipes.length) {
        toastr.warning(t`No messages to delete swipes from.`);
        return;
    }

    if (lastMessage.swipes.length <= 1) {
        toastr.warning(t`Can't delete the last swipe.`);
        return;
    }

    swipeId = swipeId ?? lastMessage.swipe_id;

    if (swipeId < 0 || swipeId >= lastMessage.swipes.length) {
        toastr.warning(t`Invalid swipe ID: ${swipeId + 1}`);
        return;
    }

    lastMessage.swipes.splice(swipeId, 1);

    if (Array.isArray(lastMessage.swipe_info) && lastMessage.swipe_info.length) {
        lastMessage.swipe_info.splice(swipeId, 1);
    }

    const newSwipeId = Math.min(swipeId, lastMessage.swipes.length - 1);
    syncSwipeToMes(null, newSwipeId);

    await saveChatConditional();
    await reloadCurrentChat();

    return newSwipeId;
}

export function updateViewMessageIds(startFromZero = false) {
    const minId = startFromZero ? 0 : getFirstDisplayedMessageId();

    $('#chat').find('.mes').each(function (index, element) {
        $(element).attr('mesid', minId + index);
        $(element).find('.mesIDDisplay').text(`#${minId + index}`);
    });

    $('#chat .mes').removeClass('last_mes');
    $('#chat .mes').last().addClass('last_mes');

    updateEditArrowClasses();
}

export function getFirstDisplayedMessageId() {
    const allIds = Array.from(document.querySelectorAll('#chat .mes'))
        .map(el => Number(el.getAttribute('mesid')))
        .filter(x => !isNaN(x));
    const minId = Math.min(...allIds);
    return minId;
}

export function updateEditArrowClasses() {
    $('#chat .mes .mes_edit_up').removeClass('disabled');
    $('#chat .mes .mes_edit_down').removeClass('disabled');

    if (editedMessageId !== undefined) {
        const down = $(`#chat .mes[mesid="${editedMessageId}"] .mes_edit_down`);
        const up = $(`#chat .mes[mesid="${editedMessageId}"] .mes_edit_up`);
        const lastId = Number($('#chat .mes').last().attr('mesid'));
        const firstId = Number($('#chat .mes').first().attr('mesid'));

        if (lastId === Number(editedMessageId)) {
            down.addClass('disabled');
        }

        if (firstId === Number(editedMessageId)) {
            up.addClass('disabled');
        }
    }
}

export function closeMessageEditor(what = 'all') {
    if (what === 'message' || what === 'all') {
        if (editedMessageId) {
            $(`#chat .mes[mesid="${editedMessageId}"] .mes_edit_cancel`).trigger('click');
        }
    }
    if (what === 'reasoning' || what === 'all') {
        document.querySelectorAll('.reasoning_edit_textarea').forEach((el) => {
            const cancelButton = el.closest('.mes')?.querySelector('.mes_reasoning_edit_cancel');
            if (cancelButton instanceof HTMLElement) {
                cancelButton.click();
            }
        });
    }
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
