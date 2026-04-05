export function initMessageAvatarZoomBindings({
    getCharacters,
    getPowerUser,
    getUserAvatar,
    loadMovingUIState,
    dragElement,
    isDataUrl,
    getAnimationDuration,
}) {
    $(document).on('click', '.mes .avatar', function () {
        const powerUser = getPowerUser();
        const characters = getCharacters();
        const animationDuration = getAnimationDuration();
        const messageElement = $(this).closest('.mes');
        const thumbURL = $(this).children('img').attr('src');
        const charsPath = '/characters/';
        const targetAvatarImg = thumbURL.substring(thumbURL.lastIndexOf('=') + 1);
        const charname = targetAvatarImg.replace('.png', '');
        const isValidCharacter = characters.some(x => x.avatar === decodeURIComponent(targetAvatarImg));

        if (!powerUser.movingUI) {
            $('.zoomed_avatar').each(function () {
                const currentForChar = $(this).attr('forChar');
                if (currentForChar !== charname && typeof currentForChar !== 'undefined') {
                    console.debug(`Removing zoomed avatar for character: ${currentForChar}`);
                    $(this).remove();
                }
            });
        }

        const avatarSrc = (isDataUrl(thumbURL) || /^\/?img\/(?:.+)/.test(thumbURL)) ? thumbURL : charsPath + targetAvatarImg;
        if ($(`.zoomed_avatar[forChar="${charname}"]`).length) {
            console.debug('removing container as it already existed');
            $(`.zoomed_avatar[forChar="${charname}"]`).fadeOut(animationDuration, () => {
                $(`.zoomed_avatar[forChar="${charname}"]`).remove();
            });
        } else {
            console.debug('making new container from template');
            const template = $('#zoomed_avatar_template').html();
            const newElement = $(template);
            newElement.attr('forChar', charname);
            newElement.attr('id', `zoomFor_${charname}`);
            newElement.addClass('draggable');
            newElement.find('.drag-grabber').attr('id', `zoomFor_${charname}header`);

            $('body').append(newElement);
            newElement.fadeIn(animationDuration);
            const zoomedAvatarImgElement = $(`.zoomed_avatar[forChar="${charname}"] img`);
            if (messageElement.attr('is_user') == 'true' || (messageElement.attr('is_system') == 'true' && !isValidCharacter)) {
                const isValidPersona = decodeURIComponent(targetAvatarImg) in powerUser.personas;
                if (isValidPersona) {
                    const personaSrc = getUserAvatar(targetAvatarImg);
                    zoomedAvatarImgElement.attr('src', personaSrc);
                    zoomedAvatarImgElement.attr('data-izoomify-url', personaSrc);
                } else {
                    zoomedAvatarImgElement.attr('src', thumbURL);
                    zoomedAvatarImgElement.attr('data-izoomify-url', thumbURL);
                }
            } else if (messageElement.attr('is_user') == 'false') {
                zoomedAvatarImgElement.attr('src', avatarSrc);
                zoomedAvatarImgElement.attr('data-izoomify-url', avatarSrc);
            }
            loadMovingUIState();
            $(`.zoomed_avatar[forChar="${charname}"]`).css('display', 'flex');
            dragElement(newElement);

            if (powerUser.zoomed_avatar_magnification) {
                $('.zoomed_avatar_container').izoomify();
            }

            $('.zoomed_avatar, .zoomed_avatar .dragClose').on('click touchend', (e) => {
                if (e.target.closest('.dragClose')) {
                    $(`.zoomed_avatar[forChar="${charname}"]`).fadeOut(animationDuration, () => {
                        $(`.zoomed_avatar[forChar="${charname}"]`).remove();
                    });
                }
            });

            zoomedAvatarImgElement.on('dragstart', (e) => {
                console.log('saw drag on avatar!');
                e.preventDefault();
                return false;
            });
        }
    });
}
