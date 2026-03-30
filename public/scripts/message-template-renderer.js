export function renderMessageTemplate({
    mesId,
    swipeId,
    characterName,
    isUser,
    avatarImg,
    bias,
    isSystem,
    title,
    timerValue,
    timerTitle,
    bookmarkLink,
    forceAvatar,
    timestamp,
    tokenCount,
    extra,
    type,
}, {
    updateReasoningUI,
    shouldShowTimestampModelIcon,
    updateBookmarkDisplay,
    insertTimestampModelIcon,
}) {
    const mes = $('#message_template .mes').clone();
    mes.attr({
        mesid: mesId,
        swipeid: swipeId,
        ch_name: characterName,
        is_user: isUser,
        is_system: !!isSystem,
        bookmark_link: bookmarkLink,
        force_avatar: !!forceAvatar,
        timestamp: timestamp,
        ...(type ? { type } : {}),
    });
    mes.find('.avatar img').attr('src', avatarImg);
    mes.find('.ch_name .name_text').text(characterName);
    mes.find('.mes_bias').html(bias);
    mes.find('.timestamp').text(timestamp).attr('title', `${extra?.api ? `${extra.api} - ` : ''}${extra?.model ?? ''}`);
    mes.find('.mesIDDisplay').text(`#${mesId}`);

    if (tokenCount) {
        mes.find('.tokenCounterDisplay').text(`${tokenCount}t`);
    }

    if (title) {
        mes.attr('title', title);
    }

    if (timerValue) {
        mes.find('.mes_timer').attr('title', timerTitle).text(timerValue);
    }

    if (bookmarkLink) {
        updateBookmarkDisplay(mes);
    }

    updateReasoningUI(mes);

    if (shouldShowTimestampModelIcon() && extra?.api) {
        insertTimestampModelIcon(mes, extra);
    }

    return mes;
}
