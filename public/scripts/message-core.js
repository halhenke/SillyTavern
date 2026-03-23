import { appendMediaToMessage, chat, extractMessageBias, formatSwipeCounter, reloadCurrentChat, saveChatConditional } from './chat-operations-core.js';
import { chat_metadata } from './chat-core.js';
import { event_types, eventSource } from './events.js';
import { getRegexedString, regex_placement } from './extensions/regex/engine.js';
import { is_group_generating, selected_group } from './group-chats.js';
import { t } from './i18n.js';
import { removeMacros, substituteParams } from './parser-core.js';
import { power_user } from './power-user.js';
import { system_message_types } from './system-messages.js';
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

function updateEditedMessage(div) {
    const mesBlock = div.closest('.mes_block');
    let text = mesBlock.find('.edit_textarea').val()
        ?? mesBlock.find('.mes_text').text();
    const mesElement = div.closest('.mes');
    const mes = chat[mesElement.attr('mesid')];

    let regexPlacement;
    if (mes.is_user) {
        regexPlacement = regex_placement.USER_INPUT;
    } else if (mes.extra?.type === 'narrator') {
        regexPlacement = regex_placement.SLASH_COMMAND;
    } else {
        regexPlacement = regex_placement.AI_OUTPUT;
    }

    text = getRegexedString(
        text,
        regexPlacement,
        {
            characterOverride: mes.extra?.type === 'narrator' ? undefined : mes.name,
            isEdit: true,
        },
    );

    if (power_user.trim_spaces) {
        text = text.trim();
    }

    const bias = substituteParams(extractMessageBias(text));
    text = substituteParams(text);
    if (bias) {
        text = removeMacros(text);
    }
    mes.mes = text;
    if (mes.swipe_id !== undefined) {
        mes.swipes[mes.swipe_id] = text;
    }

    if (!mes.extra) {
        mes.extra = {};
    }

    if (mes.is_system || mes.is_user || mes.extra.type === system_message_types.NARRATOR) {
        mes.extra.bias = bias ?? null;
    } else {
        mes.extra.bias = null;
    }

    chat_metadata.tainted = true;

    return { mesBlock, text, mes, bias };
}

export function messageEditAuto(div, editedMessageName, currentEditedMessageId = editedMessageId) {
    const { mesBlock, text, mes, bias } = updateEditedMessage(div);

    mesBlock.find('.mes_text').val('');
    mesBlock.find('.mes_text').val(messageFormatting(
        text,
        editedMessageName,
        mes.is_system,
        mes.is_user,
        currentEditedMessageId,
        {},
        false,
    ));
    mesBlock.find('.mes_bias').empty();
    mesBlock.find('.mes_bias').append(messageFormatting(bias, '', false, false, -1, {}, false));
    saveChatDebounced();
}

export async function messageEditDone(div, editedMessageName, currentEditedMessageId = editedMessageId) {
    let { mesBlock, text, mes, bias } = updateEditedMessage(div);
    if (currentEditedMessageId == 0) {
        text = substituteParams(text);
    }

    await eventSource.emit(event_types.MESSAGE_EDITED, currentEditedMessageId);
    text = chat[currentEditedMessageId]?.mes ?? text;
    mesBlock.find('.mes_text').empty();
    mesBlock.find('.mes_edit_buttons').css('display', 'none');
    mesBlock.find('.mes_buttons').css('display', '');
    mesBlock.find('.mes_text').append(
        messageFormatting(
            text,
            editedMessageName,
            mes.is_system,
            mes.is_user,
            currentEditedMessageId,
            {},
            false,
        ),
    );
    mesBlock.find('.mes_bias').empty();
    mesBlock.find('.mes_bias').append(messageFormatting(bias, '', false, false, -1, {}, false));
    appendMediaToMessage(mes, div.closest('.mes'));
    addCopyToCodeBlocksImpl(div.closest('.mes'));

    const reasoningEditDone = mesBlock.find('.mes_reasoning_edit_done:visible');
    if (reasoningEditDone.length > 0) {
        reasoningEditDone.trigger('click');
    }

    await eventSource.emit(event_types.MESSAGE_UPDATED, currentEditedMessageId);
    setEditedMessageId(undefined);
    await saveChatConditional();
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
