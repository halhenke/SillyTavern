export function createMessageTemplateViewModel({
    message,
    type = 'normal',
    forceId = null,
    chatLength,
    messageIndex,
    personaAvatarUrl,
    selectedCharacterAvatarUrl,
    hasSelectedCharacter,
    systemAvatar,
    defaultAvatar,
    timestamp,
    formatMessage,
    formatGenerationTimer,
}) {
    let messageText = message.mes;

    if (message?.extra?.display_text) {
        messageText = message.extra.display_text;
    }

    const isSystem = message.is_system;
    const title = message.title;
    let avatarImg = personaAvatarUrl;

    if (!message.is_user) {
        if (message.force_avatar) {
            avatarImg = message.force_avatar;
        } else if (!hasSelectedCharacter) {
            avatarImg = systemAvatar;
        } else {
            avatarImg = selectedCharacterAvatarUrl || defaultAvatar;
        }
    } else if (message.force_avatar) {
        avatarImg = message.force_avatar;
    }

    const sanitizerOverrides = message.uses_system_ui ? { MESSAGE_ALLOW_SYSTEM_UI: true } : {};
    messageText = formatMessage(
        messageText,
        message.name,
        isSystem,
        message.is_user,
        messageIndex,
        sanitizerOverrides,
        false,
    );

    const bias = formatMessage(message.extra?.bias ?? '', '', false, false, -1, {}, false);

    return {
        messageText,
        params: {
            mesId: forceId ?? chatLength - 1,
            swipeId: message.swipe_id ?? 0,
            characterName: message.name,
            isUser: message.is_user,
            avatarImg,
            bias,
            isSystem,
            title,
            bookmarkLink: message?.extra?.bookmark_link ?? '',
            forceAvatar: message.force_avatar,
            timestamp,
            extra: message.extra,
            tokenCount: message.extra?.token_count ?? 0,
            type: message.extra?.type ?? '',
            ...formatGenerationTimer(
                message.gen_started,
                message.gen_finished,
                message.extra?.token_count,
                message.extra?.reasoning_duration,
                message.extra?.time_to_first_token,
            ),
        },
    };
}
