import { eventSource, event_types } from './events.js';

/**
 * Applies legacy image/video/file attachment rendering to an existing message block.
 * The normalized media view model is separated so React can later reuse the shaping
 * logic without depending on this jQuery renderer.
 *
 * @param {{
 *   message: object,
 *   messageElement: JQuery<HTMLElement>,
 *   media: {
 *     image: null | {
 *       src: string,
 *       title: string,
 *       inline: boolean,
 *       swipeCount: number,
 *       swipeIndex: number,
 *       hasSwipes: boolean,
 *     },
 *     video: null | {
 *       src: string,
 *     },
 *     file: null | {
 *       name: string,
 *       size: number,
 *       sizeLabel: string,
 *     },
 *   },
 *   adjustScroll?: boolean,
 * }} params
 */
export function renderMessageMedia({ message, messageElement, media, adjustScroll = true }) {
    renderImageMedia({ message, messageElement, media, adjustScroll });
    renderVideoMedia({ messageElement, media, adjustScroll });
    renderFileMedia({ messageElement, media });
}

function renderImageMedia({ message, messageElement, media, adjustScroll }) {
    if (media.image) {
        const container = messageElement.find('.mes_img_container');
        const chatHeight = $('#chat').prop('scrollHeight');
        const image = messageElement.find('.mes_img');
        const text = messageElement.find('.mes_text');
        const doAdjustScroll = createScrollAdjuster({ adjustScroll, chatHeight });

        image.off('load').on('load', function () {
            image.removeAttr('alt');
            image.removeClass('error');
            doAdjustScroll();
        });
        image.off('error').on('error', function () {
            image.attr('alt', '');
            image.addClass('error');
            doAdjustScroll();
        });
        image.attr('src', media.image.src);
        image.attr('title', media.image.title);
        container.addClass('img_extra');
        image.toggleClass('img_inline', media.image.inline);
        text.toggleClass('displayNone', !media.image.inline);

        if (media.image.hasSwipes) {
            container.addClass('img_swipes');
            container.find('.mes_img_swipe_counter').text(`${media.image.swipeIndex}/${media.image.swipeCount}`);

            container.find('.mes_img_swipe_left').off('click').on('click', function () {
                eventSource.emit(event_types.IMAGE_SWIPED, { message, element: messageElement, direction: 'left' });
            });

            container.find('.mes_img_swipe_right').off('click').on('click', function () {
                eventSource.emit(event_types.IMAGE_SWIPED, { message, element: messageElement, direction: 'right' });
            });
        }
    } else {
        const container = messageElement.find('.mes_img_container');
        container.removeClass('img_extra img_swipes');
        messageElement.find('.mes_text').removeClass('displayNone');
    }
}

function renderVideoMedia({ messageElement, media, adjustScroll }) {
    if (media.video) {
        const container = $('#message_video_template .mes_video_container').clone();
        messageElement.find('.mes_video_container').remove();
        messageElement.find('.mes_block').append(container);
        const chatHeight = $('#chat').prop('scrollHeight');
        const video = container.find('.mes_video');
        const doAdjustScroll = createScrollAdjuster({ adjustScroll, chatHeight });

        video.off('loadedmetadata').on('loadedmetadata', function () {
            doAdjustScroll();
        });

        video.attr('src', media.video.src);
    } else {
        messageElement.find('.mes_video_container').remove();
    }
}

function renderFileMedia({ messageElement, media }) {
    if (media.file) {
        messageElement.find('.mes_file_container').remove();
        const messageId = messageElement.attr('mesid');
        const template = $('#message_file_template .mes_file_container').clone();
        template.find('.mes_file_name').text(media.file.name);
        template.find('.mes_file_size').text(media.file.sizeLabel);
        template.find('.mes_file_download').attr('mesid', messageId);
        template.find('.mes_file_delete').attr('mesid', messageId);
        messageElement.find('.mes_block').append(template);
    } else {
        messageElement.find('.mes_file_container').remove();
    }
}

function createScrollAdjuster({ adjustScroll, chatHeight }) {
    return () => {
        if (!adjustScroll) {
            return;
        }

        const scrollPosition = $('#chat').scrollTop();
        const newChatHeight = $('#chat').prop('scrollHeight');
        const diff = newChatHeight - chatHeight;
        $('#chat').scrollTop(scrollPosition + diff);
    };
}
