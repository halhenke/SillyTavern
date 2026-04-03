import { chat_metadata } from './chat-core.js';
import { event_types, eventSource } from './events.js';
import { getRegexedString, regex_placement } from './extensions/regex/engine.js';
import { renderMessageEditPreview, renderMessageElementContent } from './message-content-renderer.js';
import { exitMessageEditMode } from './message-edit-renderer.js';
import { removeMacros, substituteParams } from './parser-core.js';
import { power_user } from './power-user.js';
import { system_message_types } from './system-messages.js';

function updateEditedMessage({
    div,
    chat,
    extractMessageBias,
}) {
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

export function messageEditAutoWorkflow({
    div,
    chat,
    currentEditedMessageName,
    currentEditedMessageId,
    messageFormatting,
    extractMessageBias,
    saveChatDebounced,
}) {
    const { mesBlock, text, mes, bias } = updateEditedMessage({
        div,
        chat,
        extractMessageBias,
    });

    renderMessageEditPreview({
        mesBlock,
        text,
        bias,
        characterName: currentEditedMessageName,
        isSystem: mes.is_system,
        isUser: mes.is_user,
        messageId: currentEditedMessageId,
        formatMessage: messageFormatting,
    });
    saveChatDebounced();
}

export async function messageEditDoneWorkflow({
    div,
    chat,
    currentEditedMessageName,
    currentEditedMessageId,
    messageFormatting,
    extractMessageBias,
    appendMediaToMessage,
    updateReasoningUI,
    addCopyToCodeBlocks,
    clearEditedMessageState,
    saveChatConditional,
}) {
    let { mesBlock, text, mes, bias } = updateEditedMessage({
        div,
        chat,
        extractMessageBias,
    });
    if (currentEditedMessageId == 0) {
        text = substituteParams(text);
    }

    await eventSource.emit(event_types.MESSAGE_EDITED, currentEditedMessageId);
    text = chat[currentEditedMessageId]?.mes ?? text;
    exitMessageEditMode(mesBlock);
    renderMessageElementContent({
        messageElement: div.closest('.mes'),
        message: mes,
        messageId: currentEditedMessageId,
        text,
        bias,
        clearText: true,
        formatMessage: (content, name, isSystem, isUser, messageId, sanitizerOverrides = {}, isReasoning = false) => (
            name === mes.name
                ? messageFormatting(content, currentEditedMessageName, isSystem, isUser, messageId, sanitizerOverrides, isReasoning)
                : messageFormatting(content, name, isSystem, isUser, messageId, sanitizerOverrides, isReasoning)
        ),
        updateReasoningUI,
        addCopyToCodeBlocks,
        appendMediaToMessage,
    });

    const reasoningEditDone = mesBlock.find('.mes_reasoning_edit_done:visible');
    if (reasoningEditDone.length > 0) {
        reasoningEditDone.trigger('click');
    }

    await eventSource.emit(event_types.MESSAGE_UPDATED, currentEditedMessageId);
    clearEditedMessageState();
    await saveChatConditional();
}
