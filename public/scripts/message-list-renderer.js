import { applyMessageTemplateModelIcons } from './message-template-renderer.js';

export function renderMessageListItem({
    chat,
    message,
    params,
    messageText,
    renderedMessage,
    type = 'normal',
    insertAfter = null,
    insertBefore = null,
    forceId = null,
    scroll = true,
    showSwipes = true,
    itemizedPrompts = [],
}, {
    appendMediaToMessage,
    addCopyToCodeBlocks,
    hideSwipeButtons,
    showSwipeButtons,
    scrollChatToBottom,
    applyCharacterTagsToMessageDivs,
    formatSwipeCounter,
    updateReasoningUI,
    shouldShowTimestampModelIcon,
}) {
    const chatElement = $('#chat');

    if (type !== 'swipe') {
        if (!insertAfter && !insertBefore) {
            chatElement.append(renderedMessage);
        } else if (insertAfter) {
            $(renderedMessage).insertAfter(chatElement.find(`.mes[mesid="${insertAfter}"]`));
        } else {
            $(renderedMessage).insertBefore(chatElement.find(`.mes[mesid="${insertBefore}"]`));
        }
    }

    const newMessageId = typeof forceId === 'number' ? forceId : chat.length - 1;
    const newMessage = $(`#chat [mesid="${newMessageId}"]`);
    const isSmallSys = message?.extra?.isSmallSys;

    if (isSmallSys === true) {
        newMessage.addClass('smallSysMes');
    }
    if (Array.isArray(message?.extra?.tool_invocations)) {
        newMessage.addClass('toolCall');
    }

    const mesIdToFind = type === 'swipe' ? params.mesId - 1 : params.mesId;
    if (params.isUser === false && Array.isArray(itemizedPrompts) && itemizedPrompts.length > 0) {
        const itemizedPrompt = itemizedPrompts.find(x => Number(x.mesId) === Number(mesIdToFind));
        if (itemizedPrompt) {
            newMessage.find('.mes_prompt').show();
        }
    }

    newMessage.find('.avatar img').on('error', function () {
        $(this).hide();
        $(this).parent().html('<div class="missing-avatar fa-solid fa-user-slash"></div>');
    });

    if (type === 'swipe') {
        const swipeMessage = chatElement.find(`[mesid="${chat.length - 1}"]`);
        swipeMessage.attr('swipeid', params.swipeId);
        swipeMessage.find('.mes_text').html(messageText).attr('title', params.title ?? '');
        swipeMessage.find('.timestamp').text(params.timestamp).attr('title', `${params.extra?.api ? `${params.extra.api} - ` : ''}${params.extra?.model ?? ''}`);
        updateReasoningUI(swipeMessage);
        appendMediaToMessage(message, swipeMessage);

        if (shouldShowTimestampModelIcon() && params.extra?.api) {
            applyMessageTemplateModelIcons(swipeMessage, params.extra);
        }

        if (message.swipe_id == message.swipes.length - 1) {
            swipeMessage.find('.mes_timer').text(params.timerValue).attr('title', params.timerTitle);
            swipeMessage.find('.tokenCounterDisplay').text(`${params.tokenCount}t`);
        } else {
            swipeMessage.find('.mes_timer').empty();
            swipeMessage.find('.tokenCounterDisplay').empty();
        }
    } else {
        const messageId = forceId ?? chat.length - 1;
        chatElement.find(`[mesid="${messageId}"] .mes_text`).append(messageText);
        appendMediaToMessage(message, newMessage);
        if (showSwipes) {
            hideSwipeButtons();
        }
    }

    addCopyToCodeBlocks(newMessage);

    if (!params.isUser && newMessageId !== 0 && newMessageId !== chat.length - 1) {
        const swipesNum = chat[newMessageId].swipes?.length;
        const swipeId = chat[newMessageId].swipe_id + 1;
        newMessage.find('.swipes-counter').text(formatSwipeCounter(swipeId, swipesNum));
    }

    if (showSwipes) {
        $('#chat .mes').last().addClass('last_mes');
        $('#chat .mes').eq(-2).removeClass('last_mes');
        hideSwipeButtons();
        showSwipeButtons();
    }

    if (!insertAfter && !insertBefore && scroll) {
        scrollChatToBottom();
    }

    applyCharacterTagsToMessageDivs({ mesIds: newMessageId });

    return { newMessage, newMessageId };
}

export function renderChatHistoryWindow({
    chat,
    count,
    renderMessage,
}, {
    scrollChatToBottom,
    hideSwipeButtons,
    showSwipeButtons,
    applyStylePins,
}) {
    let startIndex = 0;

    if (chat.length > count) {
        startIndex = chat.length - count;
        $('#chat').append('<div id="show_more_messages">Show more messages</div>');
    }

    for (let i = startIndex; i < chat.length; i++) {
        renderMessage(chat[i], { scroll: false, forceId: i, showSwipes: false });
    }

    const images = document.querySelectorAll('#chat .mes img');
    let imagesLoaded = 0;

    for (const image of images) {
        if (image instanceof HTMLImageElement) {
            if (image.complete) {
                incrementAndCheck();
            } else {
                image.addEventListener('load', incrementAndCheck);
            }
        }
    }

    $('#chat .mes').removeClass('last_mes');
    $('#chat .mes').last().addClass('last_mes');
    hideSwipeButtons();
    showSwipeButtons();
    scrollChatToBottom();
    applyStylePins();

    function incrementAndCheck() {
        imagesLoaded++;
        if (imagesLoaded === images.length) {
            scrollChatToBottom();
        }
    }
}
