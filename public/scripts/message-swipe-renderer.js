function animateMessageHeight(messageRoot, messageBlock, messageRootHeight, messageBlockHeight, isAnimationScroll) {
    let newHeight = messageRootHeight - (messageBlockHeight - messageBlock[0].scrollHeight);
    if (newHeight < 103) {
        newHeight = 103;
    }

    messageRoot.animate({ height: `${newHeight}px` }, {
        duration: 0,
        queue: false,
        progress: function () {
            if (isAnimationScroll) {
                $('#chat').scrollTop($('#chat')[0].scrollHeight);
            }
        },
        complete: function () {
            messageRoot.css('height', 'auto');
            if (isAnimationScroll) {
                $('#chat').scrollTop($('#chat')[0].scrollHeight);
            }
        },
    });
}

function animateAvatarTrack(messageRoot, { initialX, resetX, swipeDuration, animationDuration, animationEasing }) {
    messageRoot.children('.avatar').transition({
        x: initialX,
        duration: animationDuration > 0 ? swipeDuration : 0,
        easing: animationEasing,
        queue: false,
        complete: function () {
            messageRoot.children('.avatar').transition({
                x: resetX,
                duration: 0,
                easing: animationEasing,
                queue: false,
                complete: function () {
                    messageRoot.children('.avatar').transition({
                        x: '0px',
                        duration: animationDuration > 0 ? swipeDuration : 0,
                        easing: animationEasing,
                        queue: false,
                    });
                },
            });
        },
    });
}

export function runSwipeLeftTransition(messageRoot, {
    swipeRange,
    swipeDuration,
    animationDuration,
    animationEasing,
    onRenderSwipeMessage,
    onFinishSwipe,
}) {
    const messageBlock = messageRoot.children('.mes_block').children('.mes_text');
    const messageRootHeight = messageRoot[0].scrollHeight;
    messageRoot.css('height', messageRootHeight);
    const messageBlockHeight = messageBlock[0].scrollHeight;

    messageRoot.children('.mes_block').transition({
        x: swipeRange,
        duration: animationDuration > 0 ? swipeDuration : 0,
        easing: animationEasing,
        queue: false,
        complete: async function () {
            const isAnimationScroll = ($('#chat').scrollTop() >= ($('#chat').prop('scrollHeight') - $('#chat').outerHeight()) - 10);
            await onRenderSwipeMessage();

            animateMessageHeight(messageRoot, messageBlock, messageRootHeight, messageBlockHeight, isAnimationScroll);

            messageRoot.children('.mes_block').transition({
                x: `-${swipeRange}`,
                duration: 0,
                easing: animationEasing,
                queue: false,
                complete: function () {
                    messageRoot.children('.mes_block').transition({
                        x: '0px',
                        duration: animationDuration > 0 ? swipeDuration : 0,
                        easing: animationEasing,
                        queue: false,
                        complete: async function () {
                            await onFinishSwipe();
                        },
                    });
                },
            });
        },
    });

    animateAvatarTrack(messageRoot, {
        initialX: swipeRange,
        resetX: `-${swipeRange}`,
        swipeDuration,
        animationDuration,
        animationEasing,
    });
}

export function runSwipeRightTransition(messageRoot, {
    swipeRange,
    swipeDuration,
    animationDuration,
    animationEasing,
    onRenderSwipeMessage,
    onFinishSwipe,
}) {
    const messageBlock = messageRoot.find('.mes_block .mes_text');
    const messageRootHeight = messageRoot[0].scrollHeight;
    const messageBlockHeight = messageBlock[0].scrollHeight;

    messageRoot.children('.mes_block').transition({
        x: `-${swipeRange}`,
        duration: animationDuration > 0 ? swipeDuration : 0,
        easing: animationEasing,
        queue: false,
        complete: async function () {
            const isAnimationScroll = ($('#chat').scrollTop() >= ($('#chat').prop('scrollHeight') - $('#chat').outerHeight()) - 10);
            await onRenderSwipeMessage();

            animateMessageHeight(messageRoot, messageBlock, messageRootHeight, messageBlockHeight, isAnimationScroll);

            messageRoot.children('.mes_block').transition({
                x: swipeRange,
                duration: 0,
                easing: animationEasing,
                queue: false,
                complete: function () {
                    messageRoot.children('.mes_block').transition({
                        x: '0px',
                        duration: animationDuration > 0 ? swipeDuration : 0,
                        easing: animationEasing,
                        queue: false,
                        complete: async function () {
                            await onFinishSwipe();
                        },
                    });
                },
            });
        },
    });

    animateAvatarTrack(messageRoot, {
        initialX: `-${swipeRange}`,
        resetX: swipeRange,
        swipeDuration,
        animationDuration,
        animationEasing,
    });
}
