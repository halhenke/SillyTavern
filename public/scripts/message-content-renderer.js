function renderMessageBias(target, bias, formatMessage) {
    target.empty();
    target.append(formatMessage(bias, '', false, false, -1, {}, false));
}

export function renderMessageEditPreview({
    mesBlock,
    text,
    bias,
    characterName,
    isSystem,
    isUser,
    messageId,
    formatMessage,
}) {
    mesBlock.find('.mes_text').val('');
    mesBlock.find('.mes_text').val(
        formatMessage(text, characterName, isSystem, isUser, messageId, {}, false),
    );
    renderMessageBias(mesBlock.find('.mes_bias'), bias, formatMessage);
}

export function renderMessageElementContent({
    messageElement,
    message,
    messageId,
    text,
    bias = null,
    clearText = true,
    formatMessage,
    updateReasoningUI,
    addCopyToCodeBlocks,
    appendMediaToMessage,
}) {
    if (clearText) {
        messageElement.find('.mes_text').empty();
    }

    messageElement.find('.mes_text').append(
        formatMessage(text, message.name, message.is_system, message.is_user, messageId, {}, false),
    );

    if (bias !== null) {
        renderMessageBias(messageElement.find('.mes_bias'), bias, formatMessage);
    }

    updateReasoningUI(messageElement);
    addCopyToCodeBlocks(messageElement);
    appendMediaToMessage(message, messageElement);
    return messageElement;
}
