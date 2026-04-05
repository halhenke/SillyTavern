import { renderChatHistoryWindow, renderMessageListItem } from './message-list-renderer.js';
import { renderMessageTemplate } from './message-template-renderer.js';
import { createMessageTemplateViewModel } from './message-template-view-model.js';
import { timestampToMoment } from './utils.js';

function renderMessageFromTemplate(params, {
    updateReasoningUI,
    shouldShowTimestampModelIcon,
    updateBookmarkDisplay,
}) {
    return renderMessageTemplate(params, {
        updateReasoningUI,
        shouldShowTimestampModelIcon,
        updateBookmarkDisplay,
    });
}

export function addOneMessageWorkflow(message, {
    type = 'normal',
    insertAfter = null,
    scroll = true,
    insertBefore = null,
    forceId = null,
    showSwipes = true,
} = {}, {
    chat,
    characters,
    thisChid,
    defaultAvatar,
    userAvatar,
    systemAvatar,
    getThumbnailUrl,
    messageFormatting,
    getItemizedPrompts,
    appendMediaToMessage,
    addCopyToCodeBlocks,
    hideSwipeButtons,
    showSwipeButtons: showSwipeButtonsFn,
    scrollChatToBottom,
    applyCharacterTagsToMessageDivs,
    formatSwipeCounter,
    updateReasoningUI,
    shouldShowTimestampModelIcon,
    updateBookmarkDisplay,
    formatGenerationTimer,
}) {
    const momentDate = timestampToMoment(message.send_date);
    const timestamp = momentDate.isValid() ? momentDate.format('LL LT') : '';

    if (type === 'swipe' && message.swipe_id === undefined) {
        message.swipe_id = 0;
        message.swipes = [message.mes];
    }

    const selectedCharacterAvatarUrl = thisChid === undefined
        ? null
        : (characters[thisChid].avatar !== 'none'
            ? getThumbnailUrl('avatar', characters[thisChid].avatar)
            : defaultAvatar);

    const { messageText, params } = createMessageTemplateViewModel({
        message,
        type,
        forceId,
        chatLength: chat.length,
        messageIndex: chat.indexOf(message),
        personaAvatarUrl: getThumbnailUrl('persona', userAvatar),
        selectedCharacterAvatarUrl,
        hasSelectedCharacter: thisChid !== undefined,
        systemAvatar,
        defaultAvatar,
        timestamp,
        formatMessage: messageFormatting,
        formatGenerationTimer,
    });

    return renderMessageListItem({
        chat,
        message,
        params,
        messageText,
        renderedMessage: renderMessageFromTemplate(params, {
            updateReasoningUI,
            shouldShowTimestampModelIcon,
            updateBookmarkDisplay,
        }),
        type,
        insertAfter,
        insertBefore,
        forceId,
        scroll,
        showSwipes,
        itemizedPrompts: getItemizedPrompts(),
    }, {
        appendMediaToMessage,
        addCopyToCodeBlocks,
        hideSwipeButtons,
        showSwipeButtons: showSwipeButtonsFn,
        scrollChatToBottom,
        applyCharacterTagsToMessageDivs,
        formatSwipeCounter,
        updateReasoningUI,
        shouldShowTimestampModelIcon,
    });
}

export function printMessagesWorkflow({
    chat,
    count,
    renderMessage,
    scrollChatToBottom,
    hideSwipeButtons,
    showSwipeButtons,
    applyStylePins,
}) {
    return renderChatHistoryWindow({
        chat,
        count,
        renderMessage,
    }, {
        scrollChatToBottom,
        hideSwipeButtons,
        showSwipeButtons,
        applyStylePins,
    });
}
