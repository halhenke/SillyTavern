/**
 * Builds a normalized media view model for a chat message.
 * This keeps message-media shaping reusable across legacy jQuery rendering
 * and future React message components.
 *
 * @param {object} message
 * @param {{ formatFileSize?: (size: number) => string }} [options]
 * @returns {{
 *   image: null | {
 *     src: string,
 *     title: string,
 *     inline: boolean,
 *     swipeCount: number,
 *     swipeIndex: number,
 *     hasSwipes: boolean,
 *   },
 *   video: null | {
 *     src: string,
 *   },
 *   file: null | {
 *     name: string,
 *     size: number,
 *     sizeLabel: string,
 *   },
 * }}
 */
export function createMessageMediaViewModel(message, { formatFileSize = defaultFormatFileSize } = {}) {
    const extra = message?.extra ?? {};
    const imageSwipes = Array.isArray(extra.image_swipes) ? extra.image_swipes : [];
    const currentImage = imageSwipes.indexOf(extra.image) + 1;
    const fileSize = Number(extra.file?.size ?? 0);

    return {
        image: extra.image
            ? {
                src: extra.image,
                title: extra.title || message?.title || '',
                inline: Boolean(extra.inline_image),
                swipeCount: imageSwipes.length,
                swipeIndex: currentImage > 0 ? currentImage : 0,
                hasSwipes: imageSwipes.length > 0,
            }
            : null,
        video: extra.video
            ? {
                src: extra.video,
            }
            : null,
        file: extra.file
            ? {
                name: String(extra.file.name ?? ''),
                size: fileSize,
                sizeLabel: formatFileSize(fileSize),
            }
            : null,
    };
}

function defaultFormatFileSize(size) {
    return `${Number(size || 0)} B`;
}
