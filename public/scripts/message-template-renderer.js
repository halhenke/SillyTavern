import { SVGInject } from '../lib.js';

export function applyMessageTemplateModelIcons(mes, extra) {
    let modelName;
    if (extra.api === 'openai' && extra.model?.toLowerCase().includes('claude')) {
        modelName = 'claude';
    } else if (extra.api === 'openai' && extra.model?.toLowerCase().includes('openai')) {
        modelName = 'openai';
    } else if (extra.api === 'openai' && (extra.model === null || extra.model?.toLowerCase().includes('/'))) {
        modelName = 'openrouter';
    } else {
        modelName = extra.api;
    }

    const insertOrReplaceSVG = (image, className, targetSelector, insertBefore) => {
        image.onload = async function () {
            const target = mes.find(targetSelector);
            const existingSVG = insertBefore ? target.prev(`.${className}`) : target.next(`.${className}`);
            if (existingSVG.length) {
                existingSVG.replaceWith(image);
            } else if (insertBefore) {
                target.before(image);
            } else {
                target.after(image);
            }
            await SVGInject(image);
        };
    };

    const createModelImage = (className, targetSelector, insertBefore) => {
        const image = new Image();
        image.classList.add('icon-svg', className);
        image.src = `/img/${modelName}.svg`;
        image.title = `${extra?.api ? `${extra.api} - ` : ''}${extra?.model ?? ''}`;
        insertOrReplaceSVG(image, className, targetSelector, insertBefore);
    };

    createModelImage('timestamp-icon', '.timestamp');
    createModelImage('thinking-icon', '.mes_reasoning_header_title', true);
}

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
        applyMessageTemplateModelIcons(mes, extra);
    }

    return mes;
}
